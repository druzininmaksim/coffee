<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Promotion;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class AdminPromotionController extends Controller
{
    /**
     * List all promotions.
     */
    public function index(): JsonResponse
    {
        $promotions = Promotion::query()
            ->orderBy('sort_order')
            ->orderBy('id')
            ->get();

        return response()->json([
            'promotions' => $promotions,
        ]);
    }

    /**
     * Create a promotion.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validatePromotion($request);

        $promotion = Promotion::create([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image' => $request->file('image')?->store('promotions', 'public'),
            'is_active' => $request->boolean('is_active', true),
            'sort_order' => $validated['sort_order'] ?? 0,
        ]);

        return response()->json([
            'message' => 'Акция создана',
            'promotion' => $promotion,
        ], 201);
    }

    /**
     * Update a promotion.
     */
    public function update(Request $request, Promotion $promotion): JsonResponse
    {
        $validated = $this->validatePromotion($request);

        $image = $promotion->image;

        if ($request->hasFile('image')) {
            if ($image !== null) {
                Storage::disk('public')->delete($image);
            }

            $image = $request->file('image')->store('promotions', 'public');
        }

        $promotion->update([
            'title' => $validated['title'],
            'description' => $validated['description'] ?? null,
            'image' => $image,
            'is_active' => $request->boolean('is_active', $promotion->is_active),
            'sort_order' => $validated['sort_order'] ?? $promotion->sort_order,
        ]);

        return response()->json([
            'message' => 'Акция обновлена',
            'promotion' => $promotion,
        ]);
    }

    /**
     * Delete a promotion together with its image.
     */
    public function destroy(Promotion $promotion): JsonResponse
    {
        if ($promotion->image !== null) {
            Storage::disk('public')->delete($promotion->image);
        }

        $promotion->delete();

        return response()->json([
            'message' => 'Акция удалена',
        ]);
    }

    /**
     * Validate a promotion payload.
     *
     * @return array<string, mixed>
     */
    private function validatePromotion(Request $request): array
    {
        return $request->validate([
            'title' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string'],
            'is_active' => ['nullable', 'boolean'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);
    }
}
