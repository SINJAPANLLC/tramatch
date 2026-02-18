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
  - `admin-contact-inquiries.tsx` - お問い合わせ管理 (admin)
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
- `/forgot-password` - パスワードリセット申請 (public)
- `/reset-password?token=xxx` - パスワード再設定 (public)
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
- `/admin/notifications` - 通知管理 (requires admin role) - 3 category tabs (auto_reply, auto_notification, regular) + bulk send tab
- `/admin/announcements` - お知らせ管理 (requires admin role)
- `/admin/seo` - SEO記事生成 (requires admin role)
- `/admin/listings` - 掲載管理 (requires admin role) - edit/delete cargo and truck listings
- `/admin/contact-inquiries` - お問い合わせ管理 (requires admin role) - view/manage contact inquiries
- `/admin/audit-logs` - 操作ログ (requires admin role) - view admin action audit trail
- `/admin/settings` - 管理設定 (requires admin role)
- `/columns` - コラム記事一覧 (public)
- `/columns/:slug` - コラム記事詳細 (public)
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
- **Sidebar (User Menu - 13 items)**:
  - AI荷物検索, AI荷物登録, 登録した荷物, 成約した荷物, 成約しなかった荷物
  - AI空車検索, AI空車登録
  - 企業検索, 取引先管理, 実運送体制管理簿
  - お支払い, 便利サービス, 設定
- **Sidebar (Admin Menu - 10 items, separated by divider line + label)**:
  - 管理画面, 申請管理, ユーザー管理, 収益管理, 通知管理, お知らせ, SEO記事生成, 掲載管理, 操作ログ, 管理設定

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
- `DELETE /api/cargo/:id` - Delete cargo listing (auth required)
- `GET /api/trucks` - List all truck listings
- `GET /api/trucks/:id` - Get truck listing detail
- `POST /api/trucks` - Create truck listing (auth required)
- `PATCH /api/trucks/:id` - Update truck listing (auth required, owner only)
- `DELETE /api/trucks/:id` - Delete truck listing (auth required)
- `POST /api/partners/invite` - Send partner invitation email (auth required)
- `GET /api/transport-records/export` - Export transport records as Excel (auth required)
- `GET /api/admin/stats` - Admin stats (admin only)
- `GET /api/admin/users` - List users (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)
- `PATCH /api/admin/users/:id/approve` - Approve user (admin only)
- `PATCH /api/admin/cargo/:id` - Admin edit cargo listing (admin only, audit logged)
- `DELETE /api/admin/cargo/:id` - Admin delete cargo listing (admin only, audit logged)
- `PATCH /api/admin/trucks/:id` - Admin edit truck listing (admin only, audit logged)
- `DELETE /api/admin/trucks/:id` - Admin delete truck listing (admin only, audit logged)
- `POST /api/contact` - Submit contact inquiry (public)
- `GET /api/admin/contact-inquiries` - Get all contact inquiries (admin only)
- `GET /api/admin/contact-inquiries/unread-count` - Get unread count (admin only)
- `PATCH /api/admin/contact-inquiries/:id` - Update inquiry status/note (admin only)
- `DELETE /api/admin/contact-inquiries/:id` - Delete inquiry (admin only)
- `GET /api/admin/audit-logs` - Get paginated audit logs (admin only)
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

## Dispatch Request (配車依頼書) System
- dispatch_requests table stores dispatch request forms for completed cargo deals
- Fields: operation info (transport/shipper company, loading/unloading), cargo info, fare info, transaction parties, vehicle/driver
- Status: "draft" (editable) or "sent" (submitted)
- Auto-prefills from cargo listing data
- Can be saved as draft, edited, and sent
- Print functionality generates formatted HTML print view
- API: GET /api/dispatch-requests/:cargoId, POST /api/dispatch-requests, PATCH /api/dispatch-requests/:id, PATCH /api/dispatch-requests/:id/send

## Notification System (Multi-Channel)
- **3 Channels**: system (in-app bell), email (nodemailer SMTP), LINE (LINE Messaging API)
- **Notification Templates**: notification_templates table with channel field (system/email/line), category (auto_reply/auto_notification/regular), subject (optional, required for email), body, triggerEvent, isActive
- **User Preferences**: notifySystem, notifyEmail, notifyLine boolean fields on users table; lineUserId for LINE integration
- **notification-service.ts**: sendEmail(), sendLineMessage(), isEmailConfigured(), isLineConfigured(), replaceTemplateVariables()
- **Admin Notifications Page** (/admin/notifications): 4 tabs - システム通知, メール通知, LINE通知, 一括送信
  - Each channel tab: template CRUD, AI generation (channel-aware), category filter, preview/edit/toggle/delete
  - Bulk send tab: multi-channel selection, target filter, channel config status display
- **User Settings** (/settings → 通知設定 tab): toggle system/email/LINE notifications, LINE User ID input
- **API Endpoints**:
  - GET /api/admin/notification-channels/status - Channel configuration status
  - POST /api/admin/notification-channels/test - Test send to specific channel
  - POST /api/admin/notifications/send - Multi-channel bulk send (respects user preferences)
  - GET /api/admin/notification-templates?channel=&category= - Filter by channel and/or category
  - POST /api/admin/notification-templates/generate - AI generate (channel-aware)
- **Env vars needed**: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS, SMTP_FROM (email), LINE_CHANNEL_ACCESS_TOKEN (LINE)
- Auto-generated notifications: user registration (to admins), user approval (to user), cargo/truck creation (to all users)
- Header dropdown with turquoise unread dot, mark read, mark all read, delete
- Auto-refresh: notifications every 30s, unread count every 15s

## Square Payment Integration
- Square Web Payments SDK for card payments (sandbox/production)
- Backend: POST /api/payments/square (validates planType, server-side price lookup, creates pending payment, processes via Square API, updates status)
- GET /api/payments - Get payment history (auth required)
- Frontend env vars: VITE_SQUARE_APP_ID, VITE_SQUARE_LOCATION_ID, VITE_SQUARE_ENVIRONMENT
- Backend env vars: SQUARE_ACCESS_TOKEN, SQUARE_LOCATION_ID, SQUARE_ENVIRONMENT
- payments table: id, userId, amount, currency, squarePaymentId, status, description, createdAt

## SEO Column Article System
- Auto-generates daily SEO column articles about logistics/freight matching topics
- 30 pre-defined topics covering: 求荷求車, 空車活用, 物流DX, 2024年問題, 共同配送, etc.
- Auto-generation runs on server start (if no article today) and daily at 6:00 AM
- seo_articles table: id, topic, keywords, title, slug, metaDescription, content, status, autoGenerated, createdAt
- Admin can manually generate articles with keyword presets and auto-publish toggle
- Public pages: /columns (list), /columns/:slug (detail) with SEO meta tags
- Admin page: /admin/seo - stats cards, auto-generation info, manual generation, publish/unpublish toggle
- API: GET /api/columns, GET /api/columns/:slug (public), POST /api/admin/seo-articles/generate (admin)
- LP shows latest 3 column articles preview; footer links to /columns
- server/auto-article-generator.ts handles automated daily generation
- Sitemap: GET /sitemap.xml - dynamic sitemap with all public pages + published articles
- Robots: GET /robots.txt - allows public pages, blocks admin/authenticated pages, references sitemap
- Google Ping: auto-pings Google (google.com/ping?sitemap=...) when articles are published (auto or manual)

## Running
- `npm run dev` starts Express server (backend + Vite frontend) on port 5000
- `npm run db:push` pushes schema to database
