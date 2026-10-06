<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Table;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class AdminTableController extends Controller
{
    /**
     * List all tables.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'tables' => Table::query()->orderBy('number')->get(),
        ]);
    }

    /**
     * Show a single table.
     */
    public function show(Table $table): JsonResponse
    {
        return response()->json([
            'table' => $table->loadCount('reservations'),
        ]);
    }

    /**
     * Create a table.
     */
    public function store(Request $request): JsonResponse
    {
        $table = Table::create($this->validateTable($request));

        return response()->json([
            'message' => 'Столик создан',
            'table' => $table,
        ], 201);
    }

    /**
     * Update a table.
     */
    public function update(Request $request, Table $table): JsonResponse
    {
        $table->update($this->validateTable($request, $table));

        return response()->json([
            'message' => 'Столик обновлён',
            'table' => $table,
        ]);
    }

    /**
     * Delete a table.
     */
    public function destroy(Table $table): JsonResponse
    {
        $table->delete();

        return response()->json([
            'message' => 'Столик удалён',
        ]);
    }

    /**
     * Validate a table payload.
     *
     * @return array<string, mixed>
     */
    private function validateTable(Request $request, ?Table $table = null): array
    {
        $validated = $request->validate([
            'number' => [
                'required',
                'integer',
                'min:1',
                Rule::unique('tables', 'number')->ignore($table?->id),
            ],
            'capacity' => ['required', 'integer', 'min:1', 'max:50'],
            'location' => ['nullable', 'string', 'max:255'],
            'is_active' => ['nullable', 'boolean'],
        ]);

        $validated['is_active'] = $request->boolean('is_active', $table?->is_active ?? true);

        return $validated;
    }
}
