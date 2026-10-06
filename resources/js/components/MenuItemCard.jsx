import { dishImage, formatPrice } from '../utils/format';

export default function MenuItemCard({ item }) {
    return (
        <article className="mb-4 flex flex-col overflow-hidden rounded-lg bg-stone-800 shadow-md">
            <img
                src={dishImage(item)}
                alt={item.name}
                loading="lazy"
                className="h-48 w-full object-cover"
            />
            <div className="flex flex-1 flex-col gap-3 p-4">
                <h3 className="mb-0 text-lg font-semibold">{item.name}</h3>
                {item.description && (
                    <p className="mb-0 flex-1 text-sm text-amber-50/70">{item.description}</p>
                )}
                <p className="mb-0 font-semibold text-amber-500">{formatPrice(item.price)}</p>
            </div>
        </article>
    );
}
