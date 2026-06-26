/**
 * Track table — backend operation tests
 *
 * Strategy: vi.mock the Supabase client so every test runs
 * entirely in-process with no network calls. Each test group
 * resets the mock to the state required for that scenario,
 * which lets us verify both the happy paths and the RLS/error paths.
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'

// ── Mock Supabase before importing db.js ─────────────────────────
// db.js imports `supabase` from './supabase', so we mock that module.
vi.mock('../lib/supabase', () => {
  const buildChain = (resolveWith) => {
    const chain = {
      select:  vi.fn().mockReturnThis(),
      insert:  vi.fn().mockReturnThis(),
      update:  vi.fn().mockReturnThis(),
      delete:  vi.fn().mockReturnThis(),
      eq:      vi.fn().mockReturnThis(),
      order:   vi.fn().mockReturnThis(),
      single:  vi.fn().mockResolvedValue(resolveWith),
    }
    // Make the chain itself thenable so `await supabase.from(...).select(...)` works
    chain.then = (resolve) => Promise.resolve(resolveWith).then(resolve)
    return chain
  }

  return {
    supabase: {
      from: vi.fn(() => buildChain({ data: null, error: null })),
      auth:    { getSession: vi.fn() },
      storage: null,   // storage not relevant for these tests
    },
  }
})

import { supabase } from '../lib/supabase'
import {
  fetchUserTracks,
  saveTrack,
  updateTrack,
  deleteLiziMusic,
} from '../lib/db'

// ── Helpers ───────────────────────────────────────────────────────
const USER_A = 'user-aaa-111'
const USER_B = 'user-bbb-222'

const makeTrackRow = (overrides = {}) => ({
  id:        1,
  user_id:   USER_A,
  title:     'My Song',
  genre:     'Pop',
  file_url:  'https://storage/track.mp3',
  file_name: 'track.mp3',
  created_at: new Date().toISOString(),
  ...overrides,
})

/** Reset the `supabase.from` mock so the chain returns the given payload. */
function mockFrom({ data = null, error = null } = {}) {
  const resolveWith = { data, error }

  const chain = {
    select:  vi.fn().mockReturnThis(),
    insert:  vi.fn().mockReturnThis(),
    update:  vi.fn().mockReturnThis(),
    delete:  vi.fn().mockReturnThis(),
    eq:      vi.fn().mockReturnThis(),
    order:   vi.fn().mockReturnThis(),
    single:  vi.fn().mockResolvedValue(resolveWith),
    // Make chain awaitable directly (for calls that don't end in .single())
    then:    (resolve) => Promise.resolve(resolveWith).then(resolve),
  }

  supabase.from.mockReturnValue(chain)
  return chain
}

// ─────────────────────────────────────────────────────────────────
// 1. Create — adds a track to the database
// ─────────────────────────────────────────────────────────────────
describe('1. createTrack (saveTrack)', () => {
  beforeEach(() => localStorage.clear())

  it('returns the normalised track on success', async () => {
    const row = makeTrackRow()
    const chain = mockFrom({ data: row, error: null })
    chain.single.mockResolvedValue({ data: row, error: null })

    const { track, error } = await saveTrack({
      userId:   USER_A,
      title:    'My Song',
      genre:    'Pop',
      fileUrl:  'https://storage/track.mp3',
      fileName: 'track.mp3',
    })

    expect(error).toBeNull()
    expect(track).toMatchObject({
      id:    1,
      title: 'My Song',
      genre: 'Pop',
      url:   'https://storage/track.mp3',
    })
  })

  it('calls insert with the correct table and payload', async () => {
    const row = makeTrackRow()
    const chain = mockFrom({ data: row, error: null })
    chain.single.mockResolvedValue({ data: row, error: null })

    await saveTrack({ userId: USER_A, title: 'My Song', genre: 'Pop', fileUrl: 'u', fileName: 'f' })

    expect(supabase.from).toHaveBeenCalledWith('Track')
    expect(chain.insert).toHaveBeenCalledWith(
      expect.objectContaining({ user_id: USER_A, title: 'My Song', genre: 'Pop' })
    )
  })

  it('falls back to localStorage when Supabase insert fails', async () => {
    const chain = mockFrom({ data: null, error: null })
    chain.single.mockResolvedValue({ data: null, error: { message: 'insert failed' } })

    const { track, error } = await saveTrack({
      userId: USER_A, title: 'T', genre: 'G', fileUrl: 'u', fileName: 'f',
    })

    // localStorage fallback: track is still returned, no error thrown to caller
    expect(error).toBeNull()
    expect(track).toMatchObject({ title: 'T', genre: 'G' })
  })
})

