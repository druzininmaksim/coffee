import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { dishImage, formatPrice } from '../utils/format';
import { formatDateTime, reservationStatus } from '../utils/status';

export default function Profile() {
    const { user } = useAuth();
    const [reservations, setReservations] = useState([]);
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [review, setReview] = useState({ menu_item_id: '', rating: 5, comment: '' });
    const [reviewStatus, setReviewStatus] = useState('idle');
    const [reviewError, setReviewError] = useState(null);

    const loadReservations = useCallback(() => {
        return api
            .get('/my-reservations')
            .then(({ data }) => setReservations(data.reservations ?? []))
            .catch(() => setError('Не удалось загрузить ваши брони'));
    }, []);

    useEffect(() => {
        Promise.all([
            loadReservations(),
            api
                .get('/menu')
                .then(({ data }) => {
                    const all = (data.categories ?? []).flatMap((category) => category.menu_items ?? []);
                    setItems(all);
                })
                .catch(() => setItems([])),
        ]).finally(() => setIsLoading(false));
    }, [loadReservations]);

    const cancelReservation = async (reservation) => {
        setError(null);

        try {
            await api.patch(`/my-reservations/${reservation.id}/cancel`);
            await loadReservations();
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? 'Не удалось отменить бронь');
        }
    };

    const handleReviewChange = (event) => {
        const { name, value } = event.target;
        setReview((previous) => ({ ...previous, [name]: value }));
    };

    const submitReview = async (event) => {
        event.preventDefault();
        setReviewStatus('loading');
        setReviewError(null);

        try {
            await api.post('/reviews', {
                menu_item_id: review.menu_item_id ? Number(review.menu_item_id) : null,
                rating: Number(review.rating),
                comment: review.comment || null,
            });

            setReview({ menu_item_id: '', rating: 5, comment: '' });
            setReviewStatus('success');
        } catch (requestError) {
            setReviewStatus('error');
            setReviewError(requestError.response?.data?.message ?? 'Не удалось отправить отзыв');
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mx-auto flex max-w-6xl flex-col gap-6">
                <h1 className="mb-0 text-3xl font-semibold">Личный кабинет</h1>

                <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Мои данные</h2>
                    <div className="grid gap-6 sm:grid-cols-3">
                        <div>
                            <p className="mb-4 text-sm text-amber-50/60">Имя</p>
                            <p className="mb-0">{user?.name ?? '—'}</p>
                        </div>
                        <div>
                            <p className="mb-4 text-sm text-amber-50/60">Email</p>
                            <p className="mb-0 break-all">{user?.email ?? '—'}</p>
                        </div>
                        <div>
                            <p className="mb-4 text-sm text-amber-50/60">Телефон</p>
                            <p className="mb-0">{user?.phone || 'не указан'}</p>
                        </div>
                    </div>
                </section>

                <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Мои брони</h2>

                    {isLoading && <p className="mb-0 text-amber-50/70">Загружаем брони…</p>}

                    {!isLoading && reservations.length === 0 && (
                        <div>
                            <p className="mb-4 text-amber-50/70">У вас пока нет броней.</p>
                            <Link
                                to="/reservation"
                                className="inline-block rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                            >
                                Забронировать столик
                            </Link>
                        </div>
                    )}

                    {reservations.length > 0 && (
                        <div className="overflow-x-auto">
                            <table className="w-full min-w-150 text-left text-sm">
                                <thead className="text-amber-50/60">
                                    <tr>
                                        <th className="pb-4">Дата и время</th>
                                        <th className="pb-4">Столик</th>
                                        <th className="pb-4">Гостей</th>
                                        <th className="pb-4">Статус</th>
                                        <th className="pb-4" />
                                    </tr>
                                </thead>
                                <tbody>
                                    {reservations.map((reservation) => {
                                        const status = reservationStatus(reservation.status);

                                        return (
                                            <tr key={reservation.id} className="border-t border-stone-700">
                                                <td className="py-4">{formatDateTime(reservation.reserved_at)}</td>
                                                <td className="py-4">
                                                    №{reservation.table?.number ?? '—'}
                                                    {reservation.table?.location
                                                        ? `, ${reservation.table.location}`
                                                        : ''}
                                                </td>
                                                <td className="py-4">{reservation.guests}</td>
                                                <td className="py-4">
                                                    <span className={`rounded-lg px-3 py-1 text-xs ${status.badge}`}>
                                                        {status.label}
                                                    </span>
                                                </td>
                                                <td className="py-4 text-right">
                                                    {reservation.status === 'pending' && (
                                                        <button
                                                            type="button"
                                                            onClick={() => cancelReservation(reservation)}
                                                            className="rounded-lg border border-red-700 px-3 py-1 text-xs text-amber-50 transition-colors hover:bg-red-800"
                                                        >
                                                            Отменить
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}

                    {error && <p className="mt-4 mb-0 text-sm text-red-400">{error}</p>}
                </section>

                <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Оставить отзыв</h2>

                    {reviewStatus === 'success' && (
                        <p className="mb-4 text-amber-400">
                            Спасибо за отзыв! Он появится на сайте после модерации.
                        </p>
                    )}

                    <form onSubmit={submitReview} className="flex flex-col gap-6">
                        <label className="flex flex-col gap-3">
                            <span className="text-sm text-amber-50/70">Блюдо</span>
                            <select
                                name="menu_item_id"
                                value={review.menu_item_id}
                                onChange={handleReviewChange}
                                className="mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                            >
                                <option value="">Без привязки к блюду</option>
                                {items.map((item) => (
                                    <option key={item.id} value={item.id}>
                                        {item.name} — {formatPrice(item.price)}
                                    </option>
                                ))}
                            </select>
                        </label>

                        <div className="mb-4">
                            <span className="mb-4 block text-sm text-amber-50/70">Оценка</span>
                            <div className="flex gap-3">
                                {[1, 2, 3, 4, 5].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() =>
                                            setReview((previous) => ({ ...previous, rating: value }))
                                        }
                                        aria-label={`Оценка ${value}`}
                                        className={`text-2xl transition-colors ${
                                            value <= review.rating ? 'text-amber-500' : 'text-stone-600'
                                        }`}
                                    >
                                        ★
                                    </button>
                                ))}
                                <span className="self-center text-sm text-amber-50/60">{review.rating} из 5</span>
                            </div>
                        </div>

                        <textarea
                            name="comment"
                            value={review.comment}
                            onChange={handleReviewChange}
                            rows={4}
                            placeholder="Что вам понравилось?"
                            className="mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />

                        {reviewError && <p className="mb-0 text-sm text-red-400">{reviewError}</p>}

                        <button
                            type="submit"
                            disabled={reviewStatus === 'loading'}
                            className="self-start rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                        >
                            {reviewStatus === 'loading' ? 'Отправляем…' : 'Отправить отзыв'}
                        </button>
                    </form>
                </section>
            </div>
        </div>
    );
}
