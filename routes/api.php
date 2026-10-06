<?php

use App\Http\Controllers\Admin\AdminLeadController;
use App\Http\Controllers\Admin\AdminMenuController;
use App\Http\Controllers\Admin\AdminReservationController;
use App\Http\Controllers\Admin\AdminReviewController;
use App\Http\Controllers\Admin\AdminTableController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\LeadController;
use App\Http\Controllers\MenuController;
use App\Http\Controllers\ReservationController;
use App\Http\Controllers\ReviewController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Публичные роуты
|--------------------------------------------------------------------------
*/

Route::get('/menu', [MenuController::class, 'index']);
Route::get('/menu/{menuItem}', [MenuController::class, 'show']);

Route::get('/reviews', [ReviewController::class, 'index']);
Route::post('/reviews', [ReviewController::class, 'store']);

Route::get('/tables/available', [ReservationController::class, 'availableTables']);
Route::post('/reservations', [ReservationController::class, 'store']);

Route::post('/leads', [LeadController::class, 'store']);

Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

/*
|--------------------------------------------------------------------------
| Требуют авторизации (Sanctum)
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function (): void {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/my-reservations', [ReservationController::class, 'myReservations']);
    Route::patch('/my-reservations/{reservation}/cancel', [ReservationController::class, 'cancel']);
});

/*
|--------------------------------------------------------------------------
| Только для администратора
|--------------------------------------------------------------------------
*/

Route::middleware(['auth:sanctum', 'admin'])->prefix('admin')->group(function (): void {
    Route::get('/test', fn (): array => ['message' => 'admin ok']);

    // Меню: блюда
    Route::get('/menu-items', [AdminMenuController::class, 'index']);
    Route::post('/menu-items', [AdminMenuController::class, 'store']);
    Route::get('/menu-items/{menuItem}', [AdminMenuController::class, 'show']);
    Route::put('/menu-items/{menuItem}', [AdminMenuController::class, 'update']);
    Route::delete('/menu-items/{menuItem}', [AdminMenuController::class, 'destroy']);

    // Меню: категории
    Route::get('/categories', [AdminMenuController::class, 'categoriesIndex']);
    Route::post('/categories', [AdminMenuController::class, 'categoriesStore']);
    Route::get('/categories/{category}', [AdminMenuController::class, 'categoriesShow']);
    Route::put('/categories/{category}', [AdminMenuController::class, 'categoriesUpdate']);
    Route::delete('/categories/{category}', [AdminMenuController::class, 'categoriesDestroy']);

    // Столики
    Route::get('/tables', [AdminTableController::class, 'index']);
    Route::post('/tables', [AdminTableController::class, 'store']);
    Route::get('/tables/{table}', [AdminTableController::class, 'show']);
    Route::put('/tables/{table}', [AdminTableController::class, 'update']);
    Route::delete('/tables/{table}', [AdminTableController::class, 'destroy']);

    // Брони
    Route::get('/reservations', [AdminReservationController::class, 'index']);
    Route::patch('/reservations/{reservation}/status', [AdminReservationController::class, 'updateStatus']);

    // Отзывы
    Route::get('/reviews', [AdminReviewController::class, 'index']);
    Route::patch('/reviews/{review}/approve', [AdminReviewController::class, 'approve']);
    Route::delete('/reviews/{review}', [AdminReviewController::class, 'destroy']);

    // Заявки
    Route::get('/leads', [AdminLeadController::class, 'index']);
    Route::delete('/leads/{lead}', [AdminLeadController::class, 'destroy']);
});
