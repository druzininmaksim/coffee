<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Review;
use Illuminate\Http\JsonResponse;

class AdminReviewController extends Controller
{
    /**
     * List all reviews, newest first.
     */
    public function index(): JsonResponse
    {
        $reviews = Review::query()
            ->with(['user:id,name,email', 'menuItem:id,name'])
            ->latest()
            ->get();

        return response()->json([
            'reviews' => $reviews,
        ]);
    }

    /**
     * Publish a review.
     */
    public function approve(Review $review): JsonResponse
    {
        $review->update([
            'is_published' => true,
        ]);

        return response()->json([
            'message' => 'Отзыв опубликован',
            'review' => $review->load(['user:id,name,email', 'menuItem:id,name']),
        ]);
    }

    /**
     * Delete a review.
     */
    public function destroy(Review $review): JsonResponse
    {
        $review->delete();

        return response()->json([
            'message' => 'Отзыв удалён',
        ]);
    }
}
