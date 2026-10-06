import { useEffect, useState } from 'react';
import api from '../../api/client';
import { formatDateTime } from '../../utils/status';

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        return api
            .get('/admin/reviews')
            .then(({ data }) => setReviews(data.reviews ?? []))
            .catch(() => setError('Не удалось загрузить отзывы'));
    };

    useEffect(() => {
        load().finally(() => setIsLoading(false));
    }, []);

    const approve = async (review) => {
        try {
            await api.patch(`/admin/reviews/${review.id}/approve`);
            await load();
        } catch {
            setError('Не удалось опубликовать отзыв');
        }
    };

    const remove = async (review) => {
        if (!window.confirm('Удалить отзыв?')) {
            return;
        }

        try {
            await api.delete(`/admin/reviews/${review.id}`);
            await load();
        } catch {
            setError('Не удалось удалить отзыв');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="mb-0 text-2xl font-semibold">Отзывы</h1>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
            {isLoading && <p className="mb-0 text-amber-50/70">Загружаем отзывы…</p>}

            {!isLoading && (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-250 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Автор</th>
                                <th className="pb-4">Блюдо</th>
                                <th className="pb-4">Оценка</th>
                                <th className="pb-4">Текст</th>
                                <th className="pb-4">Дата</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {reviews.map((review) => (
                                <tr key={review.id} className="border-t border-stone-700">
                                    <td className="py-4">{review.user?.name ?? 'Гость'}</td>
                                    <td className="py-4">{review.menu_item?.name ?? '—'}</td>
                                    <td className="py-4 text-amber-500">{'★'.repeat(review.rating)}</td>
                                    <td className="py-4 max-w-75">{review.comment || '—'}</td>
                                    <td className="py-4">{formatDateTime(review.created_at)}</td>
                                    <td className="py-4">
                                        <span
                                            className={`rounded-lg px-3 py-1 text-xs ${
                                                review.is_published
                                                    ? 'bg-green-700 text-amber-50'
                                                    : 'bg-amber-600 text-stone-900'
                                            }`}
                                        >
                                            {review.is_published ? 'Опубликован' : 'На модерации'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex flex-wrap justify-end gap-3">
                                            {!review.is_published && (
                                                <button
                                                    type="button"
                                                    onClick={() => approve(review)}
                                                    className="rounded-lg border border-green-700 px-3 py-1 text-xs transition-colors hover:bg-green-800"
                                                >
                                                    Опубликовать
                                                </button>
                                            )}
                                            <button
                                                type="button"
                                                onClick={() => remove(review)}
                                                className="rounded-lg border border-red-700 px-3 py-1 text-xs transition-colors hover:bg-red-800"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {reviews.length === 0 && <p className="mb-0 text-amber-50/70">Отзывов пока нет.</p>}
                </div>
            )}
        </div>
    );
}
