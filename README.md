# E-commerce Analytics Dashboard

A full-stack application for syncing and displaying Shopify product data with real-time analytics.

## Project Structure

- `frontend/` - React + TypeScript + Vite frontend application
- `backend/` - Express.js API server with PostgreSQL integration
- `etl/` - Python ETL script for syncing Shopify data

## Prerequisites

- Node.js (v22 or higher)
- Python 3.8+
- PostgreSQL database
- Shopify store with API access

## Setup Instructions

### 1. Database Setup

1. Create a PostgreSQL database named `ecommerce_analytics`
2. Run the setup script: `psql -d ecommerce_analytics -f etl/setup_db.sql`

### 2. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your database credentials
npm run dev
```

### 3. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 4. ETL Setup

```bash
cd etl
pip install requests psycopg2-binary python-dotenv
cp .env.example .env
# Edit .env with your Shopify and database credentials
python etl.py
```

## Environment Variables

### Backend (.env)
- `DB_NAME` - PostgreSQL database name
- `DB_USER` - Database username
- `DB_PASSWORD` - Database password
- `DB_HOST` - Database host
- `DB_PORT` - Database port
- `PORT` - API server port

### ETL (.env)
- `SHOPIFY_STORE_URL` - Your Shopify store URL
- `SHOPIFY_API_VERSION` - Shopify API version
- `SHOPIFY_ACCESS_TOKEN` - Shopify private app access token

## Features

- Real-time product data sync from Shopify
- Modern dashboard with product analytics
- PostgreSQL database for data persistence
- Responsive design with Tailwind CSS

## Tech Stack

- **Frontend**: React, TypeScript, Vite, Tailwind CSS
- **Backend**: Node.js, Express, PostgreSQL
- **ETL**: Python, Shopify API
- **Database**: PostgreSQL with JSONB support