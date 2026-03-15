const ALIAS_SETS = {
  title: [
    'title', 'name', 'item', 'item_name', 'item_title', 'product', 'productname', 'product_name', 'product_title',
    'наименование', 'название', 'название_товара', 'наименование_товара', 'товар', 'товарное_название', 'товарное_наименование',
  ],
  sku: [
    'sku', 'article', 'artikul', 'vendor_code', 'vendorcode', 'product_code', 'item_code', 'code',
    'артикул', 'артикул_товара', 'код', 'код_товара', 'товарный_код',
  ],
  description: [
    'description', 'details', 'detail', 'short_description', 'описание', 'описание_товара', 'краткое_описание', 'полное_описание', 'comment', 'комментарий',
  ],
  characteristics: [
    'characteristics', 'characteristic', 'specs', 'spec', 'specification', 'specifications', 'attributes', 'attribute',
    'характеристики', 'характеристика', 'свойства', 'свойство', 'параметры', 'параметр',
  ],
  price: [
    'price', 'regular_price', 'retail_price', 'sale_price', 'cost', 'цена', 'стоимость', 'цена_товара', 'розничная_цена', 'базовая_цена',
  ],
  old_price: [
    'old_price', 'oldprice', 'old_cost', 'старая_цена', 'цена_до_скидки', 'старая_стоимость', 'зачеркнутая_цена',
  ],
  category: [
    'category', 'category_1', 'category1', 'section', 'group', 'категория', 'категория_1', 'категория1', 'раздел', 'раздел_1', 'раздел1', 'группа',
  ],
  subcategory: [
    'subcategory', 'sub_category', 'sub_category_2', 'subcategory_2', 'subcategory2', 'subsection', 'subgroup', 'child_category', 'child_section',
    'подкатегория', 'подкатегория_2', 'подкатегория2', 'подраздел', 'подраздел_2', 'подраздел2', 'подгруппа', 'вложенная_категория', 'категория_2', 'категория2', 'раздел_2', 'раздел2',
  ],
  stock: [
    'stock', 'quantity', 'qty', 'count', 'остаток', 'количество', 'наличие', 'кол_во', 'колво',
  ],
  active: [
    'active', 'enabled', 'visible', 'show', 'активен', 'опубликован', 'доступен', 'показывать',
  ],
  image_url: [
    'image_url', 'image_link', 'image_src', 'image_link_url', 'photo', 'photo_src', 'photo_url', 'photo_link', 'picture', 'picture_url', 'img', 'img_url',
    'url_image', 'url_photo', 'ссылка', 'ссылка_на_файл', 'ссылка_на_фото', 'ссылка_на_изображение', 'ссылка_на_картинку', 'фото', 'фото_url', 'фото_товара', 'изображение', 'изображение_url', 'картинка', 'imageurl', 'image',
  ],
  image_urls: [
    'image_urls', 'images', 'gallery', 'gallery_urls', 'image_gallery', 'photo_urls', 'photo_gallery', 'фотографии', 'фото_галерея', 'галерея', 'галерея_фото',
  ],
};

const DIRECT_MAP = Object.entries(ALIAS_SETS).reduce((acc, [field, aliases]) => {
  aliases.forEach((alias) => {
    acc[alias] = field;
  });
  return acc;
}, {});

export function normalizeImportHeaderBase(value) {
  return String(value || '')
    .replace(/^\uFEFF/, '')
    .trim()
    .toLowerCase()
    .replace(/[^a-zа-яё0-9]+/gi, '_')
    .replace(/^_+|_+$/g, '');
}

export function mapImportFieldName(value) {
  const base = normalizeImportHeaderBase(value);
  if (DIRECT_MAP[base]) return DIRECT_MAP[base];
  if (/^(category|section|group|категория|раздел|группа)_?1$/.test(base)) return 'category';
  if (/^(category|section|group|категория|раздел|группа)_?2$/.test(base)) return 'subcategory';
  if (/^old_/.test(base) && /price|cost|цен/.test(base)) return 'old_price';
  if (/sub.*category|sub.*section|подкатег|подраздел|подгруп/.test(base)) return 'subcategory';
  if (/^(sku|article|artikul|vendor_code|product_code|item_code|артикул|код)(_.*)?$/.test(base)) return 'sku';
  if (/category|section|group|категор|раздел|групп/.test(base)) return 'category';
  if (/^(characteristics?|specs?|specification|specifications|attributes?|характеристик[аи]?|свойств[ао]?|параметр)(_|$)/.test(base)) return base.includes('_') ? base : 'characteristics';
  if (/^(image_urls?|images|gallery|gallery_urls|photo_urls?|галерея|фотографии)(_.*)?$/.test(base)) return /_/.test(base) && !/^image_urls?$/.test(base) ? base : 'image_urls';
  if (/image|photo|picture|img|изображ|картин|фото/.test(base)) return 'image_url';
  if (/price|cost|цена|стоимост/.test(base)) return 'price';
  if (/description|opis|описан|комментар/.test(base)) return 'description';
  if (/stock|qty|quantity|count|остат|колич|налич|кол_во|колво/.test(base)) return 'stock';
  if (/active|enabled|visible|show|актив|доступ|опублик|показ/.test(base)) return 'active';
  if (/title|name|product|товар|назван|наименован/.test(base)) return 'title';
  return base;
}

export function getImportDictionary() {
  return ALIAS_SETS;
}
