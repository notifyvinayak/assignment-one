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

## 4. Verify Redis — Cache::forever('event:1:inventory', 50000)


```bash
docker compose exec app php artisan tinker --execute="echo 'Inventory: ' . Illuminate\Support\Facades\Cache::get('event:1:inventory');"
```
**Expected output:**
```
Inventory: 50000
```

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
echo '=== MYSQL ===' . PHP_EOL;
echo 'Event: ' . \$event->name . ' | Tickets: ' . \$event->total_tickets . ' | Price: ' . \$event->price . PHP_EOL;
echo '=== REDIS ===' . PHP_EOL;
echo 'Cache event:1:inventory = ' . Illuminate\Support\Facades\Cache::get('event:1:inventory') . PHP_EOL;
echo '=== STATUS: ALL GOOD ===' . PHP_EOL;
"
```

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
app/Models/
├── User.php         # hasMany(Booking::class)
├── Event.php        # hasMany(Booking::class)
└── Booking.php      # belongsTo(Event::class), belongsTo(User::class)

database/migrations/
├── 2026_02_20_150021_create_events_table.php    # id, name, total_tickets, price
└── 2026_02_20_150022_create_bookings_table.php  # id, user_id(FK), event_id(FK), quantity, status

database/seeders/
└── EventSeeder.php  # Creates event + Cache::forever('event:1:inventory', 50000)
```
