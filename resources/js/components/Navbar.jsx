import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

const links = [
    { to: '/', label: 'Главная' },
    { to: '/menu', label: 'Меню' },
    { to: '/about', label: 'О нас' },
    { to: '/contacts', label: 'Контакты' },
];

const linkClass = ({ isActive }) =>
    `relative whitespace-nowrap transition-colors hover:text-amber-400 ${
        isActive
            ? 'text-amber-500 underline decoration-amber-500 decoration-2 underline-offset-8'
            : 'text-amber-50'
    }`;

const authButtonClass =
    'whitespace-nowrap rounded-lg border border-stone-700 px-3 py-2 text-sm font-medium text-amber-50 transition-colors hover:border-amber-600 hover:text-amber-400';

const authNavClass = ({ isActive }) =>
    `${authButtonClass} ${isActive ? 'border-amber-600 text-amber-500' : ''}`;

export default function Navbar() {
    const { isAuthenticated, user, logout } = useAuth();
    const { count } = useCart();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        setIsMenuOpen(false);
        navigate('/');
    };

    return (
        <header className="sticky top-0 z-40 border-b border-stone-800 bg-stone-900/80 backdrop-blur-md">
            <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
                <Link
                    to="/"
                    className="group mb-0 flex shrink-0 items-center gap-2 whitespace-nowrap text-xl font-semibold tracking-wide"
                >
                    <span className="inline-block transition-transform duration-300 group-hover:rotate-12 group-hover:scale-125">
                        ☕
                    </span>
                    Roast <span className="text-amber-500">&amp; Co</span>
                </Link>

                <div className="hidden flex-1 items-center justify-center gap-6 md:flex">
                    {links.map((link) => (
                        <NavLink key={link.to} to={link.to} className={linkClass} end={link.to === '/'}>
                            {link.label}
                        </NavLink>
                    ))}
                </div>

                <div className="hidden shrink-0 items-center gap-3 md:flex">
                    {isAuthenticated && (
                        <NavLink
                            to="/cart"
                            className={({ isActive }) =>
                                `relative whitespace-nowrap rounded-lg border border-stone-700 px-3 py-2 text-sm transition-colors hover:border-amber-600 ${
                                    isActive ? 'border-amber-600 text-amber-500' : ''
                                }`
                            }
                        >
                            🛒 Корзина
                            {count > 0 && (
                                <span className="absolute -right-2 -top-2 flex h-5 min-w-5 items-center justify-center rounded-full bg-amber-600 px-1 text-xs font-semibold text-stone-900">
                                    {count}
                                </span>
                            )}
                        </NavLink>
                    )}

                    <Link
                        to="/reservation"
                        className="whitespace-nowrap rounded-lg bg-amber-600 px-4 py-2 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                    >
                        Забронировать столик
                    </Link>

                    {isAuthenticated ? (
                        <>
                            <NavLink to="/profile" className={authNavClass}>
                                Профиль
                            </NavLink>

                            {user?.role === 'admin' && (
                                <NavLink to="/admin" className={authNavClass}>
                                    Админка
                                </NavLink>
                            )}

                            <button
                                type="button"
                                onClick={handleLogout}
                                className={authButtonClass}
                            >
                                Выйти
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className={authButtonClass}>
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

                            <NavLink
                                to="/orders"
                                className={linkClass}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Мои заказы
                            </NavLink>

                            <NavLink
                                to="/cart"
                                className={linkClass}
                                onClick={() => setIsMenuOpen(false)}
                            >
                                Корзина{count > 0 ? ` (${count})` : ''}
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
