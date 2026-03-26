const fs = require('fs');
const path = require('path');
const Database = require('better-sqlite3');

const STORE_ID = String(process.argv[2] || '3GE3AH').trim().toUpperCase();
const ROOT = path.resolve(__dirname, '..');
const DB_PATH = path.join(ROOT, 'storage', 'saas.sqlite3');
const BACKUPS_DIR = path.join(ROOT, 'storage', 'backups');

if (!fs.existsSync(DB_PATH)) throw new Error(`DB not found: ${DB_PATH}`);

function nowIso() {
  return new Date().toISOString();
}

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function unique(values) {
  return Array.from(new Set((values || []).filter(Boolean)));
}

function specsToLines(items) {
  return (items || []).filter(Boolean).map((item) => `${item.label}: ${item.value}`);
}

function buildOption(id, name, values, required = false) {
  const normalizedValues = unique((values || []).map((value) => String(value || '').trim()).filter(Boolean));
  if (!id || !name || !normalizedValues.length) return null;
  return {
    id: String(id).trim(),
    name: String(name).trim(),
    required: Boolean(required),
    values: normalizedValues,
  };
}

function buildFashionOptions(data) {
  const categoryId = String(data?.categoryId || '').trim();
  const productId = String(data?.id || '').trim();
  const apparelSizes = {
    'women-dresses': ['XS', 'S', 'M', 'L'],
    'women-knitwear': ['XS', 'S', 'M', 'L'],
    'women-outerwear': ['XS', 'S', 'M', 'L'],
    'women-suits': ['XS', 'S', 'M', 'L'],
    'men-shirts': ['S', 'M', 'L', 'XL'],
    'men-knitwear': ['S', 'M', 'L', 'XL'],
    'men-outerwear': ['S', 'M', 'L', 'XL'],
    'men-suits': ['S', 'M', 'L', 'XL'],
    'basics-tshirts': ['S', 'M', 'L', 'XL'],
    'basics-lounge': ['S', 'M', 'L', 'XL'],
  };
  const shoeSizes = {
    'sh-sneakers-white': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    'sh-sneakers-black': ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45'],
    'sh-loafers-women': ['36', '37', '38', '39', '40', '41'],
    'sh-loafers-men': ['40', '41', '42', '43', '44', '45'],
    'sh-boots-chelsea': ['37', '38', '39', '40', '41', '42', '43', '44', '45'],
    'sh-heels-slingback': ['36', '37', '38', '39', '40'],
  };
  const denimSizes = {
    'basics-denim-blue': ['XS', 'S', 'M', 'L', 'XL'],
    'basics-denim-ecru': ['XS', 'S', 'M', 'L'],
    'basics-denim-indigo': ['28', '30', '32', '34', '36'],
  };

  if (shoeSizes[productId]) {
    return [buildOption('size', 'Размер', shoeSizes[productId], true)].filter(Boolean);
  }
  if (denimSizes[productId]) {
    return [buildOption('size', 'Размер', denimSizes[productId], true)].filter(Boolean);
  }
  if (apparelSizes[categoryId]) {
    return [buildOption('size', 'Размер', apparelSizes[categoryId], true)].filter(Boolean);
  }
  return [];
}

