<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\BookingController;
use App\Http\Controllers\Web\MyTicketsController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Event detail page
    Route::get('/events/{event}', [BookingController::class, 'show'])->name('events.show');

    // My tickets
    Route::get('/my-tickets', [MyTicketsController::class, 'index'])->name('tickets.index');

    // Ticket booking (rate limited: 10 requests/minute per user)
    Route::post('/bookings', [BookingController::class, 'store'])
        ->middleware('throttle:booking')
        ->name('bookings.store');
});

require __DIR__.'/auth.php';
