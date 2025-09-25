# PostgreSQL Setup Guide

## Option 1: Local PostgreSQL Installation (Windows)

1. **Download PostgreSQL**:
   - Go to https://www.postgresql.org/download/windows/
   - Download the installer for Windows
   - Run the installer with default settings
   - Remember the password you set for the `postgres` user

2. **Create Database**:
   ```sql
   -- Open pgAdmin or psql and run:
   CREATE DATABASE invoice_generator;
   ```

3. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:your_password@localhost:5432/invoice_generator"
   ```

## Option 2: Using Supabase (Cloud - Free)

1. **Sign up at https://supabase.com**
2. **Create a new project**
3. **Go to Settings > Database**
4. **Copy the connection string**
5. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-REF].supabase.co:5432/postgres"
   ```

## Option 3: Using Railway (Cloud - Free)

1. **Sign up at https://railway.app**
2. **Create new project > Add PostgreSQL**
3. **Go to your PostgreSQL service > Connect tab**
4. **Copy the DATABASE_URL**
5. **Update .env file with the copied URL**

## Option 4: Using Neon (Cloud - Free)

1. **Sign up at https://neon.tech**
2. **Create a new project**
3. **Copy the connection string from dashboard**
4. **Update .env file with the connection string**

## Option 5: Docker (if you have Docker)

1. **Run PostgreSQL in Docker**:
   ```bash
   docker run --name postgres-invoice -e POSTGRES_PASSWORD=mypassword -e POSTGRES_DB=invoice_generator -p 5432:5432 -d postgres:15
   ```

2. **Update .env file**:
   ```env
   DATABASE_URL="postgresql://postgres:mypassword@localhost:5432/invoice_generator"
   ```

## After Setting Up PostgreSQL

Once you have PostgreSQL running and have updated your `.env` file:

1. **Push the database schema**:
   ```bash
   npx prisma db push
   ```

2. **Create your first user**:
   ```bash
   node create-user.mjs admin yourpassword
   ```

3. **Start the application**:
   ```bash
   npm run dev
   ```

Choose the option that works best for your setup!