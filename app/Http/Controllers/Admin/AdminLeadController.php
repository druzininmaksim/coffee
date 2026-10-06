<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Lead;
use Illuminate\Http\JsonResponse;

class AdminLeadController extends Controller
{
    /**
     * List all leads, newest first.
     */
    public function index(): JsonResponse
    {
        return response()->json([
            'leads' => Lead::query()->orderByDesc('created_at')->get(),
        ]);
    }

    /**
     * Delete a lead.
     */
    public function destroy(Lead $lead): JsonResponse
    {
        $lead->delete();

        return response()->json([
            'message' => 'Заявка удалена',
        ]);
    }
}
