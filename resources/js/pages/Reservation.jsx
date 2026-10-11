import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import api from '../api/client';
import NameInput, { validateName } from '../components/NameInput';
import PhoneInput, { formatPhone } from '../components/PhoneInput';
import { useAuth } from '../context/AuthContext';

const steps = ['Дата и время', 'Выбор столика', 'Ваши данные', 'Готово'];

function extractError(error, fallback) {
    const errors = error.response?.data?.errors ?? {};
    const firstError = Object.values(errors)[0]?.[0];

    return error.response?.data?.message ?? firstError ?? fallback;
}

/**
 * Сегодняшняя дата в формате YYYY-MM-DD (для атрибута min у поля даты).
 */
function todayString() {
    const now = new Date();

    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(
        now.getDate()
    ).padStart(2, '0')}`;
}

// Часы работы кофейни: слоты бронирования ограничены этим интервалом.
const WORK_START = '08:00';
const WORK_END = '22:00';

// Шаг сетки доступных слотов бронирования, минуты.
const SLOT_STEP_MINUTES = 30;

// Минимальный запас времени между оформлением брони и визитом, минуты.
const MIN_LEAD_MINUTES = 60;

function pad(value) {
    return String(value).padStart(2, '0');
}

/**
 * Количество минут от начала суток для слота вида HH:MM.
 */
function slotMinutes(slot) {
    const [hours, minutes] = slot.split(':').map(Number);

    return hours * 60 + minutes;
}

/**
 * Все слоты бронирования: с открытия до закрытия с шагом 30 минут
 * (08:00, 08:30, … 21:30, 22:00).
 */
function buildTimeSlots() {
    const slots = [];

    for (
        let minutes = slotMinutes(WORK_START);
        minutes <= slotMinutes(WORK_END);
        minutes += SLOT_STEP_MINUTES
    ) {
        slots.push(`${pad(Math.floor(minutes / 60))}:${pad(minutes % 60)}`);
    }

    return slots;
}

const TIME_SLOTS = buildTimeSlots();

/**
 * Слоты, доступные для выбранной даты: на сегодняшнюю дату остаются только те,
 * что наступают не раньше чем через час от текущего момента, на будущие — все.
 */
function availableSlots(date, reference = Date.now()) {
    if (!date) {
        return [];
    }

    if (date !== todayString()) {
        return TIME_SLOTS;
    }

    const min = new Date(reference + MIN_LEAD_MINUTES * 60 * 1000);

    // Ограничение округляем вверх до минуты, чтобы не показать слот, который
    // сервер уже не примет из-за «лишних» секунд.
    const cutoff = min.getHours() * 60 + min.getMinutes() + (min.getSeconds() > 0 ? 1 : 0);

    return TIME_SLOTS.filter((slot) => slotMinutes(slot) >= cutoff);
}

/**
 * Текст ошибки для выбранных даты и времени либо null, если слот доступен.
 */
function slotError(date, time) {
    if (!date) {
        return 'Выберите дату визита.';
    }

    const slots = availableSlots(date);

    if (slots.length === 0) {
        return 'На сегодня свободных слотов нет, выберите другую дату';
    }

    if (!time || !slots.includes(time)) {
        return 'Выберите доступное время визита.';
    }

    return null;
}

/**
 * Белая иконка-стрелка выпадающего списка: по центру поля, у правого края.
 */
function SelectChevron() {
    return (
        <svg
            aria-hidden="true"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="pointer-events-none absolute top-1/2 right-4 h-5 w-5 -translate-y-1/2 text-white"
        >
            <path d="m6 9 6 6 6-6" />
        </svg>
    );
}

export default function Reservation() {
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [search, setSearch] = useState({ date: '', time: '', guests: '2' });
    const [tables, setTables] = useState([]);
    const [selectedTable, setSelectedTable] = useState(null);
    const [contact, setContact] = useState({
        name: user?.name ?? '',
        phone: user?.phone ?? '',
        comment: '',
    });
    const [booking, setBooking] = useState(null);
    const [error, setError] = useState(null);
    const [nameError, setNameError] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [now, setNow] = useState(() => Date.now());

    const today = todayString();

    const timeSlots = useMemo(() => availableSlots(search.date, now), [search.date, now]);

    // При смене даты список времени пересчитывается автоматически: если выбранный
    // слот пропал, выбираем первый доступный; если слотов не осталось — сбрасываем.
    useEffect(() => {
        if (timeSlots.length === 0) {
            if (search.time !== '') {
                setSearch((previous) => ({ ...previous, time: '' }));
            }

            return;
        }

        if (!timeSlots.includes(search.time)) {
            setSearch((previous) => ({ ...previous, time: timeSlots[0] }));
        }
    }, [timeSlots, search.time]);

    useEffect(() => {
        if (!user) {
            return;
        }

        setContact((previous) => ({
            ...previous,
            name: previous.name || user.name || '',
            phone: previous.phone || formatPhone(user.phone),
        }));
    }, [user]);

    // Раз в минуту обновляем «текущий момент», чтобы список слотов не устаревал.
    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), 60_000);

        return () => clearInterval(timer);
    }, []);

    const handleSearchChange = (event) => {
        const { name, value } = event.target;
        setSearch((previous) => ({ ...previous, [name]: value }));
    };

    const handleContactChange = (event) => {
        const { name, value } = event.target;
        setContact((previous) => ({ ...previous, [name]: value }));

        // Пока пользователь исправляет поле, пересчитываем ошибку имени.
        if (name === 'name' && nameError) {
            setNameError(validateName(value));
        }
    };

    const handleNameBlur = () => setNameError(validateName(contact.name));

    const findTables = async (event) => {
        event.preventDefault();
        setError(null);

        const invalidSlot = slotError(search.date, search.time);

        if (invalidSlot) {
            setError(invalidSlot);

            return;
        }

        setIsLoading(true);

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

        const invalidSlot = slotError(search.date, search.time);

        if (invalidSlot) {
            setError(invalidSlot);

            return;
        }

        const invalidName = validateName(contact.name);

        setNameError(invalidName);

        if (invalidName) {
            return;
        }

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
        setSearch({ date: '', time: '', guests: '2' });
        setTables([]);
        setSelectedTable(null);
        setBooking(null);
        setError(null);
        setNameError(null);
    };

    // Базовые стили поля — без внешнего отступа, чтобы обёртка .relative совпадала
    // по высоте с самим полем и иконка-стрелка встала ровно по центру.
    const fieldClass =
        'w-full rounded-lg border border-stone-700 bg-stone-900 px-4 py-2 text-amber-50 outline-none focus:border-amber-600';
    const inputClass = `mb-4 ${fieldClass}`;

    return (
        <div className="px-4 py-8">
            <div className="mx-auto max-w-3xl">
                <h1 className="mb-4 text-3xl font-semibold">Бронирование столика</h1>

                <ol className="mb-2 flex flex-wrap items-center gap-3 md:gap-4">
                    {steps.map((label, index) => {
                        const number = index + 1;
                        const isDone = step > number;
                        const isCurrent = step === number;

                        return (
                            <li key={label} className="flex items-center gap-2">
                                <span
                                    className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 bg-stone-900 font-semibold transition-colors ${
                                        isDone
                                            ? 'border-green-500 text-green-500'
                                            : isCurrent
                                              ? 'border-amber-600 text-amber-600'
                                              : 'border-stone-600 text-stone-400'
                                    }`}
                                >
                                    {isDone ? '✓' : number}
                                </span>
                                <span
                                    className={`text-sm transition-colors md:text-base ${
                                        isCurrent
                                            ? 'font-semibold text-amber-50'
                                            : isDone
                                              ? 'text-green-500'
                                              : 'text-stone-400'
                                    }`}
                                >
                                    {label}
                                </span>
                                {number < steps.length && (
                                    <span
                                        aria-hidden="true"
                                        className="flex items-center text-stone-500"
                                    >
                                        →
                                    </span>
                                )}
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
                                    min={today}
                                    required
                                    className={inputClass}
                                />
                            </label>

                            <label className="mb-4 flex flex-col gap-3">
                                <span className="text-sm text-amber-50/70">Время</span>
                                <div className="relative mb-4">
                                    <select
                                        name="time"
                                        value={search.time}
                                        onChange={handleSearchChange}
                                        disabled={timeSlots.length === 0}
                                        required
                                        className={`${fieldClass} appearance-none pr-10 disabled:cursor-not-allowed disabled:opacity-60`}
                                    >
                                        {timeSlots.length === 0 ? (
                                            <option value="">—</option>
                                        ) : (
                                            timeSlots.map((slot) => (
                                                <option key={slot} value={slot}>
                                                    {slot}
                                                </option>
                                            ))
                                        )}
                                    </select>
                                    <SelectChevron />
                                </div>
                            </label>

                            {search.date === '' && (
                                <p className="mb-0 text-sm text-amber-50/70">
                                    Сначала выберите дату — и мы покажем свободное время.
                                </p>
                            )}

                            {search.date !== '' && timeSlots.length === 0 && (
                                <p className="mb-0 text-sm text-red-400">
                                    На сегодня свободных слотов нет, выберите другую дату
                                </p>
                            )}

                            <label className="mb-4 flex flex-col gap-3">
                                <span className="text-sm text-amber-50/70">Количество гостей</span>
                                <div className="relative mb-4">
                                    <select
                                        name="guests"
                                        value={search.guests}
                                        onChange={handleSearchChange}
                                        className={`${fieldClass} appearance-none pr-10`}
                                    >
                                        {[1, 2, 3, 4, 5, 6].map((value) => (
                                            <option key={value} value={String(value)}>
                                                {value}
                                            </option>
                                        ))}
                                    </select>
                                    <SelectChevron />
                                </div>
                            </label>

                            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}

                            <button
                                type="submit"
                                disabled={isLoading || timeSlots.length === 0}
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

                            {!user && (
                                <p className="mb-0 text-sm text-amber-50/70">
                                    Вы бронируете как гость. Укажите имя и телефон — по ним мы
                                    подтвердим бронь.
                                </p>
                            )}

                            <NameInput
                                name="name"
                                value={contact.name}
                                onChange={handleContactChange}
                                onBlur={handleNameBlur}
                                error={nameError}
                                placeholder="Имя"
                                required
                                className={inputClass}
                            />
                            <PhoneInput
                                name="phone"
                                value={contact.phone}
                                onChange={handleContactChange}
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
                            <h2 className="mb-0 text-3xl font-bold text-green-500">
                                Бронь оформлена!
                            </h2>
                            <p className="mb-0 text-lg text-amber-50">
                                Мы ждём вас {search.date} в {search.time}. Столик №
                                {booking.table?.number ?? selectedTable?.number} зарезервирован.
                            </p>

                            <p className="mb-0">
                                <span className="inline-block rounded-full bg-green-500/15 px-4 py-1 text-sm font-medium text-green-500">
                                    Ждём вас
                                </span>
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
