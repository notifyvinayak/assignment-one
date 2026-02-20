<?php

namespace App\Http\Controllers\Web;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class MyTicketsController extends Controller
{
    /**
     * Display the authenticated user's bookings.
     */
    public function index(Request $request): Response
    {
        $bookings = $request->user()
            ->bookings()
            ->with('event')
            ->latest()
            ->get()
            ->map(fn ($booking) => [
                'id'         => $booking->id,
                'quantity'   => $booking->quantity,
                'status'     => $booking->status,
                'created_at' => $booking->created_at->toDateTimeString(),
                'event'      => [
                    'id'    => $booking->event->id,
                    'name'  => $booking->event->name,
                    'price' => $booking->event->price,
                ],
            ]);

        return Inertia::render('Tickets/Index', [
            'bookings' => $bookings,
        ]);
    }
}
