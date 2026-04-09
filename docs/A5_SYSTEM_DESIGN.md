# System Design Document

## 1. Design Overview

SimuLab follows a **web application architecture** with:

- a Next.js frontend
- API routes for backend operations
- MongoDB for persistence
- reusable component modules for labs, dashboards, and analytics

The system is designed to remain readable and extendable for a university project, while still supporting real workflows such as saving, reviewing, assigning, and authoring new modules.

---

## 2. High-Level Architecture

```text
Users
  |
  v
Next.js App Router Frontend
  |
  +--> Dashboards
  +--> Tutorials
  +--> Lab Workspace
  +--> Assignment UI
  +--> Review UI
  +--> Authoring Studio
  +--> Demo Showcase
  |
  v
Next.js API Routes
  |
  +--> Auth
  +--> Experiments
  +--> Tutorials
  +--> Progress
  +--> Reviews
  +--> Assignments
  +--> Authoring
  |
  v
MongoDB + Mongoose
```

---

## 3. Main Design Layers

### 3.1 Presentation Layer

This layer contains pages and UI components:

- landing page
- dashboards
- tutorials
- lab pages
- instructor/admin pages
- authoring and showcase pages

It is responsible for:

- rendering forms and cards
- displaying charts and reports
- handling user interaction
- calling backend APIs

### 3.2 Logic Layer

This layer contains:

- simulation helpers
- validation logic
- report generator
- assignment analytics
- experiment definition registry
- progress tracking helpers
- evidence summary generation

It is responsible for:

- preparing reusable calculations
- converting stored data into UI-ready form
- keeping business logic out of page-level code where possible

### 3.3 Data Layer

This layer contains:

- Mongoose models
- MongoDB collections
- API route integration with persistent storage

It is responsible for:

- storing users, tutorials, experiments, progress, assignments, and concept definitions
- retrieving records for dashboards and instructor workflows

---

## 4. Routing Structure

### Core Pages

- `/`
- `/login`
- `/register`
- `/dashboard`
- `/tutorials`
- `/tutorials/[experimentId]`
- `/lab/[experimentId]`
- `/lab/new`

### Instructor/Admin Pages

- `/instructor/dashboard`
- `/admin/dashboard`
- `/instructor/reviews`
- `/instructor/assignments`
- `/instructor/authoring`
- `/instructor/showcase`
- `/students/dashboard`

### API Groups

- `/api/auth/*`
- `/api/experiments`
- `/api/tutorials`
- `/api/progress`
- `/api/reviews`
- `/api/assignments`
- `/api/authoring`
- `/api/students`

---

## 5. Database Design

### 5.1 User

Stores:

- name
- email
- password
- role
- institution
- grade

Purpose:

- authentication
- role-based control
- class grouping for assignments

### 5.2 Experiment

Stores:

- owner user id
- experiment title and description
- category and experiment type
- saved state
- report
- review data
- status

Purpose:

- save and resume lab work
- submission and review workflow
- validation and evidence storage

### 5.3 Tutorial

Stores:

- experiment id
- experiment name
- category
- description
- objectives
- chapters

Purpose:

- guided learning content
- tutorial progress integration

### 5.4 UserProgress

Stores:

- completed steps
- achievements
- tutorial progress
- lab progress
- progress statistics

Purpose:

- student dashboard analytics
- assignment completion analysis

### 5.5 Assignment

Stores:

- title and description
- source type and source id
- due date
- assigned student ids
- assigned classes
- creator information

Purpose:

- teacher/admin assignment workflow
- class and student-level tracking

### 5.6 ConceptDefinition

Stores:

- concept id
- name and category
- description and theory
- controls
- formulas
- chart settings
- tutorial chapters
- validation rules
- default state
- creator information

Purpose:

- MongoDB-backed authoring workflow
- support for new modules without hardcoding

---

## 6. Role-Based Design

### Student

- can view tutorials
- can use labs
- can save and submit own experiment work
- can see assignments and progress

### Teacher

- can create assignments
- can review submissions
- can use authoring studio
- can access showcase dashboard

### Admin

- includes teacher-level privileges
- can manage student records
- can access admin database console features

RBAC is enforced through backend checks before protected actions are executed.

---

## 7. Experiment Design Approach

The system now uses two parallel but connected module approaches:

### 7.1 Built-In Experiment Definitions

These are centrally defined in the experiment definition registry.  
They provide:

- metadata
- controls
- formulas
- charts
- validation rules
- default state

These definitions support existing built-in modules like:

- free fall
- projectile motion
- pendulum
- collision
- chemistry modules
- advanced physics modules
- math concept modules

### 7.2 Authored Concept Definitions

These are created through the authoring studio and stored in MongoDB.  
They allow new concepts to be added with:

- a definition document
- synced tutorial chapters
- assignment availability
- generic lab page support

This design improves scalability without forcing a full redesign.

---

## 8. Key Workflows

### 8.1 Student Lab Workflow

```text
Open lab
 -> interact with workspace
 -> capture data
 -> generate/save report
 -> mark completed
 -> submit
 -> instructor review
```

### 8.2 Tutorial Workflow

```text
Open tutorials list
 -> choose tutorial
 -> move through chapters
 -> progress stored in MongoDB
 -> dashboard progress updated
```

### 8.3 Assignment Workflow

```text
Teacher creates assignment
 -> choose lab or tutorial
 -> choose students/classes
 -> set deadline
 -> student sees assignment on dashboard
 -> progress data updates assignment analytics
```

### 8.4 Authoring Workflow

```text
Teacher/admin opens authoring studio
 -> enters metadata and learning structure
 -> saves concept definition to MongoDB
 -> tutorial content synced
 -> module becomes available by concept id
 -> can be assigned to students
```

---

## 9. Validation and Evidence Design

Validation and evidence are separate but connected:

- **Validation** checks whether measured results match expected or theoretical values.
- **Evidence** packages useful stored output for reporting and review.

This separation makes the system stronger academically because it demonstrates:

- verification of results
- documentation of learning output
- instructor-facing evaluation support

---

## 10. Design Strengths

- clear route-based modular structure
- MongoDB persistence for key learning workflows
- support for multiple user roles
- reusable registry-driven modules
- practical authoring extension path
- dashboard support for monitoring and presentation

---

## 11. Current Limitations

- generic authored modules are simpler than hand-built specialized workbenches
- some validation logic is richer for built-in modules than for newly authored generic modules
- the platform is optimized for educational demonstration and structured learning, not for industrial-scale deployment

These limitations are acceptable for a student software engineering project and are useful discussion points during viva.

