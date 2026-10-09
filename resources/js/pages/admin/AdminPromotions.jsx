import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { dishImage } from '../../utils/format';

const emptyForm = { title: '', description: '', sort_order: '0', is_active: true, image: null };

export default function AdminPromotions() {
    const [promotions, setPromotions] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const load = () => {
        return api
            .get('/admin/promotions')
            .then(({ data }) => setPromotions(data.promotions ?? []))
            .catch(() => setError('Не удалось загрузить акции'));
    };

    useEffect(() => {
        load().finally(() => setIsLoading(false));
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEdit = (promotion) => {
        setEditing(promotion);
        setForm({
            title: promotion.title,
            description: promotion.description ?? '',
            sort_order: promotion.sort_order ?? 0,
            is_active: Boolean(promotion.is_active),
            image: null,
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleChange = (event) => {
        const { name, value, type, checked, files } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : type === 'file' ? files[0] ?? null : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setFormError(null);

        // Бэкенд принимает multipart/form-data, т.к. есть загрузка изображения.
        const payload = new FormData();
        payload.append('title', form.title);
        payload.append('description', form.description ?? '');
        payload.append('sort_order', String(form.sort_order ?? 0));
        payload.append('is_active', form.is_active ? '1' : '0');

        if (form.image) {
            payload.append('image', form.image);
        }

        try {
            if (editing) {
                await api.put(`/admin/promotions/${editing.id}`, payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            } else {
                await api.post('/admin/promotions', payload, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
            }

            await load();
            setIsModalOpen(false);
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setFormError(
                requestError.response?.data?.message ?? firstError ?? 'Не удалось сохранить акцию'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const remove = async (promotion) => {
        if (!window.confirm(`Удалить акцию «${promotion.title}»?`)) {
            return;
        }

        try {
            await api.delete(`/admin/promotions/${promotion.id}`);
            await load();
        } catch {
            setError('Не удалось удалить акцию');
        }
    };

    const inputClass =
        'mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Акции</h1>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                >
                    + Новая акция
                </button>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

            {isLoading ? (
                <p className="mb-0 text-amber-50/70">Загружаем акции…</p>
            ) : (
                <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                    {promotions.map((promotion) => (
                        <article
                            key={promotion.id}
                            className="flex flex-col overflow-hidden rounded-lg bg-stone-800 shadow-md"
                        >
                            <img
                                src={dishImage(promotion)}
                                alt={promotion.title}
                                className="h-40 w-full object-cover"
                            />
                            <div className="flex flex-1 flex-col gap-3 p-4">
                                <h3 className="mb-0 text-lg font-semibold">{promotion.title}</h3>
                                {promotion.description && (
                                    <p className="mb-0 flex-1 text-sm text-amber-50/70">
                                        {promotion.description}
                                    </p>
                                )}
                                <div className="flex items-center justify-between gap-3">
                                    <span
                                        className={`rounded-lg px-3 py-1 text-xs ${
                                            promotion.is_active
                                                ? 'bg-green-900/60 text-green-300'
                                                : 'bg-stone-700 text-amber-50/60'
                                        }`}
                                    >
                                        {promotion.is_active ? 'активна' : 'скрыта'}
                                    </span>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={() => openEdit(promotion)}
                                            className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs transition-colors hover:bg-stone-700"
                                        >
                                            Изменить
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => remove(promotion)}
                                            className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-800"
                                        >
                                            Удалить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </article>
                    ))}

                    {promotions.length === 0 && <p className="mb-0 text-amber-50/70">Акций пока нет.</p>}
                </div>
            )}

            <Modal
                open={isModalOpen}
                title={editing ? 'Редактировать акцию' : 'Новая акция'}
                onClose={() => setIsModalOpen(false)}
            >
                <form onSubmit={handleSubmit}>
                    <input
                        type="file"
                        name="image"
                        accept="image/*"
                        onChange={handleChange}
                        className={inputClass}
                    />

                    {editing?.image && !form.image && (
                        <img
                            src={dishImage(editing)}
                            alt={editing.title}
                            className="mb-4 h-32 w-full rounded-lg object-cover"
                        />
                    )}

                    <input
                        type="text"
                        name="title"
                        value={form.title}
                        onChange={handleChange}
                        placeholder="Название акции"
                        required
                        maxLength={255}
                        className={inputClass}
                    />
                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        placeholder="Описание акции"
                        rows={3}
                        className={inputClass}
                    />
                    <input
                        type="number"
                        name="sort_order"
                        value={form.sort_order}
                        onChange={handleChange}
                        min="0"
                        placeholder="Порядок сортировки"
                        className={inputClass}
                    />
                    <label className="mb-4 flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_active"
                            checked={form.is_active}
                            onChange={handleChange}
                            className="h-4 w-4 accent-amber-600"
                        />
                        <span className="text-sm">Активна (показывать на главной)</span>
                    </label>

                    {formError && <p className="mb-0 text-sm text-red-400">{formError}</p>}

                    <div className="flex flex-wrap gap-6">
                        <button
                            type="submit"
                            disabled={isSaving}
                            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                        >
                            {isSaving ? 'Сохраняем…' : 'Сохранить'}
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsModalOpen(false)}
                            className="rounded-lg border border-stone-600 px-6 py-3 font-medium transition-colors hover:bg-stone-700"
                        >
                            Отмена
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
