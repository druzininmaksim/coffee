<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use App\Models\MenuItem;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;

class AdminMenuController extends Controller
{
    /**
     * List all menu items with their categories.
     */
    public function index(Request $request): JsonResponse
    {
        $menuItems = MenuItem::query()
            ->with('category')
            ->when($request->filled('category_id'), function ($query) use ($request): void {
                $query->where('category_id', $request->integer('category_id'));
            })
            ->orderBy('name')
            ->get();

        return response()->json([
            'menu_items' => $menuItems,
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

    /**
     * Create a menu item.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $this->validateMenuItem($request);

        $menuItem = MenuItem::create([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? Str::slug($validated['name']),
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'is_available' => $request->boolean('is_available', true),
            'image' => $request->file('image')?->store('menu', 'public'),
        ]);

        return response()->json([
            'message' => 'Блюдо создано',
            'menu_item' => $menuItem->load('category'),
        ], 201);
    }

    /**
     * Update a menu item.
     */
    public function update(Request $request, MenuItem $menuItem): JsonResponse
    {
        $validated = $this->validateMenuItem($request, $menuItem);

        $image = $menuItem->image;

        if ($request->hasFile('image')) {
            if ($image !== null) {
                Storage::disk('public')->delete($image);
            }

            $image = $request->file('image')->store('menu', 'public');
        }

        $menuItem->update([
            'category_id' => $validated['category_id'],
            'name' => $validated['name'],
            'slug' => $validated['slug'] ?? $menuItem->slug,
            'description' => $validated['description'] ?? null,
            'price' => $validated['price'],
            'is_available' => $request->boolean('is_available', $menuItem->is_available),
            'image' => $image,
        ]);

        return response()->json([
            'message' => 'Блюдо обновлено',
            'menu_item' => $menuItem->load('category'),
        ]);
    }

    /**
     * Delete a menu item together with its image.
     */
    public function destroy(MenuItem $menuItem): JsonResponse
    {
        if ($menuItem->image !== null) {
            Storage::disk('public')->delete($menuItem->image);
        }

        $menuItem->delete();

        return response()->json([
            'message' => 'Блюдо удалено',
        ]);
    }

    /**
     * List all categories.
     */
    public function categoriesIndex(): JsonResponse
    {
        $categories = Category::query()
            ->withCount('menuItems')
            ->orderBy('sort_order')
            ->get();

        return response()->json([
            'categories' => $categories,
        ]);
    }

    /**
     * Show a single category.
     */
    public function categoriesShow(Category $category): JsonResponse
    {
        return response()->json([
            'category' => $category->load('menuItems'),
        ]);
    }

    /**
     * Create a category.
     */
    public function categoriesStore(Request $request): JsonResponse
    {
        $category = Category::create($this->validateCategory($request));

        return response()->json([
            'message' => 'Категория создана',
            'category' => $category,
        ], 201);
    }

    /**
     * Update a category.
     */
    public function categoriesUpdate(Request $request, Category $category): JsonResponse
    {
        $category->update($this->validateCategory($request, $category));

        return response()->json([
            'message' => 'Категория обновлена',
            'category' => $category,
        ]);
    }

    /**
     * Delete a category with all of its menu items.
     */
    public function categoriesDestroy(Category $category): JsonResponse
    {
        $category->loadMissing('menuItems');

        foreach ($category->menuItems as $menuItem) {
            if ($menuItem->image !== null) {
                Storage::disk('public')->delete($menuItem->image);
            }
        }

        $category->delete();

        return response()->json([
            'message' => 'Категория удалена',
        ]);
    }

    /**
     * Validate a menu item payload.
     *
     * @return array<string, mixed>
     */
    private function validateMenuItem(Request $request, ?MenuItem $menuItem = null): array
    {
        return $request->validate([
            'category_id' => ['required', 'integer', 'exists:categories,id'],
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('menu_items', 'slug')->ignore($menuItem?->id),
            ],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'numeric', 'min:0'],
            'is_available' => ['nullable', 'boolean'],
            'image' => ['nullable', 'image', 'max:2048'],
        ]);
    }

    /**
     * Validate a category payload.
     *
     * @return array<string, mixed>
     */
    private function validateCategory(Request $request, ?Category $category = null): array
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => [
                'nullable',
                'string',
                'max:255',
                Rule::unique('categories', 'slug')->ignore($category?->id),
            ],
            'description' => ['nullable', 'string'],
            'sort_order' => ['nullable', 'integer', 'min:0'],
        ]);

        $validated['slug'] = $validated['slug'] ?? Str::slug($validated['name']);
        $validated['sort_order'] = $validated['sort_order'] ?? 0;

        return $validated;
    }
}
