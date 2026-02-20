<?php

namespace App\Http\Requests;

use App\Models\Booking;
use Illuminate\Foundation\Http\FormRequest;

class BookingRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Auth middleware on the route handles access control
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
    public function rules(): array
    {
        return [
            'event_id' => ['required', 'integer', 'exists:events,id'],
            'quantity' => ['required', 'integer', 'min:1', 'max:4'],
        ];
    }

    /**
     * Configure the validator instance.
     *
     * Adds a custom rule: a user may not hold more than 4 tickets
     * total for a single event (across all their bookings).
     */
    public function withValidator(\Illuminate\Contracts\Validation\Validator $validator): void
    {
        $validator->after(function (\Illuminate\Contracts\Validation\Validator $validator) {
            if ($validator->errors()->isNotEmpty()) {
                return; // skip custom check if basic validation already failed
            }

            $userId = $this->user()->id;
            $eventId = $this->input('event_id');
            $quantity = (int) $this->input('quantity');

            $existingTickets = Booking::where('user_id', $userId)
                ->where('event_id', $eventId)
                ->sum('quantity');

            if (($existingTickets + $quantity) > 4) {
                $remaining = max(0, 4 - $existingTickets);

                $validator->errors()->add(
                    'quantity',
                    $remaining === 0
                        ? 'You have already booked the maximum of 4 tickets for this event.'
                        : "You can only book {$remaining} more ticket(s) for this event."
                );
            }
        });
    }

    /**
     * Custom error messages.
     */
    public function messages(): array
    {
        return [
            'quantity.min' => 'You must book at least 1 ticket.',
            'quantity.max' => 'You cannot book more than 4 tickets at a time.',
            'event_id.exists' => 'The selected event does not exist.',
        ];
    }
}
