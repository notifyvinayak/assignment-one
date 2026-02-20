<?php

namespace App\Http\Controllers\Web;

use App\Exceptions\SoldOutException;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Models\Event;
use App\Services\BookingService;
use Illuminate\Http\RedirectResponse;
use Inertia\Inertia;
use Inertia\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    /**
     * Show the event details page with live inventory.
     */
    public function show(Event $event): Response
    {
        return Inertia::render('Event/Show', [
            'event' => [
                'id'            => $event->id,
                'name'          => $event->name,
                'total_tickets' => $event->total_tickets,
                'price'         => $event->price,
                'created_at'    => $event->created_at,
            ],
            'redis_inventory' => $this->bookingService->getAvailableTickets($event->id),
        ]);
    }

    /**
     * Book tickets for the authenticated user (web / Inertia).
     *
     * On success  → redirect back with a success flash message.
     * On sold-out → redirect back with an error flash message.
     */
    public function store(BookingRequest $request): RedirectResponse
    {
        try {
            $booking = $this->bookingService->bookTickets(
                userId:  $request->user()->id,
                eventId: $request->validated('event_id'),
                quantity: $request->validated('quantity'),
            );

            return redirect()->back()->with('success', "🎉 Booked {$booking->quantity} ticket(s) successfully! Booking #{$booking->id}");
        } catch (SoldOutException $e) {
            return redirect()->back()->with('error', $e->getMessage());
        }
    }
}

