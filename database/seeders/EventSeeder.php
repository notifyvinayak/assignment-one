<?php

namespace Database\Seeders;

use App\Models\Event;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Cache;

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

        // Push the initial ticket inventory to Redis
        Cache::forever('event:' . $event->id . ':inventory', $event->total_tickets);
    }
}
