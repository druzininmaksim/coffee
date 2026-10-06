import { useEffect, useState } from 'react';
import api from '../../api/client';
import Modal from '../../components/Modal';

const emptyForm = { number: '', capacity: '2', location: '', is_active: true };

export default function AdminTables() {
    const [tables, setTables] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [isSaving, setIsSaving] = useState(false);
    const [formError, setFormError] = useState(null);

    const load = () => {
        return api
            .get('/admin/tables')
            .then(({ data }) => setTables(data.tables ?? []))
            .catch(() => setError('Не удалось загрузить столики'));
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

    const openEdit = (table) => {
        setEditing(table);
        setForm({
            number: table.number,
            capacity: table.capacity,
            location: table.location ?? '',
            is_active: Boolean(table.is_active),
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
            number: Number(form.number),
            capacity: Number(form.capacity),
            location: form.location || null,
            is_active: form.is_active,
        };

        try {
            if (editing) {
                await api.put(`/admin/tables/${editing.id}`, payload);
            } else {
                await api.post('/admin/tables', payload);
            }

            await load();
            setIsModalOpen(false);
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setFormError(
                requestError.response?.data?.message ?? firstError ?? 'Не удалось сохранить столик'
            );
        } finally {
            setIsSaving(false);
        }
    };

    const remove = async (table) => {
        if (!window.confirm(`Удалить столик №${table.number}?`)) {
            return;
        }

        try {
            await api.delete(`/admin/tables/${table.id}`);
            await load();
        } catch {
            setError('Не удалось удалить столик');
        }
    };

    const inputClass =
        'mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-wrap items-center justify-between gap-6">
                <h1 className="mb-0 text-2xl font-semibold">Столики</h1>
                <button
                    type="button"
                    onClick={openCreate}
                    className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                >
                    Добавить столик
                </button>
            </div>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
            {isLoading && <p className="mb-0 text-amber-50/70">Загружаем столики…</p>}

            {!isLoading && (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-150 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Номер</th>
                                <th className="pb-4">Вместимость</th>
                                <th className="pb-4">Локация</th>
                                <th className="pb-4">Активен</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {tables.map((table) => (
                                <tr key={table.id} className="border-t border-stone-700">
                                    <td className="py-4">№{table.number}</td>
                                    <td className="py-4">{table.capacity} чел.</td>
                                    <td className="py-4">{table.location ?? '—'}</td>
                                    <td className="py-4">{table.is_active ? 'да' : 'нет'}</td>
                                    <td className="py-4">
                                        <div className="flex justify-end gap-3">
                                            <button
                                                type="button"
                                                onClick={() => openEdit(table)}
                                                className="rounded-lg border border-amber-600 px-3 py-1 text-xs transition-colors hover:bg-amber-600 hover:text-stone-900"
                                            >
                                                Изменить
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => remove(table)}
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

                    {tables.length === 0 && <p className="mb-0 text-amber-50/70">Столиков пока нет.</p>}
                </div>
            )}

            <Modal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={editing ? `Столик №${editing.number}` : 'Новый столик'}
            >
                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="number"
                        name="number"
                        value={form.number}
                        onChange={handleChange}
                        min="1"
                        placeholder="Номер"
                        required
                        className={inputClass}
                    />
                    <input
                        type="number"
                        name="capacity"
                        value={form.capacity}
                        onChange={handleChange}
                        min="1"
                        max="50"
                        placeholder="Вместимость"
                        required
                        className={inputClass}
                    />
                    <input
                        type="text"
                        name="location"
                        value={form.location}
                        onChange={handleChange}
                        placeholder="Локация (например, «У окна»)"
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
                        <span className="text-sm">Доступен для бронирования</span>
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
