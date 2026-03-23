const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const STORE_ID = process.argv[2] || 'R33J6P';
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'storage', 'saas.sqlite3');
const UPLOADS_BASE = path.join(ROOT, 'uploads', STORE_ID, 'premium-tech-demo');
const BACKUPS_DIR = path.join(ROOT, 'storage', 'backups');
const PUBLIC_UPLOAD_BASE = `/uploads/${STORE_ID}/premium-tech-demo`;

if (!fs.existsSync(DB_PATH)) throw new Error(`DB not found: ${DB_PATH}`);

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function escapeXml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function scoreProductImage(url) {
  const value = String(url || '').toLowerCase();
  let score = 0;
  if (!value) return score;
  if (value.includes('storeimages.cdn-apple.com')) score += 120;
  if (value.includes('resource.logitech.com')) score += 110;
  if (value.includes('res.garmin.com')) score += 110;
  if (value.includes('lh3.googleusercontent.com')) score += 100;
  if (value.includes('apple.com/v/') && value.includes('/meta/')) score += 95;
  if (value.includes('apple.com/assets-www/')) score += 90;
  if (value.includes('unsplash.com')) score += 70;
  if (value.includes('gsmarena.com')) score += 35;
  if (value.includes('bigpic')) score -= 8;
  return score;
}

function orderProductImages(values) {
  return unique(values).sort((a, b) => scoreProductImage(b) - scoreProductImage(a));
}

function specsToLines(items) {
  return (items || []).filter(Boolean).map((item) => `${item.label}: ${item.value}`);
}

function writeSvg(filename, svg) {
  ensureDir(UPLOADS_BASE);
  fs.writeFileSync(path.join(UPLOADS_BASE, filename), svg, 'utf8');
  return `${PUBLIC_UPLOAD_BASE}/${filename}`;
}

