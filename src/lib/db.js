import { supabase } from './supabase';
import fallbackArtists from '../data/artists';

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
  name:        row.name,
  genre:       row.genre,
  instruments: row.instruments || '',
  style:       row.style || '',
  ageRange:    row.age_range || '',
  followers:   row.followers || 0,
  avatar:      row.avatar || '🎤',
  location:    row.location || '',
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
      .from('projects')
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

export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) {
      // Merge any locally-created projects that aren't in Supabase yet
      const local = getLocalProjects();
      const supabaseIds = new Set(data.map(r => String(r.id)));
      const onlyLocal = local.filter(p => !supabaseIds.has(String(p.id)));
      return [...onlyLocal, ...data.map(normalizeProject)];
    }
  } catch {
    // fall through to local + fallback
  }

  // Supabase unavailable — merge local with dummy seed
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
      .from('projects')
      .insert({
        title:       newProject.title,
        genre:       newProject.genre,
        instruments: newProject.instruments,
        age_range:   newProject.ageRange,
        description: newProject.description,
        location:    newProject.location,
        members:     1,
        created_by:  userId || null,
      })
      .select()
      .single();

    if (error) throw error;
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
      .from('projects').select('members').eq('id', projectId).single();
    if (!fetchErr) {
      await supabase
        .from('projects').update({ members: (current.members || 1) + 1 }).eq('id', projectId);
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
      .select(`user_id, joined_at, profiles:user_id (name, instruments, genre, style, location, avatar, bio)`)
      .eq('project_id', projectId)
      .order('joined_at', { ascending: true });

    if (!error && data && data.length > 0) {
      return data.map(row => ({
        userId:      row.user_id,
        joinedAt:    row.joined_at,
        name:        row.profiles?.name        || 'Anonymous Artist',
        instruments: row.profiles?.instruments || '',
        genre:       row.profiles?.genre       || '',
        location:    row.profiles?.location    || '',
        avatar:      row.profiles?.avatar      || '🎤',
        bio:         row.profiles?.bio         || '',
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
      .from('projects')
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
      .from('projects')
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

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const path     = `${userId}/${Date.now()}_${safeName}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('tracks')
      .upload(path, file, { upsert: false, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('tracks').getPublicUrl(path);
    return { url: data.publicUrl, error: null };
  } catch (err) {
    return { url: null, error: err.message || 'Upload failed.' };
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

// ── Lizi Music table (tracks) ────────────────────────────────

export async function fetchUserTracks(userId) {
  try {
    const { data, error } = await supabase
      .from('Lizi Music')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(row => ({
      id:       row.id,
      title:    row.title,
      genre:    row.genre || '',
      url:      row.file_url || '',
      fileName: row.file_name || '',
    }));
  } catch {
    return [];
  }
}

export async function saveTrack({ userId, title, genre, fileUrl, fileName }) {
  try {
    const { data, error } = await supabase
      .from('Lizi Music')
      .insert({ user_id: userId, title, genre, file_url: fileUrl, file_name: fileName })
      .select()
      .single();

    if (error) throw error;
    return {
      track: { id: data.id, title: data.title, genre: data.genre || '', url: data.file_url || '', fileName: data.file_name || '' },
      error: null,
    };
  } catch (err) {
    return { track: null, error: err.message };
  }
}

export async function updateTrack(trackId, { title, genre, fileUrl, fileName, is_completed }) {
  try {
    const payload = { title, genre };
    if (fileUrl)                payload.file_url      = fileUrl;
    if (fileName)               payload.file_name     = fileName;
    if (is_completed !== undefined) payload.is_completed = is_completed;

    const { error } = await supabase
      .from('Lizi Music')
      .update(payload)
      .eq('id', trackId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

export async function deleteLiziMusic(trackId) {
  try {
    const { error } = await supabase
      .from('Lizi Music')
      .delete()
      .eq('id', trackId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}
