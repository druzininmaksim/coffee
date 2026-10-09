import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { dishImage, formatPrice } from '../utils/format';

export default function Cart() {
    const { items, loading, setQuantity, remove, clear } = useCart();

    const total = items.reduce(
        (sum, item) => sum + Number(item.menu_item?.price ?? 0) * Number(item.quantity ?? 0),
        0
    );

    const changeQuantity = async (item, next) => {
        const quantity = Number(item.quantity) + next;

        if (quantity < 1) {
            await remove(item);

            return;
        }

        if (quantity > 20) {
            return;
        }

        try {
            await setQuantity(item, quantity);
        } catch {
            // Игнорируем ошибку обновления количества.
        }
    };

    const removeItem = async (item) => {
        try {
            await remove(item);
        } catch {
            // Игнорируем ошибку удаления.
        }
    };

    const clearCart = async () => {
        if (!window.confirm('Очистить корзину?')) {
            return;
        }

        try {
            await clear();
        } catch {
            // Игнорируем ошибку очистки.
        }
    };

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-4 text-3xl font-semibold">Корзина</h1>

                {loading && <p className="text-amber-50/70">Загружаем корзину…</p>}

                {!loading && items.length === 0 && (
                    <div className="rounded-lg bg-stone-800 p-8 text-center shadow-md">
                        <p className="mb-4 text-amber-50/80">Ваша корзина пуста.</p>
                        <Link
                            to="/menu"
                            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                        >
                            Перейти в меню
                        </Link>
                    </div>
                )}

                {items.length > 0 && (
                    <>
                        <div className="flex flex-col gap-4">

                            {items.map((item) => (
                                <div
                                    key={item.id}
                                    className="flex flex-wrap items-center gap-4 rounded-lg bg-stone-800 p-4 shadow-md"
                                >
                                    <img
                                        src={dishImage(item.menu_item)}
                                        alt={item.menu_item?.name ?? ''}
                                        className="h-16 w-16 rounded-lg object-cover"
                                    />

                                    <div className="min-w-40 flex-1">
                                        <p className="mb-0 font-medium">
                                            {item.menu_item?.name ?? 'Блюдо'}
                                        </p>
                                        <p className="mb-0 text-sm text-amber-50/70">
                                            {formatPrice(item.menu_item?.price ?? 0)}
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(item, -1)}
                                            className="h-8 w-8 rounded-lg bg-stone-700 font-medium transition-colors hover:bg-stone-600"
                                            aria-label="Уменьшить"
                                        >
                                            −
                                        </button>
                                        <span className="w-6 text-center">{item.quantity}</span>
                                        <button
                                            type="button"
                                            onClick={() => changeQuantity(item, 1)}
                                            className="h-8 w-8 rounded-lg bg-stone-700 font-medium transition-colors hover:bg-stone-600"
                                            aria-label="Увеличить"
                                        >
                                            +
                                        </button>
                                    </div>

                                    <p className="w-28 text-right font-semibold text-amber-500">
                                        {formatPrice(
                                            Number(item.menu_item?.price ?? 0) * Number(item.quantity)
                                        )}
                                    </p>

                                    <button
                                        type="button"
                                        onClick={() => removeItem(item)}
                                        className="rounded-lg border border-stone-600 px-3 py-2 text-sm transition-colors hover:border-red-800 hover:bg-red-800"
                                    >
                                        Удалить
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex flex-wrap items-center justify-between gap-6 rounded-lg bg-stone-800 p-6 shadow-md">
                            <p className="mb-0 text-xl">
                                Итого:{' '}
                                <span className="font-semibold text-amber-500">{formatPrice(total)}</span>
                            </p>

                            <div className="flex flex-wrap gap-3">
                                <button
                                    type="button"
                                    onClick={clearCart}
                                    className="rounded-lg border border-stone-600 px-4 py-2 font-medium transition-colors hover:bg-stone-700"
                                >
                                    Очистить
                                </button>
                                <Link
                                    to="/checkout"
                                    className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                                >
                                    Оформить заказ
                                </Link>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
