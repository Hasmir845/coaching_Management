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
VITE_API_URL=http://localhost:5000/api

# For production, set VITE_API_URL to your backend host URL, for example:
# VITE_API_URL=https://your-backend.vercel.app/api
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Pages

- Dashboard - Overview and statistics
- Teachers - Teacher management
- Students - Student management
- Batches - Batch management
- Class Tracking - Attendance marking
- Reports - Analytics and reports
