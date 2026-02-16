# トラマッチ - 求荷求車マッチングプラットフォーム

## Overview
トラマッチは荷主と運送会社をつなぐ求荷求車（きゅうかきゅうしゃ）マッチングプラットフォームです。
荷物を運びたい荷主と、空車を持つ運送会社を効率よくマッチングします。

## Tech Stack
- **Frontend**: React + TypeScript + Vite, TailwindCSS, shadcn/ui, wouter, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Design**: Turquoise/teal color theme with white background

## Project Structure
- `client/src/pages/` - Page components (home, cargo-list, truck-list, cargo-detail, truck-detail, cargo-form, truck-form)
- `client/src/components/` - Shared components (header, footer)
- `server/` - Express API routes, database connection, storage layer, seed data
- `shared/schema.ts` - Drizzle schema definitions (users, cargoListings, truckListings)

## Key Features (MVP)
1. Landing page with hero section showing cargo/truck stats
2. Cargo listings - search, filter, view details, post new cargo
3. Truck listings - search, filter, view details, post new truck
4. PostgreSQL database with seed data (5 cargo + 5 truck listings)

## API Endpoints
- `GET /api/cargo` - List all cargo listings
- `GET /api/cargo/:id` - Get cargo listing detail
- `POST /api/cargo` - Create cargo listing
- `GET /api/trucks` - List all truck listings
- `GET /api/trucks/:id` - Get truck listing detail
- `POST /api/trucks` - Create truck listing

## Running
- `npm run dev` starts Express server (backend + Vite frontend) on port 5000
- `npm run db:push` pushes schema to database
