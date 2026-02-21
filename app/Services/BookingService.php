<?php

namespace App\Services;

use App\Exceptions\SoldOutException;
use App\Jobs\SendBookingConfirmationJob;
use App\Models\Booking;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redis;

class BookingService
{
    /**
     * The prefix used for Redis inventory keys.
     */
    private const INVENTORY_KEY_PREFIX = 'event_inventory:';

    /**
     * The prefix used for the Redis atomic lock.
     */
    private const LOCK_KEY_PREFIX = 'book_event_';

    /**
     * Lock timeout in seconds. Keeps the critical section short
     * so waiting requests aren't blocked for too long.
     */
    /**
     * Lock timeout in seconds.
     */
    private const LOCK_TIMEOUT = 45;

    /**
     * Maximum seconds a request will wait to acquire the lock.
     */
    private const LOCK_WAIT = 45;

    public function bookTickets(int $userId, int $eventId, int $quantity): Booking
    {
        $lockKey = self::LOCK_KEY_PREFIX.$eventId;
        $inventoryKey = self::INVENTORY_KEY_PREFIX.$eventId;

        // ── 1. Acquire a per-event atomic lock ──────────────────────────
        $lock = Cache::lock($lockKey, self::LOCK_TIMEOUT);

        return $lock->block(self::LOCK_WAIT, function () use ($userId, $eventId, $quantity, $inventoryKey) {

            // ── 2. Read current inventory from Redis ────────────────────
            $available = (int) Redis::get($inventoryKey);

            // ── 3. Check availability ───────────────────────────────────
            if ($quantity > $available) {
                throw new SoldOutException($eventId, $quantity, $available);
            }

            // ── [PAYMENT SIMULATION] ──────────────────────────────────────
            // Simulates a slow 30-sec checkout gateway inside the critical
            // section to explicitly demonstrate how atomic locks queue
            // concurrent ticket buyers globally!
            if (! app()->runningUnitTests()) {
                sleep(30);
            }

            // ── 4. Decrement inventory in Redis (fast, atomic) ──────────
            Redis::decrby($inventoryKey, $quantity);

            // ── 5. Persist the booking in the database ──────────────────
            try {
                $booking = DB::transaction(function () use ($userId, $eventId, $quantity) {
                    return Booking::create([
                        'user_id' => $userId,
                        'event_id' => $eventId,
                        'quantity' => $quantity,
                        'status' => 'confirmed',
                    ]);
                });

                // ── 6. Dispatch async confirmation email ─────────────────
                SendBookingConfirmationJob::dispatch($booking);

                return $booking;
            } catch (\Throwable $e) {
                // ── 6. Rollback: restore inventory in Redis ─────────────
                Redis::incrby($inventoryKey, $quantity);

                Log::error('BookingService: DB transaction failed – inventory rolled back.', [
                    'user_id' => $userId,
                    'event_id' => $eventId,
                    'quantity' => $quantity,
                    'error' => $e->getMessage(),
                ]);

                throw $e;
            }
        });
    }

    /**
     * Initialise (or reset) the Redis inventory for an event.
     *
     * Call this when an event is created or when you need to
     * re-sync Redis with the database (e.g. via an Artisan command).
     *
     * @param  int  $eventId  The event ID.
     * @param  int  $totalTickets  The total number of available tickets.
     */
    public function initInventory(int $eventId, int $totalTickets): void
    {
        Redis::set(self::INVENTORY_KEY_PREFIX.$eventId, $totalTickets);
    }

    /**
     * Get the current available inventory for an event from Redis.
     */
    public function getAvailableTickets(int $eventId): int
    {
        return (int) Redis::get(self::INVENTORY_KEY_PREFIX.$eventId);
    }
}
