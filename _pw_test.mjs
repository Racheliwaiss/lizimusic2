import { chromium } from 'playwright';

const browser = await chromium.launch({ channel: 'chrome', headless: true });
const ctx = await browser.newContext();
const page = await ctx.newPage();
await page.setViewportSize({ width: 1280, height: 800 });

const errors = [];
page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });

// Set localStorage before loading any page
await page.goto('http://localhost:5174/');
await page.waitForTimeout(500);

const mockUser = {
  id: 'test-user-1',
  email: 'test@lizi.com',
  user_metadata: { name: 'Test Artist', bio: '🎵 Music Creator' },
  created_at: new Date().toISOString(),
};
await page.evaluate((u) => localStorage.setItem('supabase_user', JSON.stringify(u)), mockUser);

// Verify localStorage was set
const stored = await page.evaluate(() => localStorage.getItem('supabase_user'));
console.log('localStorage set:', stored ? 'yes' : 'no');

// Navigate to profile
await page.goto('http://localhost:5174/profile');
await page.waitForTimeout(3000);
await page.screenshot({ path: 'ss_profile_debug.png' });
console.log('URL:', page.url());
console.log('Console errors:', errors);

// Check if user is authenticated in the page
const authInfo = await page.evaluate(() => {
  return { localStorage: localStorage.getItem('supabase_user') ? 'has user' : 'empty' };
});
console.log('Auth info:', authInfo);

await browser.close();
