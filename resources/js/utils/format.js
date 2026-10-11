const PLACEHOLDER_IMAGE = '/images/placeholder.svg';

const CATEGORY_PLACEHOLDERS = {
    coffee: '/images/placeholder-coffee.svg',
    desserts: '/images/placeholder-dessert.svg',
    breakfast: '/images/placeholder-breakfast.svg',
};

// Фотографии сайта (лежат в storage/app/public).
export const HERO_IMAGE = '/storage/hero.jpg';
export const ABOUT_IMAGE = '/storage/about.jpg';
export const CONTACTS_IMAGE = '/storage/hero.jpg';

/**
 * Возвращает URL картинки по пути, сохранённому в БД.
 *
 * Пути бывают двух видов:
 * - статические картинки проекта, лежащие в public/images — 'images/menu/espresso.jpg';
 * - файлы, загруженные через админку на диск public — 'menu/espresso.jpg'
 *   (физически в storage/app/public, раздаются симлинком /storage).
 *
 * @param {string|null|undefined} path путь к картинке из БД
 * @returns {string} URL для атрибута src
 */
export function menuImageUrl(path) {
    if (!path) {
        return PLACEHOLDER_IMAGE;
    }

    // Абсолютные URL и пути от корня сайта оставляем без изменений.
    if (/^([a-z]+:)?\/\//i.test(path) || path.startsWith('/')) {
        return path;
    }

    return path.startsWith('images/') ? `/${path}` : `/storage/${path}`;
}

/**
 * Возвращает URL картинки блюда: загруженное фото или заглушку по категории.
 *
 * @param {{ image?: string|null, category?: { slug?: string }|null }|null|undefined} item блюдо из API
 * @returns {string} путь к изображению
 */
export function dishImage(item) {
    if (item?.image) {
        return menuImageUrl(item.image);
    }

    return CATEGORY_PLACEHOLDERS[item?.category?.slug] ?? PLACEHOLDER_IMAGE;
}

export function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
}
