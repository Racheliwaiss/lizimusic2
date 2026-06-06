-- ============================================================
-- LIZI Platform – Full Schema + Seed Data
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor → New query)
-- ============================================================

-- ── artists ─────────────────────────────────────────────────
create table if not exists public.artists (
  id          serial primary key,
  name        text        not null,
  genre       text        not null,
  instruments text        not null default '',
  style       text        not null default '',
  age_range   text        not null default '',
  followers   integer     not null default 0,
  avatar      text        not null default '🎤',
  location    text        not null default '',
  created_at  timestamptz not null default now()
);

alter table public.artists enable row level security;
create policy "Artists are public" on public.artists for select using (true);
create policy "Auth users can insert artists" on public.artists for insert with check (auth.role() = 'authenticated');

-- ── profiles ────────────────────────────────────────────────
create table if not exists public.profiles (
  id              uuid        primary key references auth.users(id) on delete cascade,
  name            text        not null default '',
  bio             text        not null default '',
  about           text        not null default '',
  genre           text        not null default '',
  instruments     text        not null default '',
  style           text        not null default '',
  connect_ages    text        not null default '',
  looking_for     text        not null default '',
  create_goals    text        not null default '',
  location        text        not null default '',
  avatar          text        not null default '🎤',
  followers       integer     not null default 0,
  updated_at      timestamptz not null default now()
);

alter table public.profiles enable row level security;
create policy "Profiles are public"          on public.profiles for select using (true);
create policy "Users manage own profile"     on public.profiles for all    using (auth.uid() = id);