function categoryCoverSvg({ accentA, accentB, chip, icon, glow }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" viewBox="0 0 1200 1200" fill="none">
    <defs>
      <linearGradient id="bg" x1="120" y1="92" x2="1082" y2="1110" gradientUnits="userSpaceOnUse">
        <stop stop-color="#F8FAFD"/>
        <stop offset="1" stop-color="#EEF2F7"/>
      </linearGradient>
      <linearGradient id="accent" x1="180" y1="208" x2="1028" y2="952" gradientUnits="userSpaceOnUse">
        <stop stop-color="${accentA}" stop-opacity="0.18"/>
        <stop offset="1" stop-color="${accentB}" stop-opacity="0.12"/>
      </linearGradient>
      <radialGradient id="halo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(920 204) rotate(140) scale(620 620)">
        <stop stop-color="${glow}"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="1200" height="1200" rx="76" fill="#F5F7FA"/>
    <rect x="92" y="92" width="1016" height="1016" rx="58" fill="url(#bg)"/>
    <rect x="92" y="92" width="1016" height="1016" rx="58" fill="url(#accent)"/>
    <rect x="92" y="92" width="1016" height="1016" rx="58" fill="url(#halo)"/>
    <rect x="146" y="144" width="186" height="42" rx="21" fill="rgba(15,23,42,0.05)" stroke="rgba(15,23,42,0.08)"/>
    <text x="182" y="172" font-family="-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif" font-size="20" font-weight="600" fill="#334155">${escapeXml(chip)}</text>
    <g opacity="0.88">${icon}</g>
  </svg>`;
}

function bannerBackdropSvg({ accentA, accentB, glow, device }) {
  return `<?xml version="1.0" encoding="UTF-8"?>
  <svg xmlns="http://www.w3.org/2000/svg" width="1600" height="900" viewBox="0 0 1600 900" fill="none">
    <defs>
      <linearGradient id="bg" x1="100" y1="76" x2="1490" y2="898" gradientUnits="userSpaceOnUse">
        <stop stop-color="#FBFCFE"/>
        <stop offset="1" stop-color="#F1F4F8"/>
      </linearGradient>
      <linearGradient id="accent" x1="210" y1="160" x2="1420" y2="812" gradientUnits="userSpaceOnUse">
        <stop stop-color="${accentA}" stop-opacity="0.16"/>
        <stop offset="1" stop-color="${accentB}" stop-opacity="0.10"/>
      </linearGradient>
      <radialGradient id="halo" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(1240 150) rotate(142) scale(660 660)">
        <stop stop-color="${glow}"/>
        <stop offset="1" stop-color="rgba(255,255,255,0)"/>
      </radialGradient>
    </defs>
    <rect width="1600" height="900" rx="72" fill="#F5F7FB"/>
    <rect width="1600" height="900" rx="72" fill="url(#bg)"/>
    <rect width="1600" height="900" rx="72" fill="url(#accent)"/>
    <rect width="1600" height="900" rx="72" fill="url(#halo)"/>
    <rect x="60" y="60" width="1480" height="780" rx="48" fill="rgba(255,255,255,0.42)" stroke="rgba(15,23,42,0.06)"/>
    <circle cx="1182" cy="196" r="114" fill="rgba(255,255,255,0.72)"/>
    <circle cx="1308" cy="302" r="52" fill="rgba(255,255,255,0.58)"/>
    <rect x="986" y="144" width="446" height="446" rx="108" fill="rgba(255,255,255,0.62)" stroke="rgba(15,23,42,0.06)"/>
    <g opacity="0.92">${device}</g>
  </svg>`;
}

const CATEGORY_ART = {
  smartphones: {
    chip: 'Smartphones',
    accentA: '#19356E',
    accentB: '#0B1530',
    glow: 'rgba(160, 196, 255, 0.34)',
    icon: '<rect x="732" y="220" width="212" height="424" rx="38" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.18)" stroke-width="4"/><rect x="756" y="248" width="164" height="360" rx="24" fill="rgba(255,255,255,0.96)"/><circle cx="838" cy="236" r="6" fill="rgba(15,23,42,0.28)"/>'
  },
  laptops: {
    chip: 'Notebooks',
    accentA: '#3F4961',
    accentB: '#161B28',
    glow: 'rgba(255,255,255,0.24)',
    icon: '<rect x="664" y="260" width="316" height="214" rx="20" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.16)" stroke-width="4"/><rect x="694" y="290" width="256" height="154" rx="12" fill="rgba(255,255,255,0.94)"/><path d="M620 534h406l-38 60H658z" fill="rgba(15,23,42,0.12)" stroke="rgba(15,23,42,0.14)" stroke-width="3"/>'
  },
  tablets: {
    chip: 'Tablets',
    accentA: '#45377F',
    accentB: '#181736',
    glow: 'rgba(203, 213, 255, 0.26)',
    icon: '<rect x="696" y="214" width="252" height="362" rx="28" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.18)" stroke-width="4"/><rect x="722" y="242" width="200" height="306" rx="16" fill="rgba(255,255,255,0.95)"/><circle cx="822" cy="562" r="5" fill="rgba(15,23,42,0.26)"/>'
  },
  headphones: {
    chip: 'Audio',
    accentA: '#5B3B33',
    accentB: '#171A22',
    glow: 'rgba(255,255,255,0.18)',
    icon: '<path d="M760 320c0-88 56-148 140-148s140 60 140 148" fill="none" stroke="rgba(15,23,42,0.20)" stroke-width="26" stroke-linecap="round"/><rect x="724" y="346" width="76" height="190" rx="34" fill="rgba(15,23,42,0.12)"/><rect x="1000" y="346" width="76" height="190" rx="34" fill="rgba(15,23,42,0.12)"/><rect x="752" y="384" width="20" height="110" rx="10" fill="rgba(255,255,255,0.88)"/><rect x="1028" y="384" width="20" height="110" rx="10" fill="rgba(255,255,255,0.88)"/>'
  },
  watches: {
    chip: 'Wearables',
    accentA: '#0F4A4D',
    accentB: '#16202A',
    glow: 'rgba(141, 243, 230, 0.24)',
    icon: '<rect x="822" y="300" width="164" height="164" rx="42" fill="rgba(15,23,42,0.12)" stroke="rgba(15,23,42,0.16)" stroke-width="4"/><rect x="852" y="330" width="104" height="104" rx="28" fill="rgba(255,255,255,0.94)"/><rect x="852" y="464" width="104" height="220" rx="46" fill="rgba(15,23,42,0.10)"/><rect x="852" y="104" width="104" height="196" rx="46" fill="rgba(15,23,42,0.10)"/>'
  },
  accessories: {
    chip: 'Accessories',
    accentA: '#5C492A',
    accentB: '#171A22',
    glow: 'rgba(255,255,255,0.20)',
    icon: '<circle cx="876" cy="364" r="112" fill="rgba(15,23,42,0.12)" stroke="rgba(15,23,42,0.18)" stroke-width="6"/><circle cx="876" cy="364" r="62" fill="rgba(255,255,255,0.92)"/><rect x="780" y="498" width="192" height="30" rx="15" fill="rgba(15,23,42,0.12)"/><rect x="806" y="548" width="140" height="20" rx="10" fill="rgba(15,23,42,0.08)"/>'
  },
  smartHome: {
    chip: 'Smart Home',
    accentA: '#204B63',
    accentB: '#182530',
    glow: 'rgba(155, 215, 255, 0.22)',
    icon: '<rect x="796" y="214" width="180" height="324" rx="86" fill="rgba(15,23,42,0.12)" stroke="rgba(15,23,42,0.16)" stroke-width="4"/><ellipse cx="886" cy="288" rx="82" ry="40" fill="rgba(255,255,255,0.92)"/><ellipse cx="886" cy="472" rx="62" ry="20" fill="rgba(15,23,42,0.10)"/><path d="M886 318v120" stroke="rgba(15,23,42,0.14)" stroke-width="3" stroke-dasharray="8 14"/>'
  },
};

function buildArt() {
  const art = {};
  Object.entries(CATEGORY_ART).forEach(([key, meta]) => {
    art[`category-${key}`] = writeSvg(`category-${key}.svg`, categoryCoverSvg(meta));
  });
  art['banner-hero'] = writeSvg('banner-hero.svg', bannerBackdropSvg({
    accentA: '#D6E5FF',
    accentB: '#E9EDF4',
    glow: 'rgba(170, 195, 255, 0.34)',
    device: '<rect x="1108" y="202" width="176" height="356" rx="34" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.16)" stroke-width="4"/><rect x="1128" y="226" width="136" height="296" rx="22" fill="rgba(255,255,255,0.96)"/><rect x="1258" y="256" width="116" height="228" rx="20" fill="rgba(15,23,42,0.08)"/><rect x="1280" y="278" width="72" height="144" rx="16" fill="rgba(255,255,255,0.74)"/>'
  }));
  art['banner-ecosystem'] = writeSvg('banner-ecosystem.svg', bannerBackdropSvg({
    accentA: '#E7EDF7',
    accentB: '#F6F8FB',
    glow: 'rgba(200, 211, 228, 0.22)',
    device: '<rect x="1010" y="212" width="286" height="190" rx="18" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.14)" stroke-width="4"/><rect x="1034" y="236" width="238" height="142" rx="12" fill="rgba(255,255,255,0.96)"/><path d="M972 446h362l-30 50H1002z" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.14)" stroke-width="3"/><rect x="1178" y="496" width="124" height="172" rx="24" fill="rgba(15,23,42,0.08)" stroke="rgba(15,23,42,0.12)" stroke-width="3"/><rect x="1196" y="520" width="88" height="126" rx="16" fill="rgba(255,255,255,0.92)"/>'
  }));
  art['banner-accessories'] = writeSvg('banner-accessories.svg', bannerBackdropSvg({
    accentA: '#EFE4D4',
    accentB: '#F7F4EF',
    glow: 'rgba(255, 229, 196, 0.24)',
    device: '<circle cx="1140" cy="346" r="92" fill="rgba(15,23,42,0.10)" stroke="rgba(15,23,42,0.16)" stroke-width="6"/><circle cx="1140" cy="346" r="50" fill="rgba(255,255,255,0.94)"/><rect x="1052" y="470" width="176" height="26" rx="13" fill="rgba(15,23,42,0.10)"/><rect x="1234" y="258" width="92" height="184" rx="30" fill="rgba(15,23,42,0.08)" stroke="rgba(15,23,42,0.14)" stroke-width="3"/><rect x="1252" y="282" width="56" height="138" rx="20" fill="rgba(255,255,255,0.86)"/><rect x="1090" y="536" width="120" height="18" rx="9" fill="rgba(15,23,42,0.08)"/>'
  }));
  return art;
}

const IMG = {
  iphone16promax: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
    'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603181540',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
  ]),
  iphone16pro: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
    'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603181540',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
  ]),
  iphone16: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16.jpg',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
    'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603181540',
  ]),
  iphone15: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-15.jpg',
    'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603181540',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/iphone-16-model-unselect-gallery-1-202409?wid=1200&hei=630&fmt=jpeg&qlt=95&.v=1723991997435',
  ]),
  s25ultra: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-sm-s931.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-plus-sm-s936.jpg',
  ]),
  s25: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-sm-s931.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-plus-sm-s936.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  ]),
  s25plus: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-plus-sm-s936.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-sm-s931.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  ]),
  s24fe: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s24-fe-r1.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-sm-s931.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  ]),
  pixel8pro: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
  ]),
  pixel8: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
  ]),
  pixel8a: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8a.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/google-pixel-8-pro.jpg',
  ]),
  xiaomi15ultra: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-ultra-.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t-pro.jpg',
  ]),
  xiaomi15: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-ultra-.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t-pro.jpg',
  ]),
  xiaomi14tpro: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-14t-pro.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/xiaomi-15-ultra-.jpg',
  ]),
  macbookair: unique([
    'https://www.apple.com/v/macbook-air/y/images/meta/macbook_air_mx__ez5y0k5yy7au_og.png?202603041632',
    'https://www.apple.com/v/macbook-pro/aw/images/meta/macbook-pro__difvbgz1plsi_og.png?202603041632',
  ]),
  macbookpro: unique([
    'https://www.apple.com/v/macbook-pro/aw/images/meta/macbook-pro__difvbgz1plsi_og.png?202603041632',
    'https://www.apple.com/v/macbook-air/y/images/meta/macbook_air_mx__ez5y0k5yy7au_og.png?202603041632',
  ]),
  laptopstudio: unique([
    'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=80',
  ]),
  lenovoYoga: unique([
    'https://news.lenovo.com/wp-content/uploads/2024/01/02_Yoga_Slim_7i_14_9_Luna_Grey_oled_glass_Battery.jpg',
    'https://news.lenovo.com/wp-content/uploads/2024/01/14_Yoga_9i_2-in-1_14_9_Cosmic_Blue_Tent_mode_3Q_facing_left.jpg',
    'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?auto=format&fit=crop&w=1600&q=80',
  ]),
  ipadair: unique([
    'https://www.apple.com/v/ipad-air/ah/images/meta/ipad-air_overview__bc2fd15uec0y_og.png?202603101707',
    'https://www.apple.com/v/ipad-pro/aw/images/meta/ipad-pro_overview__bu4cql27diaa_og.png?202603101707',
  ]),
  ipadpro: unique([
    'https://www.apple.com/v/ipad-pro/aw/images/meta/ipad-pro_overview__bu4cql27diaa_og.png?202603101707',
    'https://www.apple.com/v/ipad-air/ah/images/meta/ipad-air_overview__bc2fd15uec0y_og.png?202603101707',
  ]),
  ipadmini: unique([
    'https://www.apple.com/v/ipad-mini/v/images/meta/ipad-mini_overview__cxipvq7fs1ci_og.png?202603101707',
    'https://www.apple.com/v/ipad-air/ah/images/meta/ipad-air_overview__bc2fd15uec0y_og.png?202603101707',
  ]),
  tabS10Ultra: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s10-ultra.jpg',
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1600&q=80',
  ]),
  tabletAndroid: unique([
    'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1600&q=80',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-tab-s10-ultra.jpg',
  ]),
  airpodspro: unique([
    'https://www.apple.com/v/airpods-pro/r/images/meta/og__c0ceegchesom_overview.png?202603151155',
    'https://www.apple.com/v/airpods-4/g/images/meta/airpods-4__gnjh1t3yjxm6_og.png?202511192039',
  ]),
  airpods4: unique([
    'https://www.apple.com/v/airpods-4/g/images/meta/airpods-4__gnjh1t3yjxm6_og.png?202511192039',
    'https://www.apple.com/v/airpods-pro/r/images/meta/og__c0ceegchesom_overview.png?202603151155',
  ]),
  airpodsmax: unique([
    'https://www.apple.com/v/airpods-max/k/images/meta/airpods-max_overview__c2mz40a3bugm_og.png?202603151155',
    'https://www.apple.com/v/airpods-pro/r/images/meta/og__c0ceegchesom_overview.png?202603151155',
  ]),
  sonyXm5: unique([
    'https://electronics.sony.com/image/5d02da5df552836db894ecfd58414a47?fmt=png-alpha&wid=1200',
    'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=1600&q=80',
  ]),
  galaxyBuds3Pro: unique([
    'https://image-us.samsung.com/us/galaxy-buds3-pro/images/galaxy-buds3-pro-kv-headline-pc.png',
    'https://image-us.samsung.com/us/galaxy-buds3-pro/images/galaxy-buds3-pro-kv-galaxy-ai-pc.png',
    'https://images.samsung.com/is/image/samsung/assets/us/mobile-audio/galaxy-buds3-pro/galaxy_buds_3_pro_shop_app_pc.jpg',
  ]),
  nothingEar: unique([
    'https://cdn.shopify.com/s/files/1/0579/8091/1768/files/0000s_0024_Ear-black.png?v=1753686623',
    'https://cdn.shopify.com/s/files/1/0579/8091/1768/files/0000s_0023_Ear-white.png?v=1753686623',
    'https://cdn.shopify.com/s/files/1/0579/8091/1768/files/BA_360_ENTEI_030_blackBud_rgb_00_4fdaba7c-5568-4db0-aaa5-5129d524d8bd.png?v=1713169018',
  ]),
  watchApple: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/apple-watch-series10.jpg',
    'https://www.apple.com/assets-www/en_WW/watch/og/watch_og_1ff2ee953.png',
  ]),
  watchSamsung: unique([
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch7.jpg',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-watch-ultra.jpg',
  ]),
  watchGarmin: unique([
    'https://res.garmin.com/en/products/010-02905-10/v/cf-lg.jpg',
    'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=1600&q=80',
  ]),
  magsafe: unique([
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MX6X3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1729023049997',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MNWP3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1664833198734',
  ]),
  charger35w: unique([
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MNWP3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1664833198734',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MX6X3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1729023049997',
  ]),
  accessoryCable: unique([
    'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=1600&q=80',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MNWP3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1664833198734',
  ]),
  accessoryCaseApple: unique([
    'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1600&q=80',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro-max.jpg',
  ]),
  accessoryCaseSamsung: unique([
    'https://images.unsplash.com/photo-1601593346740-925612772716?auto=format&fit=crop&w=1600&q=80',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  ]),
  accessoryPower: unique([
    'https://images.unsplash.com/photo-1585338447937-7082f8fc763d?auto=format&fit=crop&w=1600&q=80',
    'https://store.storeimages.cdn-apple.com/1/as-images.apple.com/is/MNWP3?wid=1144&hei=1144&fmt=jpeg&qlt=90&.v=1664833198734',
  ]),
  accessoryGlassApple: unique([
    'https://images.unsplash.com/photo-1510552776732-01acc78fe093?auto=format&fit=crop&w=1600&q=80',
    'https://fdn2.gsmarena.com/vv/bigpic/apple-iphone-16-pro.jpg',
  ]),
  accessoryGlassSamsung: unique([
    'https://images.unsplash.com/photo-1510552776732-01acc78fe093?auto=format&fit=crop&w=1600&q=80',
    'https://fdn2.gsmarena.com/vv/bigpic/samsung-galaxy-s25-ultra-sm-s938.jpg',
  ]),
  homepod: unique([
    'https://www.apple.com/v/homepod-mini/j/images/meta/homepod-mini__bnxwvz5xrtpy_og.png?202504171218',
    'https://lh3.googleusercontent.com/JB4AqJ7DojvThh35uAFMqmBfEW3Pl1TUHe1o9JPJ-NyyjOr2SjEFkQ5QNANV1znf6Do=c0xffffff-rj',
  ]),
  nestAudio: unique([
    'https://lh3.googleusercontent.com/JB4AqJ7DojvThh35uAFMqmBfEW3Pl1TUHe1o9JPJ-NyyjOr2SjEFkQ5QNANV1znf6Do=c0xffffff-rj',
    'https://www.apple.com/v/homepod-mini/j/images/meta/homepod-mini__bnxwvz5xrtpy_og.png?202504171218',
  ]),
  airtag: unique([
    'https://www.apple.com/v/airtag/g/images/meta/og__ck3n0k1jl6j6.png?202602121113',
    'https://www.apple.com/v/iphone/home/cj/images/meta/iphone__bh930eyjnj0i_og.png?202603181540',
  ]),
  mxKeys: unique([
    'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/mx-keys-mini-3q-bottom-graphite.png',
    'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/keyboards/mx-keys-mini/gallery/mx-keys-mini-3q-bottom-pale-gray.png',
  ]),
  mxMaster: unique([
    'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-left-front-view-black-new-8.png',
    'https://resource.logitech.com/c_fill,q_auto,f_auto,dpr_1.0/d_transparent.gif/content/dam/logitech/en/products/mice/mx-master-3s/2025-update/mx-master-3s-bluetooth-edition-bottom-view-graphite-new-5.png',
  ]),
};

function p(data) {
  return {
    id: data.id,
    categoryId: data.categoryId,
    title: data.title,
    sku: data.sku,
    price: data.price,
    oldPrice: data.oldPrice || 0,
    discountPercent: data.oldPrice && data.oldPrice > data.price ? Math.round(((data.oldPrice - data.price) / data.oldPrice) * 100) : 0,
    stock: data.stock || 0,
    shortDescription: data.shortDescription,
    description: data.description,
    specs: specsToLines(data.specs || []),
    images: orderProductImages(data.images || []),
    active: true,
  };
}

function buildCategories(art) {
  const roots = [
    ['smartphones', 'Смартфоны', art['category-smartphones']],
    ['laptops', 'Ноутбуки', art['category-laptops']],
    ['tablets', 'Планшеты', art['category-tablets']],
    ['headphones', 'Наушники', art['category-headphones']],
    ['watches', 'Смарт-часы', art['category-watches']],
    ['accessories', 'Аксессуары', art['category-accessories']],
    ['smart-home', 'Умный дом', art['category-smartHome']],
  ].map(([id, title, image]) => ({ id, title, image, groupId: 'apparel' }));

  const children = [
    ['smartphones-apple', 'Apple', 'smartphones'],
    ['smartphones-samsung', 'Samsung', 'smartphones'],
    ['smartphones-google', 'Google', 'smartphones'],
    ['smartphones-xiaomi', 'Xiaomi', 'smartphones'],
    ['laptops-apple', 'Apple', 'laptops'],
    ['laptops-asus', 'ASUS', 'laptops'],
    ['laptops-lenovo', 'Lenovo', 'laptops'],
    ['laptops-dell', 'Dell', 'laptops'],
    ['tablets-apple', 'Apple', 'tablets'],
    ['tablets-samsung', 'Samsung', 'tablets'],
    ['headphones-apple', 'Apple', 'headphones'],
    ['headphones-sony', 'Sony', 'headphones'],
    ['headphones-samsung', 'Samsung', 'headphones'],
    ['headphones-nothing', 'Nothing', 'headphones'],
    ['watches-apple', 'Apple', 'watches'],
    ['watches-samsung', 'Samsung', 'watches'],
    ['watches-garmin', 'Garmin', 'watches'],
    ['accessories-cases', 'Чехлы', 'accessories'],
    ['accessories-cables', 'Кабели', 'accessories'],
    ['accessories-chargers', 'Зарядки', 'accessories'],
    ['accessories-power', 'Power Banks', 'accessories'],
    ['accessories-magsafe', 'MagSafe', 'accessories'],
    ['accessories-glass', 'Защитные стекла', 'accessories'],
    ['smart-home-speakers', 'Колонки', 'smart-home'],
    ['smart-home-trackers', 'Трекеры', 'smart-home'],
    ['smart-home-keyboards', 'Клавиатуры', 'smart-home'],
    ['smart-home-mice', 'Мыши', 'smart-home'],
  ].map(([id, title, parentId]) => ({ id, title, image: '', groupId: 'apparel', parentId }));

  return [...roots, ...children];
}

function buildProducts() {
  return [
    p({ id:'iphone-16-pro-max-256', categoryId:'smartphones-apple', title:'iPhone 16 Pro Max 256GB', sku:'APL-IP16PM-256', price:164990, oldPrice:179990, stock:6, images:IMG.iphone16promax, shortDescription:'Флагман Apple с большим экраном, титановым корпусом и камерой уровня Pro.', description:'Смартфон для тех, кто хочет максимальный экран, премиальные материалы и уверенную производительность для фото, видео и повседневной работы.', specs:[{label:'Экран',value:'6.9" Super Retina XDR'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'A18 Pro'},{label:'Камера',value:'48 Мп Pro + 5x Tele'},{label:'Цвет',value:'Natural Titanium'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'iphone-16-pro-128', categoryId:'smartphones-apple', title:'iPhone 16 Pro 128GB', sku:'APL-IP16P-128', price:139990, oldPrice:149990, stock:8, images:IMG.iphone16pro, shortDescription:'Компактный Pro-флагман с акцентом на камеру и мобильную съемку.', description:'Премиальный iPhone для тех, кому важен баланс размера, производительности и возможностей камеры без перехода на Max-формат.', specs:[{label:'Экран',value:'6.3" Super Retina XDR'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'A18 Pro'},{label:'Камера',value:'48 Мп Pro System'},{label:'Цвет',value:'Black Titanium'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'iphone-16-128', categoryId:'smartphones-apple', title:'iPhone 16 128GB', sku:'APL-IP16-128', price:99990, stock:11, images:IMG.iphone16, shortDescription:'Актуальный iPhone на каждый день с новой платформой и ярким OLED-дисплеем.', description:'Современный iPhone для экосистемы Apple: удобный размер, мощная камера, долгосрочная поддержка и привычный premium-опыт.', specs:[{label:'Экран',value:'6.1" OLED'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'A18'},{label:'Камера',value:'48 Мп'},{label:'Цвет',value:'Ultramarine'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'iphone-15-128', categoryId:'smartphones-apple', title:'iPhone 15 128GB', sku:'APL-IP15-128', price:79990, oldPrice:86990, stock:10, images:IMG.iphone15, shortDescription:'Популярный iPhone с Dynamic Island и сильной камерой.', description:'Один из лучших вариантов для старта в экосистеме Apple: качественный экран, отличная камера и комфортный premium-дизайн.', specs:[{label:'Экран',value:'6.1" Super Retina XDR'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'A16 Bionic'},{label:'Камера',value:'48 Мп'},{label:'Цвет',value:'Pink'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'galaxy-s25-ultra-256', categoryId:'smartphones-samsung', title:'Samsung Galaxy S25 Ultra 256GB', sku:'SMS-S25U-256', price:149990, oldPrice:164990, stock:4, images:IMG.s25ultra, shortDescription:'Флагман Samsung с 200 Мп камерой, S Pen и большим AMOLED-экраном.', description:'Флагман для тех, кто хочет максимум: камера уровня Ultra, большой дисплей, премиальный корпус и уверенная работа с контентом, заметками и бизнес-задачами.', specs:[{label:'Экран',value:'6.9" Dynamic AMOLED 2X'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Snapdragon 8 Elite'},{label:'Камера',value:'200 Мп + 5x Zoom'},{label:'Цвет',value:'Titanium Gray'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-s25-256', categoryId:'smartphones-samsung', title:'Samsung Galaxy S25 256GB', sku:'SMS-S25-256', price:99990, stock:9, images:IMG.s25, shortDescription:'Компактный Android-флагман Samsung с топовой платформой.', description:'Сбалансированный премиальный смартфон для ежедневного использования: яркий AMOLED-экран, мощная камера и удобный компактный формат.', specs:[{label:'Экран',value:'6.2" Dynamic AMOLED 2X'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Snapdragon 8 Elite'},{label:'Камера',value:'50 Мп'},{label:'Цвет',value:'Icy Blue'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-s25-plus-256', categoryId:'smartphones-samsung', title:'Samsung Galaxy S25+ 256GB', sku:'SMS-S25P-256', price:112990, stock:7, images:IMG.s25plus, shortDescription:'Увеличенный Galaxy с большим экраном и флагманской производительностью.', description:'Версия для тех, кому нужен более крупный дисплей и аккумулятор, но без перехода на Ultra. Подходит для работы, мультимедиа и путешествий.', specs:[{label:'Экран',value:'6.7" Dynamic AMOLED 2X'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Snapdragon 8 Elite'},{label:'Камера',value:'50 Мп'},{label:'Цвет',value:'Navy'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-s24-fe-256', categoryId:'smartphones-samsung', title:'Samsung Galaxy S24 FE 256GB', sku:'SMS-S24FE-256', price:62990, stock:12, images:IMG.s24fe, shortDescription:'Сбалансированный FE-флагман для экосистемы Samsung.', description:'Модель с premium-характером и более доступной ценой: яркий экран, хорошая камера и комфортная производительность на каждый день.', specs:[{label:'Экран',value:'6.7" AMOLED 120 Гц'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Exynos 2400e'},{label:'Камера',value:'50 Мп'},{label:'Цвет',value:'Graphite'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'pixel-8-pro-256', categoryId:'smartphones-google', title:'Google Pixel 8 Pro 256GB', sku:'GGL-PX8P-256', price:104990, oldPrice:112990, stock:5, images:IMG.pixel8pro, shortDescription:'Pixel с акцентом на вычислительную фотографию и чистый Android.', description:'Флагман Google для тех, кто ценит камеру, AI-функции и быстрые обновления системы без лишних надстроек.', specs:[{label:'Экран',value:'6.7" LTPO OLED'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Google Tensor G3'},{label:'Камера',value:'50 Мп + 5x Zoom'},{label:'Цвет',value:'Porcelain'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'pixel-8-128', categoryId:'smartphones-google', title:'Google Pixel 8 128GB', sku:'GGL-PX8-128', price:76990, stock:8, images:IMG.pixel8, shortDescription:'Чистый Android и фирменная камера Pixel в компактном корпусе.', description:'Смартфон для тех, кому нужен удобный размер, минималистичная Android-платформа и сильная камера без перегруза интерфейса.', specs:[{label:'Экран',value:'6.2" OLED'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'Google Tensor G3'},{label:'Камера',value:'50 Мп'},{label:'Цвет',value:'Obsidian'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'pixel-8a-128', categoryId:'smartphones-google', title:'Google Pixel 8a 128GB', sku:'GGL-PX8A-128', price:54990, stock:10, images:IMG.pixel8a, shortDescription:'Легкий вход в экосистему Pixel с premium-опытом и камерой Google.', description:'Модель для тех, кто хочет фирменный Pixel-опыт, аккуратный дизайн и сильную камеру по более доступной цене.', specs:[{label:'Экран',value:'6.1" OLED 120 Гц'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'Google Tensor G3'},{label:'Камера',value:'64 Мп'},{label:'Цвет',value:'Bay'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'xiaomi-15-ultra-512', categoryId:'smartphones-xiaomi', title:'Xiaomi 15 Ultra 512GB', sku:'XMI-15U-512', price:129990, oldPrice:139990, stock:5, images:IMG.xiaomi15ultra, shortDescription:'Фотофлагман Xiaomi с Leica-оптикой и топовой платформой.', description:'Премиальный Android-смартфон с акцентом на мобильную фотографию, производительность и быструю зарядку для тех, кто ищет альтернативу классическим флагманам.', specs:[{label:'Экран',value:'6.73" AMOLED 120 Гц'},{label:'Память',value:'512 ГБ'},{label:'Процессор',value:'Snapdragon 8 Elite'},{label:'Камера',value:'Leica Quad Camera'},{label:'Цвет',value:'Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'xiaomi-15-256', categoryId:'smartphones-xiaomi', title:'Xiaomi 15 256GB', sku:'XMI-15-256', price:89990, stock:9, images:IMG.xiaomi15, shortDescription:'Компактный флагман Xiaomi с премиальным экраном и камерой Leica.', description:'Сильный повседневный Android-флагман в компактном формате: яркий дисплей, быстрый чип и уверенная камера.', specs:[{label:'Экран',value:'6.36" AMOLED 120 Гц'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Snapdragon 8 Elite'},{label:'Камера',value:'50 Мп Leica'},{label:'Цвет',value:'Silver'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'xiaomi-14t-pro-512', categoryId:'smartphones-xiaomi', title:'Xiaomi 14T Pro 512GB', sku:'XMI-14TP-512', price:69990, stock:11, images:IMG.xiaomi14tpro, shortDescription:'Мощный Android-смартфон с быстрым экраном и зарядкой.', description:'Устройство для тех, кто хочет максимум технологий и яркий премиальный вид без переплаты за сверхдорогие флагманы.', specs:[{label:'Экран',value:'6.67" AMOLED 144 Гц'},{label:'Память',value:'512 ГБ'},{label:'Процессор',value:'Dimensity 9300+'},{label:'Камера',value:'50 Мп'},{label:'Цвет',value:'Titan Gray'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'macbook-air-13-m3-16-512', categoryId:'laptops-apple', title:'MacBook Air 13 M3 16GB / 512GB', sku:'APL-MBA13M3-16512', price:159990, oldPrice:173990, stock:6, images:IMG.macbookair, shortDescription:'Тонкий ноутбук Apple для работы, поездок и повседневной продуктивности.', description:'Легкий, тихий и быстрый ноутбук с большим запасом автономности. Подходит для офиса, учебы, творчества и комфортной повседневной работы.', specs:[{label:'Экран',value:'13.6" Liquid Retina'},{label:'Память',value:'16 ГБ / 512 ГБ'},{label:'Процессор',value:'Apple M3'},{label:'Автономность',value:'до 18 часов'},{label:'Цвет',value:'Starlight'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'macbook-air-15-m3-16-512', categoryId:'laptops-apple', title:'MacBook Air 15 M3 16GB / 512GB', sku:'APL-MBA15M3-16512', price:184990, stock:5, images:IMG.macbookair, shortDescription:'MacBook Air с большим экраном для тех, кому важен комфорт рабочего пространства.', description:'Универсальный ноутбук Apple с более крупным дисплеем: удобно работать с документами, презентациями, таблицами и мультимедиа.', specs:[{label:'Экран',value:'15.3" Liquid Retina'},{label:'Память',value:'16 ГБ / 512 ГБ'},{label:'Процессор',value:'Apple M3'},{label:'Автономность',value:'до 18 часов'},{label:'Цвет',value:'Midnight'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'macbook-pro-14-m4-16-512', categoryId:'laptops-apple', title:'MacBook Pro 14 M4 16GB / 512GB', sku:'APL-MBP14M4-16512', price:229990, stock:4, images:IMG.macbookpro, shortDescription:'Профессиональный ноутбук Apple для креатива, разработки и продакшна.', description:'Модель с Liquid Retina XDR, широким набором портов и высокой производительностью для тех, кто работает с фото, видео и сложными проектами.', specs:[{label:'Экран',value:'14.2" Liquid Retina XDR'},{label:'Память',value:'16 ГБ / 512 ГБ'},{label:'Процессор',value:'Apple M4'},{label:'Порты',value:'Thunderbolt / HDMI / SDXC'},{label:'Цвет',value:'Space Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'macbook-pro-16-m4-pro-24-512', categoryId:'laptops-apple', title:'MacBook Pro 16 M4 Pro 24GB / 512GB', sku:'APL-MBP16M4P-24512', price:319990, stock:2, images:IMG.macbookpro, shortDescription:'Флагманский MacBook Pro для тяжелых профессиональных сценариев.', description:'Подходит для продакшна, монтажа, дизайна и долгой работы без компромиссов по экрану, мощности и автономности.', specs:[{label:'Экран',value:'16.2" Liquid Retina XDR'},{label:'Память',value:'24 ГБ / 512 ГБ'},{label:'Процессор',value:'Apple M4 Pro'},{label:'Автономность',value:'до 22 часов'},{label:'Цвет',value:'Silver'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'asus-zenbook-s16-oled', categoryId:'laptops-asus', title:'ASUS Zenbook S16 OLED', sku:'ASS-ZBS16-AI9', price:189990, stock:4, images:IMG.laptopstudio, shortDescription:'Премиальный Windows-ультрабук с большим OLED-экраном.', description:'Современный ноутбук для тех, кто хочет легкий premium-form factor, большой экран и производительность для работы, контента и поездок.', specs:[{label:'Экран',value:'16" OLED 3K'},{label:'Память',value:'32 ГБ / 1 ТБ'},{label:'Процессор',value:'Ryzen AI 9'},{label:'Вес',value:'около 1.5 кг'},{label:'Цвет',value:'Zumaia Gray'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'lenovo-yoga-pro-7i-14', categoryId:'laptops-lenovo', title:'Lenovo Yoga Pro 7i 14 OLED', sku:'LNV-YP7I-14', price:149990, stock:6, images:IMG.lenovoYoga, shortDescription:'Тонкий ноутбук для офиса, креатива и мобильной работы.', description:'Премиальная Windows-модель для тех, кому важен качественный экран, современный корпус и уверенная производительность без перегруза дизайна.', specs:[{label:'Экран',value:'14.5" OLED'},{label:'Память',value:'32 ГБ / 1 ТБ'},{label:'Процессор',value:'Intel Core Ultra 7'},{label:'Графика',value:'RTX 4050'},{label:'Цвет',value:'Tidal Teal'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'dell-xps-14-oled', categoryId:'laptops-dell', title:'Dell XPS 14 OLED', sku:'DLL-XPS14-OLED', price:214990, stock:3, images:IMG.laptopstudio, shortDescription:'Строгий премиальный ноутбук с OLED-экраном и минималистичным дизайном.', description:'Модель для тех, кто ищет бизнес-премиум сегмент: точный экран, аккуратный металлический корпус и запас мощности для серьезной работы.', specs:[{label:'Экран',value:'14.5" OLED 3.2K'},{label:'Память',value:'32 ГБ / 1 ТБ'},{label:'Процессор',value:'Intel Core Ultra 7'},{label:'Графика',value:'RTX 4050'},{label:'Цвет',value:'Graphite'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'ipad-air-11-m2-128', categoryId:'tablets-apple', title:'iPad Air 11 M2 128GB', sku:'APL-IPDA11M2-128', price:79990, oldPrice:87990, stock:7, images:IMG.ipadair, shortDescription:'Легкий iPad для работы, учебы, заметок и мультимедиа.', description:'Универсальный планшет Apple с поддержкой аксессуаров и чипом M2 — удобное решение для офиса, творчества и повседневной мобильности.', specs:[{label:'Экран',value:'11" Liquid Retina'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'Apple M2'},{label:'Связь',value:'Wi‑Fi'},{label:'Цвет',value:'Blue'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'ipad-pro-13-m4-256', categoryId:'tablets-apple', title:'iPad Pro 13 M4 256GB', sku:'APL-IPDP13M4-256', price:149990, stock:4, images:IMG.ipadpro, shortDescription:'Флагманский iPad Pro с OLED-экраном и высокой производительностью.', description:'Планшет для дизайнеров, продакшна, заметок и мультимедиа — максимально премиальный сценарий в экосистеме Apple.', specs:[{label:'Экран',value:'13" Ultra Retina XDR'},{label:'Память',value:'256 ГБ'},{label:'Процессор',value:'Apple M4'},{label:'Связь',value:'Wi‑Fi'},{label:'Цвет',value:'Space Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'ipad-mini-a17pro-128', categoryId:'tablets-apple', title:'iPad mini A17 Pro 128GB', sku:'APL-IPDMINI-A17-128', price:69990, stock:6, images:IMG.ipadmini, shortDescription:'Компактный iPad для путешествий, чтения и заметок.', description:'Миниатюрный, но мощный планшет Apple — идеален для тех, кто хочет настоящий мобильный форм-фактор без потери производительности.', specs:[{label:'Экран',value:'8.3" Liquid Retina'},{label:'Память',value:'128 ГБ'},{label:'Процессор',value:'A17 Pro'},{label:'Связь',value:'Wi‑Fi'},{label:'Цвет',value:'Purple'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-tab-s10-ultra-256', categoryId:'tablets-samsung', title:'Samsung Galaxy Tab S10 Ultra 256GB', sku:'SMS-TABS10U-256', price:129990, stock:3, images:IMG.tabS10Ultra, shortDescription:'Большой Android-планшет премиум-класса с AMOLED-экраном и S Pen.', description:'Флагманский планшет Samsung для презентаций, многозадачности, развлечений и работы с контентом на большом экране.', specs:[{label:'Экран',value:'14.6" Dynamic AMOLED 2X'},{label:'Память',value:'256 ГБ'},{label:'Перо',value:'S Pen в комплекте'},{label:'Связь',value:'Wi‑Fi'},{label:'Цвет',value:'Moonstone Gray'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-tab-s9-fe-128', categoryId:'tablets-samsung', title:'Samsung Galaxy Tab S9 FE 128GB', sku:'SMS-TABS9FE-128', price:52990, stock:8, images:IMG.tabletAndroid, shortDescription:'Удобный планшет Samsung для учебы, заметок и мультимедиа.', description:'Универсальный Android-планшет со стилусом и современным дизайном для тех, кто ищет доступный, но качественный premium-lite опыт.', specs:[{label:'Экран',value:'10.9" LCD 90 Гц'},{label:'Память',value:'128 ГБ'},{label:'Перо',value:'S Pen в комплекте'},{label:'Связь',value:'Wi‑Fi'},{label:'Цвет',value:'Silver'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'airpods-pro-2-usbc', categoryId:'headphones-apple', title:'AirPods Pro 2 USB-C', sku:'APL-AIRPODS-PRO2', price:24990, oldPrice:27990, stock:14, images:IMG.airpodspro, shortDescription:'Шумоподавление, прозрачный режим и лучший сценарий для iPhone.', description:'Флагманские TWS-наушники Apple для тех, кто хочет seamless-опыт внутри экосистемы и качественное шумоподавление.', specs:[{label:'Тип',value:'TWS'},{label:'Шумоподавление',value:'Активное ANC'},{label:'Кейс',value:'USB-C'},{label:'Время работы',value:'до 30 ч с кейсом'},{label:'Цвет',value:'White'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'airpods-4-anc', categoryId:'headphones-apple', title:'AirPods 4 ANC', sku:'APL-AIRPODS4-ANC', price:19990, stock:11, images:IMG.airpods4, shortDescription:'Новые AirPods с шумоподавлением и обновленной посадкой.', description:'Легкие наушники Apple для повседневных звонков, музыки и работы с экосистемой без лишнего веса и сложного сценария использования.', specs:[{label:'Тип',value:'TWS'},{label:'Шумоподавление',value:'Есть'},{label:'Кейс',value:'USB-C'},{label:'Время работы',value:'до 30 ч с кейсом'},{label:'Цвет',value:'White'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'airpods-max-usbc', categoryId:'headphones-apple', title:'AirPods Max USB-C', sku:'APL-AIRPODSMAX', price:64990, stock:5, images:IMG.airpodsmax, shortDescription:'Премиальные полноразмерные наушники Apple для музыки и мультимедиа.', description:'Флагманская модель Apple в формате over-ear для тех, кому важны материал, комфорт посадки и визуально дорогой продукт.', specs:[{label:'Тип',value:'Полноразмерные Bluetooth'},{label:'Шумоподавление',value:'Активное ANC'},{label:'Связь',value:'Bluetooth'},{label:'Время работы',value:'до 20 ч'},{label:'Цвет',value:'Midnight'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'sony-wh-1000xm5', categoryId:'headphones-sony', title:'Sony WH-1000XM5', sku:'SNY-XM5-BLK', price:34990, stock:8, images:IMG.sonyXm5, shortDescription:'Одна из лучших моделей ANC-наушников в премиум-сегменте.', description:'Комфортные полноразмерные наушники Sony для музыки, работы, поездок и звонков с сильным шумоподавлением.', specs:[{label:'Тип',value:'Полноразмерные Bluetooth'},{label:'Шумоподавление',value:'Активное ANC'},{label:'Связь',value:'Bluetooth 5.2'},{label:'Время работы',value:'до 30 ч'},{label:'Цвет',value:'Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-buds3-pro', categoryId:'headphones-samsung', title:'Samsung Galaxy Buds3 Pro', sku:'SMS-BUDS3PRO', price:21990, stock:9, images:IMG.galaxyBuds3Pro, shortDescription:'TWS-флагман Samsung с ANC и акцентом на Galaxy-экосистему.', description:'Наушники для пользователей Samsung, которые хотят современный дизайн, ANC и плотную интеграцию со смартфоном и часами Galaxy.', specs:[{label:'Тип',value:'TWS'},{label:'Шумоподавление',value:'Активное ANC'},{label:'Связь',value:'Bluetooth'},{label:'Время работы',value:'до 30 ч с кейсом'},{label:'Цвет',value:'Silver'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'nothing-ear-black', categoryId:'headphones-nothing', title:'Nothing Ear', sku:'NTG-EAR-BLK', price:15990, stock:10, images:IMG.nothingEar, shortDescription:'Стильные TWS-наушники с прозрачным дизайном и хорошим звуком.', description:'Удачный выбор для тех, кому важен свежий дизайн, удобное приложение и современная подача аксессуара в премиальной витрине.', specs:[{label:'Тип',value:'TWS'},{label:'Шумоподавление',value:'Активное ANC'},{label:'Связь',value:'Bluetooth'},{label:'Время работы',value:'до 40.5 ч с кейсом'},{label:'Цвет',value:'Black'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'apple-watch-series-10-46', categoryId:'watches-apple', title:'Apple Watch Series 10 46mm', sku:'APL-WATCH10-46', price:49990, stock:8, images:IMG.watchApple, shortDescription:'Смарт-часы Apple для здоровья, спорта и уведомлений.', description:'Универсальная модель Apple Watch для повседневного использования: тренировки, уведомления, звонки и контроль активности в премиальном форм-факторе.', specs:[{label:'Корпус',value:'46 мм, алюминий'},{label:'Экран',value:'Always-On Retina'},{label:'Связь',value:'Bluetooth / Wi‑Fi / GPS'},{label:'Автономность',value:'до 18 часов'},{label:'Цвет',value:'Jet Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'apple-watch-ultra-2', categoryId:'watches-apple', title:'Apple Watch Ultra 2', sku:'APL-WULTRA2', price:89990, stock:4, images:IMG.watchApple, shortDescription:'Флагманские часы Apple для спорта, путешествий и outdoor-сценариев.', description:'Модель для тех, кто хочет получить премиальный outdoor-продукт с экосистемой Apple, высоким запасом автономности и прочным корпусом.', specs:[{label:'Корпус',value:'49 мм, титан'},{label:'Экран',value:'Always-On Retina'},{label:'Связь',value:'Bluetooth / Wi‑Fi / GPS'},{label:'Автономность',value:'до 36 часов'},{label:'Цвет',value:'Natural Titanium'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-watch7-44', categoryId:'watches-samsung', title:'Samsung Galaxy Watch7 44mm', sku:'SMS-WATCH7-44', price:29990, stock:9, images:IMG.watchSamsung, shortDescription:'Умные часы Samsung для экосистемы Galaxy и спорта.', description:'Легкая модель Galaxy Watch для ежедневных уведомлений, фитнеса и базового health-tracking в премиальном сегменте Android.', specs:[{label:'Корпус',value:'44 мм, алюминий'},{label:'Экран',value:'AMOLED'},{label:'Связь',value:'Bluetooth / Wi‑Fi / GPS'},{label:'Автономность',value:'до 40 часов'},{label:'Цвет',value:'Green'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'galaxy-watch-ultra', categoryId:'watches-samsung', title:'Samsung Galaxy Watch Ultra', sku:'SMS-WULTRA', price:55990, stock:5, images:IMG.watchSamsung, shortDescription:'Флагманские Samsung-часы для активного спорта и outdoor-режима.', description:'Прочная премиальная модель Galaxy Watch для активных сценариев, тренировок, навигации и плотной связи с экосистемой Samsung.', specs:[{label:'Корпус',value:'47 мм, титан'},{label:'Экран',value:'AMOLED'},{label:'Связь',value:'Bluetooth / Wi‑Fi / GPS'},{label:'Автономность',value:'до 60 часов'},{label:'Цвет',value:'Titanium Silver'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'garmin-fenix-8-amoled', categoryId:'watches-garmin', title:'Garmin Fenix 8 AMOLED', sku:'GRM-FENIX8-AMOLED', price:109990, stock:3, images:IMG.watchGarmin, shortDescription:'Премиальные outdoor-часы с навигацией и спортивной аналитикой.', description:'Флагман Garmin для бега, триатлона, походов и путешествий — надежный outdoor-инструмент с premium-подачей в каталоге.', specs:[{label:'Корпус',value:'47 мм'},{label:'Экран',value:'AMOLED'},{label:'Навигация',value:'Multi-band GPS'},{label:'Автономность',value:'до 16 дней'},{label:'Цвет',value:'Slate Gray'},{label:'Гарантия',value:'12 месяцев'}] }),

    p({ id:'magsafe-charger-2m', categoryId:'accessories-magsafe', title:'MagSafe Charger 2m', sku:'ACC-MAGSAFE-2M', price:6990, oldPrice:7990, stock:18, images:IMG.magsafe, shortDescription:'Магнитная зарядка для iPhone и AirPods с удобной длиной кабеля.', description:'Минималистичный аксессуар для экосистемы Apple, который хорошо смотрится в премиальной витрине и закрывает ежедневный сценарий зарядки.', specs:[{label:'Тип',value:'Беспроводная зарядка'},{label:'Совместимость',value:'iPhone / AirPods'},{label:'Кабель',value:'2 м, USB‑C'},{label:'Мощность',value:'до 25 Вт'},{label:'Цвет',value:'White'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'dual-usbc-35w-adapter', categoryId:'accessories-chargers', title:'Dual USB-C Power Adapter 35W', sku:'ACC-USB35W-DUAL', price:7990, stock:15, images:IMG.charger35w, shortDescription:'Компактный адаптер с двумя USB-C для смартфона, планшета и наушников.', description:'Удобный сетевой блок для экосистемы Apple и других современных устройств — лаконичный и премиальный по подаче аксессуар.', specs:[{label:'Тип',value:'Сетевой адаптер'},{label:'Порты',value:'2 x USB-C'},{label:'Мощность',value:'35 Вт'},{label:'Цвет',value:'White'},{label:'Форм-фактор',value:'Компактный'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'usbc-cable-2m-braided', categoryId:'accessories-cables', title:'USB-C Cable 2m Braided', sku:'ACC-USBC-2M-BR', price:2990, stock:24, images:IMG.accessoryCable, shortDescription:'Плетеный кабель USB-C для быстрой зарядки и ноутбуков.', description:'Практичный аксессуар для работы дома, в офисе и в поездке — рассчитан на смартфоны, планшеты, ноутбуки и power-delivery сценарии.', specs:[{label:'Тип',value:'USB‑C / USB‑C'},{label:'Длина',value:'2 м'},{label:'Оплетка',value:'Плетеная'},{label:'Мощность',value:'до 240 Вт'},{label:'Цвет',value:'Space Gray'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'iphone-16-pro-max-case', categoryId:'accessories-cases', title:'Silicone Case for iPhone 16 Pro Max', sku:'ACC-IP16PM-CASE', price:4990, stock:16, images:IMG.accessoryCaseApple, shortDescription:'Тонкий защитный чехол с мягкой подкладкой и поддержкой MagSafe.', description:'Аккуратный аксессуар для премиальной витрины: защищает смартфон, сохраняет комфорт хвата и поддерживает ежедневный MagSafe-сценарий.', specs:[{label:'Совместимость',value:'iPhone 16 Pro Max'},{label:'Материал',value:'Силикон + microfiber'},{label:'Поддержка',value:'MagSafe'},{label:'Цвет',value:'Stone Gray'},{label:'Форм-фактор',value:'Slim fit'},{label:'Гарантия',value:'6 месяцев'}] }),
    p({ id:'galaxy-s25-ultra-case', categoryId:'accessories-cases', title:'Protective Case for Galaxy S25 Ultra', sku:'ACC-S25U-CASE', price:3990, stock:15, images:IMG.accessoryCaseSamsung, shortDescription:'Матовый защитный чехол для флагмана Samsung.', description:'Практичное решение для ежедневной защиты флагманского Galaxy с аккуратным внешним видом и slim-профилем.', specs:[{label:'Совместимость',value:'Galaxy S25 Ultra'},{label:'Материал',value:'TPU + поликарбонат'},{label:'Особенность',value:'Усиленные углы'},{label:'Цвет',value:'Midnight Blue'},{label:'Форм-фактор',value:'Slim armor'},{label:'Гарантия',value:'6 месяцев'}] }),
    p({ id:'power-bank-20000-65w', categoryId:'accessories-power', title:'Power Bank 20000 mAh 65W', sku:'ACC-PB20K-65W', price:8990, oldPrice:10490, stock:12, images:IMG.accessoryPower, shortDescription:'Быстрый power bank для смартфонов, планшетов и ноутбуков.', description:'Универсальный аксессуар для поездок и мобильной работы — мощный, емкий и удобный для техники с USB-C Power Delivery.', specs:[{label:'Емкость',value:'20000 мА·ч'},{label:'Мощность',value:'до 65 Вт'},{label:'Порты',value:'USB-C + USB-A'},{label:'Поддержка',value:'PD / QC'},{label:'Цвет',value:'Black'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'glass-iphone-16-pro', categoryId:'accessories-glass', title:'Tempered Glass for iPhone 16 Pro', sku:'ACC-IP16P-GLASS', price:1990, stock:22, images:IMG.accessoryGlassApple, shortDescription:'Защитное стекло с прозрачным покрытием и ровной геометрией.', description:'Базовый, но важный аксессуар для витрины premium-retail: аккуратная защита экрана без лишней толщины и визуального шума.', specs:[{label:'Совместимость',value:'iPhone 16 Pro'},{label:'Твердость',value:'9H'},{label:'Покрытие',value:'Олеофобное'},{label:'Толщина',value:'0.33 мм'},{label:'Комплект',value:'1 стекло + салфетки'},{label:'Гарантия',value:'14 дней'}] }),
    p({ id:'glass-galaxy-s25-ultra', categoryId:'accessories-glass', title:'Tempered Glass for Galaxy S25 Ultra', sku:'ACC-S25U-GLASS', price:2190, stock:19, images:IMG.accessoryGlassSamsung, shortDescription:'Прочное защитное стекло для изогнутого флагманского дисплея Samsung.', description:'Аксессуар для клиентов, которым важна защита экрана без потери яркости, четкости и ощущений от премиального смартфона.', specs:[{label:'Совместимость',value:'Galaxy S25 Ultra'},{label:'Твердость',value:'9H'},{label:'Покрытие',value:'Олеофобное'},{label:'Толщина',value:'0.33 мм'},{label:'Комплект',value:'1 стекло + салфетки'},{label:'Гарантия',value:'14 дней'}] }),

    p({ id:'homepod-mini', categoryId:'smart-home-speakers', title:'HomePod mini', sku:'APL-HPMINI', price:14990, oldPrice:16990, stock:9, images:IMG.homepod, shortDescription:'Компактная умная колонка Apple для музыки и сценариев умного дома.', description:'Колонка для тех, кому важны экосистема Apple, аккуратный внешний вид и голосовое управление в домашнем пространстве.', specs:[{label:'Тип',value:'Умная колонка'},{label:'Связь',value:'Wi‑Fi / Bluetooth'},{label:'Ассистент',value:'Siri'},{label:'Цвет',value:'Midnight'},{label:'Питание',value:'Сеть'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'google-nest-audio', categoryId:'smart-home-speakers', title:'Google Nest Audio', sku:'GGL-NEST-AUDIO', price:12990, stock:8, images:IMG.nestAudio, shortDescription:'Умная колонка Google с акцентом на голосовое управление и музыку.', description:'Подойдет для кухни, спальни или рабочего места — хороший старт для Android-экосистемы и базового smart-home сценария.', specs:[{label:'Тип',value:'Умная колонка'},{label:'Связь',value:'Wi‑Fi / Bluetooth'},{label:'Ассистент',value:'Google Assistant'},{label:'Цвет',value:'Chalk'},{label:'Питание',value:'Сеть'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'airtag-4-pack', categoryId:'smart-home-trackers', title:'AirTag 4 Pack', sku:'APL-AIRTAG-4', price:13990, stock:13, images:IMG.airtag, shortDescription:'Комплект трекеров Apple для ключей, рюкзака и багажа.', description:'Удобный аксессуар для повседневной жизни и путешествий: поиск вещей через сеть Find My и интеграция с iPhone.', specs:[{label:'Тип',value:'Bluetooth-трекер'},{label:'Комплект',value:'4 шт.'},{label:'Совместимость',value:'Apple Find My'},{label:'Питание',value:'CR2032'},{label:'Цвет',value:'White'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'mx-keys-mini', categoryId:'smart-home-keyboards', title:'Logitech MX Keys Mini', sku:'LOG-MXKEYSMINI', price:12990, stock:7, images:IMG.mxKeys, shortDescription:'Компактная клавиатура для Mac, Windows и многоплатформенной работы.', description:'Премиальный аксессуар для рабочего места: тихий ход клавиш, приятная подсветка и уверенный сценарий для офиса и дома.', specs:[{label:'Тип',value:'Беспроводная клавиатура'},{label:'Подключение',value:'Bluetooth / Logi Bolt'},{label:'Совместимость',value:'macOS / Windows / iPadOS'},{label:'Подсветка',value:'Есть'},{label:'Цвет',value:'Graphite'},{label:'Гарантия',value:'12 месяцев'}] }),
    p({ id:'mx-master-3s', categoryId:'smart-home-mice', title:'Logitech MX Master 3S', sku:'LOG-MXMASTER3S', price:10990, stock:9, images:IMG.mxMaster, shortDescription:'Премиальная мышь для офиса, монтажа, дизайна и многозадачности.', description:'Одна из самых популярных мышей для продуктивной работы: тихие клики, точный сенсор и удобная форма для долгих рабочих сессий.', specs:[{label:'Тип',value:'Беспроводная мышь'},{label:'Подключение',value:'Bluetooth / Logi Bolt'},{label:'Сенсор',value:'8000 DPI'},{label:'Особенность',value:'Тихие клики'},{label:'Цвет',value:'Graphite'},{label:'Гарантия',value:'12 месяцев'}] }),
  ];
}

function buildConfig(currentConfig, art) {
  return {
    ...currentConfig,
    companyName: 'AETHER Store',
    companyPhone: '+7 (495) 215-42-18',
    companyEmail: 'hello@aether-store.demo',
    companyAddress: 'Москва, Петровка, 11',
    theme: 'white',
    accent: 'blue',
    privacyPolicyConsentText: 'Я ознакомлен(а) с Политикой конфиденциальности и условиями магазина',
    privacyPolicyTitle: 'Политика конфиденциальности и условия магазина',
    privacyPolicyText: 'Настоящий документ применяется к магазину AETHER Store. Оформляя заказ, покупатель подтверждает корректность введенных данных, дает согласие на обработку персональных данных для связи по заказу, доставки, оплаты и постпродажного сопровождения. Данные используются только для обслуживания заказа и не передаются в собственных маркетинговых целях магазина без отдельного согласия.',
    privacyPolicyUrl: '',
    storeLocations: [
      { id: 'msk-petrovka', city: 'Москва', address: 'Петровка, 11' },
      { id: 'spb-nevsky', city: 'Санкт-Петербург', address: 'Невский проспект, 36' },
      { id: 'kzn-bauman', city: 'Казань', address: 'ул. Баумана, 54' },
    ],
    homeBanners: [
      {
        id: 'hero-apple-premium',
        image: art['banner-hero'],
        kicker: 'Premium selection',
        title: 'Флагманская техника. Чистая подача.',
        text: 'iPhone, MacBook, Galaxy, Pixel и топовые аксессуары в аккуратной витрине без визуального шума.',
        cta: 'Открыть каталог',
      },
      {
        id: 'hero-ecosystem',
        image: art['banner-ecosystem'],
        kicker: 'Work & create',
        title: 'MacBook, iPad и устройства для продуктивности',
        text: 'Ноутбуки, планшеты и аксессуары для работы, обучения и повседневного использования в одном премиальном каталоге.',
        cta: 'Смотреть новинки',
      },
      {
        id: 'hero-accessories',
        image: art['banner-accessories'],
        kicker: 'Accessories & audio',
        title: 'Наушники, зарядки, кейсы и smart-аксессуары',
        text: 'Полноценный ассортимент дополнений к экосистеме: от AirPods и MagSafe до power bank и smart-устройств.',
        cta: 'Смотреть аксессуары',
      },
    ],
    promoCatalog: {
      title: 'Спецпредложения',
      image: art['banner-accessories'],
    },
    aboutText: '<div class="about-sections"><div class="about-section"><div class="about-heading">AETHER Store</div><div class="about-lead">Премиальный магазин техники с акцентом на Apple-экосистему, флагманские Android-смартфоны, аудио, smart-аксессуары и рабочие устройства для офиса и дома.</div><div class="about-lead">Витрина собрана в clean retail-подаче: спокойная главная страница, крупные категории, качественные карточки и аккуратный checkout без лишнего шума.</div></div><div class="about-section"><div class="about-heading">Что есть в магазине</div><ul class="about-list"><li>Смартфоны Apple, Samsung, Google и Xiaomi.</li><li>MacBook, премиальные ноутбуки и планшеты.</li><li>Наушники, смарт-часы и аксессуары.</li><li>Раздел акций, товары со старой ценой и рабочие промокоды.</li></ul></div></div>',
    paymentText: 'Оплата и получение\nОнлайн-оплата может быть подключена отдельно через платежную интеграцию магазина. Если онлайн-оплата не настроена, заказ оформляется как заявка, а менеджер связывается с клиентом для подтверждения и уточнения стоимости доставки.\n\nДоступны самовывоз и доставка по городу. Все сценарии оформления адаптированы под каталог техники: комментарий к заказу, выбор способа получения и контактные данные покупателя.',
    contactsText: 'Контакты\nТелефон: +7 (495) 215-42-18\nEmail: hello@aether-store.demo\nTelegram менеджера: @aether_store\n\nШоурумы:\n• Москва, Петровка, 11\n• Санкт-Петербург, Невский проспект, 36\n• Казань, ул. Баумана, 54\n\nЕжедневно с 10:00 до 22:00',
    productionText: 'AETHER Store — аккуратная premium-tech витрина в духе современных магазинов техники: белая тема, крупные карточки, чистый каталог и понятные сценарии выбора.',
    productionServices: [
      'Флагманские смартфоны Apple, Samsung, Google и Xiaomi.',
      'Ноутбуки и планшеты для работы, творчества и повседневных задач.',
      'Премиальные наушники, часы и smart-аксессуары.',
      'Раздел спецпредложений и товары со старой ценой.',
      'Логичная структура категорий и брендовых подкатегорий.',
    ],
  };
}

function buildSettings(currentSettings) {
  return {
    ...currentSettings,
    promoCodes: [
      { code: 'TECH10', type: 'percent', value: 10, active: true, usageMode: 'any_once' },
      { code: 'APPLE5', type: 'percent', value: 5, active: true, usageMode: 'first_order_once' },
    ],
  };
}

function backupStore(row, parsed) {
  ensureDir(BACKUPS_DIR);
  const fileName = `store-${STORE_ID}-before-premium-tech-${Date.now()}.json`;
  const payload = {
    backedUpAt: nowIso(),
    storeId: STORE_ID,
    storeName: row.store_name,
    ...parsed,
  };
  const fullPath = path.join(BACKUPS_DIR, fileName);
  fs.writeFileSync(fullPath, JSON.stringify(payload, null, 2), 'utf8');
  return fullPath;
}

const db = new Database(DB_PATH);
const row = db.prepare('SELECT * FROM stores WHERE store_id = ?').get(STORE_ID);
if (!row) throw new Error(`Store ${STORE_ID} not found`);

const current = {
  config: JSON.parse(row.config_json || '{}'),
  settings: JSON.parse(row.settings_json || '{}'),
  categories: JSON.parse(row.categories_json || '[]'),
  products: JSON.parse(row.products_json || '[]'),
};

const backupPath = backupStore(row, current);
const art = buildArt();
const categories = buildCategories(art);
const products = buildProducts();
const config = buildConfig(current.config, art);
const settings = buildSettings(current.settings);
const ts = nowIso();

const replaceCategoriesTx = db.transaction((storeId, items) => {
  db.prepare('DELETE FROM categories WHERE store_id = ?').run(storeId);
  const stmt = db.prepare(`
    INSERT INTO categories (store_id, category_id, title, image, group_id, sort_order, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  items.forEach((cat, idx) => {
    stmt.run(storeId, String(cat.id), String(cat.title), String(cat.image || ''), String(cat.groupId || 'apparel'), idx, JSON.stringify(cat), ts, ts);
  });
});

