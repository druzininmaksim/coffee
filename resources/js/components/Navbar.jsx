import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const links = [
    { to: '/', label: 'Главная' },
    { to: '/menu', label: 'Меню' },
    { to: '/about', label: 'О нас' },
    { to: '/contacts', label: 'Контакты' },
];

const linkClass = ({ isActive }) =>
    `transition-colors hover:text-amber-400 ${isActive ? 'text-amber-500' : 'text-amber-50'}`;

const adminLinkClass = ({ isActive }) =>
    `font-medium transition-colors hover:text-amber-400 ${
        isActive ? 'text-amber-400' : 'text-amber-500'
    }`;

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/95 backdrop-blur">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link to="/" className="mb-0 text-xl font-semibold tracking-wide">
                    Roast <span className="text-amber-500">&amp; Co</span>
                </Link>

                <div className="hidden items-center gap-6 md:flex">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden items-center gap-3 md:flex">
                    <Link
                        to="/reservation"
                        className="rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                    >
                        Забронировать столик
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/profile" className={linkClass}>
                                Профиль
                            </NavLink>

                            {user?.role === 'admin' && (
                                <NavLink to="/admin" className={adminLinkClass}>
                                    Админка
                                </NavLink>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-amber-600 px-4 py-2 font-medium text-amber-50 transition-colors hover:bg-amber-600 hover:text-stone-900"
                            >
                                Выйти{user?.name ? ` (${user.name})` : ''}
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            className="rounded-lg border border-amber-600 px-4 py-2 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                        >
                            Войти
                        </Link>
                    )}
                </div>

                <button
                    type="button"
                    onClick={() => setIsMenuOpen((value) => !value)}
                    className="rounded-lg border border-stone-700 px-3 py-2 text-sm md:hidden"
                    aria-label="Меню"
                >
                    {isMenuOpen ? 'Закрыть' : 'Меню'}
                </button>
            </nav>

            {isMenuOpen && (
                <div className="flex flex-col gap-3 border-t border-stone-800 px-4 py-4 md:hidden">
                    {links.map((link) => (
                        <NavLink
                            key={link.to}
                            to={link.to}
                            className={linkClass}
                            end={link.to === '/'}
                            onClick={() => setIsMenuOpen(false)}
                        >
                            {link.label}
                        </NavLink>
                    ))}

                    <Link
                        to="/reservation"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-center font-medium text-stone-900 transition-colors hover:bg-amber-500"
                    >
                        Забронировать столик
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <NavLink
                                to="/profile"
                                className={linkClass}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Профиль
                            </NavLink>

                            {user?.role === 'admin' && (
                                <NavLink
                                    to="/admin"
                                    className={adminLinkClass}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    Админка
                                </NavLink>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className="rounded-lg border border-amber-600 px-4 py-2 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <Link
                            to="/login"
                            onClick={() => setIsMenuOpen(false)}
                            className="rounded-lg border border-amber-600 px-4 py-2 text-center font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                        >
                            Войти
                        </Link>
                    )}
                </div>
            )}
        </header>
    );
}
