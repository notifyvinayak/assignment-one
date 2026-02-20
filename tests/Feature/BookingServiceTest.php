<?php

namespace Tests\Feature;

use App\Exceptions\SoldOutException;
use App\Models\Booking;
use App\Models\Event;
use App\Models\User;
use App\Services\BookingService;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Redis;
use Tests\TestCase;

class BookingServiceTest extends TestCase
{
    use RefreshDatabase;

    private BookingService $bookingService;
    private User $user;
    private Event $event;

    protected function setUp(): void
    {
        parent::setUp();

        $this->bookingService = app(BookingService::class);

        $this->user = User::factory()->create();

        $this->event = Event::create([
            'name'          => 'Test Concert',
            'total_tickets' => 100,
            'price'         => 500.00,
        ]);

        // Initialize Redis inventory the same way the seeder does
        $this->bookingService->initInventory($this->event->id, $this->event->total_tickets);
    }

    // ─── 1. Happy Path ─────────────────────────────────────────────────

    public function test_book_tickets_successfully(): void
    {
        $booking = $this->bookingService->bookTickets(
            $this->user->id,
            $this->event->id,
            2
        );

        // Assert a Booking model was returned
        $this->assertInstanceOf(Booking::class, $booking);
        $this->assertEquals($this->user->id, $booking->user_id);
        $this->assertEquals($this->event->id, $booking->event_id);
        $this->assertEquals(2, $booking->quantity);
        $this->assertEquals('confirmed', $booking->status);

        // Assert the booking was persisted in the database
        $this->assertDatabaseHas('bookings', [
            'id'       => $booking->id,
            'user_id'  => $this->user->id,
            'event_id' => $this->event->id,
            'quantity' => 2,
            'status'   => 'confirmed',
        ]);

        // Assert Redis inventory was decremented
        $remaining = $this->bookingService->getAvailableTickets($this->event->id);
        $this->assertEquals(98, $remaining);
    }

    // ─── 2. Multiple Bookings Decrement Correctly ───────────────────────

    public function test_multiple_bookings_decrement_inventory_correctly(): void
    {
        $this->bookingService->bookTickets($this->user->id, $this->event->id, 10);
        $this->bookingService->bookTickets($this->user->id, $this->event->id, 20);
        $this->bookingService->bookTickets($this->user->id, $this->event->id, 30);

        // 100 - 10 - 20 - 30 = 40
        $remaining = $this->bookingService->getAvailableTickets($this->event->id);
        $this->assertEquals(40, $remaining);

        // 3 bookings in the database
        $this->assertDatabaseCount('bookings', 3);
    }

    // ─── 3. Exact Inventory Booking (edge case) ─────────────────────────

    public function test_can_book_exact_remaining_inventory(): void
    {
        $booking = $this->bookingService->bookTickets(
            $this->user->id,
            $this->event->id,
            100
        );

        $this->assertInstanceOf(Booking::class, $booking);
        $this->assertEquals(0, $this->bookingService->getAvailableTickets($this->event->id));
    }

    // ─── 4. SoldOutException When Insufficient Inventory ────────────────

    public function test_throws_sold_out_when_quantity_exceeds_available(): void
    {
        $this->expectException(SoldOutException::class);

        $this->bookingService->bookTickets(
            $this->user->id,
            $this->event->id,
            101 // only 100 available
        );
    }

    // ─── 5. SoldOutException After Tickets Are Depleted ─────────────────

    public function test_throws_sold_out_after_inventory_exhausted(): void
    {
        // Book all 100 tickets
        $this->bookingService->bookTickets($this->user->id, $this->event->id, 100);

        $this->expectException(SoldOutException::class);

        // Now even 1 ticket should fail
        $user2 = User::factory()->create();
        $this->bookingService->bookTickets($user2->id, $this->event->id, 1);
    }

    // ─── 6. SoldOutException Contains Correct Data ──────────────────────

    public function test_sold_out_exception_contains_correct_context(): void
    {
        try {
            $this->bookingService->bookTickets(
                $this->user->id,
                $this->event->id,
                150
            );
            $this->fail('SoldOutException was not thrown');
        } catch (SoldOutException $e) {
            $this->assertEquals($this->event->id, $e->getEventId());
            $this->assertEquals(150, $e->getRequestedQuantity());
            $this->assertEquals(100, $e->getAvailableQuantity());
            $this->assertStringContainsString('100', $e->getMessage());
            $this->assertStringContainsString('150', $e->getMessage());
        }
    }

