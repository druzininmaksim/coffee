import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import api from '../api/client';
import { useAuth } from './AuthContext';

const CartContext = createContext(null);

export function CartProvider({ children }) {
    const { isAuthenticated, loading: authLoading } = useAuth();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(false);

    const refresh = useCallback(async () => {
        const { data } = await api.get('/cart');

        setItems(data.items ?? []);
    }, []);

    useEffect(() => {
        if (authLoading) {
            return;
        }

        if (isAuthenticated) {
            setLoading(true);
            refresh().catch(() => setItems([])).finally(() => setLoading(false));

            return;
        }

        setItems([]);
    }, [isAuthenticated, authLoading, refresh]);

    const add = useCallback(
        async (menuItemId) => {
            await api.post('/cart', { menu_item_id: menuItemId, quantity: 1 });
            await refresh();
        },
        [refresh]
    );

    const setQuantity = useCallback(
        async (cartItem, quantity) => {
            const { data } = await api.patch(`/cart/${cartItem.id}`, { quantity });
            await refresh();

            return data;
        },
        [refresh]
    );

    const remove = useCallback(
        async (cartItem) => {
            await api.delete(`/cart/${cartItem.id}`);
            await refresh();
        },
        [refresh]
    );

    const clear = useCallback(async () => {
        await api.delete('/cart');
        await refresh();
    }, [refresh]);

    const count = useMemo(
        () => items.reduce((sum, item) => sum + Number(item.quantity ?? 0), 0),
        [items]
    );

    const value = useMemo(
        () => ({ items, count, loading, refresh, add, setQuantity, remove, clear }),
        [items, count, loading, refresh, add, setQuantity, remove, clear]
    );

    return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error('useCart должен использоваться внутри CartProvider');
    }

    return context;
}
