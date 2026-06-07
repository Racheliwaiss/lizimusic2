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

export async function fetchProjects() {
  try {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (data && data.length > 0) return data.map(normalizeProject);
  } catch {
    // fall through
  }
  return fallbackProjects;
}

export async function createProject(fields, userId) {
  try {
    const { data, error } = await supabase
      .from('projects')
      .insert({
        title:       fields.title,
        genre:       fields.genre,
        instruments: fields.instruments,
        age_range:   fields.ageRange,
        description: fields.description || '',
        location:    fields.location || '',
        members:     1,
        created_by:  userId || null,
      })
      .select()
      .single();

    if (error) throw error;
    return { project: normalizeProject(data), error: null };
  } catch (err) {
    return { project: null, error: err.message };
  }
}

export async function joinProject(projectId) {
  // Use a raw SQL expression to avoid the fetch-then-update race condition
  try {
    const { error } = await supabase.rpc('increment_project_members', { project_id: projectId });
    if (!error) return { error: null };
    // RPC not available — fall back to read-then-write
  } catch { /* fall through */ }

  try {
    const { data: current, error: fetchErr } = await supabase
      .from('projects').select('members').eq('id', projectId).single();
    if (fetchErr) throw fetchErr;
    const { error: updateErr } = await supabase
      .from('projects').update({ members: (current.members || 1) + 1 }).eq('id', projectId);
    if (updateErr) throw updateErr;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

export async function updateProject(projectId, fields) {
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
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
}

export async function deleteProject(projectId) {
  try {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (error) throw error;
    return { error: null };
  } catch (err) {
    return { error: err.message };
  }
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
const MAX_AVATAR_MB = 2;

export async function uploadAvatar(userId, file) {
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return { url: null, error: 'Only JPG, PNG, WEBP, or GIF images are supported.' };
  }
  if (file.size > MAX_AVATAR_MB * 1024 * 1024) {
    return { url: null, error: `Image must be under ${MAX_AVATAR_MB} MB.` };
  }

  if (!supabase.storage) {
    return { url: null, error: 'Storage is not available in offline mode.' };
  }

  const ext  = file.name.split('.').pop().toLowerCase() || 'jpg';
  const path = `${userId}/avatar.${ext}`;

  try {
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(path, file, { upsert: true, contentType: file.type });

    if (uploadError) throw uploadError;

    const { data } = supabase.storage.from('avatars').getPublicUrl(path);
    // Bust the browser cache so the new image shows immediately
    const bust = `?t=${Date.now()}`;
    return { url: data.publicUrl + bust, error: null };
  } catch (err) {
    return { url: null, error: err.message || 'Upload failed.' };
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

export async function updateTrack(trackId, { title, genre, fileUrl, fileName }) {
  try {
    const payload = { title, genre };
    if (fileUrl)   payload.file_url  = fileUrl;
    if (fileName)  payload.file_name = fileName;

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
