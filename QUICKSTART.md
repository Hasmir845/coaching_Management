# ⚡ Quick Start

## 🎯 Prerequisites
- Node.js v14+
- MongoDB (local or Atlas)
- Firebase account

## 📦 One-Command Setup

### Windows
```bash
setup.bat
```

### Mac/Linux
```bash
chmod +x setup.sh
./setup.sh
```

## 🐳 Or Use Docker (Recommended)
```bash
docker-compose up
```

## 🚀 Manual Setup

### Backend
```bash
cd backend
npm install
cp .env.example .env
# Update .env with MongoDB URI
npm run dev
```

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
# Update .env with Firebase credentials
npm run dev
```

## 🌐 Access
- **App**: http://localhost:3000
- **API**: http://localhost:5000/api
- **Health Check**: http://localhost:5000/api/health

## 📋 Default Features

### Dashboard
- Total stats (teachers, students, batches)
- Today's classes
- Absent teachers
- Activity log

### Management
- **Teachers**: Add, edit, delete, search
- **Students**: Add, edit, delete, assign to batch
- **Batches**: Create, manage, assign teachers/students
- **Classes**: Mark attendance, track notes

### Analytics
- Teacher class count
- Absence statistics
- Batch-wise history

## 🔐 Authentication
- Email/Password login via Firebase
- Protected routes
- Logout functionality

## 🛠️ Configuration Files

### Backend .env
```
MONGODB_URI=mongodb://localhost:27017/coaching_management
PORT=5000
```

### Frontend .env
```
VITE_FIREBASE_API_KEY=your_key
VITE_FIREBASE_AUTH_DOMAIN=your_domain
VITE_FIREBASE_PROJECT_ID=your_project
VITE_API_URL=http://localhost:5000/api
```

## 📚 Documentation
- **README.md** - Full project documentation
- **PROJECT_SUMMARY.md** - Architecture & features
- **SETUP.md** - Detailed setup instructions
- **DEVELOPER_GUIDE.md** - Development patterns

## 🔧 Troubleshooting

| Issue | Solution |
|-------|----------|
| Port in use | Kill process or use different port |
| MongoDB error | Ensure MongoDB is running |
| Firebase error | Check credentials in .env |
| API not connecting | Verify backend is running on 5000 |

## 📞 Support
Check DEVELOPER_GUIDE.md for troubleshooting and common issues.

---

**Ready to go! Start with backend, then frontend. Happy coding!** 🎓
