import { useCallback, useEffect, useState } from 'react';
import api from '../../api/client';
import { formatDateTime, RESERVATION_STATUS_OPTIONS, reservationStatus } from '../../utils/status';

export default function AdminReservations() {
    const [reservations, setReservations] = useState([]);
    const [status, setStatus] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const load = useCallback(() => {
        setIsLoading(true);

        return api
            .get('/admin/reservations', { params: status ? { status } : {} })
            .then(({ data }) => setReservations(data.reservations ?? []))
            .catch(() => setError('Не удалось загрузить брони'))
            .finally(() => setIsLoading(false));
    }, [status]);

    useEffect(() => {
        load();
    }, [load]);

    const changeStatus = async (reservation, nextStatus) => {
        setBusyId(reservation.id);
        setError(null);

        try {
            await api.patch(`/admin/reservations/${reservation.id}/status`, { status: nextStatus });
            await load();
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? 'Не удалось изменить статус');
        } finally {
            setBusyId(null);
        }
    };

    const actionClass =
        'rounded-lg border px-3 py-1 text-xs transition-colors disabled:opacity-50';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Брони</h1>

                <label className="flex items-center gap-3 text-sm">
                    <span className="text-amber-50/70">Статус</span>
                    <select
                        value={status}
                        onChange={(event) => setStatus(event.target.value)}
                        className="rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                    >
                        <option value="">Все</option>
                        {RESERVATION_STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </label>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
            {isLoading && <p className="mb-0 text-amber-50/70">Загружаем брони…</p>}

            {!isLoading && (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-250 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Гость</th>
                                <th className="pb-4">Телефон</th>
                                <th className="pb-4">Столик</th>
                                <th className="pb-4">Дата и время</th>
                                <th className="pb-4">Гостей</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {reservations.map((reservation) => {
                                const badge = reservationStatus(reservation.status);

                                return (
                                    <tr key={reservation.id} className="border-t border-stone-700">
                                        <td className="py-4">
                                            {reservation.name}
                                            {reservation.user && (
                                                <span className="block text-xs text-amber-50/60">
                                                    {reservation.user.email}
                                                </span>
                                            )}
                                        </td>
                                        <td className="py-4">{reservation.phone}</td>
                                        <td className="py-4">№{reservation.table?.number ?? '—'}</td>
                                        <td className="py-4">{formatDateTime(reservation.reserved_at)}</td>
                                        <td className="py-4">{reservation.guests}</td>
                                        <td className="py-4">
                                            <span className={`rounded-lg px-3 py-1 text-xs ${badge.badge}`}>
                                                {badge.label}
                                            </span>
                                        </td>
                                        <td className="py-4">
                                            <div className="flex flex-wrap justify-end gap-3">
                                                {reservation.status === 'pending' && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === reservation.id}
                                                        onClick={() => changeStatus(reservation, 'confirmed')}
                                                        className={`${actionClass} border-green-700 hover:bg-green-800`}
                                                    >
                                                        Подтвердить
                                                    </button>
                                                )}

                                                {reservation.status !== 'cancelled' &&
                                                    reservation.status !== 'completed' && (
                                                        <button
                                                            type="button"
                                                            disabled={busyId === reservation.id}
                                                            onClick={() => changeStatus(reservation, 'cancelled')}
                                                            className={`${actionClass} border-red-700 hover:bg-red-800`}
                                                        >
                                                            Отменить
                                                        </button>
                                                    )}

                                                {reservation.status === 'confirmed' && (
                                                    <button
                                                        type="button"
                                                        disabled={busyId === reservation.id}
                                                        onClick={() => changeStatus(reservation, 'completed')}
                                                        className={`${actionClass} border-stone-600 hover:bg-stone-700`}
                                                    >
                                                        Завершить
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>

                    {reservations.length === 0 && <p className="mb-0 text-amber-50/70">Броней нет.</p>}
                </div>
            )}
        </div>
    );
}
