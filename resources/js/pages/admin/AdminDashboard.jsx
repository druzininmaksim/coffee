import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/client';
import { formatDateTime, reservationStatus } from '../../utils/status';

export default function AdminDashboard() {
    const [stats, setStats] = useState(null);
    const [recent, setRecent] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        Promise.all([
            api.get('/admin/reservations'),
            api.get('/admin/leads'),
            api.get('/admin/reviews'),
        ])
            .then(([reservationsResponse, leadsResponse, reviewsResponse]) => {
                const reservations = reservationsResponse.data.reservations ?? [];
                const leads = leadsResponse.data.leads ?? [];
                const reviews = reviewsResponse.data.reviews ?? [];

                setStats({
                    reservations: reservations.length,
                    pending: reservations.filter((item) => item.status === 'pending').length,
                    confirmed: reservations.filter((item) => item.status === 'confirmed').length,
                    newLeads: leads.filter((item) => item.status === 'new').length,
                    moderation: reviews.filter((item) => !item.is_published).length,
                });

                setRecent(reservations.slice(0, 5));
            })
            .catch(() => setError('Не удалось загрузить статистику'));
    }, []);

    const cards = [
        { label: 'Всего броней', value: stats?.reservations, to: '/admin/reservations' },
        { label: 'Ожидают', value: stats?.pending, to: '/admin/reservations' },
        { label: 'Подтверждено', value: stats?.confirmed, to: '/admin/reservations' },
        { label: 'Новых заявок', value: stats?.newLeads, to: '/admin/leads' },
        { label: 'Отзывов на модерации', value: stats?.moderation, to: '/admin/reviews' },
    ];

    return (
        <div className="flex flex-col gap-6">
            <h1 className="mb-0 text-2xl font-semibold">Dashboard</h1>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-5">
                {cards.map((card) => (
                    <Link
                        key={card.label}
                        to={card.to}
                        className="rounded-lg bg-stone-800 p-6 shadow-md transition-colors hover:bg-stone-700"
                    >
                        <p className="mb-4 text-sm text-amber-50/60">{card.label}</p>
                        <p className="mb-0 text-3xl font-semibold text-amber-500">
                            {card.value ?? '—'}
                        </p>
                    </Link>
                ))}
            </div>

            <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                <div className="mb-4 flex flex-wrap items-center justify-between gap-6">
                    <h2 className="mb-0 text-xl font-semibold">Последние 5 броней</h2>
                    <Link to="/admin/reservations" className="text-sm text-amber-500 hover:text-amber-400">
                        Все брони
                    </Link>
                </div>

                {recent.length === 0 ? (
                    <p className="mb-0 text-amber-50/70">Броней пока нет.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full min-w-150 text-left text-sm">
                            <thead className="text-amber-50/60">
                                <tr>
                                    <th className="pb-4">Гость</th>
                                    <th className="pb-4">Столик</th>
                                    <th className="pb-4">Дата и время</th>
                                    <th className="pb-4">Статус</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recent.map((reservation) => {
                                    const status = reservationStatus(reservation.status);

                                    return (
                                        <tr key={reservation.id} className="border-t border-stone-700">
                                            <td className="py-4">
                                                {reservation.name}
                                                <span className="block text-xs text-amber-50/60">
                                                    {reservation.phone}
                                                </span>
                                            </td>
                                            <td className="py-4">№{reservation.table?.number ?? '—'}</td>
                                            <td className="py-4">{formatDateTime(reservation.reserved_at)}</td>
                                            <td className="py-4">
                                                <span className={`rounded-lg px-3 py-1 text-xs ${status.badge}`}>
                                                    {status.label}
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </section>
        </div>
    );
}
