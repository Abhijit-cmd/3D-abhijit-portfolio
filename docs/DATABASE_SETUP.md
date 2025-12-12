# PostgreSQL Database Setup Guide

This guide will help you set up PostgreSQL for the video storage system.

## Prerequisites

- PostgreSQL 14 or higher installed on your system
- Node.js and npm installed

## Installation

### Windows

1. Download PostgreSQL from [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer and follow the setup wizard
3. Remember the password you set for the `postgres` user
4. Default port is `5432`

### macOS

Using Homebrew:
```bash
brew install postgresql@14
brew services start postgresql@14
```

### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Database Setup

### 1. Create the databases

Connect to PostgreSQL:
```bash
# Windows (using psql from the PostgreSQL installation)
psql -U postgres

# macOS/Linux
sudo -u postgres psql
```

Create the databases:
```sql
-- Create production database
CREATE DATABASE portfolio_videos;

-- Create test database
CREATE DATABASE portfolio_videos_test;

-- Exit psql
\q
```

### 2. Configure Environment Variables

Copy the `.env.example` file to `.env`:
```bash
cp .env.example .env
```

Update the `.env` file with your PostgreSQL credentials:
```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_videos?schema=public"
DATABASE_URL_TEST="postgresql://postgres:YOUR_PASSWORD@localhost:5432/portfolio_videos_test?schema=public"
```

Replace `YOUR_PASSWORD` with your PostgreSQL password.

### 3. Run Migrations

Apply the database schema:
```bash
npx prisma migrate dev
```

This will:
- Create the `videos` table with all required columns
- Set up indexes for optimal query performance
- Generate the Prisma Client for type-safe database access

### 4. Verify Setup

Check that the migration was successful:
```bash
npx prisma studio
```

This will open Prisma Studio in your browser where you can view and manage your database.

## Connection String Format

The PostgreSQL connection string format is:
```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?schema=SCHEMA
```

- **USER**: Database user (default: `postgres`)
- **PASSWORD**: User password
- **HOST**: Database host (default: `localhost`)
- **PORT**: Database port (default: `5432`)
- **DATABASE**: Database name
- **SCHEMA**: Schema name (default: `public`)

## Troubleshooting

### Authentication Failed

If you get an authentication error:
1. Verify your password is correct in the `.env` file
2. Check that PostgreSQL is running:
   - Windows: Check Services for "postgresql-x64-14"
   - macOS: `brew services list`
   - Linux: `sudo systemctl status postgresql`

### Connection Refused

If you get a connection refused error:
1. Ensure PostgreSQL is running (see above)
2. Check that the port (5432) is correct
3. Verify PostgreSQL is listening on localhost:
   ```bash
   # Check PostgreSQL configuration
   psql -U postgres -c "SHOW listen_addresses;"
   ```

### Database Does Not Exist

If the database doesn't exist:
1. Connect to PostgreSQL and create it manually (see step 1 above)
2. Or use the Prisma CLI:
   ```bash
   npx prisma db push
   ```

## Production Deployment

For production environments:

1. Use a managed PostgreSQL service (e.g., AWS RDS, Heroku Postgres, Supabase)
2. Enable SSL connections:
   ```env
   DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"
   ```
3. Use connection pooling for better performance
4. Set appropriate connection pool size in `prisma.config.ts`

## Next Steps

After setting up the database:
1. Run the data migration script to import existing videos from JSON
2. Update the VideoService to use the new PostgreSQL repository
3. Run tests to verify everything works correctly

See the main README for more information on the migration process.
