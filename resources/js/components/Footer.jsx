import { Link } from 'react-router-dom';

const socials = [
    { label: 'Telegram', href: 'https://t.me/' },
    { label: 'VK', href: 'https://vk.com/' },
    { label: 'Instagram', href: 'https://instagram.com/' },
];

export default function Footer({ onLeadClick }) {
    return (
        <footer className="border-t border-stone-800 bg-stone-900">
            <div className="mx-auto grid max-w-6xl gap-6 px-4 py-8 md:grid-cols-4">
                <div className="mb-4 md:mb-0">
                    <p className="mb-4 text-lg font-semibold">
                        Roast <span className="text-amber-500">&amp; Co</span>
                    </p>
                    <p className="text-sm text-amber-50/70">
                        Обжариваем кофе небольшими партиями и варим его с 2014 года.
                    </p>
                </div>

                <div className="mb-4 md:mb-0">
                    <p className="mb-4 font-medium text-amber-500">Адрес</p>
                    <p className="text-sm text-amber-50/80">г. Москва, ул. Кофейная, 12</p>
                    <p className="text-sm text-amber-50/80">м. Чистые пруды, 5 минут пешком</p>
                </div>

                <div className="mb-4 md:mb-0">
                    <p className="mb-4 font-medium text-amber-500">Контакты</p>
                    <a href="tel:+74951234567" className="block text-sm text-amber-50/80 hover:text-amber-400">
                        +7 (495) 123-45-67
                    </a>
                    <a href="mailto:hello@roastco.test" className="block text-sm text-amber-50/80 hover:text-amber-400">
                        hello@roastco.test
                    </a>
                    <button
                        type="button"
                        onClick={onLeadClick}
                        className="mt-4 rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                    >
                        Заказать звонок
                    </button>
                </div>

                <div>
                    <p className="mb-4 font-medium text-amber-500">Часы работы</p>
                    <p className="text-sm text-amber-50/80">Пн–Пт: 08:00 – 22:00</p>
                    <p className="text-sm text-amber-50/80">Сб–Вс: 09:00 – 23:00</p>

                    <div className="mt-4 flex flex-wrap gap-3">
                        {socials.map((social) => (
                            <a
                                key={social.label}
                                href={social.href}
                                target="_blank"
                                rel="noreferrer"
                                className="text-sm text-amber-50/70 transition-colors hover:text-amber-400"
                            >
                                {social.label}
                            </a>
                        ))}
                    </div>
                </div>
            </div>

            <div className="border-t border-stone-800 px-4 py-4">
                <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-amber-50/60 md:flex-row md:items-center md:justify-between">
                    <p>© {new Date().getFullYear()} Roast &amp; Co. Все права защищены.</p>
                    <div className="flex gap-6">
                        <Link to="/menu" className="transition-colors hover:text-amber-400">
                            Меню
                        </Link>
                        <Link to="/reservation" className="transition-colors hover:text-amber-400">
                            Бронирование
                        </Link>
                        <Link to="/contacts" className="transition-colors hover:text-amber-400">
                            Контакты
                        </Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