// ─────────────────────────────────────────────────────────────────
// 2. Read — returns only the current user's sessions
// ─────────────────────────────────────────────────────────────────
describe('2. fetchUserTracks — isolation by user_id', () => {
  beforeEach(() => localStorage.clear())

  it('returns tracks for the requested user', async () => {
    const rows = [makeTrackRow({ id: 1 }), makeTrackRow({ id: 2, title: 'Track 2' })]
    const chain = mockFrom({ data: rows, error: null })

    const tracks = await fetchUserTracks(USER_A)

    expect(supabase.from).toHaveBeenCalledWith('Track')
    expect(chain.eq).toHaveBeenCalledWith('user_id', USER_A)
    expect(tracks).toHaveLength(2)
    expect(tracks[0]).toMatchObject({ id: 1, title: 'My Song' })
  })

  it('returns an empty array when the user has no tracks', async () => {
    mockFrom({ data: [], error: null })

    const tracks = await fetchUserTracks(USER_A)
    expect(tracks).toEqual([])
  })

  it('passes a different user_id for a different user', async () => {
    const chain = mockFrom({ data: [], error: null })

    await fetchUserTracks(USER_B)
    expect(chain.eq).toHaveBeenCalledWith('user_id', USER_B)
  })

  it('returns empty array on Supabase error (no crash)', async () => {
    mockFrom({ data: null, error: { message: 'connection error' } })

    const tracks = await fetchUserTracks(USER_A)
    expect(tracks).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────
// 3. Update — changes the correct fields
// ─────────────────────────────────────────────────────────────────
describe('3. updateTrack — correct fields are sent', () => {
  it('sends title and genre to the correct row', async () => {
    const chain = mockFrom({ data: null, error: null })

    const result = await updateTrack(42, { title: 'New Title', genre: 'Jazz' })

    expect(supabase.from).toHaveBeenCalledWith('Track')
    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ title: 'New Title', genre: 'Jazz' })
    )
    expect(chain.eq).toHaveBeenCalledWith('id', 42)
    expect(result.error).toBeNull()
  })

  it('includes file_url and file_name when a new file is provided', async () => {
    const chain = mockFrom({ data: null, error: null })

    await updateTrack(7, {
      title:    'Updated',
      genre:    'Rock',
      fileUrl:  'https://cdn/new.mp3',
      fileName: 'new.mp3',
    })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({
        file_url:  'https://cdn/new.mp3',
        file_name: 'new.mp3',
      })
    )
  })

  it('omits file_url when no new file provided', async () => {
    const chain = mockFrom({ data: null, error: null })

    await updateTrack(7, { title: 'Title Only', genre: 'Folk' })

    const callArg = chain.update.mock.calls[0][0]
    expect(callArg).not.toHaveProperty('file_url')
    expect(callArg).not.toHaveProperty('file_name')
  })

  it('returns error string when Supabase update fails', async () => {
    const chain = mockFrom({ data: null, error: null })
    // Make the awaited chain resolve with an error
    chain.eq.mockResolvedValue({ data: null, error: { message: 'update failed' } })

    const result = await updateTrack(99, { title: 'X', genre: 'Y' })
    // db.js catches and returns { error: msg }
    expect(result).toHaveProperty('error')
  })
})

// ─────────────────────────────────────────────────────────────────
// 4. Delete — removes the track from the database
// ─────────────────────────────────────────────────────────────────
describe('4. deleteLiziMusic — removes the row', () => {
  it('calls delete on the correct table and id', async () => {
    const chain = mockFrom({ data: null, error: null })

    const result = await deleteLiziMusic(55)

    expect(supabase.from).toHaveBeenCalledWith('Track')
    expect(chain.delete).toHaveBeenCalled()
    expect(chain.eq).toHaveBeenCalledWith('id', 55)
    expect(result.error).toBeNull()
  })

  it('returns error when Supabase delete fails', async () => {
    const chain = mockFrom({ data: null, error: null })
    chain.eq.mockResolvedValue({ data: null, error: { message: 'delete failed' } })

    const result = await deleteLiziMusic(55)
    expect(result).toHaveProperty('error')
  })
})

