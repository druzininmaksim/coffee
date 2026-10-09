import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';

const emptyForm = {
    code: '',
    discount_type: 'percent',
    discount_value: '10',
    min_order_amount: '0',
    valid_from: '',
    valid_until: '',
    usage_limit: '',
    is_active: true,
};

export default function AdminPromocodes() {
    const [promocodes, setPromocodes] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const load = () => {
        return api
            .get('/admin/promocodes')
            .then(({ data }) => setPromocodes(data.promocodes ?? []))
            .catch(() => setError('Не удалось загрузить промокоды'));
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

    const openEdit = (promocode) => {
        setEditing(promocode);
        setForm({
            code: promocode.code,
            discount_type: promocode.discount_type,
            discount_value: promocode.discount_value,
            min_order_amount: promocode.min_order_amount ?? '0',
            valid_from: promocode.valid_from ? promocode.valid_from.slice(0, 16) : '',
            valid_until: promocode.valid_until ? promocode.valid_until.slice(0, 16) : '',
            usage_limit: promocode.usage_limit ?? '',
            is_active: Boolean(promocode.is_active),
        });
        setFormError(null);
        setIsModalOpen(true);
    };

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target;

        setForm((previous) => ({
            ...previous,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSaving(true);
        setFormError(null);

        const payload = {
            code: form.code,
            discount_type: form.discount_type,
            discount_value: Number(form.discount_value),
            min_order_amount: Number(form.min_order_amount || 0),
            valid_from: form.valid_from || null,
            valid_until: form.valid_until || null,
            usage_limit: form.usage_limit ? Number(form.usage_limit) : null,
            is_active: form.is_active,
        };

        try {
            if (editing) {
                await api.put(`/admin/promocodes/${editing.id}`, payload);
            } else {
                await api.post('/admin/promocodes', payload);
            }

            await load();
            setIsModalOpen(false);
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setFormError(
                requestError.response?.data?.message ?? firstError ?? 'Не удалось сохранить промокод'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const remove = async (promocode) => {
        if (!window.confirm(`Удалить промокод ${promocode.code}?`)) {
            return;
        }

        try {
            await api.delete(`/admin/promocodes/${promocode.id}`);
            await load();
        } catch {
            setError('Не удалось удалить промокод');
        }
    };

    const discountLabel = (promocode) =>
        promocode.discount_type === 'percent'
            ? `${Number(promocode.discount_value)}%`
            : `${Number(promocode.discount_value)} ₽`;

    const inputClass =
        'mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Промокоды</h1>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                >
                    + Новый промокод
                </button>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

            {isLoading ? (
                <p className="mb-0 text-amber-50/70">Загружаем промокоды…</p>
            ) : (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-200 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Код</th>
                                <th className="pb-4">Скидка</th>
                                <th className="pb-4">Мин. сумма</th>
                                <th className="pb-4">Период</th>
                                <th className="pb-4">Использован</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4 text-right">Действия</th>
                            </tr>
                        </thead>
                        <tbody>
                            {promocodes.map((promocode) => (
                                <tr key={promocode.id} className="border-t border-stone-700">
                                    <td className="py-4 font-semibold text-amber-500">{promocode.code}</td>
                                    <td className="py-4">{discountLabel(promocode)}</td>
                                    <td className="py-4">{Number(promocode.min_order_amount)} ₽</td>
                                    <td className="py-4">
                                        {promocode.valid_from ? promocode.valid_from.slice(0, 10) : '—'}
                                        {' — '}
                                        {promocode.valid_until ? promocode.valid_until.slice(0, 10) : '∞'}
                                    </td>
                                    <td className="py-4">
                                        {promocode.used_count}
                                        {promocode.usage_limit ? ` / ${promocode.usage_limit}` : ''}
                                    </td>
                                    <td className="py-4">
                                        <span
                                            className={`rounded-lg px-3 py-1 text-xs ${
                                                promocode.is_active
                                                    ? 'bg-green-900/60 text-green-300'
                                                    : 'bg-stone-700 text-amber-50/60'
                                            }`}
                                        >
                                            {promocode.is_active ? 'активен' : 'выключен'}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex justify-end gap-2">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(promocode)}
                                                className="rounded-lg border border-stone-600 px-3 py-1.5 text-xs transition-colors hover:bg-stone-700"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(promocode)}
                                                className="rounded-lg border border-red-800 px-3 py-1.5 text-xs text-red-300 transition-colors hover:bg-red-800"
                                            >
                                                Удалить
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {promocodes.length === 0 && (
                        <p className="mb-0 text-amber-50/70">Промокодов пока нет.</p>
                    )}
                </div>
            )}

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editing ? `Промокод ${editing.code}` : 'Новый промокод'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="code"
                        value={form.code}
                        onChange={handleChange}
                        placeholder="Код, например WELCOME10"
                        required
                        className={inputClass}
                    />
                    <div className="flex flex-wrap gap-3">
                        <select
                            name="discount_type"
                            value={form.discount_type}
                            onChange={handleChange}
                            className={inputClass}
                        >
                            <option value="percent">Процент (%)</option>
                            <option value="fixed">Фикс. сумма (₽)</option>
                        </select>
                        <input
                            type="number"
                            name="discount_value"
                            value={form.discount_value}
                            onChange={handleChange}
                            min="0"
                            step="0.01"
                            placeholder="Величина скидки"
                            required
                            className={inputClass}
                        />
                    </div>
                    <input
                        type="number"
                        name="min_order_amount"
                        value={form.min_order_amount}
                        onChange={handleChange}
                        min="0"
                        step="0.01"
                        placeholder="Минимальная сумма заказа"
                        className={inputClass}
                    />
                    <div className="flex flex-wrap gap-3">
                        <input
                            type="datetime-local"
                            name="valid_from"
                            value={form.valid_from}
                            onChange={handleChange}
                            className={inputClass}
                        />
                        <input
                            type="datetime-local"
                            name="valid_until"
                            value={form.valid_until}
                            onChange={handleChange}
                            className={inputClass}
                        />
                    </div>
                    <input
                        type="number"
                        name="usage_limit"
                        value={form.usage_limit}
                        onChange={handleChange}
                        min="1"
                        placeholder="Лимит применений (пусто = без лимита)"
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
                        <span className="text-sm">Активен</span>
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
