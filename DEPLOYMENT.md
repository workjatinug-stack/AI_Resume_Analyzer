# Production Deployment Guide

This document explains how to deploy the AI Resume Analyzer to production.

## Architecture

The application uses a split deployment architecture:

- **Frontend**: Vercel (static site)
- **Backend**: Railway (Node.js + Express + MySQL)
- **AI Service**: Forge API (external)
- **Database**: MySQL (Railway or external)

## Prerequisites

1. GitHub repository: `workjatinug-stack/AI_Resume_Analyzer`
2. Vercel account (for frontend)
3. Railway account (for backend + database)
4. Forge API key (for AI analysis)

## Step 1: Deploy Backend on Railway

### 1.1 Create Railway Project

1. Go to [railway.app](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select `workjatinug-stack/AI_Resume_Analyzer`
4. Railway will detect the `railway.toml` configuration

### 1.2 Add MySQL Database

1. In your Railway project, click "New Service"
2. Select "Database" → "MySQL"
3. Railway will create a MySQL instance

### 1.3 Configure Environment Variables

In Railway, add these environment variables:

**Database:**
- `DATABASE_URL` - Click on your MySQL service → "Variables" → Copy `DATABASE_URL` and paste it into your backend service environment variables

**AI Service:**
- `BUILT_IN_FORGE_API_KEY` - Your Forge API key
- `BUILT_IN_FORGE_API_URL` - `https://forge.manus.im` (or leave blank for default)

**CORS:**
- `ALLOWED_ORIGINS` - Your Vercel frontend URL (e.g., `https://your-app.vercel.app`)

**Other:**
- `NODE_ENV` - `production`
- `PORT` - `3000` (Railway sets this automatically)

### 1.4 Deploy

1. Click "Deploy" in Railway
2. Wait for deployment to complete
3. Copy your backend URL (e.g., `https://your-backend-production.up.railway.app`)

## Step 2: Configure Vercel Frontend

### 2.1 Add Environment Variable

1. Go to your Vercel project dashboard
2. Go to "Settings" → "Environment Variables"
3. Add:
   - Name: `VITE_BACKEND_URL`
   - Value: Your Railway backend URL (e.g., `https://your-backend-production.up.railway.app`)
   - Environments: Production, Preview, Development

### 2.2 Redeploy

1. Go to "Deployments" in Vercel
2. Click "Redeploy" on the latest deployment
3. Wait for redeployment to complete

## Step 3: Run Database Migrations

If your application uses database migrations:

1. In Railway, open your backend service
2. Go to "Console" tab
3. Run: `pnpm db:push`

Or configure this to run automatically in the build process.

## Step 4: Test the Application

1. Open your Vercel frontend URL
2. Upload a resume (PDF or DOCX)
3. Click "Run my analysis"
4. Verify:
   - No `Unexpected token 'T'` error
   - Analysis completes successfully
   - Results are displayed correctly

## Environment Variables Reference

### Backend (Railway)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | Yes | MySQL connection string | `mysql://root:password@host:3306/dbname` |
| `BUILT_IN_FORGE_API_KEY` | Yes | Forge API key for AI analysis | `sk-...` |
| `BUILT_IN_FORGE_API_URL` | No | Forge API URL | `https://forge.manus.im` |
| `ALLOWED_ORIGINS` | Yes | CORS allowed origins (comma-separated) | `https://your-app.vercel.app` |
| `NODE_ENV` | Yes | Environment | `production` |
| `PORT` | No | Server port (Railway sets this) | `3000` |

### Frontend (Vercel)

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `VITE_BACKEND_URL` | Yes | Backend API URL | `https://your-backend.railway.app` |

## Troubleshooting

### "Unexpected token 'T'" Error

This means the frontend cannot reach the backend. Check:
1. `VITE_BACKEND_URL` is set correctly in Vercel
2. Backend is deployed and running on Railway
3. `ALLOWED_ORIGINS` includes your Vercel domain
4. Backend health check passes

### CORS Errors

Check:
1. `ALLOWED_ORIGINS` includes the exact Vercel domain
2. No trailing slashes in the URL
3. Backend has CORS middleware configured

### Database Connection Errors

Check:
1. `DATABASE_URL` is correctly copied from Railway MySQL service
2. Database service is running
3. Connection string format is correct

### AI Analysis Fails

Check:
1. `BUILT_IN_FORGE_API_KEY` is valid and active
2. API key has sufficient credits/quota
3. Network connectivity to Forge API

## Production URLs

After deployment, you will have:

- **Frontend**: `https://your-app.vercel.app`
- **Backend**: `https://your-backend.up.railway.app`
- **Database**: Internal Railway MySQL (no external URL needed)

## Security Notes

- Never commit `.env` files to GitHub
- Rotate API keys regularly
- Use Railway's built-in secrets management
- Enable Railway's automatic backups for MySQL
- Monitor Railway logs for errors
