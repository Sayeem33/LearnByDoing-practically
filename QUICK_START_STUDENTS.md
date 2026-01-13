# Student Management System - Quick Start Guide

## ✅ Setup Complete!

Your student profile management system is now fully functional with MongoDB integration and complete CRUD operations.

## 🚀 Quick Navigation

### Access the System
1. **Registration**: http://localhost:3000/register
2. **Login**: http://localhost:3000/login
3. **Dashboard**: http://localhost:3000/students/dashboard

## 📋 Demo Accounts (Ready to Use)

All accounts use password: **`password123`**

| Name | Email | Role | Institution |
|------|-------|------|-------------|
| John Smith | john.smith@example.com | Student | Oxford University |
| Emily Johnson | emily.johnson@example.com | Student | Cambridge University |
| Michael Chen | michael.chen@example.com | Student | Imperial College London |
| Sarah Williams | sarah.williams@example.com | Student | University College London |
| Dr. James Teacher | james.teacher@example.com | Teacher | Oxford University |

## 🎯 Testing CRUD Operations

### ✅ CREATE - Add New Student
```bash
# Option 1: Via UI
1. Go to /register
2. Fill out the form
3. Click "Register"

# Option 2: Direct API
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Student",
    "email": "test@example.com",
    "password": "password123",
    "studentId": "STU005",
    "institution": "Test University",
    "grade": "10A"
  }'
```

### ✅ READ - View Students
```bash
# Get all students
curl http://localhost:3000/api/students

# Get specific student (replace {id} with actual student ID)
curl http://localhost:3000/api/students/{id}
```

### ✅ UPDATE - Modify Student Info
```bash
# Option 1: Via Dashboard UI
1. Login to /students/dashboard
2. Click "Edit" on any student row
3. Modify the fields
4. Click "Save"

# Option 2: Direct API
curl -X PUT http://localhost:3000/api/students/{id} \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Updated Name",
    "institution": "New University",
    "grade": "11A"
  }'
```

### ✅ DELETE - Remove Student
```bash
# Option 1: Via Dashboard UI
1. Login to /students/dashboard
2. Click "Delete" on any student row
3. Confirm deletion

# Option 2: Direct API
curl -X DELETE http://localhost:3000/api/students/{id}
```

## 📁 API Endpoints Summary

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login user |
| GET | `/api/students` | Get all students |
| POST | `/api/students` | Create student |
| GET | `/api/students/[id]` | Get student by ID |
| PUT | `/api/students/[id]` | Update student |
| DELETE | `/api/students/[id]` | Delete student |

## 🔐 Security Features

- ✓ Password hashing with bcryptjs
- ✓ Email uniqueness validation
- ✓ Session management with localStorage
- ✓ Form validation on client and server
- ✓ SQL injection prevention (MongoDB/Mongoose)

## 📊 Database Schema

```typescript
{
  _id: ObjectId (auto-generated)
  name: String (required)
  email: String (required, unique)
  password: String (hashed)
  role: 'student' | 'teacher' | 'admin'
  studentId?: String
  institution?: String
  grade?: String
  avatar?: String
  createdAt: Date (auto)
  updatedAt: Date (auto)
}
```

## 🛠️ Available Commands

```bash
# Development
npm run dev

# Build for production
npm run build

# Start production server
npm start

# Run linter
npm lint

# Reseed database
MONGODB_URI='your_connection_string' npm run seed
```

## 📝 File Locations

```
src/
├── app/
│   ├── register/page.tsx         ← Registration page
│   ├── login/page.tsx            ← Login page
│   └── students/dashboard/page.tsx ← Main CRUD interface
│   └── api/
│       ├── auth/
│       │   ├── register/route.ts
│       │   └── login/route.ts
│       └── students/
│           ├── route.ts
│           └── [id]/route.ts
├── models/
│   └── User.ts                   ← User schema
└── lib/
    └── dbConnect.ts              ← MongoDB connection

scripts/
└── seedDatabase.ts               ← Seed data script
```

## 🐛 Troubleshooting

### "Cannot find module" error
- Run `npm install` again
- Restart the dev server

### MongoDB connection error
- Ensure `MONGODB_URI` is set correctly in `.env.local`
- Check if MongoDB Atlas cluster is active
- Verify IP whitelist includes your machine

### Seed script fails
```bash
# Ensure MONGODB_URI is exported
export MONGODB_URI='your_connection_string'
npm run seed
```

## 🎓 Next Steps

1. ✅ Test registration/login flow
2. ✅ Try CRUD operations on the dashboard
3. ✅ Create custom student fields (extend User model)
4. ✅ Add profile pictures/avatars
5. ✅ Implement export to CSV functionality
6. ✅ Add search and filtering

## 💡 Example Workflow

```
1. Start dev server: npm run dev
2. Go to http://localhost:3000/login
3. Use demo credentials: john.smith@example.com / password123
4. You're now on /students/dashboard
5. Try editing a student: Click Edit → Change values → Save
6. Try deleting: Click Delete → Confirm
7. Try adding: Click "Add New Student" → Fill form → Register
```

## 📞 Support

For issues or questions:
1. Check the STUDENT_MANAGEMENT.md file for detailed documentation
2. Review error messages in the browser console
3. Check server logs in terminal

---

**Status**: ✅ Ready to Use
**Created**: January 14, 2026
**Version**: 1.0.0
