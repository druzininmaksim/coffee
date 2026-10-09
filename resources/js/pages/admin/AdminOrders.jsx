import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { formatPrice } from '../../utils/format';
import { ORDER_STATUS_OPTIONS, formatDateTime, orderStatus, orderType } from '../../utils/status';

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [viewing, setViewing] = useState(null);
    const [statusFilter, setStatusFilter] = useState('');

    const load = () => {
        return api
            .get('/admin/orders', { params: statusFilter ? { status: statusFilter } : {} })
            .then(({ data }) => setOrders(data.orders ?? []))
            .catch(() => setError('Не удалось загрузить заказы'));
    };

    useEffect(() => {
        load().finally(() => setIsLoading(false));
    }, [statusFilter]);

    const changeStatus = async (order, status) => {
        try {
            await api.patch(`/admin/orders/${order.id}/status`, { status });
            await load();
        } catch {
            setError('Не удалось изменить статус заказа');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Заказы</h1>
                <select
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value)}
                    className="rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-sm text-amber-50 outline-none focus:border-amber-600"
                    aria-label="Фильтр по статусу"
                >
                    <option value="">Все статусы</option>
                    {ORDER_STATUS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

            {isLoading ? (
                <p className="text-amber-50/70">Загружаем заказы…</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full min-w-200 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">№</th>
                                <th className="pb-4">Клиент</th>
                                <th className="pb-4">Тип</th>
                                <th className="pb-4">Позиций</th>
                                <th className="pb-4">Сумма</th>
                                <th className="pb-4">Создан</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {orders.map((order) => {
                                const status = orderStatus(order.status);
                                const positions = (order.items ?? []).reduce(
                                    (sum, item) => sum + Number(item.quantity),
                                    0
                                );

                                return (
                                    <tr key={order.id} className="border-t border-stone-700">
                                        <td className="py-4">{order.id}</td>
                                        <td className="py-4">
                                            {order.name}
                                            <span className="block text-xs text-amber-50/60">
                                                {order.phone}
                                            </span>
                                        </td>
                                        <td className="py-4">{orderType(order.type)}</td>
                                        <td className="py-4">{positions}</td>
                                        <td className="py-4 text-amber-500">
                                            {formatPrice(order.total_price)}
                                        </td>
                                        <td className="py-4">{formatDateTime(order.created_at)}</td>
                                        <td className="py-4">
                                            <span className={`rounded-lg px-3 py-1 text-xs ${status.badge}`}>
                                                {status.label}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setViewing(order)}
                                                    className="rounded-lg border border-stone-600 px-3 py-2 text-xs transition-colors hover:bg-stone-700"
                                                >
                                                    Детали
                                                </button>
                                                <select
                                                    value={order.status}
                                                    onChange={(event) =>
                                                        changeStatus(order, event.target.value)
                                                    }
                                                    className="rounded-lg border border-stone-700 bg-stone-900 px-2 py-2 text-xs outline-none focus:border-amber-600"
                                                    aria-label="Статус заказа"
                                                >
                                                    {ORDER_STATUS_OPTIONS.map((option) => (
                                                        <option key={option.value} value={option.value}>
                                                            {option.label}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {orders.length === 0 && <p className="mb-0 text-amber-50/70">Заказов пока нет.</p>}
                </div>
            )}

            <Modal
                open={viewing !== null}
                onClose={() => setViewing(null)}
                title={viewing ? `Заказ №${viewing.id}` : ''}
            >
                {viewing && (
                    <div className="flex flex-col gap-4">
                        <p className="mb-0 text-sm">
                            {orderType(viewing.type)}
                            {viewing.type === 'delivery' && viewing.address ? ` · ${viewing.address}` : ''}
                        </p>
                        <p className="mb-0 text-sm">
                            {viewing.name} · {viewing.phone}
                        </p>
                        {viewing.comment && (
                            <p className="mb-0 text-sm text-amber-50/70">{viewing.comment}</p>
                        )}

                        <ul className="flex flex-col gap-2">
                            {(viewing.items ?? []).map((item) => (
                                <li
                                    key={item.id}
                                    className="flex items-center justify-between gap-4 border-b border-stone-700 pb-2"
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

                        {Number(viewing.discount) > 0 && (
                            <>
                                <p className="mb-0 flex flex-wrap justify-between gap-2 text-sm">
                                    <span className="text-amber-50/70">Сумма:</span>
                                    <span>{formatPrice(viewing.subtotal)}</span>
                                </p>
                                <p className="mb-0 flex flex-wrap justify-between gap-2 text-sm">
                                    <span className="text-amber-50/70">
                                        Скидка по промокоду {viewing.promocode?.code}:
                                    </span>
                                    <span className="text-green-400">
                                        −{formatPrice(viewing.discount)}
                                    </span>
                                </p>
                            </>
                        )}

                        <p className="mb-0 flex flex-wrap justify-between gap-2 text-lg">
                            <span>Итого:</span>
                            <span className="font-semibold text-amber-500">
                                {formatPrice(viewing.total_price)}
                            </span>
                        </p>
                    </div>
                )}
            </Modal>
        </div>
    );
}
