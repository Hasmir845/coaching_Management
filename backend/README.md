# Backend

Express.js backend server for Coaching Management System with MongoDB.

## Features

- RESTful API with Express.js
- MongoDB for data storage
- CORS enabled
- Error handling middleware
- Activity logging
- Dashboard, reports, and analytics endpoints

## Setup

```bash
npm install
```

## Environment Variables

Create `.env` file from `.env.example`:

```
MONGODB_URI=mongodb://localhost:27017/coaching_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_jwt_secret_key_here
```

## MongoDB Setup

Make sure MongoDB is running:

```bash
# Windows
mongod

# Mac (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

## Development

```bash
npm run dev
```

## Start Production

```bash
npm start
```

## API Endpoints

### Teachers
- `GET /api/teachers` - Get all teachers
- `POST /api/teachers` - Create teacher
- `GET /api/teachers/:id` - Get teacher by ID
- `PUT /api/teachers/:id` - Update teacher
- `DELETE /api/teachers/:id` - Delete teacher
- `GET /api/teachers/search?q=query` - Search teachers

### Students
- `GET /api/students` - Get all students
- `POST /api/students` - Create student
- `GET /api/students/:id` - Get student by ID
- `PUT /api/students/:id` - Update student
- `DELETE /api/students/:id` - Delete student
- `GET /api/students/search?q=query` - Search students
- `GET /api/students/batch/:batchId` - Get students by batch

### Batches
- `GET /api/batches` - Get all batches
- `POST /api/batches` - Create batch
- `GET /api/batches/:id` - Get batch by ID
- `PUT /api/batches/:id` - Update batch
- `DELETE /api/batches/:id` - Delete batch
- `POST /api/batches/:id/teachers` - Assign teacher
- `POST /api/batches/:id/students` - Add student
- `DELETE /api/batches/:id/students/:studentId` - Remove student

### Class Tracking
- `GET /api/class-tracking` - Get all records
- `POST /api/class-tracking` - Create record
- `GET /api/class-tracking/:id` - Get record by ID
- `PUT /api/class-tracking/:id` - Update record
- `DELETE /api/class-tracking/:id` - Delete record
- `GET /api/class-tracking/date/:date` - Get classes by date
- `GET /api/class-tracking/batch/:batchId` - Get classes by batch

### Dashboard
- `GET /api/dashboard/stats` - Get statistics
- `GET /api/dashboard/today-classes` - Get today's classes
- `GET /api/dashboard/absent-teachers` - Get absent teachers
- `GET /api/dashboard/recent-activities` - Get recent activities

### Reports
- `GET /api/reports/teacher-class-count` - Teacher class count
- `GET /api/reports/absent-count` - Absence count
- `GET /api/reports/batch-history/:batchId` - Batch class history