    // ─── 7. No Booking Record Created On SoldOut ────────────────────────

    public function test_no_booking_created_when_sold_out(): void
    {
        try {
            $this->bookingService->bookTickets(
                $this->user->id,
                $this->event->id,
                999
            );
        } catch (SoldOutException) {
            // expected
        }

        $this->assertDatabaseCount('bookings', 0);
    }

    // ─── 8. Inventory Not Changed On SoldOut ────────────────────────────

    public function test_inventory_unchanged_when_sold_out(): void
    {
        try {
            $this->bookingService->bookTickets(
                $this->user->id,
                $this->event->id,
                200
            );
        } catch (SoldOutException) {
            // expected
        }

        // Inventory should still be 100 — no decrement happened
        $this->assertEquals(100, $this->bookingService->getAvailableTickets($this->event->id));
    }

    // ─── 9. initInventory / getAvailableTickets Round-trip ──────────────

    public function test_init_inventory_and_get_available_tickets(): void
    {
        $newEvent = Event::create([
            'name'          => 'Another Concert',
            'total_tickets' => 5000,
            'price'         => 1200.00,
        ]);

        $this->bookingService->initInventory($newEvent->id, 5000);
        $this->assertEquals(5000, $this->bookingService->getAvailableTickets($newEvent->id));
    }

    // ─── 10. DB Failure Rolls Back Redis Inventory ──────────────────────

    public function test_redis_inventory_rolled_back_on_db_failure(): void
    {
        // Spy on the Booking model to force the DB insert to fail
        // We'll do this by temporarily dropping the bookings table
        // after we pass the inventory check, which causes the INSERT to fail.
        // Instead, let's use a simpler approach: mock Booking::create to throw.

        $inventoryBefore = $this->bookingService->getAvailableTickets($this->event->id);

        // We can simulate a DB failure by using a mock service that
        // overrides the DB transaction portion. However, a cleaner
        // approach is to trigger a real constraint violation.

        // Create a booking that violates the foreign key (non-existent user)
        // But since we're on SQLite in tests, FK constraints may not be enforced.
        // Let's instead temporarily rename the table to trigger an error.

        try {
            // Use a non-existent user_id with FK constraints
            // Since SQLite may not enforce FKs, we'll use Schema to break things
            \Illuminate\Support\Facades\Schema::rename('bookings', 'bookings_backup');

            $this->bookingService->bookTickets(
                $this->user->id,
                $this->event->id,
                5
            );

            $this->fail('Expected a database exception');
        } catch (SoldOutException) {
            $this->fail('Got SoldOutException instead of DB exception');
        } catch (\Throwable) {
            // Expected — DB transaction failed

            // The key assertion: inventory should be restored
            $inventoryAfter = $this->bookingService->getAvailableTickets($this->event->id);
            $this->assertEquals(
                $inventoryBefore,
                $inventoryAfter,
                'Redis inventory should be rolled back after DB failure'
            );
        } finally {
            // Restore the table so RefreshDatabase cleanup works
            if (\Illuminate\Support\Facades\Schema::hasTable('bookings_backup')) {
                \Illuminate\Support\Facades\Schema::rename('bookings_backup', 'bookings');
            }
        }
    }

    // ─── 11. Different Events Have Independent Inventories ──────────────

    public function test_different_events_have_independent_inventories(): void
    {
        $event2 = Event::create([
            'name'          => 'Second Concert',
            'total_tickets' => 50,
            'price'         => 300.00,
        ]);
        $this->bookingService->initInventory($event2->id, 50);

        // Book from event 1
        $this->bookingService->bookTickets($this->user->id, $this->event->id, 10);

        // Event 1 should have 90, Event 2 should still have 50
        $this->assertEquals(90, $this->bookingService->getAvailableTickets($this->event->id));
        $this->assertEquals(50, $this->bookingService->getAvailableTickets($event2->id));

        // Book from event 2
        $this->bookingService->bookTickets($this->user->id, $event2->id, 5);
        $this->assertEquals(90, $this->bookingService->getAvailableTickets($this->event->id));
        $this->assertEquals(45, $this->bookingService->getAvailableTickets($event2->id));
    }
}
