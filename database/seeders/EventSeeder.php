<?php

namespace Database\Seeders;

use App\Models\Event;
use App\Services\BookingService;
use Illuminate\Database\Seeder;

class EventSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $event = Event::create([
            'name' => 'Coldplay Mumbai 2026',
            'total_tickets' => 50000,
            'price' => 2500.00,
        ]);

        // Push the initial ticket inventory to Redis using BookingService
        // so the key format stays consistent across the entire application.
        $bookingService = app(BookingService::class);
        $bookingService->initInventory($event->id, $event->total_tickets);
    }
}
