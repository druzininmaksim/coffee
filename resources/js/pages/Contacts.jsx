import { useState } from 'react';
import api from '../api/client';

const initialForm = { name: '', phone: '', email: '', message: '' };

export default function Contacts() {
    const [form, setForm] = useState(initialForm);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState(null);

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
            setForm(initialForm);
            setStatus('success');
        } catch (requestError) {
            setStatus('error');
            setError(
                requestError.response?.data?.message ?? 'Не удалось отправить сообщение. Попробуйте позже.'
            );
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-4 text-3xl font-semibold">Контакты</h1>

                <div className="mb-4 grid gap-6 md:grid-cols-2">
                    <div className="flex flex-col gap-6 rounded-lg bg-stone-800 p-6 shadow-md">
                        <div>
                            <p className="mb-4 font-medium text-amber-500">Адрес</p>
                            <p className="mb-0 text-amber-50/80">г. Москва, ул. Кофейная, 12</p>
                            <p className="mb-0 text-amber-50/80">м. Чистые пруды, 5 минут пешком</p>
                        </div>

                        <div>
                            <p className="mb-4 font-medium text-amber-500">Телефон</p>
                            <a href="tel:+74951234567" className="text-amber-50/80 hover:text-amber-400">
                                +7 (495) 123-45-67
                            </a>
                        </div>

                        <div>
                            <p className="mb-4 font-medium text-amber-500">Email</p>
                            <a href="mailto:hello@roastco.test" className="text-amber-50/80 hover:text-amber-400">
                                hello@roastco.test
                            </a>
                        </div>

                        <div>
                            <p className="mb-4 font-medium text-amber-500">Часы работы</p>
                            <p className="mb-0 text-amber-50/80">Пн–Пт: 08:00 – 22:00</p>
                            <p className="mb-0 text-amber-50/80">Сб–Вс: 09:00 – 23:00</p>
                        </div>
                    </div>

                    <div className="flex min-h-80 items-center justify-center rounded-lg bg-stone-800 p-6 text-center shadow-md">
                        <div>
                            <p className="mb-4 font-medium text-amber-500">Карта</p>
                            <p className="mb-0 text-sm text-amber-50/60">
                                Здесь будет интерактивная карта
                                <br />
                                (Яндекс.Карты или Google Maps)
                            </p>
                        </div>
                    </div>
                </div>

                <div className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <h2 className="mb-4 text-xl font-semibold">Форма обратной связи</h2>

                    {status === 'success' && (
                        <p className="mb-4 text-amber-400">
                            Спасибо! Сообщение отправлено, мы свяжемся с вами.
                        </p>
                    )}

                    <form onSubmit={handleSubmit} className="grid gap-6 md:grid-cols-2">
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
                            placeholder="+7 (999) 123-45-67"
                            pattern="[0-9+\s\-\(\)]{10,20}"
                            title="Введите номер телефона в формате +7 (999) 123-45-67"
                            required
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                        />
                        <input
                            type="email"
                            name="email"
                            value={form.email}
                            onChange={handleChange}
                            placeholder="Email (необязательно)"
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600 md:col-span-2"
                        />
                        <textarea
                            name="message"
                            value={form.message}
                            onChange={handleChange}
                            rows={4}
                            placeholder="Сообщение"
                            className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600 md:col-span-2"
                        />

                        {error && <p className="mb-0 text-sm text-red-400 md:col-span-2">{error}</p>}

                        <button
                            type="submit"
                            disabled={status === 'loading'}
                            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60 md:col-span-2 md:justify-self-start"
                        >
                            {status === 'loading' ? 'Отправляем…' : 'Отправить'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
