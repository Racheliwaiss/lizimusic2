import { supabase, supabaseStorageKey } from './supabase';
import fallbackArtists from '../data/artists';

/*
  The Google OAuth session is stored in 'lizi_auth_session' to prevent
  supabase-js from calling /auth/v1/user (which 401s with a stale anon key).
  But supabase.storage reads the auth token from supabase-js's own storage
  key.  Before any authenticated Storage call we copy the access_token across
  so the upload/delete request is properly authenticated.
*/
function injectLocalSession() {
  if (!supabaseStorageKey) return;
  try {
    const raw = localStorage.getItem('lizi_auth_session');
    if (!raw) return;
    const { session } = JSON.parse(raw);
    if (session?.access_token) {
      localStorage.setItem(supabaseStorageKey, JSON.stringify(session));
    }
  } catch {}
}

/* ── Local track store (fallback when Supabase is unavailable) ── */
const LOCAL_TRACKS_KEY = 'lizi_local_tracks';

function getLocalTracks(userId) {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_TRACKS_KEY) || '{}')[userId] || [];
  } catch { return []; }
}

function upsertLocalTrack(userId, track) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_TRACKS_KEY) || '{}');
    const list = all[userId] || [];
    const idx  = list.findIndex(t => String(t.id) === String(track.id));
    if (idx !== -1) list[idx] = track; else list.unshift(track);
    all[userId] = list;
    localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(all));
  } catch {}
}

function removeLocalTrack(userId, trackId) {
  try {
    const all = JSON.parse(localStorage.getItem(LOCAL_TRACKS_KEY) || '{}');
    if (all[userId]) {
      all[userId] = all[userId].filter(t => String(t.id) !== String(trackId));
      localStorage.setItem(LOCAL_TRACKS_KEY, JSON.stringify(all));
    }
  } catch {}
}

const fallbackProjects = [
  { id: 1,  title: 'Summer Vibes EP',     genre: 'Electronic', instruments: 'Synth, Drums',                ageRange: '18-35', description: 'Upbeat summer electronic project',    members: 3,  createdBy: null },
  { id: 2,  title: 'Jazz Sessions',        genre: 'Jazz',       instruments: 'Piano, Bass, Drums',          ageRange: '25-50', description: 'Sophisticated jazz collaboration',     members: 2,  createdBy: null },
  { id: 3,  title: 'Hip-Hop Beats',        genre: 'Hip-Hop',    instruments: 'Beats, Rap, Production',      ageRange: '18-40', description: 'Urban hip-hop beat crafting',          members: 4,  createdBy: null },
  { id: 4,  title: 'Indie Folk Nights',    genre: 'Folk',       instruments: 'Guitar, Vocals, Percussion',  ageRange: '20-45', description: 'Acoustic folk storytelling',           members: 2,  createdBy: null },
  { id: 5,  title: 'Pop Collaboration',    genre: 'Pop',        instruments: 'Vocals, Keys, Production',    ageRange: '16-35', description: 'Chart-ready pop tracks',               members: 5,  createdBy: null },
  { id: 6,  title: 'Rock Anthem',          genre: 'Rock',       instruments: 'Guitar, Bass, Drums, Vocals', ageRange: '18-50', description: 'High-energy rock production',          members: 4,  createdBy: null },
  { id: 7,  title: 'R&B Vibes',            genre: 'R&B',        instruments: 'Vocals, Keys, Production',    ageRange: '20-40', description: 'Smooth R&B collaboration',             members: 3,  createdBy: null },
  { id: 8,  title: 'Classical Orchestra',  genre: 'Classical',  instruments: 'Strings, Woodwinds, Brass',   ageRange: '25-60', description: 'Symphony composition project',         members: 8,  createdBy: null },
  { id: 9,  title: 'World Fusion Project', genre: 'World',      instruments: 'Oud, Violin, Percussion',     ageRange: '20-55', description: 'Middle Eastern meets contemporary',    members: 3,  createdBy: null },
  { id: 10, title: 'Reggae Collective',    genre: 'Reggae',     instruments: 'Guitar, Bass, Vocals, Drums', ageRange: '22-45', description: 'Positive vibes reggae session',         members: 4,  createdBy: null },
];

