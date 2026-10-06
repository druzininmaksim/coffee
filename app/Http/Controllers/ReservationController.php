<?php

namespace App\Http\Controllers;

use App\Models\Reservation;
use App\Models\Table;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReservationController extends Controller
{
    /**
     * Standard booking length in hours, used to detect overlapping reservations.
     */
    private const DEFAULT_DURATION_HOURS = 2;

    /**
     * Reservation statuses that occupy a table.
     *
     * @var array<int, string>
     */
    private const ACTIVE_STATUSES = [
        Reservation::STATUS_PENDING,
        Reservation::STATUS_CONFIRMED,
    ];

    /**
     * List active tables that are free for the requested date, time and party size.
     */
    public function availableTables(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'date' => ['required', 'date_format:Y-m-d'],
            'time' => ['required', 'date_format:H:i'],
            'guests' => ['required', 'integer', 'min:1'],
            'duration' => ['nullable', 'integer', 'min:1', 'max:12'],
        ]);

        $duration = (int) ($validated['duration'] ?? self::DEFAULT_DURATION_HOURS);
        $start = Carbon::createFromFormat('Y-m-d H:i', $validated['date'].' '.$validated['time']);
        $end = $start->copy()->addHours($duration);
        $busyFrom = $start->copy()->subHours(self::DEFAULT_DURATION_HOURS);

        $tables = Table::query()
            ->where('is_active', true)
            ->where('capacity', '>=', $validated['guests'])
            ->whereDoesntHave('reservations', function ($query) use ($end, $busyFrom): void {
                $query->whereIn('status', self::ACTIVE_STATUSES)
                    ->where('reserved_at', '<', $end)
                    ->where('reserved_at', '>', $busyFrom);
            })
            ->orderBy('number')
            ->get();

        return response()->json([
            'date' => $start->toDateString(),
            'time' => $start->format('H:i'),
            'duration' => $duration,
            'tables' => $tables,
        ]);
    }

    /**
     * Create a reservation for a table.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'table_id' => ['required', 'integer', 'exists:tables,id'],
            'name' => ['required', 'string', 'max:255'],
            'phone' => ['required', 'string', 'max:30'],
            'guests' => ['required', 'integer', 'min:1'],
            'reserved_at' => ['required', 'date', 'after:now'],
            'comment' => ['nullable', 'string', 'max:1000'],
        ]);

        $table = Table::findOrFail($validated['table_id']);
        $start = Carbon::parse($validated['reserved_at']);
        $end = $start->copy()->addHours(self::DEFAULT_DURATION_HOURS);

        if (! $table->is_active) {
            return response()->json([
                'message' => 'Столик недоступен для бронирования',
            ], 422);
        }

        if ($validated['guests'] > $table->capacity) {
            return response()->json([
                'message' => 'Столик не вмещает выбранное количество гостей',
            ], 422);
        }

        if ($this->isTableBusy($table->id, $start, $end)) {
            return response()->json([
                'message' => 'На выбранное время столик уже забронирован',
            ], 422);
        }

        $user = $request->user() ?? auth('sanctum')->user();

        $reservation = Reservation::create([
            'user_id' => $user?->id,
            'table_id' => $table->id,
            'name' => $validated['name'],
            'phone' => $validated['phone'],
            'guests' => $validated['guests'],
            'reserved_at' => $start,
            'status' => Reservation::STATUS_PENDING,
            'comment' => $validated['comment'] ?? null,
        ]);

        return response()->json([
            'message' => 'Бронь создана',
            'reservation' => $reservation->load('table'),
        ], 201);
    }

    /**
     * List reservations of the authenticated user, newest first.
     */
    public function myReservations(Request $request): JsonResponse
    {
        $reservations = $request->user()
            ->reservations()
            ->with('table')
            ->orderByDesc('reserved_at')
            ->get();

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    /**
     * Cancel the authenticated user's own pending reservation.
     */
    public function cancel(Request $request, Reservation $reservation): JsonResponse
    {
        if ($reservation->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Доступ запрещён',
            ], 403);
        }

        if ($reservation->status !== Reservation::STATUS_PENDING) {
            return response()->json([
                'message' => 'Отменить можно только бронь в статусе «ожидает»',
            ], 422);
        }

        $reservation->update([
            'status' => Reservation::STATUS_CANCELLED,
        ]);

        return response()->json([
            'message' => 'Бронь отменена',
            'reservation' => $reservation->load('table'),
        ]);
    }

    /**
     * Determine whether the table already has an overlapping active reservation.
     */
    private function isTableBusy(int $tableId, Carbon $start, Carbon $end): bool
    {
        return Reservation::query()
            ->where('table_id', $tableId)
            ->whereIn('status', self::ACTIVE_STATUSES)
            ->where('reserved_at', '<', $end)
            ->where('reserved_at', '>', $start->copy()->subHours(self::DEFAULT_DURATION_HOURS))
            ->exists();
    }
}