-- Auto-create profile row when a user signs up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.profiles (id, name)
  values (new.id, coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ── Lizi Music (tracks) ──────────────────────────────────────
create table if not exists public."Lizi Music" (
  id          serial primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  genre       text        not null default '',
  file_url    text        not null default '',
  file_name   text        not null default '',
  created_at  timestamptz not null default now()
);

alter table public."Lizi Music" enable row level security;
create policy "Users see own music"    on public."Lizi Music" for select using (auth.uid() = user_id);
create policy "Users insert own music" on public."Lizi Music" for insert with check (auth.uid() = user_id);
create policy "Users update own music" on public."Lizi Music" for update using (auth.uid() = user_id);
create policy "Users delete own music" on public."Lizi Music" for delete using (auth.uid() = user_id);

-- ── projects ─────────────────────────────────────────────────
create table if not exists public.projects (
  id          serial primary key,
  title       text        not null,
  genre       text        not null default '',
  instruments text        not null default '',
  age_range   text        not null default '',
  description text        not null default '',
  location    text        not null default '',
  members     integer     not null default 1,
  created_by  uuid        references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

alter table public.projects enable row level security;
create policy "Projects are public"              on public.projects for select using (true);
create policy "Auth users can create projects"   on public.projects for insert with check (auth.role() = 'authenticated');
create policy "Owners can update their projects" on public.projects for update using (auth.uid() = created_by);
create policy "Owners can delete their projects" on public.projects for delete using (auth.uid() = created_by);

-- ── tracks ───────────────────────────────────────────────────
create table if not exists public.tracks (
  id          serial primary key,
  user_id     uuid        not null references auth.users(id) on delete cascade,
  title       text        not null,
  genre       text        not null default '',
  file_url    text        not null default '',
  file_name   text        not null default '',
  created_at  timestamptz not null default now()
);

alter table public.tracks enable row level security;
create policy "Users see own tracks"    on public.tracks for select using (auth.uid() = user_id);
create policy "Users insert own tracks" on public.tracks for insert with check (auth.uid() = user_id);
create policy "Users delete own tracks" on public.tracks for delete using (auth.uid() = user_id);

-- ── Seed: artists ─────────────────────────────────────────────
insert into public.artists (name, genre, instruments, style, age_range, followers, avatar, location) values
  ('Luna Dreams',        'Electronic', 'Synth, Production',            'Experimental',  '18-30', 1200, '🌙', 'Tel Aviv'),
  ('Ambient Producer',   'Electronic', 'Synth, Field Recordings',      'Atmospheric',   '25-45', 940,  '🌫️', 'Haifa'),
  ('Neon Pulse',         'Electronic', 'Synth, DJ, Production',        'Techno',        '20-35', 2300, '⚡', 'Berlin'),
  ('Crystal Waves',      'Electronic', 'Synth, Vocals',                'Chill',         '22-38', 870,  '💠', 'Amsterdam'),
  ('Static Dreamer',     'Electronic', 'Synthesizer, Drum Machine',    'Experimental',  '18-32', 560,  '📡', 'Jerusalem'),
  ('Beat Maker',         'Hip-Hop',    'Drums, Production',            'Underground',   '20-35', 2100, '🎧', 'Tel Aviv'),
  ('Flow State',         'Hip-Hop',    'Rap, Production, Beats',       'Trap',          '18-30', 3100, '🎤', 'Rishon'),
  ('Lyric Architect',    'Hip-Hop',    'Rap, Piano',                   'Conscious',     '22-40', 980,  '📝', 'Haifa'),
  ('Bass District',      'Hip-Hop',    'Bass, Beats, Production',      'Boom Bap',      '20-35', 1450, '🔊', 'Netanya'),
  ('Jazz Master',        'Jazz',       'Piano, Saxophone',             'Traditional',   '35-60', 890,  '🎷', 'Tel Aviv'),
  ('Blue Note Trio',     'Jazz',       'Piano, Bass, Drums',           'Modern Jazz',   '28-55', 670,  '🎹', 'Jerusalem'),
  ('Smooth Improv',      'Jazz',       'Saxophone, Guitar',            'Fusion',        '30-60', 510,  '🎼', 'Beer Sheva'),
  ('Indie Rock',         'Rock',       'Guitar, Vocals',               'Alternative',   '22-40', 756,  '🎸', 'Tel Aviv'),
  ('Voltage Surge',      'Rock',       'Guitar, Bass, Drums',          'Hard Rock',     '20-45', 1320, '⚡', 'Haifa'),
  ('Quiet Storm',        'Rock',       'Guitar, Vocals, Keys',         'Indie',         '25-50', 890,  '🌩️', 'Ramat Gan'),
  ('Pop Star',           'Pop',        'Vocals, Keys',                 'Commercial',    '18-28', 3400, '⭐', 'Tel Aviv'),
  ('Glitter Beats',      'Pop',        'Vocals, Production, Dance',    'Dance Pop',     '16-28', 5200, '✨', 'Eilat'),
  ('Sunset Radio',       'Pop',        'Vocals, Guitar, Keys',         'Indie Pop',     '20-35', 1800, '📻', 'Tel Aviv'),
  ('Velvet Voice',       'Pop',        'Vocals',                       'Soft Pop',      '18-32', 2700, '🎵', 'Herzeliya'),
  ('Folk Singer',        'Folk',       'Guitar, Vocals',               'Acoustic',      '25-50', 450,  '🌿', 'Jerusalem'),
  ('Mountain Echo',      'Folk',       'Guitar, Harmonica, Vocals',    'Country Folk',  '30-55', 380,  '🏔️', 'Safed'),
  ('R&B Vocalist',       'R&B',        'Vocals, Keys',                 'Soul',          '20-35', 1800, '💜', 'Tel Aviv'),
  ('Midnight Groove',    'R&B',        'Vocals, Bass, Keys',           'Neo-Soul',      '22-40', 2400, '🌙', 'Ramat Hasharon'),
  ('Classical Composer', 'Classical',  'Strings, Composition',         'Symphony',      '30-65', 620,  '🎻', 'Jerusalem'),
  ('Gospel Singer',      'Gospel',     'Vocals, Organ',                'Spiritual',     '30-70', 1100, '🙏', 'Bnei Brak'),
  ('Island Vibes',       'Reggae',     'Guitar, Bass, Vocals',         'Roots',         '22-50', 960,  '🌴', 'Eilat'),
  ('Oud Journey',        'World',      'Oud, Percussion, Vocals',      'Middle Eastern','28-60', 840,  '🪘', 'Jaffa'),
  ('Desert Strings',     'World',      'Oud, Violin, Vocals',          'Fusion',        '25-55', 630,  '🏜️', 'Beer Sheva')
on conflict do nothing;

-- ── Seed: projects ─────────────────────────────────────────────
insert into public.projects (title, genre, instruments, age_range, description, members) values
  ('Summer Vibes EP',     'Electronic', 'Synth, Drums',                 '18-35', 'Upbeat summer electronic project',    3),
  ('Jazz Sessions',        'Jazz',       'Piano, Bass, Drums',           '25-50', 'Sophisticated jazz collaboration',     2),
  ('Hip-Hop Beats',        'Hip-Hop',    'Beats, Rap, Production',       '18-40', 'Urban hip-hop beat crafting',          4),
  ('Indie Folk Nights',    'Folk',       'Guitar, Vocals, Percussion',   '20-45', 'Acoustic folk storytelling',           2),
  ('Pop Collaboration',    'Pop',        'Vocals, Keys, Production',     '16-35', 'Chart-ready pop tracks',               5),
  ('Rock Anthem',          'Rock',       'Guitar, Bass, Drums, Vocals',  '18-50', 'High-energy rock production',          4),
  ('R&B Vibes',            'R&B',        'Vocals, Keys, Production',     '20-40', 'Smooth R&B collaboration',             3),
  ('Classical Orchestra',  'Classical',  'Strings, Woodwinds, Brass',    '25-60', 'Symphony composition project',         8),
  ('World Fusion Project', 'World',      'Oud, Violin, Percussion',      '20-55', 'Middle Eastern meets contemporary',    3),
  ('Reggae Collective',    'Reggae',     'Guitar, Bass, Vocals, Drums',  '22-45', 'Positive vibes reggae session',        4)
on conflict do nothing;
