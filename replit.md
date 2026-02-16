# トラマッチ - 求荷求車マッチングプラットフォーム

## Overview
トラマッチは荷主と運送会社をつなぐ求荷求車（きゅうかきゅうしゃ）マッチングプラットフォームです。
荷物を運びたい荷主と、空車を持つ運送会社を効率よくマッチングします。

## Tech Stack
- **Frontend**: React + TypeScript + Vite, TailwindCSS, shadcn/ui, wouter, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, express-session with connect-pg-simple
- **Design**: Turquoise/teal color theme with white background

## Project Structure
- `client/src/pages/` - Page components
  - `home.tsx` - Landing page (LP) - public
  - `login.tsx` - Login page
  - `register.tsx` - Registration page
  - `dashboard.tsx` - Logged-in user dashboard (/home)
  - `admin.tsx` - Admin management page (/admin)
  - `cargo-list.tsx`, `truck-list.tsx` - Public listing pages
  - `cargo-detail.tsx`, `truck-detail.tsx` - Detail pages
  - `cargo-form.tsx`, `truck-form.tsx` - Create listing forms (auth required)
- `client/src/components/` - Shared components (header, footer)
- `client/src/hooks/use-auth.ts` - Authentication hook
- `server/` - Express API routes, database connection, storage layer, seed data
- `shared/schema.ts` - Drizzle schema definitions (users, cargoListings, truckListings)

## Page Structure
- `/` - LP (Landing Page) - public
- `/login` - ログイン
- `/register` - 新規登録
- `/home` - ホーム (dashboard, requires login)
- `/admin` - 管理画面 (requires admin role)
- `/cargo` - 荷物一覧 (public)
- `/cargo/:id` - 荷物詳細 (public)
- `/cargo/new` - 荷物掲載 (requires login)
- `/trucks` - 車両一覧 (public)
- `/trucks/:id` - 車両詳細 (public)
- `/trucks/new` - 車両掲載 (requires login)

## Auth
- Session-based authentication with PostgreSQL session store
- Password hashing with bcrypt
- Roles: "user" (default), "admin"
- Seeded admin: username=admin, password=admin123

## API Endpoints
- `POST /api/register` - Register new user
- `POST /api/login` - Login
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user
- `GET /api/cargo` - List all cargo listings
- `GET /api/cargo/:id` - Get cargo listing detail
- `POST /api/cargo` - Create cargo listing (auth required)
- `DELETE /api/cargo/:id` - Delete cargo listing (auth required)
- `GET /api/trucks` - List all truck listings
- `GET /api/trucks/:id` - Get truck listing detail
- `POST /api/trucks` - Create truck listing (auth required)
- `DELETE /api/trucks/:id` - Delete truck listing (auth required)
- `GET /api/admin/stats` - Admin stats (admin only)
- `GET /api/admin/users` - List users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

## Running
- `npm run dev` starts Express server (backend + Vite frontend) on port 5000
- `npm run db:push` pushes schema to database
