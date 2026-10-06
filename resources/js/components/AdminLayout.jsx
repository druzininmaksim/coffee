import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/admin', label: 'Dashboard', end: true },
    { to: '/admin/menu', label: 'Меню' },
    { to: '/admin/tables', label: 'Столики' },
    { to: '/admin/reservations', label: 'Брони' },
    { to: '/admin/reviews', label: 'Отзывы' },
    { to: '/admin/leads', label: 'Заявки' },
];

const linkClass = ({ isActive }) =>
    `block rounded-lg px-4 py-2 transition-colors ${
        isActive ? 'bg-amber-600 text-stone-900' : 'text-amber-50 hover:bg-stone-700'
    }`;

export default function AdminLayout() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const handleLogout = async () => {
        await logout();
        navigate('/');
    };

    return (
        <div className="flex min-h-screen flex-col bg-stone-900 text-amber-50 md:flex-row">
            <aside
                className={`border-b border-stone-800 bg-stone-800/60 md:min-h-screen md:w-64 md:border-b-0 md:border-r ${
                    isSidebarOpen ? 'block' : 'hidden md:block'
                }`}
            >
                <div className="flex flex-col gap-6 p-4">
                    <Link to="/admin" className="text-lg font-semibold">
                        Roast <span className="text-amber-500">&amp; Co</span>
                        <span className="block text-xs uppercase tracking-widest text-amber-50/60">
                            админ-панель
                        </span>
                    </Link>

                    <nav className="flex flex-col gap-3">
                        {links.map((link) => (
                            <NavLink
                                key={link.to}
                                to={link.to}
                                end={link.end}
                                className={linkClass}
                                onClick={() => setIsSidebarOpen(false)}
                            >
                                {link.label}
                            </NavLink>
                        ))}
                    </nav>

                    <div className="mt-4 flex flex-col gap-3 border-t border-stone-700 pt-4">
                        <p className="mb-0 text-sm text-amber-50/70">{user?.email}</p>
                        <button
                            type="button"
                            onClick={handleLogout}
                            className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                        >
                            Выйти
                        </button>
                        <Link to="/" className="text-sm text-amber-50/70 transition-colors hover:text-amber-400">
                            ← На сайт
                        </Link>
                    </div>
                </div>
            </aside>

            <div className="flex min-w-0 flex-1 flex-col">
                <header className="flex items-center justify-between gap-6 border-b border-stone-800 px-4 py-4 md:hidden">
                    <span className="font-semibold">Админ-панель</span>
                    <button
                        type="button"
                        onClick={() => setIsSidebarOpen((value) => !value)}
                        className="rounded-lg border border-stone-700 px-3 py-2 text-sm"
                    >
                        {isSidebarOpen ? 'Закрыть' : 'Меню'}
                    </button>
                </header>

                <main className="flex-1 px-4 py-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
