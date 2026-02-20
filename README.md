# 🧪 Testing Guide — Coldplay Ticketing System (Database Layer)

## Prerequisites
Make sure all Docker containers are running:
```bash
docker compose ps
```
You should see `coldplay_tickets_app`, `coldplay_tickets_nginx`, `coldplay_tickets_mysql`, and `coldplay_tickets_redis` all in a running state.

---

## 1. Run Migrations & Seed
```bash
# Fresh migration + seed the Coldplay event + push inventory to Redis
docker compose exec app php artisan migrate:fresh --seed --seeder=EventSeeder
```

---

## 2. Verify MySQL — Event Created
```bash
docker compose exec app php artisan tinker --execute="echo json_encode(App\Models\Event::first()->toArray(), JSON_PRETTY_PRINT);"
```
**Expected output:**
```json
{
    "id": 1,
    "name": "Coldplay Mumbai 2026",
    "total_tickets": 50000,
    "price": "2500.00",
    "created_at": "...",
    "updated_at": "..."
}
```

---

## 3. Verify MySQL — Table Schemas
```bash
# Events table columns
docker compose exec app php artisan tinker --execute="echo implode(', ', Illuminate\Support\Facades\Schema::getColumnListing('events'));"
# Expected: id, name, total_tickets, price, created_at, updated_at

# Bookings table columns
docker compose exec app php artisan tinker --execute="echo implode(', ', Illuminate\Support\Facades\Schema::getColumnListing('bookings'));"
# Expected: id, user_id, event_id, quantity, status, created_at, updated_at
```

---

## 4. Verify Redis — Ticket Inventory
The inventory is stored via `Redis::set('event_inventory:{id}', ...)` (not `Cache::`).

```bash
# Via BookingService (recommended)
docker compose exec app php artisan tinker --execute="echo 'Inventory: ' . app(App\Services\BookingService::class)->getAvailableTickets(1);"

# Or via the Redis facade directly
docker compose exec app php artisan tinker --execute="echo 'Inventory: ' . Illuminate\Support\Facades\Redis::get('event_inventory:1');"
```
**Expected output:**
```
Inventory: 50000
```

> ⚠️ **Note:** Do NOT use `Cache::get()` to check this key. The `BookingService` uses the `Redis` facade
> (prefix: `laravel-database-`), while `Cache::get()` uses a different prefix (`laravel_cache:`).

---

## 5. Verify Eloquent Relationships
```bash
docker compose exec app php artisan tinker --execute="
\$event = App\Models\Event::first();
echo 'Event: ' . \$event->name . PHP_EOL;
echo 'Bookings count: ' . \$event->bookings->count() . PHP_EOL;
"
```

---

## 6. Quick Sanity Check — All in One
```bash
docker compose exec app php artisan tinker --execute="
\$event = App\Models\Event::first();
\$inventory = app(App\Services\BookingService::class)->getAvailableTickets(\$event->id);
echo '=== MYSQL ===' . PHP_EOL;
echo 'Event: ' . \$event->name . ' | Tickets: ' . \$event->total_tickets . ' | Price: ' . \$event->price . PHP_EOL;
echo '=== REDIS ===' . PHP_EOL;
echo 'event_inventory:' . \$event->id . ' = ' . \$inventory . PHP_EOL;
echo '=== STATUS: ALL GOOD ===' . PHP_EOL;
"
```

---

## 7. Run the Test Suite
```bash
# Run all BookingService tests (11 tests, 26 assertions)
docker exec coldplay_tickets_app php vendor/bin/phpunit tests/Feature/BookingServiceTest.php

# Run the full test suite
docker exec coldplay_tickets_app php vendor/bin/phpunit
```

**Tests cover:**
| # | Test | What It Verifies |
|---|---|---|
| 1 | Happy path booking | Booking created, DB record exists, inventory decremented |
| 2 | Multiple bookings | Sequential bookings decrement correctly |
| 3 | Exact inventory | Booking all remaining tickets works |
| 4 | SoldOut — over limit | Requesting > available throws `SoldOutException` |
| 5 | SoldOut — exhausted | After all tickets booked, even 1 more fails |
| 6 | Exception context | Exception carries correct eventId, quantities, message |
| 7 | No DB record on SoldOut | Zero bookings inserted on failure |
| 8 | Inventory unchanged on SoldOut | Redis inventory untouched when check fails |
| 9 | init/get round-trip | `initInventory()` → `getAvailableTickets()` consistency |
| 10 | DB failure rollback | Redis inventory restored when DB insert fails |
| 11 | Independent events | Booking one event doesn't affect another |

---

## Artisan Commands Used to Generate
```bash
# Models + Migrations
docker compose exec app php artisan make:model Event -m
docker compose exec app php artisan make:model Booking -m

# Seeder
docker compose exec app php artisan make:seeder EventSeeder

# Run everything
docker compose exec app php artisan migrate:fresh --seed --seeder=EventSeeder
```

---

## File Structure
```
app/
├── Exceptions/
│   └── SoldOutException.php  # Custom exception with eventId, requested/available qty
├── Models/
│   ├── User.php              # hasMany(Booking::class)
│   ├── Event.php             # hasMany(Booking::class)
│   └── Booking.php           # belongsTo(Event::class), belongsTo(User::class)
└── Services/
    └── BookingService.php    # bookTickets(), initInventory(), getAvailableTickets()

database/migrations/
├── 2026_02_20_150021_create_events_table.php    # id, name, total_tickets, price
└── 2026_02_20_150022_create_bookings_table.php  # id, user_id(FK), event_id(FK), quantity, status

database/seeders/
└── EventSeeder.php           # Creates event + initialises Redis inventory via BookingService

tests/Feature/
└── BookingServiceTest.php    # 11 tests covering concurrency, rollback, edge cases
```
