# トラマッチ - 求荷求車マッチングプラットフォーム

## Overview
トラマッチは、荷主と運送会社を効率的にマッチングさせる求荷求車プラットフォームです。このプロジェクトの目的は、物流業界における荷物の輸送と空車の有効活用を最適化し、サプライチェーン全体の効率化とコスト削減に貢献することです。AIを活用した高度なマッチング機能とユーザーフレンドリーなインターフェースを提供し、業界のDXを推進します。将来的に、全国規模での展開と、多様な運送ニーズに対応できるプラットフォームへの成長を目指しています。

## User Preferences
I prefer clear, concise language in all explanations.
I value an iterative development approach, with frequent communication and opportunities for feedback.
Before implementing any major changes or new features, please describe your proposed approach and await my approval.
Do not make changes to files related to authentication logic without explicit instruction.
Ensure all UI/UX changes align with the established design system (turquoise/teal theme, shadcn/ui).

## System Architecture
**Frontend**: The user interface is built with React, TypeScript, and Vite, leveraging TailwindCSS and shadcn/ui for a modern and responsive design. Navigation is managed by wouter, and data fetching is handled by TanStack Query for efficient state management. The UI adopts a fixed header and fixed left sidebar layout for authenticated dashboard pages, ensuring the main content area is the only scrollable section. Public pages have a footer, while dashboard pages do not.

**Backend**: The API is developed using Express.js and TypeScript, providing robust and scalable endpoints for all platform functionalities. It integrates with a PostgreSQL database via Drizzle ORM for data persistence.

**Authentication & Authorization**: A session-based authentication system is implemented, utilizing `express-session` with `connect-pg-simple` for PostgreSQL session storage. Passwords are securely hashed with bcrypt. The system supports two primary roles: "user" and "admin". New user registrations require admin approval before access, with admin users being auto-approved.

**Core Features**:
- **Listing Management**: Users can create, view, and manage cargo and truck listings.
- **Matching System**: Facilitates efficient matching between cargo and available trucks.
- **Dispatch Request System**: Allows users to generate, save, and send dispatch request forms for completed cargo deals, with auto-prefill capabilities and print functionality.
- **Notification System**: A multi-channel notification system supports in-app, email (Nodemailer), and LINE messages. It includes customizable templates, user preferences for notification channels, and an admin interface for managing templates and sending bulk notifications.
- **Admin Dashboard**: Comprehensive admin functionalities for user management, application approvals, revenue tracking, content management (SEO articles, announcements), and system settings.
- **SEO Column Article System**: An automated system generates daily SEO-optimized articles related to logistics and freight matching. Articles are stored in the database, publicly accessible, and integrated with sitemap and robots.txt for search engine visibility. It also includes Google Ping functionality for new article publications.
- **User Management**: Features for user registration, login, profile updates, and password management. Admin users can manage all user accounts.
- **Company and Partner Management**: Functionality for searching companies and managing business partners.
- **Transport Ledger**: Management system for transport records.
- **Payment Integration**: Secure payment processing with Square Web Payments SDK.
- **YouTube Video Integration**: Fetches videos from a YouTube channel via YouTube Data API v3 and displays them on the LP. Videos are cached in `youtube_videos` table. Requires `YOUTUBE_API_KEY` and `YOUTUBE_CHANNEL_ID` environment variables. Admin can trigger fetch via `/api/admin/youtube/fetch` and manage visibility.
- **YouTube Auto-Publish System**: Automated daily video generation pipeline: GPT-4o generates scripts on logistics topics → OpenAI TTS creates narration audio → ffmpeg produces video with branded slides → YouTube Data API uploads with SEO-optimized titles/descriptions containing TRA MATCH links. Tracked in `youtube_auto_publish_jobs` table. Requires `YOUTUBE_OAUTH_CLIENT_ID`, `YOUTUBE_OAUTH_CLIENT_SECRET`, `YOUTUBE_OAUTH_REFRESH_TOKEN`. Scheduled daily at 9:00 JST (3 videos/day). Admin UI at `/admin/youtube` (auto-generate tab).
- **Email Marketing & Lead Auto-Crawler**: Automated lead generation system. AI (GPT-4o-mini) generates search queries for logistics companies → crawls company websites → extracts email/FAX/phone → stores in `email_leads` table (deduplication by email). Daily schedule: crawl at 07:00 JST, auto-send at 10:00 JST (300 emails/day limit, 3-second interval). Customizable email template stored in admin settings. Manual campaign system in `email_campaigns` table for targeted sends. Admin UI at `/admin/email-marketing` with tabs: leads list, AI crawl, template settings, campaigns. Uses existing `sendEmail()` from notification-service.ts.

**File Management**: The system supports file uploads (PDF/JPG/PNG, max 10MB) via multer, primarily for registration documents.

**Design System**: The platform adheres to a consistent design theme featuring turquoise/teal colors on a white background, primarily using shadcn/ui components.

## External Dependencies
- **PostgreSQL**: Primary database for all application data, user sessions, and Drizzle ORM integration.
- **Square Web Payments SDK**: For processing card payments securely.
- **Nodemailer**: Used for sending email notifications.
- **LINE Messaging API**: For sending LINE messages as part of the multi-channel notification system.
- **bcrypt**: For secure password hashing.
- **multer**: For handling file uploads (PDF, JPG, PNG).
- **Vite**: Frontend build tool.
- **TailwindCSS**: Utility-first CSS framework.
- **shadcn/ui**: Component library for UI elements.
- **wouter**: Small routing library for React.
- **TanStack Query**: For data fetching, caching, and state management.