// Normalize a DB artist row → app shape
const normalizeArtist = (row) => ({
  id:          row.id,
  userId:      row.user_id  || null,
  name:        row.name,
  genre:       row.genre,
  instruments: row.instruments || '',
  style:       row.style || '',
  bio:         row.bio   || '',
  ageRange:    row.age_range || '',
  followers:   row.followers || 0,
  avatar:      row.avatar || '🎤',
  location:    row.location || '',
  phone:       row.phone || '',
  email:       row.email || '',
});

// Normalize a DB project row → app shape
const normalizeProject = (row) => ({
  id:          row.id,
  title:       row.title,
  genre:       row.genre || '',
  instruments: row.instruments || '',
  ageRange:    row.age_range || '',
  description: row.description || '',
  members:     row.members || 1,
  createdBy:   row.created_by || null,
  location:    row.location || '',
});

export async function fetchArtists() {
  try {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .order('followers', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data.map(normalizeArtist);
  } catch {
    // fall through
  }
  return fallbackArtists;
}

export async function fetchUserProjects(userId) {
  try {
    const { data, error } = await supabase
      .from(COLLAB_TABLE)
      .select('*')
      .eq('created_by', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(normalizeProject);
  } catch {
    return [];
  }
}

const LOCAL_PROJECTS_KEY = 'lizi_local_projects';

function getLocalProjects() {
  try { return JSON.parse(localStorage.getItem(LOCAL_PROJECTS_KEY) || '[]'); }
  catch { return []; }
}
function saveLocalProjects(list) {
  try { localStorage.setItem(LOCAL_PROJECTS_KEY, JSON.stringify(list)); } catch {}
}

export async function fetchProjectById(projectId) {
  try {
    const { data, error } = await supabase
      .from(COLLAB_TABLE)
      .select('*')
      .eq('id', projectId)
      .single();
    if (!error && data) return normalizeProject(data);
  } catch { /* fall through */ }
  // Check localStorage
  const local = getLocalProjects();
  return local.find(p => String(p.id) === String(projectId)) || null;
}

export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from(COLLAB_TABLE)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) { console.error('fetchProjects error:', error); throw error; }
    if (data && data.length > 0) {
      // Local-only projects not yet in Supabase come first, then real projects, then seed filler
      const local       = getLocalProjects();
      const supabaseIds = new Set(data.map(r => String(r.id)));
      const onlyLocal   = local.filter(p => !supabaseIds.has(String(p.id)));
      const realProjects = data.map(normalizeProject);
      const coveredIds  = new Set([...data.map(r => String(r.id)), ...local.map(p => String(p.id))]);
      const seedFiller  = fallbackProjects.filter(p => !coveredIds.has(String(p.id)));
      return [...onlyLocal, ...realProjects, ...seedFiller];
    }
  } catch {
    // fall through to local + fallback
  }

  // Supabase unavailable or empty — merge local with seed
  const local = getLocalProjects();
  const localIds = new Set(local.map(p => String(p.id)));
  const seed = fallbackProjects.filter(p => !localIds.has(String(p.id)));
  return [...local, ...seed];
}

export async function createProject(fields, userId) {
  const newProject = {
    id:          Date.now(),          // temporary; replaced by Supabase id on success
    title:       fields.title,
    genre:       fields.genre,
    instruments: fields.instruments,
    ageRange:    fields.ageRange || '',
    description: fields.description || 'A fresh collaboration idea waiting for artists.',
    location:    fields.location || '',
    members:     1,
    createdBy:   userId || null,
  };

  // ── Try Supabase first ────────────────────────────────────
  try {
    const { data, error } = await supabase
      .from(COLLAB_TABLE)
      .insert({
        title:       newProject.title,
        genre:       newProject.genre,
        instruments: newProject.instruments,
        age_range:   newProject.ageRange,
        description: newProject.description,
        location:    newProject.location,
        created_by:  userId || null,
      })
      .select()
      .single();

    if (error) { console.error('createProject error:', error); throw error; }
    return { project: normalizeProject(data), error: null };
  } catch {
    // Supabase failed — persist locally so it survives page refresh
  }

  // ── Local fallback ────────────────────────────────────────
  const local = getLocalProjects();
  local.unshift(newProject);
  saveLocalProjects(local);
  return { project: newProject, error: null };
}

