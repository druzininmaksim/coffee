import { useEffect, useState } from 'react';
import api from '../api/client';

const initialForm = { name: '', phone: '', email: '', message: '' };

export default function LeadModal({ open, onClose }) {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!open) {
            setForm(initialForm);
            setStatus('idle');
            setError(null);
        }
    }, [open]);

    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };

        if (open) {
            document.addEventListener('keydown', handleKeyDown);
        }

        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    if (!open) {
        return null;
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setStatus('loading');
        setError(null);

        try {
            await api.post('/leads', form);
            setStatus('success');
        } catch (requestError) {
            setStatus('error');
            setError(
                requestError.response?.data?.message ?? 'Не удалось отправить заявку. Попробуйте позже.'
            );
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-stone-900/80 px-4 py-8">
            <div className="w-full max-w-lg rounded-lg bg-stone-800 p-6 shadow-md">
                <div className="mb-4 flex items-start justify-between gap-6">
                    <h2 className="text-xl font-semibold">Заказать звонок</h2>
                    <button
                        type="button"
                        onClick={onClose}
                        className="text-amber-50/70 transition-colors hover:text-amber-400"
                        aria-label="Закрыть"
                    >
                        ✕
                    </button>
                </div>

                {status === 'success' ? (
                    <div className="mb-4">
                        <p className="mb-4">Спасибо! Мы перезвоним вам в ближайшее время.</p>
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                        >
                            Закрыть
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <input
                            type="text"
                            name="name"
                            value={form.name}
                            onChange={handleChange}
                            placeholder="Ваше имя"
                            required
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />
                        <input
                            type="tel"
                            name="phone"
                            value={form.phone}
                            onChange={handleChange}
                            placeholder="+7 (___) ___-__-__"
                            required
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email (необязательно)"
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={3}
                            placeholder="Сообщение (необязательно)"
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />

                        {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                        >
                            {status === 'loading' ? 'Отправляем…' : 'Отправить'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
