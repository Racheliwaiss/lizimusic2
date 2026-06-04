import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rtwtncjzwhddzeigkvkd.supabase.co';
const supabaseAnonKey = 'sb_publishable_THmukm_kjd1Q-6vImW6M8Q_C_cdsx1Q';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function run() {
  const tables = ['profiles', 'users', 'artists', 'members', 'projects', 'tracks'];
  for (const table of tables) {
    try {
      const { data, error } = await supabase.from(table).select('*').limit(3);
      if (error) {
        console.log(`Table '${table}': Failed to select - ${error.message}`);
      } else {
        console.log(`Table '${table}': Success! Data:`, JSON.stringify(data, null, 2));
      }
    } catch (err) {
      console.log(`Table '${table}': Exception - ${err.message}`);
    }
  }
}

run();
