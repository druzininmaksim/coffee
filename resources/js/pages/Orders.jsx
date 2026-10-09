import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import api from '../api/client';
import { formatPrice } from '../utils/format';
import { formatDateTime, orderStatus, orderType } from '../utils/status';

export default function Orders() {
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [createdId] = useState(() => location.state?.createdId ?? null);

    useEffect(() => {
        api.get('/orders')
            .then(({ data }) => setOrders(data.orders ?? []))
            .catch(() => setError('Не удалось загрузить ваши заказы'))
            .finally(() => setIsLoading(false));

        // Сбрасываем state навигации, чтобы баннер не показывался при повторном заходе.
        window.history.replaceState({}, '');
    }, []);

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-4 text-3xl font-semibold">Мои заказы</h1>

                {createdId && (
                    <p className="mb-4 rounded-lg bg-green-700/80 px-4 py-3">
                        Заказ №{createdId} создан! Мы уже готовим его к выполнению.
                    </p>
                )}

                {isLoading && <p className="text-amber-50/70">Загружаем заказы…</p>}
                {error && <p className="text-red-400">{error}</p>}

                {!isLoading && !error && orders.length === 0 && (
                    <div className="rounded-lg bg-stone-800 p-8 text-center shadow-md">
                        <p className="mb-4 text-amber-50/80">У вас пока нет заказов.</p>
                        <Link
                            to="/menu"
                            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                        >
                            Выбрать что-нибудь в меню
                        </Link>
                    </div>
                )}

                <div className="flex flex-col gap-4">
                    {orders.map((order) => {
                        const status = orderStatus(order.status);

                        return (
                            <article key={order.id} className="rounded-lg bg-stone-800 p-6 shadow-md">
                                <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
                                    <h2 className="mb-0 text-lg font-semibold">
                                        Заказ №{order.id} · {orderType(order.type)}
                                    </h2>
                                    <span className={`rounded-lg px-3 py-1 text-xs ${status.badge}`}>
                                        {status.label}
                                    </span>
                                </div>

                                <p className="mb-2 text-sm text-amber-50/70">
                                    {formatDateTime(order.created_at)}
                                </p>

                                {order.status === 'completed' && Number(order.bonus_points ?? 0) > 0 && (
                                    <p className="mb-4 text-sm text-green-400">
                                        ☕ Начислено бонусов: +{Number(order.bonus_points)}
                                    </p>
                                )}

                                <ul className="mb-4 flex flex-col gap-2">
                                    {(order.items ?? []).map((item) => (
                                        <li
                                            key={item.id}
                                            className="flex items-center justify-between gap-4 border-b border-stone-700 pb-2 text-sm"
                                        >
                                            <span>
                                                {item.name} × {item.quantity}
                                            </span>
                                            <span className="text-amber-500">
                                                {formatPrice(Number(item.price) * Number(item.quantity))}
                                            </span>
                                        </li>
                                    ))}
                                </ul>

                                {order.type === 'delivery' && order.address && (
                                    <p className="mb-2 text-sm text-amber-50/70">
                                        Адрес доставки: {order.address}
                                    </p>
                                )}

                                {Number(order.discount) > 0 && (
                                    <>
                                        <p className="mb-1 flex flex-wrap justify-between gap-2 text-sm">
                                            <span className="text-amber-50/70">Сумма:</span>
                                            <span>{formatPrice(order.subtotal)}</span>
                                        </p>
                                        <p className="mb-2 flex flex-wrap justify-between gap-2 text-sm">
                                            <span className="text-amber-50/70">
                                                Скидка по промокоду {order.promocode?.code}:
                                            </span>
                                            <span className="text-green-400">
                                                −{formatPrice(order.discount)}
                                            </span>
                                        </p>
                                    </>
                                )}

                                <p className="mb-0 flex flex-wrap justify-between gap-2 text-lg">
                                    <span>Итого:</span>
                                    <span className="font-semibold text-amber-500">
                                        {formatPrice(order.total_price)}
                                    </span>
                                </p>
                            </article>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
