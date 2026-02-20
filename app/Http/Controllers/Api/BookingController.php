<?php

namespace App\Http\Controllers\Api;

use App\Exceptions\SoldOutException;
use App\Http\Controllers\Controller;
use App\Http\Requests\BookingRequest;
use App\Services\BookingService;
use Illuminate\Http\JsonResponse;
use Symfony\Component\HttpFoundation\Response;

class BookingController extends Controller
{
    public function __construct(
        private readonly BookingService $bookingService,
    ) {}

    /**
     * Book tickets for the authenticated user (API / JSON).
     *
     * On success  → 201 with booking data.
     * On sold-out → 409 Conflict with error message.
     */
    public function store(BookingRequest $request): JsonResponse
    {
        try {
            $booking = $this->bookingService->bookTickets(
                userId:  $request->user()->id,
                eventId: $request->validated('event_id'),
                quantity: $request->validated('quantity'),
            );

            return response()->json([
                'message' => 'Tickets booked successfully.',
                'data'    => [
                    'booking_id' => $booking->id,
                    'event_id'   => $booking->event_id,
                    'quantity'   => $booking->quantity,
                    'status'     => $booking->status,
                    'created_at' => $booking->created_at,
                ],
            ], Response::HTTP_CREATED);
        } catch (SoldOutException $e) {
            return response()->json([
                'message' => $e->getMessage(),
                'error'   => 'sold_out',
                'details' => [
                    'event_id'           => $e->getEventId(),
                    'requested_quantity' => $e->getRequestedQuantity(),
                    'available_quantity' => $e->getAvailableQuantity(),
                ],
            ], Response::HTTP_CONFLICT);
        }
    }
}