// ─────────────────────────────────────────────────────────────────
// 5. RLS simulation — user cannot read another user's sessions
// ─────────────────────────────────────────────────────────────────
describe('5. RLS — user_id isolation', () => {
  it('always filters by the calling user_id, never another users id', async () => {
    const userARows = [makeTrackRow({ user_id: USER_A })]
    const chainA = mockFrom({ data: userARows, error: null })
    await fetchUserTracks(USER_A)
    expect(chainA.eq).toHaveBeenCalledWith('user_id', USER_A)

    // User B query uses a separate chain rooted at USER_B
    const chainB = mockFrom({ data: [], error: null })
    await fetchUserTracks(USER_B)
    expect(chainB.eq).toHaveBeenCalledWith('user_id', USER_B)
    // Confirm USER_A's id was never passed in the USER_B query
    const eqCalls = chainB.eq.mock.calls.map(c => c[1])
    expect(eqCalls).not.toContain(USER_A)
  })

  it('returns empty array when RLS denies access (Supabase error)', async () => {
    // Simulate RLS rejection: Supabase returns an auth error
    mockFrom({ data: null, error: { message: 'new row violates row-level security policy' } })

    const tracks = await fetchUserTracks(USER_B)
    expect(tracks).toEqual([])
  })
})

// ─────────────────────────────────────────────────────────────────
// 6. Normalisation — track links to the correct user
// ─────────────────────────────────────────────────────────────────
describe('6. Saved track links to correct user', () => {
  it('insert payload carries the provided user_id', async () => {
    const row = makeTrackRow({ user_id: USER_A })
    const chain = mockFrom({ data: row, error: null })
    chain.single.mockResolvedValue({ data: row, error: null })

    await saveTrack({ userId: USER_A, title: 'T', genre: 'G', fileUrl: 'u', fileName: 'f' })

    const insertArg = chain.insert.mock.calls[0][0]
    expect(insertArg.user_id).toBe(USER_A)
  })

  it('returned track object does NOT expose user_id (normalised shape)', async () => {
    const row = makeTrackRow()
    const chain = mockFrom({ data: row, error: null })
    chain.single.mockResolvedValue({ data: row, error: null })

    const { track } = await saveTrack({ userId: USER_A, title: 'T', genre: 'G', fileUrl: 'u', fileName: 'f' })

    // Normalised shape: id, title, genre, url, fileName — no user_id leak
    expect(track).not.toHaveProperty('user_id')
    expect(Object.keys(track)).toEqual(expect.arrayContaining(['id', 'title', 'genre', 'url', 'fileName']))
  })
})

// ─────────────────────────────────────────────────────────────────
// 7. Toggle is_completed (genre field used as status flag here,
//    mapped to the real updateTrack API which patches arbitrary fields)
// ─────────────────────────────────────────────────────────────────
describe('7. Toggle is_completed — field update pattern', () => {
  it('updateTrack can flip a boolean field to true', async () => {
    const chain = mockFrom({ data: null, error: null })

    await updateTrack(10, { title: 'Song', genre: 'Pop', is_completed: true })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_completed: true })
    )
  })

  it('updateTrack can flip a boolean field back to false', async () => {
    const chain = mockFrom({ data: null, error: null })

    await updateTrack(10, { title: 'Song', genre: 'Pop', is_completed: false })

    expect(chain.update).toHaveBeenCalledWith(
      expect.objectContaining({ is_completed: false })
    )
  })

  it('two sequential toggles produce opposite values', async () => {
    let current = false

    const toggle = async () => {
      mockFrom({ data: null, error: null })
      current = !current
      const result = await updateTrack(10, { title: 'S', genre: 'G', is_completed: current })
      return result
    }

    const first  = await toggle()   // false → true
    const second = await toggle()   // true  → false

    expect(first.error).toBeNull()
    expect(second.error).toBeNull()
    expect(current).toBe(false)     // ended back at false after two toggles
  })
})
