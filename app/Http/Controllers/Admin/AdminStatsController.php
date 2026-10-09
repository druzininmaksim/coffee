<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Reservation;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;

class AdminStatsController extends Controller
{
    /**
     * Aggregated stats for the admin dashboard: sales per day (7 days),
     * top-5 dishes, reservations per day (7 days) and totals.
     */
    public function index(): JsonResponse
    {
        $from = Carbon::now()->subDays(6)->startOfDay();

        // Продажи по дням за последние 7 дней (выполненные заказы).
        $salesRaw = Order::query()
            ->where('status', Order::STATUS_COMPLETED)
            ->where('created_at', '>=', $from)
            ->selectRaw("date(created_at) as day, SUM(total_price) as total")
            ->groupBy('day')
            ->pluck('total', 'day');

        $salesByDay = $this->fillDays(function (Carbon $day) use ($salesRaw) {
            return (float) ($salesRaw[$day->toDateString()] ?? 0);
        });

        // Топ-5 популярных блюд по количеству проданных позиций.
        $topItems = OrderItem::query()
            ->join('menu_items', 'menu_items.id', '=', 'order_items.menu_item_id')
            ->join('orders', 'orders.id', '=', 'order_items.order_id')
            ->where('orders.status', '!=', Order::STATUS_CANCELLED)
            ->selectRaw('menu_items.name as name, SUM(order_items.quantity) as total_quantity')
            ->groupBy('menu_items.id', 'menu_items.name')
            ->orderByDesc('total_quantity')
            ->limit(5)
            ->get()
            ->map(fn (object $row): array => [
                'name' => $row->name,
                'total_quantity' => (int) $row->total_quantity,
            ])
            ->all();

        // Бронирования по дням за последние 7 дней.
        $reservationsRaw = Reservation::query()
            ->where('reserved_at', '>=', $from)
            ->selectRaw('date(reserved_at) as day, COUNT(*) as total')
            ->groupBy('day')
            ->pluck('total', 'day');

        $reservationsByDay = $this->fillDays(function (Carbon $day) use ($reservationsRaw) {
            return (int) ($reservationsRaw[$day->toDateString()] ?? 0);
        });

        // Общая статистика.
        $totalOrders = Order::count();
        $revenue = (float) Order::query()->where('status', Order::STATUS_COMPLETED)->sum('total_price');
        $avgOrder = (float) Order::query()->where('status', Order::STATUS_COMPLETED)->avg('total_price');
        $clients = User::query()->where('role', 'client')->count();

        return response()->json([
            'sales_by_day' => $salesByDay,
            'top_items' => $topItems,
            'reservations_by_day' => $reservationsByDay,
            'total_orders' => $totalOrders,
            'revenue' => round($revenue, 2),
            'avg_order' => round($avgOrder, 2),
            'clients' => $clients,
        ]);
    }

    /**
     * Build a dense list of the last 7 days (oldest first) using the given
     * value callback, so charts have no gaps for days without data.
     *
     * @return array<int, array{day: string, total: float|int}>
     */
    private function fillDays(callable $valueFor): array
    {
        $days = [];

        for ($i = 6; $i >= 0; $i--) {
            $day = Carbon::now()->subDays($i);

            $days[] = [
                'day' => $day->toDateString(),
                'total' => $valueFor($day),
            ];
        }

        return $days;
    }
}
