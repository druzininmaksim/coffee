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
 * Возвращает URL картинки блюда: загруженное фото или заглушку по категории.
 *
 * @param {{ image?: string|null, category?: { slug?: string }|null }|null|undefined} item блюдо из API
 * @returns {string} путь к изображению
 */
export function dishImage(item) {
    if (item?.image) {
        return `/storage/${item.image}`;
    }

    return CATEGORY_PLACEHOLDERS[item?.category?.slug] ?? PLACEHOLDER_IMAGE;
}

export function formatPrice(price) {
    return `${Number(price).toLocaleString('ru-RU')} ₽`;
}
