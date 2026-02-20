<?php

namespace Tests\Feature;

use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class BookingControllerTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private Event $event;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::factory()->create();

        $this->event = Event::create([
            'name'          => 'Test Concert',
            'total_tickets' => 100,
            'price'         => 500.00,
        ]);

        app(BookingService::class)->initInventory($this->event->id, $this->event->total_tickets);
    }

    // ═══════════════════════════════════════════════════════════════════
    //  WEB CONTROLLER TESTS
    // ═══════════════════════════════════════════════════════════════════

    public function test_web_booking_requires_auth(): void
    {
        $response = $this->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 1,
        ]);

        $response->assertRedirect('/login');
    }

    public function test_web_booking_success(): void
    {
        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 2,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('success');

        $this->assertDatabaseHas('bookings', [
            'user_id'  => $this->user->id,
            'event_id' => $this->event->id,
            'quantity' => 2,
            'status'   => 'confirmed',
        ]);
    }

    public function test_web_booking_validation_quantity_min(): void
    {
        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 0,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_web_booking_validation_quantity_max(): void
    {
        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 5,
        ]);

        $response->assertSessionHasErrors('quantity');
    }

    public function test_web_booking_validation_event_exists(): void
    {
        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => 9999,
            'quantity' => 1,
        ]);

        $response->assertSessionHasErrors('event_id');
    }

    public function test_web_booking_max_4_tickets_per_event(): void
    {
        // Book 3 tickets first
        Booking::create([
            'user_id'  => $this->user->id,
            'event_id' => $this->event->id,
            'quantity' => 3,
            'status'   => 'confirmed',
        ]);

        // Booking 2 more should fail (3 + 2 = 5 > 4)
        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 2,
        ]);

        $response->assertSessionHasErrors('quantity');
        $this->assertDatabaseCount('bookings', 1); // only the original
    }

    public function test_web_booking_sold_out_shows_error(): void
    {
        // Drain inventory
        app(BookingService::class)->initInventory($this->event->id, 0);

        $response = $this->actingAs($this->user)->post('/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 1,
        ]);

        $response->assertRedirect();
        $response->assertSessionHas('error');
    }

    // ═══════════════════════════════════════════════════════════════════
    //  API CONTROLLER TESTS
    // ═══════════════════════════════════════════════════════════════════

    public function test_api_booking_requires_auth(): void
    {
        $response = $this->postJson('/api/bookings', [
            'event_id' => $this->event->id,
            'quantity' => 1,
        ]);

        $response->assertUnauthorized();
    }

    public function test_api_booking_success(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 2,
            ]);

        $response->assertStatus(201)
            ->assertJson([
                'message' => 'Tickets booked successfully.',
                'data' => [
                    'event_id' => $this->event->id,
                    'quantity' => 2,
                    'status'   => 'confirmed',
                ],
            ]);

        $this->assertDatabaseHas('bookings', [
            'user_id'  => $this->user->id,
            'event_id' => $this->event->id,
            'quantity' => 2,
        ]);
    }

    public function test_api_booking_validation_returns_422(): void
    {
        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 10, // max is 4
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('quantity');
    }

    public function test_api_booking_max_4_tickets_per_event(): void
    {
        // Existing booking with 4 tickets
        Booking::create([
            'user_id'  => $this->user->id,
            'event_id' => $this->event->id,
            'quantity' => 4,
            'status'   => 'confirmed',
        ]);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors('quantity');
    }

    public function test_api_booking_sold_out_returns_409(): void
    {
        app(BookingService::class)->initInventory($this->event->id, 0);

        $response = $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 1,
            ]);

        $response->assertStatus(409)
            ->assertJson([
                'error' => 'sold_out',
            ]);
    }

    public function test_api_booking_different_user_can_book_same_event(): void
    {
        $user2 = User::factory()->create();

        // User 1 books 4
        $this->actingAs($this->user, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 4,
            ])->assertStatus(201);

        // User 2 books 4 — should also succeed
        $this->actingAs($user2, 'sanctum')
            ->postJson('/api/bookings', [
                'event_id' => $this->event->id,
                'quantity' => 4,
            ])->assertStatus(201);

        $this->assertDatabaseCount('bookings', 2);
    }
}
