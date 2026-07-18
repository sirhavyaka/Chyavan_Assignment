# 🏠 Airbnb Clone — Full-Stack Web Application

A production-ready, full-stack Airbnb clone built from scratch as an assignment project. Features a pixel-perfect responsive UI with dark mode, JWT authentication, real-time search with filters, booking management, reviews, wishlists, and a complete host dashboard — all backed by a RESTful API.

> **Live Demo**: [https://chyavan-airbnb-clone.vercel.app](https://chyavan-airbnb-clone.vercel.app)  
> **API Docs**: [https://chyavan-assignment.onrender.com/docs](https://chyavan-assignment.onrender.com/docs)

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture Overview](#architecture-overview)
- [Database Schema](#database-schema)
- [Features](#features)
- [Setup Instructions](#setup-instructions)
- [Deployment](#deployment)
- [Distinctive Features & Improvements](#distinctive-features--improvements)
- [Assumptions](#assumptions)

---

## Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | Next.js 15 (App Router) | Server-side rendering, file-based routing, React Server Components |
| **Styling** | Tailwind CSS + CSS Variables | Utility-first styling with a custom design token system for theming |
| **State Management** | React Context API | Global auth state, theme toggling (no Redux needed) |
| **Backend** | FastAPI (Python) | High-performance async REST API with automatic OpenAPI docs |
| **ORM** | SQLAlchemy 2.0 | Declarative models, relationship management, query building |
| **Database** | SQLite 3 | Lightweight, zero-config relational database (contest requirement) |
| **Auth** | JWT (python-jose) + bcrypt | Stateless token-based authentication with password hashing |
| **Validation** | Pydantic v2 | Request/response schema validation with automatic serialization |
| **Deployment** | Vercel (frontend) + Render (backend) | Production hosting with CI/CD from GitHub |

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Browser)                         │
│                   Next.js 15 on Vercel                          │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐ ┌──────────┐            │
│  │  Pages   │ │Components│ │ Context │ │ API Lib  │            │
│  │ (App     │ │ (Header, │ │ (Auth,  │ │ (Typed   │            │
│  │  Router) │ │  Cards,  │ │  Theme, │ │  Fetch   │            │
│  │          │ │  Footer) │ │  Toast) │ │  Client) │            │
│  └──────────┘ └──────────┘ └─────────┘ └────┬─────┘            │
└─────────────────────────────────────────────┼───────────────────┘
                                              │ HTTPS (JSON)
                                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                     SERVER (Render)                              │
│                  FastAPI + Uvicorn                               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │  Routers │ │ Schemas  │ │ Services │ │  Models  │           │
│  │ #auth,   │ │ (Pydantic│ │ (auth,   │ │ (ORM     │           │
│  │ listings,│ │  v2      │ │  seed,   │ │  classes)│           │
│  │ bookings,│ │  request/ │ │  hashing)│ │          │           │
│  │ reviews, │ │  response)│ │          │ │          │           │
│  │ wishlists│ │          │ │          │ │          │           │
│  └────┬─────┘ └──────────┘ └──────────┘ └────┬─────┘           │
│       │                                       │                 │
│       └───────────────┬───────────────────────┘                 │
│                       ▼                                         │
│              ┌─────────────────┐                                │
│              │   SQLAlchemy    │                                │
│              │   Engine        │                                │
│              └───────┬─────────┘                                │
│                      ▼                                          │
│              ┌─────────────────┐                                │
│              │   SQLite 3      │                                │
│              │   (airbnb.db)   │                                │
│              └─────────────────┘                                │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

1. User interacts with the Next.js frontend.
2. The typed `ApiClient` (`lib/api.ts`) sends an authenticated fetch request to the FastAPI backend.
3. FastAPI validates the request using Pydantic schemas and authenticates via JWT.
4. The appropriate router handler queries the SQLite database via SQLAlchemy ORM.
5. The response is serialized back through Pydantic and returned as JSON.

---

## Database Schema

```mermaid
ER Diagram
    USERS {
        int id PK
        string email UK
        string name
        string password_hash
        string avatar_url
        text bio
        bool is_superhost
        datetime created_at
    }

    LISTINGS {
        int id PK
        int host_id FK
        string title
        text description
        string property_type
        string category
        float price_per_night
        float cleaning_fee
        float service_fee_percent
        string city
        string state
        string country
        string address
        float latitude
        float longitude
        int max_guests
        int bedrooms
        int beds
        float bathrooms
        float rating
        int review_count
        bool is_guest_favorite
        datetime created_at
        datetime updated_at
    }

    LISTING_IMAGES {
        int id PK
        int listing_id FK
        string url
        string caption
        int display_order
    }

    AMENITIES {
        int id PK
        string name UK
        string icon
        string category
    }

    LISTING_AMENITIES {
        int listing_id FK
        int amenity_id FK
    }

    BOOKINGS {
        int id PK
        int listing_id FK
        int guest_id FK
        date check_in
        date check_out
        int guests
        float total_price
        string status
        datetime created_at
    }

    REVIEWS {
        int id PK
        int listing_id FK
        int user_id FK
        int booking_id FK
        float rating
        float cleanliness
        float accuracy
        float check_in_rating
        float communication
        float location_rating
        float value
        text comment
        datetime created_at
    }

    WISHLISTS {
        int id PK
        int user_id FK
        int listing_id FK
        datetime created_at
    }

    USERS ||--o{ LISTINGS : "hosts"
    USERS ||--o{ BOOKINGS : "books"
    USERS ||--o{ REVIEWS : "writes"
    USERS ||--o{ WISHLISTS : "saves"
    LISTINGS ||--o{ LISTING_IMAGES : "has"
    LISTINGS ||--o{ BOOKINGS : "receives"
    LISTINGS ||--o{ REVIEWS : "receives"
    LISTINGS ||--o{ WISHLISTS : "saved_in"
    LISTINGS }o--o{ AMENITIES : "listing_amenities"
    BOOKINGS ||--o| REVIEWS : "reviewed_via"
```

### Key Relationships

| Relationship | Type | Description |
|---|---|---|
| User → Listings | One-to-Many | A user can host multiple listings |
| User → Bookings | One-to-Many | A user can make multiple bookings |
| Listing → Images | One-to-Many | Each listing has multiple images with display ordering |
| Listing ↔ Amenities | Many-to-Many | Through the `listing_amenities` junction table |
| Booking → Review | One-to-One | Each booking can have at most one review |
| User → Wishlists | One-to-Many | Users can wishlist multiple listings |

### Constraints

- `price_per_night > 0` (enforced at DB level via `CheckConstraint`)
- `max_guests > 0`
- `check_out > check_in` (prevents invalid booking ranges)
- `guests > 0`
- Unique email per user
- Cascade deletes on all foreign keys (deleting a user removes their listings, bookings, reviews)

---

## Features

### Core Features
- **User Authentication**: Register/Login with JWT tokens, bcrypt password hashing, persistent sessions via localStorage
- **Listing Browsing**: Paginated grid of property cards with image carousels, ratings, pricing, and "Guest Favorite" badges
- **Category Filtering**: Filter by All, Homes, Experiences, and Services via tabbed navigation
- **Search & Filters**: Location-based search, date availability, guest count, price range, property type, and amenity filters
- **Listing Details**: Full property page with image gallery, amenity list, host info, reviews section, and booking widget
- **Booking System**: Date selection with availability checking, price breakdown (nightly + cleaning + service fees), overlap detection
- **Reviews**: 6-dimension rating system (cleanliness, accuracy, check-in, communication, location, value) with booking validation
- **Wishlists**: Heart-toggle on any listing card, dedicated wishlists page
- **Host Dashboard**: Create, edit, and delete your own listings with full image and amenity management
- **Trip Management**: View all your upcoming and past bookings with cancellation support

### UI/UX Features
- **Dark Mode**: Full website-wide dark mode with a toggle in the navbar, using CSS custom properties for seamless theming
- **Responsive Design**: Mobile-first layout with a full-screen search modal, scrollable category pills, and adaptive header
- **Image Carousels**: Smooth left/right navigation on listing cards with dot indicators
- **Toast Notifications**: Contextual success/error feedback for all user actions
- **Loading States**: Skeleton loaders and spinners for a polished async experience

---

## Setup Instructions

### Prerequisites

- **Node.js** ≥ 18 and **npm**
- **Python** ≥ 3.10
- **Git**

### 1. Clone the Repository

```bash
git clone https://github.com/sirhavyaka/Chyavan_Assignment.git
cd Chyavan_Assignment
```

### 2. Backend Setup

```bash
cd backend

# Create and activate a virtual environment
python -m venv venv

# Windows:
venv\Scripts\activate

# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Run the server (auto-creates DB and seeds data on first launch)
uvicorn app.main:app --reload --port 8000
```

The backend will be available at `http://localhost:8000`.  
Interactive API docs are at `http://localhost:8000/docs`.

> **Note**: The database is created automatically on first run. The `lifespan` event in `main.py` calls `seed_database()` to populate sample users, listings, amenities, bookings, and reviews. Additional seed scripts in `scripts/` add extra destinations and experiences.

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
echo "NEXT_PUBLIC_API_URL=http://localhost:8000" > .env.local

# Run the dev server
npm run dev
```

The frontend will be available at `http://localhost:3000`.

### 4. Test Credentials

After seeding, you can log in with any of these demo accounts:

| Email | Password |
|---|---|
| `alice@example.com` | `password123` |
| `bob@example.com` | `password123` |

Or register a new account through the Sign Up page.

---

## Deployment

### Backend → Render (Free Tier)
> Used Render as it is optimized for python backend applications and also provides free tier for deployment.
> The auto-seeding approach means the SQLite database is recreated and populated fresh on every cold start — evaluators will always see a fully functional app.

### Frontend → Deployed on Vercel Hobby Plan
> Used Vercel as it is optimized for Next.js applications.

## Distinctive Features & Improvements

### Beyond the Base Requirements

1. **Auto-Seeding Architecture**: The database self-populates on every server start via FastAPI's `lifespan` event. This eliminates the need for manual DB setup and ensures the deployed app is always fully populated, even on Render's ephemeral free tier.

2. **Website-Wide Dark Mode**: Implemented using CSS custom properties (`--bg-primary`, `--text-primary`, etc.) toggled via a `ThemeProvider` context. Every page, component, modal, and overlay respects the theme — not just surface-level color swaps.

3. **Typed API Client**: The frontend uses a single `ApiClient` class (`lib/api.ts`) with full TypeScript generics. Every API call is type-safe from request to response, catching bugs at compile time rather than runtime.

4. **Multi-Category Listings**: The schema supports Homes, Experiences, and Services under a unified `Listing` model with a `category` field, rather than separate tables. This simplifies queries and enables cross-category search.

5. **6-Dimension Review System**: Reviews go beyond a simple star rating. Each review captures six sub-ratings (cleanliness, accuracy, check-in, communication, location, value) that are individually displayed on the listing detail page.

6. **Smart Booking Validation**: The booking system performs overlap detection at the database level, prevents self-booking, validates dates (no past check-ins), and enforces guest capacity limits — all before calculating the price breakdown.

7. **Responsive Mobile UX**: The header transforms completely on mobile — a compact search pill that opens into a full-screen search modal with suggested destinations, horizontally scrollable category pills, and a sticky gradient search button.

8. **Dynamic Experience Scheduling**: Experience listings dynamically compute "Happening Today" and "Happening Tomorrow" labels based on the current date, with randomized time slots to simulate a live marketplace.

9. **Interactive API Documentation**: FastAPI auto-generates OpenAPI (Swagger) docs at `/docs`, allowing evaluators to test every endpoint directly in the browser without any tooling.

---

## Assumptions

1. **SQLite 3 is required** per contest rules. The `database.py` module is designed to support both SQLite and PostgreSQL (via an environment variable switch), but the default and deployed configuration uses SQLite.

2. **Ephemeral storage is acceptable** on the free tier. User-created data (new bookings, reviews, listings) will persist as long as the Render server is warm, but will reset on cold starts. This is a known trade-off of using SQLite on serverless/free-tier platforms.

3. **Image URLs are external** (Unsplash). No file upload system was implemented; listings reference image URLs directly. This keeps the app lightweight and avoids the need for an object storage service.

4. **Prices are in INR (₹)**. All pricing throughout the UI and seed data uses Indian Rupees.

5. **Authentication is session-based via localStorage**. JWTs are stored in `localStorage` for simplicity. In a production app, `httpOnly` cookies would be preferable for XSS protection.

6. **Email verification is not implemented**. Users can register with any email without verification, as this is a demo application.

---

## API Endpoints

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | ✗ | Register a new user |
| `POST` | `/api/auth/login` | ✗ | Log in and receive JWT |
| `GET` | `/api/auth/me` | ✓ | Get current user profile |
| `GET` | `/api/listings` | ✗ | List all listings (paginated, filterable) |
| `GET` | `/api/listings/{id}` | ✗ | Get listing details |
| `GET` | `/api/listings/{id}/availability` | ✗ | Get booked date ranges |
| `GET` | `/api/listings/amenities` | ✗ | List all amenities |
| `POST` | `/api/listings` | ✓ | Create a new listing |
| `PUT` | `/api/listings/{id}` | ✓ | Update a listing (owner only) |
| `DELETE` | `/api/listings/{id}` | ✓ | Delete a listing (owner only) |
| `POST` | `/api/bookings` | ✓ | Create a booking |
| `GET` | `/api/bookings/my-trips` | ✓ | Get user's bookings |
| `GET` | `/api/bookings/host-bookings` | ✓ | Get bookings for host's listings |
| `PATCH` | `/api/bookings/{id}/cancel` | ✓ | Cancel a booking |
| `POST` | `/api/reviews` | ✓ | Create a review (must have booking) |
| `GET` | `/api/reviews/listing/{id}` | ✗ | Get reviews for a listing |
| `POST` | `/api/wishlists/toggle` | ✓ | Toggle wishlist for a listing |
| `GET` | `/api/wishlists` | ✓ | Get user's wishlisted listings |
| `GET` | `/api/health` | ✗ | Health check |

---

## Project Structure

```
Chyavan_Assignment/
├── backend/
│   ├── app/
│   │   ├── core/              # Settings & configuration
│   │   ├── db/                # Database engine & session
│   │   ├── models/            # SQLAlchemy ORM models
│   │   ├── routers/           # API route handlers
│   │   ├── schemas/           # Pydantic request/response schemas
│   │   ├── services/          # Business logic (auth, seeding)
│   │   └── main.py            # FastAPI app entrypoint
│   ├── scripts/               # Additional seed data scripts
│   ├── tests/                 # API integration tests
│   └── requirements.txt
├── frontend/
│   ├── public/                # Static assets (logo, icons)
│   └── src/
│       ├── app/               # Next.js pages (App Router)
│       │   ├── book/          # Booking page
│       │   ├── hosting/       # Host dashboard (create/edit)
│       │   ├── listings/      # Listing detail page
│       │   ├── login/         # Auth page
│       │   ├── trips/         # User's trips
│       │   └── wishlists/     # Saved listings
│       ├── components/        # Reusable UI components
│       ├── context/           # React contexts (Auth, Theme, Toast)
│       ├── lib/               # API client & utilities
│       └── types/             # TypeScript type definitions
└── README.md
```
