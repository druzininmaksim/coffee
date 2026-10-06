import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';
import { dishImage, formatPrice } from '../../utils/format';

const emptyForm = {
    name: '',
    category_id: '',
    description: '',
    price: '',
    is_available: true,
    image: null,
};

export default function AdminMenu() {
    const [items, setItems] = useState([]);
    const [categories, setCategories] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const load = () => {
        return Promise.all([api.get('/admin/menu-items'), api.get('/admin/categories')])
            .then(([itemsResponse, categoriesResponse]) => {
                setItems(itemsResponse.data.menu_items ?? []);
                setCategories(categoriesResponse.data.categories ?? []);
            })
            .catch(() => setError('Не удалось загрузить меню'));
    };

    useEffect(() => {
        load().finally(() => setIsLoading(false));
    }, []);

    const openCreate = () => {
        setEditing(null);
        setForm({ ...emptyForm, category_id: categories[0]?.id ?? '' });
        setFormError(null);
        setIsModalOpen(true);
    };

    const openEdit = (item) => {
        setEditing(item);
        setForm({
            name: item.name,
            category_id: item.category_id,
            description: item.description ?? '',
            price: item.price,
            is_available: Boolean(item.is_available),
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

        const data = new FormData();
        data.append('name', form.name);
        data.append('category_id', form.category_id);
        data.append('description', form.description ?? '');
        data.append('price', form.price);
        data.append('is_available', form.is_available ? '1' : '0');

        if (form.image) {
            data.append('image', form.image);
        }

        if (editing) {
            data.append('_method', 'PUT');
        }

        try {
            await api.post(editing ? `/admin/menu-items/${editing.id}` : '/admin/menu-items', data);
            await load();
            setIsModalOpen(false);
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setFormError(
                requestError.response?.data?.message ?? firstError ?? 'Не удалось сохранить блюдо'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const remove = async (item) => {
        if (!window.confirm(`Удалить «${item.name}»?`)) {
            return;
        }

        try {
            await api.delete(`/admin/menu-items/${item.id}`);
            await load();
        } catch {
            setError('Не удалось удалить блюдо');
        }
    };

    const inputClass =
        'mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Меню</h1>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                >
                    Добавить блюдо
                </button>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
            {isLoading && <p className="mb-0 text-amber-50/70">Загружаем блюда…</p>}

            {!isLoading && (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-200 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Фото</th>
                                <th className="pb-4">Название</th>
                                <th className="pb-4">Категория</th>
                                <th className="pb-4">Цена</th>
                                <th className="pb-4">Доступно</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item) => (
                                <tr key={item.id} className="border-t border-stone-700">
                                    <td className="py-4">
                                        <img
                                            src={dishImage(item)}
                                            alt={item.name}
                                            className="h-12 w-16 rounded-lg object-cover"
                                        />
                                    </td>
                                    <td className="py-4">{item.name}</td>
                                    <td className="py-4">{item.category?.name ?? '—'}</td>
                                    <td className="py-4">{formatPrice(item.price)}</td>
                                    <td className="py-4">{item.is_available ? 'да' : 'нет'}</td>
                                    <td className="py-4">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(item)}
                                                className="rounded-lg border border-amber-600 px-3 py-1 text-xs transition-colors hover:bg-amber-600 hover:text-stone-900"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(item)}
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

                    {items.length === 0 && <p className="mb-0 text-amber-50/70">Блюд пока нет.</p>}
                </div>
            )}

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editing ? 'Изменить блюдо' : 'Новое блюдо'}
                wide
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Название"
                        required
                        className={inputClass}
                    />

                    <select
                        name="category_id"
                        value={form.category_id}
                        onChange={handleChange}
                        required
                        className={inputClass}
                    >
                        <option value="">Выберите категорию</option>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>
                                {category.name}
                            </option>
                        ))}
                    </select>

                    <textarea
                        name="description"
                        value={form.description}
                        onChange={handleChange}
                        rows={3}
                        placeholder="Описание"
                        className={inputClass}
                    />

                    <input
                        type="number"
                        name="price"
                        value={form.price}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        placeholder="Цена"
                        required
                        className={inputClass}
                    />

                    <label className="mb-4 flex items-center gap-3">
                        <input
                            type="checkbox"
                            name="is_available"
                            checked={form.is_available}
                            onChange={handleChange}
                            className="h-4 w-4 accent-amber-600"
                        />
                        <span className="text-sm">Показывать в меню</span>
                    </label>

                    <label className="flex flex-col gap-3">
                        <span className="text-sm text-amber-50/70">Фото</span>
                        <input
                            type="file"
                            name="image"
                            accept="image/*"
                            onChange={handleChange}
                            className="mb-4 w-full text-sm text-amber-50/70"
                        />
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
