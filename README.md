# 🎫 TicketFlow — High-Concurrency Ticketing System

A high-concurrency, modern ticket booking system built with **Laravel**, **React**, **Redis**, and **MySQL**. Designed to handle massive concurrent users with atomic locks, Redis-backed inventory, and strict per-user booking limits. Features a beautifully crafted, fully-responsive dark mode UI.

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Laravel (PHP 8.2+) |
| Database | MySQL 8.0 |
| Cache / Locks | Redis (via `phpredis`) |
| API Auth | Laravel Sanctum |
| Frontend | React + Inertia.js |
| Styling | Tailwind CSS (Dark Mode / Glassmorphism) |
| Infrastructure | Docker Compose |

---

## Getting Started (Setup Instructions)

Follow these steps to run the project locally via Docker.

### 1. Requirements
- Docker & Docker Compose installed on your machine.

### 2. Environment Setup
Clone the repository and prepare your environment file:
```bash
cp .env.example .env
```
*(Ensure DB and Redis configurations in `.env` match the docker-compose services)*

### 3. Spin up Docker Containers
Start the infrastructure (Nginx, PHP-FPM, MySQL, Redis):
```bash
docker compose up -d
```

### 4. Install Dependencies
Install PHP and Node dependencies inside the app container:
```bash
docker compose exec app composer install
docker compose exec app npm install
```

### 5. Application Key & Migrations
Generate the app key and seed the database with events/inventory:
```bash
docker compose exec app php artisan key:generate
docker compose exec app php artisan migrate:fresh --seed
```

### 6. Build Frontend Assets
Compile the React/TailwindCSS frontend assets:
```bash
# For development/hot-reloading:
docker compose exec app npm run dev

# Or for a production build:
docker compose exec app npm run build
```

**That's it!** The application is now accessible at `http://localhost`.

---

## Running Tests

The application features a comprehensive test suite (49+ tests) covering Authentication, high-concurrency Booking Services, and Profiles.

To run the unit and feature tests:
```bash
docker compose exec app php artisan test
```

To run code-style checks (Pint):
```bash
docker compose exec app ./vendor/bin/pint --test
```

---

## Architecture Overview

**Concurrency Strategy:**
1. **Redis atomic lock** (`Cache::lock('book_event_{id}')`) serialises requests per event to prevent race conditions.
2. **Redis hot inventory** provides O(1) reads and decrements for blazing-fast checkout validation (bypassing heavy DB counts in the hot path).
3. **Database transactions** wrap the actual booking insertion — if the DB fails, the Redis inventory is cleanly rolled back.
4. **Rate limiter** (10 req/min/user) throttles automated bot spam on the booking endpoint.

**Frontend Features:**
- Seamless zero-refresh SPA routing via **Inertia.js**.
- Automatic Intent-based URL redirecting (Intercepts unauthorized checkouts, guides through login, and returns directly to the checkout form).
- Beautiful, animated UI with a dynamic Light/Dark mode toggle (persisted via `localStorage`).