// ── project_members localStorage helpers ─────────────────────
const LOCAL_MEMBERS_KEY = 'lizi_project_members';

function getAllLocalMembers() {
  try { return JSON.parse(localStorage.getItem(LOCAL_MEMBERS_KEY) || '{}'); } catch { return {}; }
}
function saveAllLocalMembers(obj) {
  try { localStorage.setItem(LOCAL_MEMBERS_KEY, JSON.stringify(obj)); } catch {}
}
function getLocalMembers(projectId) {
  return getAllLocalMembers()[String(projectId)] || [];
}
function addLocalMember(projectId, member) {
  const all = getAllLocalMembers();
  const key = String(projectId);
  const list = all[key] || [];
  if (!list.find(m => m.userId === member.userId)) list.push(member);
  all[key] = list;
  saveAllLocalMembers(all);
}

export async function joinProject(projectId, userId, profile = {}) {
  // Record the member so we can show them in the detail view
  const member = {
    userId:      userId || 'guest',
    name:        profile.name        || 'Anonymous Artist',
    instruments: profile.instruments || '',
    genre:       profile.genre       || '',
    location:    profile.location    || '',
    avatar:      profile.avatar      || '🎤',
    bio:         profile.bio         || '',
    style:       profile.style       || '',
    lookingFor:  profile.lookingFor  || '',
    phone:       profile.phone       || '',
    email:       profile.email       || '',
    facebook:    profile.facebook    || '',
    joinedAt:    new Date().toISOString(),
  };
  addLocalMember(projectId, member);

  // Try Supabase project_members table
  if (userId) {
    try {
      await supabase
        .from('project_members')
        .upsert({ project_id: projectId, user_id: userId }, { onConflict: 'project_id,user_id' });
    } catch { /* table may not exist yet */ }
  }

  // Increment members count
  try {
    const { error } = await supabase.rpc('increment_project_members', { project_id: projectId });
    if (!error) return { error: null };
  } catch { /* fall through */ }

  try {
    const { data: current, error: fetchErr } = await supabase
      .from(COLLAB_TABLE).select('members').eq('id', projectId).single();
    if (!fetchErr) {
      await supabase
        .from(COLLAB_TABLE).update({ members: (current.members || 1) + 1 }).eq('id', projectId);
    }
  } catch { /* local fallback — count already updated in UI */ }

  // Also increment in localStorage for local projects
  const local = getLocalProjects();
  const idx = local.findIndex(p => String(p.id) === String(projectId));
  if (idx !== -1) { local[idx].members = (local[idx].members || 1) + 1; saveLocalProjects(local); }

  return { error: null };
}

export async function fetchProjectMembers(projectId) {
  // Try Supabase: project_members joined with profiles
  try {
    const { data, error } = await supabase
      .from('project_members')
      .select(`user_id, joined_at, profiles:user_id (name, instruments, genre, style, location, avatar, bio, phone, email, facebook, lookingFor)`)
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        userId:      row.user_id,
        joinedAt:    row.joined_at,
        name:        row.profiles?.name        || 'Anonymous Artist',
        instruments: row.profiles?.instruments || '',
        genre:       row.profiles?.genre       || '',
        style:       row.profiles?.style       || '',
        location:    row.profiles?.location    || '',
        avatar:      row.profiles?.avatar      || '🎤',
        bio:         row.profiles?.bio         || '',
        lookingFor:  row.profiles?.lookingFor  || '',
        phone:       row.profiles?.phone       || '',
        email:       row.profiles?.email       || '',
        facebook:    row.profiles?.facebook    || '',
      }));
    }
  } catch { /* fall through */ }

  // Fallback: localStorage members
  return getLocalMembers(projectId);
}

export async function updateProject(projectId, fields) {
  // Update in localStorage if it's a local project
  const local = getLocalProjects();
  const localIdx = local.findIndex(p => String(p.id) === String(projectId));
  if (localIdx !== -1) {
    local[localIdx] = { ...local[localIdx], ...fields };
    saveLocalProjects(local);
  }

  try {
    const { error } = await supabase
      .from(COLLAB_TABLE)
      .update({
        title:       fields.title,
        genre:       fields.genre,
        instruments: fields.instruments,
        age_range:   fields.ageRange,
        description: fields.description,
        location:    fields.location || '',
      })
      .eq('id', projectId);

    if (error) throw error;
  } catch {
    // Supabase failed — localStorage was already updated above
  }
  return { error: null };
}

