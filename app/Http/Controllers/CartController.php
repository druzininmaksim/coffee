<?php

namespace App\Http\Controllers;

use App\Models\CartItem;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CartController extends Controller
{
    /**
     * List the authenticated user's cart items.
     */
    public function index(Request $request): JsonResponse
    {
        $items = $request->user()
            ->cartItems()
            ->with('menuItem.category')
            ->orderBy('created_at')
            ->get();

        return response()->json([
            'items' => $items,
        ]);
    }

    /**
     * Add a menu item to the cart (or increase its quantity).
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'menu_item_id' => ['required', 'integer', 'exists:menu_items,id'],
            'quantity' => ['nullable', 'integer', 'min:1', 'max:20'],
        ]);

        $menuItem = MenuItem::findOrFail($validated['menu_item_id']);

        if (! $menuItem->is_available) {
            return response()->json([
                'message' => 'Блюдо сейчас недоступно',
            ], 422);
        }

        $cartItem = CartItem::query()
            ->where('user_id', $request->user()->id)
            ->where('menu_item_id', $menuItem->id)
            ->first();

        $quantity = (int) ($validated['quantity'] ?? 1);

        if ($cartItem !== null) {
            $cartItem->update([
                'quantity' => min($cartItem->quantity + $quantity, 20),
            ]);
        } else {
            $cartItem = CartItem::create([
                'user_id' => $request->user()->id,
                'menu_item_id' => $menuItem->id,
                'quantity' => $quantity,
            ]);
        }

        return response()->json([
            'message' => 'Добавлено в корзину',
            'item' => $cartItem->load('menuItem.category'),
        ], 201);
    }

    /**
     * Update the quantity of a cart item.
     */
    public function update(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещён',
            ], 403);
        }

        $validated = $request->validate([
            'quantity' => ['required', 'integer', 'min:1', 'max:20'],
        ]);

        $cartItem->update(['quantity' => $validated['quantity']]);

        return response()->json([
            'message' => 'Количество обновлено',
            'item' => $cartItem->load('menuItem.category'),
        ]);
    }

    /**
     * Remove a cart item.
     */
    public function destroy(Request $request, CartItem $cartItem): JsonResponse
    {
        if ($cartItem->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещён',
            ], 403);
        }

        $cartItem->delete();

        return response()->json([
            'message' => 'Позиция удалена из корзины',
        ]);
    }

    /**
     * Empty the authenticated user's cart.
     */
    public function clear(Request $request): JsonResponse
    {
        $request->user()->cartItems()->delete();

        return response()->json([
            'message' => 'Корзина очищена',
        ]);
    }
}
