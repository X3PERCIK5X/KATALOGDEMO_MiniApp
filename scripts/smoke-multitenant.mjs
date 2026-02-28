#!/usr/bin/env node
/* eslint-disable no-console */
const API_BASE = (process.env.SMOKE_API_BASE || 'http://127.0.0.1:3000/api').replace(/\/$/, '');
const OWNER_STORE_ID = String(process.env.SMOKE_OWNER_STORE_ID || '111111').toUpperCase();
const OWNER_PASSWORD = String(process.env.SMOKE_OWNER_PASSWORD || '');
const OWNER_EMAIL = String(process.env.SMOKE_OWNER_EMAIL || 'admin@demokatalog.app').toLowerCase();
const STORE_A = String(process.env.SMOKE_STORE_A || 'AAA001').toUpperCase();
const STORE_B = String(process.env.SMOKE_STORE_B || 'BBB001').toUpperCase();

if (!OWNER_PASSWORD) {
  console.error('SMOKE_OWNER_PASSWORD is required');
  process.exit(1);
}

async function req(path, { method = 'GET', token = '', body } = {}) {
  const headers = {};
  if (body != null) headers['Content-Type'] = 'application/json';
  if (token) headers.Authorization = `Bearer ${token}`;
  const response = await fetch(`${API_BASE}${path}`, {
    method,
    headers,
    body: body != null ? JSON.stringify(body) : undefined,
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const msg = payload?.error || `HTTP_${response.status}`;
    throw new Error(`${path} => ${msg}`);
  }
  return payload;
}

async function ensureStore(token, storeId, name, pass, email) {
  try {
    await req('/admin/stores', {
      method: 'POST',
      token,
      body: { storeId, storeName: name },
    });
  } catch (error) {
    if (!String(error.message).includes('STORE_ALREADY_EXISTS')) throw error;
  }
  try {
    await req('/auth/register-by-store', {
      method: 'POST',
      body: { storeId, password: pass, email },
    });
  } catch (error) {
    if (!String(error.message).includes('STORE_ALREADY_ACTIVE')) throw error;
  }
}

async function putDataset(token, storeId, catId, prodId, prodTitle, price) {
  const payload = {
    config: {},
    categories: [{ id: catId, title: `${prodTitle} Category`, groupId: 'apparel', image: '' }],
    products: [{ id: prodId, categoryId: catId, title: prodTitle, price, images: [''], description: prodTitle }],
  };
  await req(`/stores/${storeId}/admin/data`, {
    method: 'PUT',
    token,
    body: payload,
  });
}

async function main() {
  console.log('1) owner login');
  const login = await req('/auth/login', {
    method: 'POST',
    body: { storeId: OWNER_STORE_ID, password: OWNER_PASSWORD, email: OWNER_EMAIL },
  });
  const token = String(login?.token || '');
  if (!token) throw new Error('OWNER_TOKEN_EMPTY');

  console.log('2) ensure stores A/B');
  await ensureStore(token, STORE_A, 'Store A', 'PassA123', 'a@store.test');
  await ensureStore(token, STORE_B, 'Store B', 'PassB123', 'b@store.test');

  console.log('3) set datasets A/B');
  await putDataset(token, STORE_A, 'cat-a', 'prod-a', 'A Product', 1111);
  await putDataset(token, STORE_B, 'cat-b', 'prod-b', 'B Product', 2222);

  console.log('4) check product isolation');
  const aProducts = await req(`/stores/${STORE_A}/products`);
  const bProducts = await req(`/stores/${STORE_B}/products`);
  const aTitles = (aProducts.products || []).map((p) => p.title);
  const bTitles = (bProducts.products || []).map((p) => p.title);
  if (!aTitles.includes('A Product') || aTitles.includes('B Product')) throw new Error('A_CATALOG_ISOLATION_FAILED');
  if (!bTitles.includes('B Product') || bTitles.includes('A Product')) throw new Error('B_CATALOG_ISOLATION_FAILED');

  console.log('5) create orders A/B');
  const aOrder = await req(`/stores/${STORE_A}/orders`, {
    method: 'POST',
    body: {
      order: {
        id: `ORD-A-${Date.now()}`,
        items: [{ id: 'prod-a', title: 'A Product', qty: 1, price: 1111 }],
        total: 1111,
        customer: { name: 'A', phone: '+79990000000', email: 'a@test.local' },
      },
    },
  });
  const bOrder = await req(`/stores/${STORE_B}/orders`, {
    method: 'POST',
    body: {
      order: {
        id: `ORD-B-${Date.now()}`,
        items: [{ id: 'prod-b', title: 'B Product', qty: 1, price: 2222 }],
        total: 2222,
        customer: { name: 'B', phone: '+79990000001', email: 'b@test.local' },
      },
    },
  });

  console.log('6) check admin orders isolation');
  const aOrders = await req(`/stores/${STORE_A}/admin/orders`, { token });
  const bOrders = await req(`/stores/${STORE_B}/admin/orders`, { token });
  const aOrderIds = (aOrders.orders || []).map((x) => String(x.id));
  const bOrderIds = (bOrders.orders || []).map((x) => String(x.id));
  if (aOrder?.orderId && !aOrderIds.includes(String(aOrder.orderId))) throw new Error('A_ORDER_NOT_FOUND');
  if (bOrder?.orderId && !bOrderIds.includes(String(bOrder.orderId))) throw new Error('B_ORDER_NOT_FOUND');

  console.log('7) check bot notification statuses');
  const aNotify = aOrder?.notification || {};
  const bNotify = bOrder?.notification || {};
  console.log('A notification:', aNotify);
  console.log('B notification:', bNotify);
  if (aNotify.ok !== true) console.log('WARN: A notification is not ok (likely bot/chat not connected).');
  if (bNotify.ok !== true) console.log('WARN: B notification is not ok (likely bot/chat not connected).');

  console.log('\nSMOKE TEST PASSED: multi-tenant isolation is OK');
}

main().catch((error) => {
  console.error('SMOKE TEST FAILED:', error.message || error);
  process.exit(1);
});
