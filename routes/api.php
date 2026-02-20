<?php

use App\Http\Controllers\Api\BookingController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Routes registered here are prefixed with /api and use the Sanctum
| auth guard. They also receive a 10-requests-per-minute rate limiter
| (configured in bootstrap/app.php) to prevent bot spam.
|
*/

Route::middleware(['auth:sanctum', 'throttle:booking'])->group(function () {
    Route::post('/bookings', [BookingController::class, 'store'])->name('api.bookings.store');
});
