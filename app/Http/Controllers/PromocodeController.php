<?php

namespace App\Http\Controllers;

use App\Models\Promocode;
use App\Models\PromocodeUsage;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Carbon;

class PromocodeController extends Controller
{
    /**
     * Check a promocode against an order amount and return the discount.
     */
    public function check(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'max:50'],
            'amount' => ['required', 'numeric', 'min:0'],
        ]);

        // Промокоды применяются только авторизованными пользователями.
        // На публичном маршруте явно берём guard sanctum: Bearer-токен не виден web-guard-у.
        $user = $request->user('sanctum');

        if ($user === null) {
            return response()->json([
                'valid' => false,
                'message' => 'Войдите в аккаунт, чтобы использовать промокод',
            ], 422);
        }

        $promocode = Promocode::query()
            ->where('code', mb_strtoupper(trim($validated['code'])))
            ->first();

        if ($promocode === null) {
            return response()->json([
                'valid' => false,
                'message' => 'Промокод не найден',
            ], 404);
        }

        // Один пользователь может применить один и тот же промокод только один раз.
        $alreadyUsed = PromocodeUsage::query()
            ->where('promocode_id', $promocode->id)
            ->where('user_id', $user->id)
            ->exists();

        if ($alreadyUsed) {
            return response()->json([
                'valid' => false,
                'message' => 'Вы уже использовали этот промокод',
            ], 422);
        }

        $now = Carbon::now();

        if (! $promocode->is_active) {
            return response()->json([
                'valid' => false,
                'message' => 'Промокод неактивен',
            ], 422);
        }

        if ($promocode->valid_from !== null && $now->lt($promocode->valid_from)) {
            return response()->json([
                'valid' => false,
                'message' => 'Промокод ещё не действует',
            ], 422);
        }

        if ($promocode->valid_until !== null && $now->gt($promocode->valid_until)) {
            return response()->json([
                'valid' => false,
                'message' => 'Срок действия промокода истёк',
            ], 422);
        }

        if ($promocode->usage_limit !== null && $promocode->used_count >= $promocode->usage_limit) {
            return response()->json([
                'valid' => false,
                'message' => 'Лимит применений промокода исчерпан',
            ], 422);
        }

        $amount = (float) $validated['amount'];

        if ($amount < (float) $promocode->min_order_amount) {
            return response()->json([
                'valid' => false,
                'message' => sprintf(
                    'Промокод действует от суммы заказа %.2f ₽',
                    (float) $promocode->min_order_amount,
                ),
            ], 422);
        }

        $discount = $promocode->discount_type === Promocode::TYPE_PERCENT
            ? $amount * ((float) $promocode->discount_value / 100)
            : (float) $promocode->discount_value;

        $discount = min($discount, $amount);

        return response()->json([
            'valid' => true,
            'message' => 'Промокод применён',
            'discount' => round($discount, 2),
            'promocode' => [
                'code' => $promocode->code,
                'discount_type' => $promocode->discount_type,
                'discount_value' => $promocode->discount_value,
            ],
        ]);
    }
}
