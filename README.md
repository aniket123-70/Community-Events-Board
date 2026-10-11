# Community Events Board

A small app where an admin posts local events (music nights, workshops, food fairs…) and visitors browse them, follow their favourite categories, set reminders and design a personal card for an event.

**Stack:** Next.js 16 (App Router) · TypeScript · Prisma + SQLite · Tailwind CSS v4 · JWT (`jose`) · bcrypt · zod · Motion (animations)

---

## Setup (about 3 minutes)

You need **Node.js 20.9+** and Git. No database server is needed, because SQLite is a single file that is created for you.

```bash
git clone https://github.com/aniket123-70/Community-Events-Board.git
cd Community-Events-Board
cp .env.example .env        # Windows cmd: copy .env.example .env
npm install
npm run db:setup            # creates the database + 15 sample events + admin user
npm run dev
```

Open **http://localhost:3000**.

| Command | What it does |
|---|---|
| `npm run dev` | Start the app in development mode |
| `npm run db:seed` | Reset the sample events (keeps visitor accounts) |
| `npx prisma studio` | Browse the database in your browser |
| `npm run build && npm start` | Production build |

## Logins

| Role | Email | Password |
|---|---|---|
| Admin | `admin@events.local` | `Admin@123` |
| Visitor | Sign up on the site with any email | 8+ characters |

The admin credentials come from `.env` (`ADMIN_EMAIL`, `ADMIN_PASSWORD`). After changing them, run `npm run db:seed`.

## What to try

- **Events page (`/`):** shows only active, upcoming events, nearest first. Category, city and search work together (try *Music + Coimbatore + "night"*). Results are paginated, and the filters live in the URL.
- **Sign up:** you pick favourite categories, then land on **My Feed** (`/feed`).
- **Remind me** on any event: the button flips instantly, stays set after a refresh, and goes back with an error message if saving fails.
- **Event page:** the **Design your card** section has 3 themes, 5 stickers (up to 3 on the card), live animation and auto-save.
- **Admin (`/admin`):** list all events, add an event, and switch events between Active and Inactive. Events are never deleted.

The sample data has 15 events across 5 cities and all 5 categories. Two are inactive and one is in the past, so they are hidden from visitors. Sample dates are relative to the day you run the seed, so upcoming events always stay upcoming.

---

## API

Every page uses this JSON API, so a mobile app can use the same endpoints. Authentication accepts either `Authorization: Bearer <token>` (mobile) or the httpOnly `token` cookie (web). Errors always look like `{ "error": "message" }` with a proper status code (400, 401, 403, 404, 409).

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/signup` | — | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/login` | — | `{ email, password }` → `{ token, user }` |
| POST | `/api/auth/logout` | — | Clears the auth cookie |
| GET | `/api/auth/me` | User | Current user + favourite categories |
| GET | `/api/events` | — | `?category=&city=&q=&page=&pageSize=` → `{ events, pagination }` |
| GET | `/api/events/:id` | — | One active event |
| GET | `/api/cities` | — | Cities that have upcoming events (for the filter) |
| GET / PUT | `/api/me/favourites` | User | `{ categories: ["Music", "Food"] }` |
| GET | `/api/me/feed` | User | `?page=` → upcoming events in favourite categories |
| GET | `/api/me/reminders` | User | `{ eventIds }` |
| PUT / DELETE | `/api/me/reminders/:eventId` | User | Set / remove a reminder (idempotent) |
| GET / PUT | `/api/me/card-designs/:eventId` | User | `{ theme, stickers }` for that event |
| GET | `/api/admin/events` | Admin | All events, including inactive and past ones |
| POST | `/api/admin/events` | Admin | Create an event (validated) |
| PATCH | `/api/admin/events/:id` | Admin | `{ isActive: true \| false }` |

Event lists include `isReminded` for the logged-in user, so the button is correct on first render.

## Project structure

```
prisma/schema.prisma     database tables          prisma/seed.ts   sample data
src/app/api/**/route.ts  JSON API (folder = URL)  src/app/**/page.tsx  pages
src/lib/                 auth, filter query, validation, ₹/date formatting
src/components/          UI (EventsBrowser, RemindButton, CardDesigner, admin/…)
```

## What's left / known limits

- **Remind me** saves the reminder, but no email or push notification is sent yet. That would need a scheduled job.
- **SQLite** keeps setup instant. For production I'd switch the Prisma provider to PostgreSQL. The code doesn't change, only the connection string.
- **Image URLs** are pasted by the admin. There is no file upload. A broken URL shows a placeholder.
- **No rate limiting** on login yet. JWTs can't be revoked before they expire (7 days), so a role change takes effect on the next login.
- Event times are entered and shown in **IST** (Asia/Kolkata), since the board is for Indian cities.

---

## Three short answers

### 1. Database structure, and why

`User(id, email, passwordHash, role)` · `Event(id, title, category, city, startsAt, price, description, imageUrl, isActive)` · `FavouriteCategory(userId, category)` · `Reminder(userId, eventId)` · `CardDesign(userId, eventId, theme, stickers)`.
Each user–event or user–category link is its own table with a **composite primary key**, so duplicates are impossible and "remind me" / "save design" are simple idempotent upserts.
Events are hidden with `isActive` instead of being deleted, and the price is stored as whole rupees in an integer to avoid floating-point errors.

### 2. How the filter query works, and which index

All filters are optional and ANDed: `isActive AND startsAt >= now [AND category = ?] [AND city = ?] [AND (title LIKE %q% OR description LIKE %q%)]`, ordered by `startsAt` with `LIMIT/OFFSET`. A `COUNT` with the same `WHERE` gives the page total (`src/lib/events.ts`).
Indexes in the schema: **`(isActive, category, city, startsAt)`** for filtered lists and **`(isActive, startsAt)`** for the default list.
`LIKE %q%` can't use a normal index, so at scale I'd add full-text search (SQLite FTS5 or a PostgreSQL trigram index).

### 3. Passwords and protecting admin pages and APIs

Passwords are hashed with **bcrypt** and never stored in plain text. Login returns a **JWT (HS256, 7-day expiry)** holding the user id and role. The web app gets it as an **httpOnly cookie**, and mobile clients get it in the JSON response.
Every admin API calls `requireAdmin()`, which verifies the token signature and role on the server (401 if not logged in, 403 if not admin).
The admin pages have a **server-side layout** that checks the token before rendering, so admin content is never sent to non-admins.
