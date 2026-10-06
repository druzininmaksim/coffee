<?php

namespace App\Http\Controllers;

use App\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    /**
     * List published reviews, newest first.
     */
    public function index(): JsonResponse
    {
        $reviews = Review::query()
            ->with('user:id,name')
            ->where('is_published', true)
            ->latest()
            ->get();

        return response()->json([
            'reviews' => $reviews,
        ]);
    }

    /**
     * Store a new review awaiting moderation.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['nullable', 'string', 'max:2000'],
            'menu_item_id' => ['nullable', 'integer', 'exists:menu_items,id'],
        ]);

        $user = $request->user() ?? auth('sanctum')->user();

        $review = Review::create([
            'user_id' => $user?->id,
            'menu_item_id' => $validated['menu_item_id'] ?? null,
            'rating' => $validated['rating'],
            'comment' => $validated['comment'] ?? null,
            'is_published' => false,
        ]);

        return response()->json([
            'message' => 'Спасибо! Отзыв отправлен на модерацию',
            'review' => $review->load('user:id,name'),
        ], 201);
    }
}
