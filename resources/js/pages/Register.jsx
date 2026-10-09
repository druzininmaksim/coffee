import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const initialForm = { name: '', email: '', phone: '', password: '' };

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState(initialForm);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleChange = (event) => {
        const { name, value } = event.target;
        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            await register(form);
            navigate('/');
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setError(
                requestError.response?.data?.message ?? firstError ?? 'Не удалось зарегистрироваться'
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-md rounded-lg bg-stone-800 p-6 shadow-md">
                <h1 className="mb-4 text-2xl font-semibold">Регистрация</h1>
                <p className="mb-4 text-sm text-amber-50/70">
                    Создайте аккаунт — так бронировать столики станет быстрее.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <input
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        placeholder="Имя"
                        required
                        autoComplete="name"
                        className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                    />
                    <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        placeholder="Email"
                        required
                        autoComplete="email"
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
                        autoComplete="tel"
                        className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                    />
                    <input
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Пароль (минимум 8 символов)"
                        required
                        minLength={8}
                        autoComplete="new-password"
                        className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                    />

                    {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                    >
                        {isLoading ? 'Создаём аккаунт…' : 'Зарегистрироваться'}
                    </button>
                </form>

                <p className="mt-4 mb-0 text-sm text-amber-50/70">
                    Уже есть аккаунт?{' '}
                    <Link to="/login" className="text-amber-500 hover:text-amber-400">
                        Войти
                    </Link>
                </p>
            </div>
        </div>
    );
}
