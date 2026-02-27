import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });
dotenv.config();

const base = String(process.env.SAAS_API_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
const ownerKey = String(process.env.OWNER_API_KEY || '').trim();
const storeName = String(process.argv.slice(2).join(' ') || 'New Store').trim();

if (!ownerKey) {
  console.error('OWNER_API_KEY not found in .env.local');
  process.exit(1);
}

const response = await fetch(`${base}/owner/stores`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-owner-key': ownerKey,
  },
  body: JSON.stringify({ storeName }),
});

const payload = await response.json().catch(() => ({}));

if (!response.ok) {
  console.error('Create store failed:', payload?.error || `HTTP ${response.status}`);
  process.exit(1);
}

console.log('Store created');
console.log(`storeId: ${payload.storeId}`);
console.log(`inviteCode: ${payload.inviteCode}`);
console.log(`active: ${payload.active}`);
