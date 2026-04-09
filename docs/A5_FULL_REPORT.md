# SimuLab Documentation Report

CSE 3200 System Development Project  
Assessment Area: A5 Documentation Report Writing  
Prepared for the SimuLab project based on the current implemented system

## 1. Introduction

### 1.1 Project Title

**SimuLab: Virtual Lab and Concept Learning Platform**

### 1.2 Background

Students often struggle to understand science and mathematics through theory alone. In many institutions, physical labs are limited by cost, time, safety, and equipment availability. As a result, learners may memorize formulas without clearly understanding why the results occur.

SimuLab was developed as a browser-based learning platform that combines:

- virtual experiments
- interactive tutorials
- concept visualizations
- progress tracking
- lab report generation
- validation and evidence generation
- instructor review
- assignment workflow
- concept authoring tools

The project focuses on improving conceptual understanding and making difficult topics more accessible for students.

### 1.3 Aim

The aim of SimuLab is to provide a practical educational system where students can learn through guided interaction rather than passive reading only.

### 1.4 Objectives

- Provide interactive physics, chemistry, and math learning modules.
- Allow students to save, continue, and submit work.
- Help teachers assign and review learning activities.
- Store progress and evidence in MongoDB.
- Support future scalability through a simple authoring workflow.

---

## 2. Software Requirements Specification (SRS)

### 2.1 Problem Statement

The problem addressed by this project is that many scientific and mathematical concepts are difficult to teach effectively using static classroom explanation only. Real laboratory work is useful, but institutions may not always have enough time, equipment, or safe conditions for repeated experimentation. Students also need a way to revisit activities outside the classroom.

SimuLab solves this by offering a web-based system where students can:

- perform virtual experiments
- view guided tutorials
- track their own progress
- generate lab reports
- receive instructor feedback

### 2.2 Intended Users

#### Student

Students use the system to:

- log in and access modules
- study tutorials
- run labs and concept visualizations
- save progress
- generate and edit reports
- submit work
- check assigned tasks

#### Teacher

Teachers use the system to:

- create assignments from labs or tutorials
- monitor student completion
- review submitted lab reports
- add new concept definitions through the authoring studio

#### Admin

Admins use the system to:

- manage student records
- access all teacher tools
- supervise system-level operations

### 2.3 Functional Requirements

The system shall:

- support registration, login, and logout
- maintain role-based access control
- show tutorials by category
- open lab workspaces using experiment or concept ids
- save experiment state to MongoDB
- restore saved work for later continuation
- generate lab reports from stored results
- save review status and feedback
- create assignments for students or classes
- track tutorial and lab progress
- allow teachers/admins to create MongoDB-backed concept definitions
- display demo-ready project analytics in a showcase dashboard

### 2.4 Non-Functional Requirements

The system should:

- be easy to use in a web browser
- remain understandable and maintainable for student developers
- protect restricted actions through authentication and role checks
- store important learning data reliably in MongoDB
- support demonstration and academic evaluation clearly

### 2.5 Main Data Entities

- `User`
- `Experiment`
- `Tutorial`
- `UserProgress`
- `Assignment`
- `ConceptDefinition`

---

## 3. System Design

### 3.1 Architecture Overview

SimuLab uses a layered web architecture:

```text
Users
  |
  v
Frontend Pages and Components (Next.js)
  |
  v
API Routes (Next.js backend)
  |
  v
MongoDB Database (Mongoose models)
```

### 3.2 Frontend Layer

The frontend contains:

- dashboards
- tutorial pages
- lab pages
- instructor/admin interfaces
- authoring studio
- showcase dashboard

This layer is responsible for user interaction, form input, chart display, and navigation.

### 3.3 Backend Layer

The backend is implemented through Next.js API routes.  
Important route groups include:

- `/api/auth`
- `/api/experiments`
- `/api/tutorials`
- `/api/progress`
- `/api/reviews`
- `/api/assignments`
- `/api/authoring`
- `/api/students`

These routes handle saving, reading, updating, and filtering system data.

### 3.4 Database Layer

MongoDB is used for persistent storage.  
Mongoose models define the structure for users, experiments, tutorials, progress, assignments, and authored concept definitions.

### 3.5 Role-Based Design

The system uses three main roles:

- `student`
- `teacher`
- `admin`

Role-based policies are enforced before sensitive actions like:

- student record management
- assignment creation
- review updates
- authoring studio access

### 3.6 Experiment and Module Design

The project now supports two kinds of modules:

#### Built-in Modules

These are defined in a central experiment definition registry.  
They include built-in metadata such as:

- category
- controls
- formulas
- charts
- validation rules
- default state

#### Authored Modules

These are created through the authoring studio and stored in MongoDB.  
They include:

- metadata
- controls
- formulas
- chart settings
- tutorial chapters
- validation rules
- default state

