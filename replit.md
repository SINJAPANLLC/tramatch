# トラマッチ - 求荷求車マッチングプラットフォーム

## Overview
トラマッチは荷主と運送会社をつなぐ求荷求車（きゅうかきゅうしゃ）マッチングプラットフォームです。
荷物を運びたい荷主と、空車を持つ運送会社を効率よくマッチングします。

## Tech Stack
- **Frontend**: React + TypeScript + Vite, TailwindCSS, shadcn/ui, wouter, TanStack Query
- **Backend**: Express.js + TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Auth**: bcrypt password hashing, express-session with connect-pg-simple
- **File Upload**: multer (permit file upload: PDF/JPG/PNG, max 10MB)
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
- Admin approval workflow: new registrations require admin approval before login
- `approved` field in users table (boolean, default false, admin users auto-approved)
- Admin accounts: admin@tramatch.jp / admin123, info@sinjapan.jp / Kazuya8008

## UI Layout (Finalized)
- **Dashboard**: Fixed header + fixed left sidebar, only main content scrolls
- **Header**: Cargo/truck counts, notification bell with red dot, username, logout button
- **Footer**: Hidden on /home page, shown on other pages
- **Sidebar (User Menu - 12 items)**:
  - AI荷物検索, AI荷物登録, 登録した荷物, 成約した荷物
  - AI空車検索, AI空車登録
  - 企業検索, 取引先管理, 実運送体制管理簿
  - お支払い, 便利サービス, 設定
- **Sidebar (Admin Menu - 7 items, separated by divider line + label)**:
  - 管理画面, 申請管理, ユーザー管理, 収益管理, 通知管理, SEO記事生成, 管理設定

## API Endpoints
- `POST /api/register` - Register new user (with permit file upload)
- `POST /api/login` - Login (checks approved status)
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
- `PATCH /api/admin/users/:id/approve` - Approve user (admin only)

## Running
- `npm run dev` starts Express server (backend + Vite frontend) on port 5000
- `npm run db:push` pushes schema to database
