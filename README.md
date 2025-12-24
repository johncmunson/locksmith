# Locksmith

Locksmith is a Next.js starter template that comes with a bulletproof and production-grade auth setup out of the box.

![Locksmith](./public/locksmith.png)

## Features

### Authentication

- **Email/Password Authentication** - Traditional email and password sign-up and sign-in with secure password hashing
- **Social OAuth Providers** - Sign in with Google, GitHub, or Microsoft accounts
- **Account Linking** - Link multiple authentication methods to a single account (same-email only for security)
- **Email Verification** - Optional email verification with customizable verification flow
- **Password Reset** - Secure password reset flow with email-based token verification
- **Remember Me** - Session persistence option for user convenience
- **Auto Sign-In** - Automatic sign-in after registration and email verification
- **Session Management** - Cookie-based sessions with intelligent caching for performance

### User Profile & Settings

- **Display Name Management** - Update and manage your display name
- **Avatar Management** - Multiple avatar options:
  - Upload custom images with automatic compression and optimization
  - Use profile images from linked social accounts (Google, GitHub, Microsoft)
  - Set custom initials (2 characters)
- **Image Processing** - Automatic image compression, resizing (512x512), and format conversion (WebP)
- **Sign-In Methods Management** - Connect or disconnect authentication providers:
  - Set or change email/password credentials
  - Link/unlink social accounts
  - View last used date for each method
  - Re-authenticate with providers
- **Active Sessions Management** - Comprehensive session control:
  - View all active sessions across devices
  - Device detection (desktop, tablet, mobile) with OS and browser identification
  - Session metadata (IP address, creation date, last active, expiration)
  - Revoke individual sessions
  - Sign out from all other devices
  - Sign out from all devices
- **Account Deletion** - Secure account deletion with confirmation dialog

### Email Services

- **Welcome Emails** - Automated welcome emails for new users
- **Email Verification** - Beautiful verification email templates
- **Password Reset Emails** - Professional password reset email templates
- **Resend Integration** - Production-ready email delivery via Resend
- **Development Mode** - Test email addresses for development (delivered, bounced, complained)
- **React Email Templates** - Modern, responsive email templates built with React Email

### Database & Storage

- **PostgreSQL Database** - Production-ready PostgreSQL setup with Drizzle ORM
- **Database Migrations** - Drizzle Kit migrations for schema management
- **Connection Pooling** - Optimized connection pooling for serverless environments (Vercel Fluid)
- **Docker Setup** - Local PostgreSQL database via Docker Compose
- **Database Scripts** - Utility scripts for database management (truncate, migrations)
- **Vercel Blob Storage** - Cloud storage for user avatars with automatic cleanup

### UI Components & Design

- **shadcn/ui Components** - Pre-configured shadcn/ui component library
- **Tailwind CSS v4** - Modern utility-first CSS framework
- **Dark Mode Support** - Built-in dark mode with CSS variables
- **Toast Notifications** - Beautiful toast notifications via Sonner
- **Responsive Design** - Mobile-first, fully responsive layouts
- **Accessible Components** - WCAG-compliant components with proper ARIA attributes

### Developer Experience

- **TypeScript** - Full TypeScript support with strict type checking
- **Next.js 16** - Latest Next.js with App Router and Turbopack
- **Better-Auth** - Modern authentication library with excellent DX
- **Code Quality** - ESLint and Prettier configured
- **Database Tools** - Drizzle Kit for migrations and schema management
- **Environment Configuration** - Centralized environment variable management
- **Type Safety** - End-to-end type safety from database to UI

### Production Ready

- **Serverless Optimized** - Optimized for Vercel and serverless deployments
- **Error Handling** - Comprehensive error handling and user feedback
- **Security Best Practices** - Secure authentication flows, password hashing, and session management
- **Performance** - Session caching, image optimization, and efficient database queries
- **Scalability** - Connection pooling and efficient resource management