const replaceProductsTx = db.transaction((storeId, items) => {
  db.prepare('DELETE FROM products WHERE store_id = ?').run(storeId);
  const stmt = db.prepare(`
    INSERT INTO products (store_id, product_id, category_id, title, price, old_price, sku, short_description, description, image, sort_order, payload_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);
  items.forEach((product, idx) => {
    stmt.run(
      storeId,
      String(product.id),
      String(product.categoryId || ''),
      String(product.title),
      Number(product.price || 0),
      Number(product.oldPrice || 0),
      String(product.sku || ''),
      String(product.shortDescription || ''),
      String(product.description || ''),
      String((product.images || [])[0] || ''),
      idx,
      JSON.stringify(product),
      ts,
      ts,
    );
  });
});

replaceCategoriesTx(STORE_ID, categories);
replaceProductsTx(STORE_ID, products);

db.prepare(`
  UPDATE stores
  SET store_name = ?, config_json = ?, settings_json = ?, categories_json = ?, products_json = ?, updated_at = ?
  WHERE store_id = ?
`).run(
  'AETHER Store',
  JSON.stringify(config),
  JSON.stringify(settings),
  JSON.stringify(categories),
  JSON.stringify(products),
  ts,
  STORE_ID,
);

const categoryCount = db.prepare('SELECT COUNT(*) AS count FROM categories WHERE store_id = ?').get(STORE_ID).count;
const productCount = db.prepare('SELECT COUNT(*) AS count FROM products WHERE store_id = ?').get(STORE_ID).count;

console.log(JSON.stringify({
  ok: true,
  storeId: STORE_ID,
  backupPath,
  categories: categoryCount,
  products: productCount,
  promoCodes: settings.promoCodes,
  uploadsDir: UPLOADS_BASE,
}, null, 2));
