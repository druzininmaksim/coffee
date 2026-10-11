/**
 * Источник регулярного выражения для имени: буквы (русские и латинские),
 * пробелы и дефисы между словами. Хранится без слэшей, так как
 * используется в HTML-атрибуте pattern.
 */
export const NAME_PATTERN = '^[A-Za-zА-Яа-яЁё]+(?:[ -][A-Za-zА-Яа-яЁё]+)*$';

export const NAME_REQUIRED_MESSAGE = 'Укажите имя';
export const NAME_MIN_MESSAGE = 'Имя должно быть не короче 2 символов';
export const NAME_MAX_MESSAGE = 'Имя не должно быть длиннее 255 символов';
export const NAME_FORMAT_MESSAGE = 'Имя может содержать только буквы, пробелы и дефисы';

const NAME_REGEX = new RegExp(NAME_PATTERN, 'u');

/**
 * Проверяет имя и возвращает текст ошибки либо null, если значение корректно.
 */
export function validateName(value) {
    const trimmed = String(value ?? '').trim();

    if (!trimmed) {
        return NAME_REQUIRED_MESSAGE;
    }

    if (trimmed.length < 2) {
        return NAME_MIN_MESSAGE;
    }

    if (trimmed.length > 255) {
        return NAME_MAX_MESSAGE;
    }

    if (!NAME_REGEX.test(trimmed)) {
        return NAME_FORMAT_MESSAGE;
    }

    return null;
}

export default function NameInput({
    name,
    value,
    onChange,
    onBlur,
    error = null,
    className = '',
    placeholder = 'Имя',
    required = true,
    autoComplete = 'name',
    ...rest
}) {
    return (
        <div className="relative">
            <input
                type="text"
                name={name}
                value={value ?? ''}
                onChange={onChange}
                onBlur={onBlur}
                placeholder={placeholder}
                required={required}
                autoComplete={autoComplete}
                pattern={NAME_PATTERN}
                title={NAME_FORMAT_MESSAGE}
                aria-invalid={error ? 'true' : undefined}
                className={className}
                {...rest}
            />

            {error && <p className="mb-0 text-sm text-red-400">{error}</p>}
        </div>
    );
}
