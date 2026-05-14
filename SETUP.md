# Quick Start Guide

## Using Docker (Recommended)

### Prerequisites
- Docker and Docker Compose installed

### Steps

1. Navigate to project root:
```bash
cd coaching-management
```

2. Start all services:
```bash
docker-compose up
```

3. Access the application:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

### Default MongoDB Credentials
- Username: admin
- Password: admin

---

## Local Development

### Prerequisites
- Node.js v14+
- MongoDB running locally

### Backend Setup

1. Navigate to backend:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure `.env`:
```bash
cp .env.example .env
```

4. Update `.env`:
```
MONGODB_URI=mongodb://localhost:27017/coaching_management
PORT=5000
NODE_ENV=development
```

5. Start the server:
```bash
npm run dev
```

### Frontend Setup

1. Navigate to frontend:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create and configure `.env`:
```bash
cp .env.example .env
```

4. Update `.env` with Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

5. Start the development server:
```bash
npm run dev
```

---

## Setting up Firebase

1. Visit [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Email/Password authentication
4. Copy credentials to frontend `.env`

---

## Troubleshooting

### Port Already in Use
```bash
# Kill process on port 5000 (backend)
lsof -ti:5000 | xargs kill -9

# Kill process on port 3000 (frontend)
lsof -ti:3000 | xargs kill -9
```

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MongoDB URI in `.env`
- Verify MongoDB service

### Firebase Issues
- Check Firebase config
- Enable Email/Password auth
- Verify domain settings

---

## Production Build

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm install --production
npm start
```

---

## Database Backup

### Using Docker
```bash
docker exec coaching_mongodb mongodump --out /data/backups
```

### Local MongoDB
```bash
mongodump --out ./backups
```

---

## API Testing

### Using Postman
1. Import API endpoints
2. Configure environment with `http://localhost:5000/api`
3. Test endpoints

### Using cURL
```bash
curl -X GET http://localhost:5000/api/teachers
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","subject":"Math"}'
```

---

For more details, refer to the main README.md file.
