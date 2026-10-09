import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import { useAuth } from '../context/AuthContext';

const steps = ['Дата и время', 'Выбор столика', 'Ваши данные', 'Готово'];

function extractError(error, fallback) {
    const errors = error.response?.data?.errors ?? {};
    const firstError = Object.values(errors)[0]?.[0];

    return error.response?.data?.message ?? firstError ?? fallback;
}

export default function Reservation() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState({ date: '', time: '18:00', guests: '2' });
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [contact, setContact] = useState({
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        comment: '',
    });
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSearchChange = (event) => {
        const { name, value } = event.target;
        setSearch((previous) => ({ ...previous, [name]: value }));
    };

    const handleContactChange = (event) => {
        const { name, value } = event.target;
        setContact((previous) => ({ ...previous, [name]: value }));
    };

    const findTables = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.get('/tables/available', {
                params: { date: search.date, time: search.time, guests: Number(search.guests) },
            });

            setTables(data.tables ?? []);
            setSelectedTable(null);
            setStep(2);
        } catch (requestError) {
            setError(extractError(requestError, 'Не удалось получить список столиков'));
        } finally {
            setIsLoading(false);
        }
    };

    const chooseTable = (table) => {
        setSelectedTable(table);
        setError(null);
        setStep(3);
    };

    const createReservation = async (event) => {
        event.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const { data } = await api.post('/reservations', {
                table_id: selectedTable.id,
                name: contact.name,
                phone: contact.phone,
                guests: Number(search.guests),
                reserved_at: `${search.date} ${search.time}`,
                comment: contact.comment || null,
            });

            setBooking(data.reservation);
            setStep(4);
        } catch (requestError) {
            setError(extractError(requestError, 'Не удалось создать бронь'));
        } finally {
            setIsLoading(false);
        }
    };

    const restart = () => {
        setStep(1);
        setSearch({ date: '', time: '18:00', guests: '2' });
        setTables([]);
        setSelectedTable(null);
        setBooking(null);
        setError(null);
    };

    const inputClass =
        'mb-4 w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-4 text-3xl font-semibold">Бронирование столика</h1>

                <ol className="mb-2 flex flex-wrap gap-4 md:gap-6">
                    {steps.map((label, index) => {
                        const number = index + 1;
                        const isDone = step > number;
                        const isCurrent = step === number;

                        return (
                            <li key={label} className="flex items-center gap-2">
                                <span
                                    className={`flex h-8 w-8 items-center justify-center rounded-full font-medium transition-colors ${
                                        isDone || isCurrent
                                            ? 'bg-amber-600 text-stone-900'
                                            : 'bg-stone-800 text-amber-50/60'
                                    }`}
                                >
                                    {isDone ? '✓' : number}
                                </span>
                                <span
                                    className={`text-sm transition-colors md:text-base ${
                                        isCurrent
                                            ? 'font-semibold text-amber-50'
                                            : isDone
                                              ? 'text-amber-50/80'
                                              : 'text-amber-50/60'
                                    }`}
                                >
                                    {label}
                                </span>
                            </li>
                        );
                    })}
                </ol>

                <div
                    aria-hidden="true"
                    className="mb-4 h-1.5 w-full overflow-hidden rounded-full bg-stone-800"
                >
                    <div
                        className="h-full rounded-full bg-amber-600 transition-all duration-500"
                        style={{ width: `${((step - 1) / (steps.length - 1)) * 100}%` }}
                    />
                </div>

                <div className="rounded-lg bg-stone-800 p-6 shadow-md">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                    >
                    {step === 1 && (
                        <form onSubmit={findTables} className="flex flex-col gap-6">
                            <h2 className="mb-0 text-xl font-semibold">Когда вы придёте?</h2>

                            <label className="mb-4 flex flex-col gap-3">
                                <span className="text-sm text-amber-50/70">Дата</span>
                                <input
                                    type="date"
                                    name="date"
                                    value={search.date}
                                    onChange={handleSearchChange}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="mb-4 flex flex-col gap-3">
                                <span className="text-sm text-amber-50/70">Время</span>
                                <input
                                    type="time"
                                    name="time"
                                    value={search.time}
                                    onChange={handleSearchChange}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="mb-4 flex flex-col gap-3">
                                <span className="text-sm text-amber-50/70">Количество гостей</span>
                                <select
                                    name="guests"
                                    value={search.guests}
                                    onChange={handleSearchChange}
                                    className={inputClass}
                                >
                                    {[1, 2, 3, 4, 5, 6].map((value) => (
                                        <option key={value} value={String(value)}>
                                            {value}
                                        </option>
                                    ))}
                                </select>
                            </label>

                            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                            >
                                {isLoading ? 'Ищем столики…' : 'Найти свободные столики'}
                            </button>
                        </form>
                    )}

                    {step === 2 && (
                        <div className="flex flex-col gap-6">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <h2 className="mb-0 text-xl font-semibold">Свободные столики</h2>
                                <button
                                    type="button"
                                    onClick={() => setStep(1)}
                                    className="text-sm text-amber-500 hover:text-amber-400"
                                >
                                    Изменить дату и время
                                </button>
                            </div>

                            <p className="mb-0 text-sm text-amber-50/70">
                                {search.date} в {search.time}, гостей: {search.guests}
                            </p>

                            {tables.length === 0 && (
                                <p className="mb-0 text-amber-50/70">
                                    На это время свободных столиков нет. Попробуйте другое время.
                                </p>
                            )}

                            <div className="grid gap-6 sm:grid-cols-2">
                                {tables.map((table) => (
                                    <button
                                        key={table.id}
                                        type="button"
                                        onClick={() => chooseTable(table)}
                                        className="rounded-lg bg-stone-900 p-4 text-left shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-amber-600 hover:text-stone-900 hover:shadow-[0_0_0_2px_rgba(217,119,6,0.6)]"
                                    >
                                        <p className="mb-4 text-lg font-semibold">Столик №{table.number}</p>
                                        <p className="mb-0 text-sm">Вместимость: {table.capacity} чел.</p>
                                        <p className="mb-0 text-sm">{table.location ?? 'Основной зал'}</p>
                                    </button>
                                ))}
                            </div>

                            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
                        </div>
                    )}

                    {step === 3 && selectedTable && (
                        <form onSubmit={createReservation} className="flex flex-col gap-6">
                            <div className="flex flex-wrap items-center justify-between gap-6">
                                <h2 className="mb-0 text-xl font-semibold">Ваши данные</h2>
                                <button
                                    type="button"
                                    onClick={() => setStep(2)}
                                    className="text-sm text-amber-500 hover:text-amber-400"
                                >
                                    Выбрать другой столик
                                </button>
                            </div>

                            <p className="mb-0 text-sm text-amber-50/70">
                                Столик №{selectedTable.number} ({selectedTable.capacity} чел.),{' '}
                                {search.date} в {search.time}
                            </p>

                            <input
                                type="text"
                                name="name"
                                value={contact.name}
                                onChange={handleContactChange}
                                placeholder="Имя"
                                required
                                className={inputClass}
                            />
                            <input
                                type="tel"
                                name="phone"
                                value={contact.phone}
                                onChange={handleContactChange}
                                placeholder="+7 (999) 123-45-67"
                                pattern="[0-9+\s\-\(\)]{10,20}"
                                title="Введите номер телефона в формате +7 (999) 123-45-67"
                                required
                                className={inputClass}
                            />
                            <textarea
                                name="comment"
                                value={contact.comment}
                                onChange={handleContactChange}
                                rows={3}
                                placeholder="Комментарий (необязательно)"
                                className={inputClass}
                            />

                            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:opacity-60"
                            >
                                {isLoading ? 'Бронируем…' : 'Подтвердить бронь'}
                            </button>
                        </form>
                    )}

                    {step === 4 && booking && (
                        <div className="flex flex-col gap-6">
                            <h2 className="mb-0 text-xl font-semibold">Бронь оформлена</h2>
                            <p className="mb-0 text-amber-50/80">
                                Мы ждём вас {search.date} в {search.time}. Бронь в статусе «ожидает
                                подтверждения» — администратор свяжется с вами по телефону.
                            </p>

                            <div className="rounded-lg bg-stone-900 p-4">
                                <p className="mb-4">
                                    <span className="text-amber-50/70">Столик:</span> №
                                    {booking.table?.number ?? selectedTable?.number}
                                </p>
                                <p className="mb-4">
                                    <span className="text-amber-50/70">Гостей:</span> {booking.guests}
                                </p>
                                <p className="mb-0">
                                    <span className="text-amber-50/70">Телефон:</span> {booking.phone}
                                </p>
                            </div>

                            {!user && (
                                <p className="mb-0 text-sm text-amber-50/70">
                                    <Link to="/register" className="text-amber-500 hover:text-amber-400">
                                        Зарегистрируйтесь
                                    </Link>
                                    , чтобы видеть свои брони в личном кабинете.
                                </p>
                            )}

                            <div className="flex flex-wrap gap-6">
                                <button
                                    type="button"
                                    onClick={restart}
                                    className="rounded-lg bg-amber-600 px-6 py-3 font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500"
                                >
                                    Забронировать ещё
                                </button>
                                <Link
                                    to="/"
                                    className="rounded-lg border border-amber-600 px-6 py-3 font-medium transition-colors hover:bg-amber-600 hover:text-stone-900"
                                >
                                    На главную
                                </Link>
                            </div>
                        </div>
                    )}
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
