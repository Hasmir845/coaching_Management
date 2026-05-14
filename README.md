# Coaching Management System

A comprehensive full-stack solution for managing coaching centers with teachers, students, batches, and class attendance tracking.

## Features

### Dashboard
- Total statistics (teachers, students, batches)
- Today's scheduled classes
- Absent teachers tracking
- Recent activities log

### Teacher Management
- Add, edit, delete teachers
- Search teachers by name/subject
- Assign batches to teachers
- Track teacher status (active, inactive, on leave)

### Student Management
- Add, edit, delete students
- Search students
- Assign students to batches
- Track enrollment status

### Batch Management
- Create and manage batches
- Assign teachers to batches
- Add/remove students from batches
- View batch details and student lists

### Class Tracking
- Mark daily attendance
- Track class topics and notes
- View attendance history
- Filter by date and batch

### Reports & Analytics
- Teacher class count statistics
- Attendance/absence rate analysis
- Batch-wise class history
- Visual charts and graphs

## Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Firebase** - Authentication
- **Axios** - HTTP client
- **Lucide React** - Icons
- **Recharts** - Data visualization

### Backend
- **Node.js** - Runtime
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM
- **CORS** - Cross-origin handling

### Architecture
- RESTful API design
- MongoDB collections for data persistence
- Activity logging system
- Responsive UI (mobile and desktop)

## Project Structure

```
coaching-management/
├── frontend/                 # React application
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API services
│   │   ├── context/         # React context (Auth)
│   │   ├── App.jsx          # Main app component
│   │   └── index.css        # Tailwind styles
│   ├── package.json         # Frontend dependencies
│   ├── vite.config.js       # Vite configuration
│   └── tailwind.config.js   # Tailwind configuration
│
├── backend/                  # Express application
│   ├── models/              # MongoDB schemas
│   ├── controllers/         # Business logic
│   ├── routes/              # API routes
│   ├── config/              # Configuration files
│   ├── middleware/          # Express middleware
│   ├── server.js            # Entry point
│   └── package.json         # Backend dependencies
│
└── README.md               # This file
```

## Installation & Setup

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (running locally or cloud)
- npm or yarn package manager

### Backend Setup

1. Navigate to backend folder:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your MongoDB URI and settings:
```
MONGODB_URI=mongodb://localhost:27017/coaching_management
PORT=5000
NODE_ENV=development
```

5. Start MongoDB (if running locally):
```bash
mongod
```

6. Run the backend server:
```bash
npm run dev
```

The backend will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to frontend folder:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Update `.env` with your Firebase credentials:
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_FIREBASE_STORAGE_BUCKET=your_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_API_URL=http://localhost:5000/api
```

5. Run the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:3000`

## API Documentation

### Base URL
```
http://localhost:5000/api
```

### Endpoints

#### Teachers
- `GET /teachers` - Get all teachers
- `POST /teachers` - Create teacher
- `GET /teachers/:id` - Get teacher by ID
- `PUT /teachers/:id` - Update teacher
- `DELETE /teachers/:id` - Delete teacher

#### Students
- `GET /students` - Get all students
- `POST /students` - Create student
- `GET /students/:id` - Get student by ID
- `PUT /students/:id` - Update student
- `DELETE /students/:id` - Delete student

#### Batches
- `GET /batches` - Get all batches
- `POST /batches` - Create batch
- `GET /batches/:id` - Get batch by ID
- `PUT /batches/:id` - Update batch
- `DELETE /batches/:id` - Delete batch

#### Class Tracking
- `GET /class-tracking` - Get all records
- `POST /class-tracking` - Create record
- `GET /class-tracking/:id` - Get record by ID
- `PUT /class-tracking/:id` - Update record
- `DELETE /class-tracking/:id` - Delete record

#### Dashboard
- `GET /dashboard/stats` - Get statistics
- `GET /dashboard/today-classes` - Today's classes
- `GET /dashboard/absent-teachers` - Absent teachers
- `GET /dashboard/recent-activities` - Recent activities

#### Reports
- `GET /reports/teacher-class-count` - Teacher statistics
- `GET /reports/absent-count` - Absence statistics
- `GET /reports/batch-history/:batchId` - Batch history

## Firebase Setup

To set up Firebase authentication:

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Email/Password authentication
4. Get your Firebase config
5. Add the credentials to frontend `.env` file

## MongoDB Collections

### Teachers Collection
```json
{
  "name": "string",
  "email": "string",
  "subject": "string",
  "phone": "string",
  "joiningDate": "date",
  "status": "string",
  "batches": ["ObjectId"]
}
```

### Students Collection
```json
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "batch": "ObjectId",
  "enrollmentDate": "date",
  "status": "string"
}
```

### Batches Collection
```json
{
  "name": "string",
  "subject": "string",
  "schedule": "string",
  "startDate": "date",
  "endDate": "date",
  "capacity": "number",
  "teacher": "ObjectId",
  "students": ["ObjectId"],
  "status": "string"
}
```

### ClassTracking Collection
```json
{
  "batch": "ObjectId",
  "date": "date",
  "topic": "string",
  "notes": "string",
  "presentStudents": [
    {
      "studentId": "ObjectId",
      "present": "boolean"
    }
  ],
  "totalPresent": "number",
  "totalAbsent": "number"
}
```

## Development Guidelines

### Frontend Development
- Use React hooks for state management
- Create reusable components in `components/` folder
- Keep pages in `pages/` folder
- Use Tailwind CSS utility classes for styling
- Handle API calls through the `services/api.js` file

### Backend Development
- Keep controllers for business logic
- Use Mongoose models for database schema
- Implement proper error handling
- Log activities for audit trail
- Use RESTful conventions for API design

## Deployment

### Frontend
```bash
npm run build
```

Deployment options:
- Vercel
- Netlify
- GitHub Pages
- AWS S3 + CloudFront

### Backend
```bash
npm install --production
npm start
```

Deployment options:
- Heroku
- AWS EC2
- DigitalOcean
- Railway

## Troubleshooting

### MongoDB Connection Error
- Ensure MongoDB is running
- Check `MONGODB_URI` in `.env`

### Firebase Authentication Issues
- Verify Firebase config in `.env`
- Enable Email/Password in Firebase Console
- Check CORS settings

### API Connection Error
- Verify backend is running on port 5000
- Check `VITE_API_URL` in frontend `.env`
- Check CORS configuration in backend

## Future Enhancements

- User role-based access control (Admin, Teacher, Student)
- Batch fee payment tracking
- Certificate generation
- SMS/Email notifications
- Student performance analytics
- Bulk attendance import

## License

This project is open source and available under the MIT License.

## Support

For issues or questions, please create an issue in the repository.

---

**Happy Teaching!** 📚✨
