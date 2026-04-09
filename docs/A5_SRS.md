# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Project Name

**SimuLab: Virtual Lab and Concept Learning Platform**

### 1.2 Problem Statement

Many school and college students struggle to understand scientific and mathematical concepts because:

- physical lab resources are limited
- some experiments are expensive or risky
- abstract formulas are hard to visualize
- students often memorize results without understanding cause and effect

SimuLab addresses this problem by providing a browser-based learning platform where students can:

- run virtual experiments
- visualize concepts dynamically
- follow guided tutorials
- save progress
- generate reports
- receive instructor feedback

### 1.3 Objectives

The main objectives of the system are:

- provide an interactive alternative to physical lab-only learning
- improve concept understanding through visualization and simulation
- allow teachers to assign and review learning activities
- store progress, reports, and evidence in a structured way
- support future expansion through an authoring workflow

### 1.4 Scope

The system includes:

- user authentication
- role-based access control
- lab simulation pages
- tutorial content pages
- progress tracking
- report and evidence generation
- assignment management
- instructor review
- concept authoring studio
- showcase dashboard for demo and viva

The system does not currently aim to replace real physical laboratory assessment completely.  
It is designed as a teaching, practice, and support platform.

---

## 2. Users and Stakeholders

### 2.1 Student

Students can:

- register and log in
- open tutorials
- open labs
- save and continue lab work
- generate and edit reports
- submit completed lab work
- view assignments
- track their own progress

### 2.2 Teacher

Teachers can:

- create assignments from tutorials and labs
- assign work to students or class groups
- review submitted experiments
- give feedback
- use the authoring studio to add new concept definitions
- use the showcase dashboard during presentation or demonstration

### 2.3 Admin

Admins can:

- do everything teachers can do
- manage student records
- access admin dashboard features
- control sensitive operations with higher privilege

### 2.4 Supervisor / Evaluator

Supervisors and evaluators are indirect stakeholders who judge:

- educational value
- engineering quality
- documentation quality
- demo readiness

---

## 3. Functional Requirements

### 3.1 Authentication and Access Control

The system shall:

- allow user registration
- allow user login and logout
- store user role as `student`, `teacher`, or `admin`
- restrict sensitive actions using role-based policies

### 3.2 Tutorial Management

The system shall:

- display tutorial lists by category
- open tutorials by module id
- show chapters and learning objectives
- track tutorial viewing progress
- support physics, chemistry, technology, and math tutorial categories

### 3.3 Lab and Concept Workspace

The system shall:

- open a lab page using a route like `/lab/[experimentId]`
- support save draft, mark completed, and submit actions
- restore saved lab state
- display analysis and evidence panels
- support built-in workbenches and generic authored modules

### 3.4 Experiment Persistence

The system shall:

- save experiment title, description, type, status, and state
- store lab report text
- store validation and evidence-related state
- allow students to continue previously saved work

### 3.5 Progress Tracking

The system shall:

- track tutorial progress
- track lab progress
- track achievements
- store per-user progress in MongoDB
- show progress on the student dashboard

### 3.6 Validation and Evidence

The system shall:

- compare experiment results to theoretical or expected values where supported
- calculate validation summaries
- store validation output with the experiment
- generate evidence-ready data for report and review workflows

### 3.7 Report Workflow

The system shall:

- generate a lab report from available experiment data
- allow editing of the generated report
- save the report with the experiment
- require report existence before final submission

### 3.8 Instructor Review

The system shall:

- allow teacher and admin users to see submitted work
- allow feedback entry
- allow review status updates
- display review results back to the student

### 3.9 Assignment Workflow

The system shall:

- allow teachers/admins to create assignments from labs or tutorials
- allow deadlines to be set
- allow assignment to individual students or grouped classes
- track completion and submission rate
- make assignments visible on the student dashboard

### 3.10 Authoring Studio

The system shall:

- allow teacher/admin to create a new concept definition
- store metadata, controls, formulas, chart settings, tutorial chapters, validation rules, and default state
- save these definitions to MongoDB
- sync tutorial chapters into the tutorial collection
- allow new authored module ids to be used by the lab and assignment workflow

### 3.11 Demo Showcase

The system shall:

- show a presentation-friendly summary of the implemented system
- display major modules and supported domains
- show validation coverage
- show evidence and review information
- show learning analytics based on stored data

---

## 4. Non-Functional Requirements

### 4.1 Usability

The system should:

- be easy to use in a browser
- provide clear navigation for students and instructors
- keep forms and workflows understandable

### 4.2 Performance

The system should:

- load pages within acceptable time in a normal development or deployment environment
- support smooth interaction for browser-based simulation views
- handle repeated saves and dashboard fetches without major lag

### 4.3 Reliability

The system should:

- preserve saved experiment state correctly
- maintain tutorial and progress records in MongoDB
- prevent unauthorized access to restricted features

### 4.4 Maintainability

The system should:

- keep modules separated by route, component, utility, and model
- support gradual extension using experiment definitions and authored concept definitions
- remain understandable for student developers

### 4.5 Security

The system should:

- protect private user actions with authenticated routes
- restrict instructor/admin-only routes
- avoid exposing privileged operations to normal student users

---

## 5. Data Requirements

The main data entities are:

- `User`
- `Experiment`
- `Tutorial`
- `UserProgress`
- `Assignment`
- `ConceptDefinition`

The database must support:

- role-aware account storage
- tutorial content retrieval
- experiment saving and resuming
- progress and achievement storage
- assignment analytics
- instructor review records
- authored module definitions

---

## 6. Constraints

- The system runs on web technologies using Next.js and TypeScript.
- The database uses MongoDB through Mongoose.
- Some advanced experiments still use custom dedicated workbenches.
- Generic authored modules currently use a simpler fallback lab experience than the hand-built specialized workbenches.

---

## 7. Success Criteria

The project will be considered successful if:

- students can complete learning tasks through labs and tutorials
- teachers can assign and review work
- progress is stored correctly
- evidence and reports are available for demonstration
- new modules can be introduced through the authoring workflow
- the system is explainable and presentable during viva

