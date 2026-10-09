import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { formatPrice } from '../utils/format';

export default function Checkout() {
    const { user } = useAuth();
    const { items, clear } = useCart();
    const navigate = useNavigate();
    const [form, setForm] = useState(() => ({
        type: 'pickup',
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        address: '',
        comment: '',
    }));
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [promoInput, setPromoInput] = useState('');
    const [promo, setPromo] = useState(null);
    const [promoMessage, setPromoMessage] = useState(null);
    const [promoError, setPromoError] = useState(null);
    const [isPromoChecking, setIsPromoChecking] = useState(false);

    const total = items.reduce(
        (sum, item) => sum + Number(item.menu_item?.price ?? 0) * Number(item.quantity ?? 0),
        0
    );

    const finalTotal = Math.max(total - (promo?.discount ?? 0), 0);

    const handleChange = (event) => {
        const { name, value } = event.target;

        setForm((previous) => ({ ...previous, [name]: value }));
    };

    const handleApplyPromocode = async () => {
        if (!promoInput.trim()) {
            return;
        }

        setIsPromoChecking(true);
        setPromoError(null);
        setPromoMessage(null);

        try {
            const { data } = await api.post('/promocodes/check', {
                code: promoInput,
                amount: total,
            });

            setPromo({ code: data.promocode.code, discount: Number(data.discount) });
            setPromoMessage(`Промокод ${data.promocode.code} применён: −${formatPrice(Number(data.discount))}`);
        } catch (requestError) {
            setPromo(null);
            setPromoError(requestError.response?.data?.message ?? 'Не удалось проверить промокод');
        } finally {
            setIsPromoChecking(false);
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const payload = {
            type: form.type,
            name: form.name,
            phone: form.phone,
            address: form.type === 'delivery' ? form.address : null,
            comment: form.comment || null,
            promocode: promo?.code ?? null,
            subtotal: total,
            discount: promo?.discount ?? 0,
            total: finalTotal,
        };

        try {
            const { data } = await api.post('/orders', payload);

            await clear();
            navigate('/orders', { state: { createdId: data.order?.id ?? null } });
        } catch (requestError) {
            const errors = requestError.response?.data?.errors ?? {};
            const firstError = Object.values(errors)[0]?.[0];

            setError(requestError.response?.data?.message ?? firstError ?? 'Не удалось создать заказ');
            setIsSubmitting(false);
        }
    };

    const inputClass =
        'w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-4xl">
                <h1 className="mb-4 text-3xl font-semibold">Оформление заказа</h1>

                {items.length === 0 ? (
                    <div className="rounded-lg bg-stone-800 p-8 text-center shadow-md">
                        <p className="mb-4 text-amber-50/80">Корзина пуста — нечего оформлять.</p>
                        <Link
                            to="/menu"
                            className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                        >
                            Перейти в меню
                        </Link>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                        <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold">Способ получения</h2>
                            <div className="flex flex-wrap gap-3">
                                {[
                                    { value: 'pickup', label: 'Самовывоз' },
                                    { value: 'delivery', label: 'Доставка' },
                                ].map((option) => (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => setForm((prev) => ({ ...prev, type: option.value }))}
                                        className={`rounded-lg px-4 py-2 font-medium shadow-md transition-colors ${
                                            form.type === option.value
                                                ? 'bg-amber-600 text-stone-900'
                                                : 'bg-stone-900 text-amber-50 hover:bg-stone-700'
                                        }`}
                                    >
                                        {option.label}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold">Контактные данные</h2>

                            <label className="mb-4 block">
                                <span className="mb-2 block text-sm text-amber-50/70">Имя</span>
                                <input
                                    type="text"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="mb-4 block">
                                <span className="mb-2 block text-sm text-amber-50/70">Телефон</span>
                                <input
                                    type="tel"
                                    name="phone"
                                    value={form.phone}
                                    onChange={handleChange}
                                    required
                                    placeholder="+7 (999) 123-45-67"
                                    pattern="[0-9+\s\-\(\)]{10,20}"
                                    title="Введите номер телефона в формате +7 (999) 123-45-67"
                                    className={inputClass}
                                />
                            </label>

                            {form.type === 'delivery' && (
                                <label className="mb-4 block">
                                    <span className="mb-2 block text-sm text-amber-50/70">Адрес доставки</span>
                                    <input
                                        type="text"
                                        name="address"
                                        value={form.address}
                                        onChange={handleChange}
                                        required
                                        placeholder="Улица, дом, квартира"
                                        className={inputClass}
                                    />
                                </label>
                            )}

                            <label className="block">
                                <span className="mb-2 block text-sm text-amber-50/70">Комментарий</span>
                                <textarea
                                    name="comment"
                                    value={form.comment}
                                    onChange={handleChange}
                                    rows={3}
                                    placeholder="Пожелания к заказу"
                                    className={inputClass}
                                />
                            </label>
                        </section>

                        <section className="rounded-lg bg-stone-800 p-6 shadow-md">
                            <h2 className="mb-4 text-xl font-semibold">Ваш заказ</h2>
                            <ul className="mb-4 flex flex-col gap-2">
                                {items.map((item) => (
                                    <li
                                        key={item.id}
                                        className="flex items-center justify-between gap-4 border-b border-stone-700 pb-2"
                                    >
                                        <span>
                                            {item.menu_item?.name} × {item.quantity}
                                        </span>
                                        <span className="text-amber-500">
                                            {formatPrice(
                                                Number(item.menu_item?.price ?? 0) * Number(item.quantity)
                                            )}
                                        </span>
                                    </li>
                                ))}
                            </ul>

                            <div className="mb-4 flex flex-wrap items-end gap-3">
                                <label className="min-w-48 flex-1">
                                    <span className="mb-2 block text-sm text-amber-50/70">Промокод</span>
                                    <input
                                        type="text"
                                        value={promoInput}
                                        onChange={(event) => setPromoInput(event.target.value.toUpperCase())}
                                        placeholder="Например, WELCOME10"
                                        className={inputClass}
                                    />
                                </label>
                                <button
                                    type="button"
                                    onClick={handleApplyPromocode}
                                    disabled={isPromoChecking}
                                    className="rounded-lg border border-amber-600 px-6 py-2 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900 disabled:opacity-60"
                                >
                                    {isPromoChecking ? 'Проверяем…' : 'Применить'}
                                </button>
                            </div>

                            {promoMessage && <p className="mb-4 text-sm text-green-400">{promoMessage}</p>}
                            {promoError && <p className="mb-4 text-sm text-red-400">{promoError}</p>}

                            {promo && (
                                <p className="mb-2 flex flex-wrap justify-between gap-2 text-amber-50/80">
                                    <span>Скидка по промокоду {promo.code}:</span>
                                    <span className="text-green-400">−{formatPrice(promo.discount)}</span>
                                </p>
                            )}
                            <p className="mb-0 text-lg">
                                Итого:{' '}
                                <span className="font-semibold text-amber-500">
                                    {formatPrice(finalTotal)}
                                </span>
                            </p>
                        </section>

                        {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="self-start rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                        >
                            {isSubmitting ? 'Оформляем…' : 'Подтвердить заказ'}
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
}
