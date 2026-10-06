import { useEffect, useState } from 'react';
import api from '../../api/client';
import { formatDateTime } from '../../utils/status';

export default function AdminLeads() {
    const [leads, setLeads] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    const load = () => {
        return api
            .get('/admin/leads')
            .then(({ data }) => setLeads(data.leads ?? []))
            .catch(() => setError('Не удалось загрузить заявки'));
    };

    useEffect(() => {
        load().finally(() => setIsLoading(false));
    }, []);

    const remove = async (lead) => {
        if (!window.confirm(`Удалить заявку от «${lead.name}»?`)) {
            return;
        }

        try {
            await api.delete(`/admin/leads/${lead.id}`);
            await load();
        } catch {
            setError('Не удалось удалить заявку');
        }
    };

    return (
        <div className="flex flex-col gap-6">
            <h1 className="mb-0 text-2xl font-semibold">Заявки на звонок</h1>

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
            {isLoading && <p className="mb-0 text-amber-50/70">Загружаем заявки…</p>}

            {!isLoading && (
                <div className="overflow-x-auto rounded-lg bg-stone-800 p-6 shadow-md">
                    <table className="w-full min-w-250 text-left text-sm">
                        <thead className="text-amber-50/60">
                            <tr>
                                <th className="pb-4">Имя</th>
                                <th className="pb-4">Телефон</th>
                                <th className="pb-4">Email</th>
                                <th className="pb-4">Сообщение</th>
                                <th className="pb-4">Дата</th>
                                <th className="pb-4">Статус</th>
                                <th className="pb-4" />
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map((lead) => (
                                <tr key={lead.id} className="border-t border-stone-700">
                                    <td className="py-4">{lead.name}</td>
                                    <td className="py-4">{lead.phone}</td>
                                    <td className="py-4 break-all">{lead.email || '—'}</td>
                                    <td className="py-4 max-w-75">{lead.message || '—'}</td>
                                    <td className="py-4">{formatDateTime(lead.created_at)}</td>
                                    <td className="py-4">
                                        <span className="rounded-lg bg-amber-600 px-3 py-1 text-xs text-stone-900">
                                            {lead.status === 'new' ? 'Новая' : lead.status}
                                        </span>
                                    </td>
                                    <td className="py-4">
                                        <div className="flex justify-end">
                                            <button
                                                type="button"
                                                onClick={() => remove(lead)}
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

                    {leads.length === 0 && <p className="mb-0 text-amber-50/70">Заявок пока нет.</p>}
                </div>
            )}
        </div>
    );
}
