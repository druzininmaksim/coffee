/**
 * Источник регулярного выражения строгого формата телефона: +7 (999) 123-45-67.
 * Хранится без слэшей, так как используется в HTML-атрибуте pattern.
 */
export const PHONE_PATTERN = '^\\+7 \\(\\d{3}\\) \\d{3}-\\d{2}-\\d{2}$';

const MASK_PREFIX = '+7 (';
const MAX_LENGTH = 18;

/**
 * Оставляет только цифры и приводит номер к формату с кодом страны 7.
 */
function normalizeDigits(value) {
    let digits = String(value ?? '').replace(/\D/g, '');

    if (digits.startsWith('8')) {
        digits = `7${digits.slice(1)}`;
    }

    if (digits && !digits.startsWith('7')) {
        digits = `7${digits}`;
    }

    return digits.slice(0, 11);
}

/**
 * Форматирует произвольное значение по маске +7 (XXX) XXX-XX-XX.
 * Возвращает пустую строку, если цифр нет.
 */
export function formatPhone(value) {
    const digits = normalizeDigits(value);

    if (!digits) {
        return '';
    }

    const national = digits.slice(1);
    const area = national.slice(0, 3);
    const first = national.slice(3, 6);
    const second = national.slice(6, 8);
    const third = national.slice(8, 10);

    let result = MASK_PREFIX;

    result += area;

    if (area.length === 3) {
        result += ')';
    }

    if (first) {
        result += ` ${first}`;
    }

    if (second) {
        result += `-${second}`;
    }

    if (third) {
        result += `-${third}`;
    }

    return result;
}

export default function PhoneInput({
    name,
    value,
    onChange,
    onBlur,
    className = '',
    placeholder = '+7 (999) 123-45-67',
    required = false,
    autoComplete = 'tel',
    ...rest
}) {
    const emitChange = (formatted) => {
        if (typeof onChange === 'function') {
            // Эмулируем событие, чтобы родительские обработчики вида
            // `({ target: { name, value } }) => ...` работали без изменений.
            onChange({ target: { name, value: formatted } });
        }
    };

    const handleFocus = (event) => {
        if (!value) {
            emitChange(MASK_PREFIX);
        }

        event.target.select();
    };

    const handleChange = (event) => {
        const input = event.target.value;
        const inputDigits = input.replace(/\D/g, '');
        const currentDigits = normalizeDigits(value);

        // Пользователь стирает символ: убираем последнюю цифру,
        // иначе маска мгновенно вернёт её обратно.
        if (input.length < String(value ?? '').length && inputDigits === currentDigits) {
            emitChange(formatPhone(currentDigits.slice(0, -1)));

            return;
        }

        emitChange(formatPhone(inputDigits));
    };

    return (
        <input
            type="tel"
            inputMode="numeric"
            name={name}
            value={value ?? ''}
            onFocus={handleFocus}
            onChange={handleChange}
            onBlur={onBlur}
            maxLength={MAX_LENGTH}
            pattern={PHONE_PATTERN}
            title="Введите номер телефона в формате +7 (999) 123-45-67"
            placeholder={placeholder}
            required={required}
            autoComplete={autoComplete}
            className={className}
            {...rest}
        />
    );
}
