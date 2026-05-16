# Vercel backend deploy (Root Directory = `backend`)

## Required environment variables

Set in Vercel → Project → Settings → Environment Variables (Production + Preview):

| Variable | Example |
|----------|---------|
| `MONGODB_URI` | `mongodb+srv://USER:PASS@cluster.mongodb.net/coaching_management?retryWrites=true&w=majority` |
| `FRONTEND_URL` | `https://your-app.netlify.app` (no trailing slash; comma-separated for previews) |
| `NODE_ENV` | `production` (optional) |

## MongoDB Atlas

Network Access → allow `0.0.0.0/0` (or use Atlas ↔ Vercel integration). Serverless has no fixed IP.

## Redeploy

Deployments → … → Redeploy (disable build cache once if issues persist).

## Verify

- `https://coaching-management-beta.vercel.app/api/health` → `{"status":"Server is running"}`
- `https://coaching-management-beta.vercel.app/` → `{"ok":true,...}`

If health times out, check Runtime Logs for `MONGODB_URI is not set` or DNS errors.

## Netlify frontend

Set `VITE_API_URL=https://coaching-management-beta.vercel.app/api` and redeploy the frontend build.
