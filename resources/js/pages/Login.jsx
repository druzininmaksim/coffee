import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
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
            await login(form.email, form.password);
            navigate('/');
        } catch (requestError) {
            setError(requestError.response?.data?.message ?? 'Неверный email или пароль');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-md rounded-lg bg-stone-800 p-6 shadow-md">
                <h1 className="mb-4 text-2xl font-semibold">Вход</h1>
                <p className="mb-4 text-sm text-amber-50/70">
                    Войдите, чтобы видеть свои брони и оставлять отзывы.
                </p>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
                        type="password"
                        name="password"
                        value={form.password}
                        onChange={handleChange}
                        placeholder="Пароль"
                        required
                        autoComplete="current-password"
                        className="mb-4 rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600"
                    />

                    {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                    >
                        {isLoading ? 'Входим…' : 'Войти'}
                    </button>
                </form>

                <p className="mt-4 mb-0 text-sm text-amber-50/70">
                    Нет аккаунта?{' '}
                    <Link to="/register" className="text-amber-500 hover:text-amber-400">
                        Зарегистрироваться
                    </Link>
                </p>
            </div>
        </div>
    );
}
