<?php

use App\Http\Controllers\ProfileController;
use App\Http\Controllers\Web\BookingController;
use App\Http\Controllers\Web\MyTicketsController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'events' => \App\Models\Event::all()->map(function ($event) {
            return [
                'id' => $event->id,
                'name' => $event->name,
                'price' => (float) $event->price,
                'total_tickets' => $event->total_tickets,
            ];
        }),
    ]);
});

// Dashboard removed in favor of tickets.index

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Auth intercept for returning users to checkout after login
    Route::get('/events/{event}/checkout-auth', function (\App\Models\Event $event) {
        return redirect()->route('events.show', $event);
    })->name('events.checkout-auth');

    // My tickets
    Route::get('/my-tickets', [MyTicketsController::class, 'index'])->name('tickets.index');

    // Ticket booking (rate limited: 10 requests/minute per user)
    Route::post('/bookings', [BookingController::class, 'store'])
        ->middleware('throttle:booking')
        ->name('bookings.store');
});

// Event detail page (Publicly accessible)
Route::get('/events/{event}', [BookingController::class, 'show'])->name('events.show');

require __DIR__.'/auth.php';
