<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;

class AdminOrderController extends Controller
{
    /**
     * List all orders with items and clients.
     */
    public function index(Request $request): JsonResponse
    {
        $orders = Order::query()
            ->with(['items', 'user', 'promocode'])
            ->when($request->filled('status'), function ($query) use ($request): void {
                $query->where('status', $request->string('status'));
            })
            ->orderByDesc('created_at')
            ->get();

        return response()->json([
            'orders' => $orders,
        ]);
    }

    /**
     * Update an order status.
     */
    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $validated = $request->validate([
            'status' => [
                'required',
                Rule::in([
                    Order::STATUS_NEW,
                    Order::STATUS_PREPARING,
                    Order::STATUS_READY,
                    Order::STATUS_COMPLETED,
                    Order::STATUS_CANCELLED,
                ]),
            ],
        ]);

        $order->update(['status' => $validated['status']]);

        if ($order->status === Order::STATUS_COMPLETED && ! $order->bonus_accrued) {
            DB::transaction(function () use ($order): void {
                $bonuses = (int) floor((float) $order->total_price * Order::BONUS_RATE);

                $order->forceFill([
                    'bonus_points' => $bonuses,
                    'bonus_accrued' => true,
                ])->save();

                if ($order->user !== null && $bonuses > 0) {
                    $order->user->increment('bonus_points', $bonuses);
                }
            });

            $order->refresh();
        }

        return response()->json([
            'message' => 'Статус заказа обновлён',
            'order' => $order->load(['items', 'promocode']),
        ]);
    }
}
