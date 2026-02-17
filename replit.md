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
  - `cargo-list.tsx`, `truck-list.tsx` - Public listing pages (with sidebar when authenticated)
  - `cargo-detail.tsx`, `truck-detail.tsx` - Detail pages
  - `cargo-form.tsx`, `truck-form.tsx` - Create listing forms (auth required)
  - `my-cargo.tsx` - 登録した荷物 page
  - `completed-cargo.tsx` - 成約した荷物 page
  - `cancelled-cargo.tsx` - 成約しなかった荷物 page
  - `my-trucks.tsx` - 登録した車両 page
  - `completed-trucks.tsx` - 成約した車両 page
  - `cancelled-trucks.tsx` - 成約しなかった車両 page
  - `companies.tsx` - 企業検索 page
  - `partners.tsx` - 取引先管理 page
  - `transport-ledger.tsx` - 実運送体制管理簿 page
  - `payment.tsx` - お支払い page
  - `services.tsx` - 便利サービス page
  - `user-settings.tsx` - 設定 page
  - `admin-dashboard.tsx` - 管理画面 (admin dashboard)
  - `admin-applications.tsx` - 申請管理 (admin)
  - `admin-users.tsx` - ユーザー管理 (admin)
  - `admin-revenue.tsx` - 収益管理 (admin)
  - `admin-notifications.tsx` - 通知管理 (admin)
  - `admin-announcements.tsx` - お知らせ管理 (admin)
  - `admin-seo.tsx` - SEO記事生成 (admin)
  - `admin-settings.tsx` - 管理設定 (admin)
- `client/src/components/` - Shared components (header, footer, dashboard-layout)
  - `dashboard-layout.tsx` - Shared sidebar + content layout for all authenticated pages
- `client/src/hooks/use-auth.ts` - Authentication hook
- `server/` - Express API routes, database connection, storage layer, seed data
- `shared/schema.ts` - Drizzle schema definitions (users, cargoListings, truckListings)

## Page Structure
- `/` - LP (Landing Page) - public
- `/login` - ログイン
- `/register` - 新規登録
- `/home` - ホーム (dashboard, requires login)
- `/cargo` - AI荷物検索 / 荷物一覧 (public, sidebar when authenticated)
- `/cargo/:id` - 荷物詳細 (public)
- `/cargo/new` - AI荷物登録 (requires login)
- `/trucks` - AI空車検索 / 車両一覧 (public, sidebar when authenticated)
- `/trucks/:id` - 車両詳細 (public)
- `/trucks/new` - AI空車登録 (requires login)
- `/my-cargo` - 登録した荷物 (requires login)
- `/completed-cargo` - 成約した荷物 (requires login)
- `/cancelled-cargo` - 成約しなかった荷物 (requires login)
- `/my-trucks` - 登録した車両 (requires login)
- `/completed-trucks` - 成約した車両 (requires login)
- `/cancelled-trucks` - 成約しなかった車両 (requires login)
- `/companies` - 企業検索 (requires login)
- `/partners` - 取引先管理 (requires login)
- `/transport-ledger` - 実運送体制管理簿 (requires login)
- `/payment` - お支払い (requires login)
- `/services` - 便利サービス (requires login)
- `/settings` - 設定 (requires login)
- `/admin` - 管理画面 (requires admin role)
- `/admin/applications` - 申請管理 (requires admin role)
- `/admin/users` - ユーザー管理 (requires admin role)
- `/admin/revenue` - 収益管理 (requires admin role)
- `/admin/notifications` - 通知管理 (requires admin role)
- `/admin/announcements` - お知らせ管理 (requires admin role)
- `/admin/seo` - SEO記事生成 (requires admin role)
- `/admin/settings` - 管理設定 (requires admin role)
- `/guide` - ご利用ガイド (public)
- `/faq` - よくある質問 (public)
- `/contact` - お問い合わせ (public)
- `/company-info` - 会社情報 (public)
- `/terms` - 利用規約 (public)
- `/privacy` - プライバシーポリシー (public)

