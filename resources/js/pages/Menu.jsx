import { useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import MenuItemCard from '../components/MenuItemCard';

export default function Menu() {
    const [categories, setCategories] = useState([]);
    const [activeSlug, setActiveSlug] = useState('all');
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        api.get('/menu')
            .then(({ data }) => setCategories(data.categories ?? []))
            .catch(() => setError('Не удалось загрузить меню. Попробуйте обновить страницу.'))
            .finally(() => setIsLoading(false));
    }, []);

    const items = useMemo(() => {
        if (activeSlug === 'all') {
            return categories.flatMap((category) => category.menu_items ?? []);
        }

        const category = categories.find((item) => item.slug === activeSlug);

        return category?.menu_items ?? [];
    }, [categories, activeSlug]);

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-6xl">
                <h1 className="mb-4 text-3xl font-semibold">Меню</h1>
                <p className="mb-4 text-amber-50/80">
                    Все напитки и блюда готовим на месте. Цены указаны в рублях.
                </p>

                <div className="mb-4 flex flex-wrap gap-3">
                    <button
                        type="button"
                        onClick={() => setActiveSlug('all')}
                        className={`rounded-lg px-4 py-2 font-medium shadow-md transition-colors ${
                            activeSlug === 'all'
                                ? 'bg-amber-600 text-stone-900'
                                : 'bg-stone-800 text-amber-50 hover:bg-amber-600 hover:text-stone-900'
                        }`}
                    >
                        Все
                    </button>

                    {categories.map((category) => (
                        <button
                            key={category.id}
                            type="button"
                            onClick={() => setActiveSlug(category.slug)}
                            className={`rounded-lg px-4 py-2 font-medium shadow-md transition-colors ${
                                activeSlug === category.slug
                                    ? 'bg-amber-600 text-stone-900'
                                    : 'bg-stone-800 text-amber-50 hover:bg-amber-600 hover:text-stone-900'
                            }`}
                        >
                            {category.name}
                        </button>
                    ))}
                </div>

                {isLoading && (
                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                        {[...Array(6)].map((_, index) => (
                            <div
                                key={index}
                                className="mb-4 overflow-hidden rounded-lg bg-stone-800 shadow-md"
                            >
                                <div className="h-48 w-full animate-pulse bg-stone-700" />
                                <div className="flex flex-col gap-3 p-4">
                                    <div className="h-5 w-2/3 animate-pulse rounded bg-stone-700" />
                                    <div className="h-4 w-full animate-pulse rounded bg-stone-700/70" />
                                    <div className="h-4 w-1/2 animate-pulse rounded bg-stone-700/70" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}
                {error && <p className="text-red-400">{error}</p>}

                {!isLoading && !error && items.length === 0 && (
                    <p className="text-amber-50/70">В этой категории пока нет доступных позиций.</p>
                )}

                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((item, index) => (
                        <MenuItemCard
                            key={item.id}
                            item={item}
                            index={index}
                            isHit={activeSlug === 'all' && index < 3}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}
