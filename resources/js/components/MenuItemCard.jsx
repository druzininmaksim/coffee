import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { dishImage, formatPrice } from '../utils/format';

export default function MenuItemCard({ item, index = 0, isHit = false }) {
    const { isAuthenticated } = useAuth();
    const { add } = useCart();
    const navigate = useNavigate();

    const handleAdd = async () => {
        if (!isAuthenticated) {
            navigate('/login', { state: { from: '/menu' } });

            return;
        }

        try {
            await add(item.id);
        } catch {
            // Молча игнорируем — карточка не должна ломать страницу меню.
        }
    };

    return (
        <motion.article
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: 'easeOut', delay: index * 0.07 }}
            whileHover={{ y: -6, scale: 1.05 }}
            className="relative mb-4 flex flex-col overflow-hidden rounded-lg bg-stone-800 shadow-md transition-shadow duration-300 hover:shadow-2xl"
        >
            {isHit && (
                <span className="absolute left-2 top-2 z-10 rounded-lg bg-amber-600 px-2 py-1 text-xs font-semibold text-stone-900 shadow-md">
                    Хит
                </span>
            )}
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
                <div className="flex items-center justify-between gap-3">
                    <p className="mb-0 font-semibold text-amber-500">{formatPrice(item.price)}</p>
                    <motion.button
                        type="button"
                        onClick={handleAdd}
                        disabled={!item.is_available}
                        whileTap={{ scale: 0.9 }}
                        className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-stone-900 shadow-md transition-colors hover:bg-amber-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        <span aria-hidden="true" className="mr-1">
                            🛒
                        </span>
                        В корзину
                    </motion.button>
                </div>
            </div>
        </motion.article>
    );
}