This allows new modules to be introduced without hardcoding every new concept manually.

### 3.7 Major Implemented Features

#### Lab Workspace

Students can:

- open experiments
- interact with simulations
- save drafts
- complete and submit work
- restore previously saved state

#### Tutorials

Tutorials contain:

- description
- objectives
- chapter content
- category-based organization

#### Progress Tracking

Progress is MongoDB-backed and records:

- tutorial progress
- lab progress
- achievements
- completion statistics

#### Review Workflow

Submitted experiments can be:

- opened in a review queue
- checked with report and validation output
- marked approved or changes requested

#### Assignment Workflow

Teachers/admins can:

- create assignments from labs or tutorials
- set deadlines
- assign to students or grouped classes
- view class-level completion and submission analytics

#### Authoring Studio

The authoring studio allows practical creation of new modules using a form-based interface instead of deep code changes.

#### Demo Showcase Dashboard

The showcase dashboard summarizes:

- modules
- domains
- validation coverage
- evidence readiness
- review records
- learning analytics

---

## 4. User Manual

### 4.1 Running the Project Locally

#### Install dependencies

```bash
npm install
```

#### Configure environment

Create `.env.local` and set values such as:

```env
MONGODB_URI=your_mongodb_connection_string
AUTH_SECRET=your_secret_key
NEXTAUTH_SECRET=your_secret_key
NEXTAUTH_URL=http://localhost:3000
```

#### Run the development server

```bash
npm run dev
```

#### Open the application

```text
http://localhost:3000
```

### 4.2 Student Usage

#### Login

1. Open the login page.
2. Enter credentials.
3. Go to the student dashboard.

#### Study Tutorials

1. Open `/tutorials`.
2. Select a tutorial.
3. Read chapters and move through the content.
4. Progress updates automatically.

#### Use a Lab

1. Open a lab from the dashboard or assignment card.
2. Interact with the module.
3. Observe charts and logged data.
4. Save draft if needed.

#### Generate Report

1. Open the report panel.
2. Generate report.
3. Edit text if necessary.
4. Save the report.

#### Submit Work

1. Mark the lab completed.
2. Submit the experiment.
3. Wait for instructor review.

#### View Assignments

Assignments appear on the student dashboard with:

- title
- deadline
- progress
- direct open links

### 4.3 Teacher Usage

#### Open Dashboard

Use:

```text
/instructor/dashboard
```

#### Create Assignments

1. Open `/instructor/assignments`.
2. Select source type and source item.
3. Set title and deadline.
4. Choose students or classes.
5. Save the assignment.

#### Review Work

1. Open `/instructor/reviews`.
2. Choose a submitted lab.
3. Read report and evidence.
4. write feedback
5. save review status

#### Use Authoring Studio

1. Open `/instructor/authoring`.
2. Fill in metadata.
3. Add controls, formulas, charts, tutorial chapters, and validation rules.
4. Add default state JSON.
5. Save definition.

#### Use Showcase

1. Open `/instructor/showcase`.
2. Use the dashboard during demonstration or viva.

### 4.4 Admin Usage

Admins can use:

- all teacher tools
- admin dashboard
- student record management

Important admin routes:

- `/admin/dashboard`
- `/students/dashboard`

---

## 5. Important Routes

### Student Routes

- `/dashboard`
- `/tutorials`
- `/tutorials/[experimentId]`
- `/lab/[experimentId]`

### Teacher/Admin Routes

- `/instructor/dashboard`
- `/instructor/assignments`
- `/instructor/reviews`
- `/instructor/authoring`
- `/instructor/showcase`
- `/admin/dashboard`

### API Groups

- `/api/auth`
- `/api/experiments`
- `/api/tutorials`
- `/api/progress`
- `/api/reviews`
- `/api/assignments`
- `/api/authoring`

---

## 6. Technologies Used

### Frontend

- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- Lucide React
- Recharts

### Simulation and Logic

- Matter.js
- custom validation helpers
- custom report generator
- evidence builder

### Backend and Database

- Next.js API routes
- MongoDB
- Mongoose
- custom cookie-based auth helpers

### Testing

- Vitest

---

## 7. Strength of the Documentation

This documentation is written from the actual implemented system and supports:

- academic submission
- supervisor review
- presentation preparation
- viva explanation

It reflects the project as it currently exists, including the newer:

- assignment workflow
- review module
- progress tracking
- authoring studio
- showcase dashboard

---

## 8. Conclusion

SimuLab is no longer only a virtual lab page collection. It has developed into a broader learning platform that combines:

- simulation
- tutorial support
- persistence
- validation
- evidence
- review
- assignment management
- authorable module definitions

This makes it suitable not only for implementation assessment, but also for strong documentation, presentation, and viva discussion.

