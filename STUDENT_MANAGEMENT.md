# Student Profile Management System

## Overview
This is a complete student registration, authentication, and management system with MongoDB integration and full CRUD operations.

## Features

### 1. **User Authentication**
- Student registration with form validation
- Secure login with password hashing (bcryptjs)
- Session management with localStorage

### 2. **CRUD Operations**
- **Create**: Register new students or add them via dashboard
- **Read**: View all students and individual student details
- **Update**: Edit student information (name, institution, grade)
- **Delete**: Remove student records from the database

### 3. **Pages**
- `/register` - Student registration page
- `/login` - Login page with demo credentials
- `/students/dashboard` - Main dashboard with all CRUD operations

### 4. **API Routes**
- `POST /api/auth/register` - Register new student
- `POST /api/auth/login` - Login student
- `GET /api/students` - Get all students
- `POST /api/students` - Create new student
- `GET /api/students/[id]` - Get specific student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

## Database Schema

### User Model
```typescript
interface IUser {
  name: string (required)
  email: string (required, unique)
  password: string (required, hashed)
  role: 'student' | 'teacher' | 'admin' (default: 'student')
  studentId?: string
  institution?: string
  grade?: string
  avatar?: string
  createdAt: Date
  updatedAt: Date
}
```

## Setup Instructions

### 1. Seed Database with Sample Data

```bash
npm run seed
```

This will create 5 sample student records in your MongoDB database:

**Demo Accounts:**
- **Student 1**: john.smith@example.com / password123
- **Student 2**: emily.johnson@example.com / password123
- **Student 3**: michael.chen@example.com / password123
- **Student 4**: sarah.williams@example.com / password123
- **Teacher**: james.teacher@example.com / password123

### 2. Start Development Server

```bash
npm run dev
```

Navigate to `http://localhost:3000`

## Usage Workflow

### Registration Flow
1. Go to `/register`
2. Fill in required fields (name, email, password)
3. Optionally add student ID, institution, and grade
4. Click "Register"
5. Redirected to login page

### Login Flow
1. Go to `/login`
2. Enter email and password
3. Click "Login"
4. Redirected to `/students/dashboard`

### Dashboard Operations

#### View All Students
- Dashboard automatically loads all registered students

#### Add New Student
- Click "Add New Student" button
- Redirected to registration page
- After registration, new student appears in dashboard

#### Edit Student
1. Click "Edit" button on student row
2. Inline form appears for editing
3. Modify name, institution, or grade
4. Click "Save" to update
5. Click "Cancel" to discard changes

#### Delete Student
1. Click "Delete" button on student row
2. Confirm deletion in popup
3. Student record removed from database

## Technical Stack

- **Frontend**: React 18, Next.js 14, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: bcryptjs for password hashing
- **Validation**: Built-in form validation

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── register/route.ts
│   │   │   └── login/route.ts
│   │   └── students/
│   │       ├── route.ts (GET all, POST new)
│   │       └── [id]/route.ts (GET, PUT, DELETE)
│   ├── register/page.tsx
│   ├── login/page.tsx
│   └── students/dashboard/page.tsx
├── models/
│   └── User.ts
└── lib/
    └── dbConnect.ts

scripts/
└── seedDatabase.ts
```

## Error Handling

The system includes comprehensive error handling:
- Email validation and unique constraint checking
- Password validation (minimum 6 characters)
- Password confirmation matching
- MongoDB connection error handling
- Invalid student ID format detection
- Proper HTTP status codes

## Environment Variables Required

Make sure your `.env.local` has:
```
MONGODB_URI=your_mongodb_connection_string
```

## Future Enhancements

- Password reset functionality
- Email verification
- Role-based access control
- Student profile avatars
- Experiment history per student
- Export student data to CSV
- Search and filter functionality
- Pagination for large datasets
