# User Manual

## 1. Introduction

This manual explains how to use SimuLab as:

- a student
- a teacher
- an admin

It also includes basic setup instructions for running the project locally.

---

## 2. System Requirements

To run the project locally you need:

- Node.js
- npm
- MongoDB connection
- a modern browser

---

## 3. Local Setup

### Step 1: Install dependencies

```bash
npm install
```

### Step 2: Configure environment variables

Create `.env.local` and set at least:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_secret_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

### Step 3: Run the development server

```bash
npm run dev
```

### Step 4: Open the application

```text
http://localhost:3000
```

### Optional commands

```bash
npm test
npm run build
```

---

## 4. User Roles

### Student

Student users can:

- use tutorials
- run labs
- save progress
- generate and save reports
- submit lab work
- view assignments

### Teacher

Teacher users can:

- create assignments
- review student submissions
- create new concept definitions from the authoring studio
- open the showcase dashboard

### Admin

Admin users can:

- do all teacher actions
- manage student records
- use admin dashboard features

---

## 5. Student Guide

### 5.1 Login

1. Open the login page.
2. Enter email and password.
3. Submit the form.
4. After login, open the main dashboard.

### 5.2 Open Tutorials

1. From the dashboard, click `Tutorials`.
2. Browse tutorial cards by category.
3. Open a tutorial.
4. Read chapters and move through content.
5. Progress is stored automatically.

### 5.3 Open a Lab

1. From the dashboard, choose a lab card.
2. Click `Start Lab`.
3. Interact with the simulation or concept workspace.
4. View charts and data logger panels.

### 5.4 Save Progress

1. Click `Save Draft`.
2. The experiment is stored in MongoDB.
3. You can reopen it later using saved links or dashboard entries.

### 5.5 Generate a Report

1. Open the lab report panel.
2. Click generate report.
3. Review the text.
4. Edit if necessary.
5. Save the report.

### 5.6 Complete and Submit

1. After report preparation, click `Mark Completed` if needed.
2. Click `Submit`.
3. Submitted work enters the instructor review queue.

### 5.7 View Assignment Work

1. Open the student dashboard.
2. Find the `Assigned Work` section.
3. Check deadlines and progress.
4. Open the linked lab or tutorial directly from the assignment card.

### 5.8 View Progress

The dashboard also shows:

- completed steps
- achievements
- tutorial completion
- lab completion
- validation and evidence status

---

## 6. Teacher Guide

### 6.1 Open Teacher Dashboard

After login as teacher, open:

```text
/instructor/dashboard
```

### 6.2 Create Assignments

1. Open `Assignments`.
2. Choose source type: lab or tutorial.
3. Select the specific source.
4. Set title and description.
5. Set deadline.
6. Choose students or classes.
7. Save the assignment.

### 6.3 Review Student Submissions

1. Open `Review Queue`.
2. Browse submitted labs.
3. Open stored report and validation data.
4. Write feedback.
5. Set review status.

### 6.4 Use the Authoring Studio

1. Open `Authoring Studio`.
2. Enter:
   - metadata
   - controls
   - formulas
   - chart settings
   - tutorial chapters
   - validation rules
   - default state JSON
3. Save the definition.
4. The concept definition is stored in MongoDB.
5. Tutorial chapters are also synced into the tutorial system.

### 6.5 Use the Showcase Dashboard

1. Open `Demo Showcase`.
2. Use it during presentation or viva to show:
   - modules
   - domain support
   - validation coverage
   - evidence readiness
   - review records
   - learning analytics

---

## 7. Admin Guide

### 7.1 Open Admin Dashboard

After login as admin, open:

```text
/admin/dashboard
```

### 7.2 Manage Students

Admin can open the student records dashboard and manage:

- account creation
- profile data
- record updates

### 7.3 Use Instructor-Level Tools

Admin can also use:

- assignment workflow
- review queue
- authoring studio
- showcase dashboard

---

## 8. Important Routes

### Main Routes

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/tutorials`
- `/lab/[experimentId]`

### Instructor Routes

- `/instructor/dashboard`
- `/instructor/assignments`
- `/instructor/reviews`
- `/instructor/authoring`
- `/instructor/showcase`

### Admin Routes

- `/admin/dashboard`
- `/students/dashboard`

---

## 9. Troubleshooting

### Problem: Page shows chunk/module error

Possible reason:

- stale `.next` build output

Fix:

```bash
rm -rf .next
npm run dev
```

### Problem: Authoring or review page redirects to login

Possible reason:

- user is not logged in
- stale auth cookie
- wrong role

Fix:

- log out and log in again
- ensure the account role is correct

### Problem: Database-backed features do not appear

Possible reason:

- MongoDB connection problem
- seed data not loaded

Fix:

- check `.env.local`
- confirm MongoDB is running
- run seed scripts if needed

---

## 10. Good Demo Flow

A strong demo sequence is:

1. Show tutorial page
2. Open a lab
3. Save a draft
4. Generate a report
5. Submit the lab
6. Open review queue as teacher
7. Show assignment creation
8. Show authored concept definition
9. Show showcase dashboard

This demonstrates learning flow, system depth, and educational value clearly.

