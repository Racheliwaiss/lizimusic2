const artists = [
  // Electronic
  { id: 1,  name: 'Luna Dreams',        genre: 'Electronic', instruments: 'Synth, Production',             ageRange: '18-30', followers: 1200, style: 'Experimental', avatar: '🌙', location: 'Tel Aviv' },
  { id: 9,  name: 'Ambient Producer',   genre: 'Electronic', instruments: 'Synth, Field Recordings',       ageRange: '25-45', followers: 940,  style: 'Atmospheric',  avatar: '🌫️', location: 'Haifa' },
  { id: 11, name: 'Neon Pulse',         genre: 'Electronic', instruments: 'Synth, DJ, Production',         ageRange: '20-35', followers: 2300, style: 'Techno',        avatar: '⚡', location: 'Berlin' },
  { id: 12, name: 'Crystal Waves',      genre: 'Electronic', instruments: 'Synth, Vocals',                 ageRange: '22-38', followers: 870,  style: 'Chill',         avatar: '💠', location: 'Amsterdam' },
  { id: 13, name: 'Static Dreamer',     genre: 'Electronic', instruments: 'Synthesizer, Drum Machine',     ageRange: '18-32', followers: 560,  style: 'Experimental',  avatar: '📡', location: 'Jerusalem' },

  // Hip-Hop
  { id: 3,  name: 'Beat Maker',         genre: 'Hip-Hop',    instruments: 'Drums, Production',             ageRange: '20-35', followers: 2100, style: 'Underground',   avatar: '🎧', location: 'Tel Aviv' },
  { id: 14, name: 'Flow State',         genre: 'Hip-Hop',    instruments: 'Rap, Production, Beats',        ageRange: '18-30', followers: 3100, style: 'Trap',          avatar: '🎤', location: 'Rishon' },
  { id: 15, name: 'Lyric Architect',    genre: 'Hip-Hop',    instruments: 'Rap, Piano',                    ageRange: '22-40', followers: 980,  style: 'Conscious',     avatar: '📝', location: 'Haifa' },
  { id: 16, name: 'Bass District',      genre: 'Hip-Hop',    instruments: 'Bass, Beats, Production',       ageRange: '20-35', followers: 1450, style: 'Boom Bap',      avatar: '🔊', location: 'Netanya' },

  // Jazz
  { id: 2,  name: 'Jazz Master',        genre: 'Jazz',       instruments: 'Piano, Saxophone',              ageRange: '35-60', followers: 890,  style: 'Traditional',   avatar: '🎷', location: 'Tel Aviv' },
  { id: 17, name: 'Blue Note Trio',     genre: 'Jazz',       instruments: 'Piano, Bass, Drums',            ageRange: '28-55', followers: 670,  style: 'Modern Jazz',   avatar: '🎹', location: 'Jerusalem' },
  { id: 18, name: 'Smooth Improv',      genre: 'Jazz',       instruments: 'Saxophone, Guitar',             ageRange: '30-60', followers: 510,  style: 'Fusion',        avatar: '🎼', location: 'Beer Sheva' },

  // Rock
  { id: 4,  name: 'Indie Rock',         genre: 'Rock',       instruments: 'Guitar, Vocals',                ageRange: '22-40', followers: 756,  style: 'Alternative',   avatar: '🎸', location: 'Tel Aviv' },
  { id: 19, name: 'Voltage Surge',      genre: 'Rock',       instruments: 'Guitar, Bass, Drums',          ageRange: '20-45', followers: 1320, style: 'Hard Rock',     avatar: '⚡', location: 'Haifa' },
  { id: 20, name: 'Quiet Storm',        genre: 'Rock',       instruments: 'Guitar, Vocals, Keys',          ageRange: '25-50', followers: 890,  style: 'Indie',         avatar: '🌩️', location: 'Ramat Gan' },
  { id: 21, name: 'Grunge Revival',     genre: 'Rock',       instruments: 'Guitar, Bass, Drums, Vocals',   ageRange: '22-42', followers: 660,  style: 'Alternative',   avatar: '🤘', location: 'Tel Aviv' },

  // Pop
  { id: 5,  name: 'Pop Star',           genre: 'Pop',        instruments: 'Vocals, Keys',                  ageRange: '18-28', followers: 3400, style: 'Commercial',    avatar: '⭐', location: 'Tel Aviv' },
  { id: 22, name: 'Glitter Beats',      genre: 'Pop',        instruments: 'Vocals, Production, Dance',     ageRange: '16-28', followers: 5200, style: 'Dance Pop',     avatar: '✨', location: 'Eilat' },
  { id: 23, name: 'Sunset Radio',       genre: 'Pop',        instruments: 'Vocals, Guitar, Keys',          ageRange: '20-35', followers: 1800, style: 'Indie Pop',     avatar: '📻', location: 'Tel Aviv' },
  { id: 24, name: 'Velvet Voice',       genre: 'Pop',        instruments: 'Vocals',                        ageRange: '18-32', followers: 2700, style: 'Soft Pop',      avatar: '🎵', location: 'Herzeliya' },

  // Folk
  { id: 6,  name: 'Folk Singer',        genre: 'Folk',       instruments: 'Guitar, Vocals',                ageRange: '25-50', followers: 450,  style: 'Acoustic',      avatar: '🌿', location: 'Jerusalem' },
  { id: 25, name: 'Mountain Echo',      genre: 'Folk',       instruments: 'Guitar, Harmonica, Vocals',     ageRange: '30-55', followers: 380,  style: 'Country Folk',  avatar: '🏔️', location: 'Safed' },
  { id: 26, name: 'Barefoot Harmony',   genre: 'Folk',       instruments: 'Banjo, Vocals, Fiddle',         ageRange: '28-50', followers: 290,  style: 'Bluegrass',     avatar: '🪕', location: 'Modi\'in' },

  // R&B
  { id: 7,  name: 'R&B Vocalist',       genre: 'R&B',        instruments: 'Vocals, Keys',                  ageRange: '20-35', followers: 1800, style: 'Soul',          avatar: '💜', location: 'Tel Aviv' },
  { id: 27, name: 'Midnight Groove',    genre: 'R&B',        instruments: 'Vocals, Bass, Keys',            ageRange: '22-40', followers: 2400, style: 'Neo-Soul',      avatar: '🌙', location: 'Ramat Hasharon' },
  { id: 28, name: 'Silk Tone',          genre: 'R&B',        instruments: 'Vocals, Guitar',                ageRange: '18-35', followers: 1100, style: 'Soul',          avatar: '🎙️', location: 'Ashdod' },

  // Classical
  { id: 8,  name: 'Classical Composer', genre: 'Classical',  instruments: 'Strings, Composition',          ageRange: '30-65', followers: 620,  style: 'Symphony',      avatar: '🎻', location: 'Jerusalem' },
  { id: 29, name: 'Chamber Quartet',    genre: 'Classical',  instruments: 'Strings, Piano',                ageRange: '28-60', followers: 430,  style: 'Chamber',       avatar: '🎼', location: 'Tel Aviv' },
  { id: 30, name: 'Modern Aria',        genre: 'Classical',  instruments: 'Vocals, Strings, Composition',  ageRange: '25-55', followers: 310,  style: 'Contemporary',  avatar: '🎹', location: 'Haifa' },

  // Gospel
  { id: 10, name: 'Gospel Singer',      genre: 'Gospel',     instruments: 'Vocals, Organ',                 ageRange: '30-70', followers: 1100, style: 'Spiritual',     avatar: '🙏', location: 'Bnei Brak' },
  { id: 31, name: 'Praise Collective',  genre: 'Gospel',     instruments: 'Vocals, Piano, Drums',          ageRange: '25-60', followers: 780,  style: 'Contemporary',  avatar: '✝️', location: 'Nazareth' },

  // Reggae
  { id: 32, name: 'Island Vibes',       genre: 'Reggae',     instruments: 'Guitar, Bass, Vocals',          ageRange: '22-50', followers: 960,  style: 'Roots',         avatar: '🌴', location: 'Eilat' },
  { id: 33, name: 'Conscious Riddim',   genre: 'Reggae',     instruments: 'Guitar, Percussion, Vocals',    ageRange: '25-45', followers: 720,  style: 'Dub',           avatar: '🌊', location: 'Tel Aviv' },

  // World / Middle Eastern
  { id: 34, name: 'Oud Journey',        genre: 'World',      instruments: 'Oud, Percussion, Vocals',       ageRange: '28-60', followers: 840,  style: 'Middle Eastern', avatar: '🪘', location: 'Jaffa' },
  { id: 35, name: 'Desert Strings',     genre: 'World',      instruments: 'Oud, Violin, Vocals',           ageRange: '25-55', followers: 630,  style: 'Fusion',        avatar: '🏜️', location: 'Beer Sheva' },
];

export default artists;
