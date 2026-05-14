# Developer Quick Reference Guide

## 🚀 Common Commands

### Backend
```bash
# Install dependencies
npm install

# Development server (with auto-reload)
npm run dev

# Production server
npm start

# Check health
curl http://localhost:5000/api/health
```

### Frontend
```bash
# Install dependencies
npm install

# Development server (with hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### MongoDB
```bash
# Start MongoDB (macOS with Homebrew)
brew services start mongodb-community

# Start MongoDB (Linux)
sudo systemctl start mongod

# Connect to MongoDB
mongosh

# List databases
show dbs

# Use database
use coaching_management

# List collections
show collections
```

### Docker
```bash
# Start all services
docker-compose up

# Start in background
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild images
docker-compose build --no-cache
```

---

## 📁 File Locations Reference

### Adding a New Feature

#### Backend (Example: Reports)
1. Create model in `backend/models/`
2. Create controller in `backend/controllers/`
3. Create routes in `backend/routes/`
4. Update API calls in `frontend/src/services/api.js`

#### Frontend (Example: New Page)
1. Create page component in `frontend/src/pages/`
2. Add route in `frontend/src/App.jsx`
3. Add menu item in `frontend/src/components/Sidebar.jsx`
4. Create API functions in `frontend/src/services/api.js`

---

## 🔑 Environment Variables

### Backend (.env)
```
MONGODB_URI=mongodb://localhost:27017/coaching_management
PORT=5000
NODE_ENV=development
JWT_SECRET=your_secret_here
```

### Frontend (.env)
```
VITE_FIREBASE_API_KEY=xxx
VITE_FIREBASE_AUTH_DOMAIN=xxx
VITE_FIREBASE_PROJECT_ID=xxx
VITE_FIREBASE_STORAGE_BUCKET=xxx
VITE_FIREBASE_MESSAGING_SENDER_ID=xxx
VITE_FIREBASE_APP_ID=xxx
VITE_API_URL=http://localhost:5000/api
```

---

## 🔄 API Development Pattern

### Creating a New Endpoint

**Step 1: Create Model** (`backend/models/NewModel.js`)
```javascript
const schema = new mongoose.Schema({
  name: String,
  // ... fields
}, { timestamps: true });
```

**Step 2: Create Controller** (`backend/controllers/newController.js`)
```javascript
exports.getAll = async (req, res) => {
  try {
    const data = await Model.find();
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
```

**Step 3: Create Routes** (`backend/routes/new.js`)
```javascript
router.get('/', controller.getAll);
router.post('/', controller.create);
// ... other routes
```

**Step 4: Register Routes** (`backend/server.js`)
```javascript
app.use('/api/new', newRoutes);
```

**Step 5: Add API Service** (`frontend/src/services/api.js`)
```javascript
export const newAPI = {
  getAll: () => api.get('/new'),
  create: (data) => api.post('/new', data),
  // ... other methods
};
```

---

## 🎨 Frontend Component Pattern

### Creating a New Page
```javascript
import React, { useState, useEffect } from 'react';
import { someAPI } from '../services/api';
import { SomeIcon } from 'lucide-react';

const NewPage = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const res = await someAPI.getAll();
      setData(res.data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-8">Page Title</h1>
      {/* Content here */}
    </div>
  );
};

export default NewPage;
```

---

## 🐛 Debugging Tips

### Backend Debugging
```bash
# Check if server is running
curl http://localhost:5000/api/health

# Check MongoDB connection
mongosh --eval "db.adminCommand('ping')"

# View logs
npm run dev  # Logs in console
```

### Frontend Debugging
```bash
# Check browser console (F12)
# Check network tab for API calls
# Use React DevTools browser extension
# Check .env file is loaded correctly
```

### Common Issues

**Port Already in Use**
```bash
# Find process on port
lsof -ti:5000

# Kill process
kill -9 <PID>
```

**MongoDB Connection Error**
- Check MongoDB is running
- Verify connection string in .env
- Check MongoDB URI format

**CORS Error**
- Verify backend has CORS enabled
- Check API URL in frontend .env
- Restart backend after changes

---

## 📊 Database Query Examples

### Using MongoDB/Mongoose

```javascript
// Find all
const all = await Model.find();

// Find by ID
const one = await Model.findById(id);

// Find with condition
const filtered = await Model.find({ status: 'active' });

// Create
const created = await Model.create(data);

// Update
const updated = await Model.findByIdAndUpdate(id, data, { new: true });

// Delete
await Model.findByIdAndDelete(id);

// Populate references
const populated = await Model.findById(id).populate('referenceField');

// Count
const count = await Model.countDocuments();

// Aggregate
const stats = await Model.aggregate([
  { $group: { _id: '$type', count: { $sum: 1 } } }
]);
```

---

## 🧪 Testing API Endpoints

### Using Curl
```bash
# GET
curl http://localhost:5000/api/teachers

# POST
curl -X POST http://localhost:5000/api/teachers \
  -H "Content-Type: application/json" \
  -d '{"name":"John","email":"john@example.com","subject":"Math"}'

# PUT
curl -X PUT http://localhost:5000/api/teachers/id \
  -H "Content-Type: application/json" \
  -d '{"status":"inactive"}'

# DELETE
curl -X DELETE http://localhost:5000/api/teachers/id
```

### Using Postman
1. Import collection
2. Set environment variables
3. Select endpoint
4. Add headers if needed
5. Send request

---

## 📚 Useful Links

- [React Documentation](https://react.dev)
- [Express.js Guide](https://expressjs.com)
- [MongoDB Manual](https://docs.mongodb.com/manual)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Firebase Docs](https://firebase.google.com/docs)
- [Vite Documentation](https://vitejs.dev)

---

## 📋 Deployment Checklist

Before deploying to production:
- [ ] Update .env with production values
- [ ] Set NODE_ENV=production
- [ ] Run `npm run build` for frontend
- [ ] Test all API endpoints
- [ ] Verify database backups
- [ ] Check CORS settings
- [ ] Enable HTTPS
- [ ] Set up error logging
- [ ] Create admin account
- [ ] Test authentication flow
- [ ] Verify email notifications (if applicable)
- [ ] Check pagination performance
- [ ] Review security settings
- [ ] Create deployment guide

---

## 🤝 Git Workflow

```bash
# Create feature branch
git checkout -b feature/feature-name

# Make changes
git add .

# Commit
git commit -m "Add feature: description"

# Push
git push origin feature/feature-name

# Create Pull Request
# Get approved
# Merge to main

# Deploy from main
```

---

## 💡 Performance Tips

### Frontend
- Lazy load pages with React.lazy()
- Memoize expensive components
- Use useCallback for event handlers
- Optimize images
- Minimize bundle size

### Backend
- Index frequently queried fields
- Use pagination for large datasets
- Cache common queries
- Optimize database aggregations
- Use connection pooling

---

## 🔒 Security Checklist

- [ ] Validate all user inputs
- [ ] Sanitize database queries
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS in production
- [ ] Set strong MongoDB passwords
- [ ] Use CORS appropriately
- [ ] Implement rate limiting
- [ ] Add request validation
- [ ] Log security events
- [ ] Regular security audits

---

**Last Updated**: May 2026  
**Maintained By**: Development Team  
**Version**: 1.0