const IMG = {
  womenRoot: unique([
    'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1600&q=80',
  ]),
  menRoot: unique([
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
  ]),
  shoesRoot: unique([
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
  ]),
  bagsRoot: unique([
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=80',
  ]),
  accessoriesRoot: unique([
    'https://images.unsplash.com/photo-1523170335258-f5ed11844a49?auto=format&fit=crop&w=1600&q=80',
  ]),
  basicsRoot: unique([
    'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=1600&q=80',
  ]),

  womenDresses: unique([
    'https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1495385794356-15371f348c31?auto=format&fit=crop&w=1600&q=80',
  ]),
  womenKnitwear: unique([
    'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
  ]),
  womenOuterwear: unique([
    'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1600&q=80',
  ]),
  womenSuits: unique([
    'https://images.unsplash.com/photo-1551232864-3f0890e580d9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?auto=format&fit=crop&w=1600&q=80',
  ]),

  menShirts: unique([
    'https://images.unsplash.com/photo-1603252109303-2751441dd157?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?auto=format&fit=crop&w=1600&q=80',
  ]),
  menKnitwear: unique([
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1516257984-b1b4d707412e?auto=format&fit=crop&w=1600&q=80',
  ]),
  menOuterwear: unique([
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=1600&q=80',
  ]),
  menSuits: unique([
    'https://images.unsplash.com/photo-1593032465171-8bd2f2f45704?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1617127365659-c47fa864d8bc?auto=format&fit=crop&w=1600&q=80',
  ]),

  sneakers: unique([
    'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?auto=format&fit=crop&w=1600&q=80',
  ]),
  loafers: unique([
    'https://images.unsplash.com/photo-1614252369475-531eba835eb1?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?auto=format&fit=crop&w=1600&q=80',
  ]),
  boots: unique([
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1638247025967-b4e38f787b76?auto=format&fit=crop&w=1600&q=80',
  ]),
  heels: unique([
    'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1445205170230-053b83016050?auto=format&fit=crop&w=1600&q=80',
  ]),

  toteBags: unique([
    'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1591561954557-26941169b49e?auto=format&fit=crop&w=1600&q=80',
  ]),
  crossbody: unique([
    'https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1600&q=80',
  ]),
  backpacks: unique([
    'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1622560480605-d83c853bc5c3?auto=format&fit=crop&w=1600&q=80',
  ]),
  clutches: unique([
    'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1594223274512-ad4803739b7c?auto=format&fit=crop&w=1600&q=80',
  ]),

  belts: unique([
    'https://images.unsplash.com/photo-1624222247344-550fb60583dc?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80',
  ]),
  sunglasses: unique([
    'https://images.unsplash.com/photo-1511499767150-a48a237f0083?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1577803645773-f96470509666?auto=format&fit=crop&w=1600&q=80',
  ]),
  scarves: unique([
    'https://images.unsplash.com/photo-1520903920243-00d872a2d1c9?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1489987707025-afc232f7ea0f?auto=format&fit=crop&w=1600&q=80',
  ]),
  jewelry: unique([
    'https://images.unsplash.com/photo-1617038220319-276d3cfab638?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca1?auto=format&fit=crop&w=1600&q=80',
  ]),

  tshirts: unique([
    'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1576566588028-4147f3842f27?auto=format&fit=crop&w=1600&q=80',
  ]),
  denim: unique([
    'https://images.unsplash.com/photo-1542272604-787c3835535d?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1475178626620-a4d074967452?auto=format&fit=crop&w=1600&q=80',
  ]),
  lounge: unique([
    'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1600&q=80',
    'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&w=1600&q=80',
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
    images: unique(data.images || []),
    options: Array.isArray(data.options) ? data.options : buildFashionOptions(data),
    active: true,
  };
}

function buildCategories() {
  const roots = [
    ['women', 'Женщинам', IMG.womenRoot[0]],
    ['men', 'Мужчинам', IMG.menRoot[0]],
    ['shoes', 'Обувь', IMG.shoesRoot[0]],
    ['bags', 'Сумки', IMG.bagsRoot[0]],
    ['accessories', 'Аксессуары', IMG.accessoriesRoot[0]],
    ['basics', 'Базовый гардероб', IMG.basicsRoot[0]],
  ].map(([id, title, image]) => ({ id, title, image, groupId: 'apparel' }));

  const children = [
    ['women-dresses', 'Платья', 'women', IMG.womenDresses[0]],
    ['women-knitwear', 'Трикотаж', 'women', IMG.womenKnitwear[0]],
    ['women-outerwear', 'Верхняя одежда', 'women', IMG.womenOuterwear[0]],
    ['women-suits', 'Костюмы', 'women', IMG.womenSuits[0]],

    ['men-shirts', 'Рубашки', 'men', IMG.menShirts[0]],
    ['men-knitwear', 'Трикотаж', 'men', IMG.menKnitwear[0]],
    ['men-outerwear', 'Верхняя одежда', 'men', IMG.menOuterwear[0]],
    ['men-suits', 'Костюмы', 'men', IMG.menSuits[0]],

    ['shoes-sneakers', 'Кроссовки', 'shoes', IMG.sneakers[0]],
    ['shoes-loafers', 'Лоферы', 'shoes', IMG.loafers[0]],
    ['shoes-boots', 'Ботинки', 'shoes', IMG.boots[0]],
    ['shoes-heels', 'Каблуки', 'shoes', IMG.heels[0]],

    ['bags-tote', 'Tote', 'bags', IMG.toteBags[0]],
    ['bags-crossbody', 'Crossbody', 'bags', IMG.crossbody[0]],
    ['bags-backpacks', 'Рюкзаки', 'bags', IMG.backpacks[0]],
    ['bags-clutches', 'Клатчи', 'bags', IMG.clutches[0]],

    ['accessories-belts', 'Ремни', 'accessories', IMG.belts[0]],
    ['accessories-eyewear', 'Очки', 'accessories', IMG.sunglasses[0]],
    ['accessories-scarves', 'Шарфы и платки', 'accessories', IMG.scarves[0]],
    ['accessories-jewelry', 'Украшения', 'accessories', IMG.jewelry[0]],

    ['basics-tshirts', 'Футболки', 'basics', IMG.tshirts[0]],
    ['basics-denim', 'Деним', 'basics', IMG.denim[0]],
    ['basics-lounge', 'Домашняя линия', 'basics', IMG.lounge[0]],
  ].map(([id, title, parentId, image]) => ({ id, title, parentId, image, groupId: 'apparel' }));

  return [...roots, ...children];
}

function buildProducts() {
  return [
    p({ id:'w-dress-midi-satin', categoryId:'women-dresses', title:'Сатиновое миди-платье Pearl', sku:'WMN-DRS-PEARL', price:15990, oldPrice:18990, stock:7, images:IMG.womenDresses, shortDescription:'Легкое вечернее платье с мягким блеском и чистым силуэтом.', description:'Платье для событий, ужинов и аккуратного премиального гардероба. Сатиновая фактура, мягкая посадка по фигуре и длина миди делают модель универсальной и дорогой визуально.', specs:[{label:'Материал',value:'Вискоза / полиэстер'},{label:'Посадка',value:'Regular fit'},{label:'Длина',value:'Midi'},{label:'Цвет',value:'Ivory'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Деликатная стирка'}] }),
    p({ id:'w-dress-black-column', categoryId:'women-dresses', title:'Платье-футляр Noir Line', sku:'WMN-DRS-NOIR', price:17990, stock:5, images:[IMG.womenDresses[1], IMG.womenSuits[1]], shortDescription:'Минималистичное черное платье для офиса и вечера.', description:'Чистый силуэт, плотная ткань и лаконичный крой делают модель базовой основой premium wardrobe. Подходит для офиса, мероприятий и вечерних выходов.', specs:[{label:'Материал',value:'Плотный костюмный трикотаж'},{label:'Посадка',value:'Slim fit'},{label:'Цвет',value:'Black'},{label:'Длина',value:'Midi'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'w-dress-shirt-sand', categoryId:'women-dresses', title:'Платье-рубашка Sand Edition', sku:'WMN-DRS-SAND', price:12990, stock:8, images:[IMG.womenDresses[0], IMG.womenOuterwear[1]], shortDescription:'Свободное платье-рубашка для дневного premium casual.', description:'Универсальная модель для города, отпуска и офиса. Хорошо работает с лоферами, босоножками и кроссовками, сохраняя дорогой и спокойный образ.', specs:[{label:'Материал',value:'Хлопок / лиоцелл'},{label:'Посадка',value:'Relaxed fit'},{label:'Цвет',value:'Sand'},{label:'Сезон',value:'Весна / лето'},{label:'Особенность',value:'Пояс в комплекте'},{label:'Уход',value:'Бережная стирка'}] }),
    p({ id:'w-knit-cashmere-ivory', categoryId:'women-knitwear', title:'Кашемировый джемпер Ivory Soft', sku:'WMN-KNT-IVORY', price:18990, stock:9, images:IMG.womenKnitwear, shortDescription:'Мягкий светлый джемпер для базового дорогого гардероба.', description:'Кашемировый джемпер с чистой линией плеча и спокойной палитрой. Хорошо сочетается с денимом, костюмными брюками и юбками.', specs:[{label:'Материал',value:'Кашемир / шерсть'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Ivory'},{label:'Сезон',value:'Осень / зима'},{label:'Особенность',value:'Мягкая фактура'},{label:'Уход',value:'Ручная стирка'}] }),
    p({ id:'w-knit-merino-graphite', categoryId:'women-knitwear', title:'Джемпер Merino Graphite', sku:'WMN-KNT-GRAPH', price:14990, stock:10, images:[IMG.womenKnitwear[1], IMG.womenKnitwear[0]], shortDescription:'Тонкий мериносовый трикотаж для everyday premium style.', description:'Тонкий и пластичный джемпер из мериноса. Подходит под жакет, пальто и в самостоятельных образах на каждый день.', specs:[{label:'Материал',value:'100% меринос'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Graphite'},{label:'Сезон',value:'Круглый год'},{label:'Особенность',value:'Тонкая вязка'},{label:'Уход',value:'Ручная стирка'}] }),
    p({ id:'w-outer-coat-camel', categoryId:'women-outerwear', title:'Пальто Camel Atelier', sku:'WMN-OUT-CAMEL', price:32990, oldPrice:36990, stock:4, images:IMG.womenOuterwear, shortDescription:'Длинное пальто из шерстяной ткани в оттенке camel.', description:'Главная вещь сезона для спокойного и дорогого гардероба. Формирует clean luxury silhouette и легко сочетается с трикотажем, платьями и денимом.', specs:[{label:'Материал',value:'Шерсть / полиамид'},{label:'Длина',value:'Maxi'},{label:'Цвет',value:'Camel'},{label:'Посадка',value:'Straight fit'},{label:'Сезон',value:'Осень / весна'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'w-outer-trench-stone', categoryId:'women-outerwear', title:'Тренч Stone Line', sku:'WMN-OUT-TRENCH', price:25990, stock:6, images:[IMG.womenOuterwear[1], IMG.womenOuterwear[0]], shortDescription:'Лаконичный тренч для городских образов.', description:'Классический тренч с правильной длиной и спокойным оттенком. Подходит для layered-образов и делает витрину более собранной и премиальной.', specs:[{label:'Материал',value:'Хлопок / нейлон'},{label:'Цвет',value:'Stone'},{label:'Посадка',value:'Relaxed fit'},{label:'Сезон',value:'Весна / осень'},{label:'Особенность',value:'Двубортная застежка'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'w-suit-ivory', categoryId:'women-suits', title:'Костюм Ivory Tailored', sku:'WMN-SUIT-IVORY', price:28990, stock:5, images:IMG.womenSuits, shortDescription:'Светлый брючный костюм для офиса, встреч и мероприятий.', description:'Костюм с clean tailoring и мягкой премиальной посадкой. Подходит для работы, мероприятий и современной smart-casual витрины.', specs:[{label:'Комплект',value:'Жакет + брюки'},{label:'Материал',value:'Вискоза / полиэстер'},{label:'Цвет',value:'Ivory'},{label:'Посадка',value:'Tailored fit'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'w-suit-black', categoryId:'women-suits', title:'Костюм Black Essential', sku:'WMN-SUIT-BLK', price:27990, stock:6, images:[IMG.womenSuits[1], IMG.womenSuits[0]], shortDescription:'Черный костюм для строгого и дорогого образа.', description:'Минималистичный женский костюм с прямыми брюками и четким жакетом. База для офисной капсулы и вечерних стилизаций.', specs:[{label:'Комплект',value:'Жакет + брюки'},{label:'Материал',value:'Костюмная ткань'},{label:'Цвет',value:'Black'},{label:'Посадка',value:'Straight fit'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Химчистка'}] }),

    p({ id:'m-shirt-white-premium', categoryId:'men-shirts', title:'Хлопковая рубашка White Premium', sku:'MEN-SHIRT-WHITE', price:10990, stock:11, images:IMG.menShirts, shortDescription:'Белая рубашка из плотного хлопка для базового мужского гардероба.', description:'Чистая белая рубашка с premium-посадкой, которая одинаково хорошо работает с костюмом, денимом и трикотажем.', specs:[{label:'Материал',value:'100% хлопок'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'White'},{label:'Сезон',value:'Круглый год'},{label:'Манжеты',value:'Классические'},{label:'Уход',value:'Бережная стирка'}] }),
    p({ id:'m-shirt-blue-oxford', categoryId:'men-shirts', title:'Oxford Shirt Sky Blue', sku:'MEN-SHIRT-OXFORD', price:11990, stock:9, images:[IMG.menShirts[1], IMG.menShirts[0]], shortDescription:'Оксфордская рубашка для smart casual образов.', description:'Спокойная голубая рубашка для современного гардероба: подходит под жакет, трикотаж и самостоятельные дневные образы.', specs:[{label:'Материал',value:'Oxford cotton'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Sky blue'},{label:'Сезон',value:'Круглый год'},{label:'Особенность',value:'Мягкий воротник'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'m-knit-merino-beige', categoryId:'men-knitwear', title:'Merino Crewneck Beige', sku:'MEN-KNT-BEIGE', price:14990, stock:10, images:IMG.menKnitwear, shortDescription:'Тонкий мериносовый джемпер для layered premium looks.', description:'Легкий и пластичный трикотаж для офиса, перелетов и спокойных городских образов. Хорошо сочетается с рубашками, пальто и денимом.', specs:[{label:'Материал',value:'100% меринос'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Beige'},{label:'Сезон',value:'Осень / весна'},{label:'Фактура',value:'Тонкая вязка'},{label:'Уход',value:'Ручная стирка'}] }),
    p({ id:'m-knit-zip-anthracite', categoryId:'men-knitwear', title:'Half-Zip Anthracite', sku:'MEN-KNT-ZIP', price:16990, stock:7, images:[IMG.menKnitwear[1], IMG.menOuterwear[1]], shortDescription:'Трикотажный half-zip для premium casual линии.', description:'Универсальный вариант для городского и travel-гардероба. Смотрится собранно, не перегружает образ и хорошо продается как верхний слой.', specs:[{label:'Материал',value:'Шерсть / хлопок'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Anthracite'},{label:'Сезон',value:'Осень / зима'},{label:'Тип воротника',value:'Half-zip'},{label:'Уход',value:'Ручная стирка'}] }),
    p({ id:'m-outer-wool-coat', categoryId:'men-outerwear', title:'Wool Coat Navy Edition', sku:'MEN-OUT-COAT', price:34990, oldPrice:39990, stock:4, images:IMG.menOuterwear, shortDescription:'Длинное шерстяное пальто для строгого мужского гардероба.', description:'Пальто с premium-tailoring подачей: делает витрину дороже и собирает образ вокруг трикотажа, рубашек и денима.', specs:[{label:'Материал',value:'Шерсть / кашемир'},{label:'Посадка',value:'Straight fit'},{label:'Цвет',value:'Navy'},{label:'Длина',value:'Midi'},{label:'Сезон',value:'Осень / зима'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'m-outer-bomber-suede', categoryId:'men-outerwear', title:'Suede Bomber Tobacco', sku:'MEN-OUT-BOMBER', price:29990, stock:5, images:[IMG.menOuterwear[1], IMG.menOuterwear[0]], shortDescription:'Замшевый бомбер для premium smart-casual линии.', description:'Современная версия классического бомбера с дорогой фактурой и спокойной цветовой гаммой. Подходит для межсезонья и layered-образов.', specs:[{label:'Материал',value:'Замша / вискоза'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Tobacco'},{label:'Сезон',value:'Весна / осень'},{label:'Особенность',value:'Металлическая молния'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'m-suit-midnight', categoryId:'men-suits', title:'Костюм Midnight Tailoring', sku:'MEN-SUIT-MID', price:32990, stock:5, images:IMG.menSuits, shortDescription:'Темно-синий костюм для офиса, встреч и мероприятий.', description:'Сдержанный и дорогой по виду костюм с мягкой посадкой. Хорошо работает как standalone-позиция и как база для мужской витрины.', specs:[{label:'Комплект',value:'Пиджак + брюки'},{label:'Материал',value:'Шерсть / эластан'},{label:'Цвет',value:'Midnight blue'},{label:'Посадка',value:'Tailored fit'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Химчистка'}] }),
    p({ id:'m-suit-charcoal', categoryId:'men-suits', title:'Charcoal Office Suit', sku:'MEN-SUIT-CHAR', price:29990, stock:6, images:[IMG.menSuits[1], IMG.menSuits[0]], shortDescription:'Графитовый костюм для ежедневной деловой линии.', description:'Практичный премиальный костюм для офиса и городских деловых образов. Универсален, хорошо сочетается с белыми рубашками и трикотажем.', specs:[{label:'Комплект',value:'Пиджак + брюки'},{label:'Материал',value:'Костюмная шерсть'},{label:'Цвет',value:'Charcoal'},{label:'Посадка',value:'Regular fit'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Химчистка'}] }),

    p({ id:'sh-sneakers-white', categoryId:'shoes-sneakers', title:'Кроссовки White Court', sku:'SHO-SNK-WHITE', price:12990, stock:12, images:IMG.sneakers, shortDescription:'Белые кожаные кроссовки для повседневного premium casual.', description:'Чистая минималистичная модель, которая хорошо работает и в женском, и в мужском разделе. Отличная базовая обувь для демо-витрины.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Подкладка',value:'Текстиль'},{label:'Цвет',value:'White'},{label:'Подошва',value:'Резина'},{label:'Сезон',value:'Весна / лето'},{label:'Размеры',value:'36–45'}] }),
    p({ id:'sh-sneakers-black', categoryId:'shoes-sneakers', title:'Кроссовки Black Motion', sku:'SHO-SNK-BLACK', price:13990, stock:10, images:[IMG.sneakers[1], IMG.sneakers[0]], shortDescription:'Темные премиальные кроссовки для города и поездок.', description:'Более контрастная модель для тех, кто предпочитает спокойный dark wardrobe. Удобно смотрится с денимом, трикотажем и верхней одеждой.', specs:[{label:'Материал',value:'Кожа / текстиль'},{label:'Цвет',value:'Black'},{label:'Подошва',value:'Легкая EVA'},{label:'Сезон',value:'Весна / осень'},{label:'Размеры',value:'36–45'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'sh-loafers-women', categoryId:'shoes-loafers', title:'Лоферы Soft Leather', sku:'SHO-LOF-SOFT', price:14990, stock:7, images:IMG.loafers, shortDescription:'Кожаные лоферы с мягким силуэтом и спокойной отделкой.', description:'Универсальная premium-пара для офиса и города. Сочетается с костюмами, денимом и платьями, сохраняя аккуратную дорогую подачу.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Цвет',value:'Espresso'},{label:'Подошва',value:'Кожа / резина'},{label:'Сезон',value:'Весна / осень'},{label:'Размеры',value:'36–41'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'sh-loafers-men', categoryId:'shoes-loafers', title:'Пенни-лоферы City Black', sku:'SHO-LOF-CITY', price:15990, stock:8, images:[IMG.loafers[1], IMG.loafers[0]], shortDescription:'Мужские лоферы для smart casual и деловых образов.', description:'Классическая форма с современным premium исполнением. Хорошо выглядит с костюмом, трикотажем и укороченными брюками.', specs:[{label:'Материал',value:'Гладкая кожа'},{label:'Цвет',value:'Black'},{label:'Подошва',value:'Резина'},{label:'Сезон',value:'Весна / лето'},{label:'Размеры',value:'40–45'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'sh-boots-chelsea', categoryId:'shoes-boots', title:'Ботинки Chelsea Dark Brown', sku:'SHO-BOOT-CHELSEA', price:18990, stock:6, images:IMG.boots, shortDescription:'Кожаные Chelsea boots для city winter wardrobe.', description:'Лаконичные ботинки для холодного сезона. Формируют дорогой мужской и женский образ без визуального шума.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Цвет',value:'Dark brown'},{label:'Подошва',value:'ТЭП'},{label:'Сезон',value:'Осень / зима'},{label:'Размеры',value:'37–45'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'sh-heels-slingback', categoryId:'shoes-heels', title:'Туфли Slingback Nude', sku:'SHO-HEEL-SLING', price:16990, stock:6, images:IMG.heels, shortDescription:'Элегантные slingback-туфли для дневных и вечерних выходов.', description:'Легкая и женственная модель для premium line женской обуви. Хорошо сочетается с платьями, костюмами и денимом.', specs:[{label:'Материал',value:'Кожа'},{label:'Цвет',value:'Nude'},{label:'Высота каблука',value:'6 см'},{label:'Сезон',value:'Весна / лето'},{label:'Размеры',value:'36–40'},{label:'Гарантия',value:'30 дней'}] }),

    p({ id:'bag-tote-ivory', categoryId:'bags-tote', title:'Tote Bag Ivory Soft', sku:'BAG-TOTE-IVORY', price:21990, oldPrice:24990, stock:5, images:IMG.toteBags, shortDescription:'Вместительная tote-сумка для города, офиса и путешествий.', description:'Спокойная и дорогая модель для современной витрины одежды. Вмещает документы, ноутбук и ежедневные мелочи, сохраняя clean silhouette.', specs:[{label:'Материал',value:'Эко-кожа premium'},{label:'Цвет',value:'Ivory'},{label:'Размер',value:'Large'},{label:'Формат',value:'Tote'},{label:'Внутри',value:'Карман на молнии'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'bag-tote-black', categoryId:'bags-tote', title:'Structured Tote Black', sku:'BAG-TOTE-BLACK', price:23990, stock:4, images:[IMG.toteBags[1], IMG.toteBags[0]], shortDescription:'Структурированная tote-сумка для делового гардероба.', description:'Более строгая версия классической tote bag для офиса и поездок. Хорошо работает как якорная premium-позиция раздела.', specs:[{label:'Материал',value:'Гладкая кожа'},{label:'Цвет',value:'Black'},{label:'Размер',value:'Medium'},{label:'Формат',value:'Structured tote'},{label:'Внутри',value:'Отделение под ноутбук'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'bag-crossbody-sand', categoryId:'bags-crossbody', title:'Crossbody Sand Mini', sku:'BAG-CROSS-SAND', price:14990, stock:8, images:IMG.crossbody, shortDescription:'Компактная сумка через плечо в нейтральном оттенке.', description:'Удобная premium-модель на каждый день: телефон, карты, ключи и базовые мелочи помещаются без перегруза силуэта.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Цвет',value:'Sand'},{label:'Формат',value:'Crossbody'},{label:'Ремень',value:'Регулируемый'},{label:'Размер',value:'Mini'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'bag-crossbody-black', categoryId:'bags-crossbody', title:'Crossbody Noir Frame', sku:'BAG-CROSS-NOIR', price:15990, stock:7, images:[IMG.crossbody[1], IMG.crossbody[0]], shortDescription:'Черная crossbody-сумка для city looks и поездок.', description:'Чистая геометрия, спокойный premium-дизайн и универсальная цветовая гамма делают модель удачной для повседневной витрины.', specs:[{label:'Материал',value:'Кожа / микрофибра'},{label:'Цвет',value:'Black'},{label:'Формат',value:'Crossbody'},{label:'Размер',value:'Medium'},{label:'Особенность',value:'Магнитная застежка'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'bag-backpack-city', categoryId:'bags-backpacks', title:'City Backpack Olive', sku:'BAG-BPACK-OLIVE', price:17990, stock:6, images:IMG.backpacks, shortDescription:'Городской рюкзак для travel и ноутбука.', description:'Лаконичный premium-рюкзак с хорошей подачей в разделе аксессуаров. Подходит под ноутбук, документы и ежедневные поездки.', specs:[{label:'Материал',value:'Плотный текстиль / кожа'},{label:'Цвет',value:'Olive'},{label:'Формат',value:'Рюкзак'},{label:'Отделение',value:'Под ноутбук 15\"'},{label:'Особенность',value:'Водозащитная ткань'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'bag-clutch-evening', categoryId:'bags-clutches', title:'Evening Clutch Soft Gold', sku:'BAG-CLUTCH-GOLD', price:12990, stock:5, images:IMG.clutches, shortDescription:'Небольшой клатч для вечерних выходов и мероприятий.', description:'Акцентный аксессуар для вечерней витрины. Подходит для платьев, костюмов и event-driven стилизаций.', specs:[{label:'Материал',value:'Сатин / эко-кожа'},{label:'Цвет',value:'Soft gold'},{label:'Формат',value:'Clutch'},{label:'Ремень',value:'Съемная цепочка'},{label:'Размер',value:'Compact'},{label:'Гарантия',value:'30 дней'}] }),

    p({ id:'acc-belt-classic-black', categoryId:'accessories-belts', title:'Ремень Classic Black', sku:'ACC-BELT-BLK', price:5990, stock:16, images:IMG.belts, shortDescription:'Минималистичный ремень для платьев, брюк и костюмов.', description:'Базовый аксессуар с чистой premium-подачей, который усиливает средний чек и хорошо дополняет гардероб.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Цвет',value:'Black'},{label:'Ширина',value:'2.8 см'},{label:'Фурнитура',value:'Матовый металл'},{label:'Размеры',value:'S–L'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'acc-sunglasses-amber', categoryId:'accessories-eyewear', title:'Солнцезащитные очки Amber Frame', sku:'ACC-EYE-AMBER', price:8990, stock:11, images:IMG.sunglasses, shortDescription:'Очки в мягкой premium-оправе для города и отпуска.', description:'Аксессуар, который добавляет витрине fashion retail-характер и собирает цельный образ без визуального шума.', specs:[{label:'Оправа',value:'Ацетат'},{label:'Цвет',value:'Amber'},{label:'Линзы',value:'UV 400'},{label:'Форма',value:'Oval'},{label:'Комплект',value:'Чехол + салфетка'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'acc-silk-scarf-ivory', categoryId:'accessories-scarves', title:'Шелковый платок Ivory Print', sku:'ACC-SCARF-IVORY', price:6990, stock:10, images:IMG.scarves, shortDescription:'Легкий шелковый платок для шеи, сумки и волос.', description:'Аккуратный premium-аксессуар, который делает витрину одежды более завершенной и помогает собирать полноценные образы.', specs:[{label:'Материал',value:'100% шелк'},{label:'Цвет',value:'Ivory / beige'},{label:'Размер',value:'70 × 70 см'},{label:'Сезон',value:'Круглый год'},{label:'Фактура',value:'Шелковая'},{label:'Уход',value:'Ручная стирка'}] }),
    p({ id:'acc-jewelry-gold', categoryId:'accessories-jewelry', title:'Серьги Gold Minimal', sku:'ACC-JEW-GOLD', price:4990, stock:14, images:IMG.jewelry, shortDescription:'Минималистичные серьги для дневных и вечерних образов.', description:'Лаконичное украшение для расширения fashion-витрины и повышения среднего чека без перегруза ассортимента.', specs:[{label:'Материал',value:'Ювелирный сплав'},{label:'Покрытие',value:'Gold tone'},{label:'Тип',value:'Серьги'},{label:'Стиль',value:'Minimal'},{label:'Комплект',value:'Пара'},{label:'Гарантия',value:'14 дней'}] }),
    p({ id:'acc-belt-cognac', categoryId:'accessories-belts', title:'Ремень Cognac Buckle', sku:'ACC-BELT-CGN', price:6490, stock:12, images:[IMG.belts[1], IMG.belts[0]], shortDescription:'Кожаный ремень теплого коньячного оттенка для денима и костюмных брюк.', description:'Акцентный ремень для повседневной и smart casual линии. Добавляет глубину разделу аксессуаров и хорошо сочетается с денимом, трикотажем и костюмными брюками.', specs:[{label:'Материал',value:'Натуральная кожа'},{label:'Цвет',value:'Cognac'},{label:'Ширина',value:'3 см'},{label:'Фурнитура',value:'Brushed gold'},{label:'Размеры',value:'S–XL'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'acc-sunglasses-black', categoryId:'accessories-eyewear', title:'Очки Black Frame Edition', sku:'ACC-EYE-BLK', price:9490, stock:9, images:[IMG.sunglasses[1], IMG.sunglasses[0]], shortDescription:'Черные солнцезащитные очки с clean luxury-подачей.', description:'Универсальная форма и спокойная premium-оправа делают модель удобной для повседневного ассортимента и витрины, похожей на современный европейский fashion retail.', specs:[{label:'Оправа',value:'Ацетат'},{label:'Цвет',value:'Black'},{label:'Линзы',value:'UV 400'},{label:'Форма',value:'Rectangular'},{label:'Комплект',value:'Чехол + салфетка'},{label:'Гарантия',value:'30 дней'}] }),
    p({ id:'acc-chain-bracelet', categoryId:'accessories-jewelry', title:'Браслет Silver Chain', sku:'ACC-JEW-SLV', price:5590, stock:11, images:[IMG.jewelry[1], IMG.jewelry[0]], shortDescription:'Лаконичный браслет в silver-tone исполнении.', description:'Минималистичный аксессуар для everyday premium styling. Хорошо выглядит как самостоятельный товар и как допродажа к сумкам и обуви.', specs:[{label:'Материал',value:'Ювелирный сплав'},{label:'Покрытие',value:'Silver tone'},{label:'Тип',value:'Браслет'},{label:'Стиль',value:'Minimal chain'},{label:'Размер',value:'Регулируемый'},{label:'Гарантия',value:'14 дней'}] }),

    p({ id:'basics-tshirt-white', categoryId:'basics-tshirts', title:'Футболка Premium White', sku:'BSC-TSH-WHITE', price:4990, stock:22, images:IMG.tshirts, shortDescription:'Белая плотная футболка для базового premium wardrobe.', description:'Правильная базовая футболка с хорошей плотностью ткани и чистой посадкой. Отлично работает как entry-level товар в fashion demo-store.', specs:[{label:'Материал',value:'100% хлопок'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'White'},{label:'Сезон',value:'Круглый год'},{label:'Плотность',value:'Heavy cotton'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-tshirt-black', categoryId:'basics-tshirts', title:'Футболка Premium Black', sku:'BSC-TSH-BLACK', price:4990, stock:20, images:[IMG.tshirts[1], IMG.tshirts[0]], shortDescription:'Черная базовая футболка для layering и everyday looks.', description:'Практичная и хорошо продаваемая базовая модель. Добавляет глубину каталогу и дает понятную стартовую цену для новых клиентов.', specs:[{label:'Материал',value:'100% хлопок'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Black'},{label:'Сезон',value:'Круглый год'},{label:'Плотность',value:'Heavy cotton'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-tshirt-sand', categoryId:'basics-tshirts', title:'Футболка Premium Sand', sku:'BSC-TSH-SAND', price:5490, stock:17, images:[IMG.tshirts[0], IMG.tshirts[1]], shortDescription:'Светлая футболка в теплом sand-оттенке для premium casual гардероба.', description:'Нейтральный оттенок делает модель удобной для весенне-летней витрины. Хорошо комбинируется с денимом, льном, overshirt и трикотажем.', specs:[{label:'Материал',value:'100% хлопок'},{label:'Посадка',value:'Regular fit'},{label:'Цвет',value:'Sand'},{label:'Сезон',value:'Весна / лето'},{label:'Плотность',value:'Heavy cotton'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-denim-blue', categoryId:'basics-denim', title:'Джинсы Straight Blue', sku:'BSC-DNM-BLUE', price:9990, oldPrice:11990, stock:13, images:IMG.denim, shortDescription:'Прямые джинсы в спокойном premium blue wash.', description:'Универсальная джинсовая модель с clean fit и понятной посадкой. Подходит для женского и мужского wardrobe-раздела.', specs:[{label:'Материал',value:'Хлопок / эластан'},{label:'Посадка',value:'Straight fit'},{label:'Цвет',value:'Blue wash'},{label:'Сезон',value:'Круглый год'},{label:'Размеры',value:'XS–XL'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-denim-ecru', categoryId:'basics-denim', title:'Джинсы Ecru Wide', sku:'BSC-DNM-ECRU', price:10990, stock:10, images:[IMG.denim[1], IMG.denim[0]], shortDescription:'Светлый деним для весенне-летней витрины.', description:'Свежая и дорогая по восприятию модель, которая помогает сделать ассортимент более fashion-forward и легче визуально.', specs:[{label:'Материал',value:'Хлопок'},{label:'Посадка',value:'Wide leg'},{label:'Цвет',value:'Ecru'},{label:'Сезон',value:'Весна / лето'},{label:'Размеры',value:'XS–L'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-denim-indigo', categoryId:'basics-denim', title:'Джинсы Indigo Slim', sku:'BSC-DNM-INDIGO', price:11490, stock:11, images:[IMG.denim[0], IMG.denim[1]], shortDescription:'Темный деним для более строгой и собранной линии каталога.', description:'Slim straight denim в глубоком indigo-оттенке. Удачно работает как мужская и унисекс-позиция для продуманного базового ассортимента.', specs:[{label:'Материал',value:'Хлопок / эластан'},{label:'Посадка',value:'Slim straight'},{label:'Цвет',value:'Indigo'},{label:'Сезон',value:'Круглый год'},{label:'Размеры',value:'28–36'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-lounge-set', categoryId:'basics-lounge', title:'Домашний комплект Soft Lounge', sku:'BSC-LNG-SOFT', price:13990, stock:8, images:IMG.lounge, shortDescription:'Мягкий комплект для дома, путешествий и casual days.', description:'Спокойный lounge-set из мягкой ткани. Добавляет каталогу полноту и работает как удобный lifestyle-товар в fashion retail.', specs:[{label:'Комплект',value:'Худи + брюки'},{label:'Материал',value:'Хлопок / модал'},{label:'Цвет',value:'Warm beige'},{label:'Посадка',value:'Relaxed fit'},{label:'Сезон',value:'Круглый год'},{label:'Уход',value:'Машинная стирка'}] }),
    p({ id:'basics-lounge-cardigan', categoryId:'basics-lounge', title:'Кардиган Lounge Wrap', sku:'BSC-LNG-WRAP', price:11990, stock:9, images:[IMG.lounge[1], IMG.lounge[0]], shortDescription:'Мягкий lounge-кардиган для дома, поездок и спокойных выходных.', description:'Уютная premium-позиция для завершающего слоя в домашней линии. Делает раздел basics более полноценным и работает как эмоциональная покупка.', specs:[{label:'Материал',value:'Хлопок / модал / эластан'},{label:'Посадка',value:'Relaxed fit'},{label:'Цвет',value:'Warm taupe'},{label:'Сезон',value:'Круглый год'},{label:'Особенность',value:'Мягкая фактура'},{label:'Уход',value:'Бережная стирка'}] }),
  ];
}

function buildConfig(currentConfig) {
  return {
    ...currentConfig,
    companyName: 'MONTE AVENUE',
    companyPhone: '+7 (495) 431-17-48',
    companyEmail: 'hello@monte-avenue.demo',
    companyAddress: 'Москва, Большая Никитская, 21',
    theme: 'white',
    accent: 'pink',
    storeLocations: [
      { id: 'msk-nikitskaya', city: 'Москва', address: 'Большая Никитская, 21' },
      { id: 'spb-rubinshteina', city: 'Санкт-Петербург', address: 'ул. Рубинштейна, 14' },
      { id: 'ekb-vojvodina', city: 'Екатеринбург', address: 'ул. Воеводина, 8' },
    ],
    privacyPolicyConsentText: 'Я ознакомлен(а) с Политикой конфиденциальности и условиями магазина',
    privacyPolicyTitle: 'Политика конфиденциальности и условия магазина',
    privacyPolicyText: 'Оформляя заказ в MONTE AVENUE, покупатель подтверждает корректность введенных данных и дает согласие на обработку персональных данных для связи по заказу, доставки, примерки и постпродажного сопровождения. Данные используются только для обслуживания заказа и не передаются в собственных маркетинговых целях магазина без отдельного согласия.',
    privacyPolicyUrl: '',
    homeBanners: [
      {
        id: 'hero-tailored',
        image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?auto=format&fit=crop&w=1800&q=80',
        kicker: 'Premium fashion',
        title: 'Гардероб в спокойной luxury-подаче',
        text: 'Женская и мужская линия, обувь, сумки и аксессуары для современного premium-store.',
        cta: 'Открыть каталог',
      },
      {
        id: 'hero-outerwear',
        image: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=1800&q=80',
        kicker: 'Outerwear',
        title: 'Пальто, тренчи и костюмы для чистых city-образов',
        text: 'Минималистичная коллекция для работы, встреч и аккуратного everyday luxury.',
        cta: 'Смотреть подборку',
      },
      {
        id: 'hero-accessories',
        image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1800&q=80',
        kicker: 'Accessories',
        title: 'Сумки, ремни, очки и детали, которые собирают образ',
        text: 'Премиальные аксессуары для роста среднего чека и законченного fashion-ассортимента.',
        cta: 'Смотреть аксессуары',
      },
    ],
    aboutText: '<div class="about-sections"><div class="about-section"><div class="about-heading">MONTE AVENUE</div><div class="about-lead">Демонстрационный fashion-store в эстетике premium retail: чистые категории, спокойные цвета, качественные карточки товаров и понятная структура каталога.</div><div class="about-lead">Магазин показывает, как может выглядеть современная SaaS-витрина одежды: женская и мужская линия, обувь, сумки, аксессуары и базовый гардероб.</div></div><div class="about-section"><div class="about-heading">Что есть в магазине</div><ul class="about-list"><li>Женские и мужские категории с подкатегориями.</li><li>Обувь, сумки и аксессуары с реальными фотографиями.</li><li>Подборка акций и товары со старой ценой.</li><li>Рабочие промокоды и полноценный checkout.</li></ul></div></div>',
    paymentText: 'Оплата и получение\nОнлайн-оплата может быть подключена отдельно через платежную интеграцию магазина. Если онлайн-оплата не настроена, заказ оформляется как заявка, а менеджер подтверждает наличие, размер и стоимость доставки.\n\nДоступны самовывоз и доставка. Для fashion-каталога предусмотрены комментарий к заказу и сохранение истории заказов покупателя.',
    contactsText: 'Контакты\nТелефон: +7 (495) 431-17-48\nEmail: hello@monte-avenue.demo\nTelegram менеджера: @monteavenue_demo\n\nШоурумы:\n• Москва, Большая Никитская, 21\n• Санкт-Петербург, ул. Рубинштейна, 14\n• Екатеринбург, ул. Воеводина, 8\n\nЕжедневно с 11:00 до 22:00',
    productionText: 'MONTE AVENUE — премиальная демонстрационная витрина одежды: белая тема, clean category grid, fashion-карточки и понятный сценарий выбора товаров.',
    productionServices: [
      'Женская и мужская линия с логичными подкатегориями.',
      'Премиальная обувь, сумки и аксессуары.',
      'Товары со старой ценой и подборка спецпредложений.',
      'Базовый гардероб для повседневных образов.',
      'Полноценный demo-store для показа потенциальным клиентам.',
    ],
  };
}

function buildSettings(currentSettings) {
  return {
    ...currentSettings,
    promoCodes: [
      { code: 'STYLE10', type: 'percent', value: 10, active: true, usageMode: 'any_once' },
      { code: 'LOOK5', type: 'percent', value: 5, active: true, usageMode: 'first_order_once' },
    ],
  };
}

function backupStore(row, parsed) {
  ensureDir(BACKUPS_DIR);
  const fileName = `store-${STORE_ID}-before-premium-fashion-${Date.now()}.json`;
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
const categories = buildCategories();
const products = buildProducts();
const config = buildConfig(current.config);
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
  'MONTE AVENUE',
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
}, null, 2));
