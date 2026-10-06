<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;

class MenuController extends Controller
{
    /**
     * List every category with its available menu items.
     */
    public function index(): JsonResponse
    {
        $categories = Category::query()
            ->with(['menuItems' => function ($query): void {
                $query->where('is_available', true)->with('category')->orderBy('name');
            }])
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Show a single menu item.
     */
    public function show(MenuItem $menuItem): JsonResponse
    {
        return response()->json([
            'menu_item' => $menuItem->load('category'),
        ]);
    }
}
