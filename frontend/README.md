# Frontend

Modern React-based admin dashboard for Coaching Management System.

## Features

- React 18 with Vite
- Tailwind CSS for styling
- Firebase Authentication
- Responsive design (mobile and desktop)
- REST API integration
- Charts and reports

## Setup

```bash
npm install
```

## Environment Variables

Create `.env` file from `.env.example` and update Firebase credentials:

```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
# Local dev: omit VITE_API_URL (Vite proxies /api to port 5000).

# Netlify production (set in Netlify UI, then redeploy):
# VITE_API_URL=https://coaching-management-ubiu.vercel.app/api
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Netlify deploy

1. Netlify → Site settings → Environment variables  
2. Add `VITE_API_URL` = `https://coaching-management-ubiu.vercel.app/api`  
3. Add all `VITE_FIREBASE_*` variables  
4. Trigger **Deploy** (build embeds env at compile time)

Backend setup: [../backend/DEPLOY_VERCEL.md](../backend/DEPLOY_VERCEL.md)

## Pages

- Dashboard - Overview and statistics
- Teachers - Teacher management
- Students - Student management
- Batches - Batch management
- Class Tracking - Attendance marking
- Reports - Analytics and reports
