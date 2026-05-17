# Admin Setup Guide

## Initial Admin Setup

After deploying the application, follow these steps to set up the first admin:

### Step 1: Sign up/Login with Admin Email
1. Go to the login page
2. Create an account or login with **hasmirhassan@gmail.com**
3. The user will be automatically created in the database

### Step 2: Make User Admin (Database Method)

Connect to your MongoDB database and run these commands:

```javascript
// In MongoDB, find the user and set as admin
db.users.updateOne(
  { email: 'hasmirhassan@gmail.com' },
  { 
    $set: { 
      isAdmin: true,
      role: 'admin'
    }
  }
)
```

### Step 3: Refresh Application
Refresh the application in your browser. The user with admin email should now have access to the Admin Panel.

## Admin Capabilities

Once set as admin, the user can:
- **View all users** in the system
- **Promote other users to admin** status
- **Remove admin status** from users
- **Assign teacher roles** to users
- **Delete users** from the system
- **Access all management pages**

## Teacher Setup

### For existing teachers:
1. Go to Admin Panel
2. Find the user who should be a teacher
3. Click "Make Admin" will promote them (instead use database for teacher role)

### Using Database (Direct Method):
```javascript
// Find teacher record first
const teacher = db.teachers.findOne({ email: 'teacher@example.com' });

// Then link user to teacher
db.users.updateOne(
  { email: 'teacher@example.com' },
  { 
    $set: { 
      role: 'teacher',
      teacher: teacher._id
    }
  }
)
```

## Role Hierarchy

- **Admin**: Full access to all features including user management
- **Teacher**: Can see only their assigned classes and mark attendance
- **User**: Basic access (read-only in most areas)

## Access Control

### Admin-Only Pages:
- Admin Panel (`/admin`)
- Teachers Management (`/teachers`)
- Students Management (`/students`)
- Batches Management (`/batches`)
- Class Tracking (`/class-tracking`)
- Reports (`/reports`)
- Finance/Accounts (`/finance`)

### Teacher Pages:
- My Classes (`/teacher-dashboard`)
- Can mark attendance for their classes
- Can view dashboard

### Notes:
- Teachers cannot modify any data
- Teachers can only see their own classes
- Only admins can perform CRUD operations on Teachers, Students, Batches
