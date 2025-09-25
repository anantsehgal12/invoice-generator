# Invoice Generator Setup Instructions

## Authentication System Changes

This application now uses a simple username/password authentication system instead of Clerk. All users you create will have access to all companies in the system.

## Database Setup (PostgreSQL)

1. **Install and setup PostgreSQL** if you haven't already
2. **Create a database** called `invoice_generator`
3. **Copy environment variables**:
   ```bash
   cp .env.example .env
   ```

4. **Update your `.env` file** with your PostgreSQL connection string:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/invoice_generator"
   SESSION_SECRET="your-very-secure-session-secret-key-min-32-characters"
   ```

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Generate Prisma client**:
   ```bash
   npx prisma generate
   ```

3. **Run database migrations**:
   ```bash
   npx prisma db push
   ```

## Creating Your First User

You can create users in two ways:

### Option 1: Using the command line script
```bash
node create-user.mjs <username> <password>
```

Example:
```bash
node create-user.mjs admin mypassword123
```

### Option 2: Using the API endpoint
Make a POST request to `/api/users` with:
```json
{
  "username": "admin",
  "password": "mypassword123"
}
```

## Features Added

1. **Simple Authentication**: Username/password login system
2. **Proforma Invoice Support**: Added `InvoiceType` enum with `invoice` and `proforma` options
3. **Session Management**: Uses iron-session for secure cookie-based sessions
4. **User Management**: All users can see all companies and data
5. **PostgreSQL Database**: Migrated from SQLite to PostgreSQL

## File Structure

### Key Files for User Management:
- `create-user.mjs` - Script to create users from command line
- `src/app/api/users/route.ts` - API endpoint to create users
- `src/app/login/page.tsx` - Login page
- `src/lib/auth.ts` - Authentication utilities
- `prisma/schema.prisma` - Database schema with User model

## Running the Application

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Access the application**:
   - Open http://localhost:3000
   - You'll be redirected to `/login`
   - Use the username/password you created

## Database Schema Changes

- **Added User model** with username/password fields
- **Added InvoiceType enum** for proforma/invoice distinction
- **All models now have User relations** for proper data isolation
- **Migrated to PostgreSQL** from SQLite

## Security Notes

- Passwords are hashed using bcrypt with 12 salt rounds
- Sessions are encrypted using iron-session
- All routes except `/login` and auth APIs are protected by middleware
- Make sure to use a strong `SESSION_SECRET` in production