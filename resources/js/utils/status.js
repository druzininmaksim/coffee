/**
 * Статусы брони: подпись и классы для бейджа.
 */
export const RESERVATION_STATUSES = {
    pending: { label: 'Ожидает', badge: 'bg-amber-600 text-stone-900' },
    confirmed: { label: 'Подтверждена', badge: 'bg-green-700 text-amber-50' },
    cancelled: { label: 'Отменена', badge: 'bg-red-800 text-amber-50' },
    completed: { label: 'Завершена', badge: 'bg-stone-600 text-amber-50' },
};

export const RESERVATION_STATUS_OPTIONS = Object.entries(RESERVATION_STATUSES).map(
    ([value, { label }]) => ({ value, label })
);

const STATUS_FALLBACK = { label: 'Неизвестно', badge: 'bg-stone-600 text-amber-50' };

export function reservationStatus(status) {
    return RESERVATION_STATUSES[status] ?? STATUS_FALLBACK;
}

/**
 * Статусы заказа: подпись и классы для бейджа.
 */
export const ORDER_STATUSES = {
    new: { label: 'Новый', badge: 'bg-amber-600 text-stone-900' },
    preparing: { label: 'Готовится', badge: 'bg-amber-700 text-amber-50' },
    ready: { label: 'Готов', badge: 'bg-green-700 text-amber-50' },
    completed: { label: 'Завершён', badge: 'bg-stone-600 text-amber-50' },
    cancelled: { label: 'Отменён', badge: 'bg-red-800 text-amber-50' },
};

export const ORDER_STATUS_OPTIONS = Object.entries(ORDER_STATUSES).map(
    ([value, { label }]) => ({ value, label })
);

export function orderStatus(status) {
    return ORDER_STATUSES[status] ?? STATUS_FALLBACK;
}

export const ORDER_TYPE_LABELS = {
    pickup: 'Самовывоз',
    delivery: 'Доставка',
};

export function orderType(type) {
    return ORDER_TYPE_LABELS[type] ?? '—';
}

/**
 * Форматирует дату из API как «ДД.ММ.ГГГГ ЧЧ:ММ» без пересчёта часового пояса,
 * чтобы отображалось ровно то время, которое выбрал гость.
 */
export function formatDateTime(value) {
    if (!value) {
        return '—';
    }

    const [datePart, timePart = ''] = String(value).split('T');
    const [year, month, day] = datePart.split('-');

    if (!year || !month || !day) {
        return String(value);
    }

    return `${day}.${month}.${year} ${timePart.slice(0, 5)}`.trim();
}

export function formatDate(value) {
    return formatDateTime(value).split(' ')[0] ?? '—';
}
