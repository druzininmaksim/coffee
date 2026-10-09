<?php

namespace App\Http\Controllers;

use App\Models\Promotion;
use Illuminate\Http\JsonResponse;

class PromotionController extends Controller
{
    /**
     * List active promotions for the home page, sorted.
     */
    public function index(): JsonResponse
    {
        $promotions = Promotion::query()
            ->where('is_active', true)
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'promotions' => $promotions,
        ]);
    }
}
