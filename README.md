# Locksmith

Locksmith is a Next.js starter template that comes with a bulletproof and production-grade auth setup out of the box. [Live Demo](https://locksmith-nextjs.vercel.app/).

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

## Development Guide

This guide will walk you through setting up the Locksmith starter template for both local development and production deployment.

### Prerequisites

- Node.js 24+ (specified in `package.json`)
- pnpm 10.26.0+ (package manager)
- Docker and Docker Compose (for local database)
- Git (for version control)

### 1. Setting Up Environment Variables

Create a `.env.local` file in the root directory with the following variables:

#### Required for All Environments

```bash
# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000  # Local dev
# NEXT_PUBLIC_APP_URL=https://your-domain.com  # Production

# Better Auth URL (fallback if NEXT_PUBLIC_APP_URL is not set)
BETTER_AUTH_URL=http://localhost:3000  # Local dev
# BETTER_AUTH_URL=https://your-domain.com  # Production

# Node Environment
NODE_ENV=development  # or "production" for prod
```

#### Database Configuration

```bash
# For local development with Docker
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/postgres

# For production (Neon or other PostgreSQL)
# Use pooled connection for application (recommended for serverless)
DATABASE_URL=postgresql://user:password@host.neon.tech/dbname?sslmode=require

# Optional: Direct connection for migrations (bypasses connection pool)
# Required for GitHub Actions migrations
DATABASE_URL_DIRECT=postgresql://user:password@host.neon.tech/dbname?sslmode=require
```

**Note:** For Neon, use the pooled connection string for `DATABASE_URL` (includes `-pooler` in the hostname) and the direct connection for `DATABASE_URL_DIRECT`. For regular PostgreSQL, you can use the same connection string for both.

#### OAuth Providers (Optional - only if using social auth)

```bash
# GitHub OAuth
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Microsoft OAuth
MICROSOFT_CLIENT_ID=your_microsoft_client_id
MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret
```

#### Email Service (Resend)

```bash
# Resend API Key
RESEND_API_KEY=re_your_resend_api_key

# Default sender email (must be verified in Resend)
RESEND_DEFAULT_FROM=noreply@yourdomain.com  # Production
# RESEND_DEFAULT_FROM=onboarding@resend.dev  # Development (Resend test domain)
```

**Development Note:** In development mode, emails are automatically routed to Resend's test addresses (`delivered@resend.dev`, `bounced@resend.dev`, `complained@resend.dev`) with a label prefix to track the original recipient. The subject line is also prefixed with `[DEV]`.

#### Vercel Blob Storage (for avatar uploads)

```bash
# Vercel Blob Read/Write Token
VERCEL_BLOB_READ_WRITE_TOKEN=vercel_blob_xxxxx

# Vercel Blob Domain
VERCEL_BLOB_DOMAIN=https://xxxxx.public.blob.vercel-storage.com
```

#### Optional

```bash
# Base path for subdirectory deployments (optional)
NEXT_PUBLIC_BASE_PATH=
```

### 2. Setting Up a Database

#### Option A: Local Development with Docker

1. Start the local PostgreSQL database:
   ```bash
   pnpm start-local-db
   ```

2. The database will be available at `postgresql://postgres:postgres@localhost:5432/postgres`

3. Run migrations:
   ```bash
   pnpm db:migrate
   ```

4. To stop the database:
   ```bash
   pnpm stop-local-db
   ```

5. To completely remove the database and volumes:
   ```bash
   pnpm nuke-local-db
   ```

#### Option B: Neon (Recommended for Production)

1. Create a [Neon](https://neon.tech) account and create a new project
2. Copy the connection strings:
   - **Pooled connection** (for `DATABASE_URL`): Use the connection string with `-pooler` in the hostname
   - **Direct connection** (for `DATABASE_URL_DIRECT`): Use the connection string without `-pooler`
3. Add both connection strings to your environment variables
4. Run migrations:
   ```bash
   pnpm db:migrate
   ```

#### Option C: Regular PostgreSQL

1. Set up a PostgreSQL database (self-hosted, AWS RDS, etc.)
2. Use the same connection string for both `DATABASE_URL` and `DATABASE_URL_DIRECT`
3. Run migrations:
   ```bash
   pnpm db:migrate
   ```

**Important Notes:**
- The application uses connection pooling optimized for serverless environments
- For migrations, use `DATABASE_URL_DIRECT` (or `DATABASE_URL` if you don't have a direct connection)
- The codebase automatically handles connection lifecycle for Vercel Fluid compute in production

### 3. Configuring OAuth Providers

#### GitHub OAuth

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Your app name
   - **Homepage URL**: `http://localhost:3000` (dev) or your production URL
   - **Authorization callback URL**: `http://localhost:3000/api/auth/callback/github` (dev) or `https://your-domain.com/api/auth/callback/github` (prod)
4. Copy the **Client ID** and **Client Secret** to your `.env.local`

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Choose "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:3000/api/auth/callback/google` (dev)
   - `https://your-domain.com/api/auth/callback/google` (prod)
7. Copy the **Client ID** and **Client Secret** to your `.env.local`

#### Microsoft OAuth

1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Fill in:
   - **Name**: Your app name
   - **Redirect URI**: `http://localhost:3000/api/auth/callback/microsoft` (dev) or `https://your-domain.com/api/auth/callback/microsoft` (prod)
5. After creation, go to "Certificates & secrets" → "New client secret"
6. Copy the **Application (client) ID** and **Client secret** to your `.env.local`

**Note:** OAuth providers are optional. If you don't configure them, users can still sign up and sign in with email/password.

### 4. Configuring Resend

1. Create a [Resend](https://resend.com) account
2. Go to API Keys and create a new API key
3. Copy the API key to `RESEND_API_KEY` in your `.env.local`
4. For production:
   - Add and verify your domain in Resend
   - Update `RESEND_DEFAULT_FROM` to use your verified domain (e.g., `noreply@yourdomain.com`)
5. For development:
   - You can use `onboarding@resend.dev` as the default sender (no verification needed)
   - Emails will automatically be routed to test addresses in development mode

**Development Behavior:**
- All emails in development are sent to Resend test addresses with labels
- Email subjects are prefixed with `[DEV]`
- This prevents accidental emails to real users during development

### 5. Configuring Vercel Blob

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Navigate to your project → Settings → Storage
3. Create a new Blob Store (or use an existing one)
4. Copy the following values:
   - **Read/Write Token**: Add to `VERCEL_BLOB_READ_WRITE_TOKEN`
   - **Domain**: Add to `VERCEL_BLOB_DOMAIN` (format: `https://xxxxx.public.blob.vercel-storage.com`)

**Note:** Vercel Blob is used for storing user avatar images. Images are automatically compressed, resized to 512x512, and converted to WebP format before upload.

### 6. Configuring Vercel for Production

1. **Connect Your Repository:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New" → "Project"
   - Import your GitHub repository

2. **Configure Environment Variables:**
   - In your Vercel project settings, go to "Environment Variables"
   - Add all the environment variables from your `.env.local`:
     - `DATABASE_URL` (use pooled connection for Neon)
     - `DATABASE_URL_DIRECT` (use direct connection for migrations)
     - `NEXT_PUBLIC_APP_URL` (your production URL)
     - `BETTER_AUTH_URL` (your production URL)
     - `NODE_ENV=production`
     - All OAuth provider credentials (if using)
     - `RESEND_API_KEY`
     - `RESEND_DEFAULT_FROM`
     - `VERCEL_BLOB_READ_WRITE_TOKEN`
     - `VERCEL_BLOB_DOMAIN`

3. **Configure Build Settings:**
   - Framework Preset: Next.js
   - Build Command: `pnpm build`
   - Install Command: `pnpm install`
   - Output Directory: `.next` (default)

4. **Deploy:**
   - Vercel will automatically deploy on pushes to your main branch
   - Or manually trigger a deployment from the dashboard

**Note:** The `vercel.json` file disables automatic deployments from Git. You can enable it by removing the `git.deploymentEnabled: false` setting or setting it to `true`.

### 7. Configuring GitHub Actions (Optional)

The repository includes a GitHub Actions workflow (`.github/workflows/deploy.yml`) that automatically runs database migrations and deploys to Vercel on pushes to the `main` branch.

To set it up:

1. **Add GitHub Secrets:**
   - Go to your repository → Settings → Secrets and variables → Actions
   - Add the following secrets:
     - `DATABASE_URL_DIRECT`: Direct database connection (for migrations)
     - `VERCEL_GITHUB_ACTIONS_TOKEN`: Vercel token for GitHub Actions
     - `VERCEL_SCOPE`: Your Vercel team/account scope

2. **Get Vercel Token:**
   - Go to [Vercel Account Settings](https://vercel.com/account/tokens)
   - Create a new token with appropriate permissions
   - Copy it to the `VERCEL_GITHUB_ACTIONS_TOKEN` secret

3. **Get Vercel Scope:**
   - Your Vercel username or team name
   - Can be found in your Vercel dashboard URL or account settings

4. **Configure GitHub Environment:**
   - The workflow uses a GitHub Environment called "Production"
   - Go to Settings → Environments → New environment → Name it "Production"
   - Add the same secrets there if you want environment-specific configuration

**Workflow Behavior:**
- Runs on every push to `main` branch
- Installs dependencies
- Runs database migrations using `DATABASE_URL_DIRECT`
- Deploys to Vercel production

### 8. Running the Application

#### Local Development

1. Install dependencies:
   ```bash
   pnpm install
   ```

2. Start the local database (if using Docker):
   ```bash
   pnpm start-local-db
   ```

3. Run migrations:
   ```bash
   pnpm db:migrate
   ```

4. Start the development server:
   ```bash
   pnpm dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

#### Production

The application will automatically deploy to Vercel when you push to the main branch (if GitHub Actions is configured) or you can manually deploy from the Vercel dashboard.

### 9. Database Management

#### Generate Migrations

After modifying the database schema in `db/schema/`:

```bash
pnpm db:generate
```

This creates migration files in `db/migrations/`.

#### Run Migrations

```bash
pnpm db:migrate
```

#### Push Schema Changes (Development Only)

For rapid development, you can push schema changes directly without migrations:

```bash
pnpm db:push
```

**Warning:** Only use `db:push` in development. Always use migrations in production.

#### Check Migration Status

```bash
pnpm db:check
```

### 10. Environment-Specific Notes

#### Local Development

- Database: Use Docker Compose PostgreSQL or local PostgreSQL instance
- Emails: Automatically routed to Resend test addresses
- OAuth: Use `http://localhost:3000` as callback URLs
- Vercel Blob: Works with Vercel Blob storage (requires internet connection)

#### Production

- Database: Use Neon pooled connection for `DATABASE_URL`, direct for `DATABASE_URL_DIRECT`
- Emails: Sent to real recipients via Resend
- OAuth: Use your production domain for callback URLs
- Vercel Blob: Configured via Vercel dashboard environment variables
- Connection Pooling: Automatically handled by Vercel Fluid compute

### Troubleshooting

#### Database Connection Issues

- **Local:** Ensure Docker container is running (`pnpm start-local-db`)
- **Neon:** Verify connection strings are correct and database is accessible
- **Migrations:** Use `DATABASE_URL_DIRECT` for migrations (bypasses connection pool)

#### OAuth Not Working

- Verify callback URLs match exactly (including protocol and trailing slashes)
- Check that client IDs and secrets are correct
- Ensure OAuth apps are configured with the correct redirect URIs

#### Email Not Sending

- Check `RESEND_API_KEY` is valid
- Verify `RESEND_DEFAULT_FROM` is a verified domain (production) or uses `@resend.dev` (development)
- In development, check Resend dashboard for test emails

#### Vercel Blob Issues

- Verify `VERCEL_BLOB_READ_WRITE_TOKEN` has correct permissions
- Check `VERCEL_BLOB_DOMAIN` format is correct
- Ensure blob store is created in Vercel dashboard

### Next Steps

- Customize the authentication flow in `lib/auth.ts`
- Modify email templates in `components/emails/`
- Update the database schema in `db/schema/`
- Customize UI components in `components/`
- Add your own features and functionality
