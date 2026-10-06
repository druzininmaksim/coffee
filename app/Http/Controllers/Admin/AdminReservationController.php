<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Reservation;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminReservationController extends Controller
{
    /**
     * List all reservations with their user and table.
     */
    public function index(Request $request): JsonResponse
    {
        $reservations = Reservation::query()
            ->with(['user:id,name,email,phone', 'table'])
            ->when($request->filled('status'), function ($query) use ($request): void {
                $query->where('status', $request->string('status')->value());
            })
            ->when($request->filled('date'), function ($query) use ($request): void {
                $query->whereDate('reserved_at', $request->string('date')->value());
            })
            ->orderByDesc('reserved_at')
            ->get();

        return response()->json([
            'reservations' => $reservations,
        ]);
    }

    /**
     * Change the status of a reservation.
     */
    public function updateStatus(Request $request, Reservation $reservation): JsonResponse
    {
        $validated = $request->validate([
            'status' => [
                'required',
                'string',
                Rule::in([
                    Reservation::STATUS_PENDING,
                    Reservation::STATUS_CONFIRMED,
                    Reservation::STATUS_CANCELLED,
                    Reservation::STATUS_COMPLETED,
                ]),
            ],
        ]);

        $reservation->update([
            'status' => $validated['status'],
        ]);

        return response()->json([
            'message' => 'Статус брони обновлён',
            'reservation' => $reservation->load(['user:id,name,email,phone', 'table']),
        ]);
    }
}
