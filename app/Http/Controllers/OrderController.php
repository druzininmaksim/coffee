<?php

namespace App\Http\Controllers;

use App\Models\MenuItem;
use App\Models\Order;
use App\Models\Promocode;
use App\Models\PromocodeUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;
use Illuminate\Support\Facades\DB;

class OrderController extends Controller
{
    /**
     * List the authenticated user's orders, newest first.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = $request->user()
            ->orders()
            ->with(['items', 'promocode'])
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Show a single order that belongs to the authenticated user.
     */
    public function show(Request $request, Order $order): JsonResponse
    {
        if ($order->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещён',
            ], 403);
        }

        return response()->json([
            'order' => $order->load(['items', 'promocode']),
        ]);
    }

    /**
     * Create an order from the authenticated user's cart.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'type' => ['required', 'in:pickup,delivery'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'regex:/^\+?[0-9\s\-\(\)]{10,20}$/'],
            'address' => ['required_if:type,delivery', 'nullable', 'string', 'max:500'],
            'comment' => ['nullable', 'string', 'max:1000'],
            'promocode' => ['nullable', 'string', 'max:50'],
            'subtotal' => ['nullable', 'numeric', 'min:0'],
            'discount' => ['nullable', 'numeric', 'min:0'],
            'total' => ['nullable', 'numeric', 'min:0'],
        ]);

        $user = $request->user();

        $cartItems = $user
            ->cartItems()
            ->with('menuItem')
            ->orderBy('created_at')
            ->get();

        if ($cartItems->isEmpty()) {
            return response()->json([
                'message' => 'Корзина пуста',
            ], 422);
        }

        $unavailable = $cartItems->first(fn ($item): bool => ! $item->menuItem?->is_available);

        if ($unavailable !== null) {
            return response()->json([
                'message' => "Блюдо «{$unavailable->menuItem->name}» сейчас недоступно, удалите его из корзины",
            ], 422);
        }

        // Сумма до скидки считается на сервере: значения из запроса не используются,
        // чтобы клиент не мог подделать итоговую цену заказа.
        $subtotal = round($cartItems->sum(
            fn ($item): float => (float) $item->menuItem->price * $item->quantity
        ), 2);

        $promocode = null;
        $discount = 0.0;

        if (! empty($validated['promocode'])) {
            // Промокоды доступны только авторизованным пользователям.
            if ($user === null) {
                return response()->json([
                    'message' => 'Войдите в аккаунт, чтобы использовать промокод',
                ], 422);
            }

            $promocode = Promocode::query()
                ->where('code', mb_strtoupper(trim($validated['promocode'])))
                ->first();

            if ($promocode === null) {
                return response()->json([
                    'message' => 'Промокод не найден',
                ], 422);
            }

            // Один пользователь может применить один и тот же промокод только один раз.
            if ($this->promocodeAlreadyUsed($promocode, $user->id)) {
                return response()->json([
                    'message' => 'Вы уже использовали этот промокод',
                ], 422);
            }

            $promocodeError = $this->promocodeError($promocode, $subtotal);

            if ($promocodeError !== null) {
                return response()->json([
                    'message' => $promocodeError,
                ], 422);
            }

            $discount = $promocode->discount_type === Promocode::TYPE_PERCENT
                ? $subtotal * ((float) $promocode->discount_value / 100)
                : (float) $promocode->discount_value;

            $discount = round(min($discount, $subtotal), 2);
        }

        $total = round($subtotal - $discount, 2);

        $order = DB::transaction(function () use ($user, $validated, $cartItems, $promocode, $subtotal, $discount, $total): Order {
            $order = Order::create([
                'user_id' => $user->id,
                'type' => $validated['type'],
                'name' => $validated['name'],
                'phone' => $validated['phone'],
                'address' => $validated['address'] ?? null,
                'comment' => $validated['comment'] ?? null,
                'status' => Order::STATUS_NEW,
                'subtotal' => $subtotal,
                'discount' => $discount,
                'total_price' => $total,
                'promocode_id' => $promocode?->id,
            ]);

            foreach ($cartItems as $item) {
                $order->items()->create([
                    'menu_item_id' => $item->menu_item_id,
                    'name' => $item->menuItem->name,
                    'price' => $item->menuItem->price,
                    'quantity' => $item->quantity,
                ]);
            }

            if ($promocode !== null) {
                $promocode->increment('used_count');

                // Фиксируем факт применения: повторно этот промокод пользователю недоступен.
                PromocodeUsage::create([
                    'promocode_id' => $promocode->id,
                    'user_id' => $user->id,
                    'order_id' => $order->id,
                    'used_at' => Carbon::now(),
                ]);
            }

            $user->cartItems()->delete();

            return $order;
        });

        return response()->json([
            'message' => 'Заказ создан',
            'order' => $order->load(['items', 'promocode']),
        ], 201);
    }

    /**
     * Проверяет, применял ли пользователь этот промокод ранее.
     */
    private function promocodeAlreadyUsed(Promocode $promocode, int $userId): bool
    {
        return PromocodeUsage::query()
            ->where('promocode_id', $promocode->id)
            ->where('user_id', $userId)
            ->exists();
    }

    /**
     * Проверяет, можно ли применить промокод к указанной сумме.
     *
     * Возвращает текст ошибки, если промокод отклонён, или null, если он валиден.
     */
    private function promocodeError(Promocode $promocode, float $amount): ?string
    {
        if (! $promocode->is_active) {
            return 'Промокод неактивен';
        }

        $now = Carbon::now();

        if ($promocode->valid_from !== null && $now->lt($promocode->valid_from)) {
            return 'Промокод ещё не действует';
        }

        if ($promocode->valid_until !== null && $now->gt($promocode->valid_until)) {
            return 'Срок действия промокода истёк';
        }

        if ($promocode->usage_limit !== null && $promocode->used_count >= $promocode->usage_limit) {
            return 'Лимит применений промокода исчерпан';
        }

        if ($amount < (float) $promocode->min_order_amount) {
            return sprintf(
                'Промокод действует от суммы заказа %.2f ₽',
                (float) $promocode->min_order_amount,
            );
        }

        return null;
    }
}
