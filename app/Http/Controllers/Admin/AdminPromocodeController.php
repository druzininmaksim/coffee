<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promocode;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminPromocodeController extends Controller
{
    /**
     * List all promocodes.
     */
    public function index(): JsonResponse
    {
        $promocodes = Promocode::query()->orderBy('code')->get();

        return response()->json([
            'promocodes' => $promocodes,
        ]);
    }

    /**
     * Create a promocode.
     */
    public function store(Request $request): JsonResponse
    {
        $promocode = Promocode::create($this->validatePromocode($request));

        return response()->json([
            'message' => 'Промокод создан',
            'promocode' => $promocode,
        ], 201);
    }

    /**
     * Update a promocode.
     */
    public function update(Request $request, Promocode $promocode): JsonResponse
    {
        $promocode->update($this->validatePromocode($request, $promocode));

        return response()->json([
            'message' => 'Промокод обновлён',
            'promocode' => $promocode,
        ]);
    }

    /**
     * Delete a promocode.
     */
    public function destroy(Promocode $promocode): JsonResponse
    {
        $promocode->delete();

        return response()->json([
            'message' => 'Промокод удалён',
        ]);
    }

    /**
     * Validate a promocode payload.
     *
     * @return array<string, mixed>
     */
    private function validatePromocode(Request $request, ?Promocode $promocode = null): array
    {
        $validated = $request->validate([
            'code' => [
                'required',
                'string',
                'max:50',
                Rule::unique('promocodes', 'code')->ignore($promocode?->id),
            ],
            'discount_type' => ['required', Rule::in([Promocode::TYPE_PERCENT, Promocode::TYPE_FIXED])],
            'discount_value' => ['required', 'numeric', 'min:0'],
            'min_order_amount' => ['nullable', 'numeric', 'min:0'],
            'valid_from' => ['nullable', 'date'],
            'valid_until' => ['nullable', 'date', 'after_or_equal:valid_from'],
            'usage_limit' => ['nullable', 'integer', 'min:1'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['code'] = mb_strtoupper(trim($validated['code']));
        $validated['min_order_amount'] = $validated['min_order_amount'] ?? 0;
        $validated['is_active'] = $request->boolean('is_active', true);

        return $validated;
    }
}
