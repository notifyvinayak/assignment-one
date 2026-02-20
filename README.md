# 🎫 Coldplay Mumbai 2026 — Ticketing System

A high-concurrency ticket booking system built with **Laravel**, **Redis**, and **MySQL**. Designed to handle millions of concurrent users with atomic locks, Redis-backed inventory, and strict per-user booking limits.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel 12 (PHP 8.4) |
| Database | MySQL 8.0 |
| Cache / Locks | Redis (via `phpredis`) |
| API Auth | Laravel Sanctum v4 |
| Frontend | Inertia.js + Vue |
| Infrastructure | Docker Compose |

---

## Architecture Overview

```
Request → Rate Limiter (10/min) → Auth Guard → BookingRequest (validation)
                                                      │
                                                      ▼
                                              BookingController
                                              (Web or API)
                                                      │
                                                      ▼
                                              BookingService.bookTickets()
                                                      │
                                    ┌─────────────────┼─────────────────┐
                                    ▼                 ▼                 ▼
                              Redis Lock        Redis Inventory    DB Transaction
                          (per-event, 5s)       (decrby/incrby)    (insert Booking)
```

**Concurrency strategy:**
1. **Redis atomic lock** (`Cache::lock('book_event_{id}', 5)`) serialises requests per event
2. **Redis inventory** for O(1) reads/decrements — no DB in the hot path
3. **DB transaction** for the booking insert — if it fails, Redis inventory is rolled back
4. **Rate limiter** (10 req/min per user) prevents bot spam on both Web and API

---

## Getting Started

### Prerequisites
- Docker & Docker Compose

### Setup
```bash
# 1. Start all containers
docker compose up -d

# 2. Verify containers are running
docker compose ps
# Should show: coldplay_tickets_app, coldplay_tickets_nginx, coldplay_tickets_mysql, coldplay_tickets_redis

# 3. Run migrations & seed
docker compose exec app php artisan migrate:fresh --seed --seeder=EventSeeder
```

---

## API Routes

| Method | URI | Auth | Rate Limit | Controller |
|---|---|---|---|---|
| `POST` | `/bookings` | Session (web) | `throttle:booking` | `Web\BookingController@store` |
| `POST` | `/api/bookings` | Sanctum token | `throttle:booking` | `Api\BookingController@store` |

### Request Body
```json
{
    "event_id": 1,
    "quantity": 2
}
```

### Validation Rules
| Field | Rules |
|---|---|
| `event_id` | required, integer, must exist in `events` table |
| `quantity` | required, integer, min: 1, max: 4 |
| *custom* | User cannot exceed 4 total tickets per event across all bookings |

### Web Response (Inertia)
- **Success** → redirect back with `session('success')` flash
- **Sold out** → redirect back with `session('error')` flash
- **Validation** → redirect back with `session('errors')` (standard Laravel)

### API Response
**201 Created** (success):
```json
{
    "message": "Tickets booked successfully.",
    "data": {
        "booking_id": 1,
        "event_id": 1,
        "quantity": 2,
        "status": "confirmed",
        "created_at": "2026-02-20T17:30:00.000000Z"
    }
}
```

**409 Conflict** (sold out):
```json
{
    "message": "Only 3 ticket(s) remaining for Event #1, but 4 requested.",
    "error": "sold_out",
    "details": {
        "event_id": 1,
        "requested_quantity": 4,
        "available_quantity": 3
    }
}
```

**422 Unprocessable** (validation error):
```json
{
    "message": "You can only book 1 more ticket(s) for this event.",
    "errors": { "quantity": ["..."] }
}
```

---

## Verification Commands

### Verify MySQL
```bash
# Check seeded event
docker compose exec app php artisan tinker --execute="echo json_encode(App\Models\Event::first()->toArray(), JSON_PRETTY_PRINT);"

# Check table schemas
docker compose exec app php artisan tinker --execute="echo implode(', ', Illuminate\Support\Facades\Schema::getColumnListing('events'));"
docker compose exec app php artisan tinker --execute="echo implode(', ', Illuminate\Support\Facades\Schema::getColumnListing('bookings'));"
```

### Verify Redis Inventory
```bash
# Via BookingService (recommended)
docker compose exec app php artisan tinker --execute="echo 'Inventory: ' . app(App\Services\BookingService::class)->getAvailableTickets(1);"

# Via Redis facade
docker compose exec app php artisan tinker --execute="echo 'Inventory: ' . Illuminate\Support\Facades\Redis::get('event_inventory:1');"
```
> ⚠️ Do NOT use `Cache::get()` — the `BookingService` uses the `Redis` facade (prefix: `laravel-database-`), not the Cache facade.


---

## Test Suite

```bash
# Run the full suite (49 tests, 118 assertions)
docker exec coldplay_tickets_app php vendor/bin/phpunit

# Run only BookingService tests
docker exec coldplay_tickets_app php vendor/bin/phpunit tests/Feature/BookingServiceTest.php

# Run only Controller tests
docker exec coldplay_tickets_app php vendor/bin/phpunit tests/Feature/BookingControllerTest.php
```