export async function deleteProject(projectId) {
  // Remove from localStorage if it's a local project
  const local = getLocalProjects();
  saveLocalProjects(local.filter(p => String(p.id) !== String(projectId)));

  try {
    const { error } = await supabase
      .from(COLLAB_TABLE)
      .delete()
      .eq('id', projectId);

    if (error) throw error;
  } catch {
    // Supabase failed — localStorage was already cleaned up above
  }
  return { error: null };
}

// ── Track file upload ─────────────────────────────────────────

const ALLOWED_AUDIO_TYPES = [
  'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/ogg',
  'audio/aac', 'audio/flac', 'audio/x-flac', 'audio/mp4',
  'audio/webm', 'audio/x-wav',
];
const MAX_TRACK_MB = 50;

export async function uploadTrackFile(userId, file) {
  if (!file.type.startsWith('audio/') && !ALLOWED_AUDIO_TYPES.includes(file.type)) {
    return { url: null, error: 'Only audio files (MP3, WAV, OGG, AAC, FLAC) are supported.' };
  }
  if (file.size > MAX_TRACK_MB * 1024 * 1024) {
    return { url: null, error: `File must be under ${MAX_TRACK_MB} MB.` };
  }

  if (!supabase.storage) {
    return { url: null, error: 'Storage is not available in offline mode.' };
  }

  /*
    Inject the OAuth access_token into supabase-js's storage key so the
    upload request carries Authorization: Bearer <token>.  Without this the
    request is anonymous and Supabase Storage RLS blocks it.
  */
  injectLocalSession();

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path     = `${userId}/${Date.now()}_${safeName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('tracks')
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) {
      console.error('[LIZI] Storage upload error:', uploadError);
      // Normalise — supabase-js versions differ on whether it's .status (number)
      // or .statusCode (string), and on whether the message is in .message or .error
      const sc  = uploadError.statusCode ?? uploadError.status;
      const msg = (uploadError.message || uploadError.error || '').toLowerCase();
      if (sc == 403 || msg.includes('rls') || msg.includes('policy') || msg.includes('violates') || msg.includes('unauthorized')) {
        throw new Error('Permission denied. Make sure the "tracks" bucket exists and has an INSERT policy for authenticated users.');
      }
      if (sc == 401 || msg.includes('invalid') || msg.includes('api key')) {
        throw new Error('Invalid Supabase API key. Update VITE_SUPABASE_ANON_KEY in your environment and redeploy.');
      }
      throw new Error(uploadError.message || uploadError.error || 'Upload failed. Please try again.');
    }

    const { data } = supabase.storage.from('tracks').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    const msg = err?.message || err?.error_description || 'Upload failed.';
    console.error('[LIZI] uploadTrackFile failed:', msg);
    return { url: null, error: msg };
  }
}

// ── Avatar upload ─────────────────────────────────────────────

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_AVATAR_MB = 5;

// Resize + compress image to a base64 JPEG using canvas.
// This runs entirely in the browser — no Storage bucket needed.
function compressToBase64(file, maxPx = 150, quality = 0.8) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const scale = Math.min(1, maxPx / Math.max(img.width, img.height));
      const canvas = document.createElement('canvas');
      canvas.width  = Math.round(img.width  * scale);
      canvas.height = Math.round(img.height * scale);
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('Could not read the image file.'));
    };
    img.src = objectUrl;
  });
}

export async function uploadAvatar(userId, file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: 'Only JPG, PNG, WEBP, or GIF images are supported.' };
  }
  if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
    return { url: null, error: `Image must be under ${MAX_AVATAR_MB} MB.` };
  }

  // ── 1. Try Supabase Storage (works when the bucket is set up) ──
  if (supabase.storage) {
    const BUCKET = 'avatars';
    const ext    = file.name.split('.').pop().toLowerCase() || 'jpg';
    const path   = `${userId}/avatar.${ext}`;
    try {
      await supabase.storage.createBucket(BUCKET, { public: true }).catch(() => {});
      const { error: uploadError } = await supabase.storage
        .from(BUCKET)
        .upload(path, file, { upsert: true, contentType: file.type });
      if (!uploadError) {
        const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
        return { url: `${data.publicUrl}?t=${Date.now()}`, error: null };
      }
    } catch {
      // Storage failed — fall through to base64 fallback
    }
  }

  // ── 2. Fallback: compress to base64 and save in user_metadata ──
  try {
    const base64 = await compressToBase64(file, 150, 0.82);
    return { url: base64, error: null };
  } catch (err) {
    return { url: null, error: err.message || 'Failed to process image.' };
  }
}

const COLLAB_TABLE = 'projects';

// ── Track table (user track uploads) ─────────────────────────

const TRACKS_TABLE = 'Track';

export async function fetchUserTracks(userId) {
  injectLocalSession(); // ensure auth token is available for this DB call
  const local = getLocalTracks(userId);
  try {
    const { data, error } = await supabase
      .from(TRACKS_TABLE)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('[LIZI] fetchUserTracks error:', error.message, error);
      throw error;
    }
    const remote = (data || []).map(row => ({
      id:       row.id,
      title:    row.title,
      genre:    row.genre || '',
      url:      row.file_url || '',
      fileName: row.file_name || '',
    }));
    // Merge local-only tracks that haven't synced to Supabase yet
    const remoteIds = new Set(remote.map(t => String(t.id)));
    const onlyLocal = local.filter(t => !remoteIds.has(String(t.id)));
    return [...onlyLocal, ...remote];
  } catch (err) {
    console.warn('[LIZI] fetchUserTracks falling back to localStorage:', err?.message);
    return local;
  }
}

export async function saveProfile(userId, fields) {
  injectLocalSession();
  // supabase-js v2 may cache currentSession=null at startup when the user arrived via
  // OAuth (token lives in lizi_auth_session, not supabase's own storage key).
  // setSession() forces the JWT into supabase-js's in-memory state so the upsert
  // carries Authorization: Bearer <token> and auth.uid() resolves in RLS.
  // If the JWT is not expired this is a local decode only — no network call.
  try {
    const stored = localStorage.getItem('lizi_auth_session');
    if (stored) {
      const { session: s } = JSON.parse(stored);
      if (s?.access_token) {
        await supabase.auth.setSession({ access_token: s.access_token, refresh_token: s.refresh_token || '' });
      }
    }
  } catch {}

  console.log('saveProfile id:', userId);

  const { error } = await supabase
    .from('profiles')
    .upsert(
      {
        id:              userId,
        name:            fields.name           || null,
        bio:             fields.bio            || null,
        about:           fields.about          || null,
        favorite_genres: fields.favoriteGenres || null,
        instruments:     fields.instruments    || null,
        connect_ages:    fields.connectAges    || null,
        looking_for:     fields.lookingFor     || null,
        create_goals:    fields.createGoals    || null,
        music_style:     fields.musicStyle     || null,
        phone:           fields.phone          || null,
      },
      { onConflict: 'id' }
    );
  if (error) { console.error('saveProfile error:', error); return { error: error.message }; }
  return { error: null };
}

export async function fetchRecentProfiles(limit = 8) {
  injectLocalSession();
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('id, name, favorite_genres, instruments, bio, music_style')
      .not('name', 'is', null)
      .neq('name', '')
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).filter(p => p.name?.trim());
  } catch {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('id, name, favorite_genres, instruments, bio, music_style')
        .not('name', 'is', null)
        .neq('name', '')
        .limit(limit);
      return (data || []).filter(p => p.name?.trim());
    } catch { return []; }
  }
}

export async function fetchAllTracks() {
  injectLocalSession();
  try {
    const { data, error } = await supabase
      .from(TRACKS_TABLE)
      .select('id, title, genre, file_url, user_id, created_at, profiles!user_id(name)')
      .order('created_at', { ascending: false })
      .limit(50);
    if (error) { console.error('[LIZI] fetchAllTracks:', error.message); throw error; }
    return (data || []).map(row => ({
      id:             row.id,
      title:          row.title,
      genre:          row.genre || '',
      url:            row.file_url || '',
      userId:         row.user_id,
      uploaderName:   row.profiles?.name || 'Artist',
      uploaderAvatar: '🎤',
      createdAt:      row.created_at,
    }));
  } catch {
    return [];
  }
}

export async function saveTrack({ userId, title, genre, fileUrl, fileName }) {
  injectLocalSession(); // ensure auth token is present for the INSERT
  try {
    const { data, error } = await supabase
      .from(TRACKS_TABLE)
      .insert({ user_id: userId, title, genre, file_url: fileUrl, file_name: fileName })
      .select()
      .single();

    if (error) {
      console.error('[LIZI] saveTrack Supabase error:', error.message, error);
      throw error;
    }
    console.info('[LIZI] saveTrack saved to Supabase:', data.id);
    const track = { id: data.id, title: data.title, genre: data.genre || '', url: data.file_url || '', fileName: data.file_name || '' };
    upsertLocalTrack(userId, track); // keep local in sync
    return { track, error: null };
  } catch (err) {
    console.warn('[LIZI] saveTrack falling back to localStorage:', err?.message);
    const track = { id: Date.now(), title, genre: genre || '', url: fileUrl || '', fileName: fileName || '' };
    upsertLocalTrack(userId, track);
    return { track, error: null };
  }
}

export async function updateTrack(trackId, { title, genre, fileUrl, fileName, is_completed, userId }) {
  // Update local store first (works even if Supabase is unavailable)
  if (userId) {
    const local = getLocalTracks(userId);
    const t = local.find(t => String(t.id) === String(trackId));
    if (t) upsertLocalTrack(userId, { ...t, title, genre: genre ?? t.genre, url: fileUrl ?? t.url, fileName: fileName ?? t.fileName });
  }

  try {
    const payload = { title, genre };
    if (fileUrl      !== undefined) payload.file_url      = fileUrl;
    if (fileName     !== undefined) payload.file_name     = fileName;
    if (is_completed !== undefined) payload.is_completed  = is_completed;

    const { error } = await supabase
      .from(TRACKS_TABLE)
      .update(payload)
      .eq('id', trackId);

    if (error) throw error;
    return { error: null };
  } catch {
    return { error: null }; // already updated locally above
  }
}

export async function deleteLiziMusic(trackId, userId) {
  // Remove from local store
  if (userId) removeLocalTrack(userId, trackId);

  try {
    const { error } = await supabase
      .from(TRACKS_TABLE)
      .delete()
      .eq('id', trackId);

    if (error) throw error;
    return { error: null };
  } catch {
    return { error: null }; // already removed locally above
  }
}

// ── Project Tracks (localStorage) ───────────────────────────

const projectTracksKey = (id) => `lizi_pt_${id}`;

export function fetchProjectTracks(projectId) {
  try {
    return JSON.parse(localStorage.getItem(projectTracksKey(projectId)) || '[]');
  } catch {
    return [];
  }
}

export function addTrackToProject(projectId, track) {
  const tracks = fetchProjectTracks(projectId);
  if (tracks.find(t => String(t.id) === String(track.id))) return tracks;
  const next = [{ ...track, sharedAt: new Date().toISOString() }, ...tracks];
  try { localStorage.setItem(projectTracksKey(projectId), JSON.stringify(next)); } catch {}
  return next;
}

export function removeTrackFromProject(projectId, trackId) {
  const next = fetchProjectTracks(projectId).filter(t => String(t.id) !== String(trackId));
  try { localStorage.setItem(projectTracksKey(projectId), JSON.stringify(next)); } catch {}
  return next;
}

// ── Project Chat (localStorage) ──────────────────────────────

const projectChatKey = (id) => `lizi_pc_${id}`;

export function fetchProjectMessages(projectId) {
  try {
    return JSON.parse(localStorage.getItem(projectChatKey(projectId)) || '[]');
  } catch {
    return [];
  }
}

export function sendProjectMessage(projectId, { text, senderName, senderAvatar }) {
  const messages = fetchProjectMessages(projectId);
  const msg = {
    id:          Date.now(),
    text:        text.trim(),
    senderName,
    senderAvatar: senderAvatar || '🎤',
    sentAt:      new Date().toISOString(),
  };
  const next = [...messages, msg];
  try { localStorage.setItem(projectChatKey(projectId), JSON.stringify(next)); } catch {}
  return next;
}