## Auth
- Session-based authentication with PostgreSQL session store
- Password hashing with bcrypt
- Roles: "user" (default), "admin"
- Admin approval workflow: new registrations require admin approval before login
- `approved` field in users table (boolean, default false, admin users auto-approved)
- Admin accounts: admin@tramatch.jp / admin123, info@sinjapan.jp / Kazuya8008

## UI Layout (Finalized)
- **Dashboard**: Fixed header + fixed left sidebar, only main content scrolls
- **Header**: Cargo/truck counts, notification bell with turquoise dot (unread indicator), notification dropdown, username, logout button
- **Footer**: Hidden on all dashboard pages, shown on public pages
- **DashboardLayout**: Shared component wrapping all authenticated pages with sidebar
- **Sidebar (User Menu - 16 items)**:
  - AI荷物検索, AI荷物登録, 登録した荷物, 成約した荷物, 成約しなかった荷物
  - AI空車検索, AI空車登録, 登録した車両, 成約した車両, 成約しなかった車両
  - 企業検索, 取引先管理, 実運送体制管理簿
  - お支払い, 便利サービス, 設定
- **Sidebar (Admin Menu - 8 items, separated by divider line + label)**:
  - 管理画面, 申請管理, ユーザー管理, 収益管理, 通知管理, お知らせ, SEO記事生成, 管理設定

## API Endpoints
- `POST /api/register` - Register new user (with permit file upload)
- `POST /api/login` - Login (checks approved status)
- `POST /api/logout` - Logout
- `GET /api/user` - Get current user
- `PATCH /api/user/profile` - Update user profile (auth required)
- `PATCH /api/user/password` - Change password (auth required)
- `GET /api/cargo` - List all cargo listings
- `GET /api/cargo/:id` - Get cargo listing detail
- `POST /api/cargo` - Create cargo listing (auth required)
- `PATCH /api/cargo/:id/status` - Update cargo status (auth required, owner only)
- `DELETE /api/cargo/:id` - Delete cargo listing (auth required)
- `GET /api/trucks` - List all truck listings
- `GET /api/trucks/:id` - Get truck listing detail
- `POST /api/trucks` - Create truck listing (auth required)
- `PATCH /api/trucks/:id/status` - Update truck status (auth required, owner only)
- `DELETE /api/trucks/:id` - Delete truck listing (auth required)
- `GET /api/admin/stats` - Admin stats (admin only)
- `GET /api/admin/users` - List users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `PATCH /api/admin/users/:id/approve` - Approve user (admin only)
- `GET /api/notifications` - Get user notifications (auth required)
- `GET /api/notifications/unread-count` - Get unread notification count (auth required)
- `PATCH /api/notifications/:id/read` - Mark notification as read (auth required)
- `PATCH /api/notifications/read-all` - Mark all notifications as read (auth required)
- `DELETE /api/notifications/:id` - Delete notification (auth required)
- `GET /api/announcements` - Get published announcements (public)
- `GET /api/admin/announcements` - Get all announcements (admin only)
- `POST /api/admin/announcements` - Create announcement (admin only)
- `PATCH /api/admin/announcements/:id` - Update announcement (admin only)
- `DELETE /api/admin/announcements/:id` - Delete announcement (admin only)

## Notification System
- Notifications table: id, userId, type, title, message, relatedId, isRead, createdAt
- Auto-generated on: user registration (to admins), user approval (to user), cargo creation (to all users), truck creation (to all users)
- Types: cargo_new, truck_new, user_approved, user_registered
- Header dropdown with turquoise unread dot, mark read, mark all read, delete
- Auto-refresh: notifications every 30s, unread count every 15s

## Running
- `npm run dev` starts Express server (backend + Vite frontend) on port 5000
- `npm run db:push` pushes schema to database
