import fetch from 'node-fetch'; // Wait, does the project support node-fetch or can we use native global fetch? Node 24.x has native fetch!

async function run() {
  const url = 'https://rtwtncjzwhddzeigkvkd.supabase.co/rest/v1/';
  const apikey = 'sb_publishable_THmukm_kjd1Q-6vImW6M8Q_C_cdsx1Q';
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': apikey,
        'Authorization': `Bearer ${apikey}`
      }
    });
    const data = await res.json();
    console.log('Available tables/definitions:');
    if (data && data.paths) {
      console.log(Object.keys(data.paths));
    } else {
      console.log(JSON.stringify(data, null, 2));
    }
  } catch (err) {
    console.error('Failed to fetch:', err);
  }
}

run();
