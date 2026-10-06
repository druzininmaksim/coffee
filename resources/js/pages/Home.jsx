import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../api/client';
import MenuItemCard from '../components/MenuItemCard';
import { ABOUT_IMAGE, HERO_IMAGE } from '../utils/format';

export default function Home() {
    const [popular, setPopular] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        api.get('/menu')
            .then(({ data }) => {
                const items = (data.categories ?? []).flatMap((category) => category.menu_items ?? []);
                setPopular(items.slice(0, 4));
            })
            .catch(() => setPopular([]))
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <div className="px-4 py-8">
            <section className="mx-auto mb-4 max-w-6xl">
                <div className="relative overflow-hidden rounded-lg shadow-md">
                    <img src={HERO_IMAGE} alt="Кофейня Roast & Co" className="h-96 w-full object-cover" />
                    <div className="absolute inset-0 bg-stone-900/70" />
                    <div className="absolute inset-0 flex flex-col justify-center gap-6 px-4 py-8 md:px-12">
                        <p className="mb-0 text-sm uppercase tracking-[0.3em] text-amber-500">
                            Спешелти-кофейня
                        </p>
                        <h1 className="mb-0 max-w-2xl text-3xl font-semibold md:text-5xl">
                            Свежая обжарка, честный эспрессо и уютный зал в центре города
                        </h1>
                        <p className="mb-0 max-w-xl text-amber-50/80">
                            Мы обжариваем зерно каждую неделю и готовим кофе так, чтобы вы возвращались.
                        </p>
                        <div className="flex flex-wrap gap-6">
                            <Link
                                to="/reservation"
                                className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                            >
                                Забронировать столик
                            </Link>
                            <Link
                                to="/menu"
                                className="rounded-lg border border-amber-600 px-6 py-3 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                            >
                                Смотреть меню
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto mb-4 max-w-6xl py-8">
                <h2 className="mb-4 text-2xl font-semibold md:text-3xl">Популярные позиции</h2>

                {isLoading && <p className="text-amber-50/70">Загружаем меню…</p>}

                {!isLoading && popular.length === 0 && (
                    <p className="text-amber-50/70">Меню пока пустое. Загляните позже.</p>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {popular.map((item) => (
                        <MenuItemCard key={item.id} item={item} />
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-6xl py-8">
                <div className="grid items-center gap-6 md:grid-cols-2">
                    <img
                        src={ABOUT_IMAGE}
                        alt="Интерьер кофейни"
                        className="h-80 w-full rounded-lg object-cover shadow-md"
                    />
                    <div className="flex flex-col gap-6">
                        <h2 className="mb-0 text-2xl font-semibold md:text-3xl">О нас</h2>
                        <p className="mb-0 text-amber-50/80">
                            Roast &amp; Co — небольшая кофейня, которая выросла из домашней обжарки.
                            Мы сами выбираем зерно, обжариваем его малыми партиями и подаём напитки,
                            в которых чувствуется характер.
                        </p>
                        <p className="mb-0 text-amber-50/80">
                            У нас 5 столиков, барная стойка и всегда свежая выпечка. Забронируйте
                            столик заранее — по выходным места заканчиваются быстро.
                        </p>
                        <Link
                            to="/about"
                            className="self-start rounded-lg border border-amber-600 px-6 py-3 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                        >
                            Наша история
                        </Link>
                    </div>
                </div>
            </section>
        </div>
    );
}
