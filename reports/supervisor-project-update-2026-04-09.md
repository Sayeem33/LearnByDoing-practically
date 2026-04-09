# SimuLab Project Update Report
Prepared for Supervisor Project Update Day

Date: 9 April 2026
Prepared by: Sumon Ahmed
Project: LearnByDoing Practically / SimuLab Virtual Science Laboratory

## 1. Executive Summary
SimuLab is a web-based virtual laboratory platform designed to support practical learning in physics, chemistry, and mathematics. The project has progressed from an initial simulation prototype into a broader learning system that now includes interactive experiment workbenches, guided tutorials, student and instructor workflows, assignment distribution, report generation, evidence capture, and review support.

At the current stage, the project is functioning as an integrated academic software system rather than only a single simulation demo. The verified local codebase currently includes 18 built-in experiment definitions across three subject areas, role-based dashboards, MongoDB-backed tutorial and content management, instructor authoring support, and an automated validation and reporting pipeline for lab activities.

The latest verification on 9 April 2026 shows that the automated test suite is passing and the production build completes successfully. This indicates that the project is in a stable and demonstrable condition for supervisor review, while still leaving room for user testing, analytics expansion, and deployment hardening in the next phase.

## 2. Project Objective
The main objective of this project is to create an interactive digital laboratory where students can learn scientific concepts through simulation, observation, analysis, and reporting. Instead of treating the application as only a content viewer, the system is designed to support the full learning cycle:

- concept introduction through tutorials
- experiment execution in an interactive lab workspace
- live data collection and graphing
- comparison between measured and theoretical values
- report generation and submission
- instructor review and feedback

This objective is especially useful for practical classes where access to physical laboratory resources may be limited, repeated experimentation is necessary, or students need guided preparation before attending real lab sessions.

## 3. Methodology
The project has followed an iterative, modular, and evidence-driven software engineering methodology. The development process was not handled as a single monolithic implementation. Instead, the system was expanded in stages, with each stage adding a usable layer of academic value.

### 3.1 Requirement Identification
The first step was to identify the needs of the primary stakeholders:

- students need clear theory, interactive experimentation, visual feedback, and simple report generation
- instructors need content control, assignment management, submission review, and progress visibility
- administrators need controlled access, student management, and maintainable data workflows

These requirements led to the decision to build a multi-role web application rather than a standalone simulator.

### 3.2 Modular System Design
The system was decomposed into separate modules so that simulation, interface, persistence, and analytics could evolve independently. The current architecture combines:

- a Next.js frontend for the user interface and navigation
- TypeScript for safer application logic and maintainability
- simulation engines for real-time practical activities
- MongoDB for persistent storage of users, tutorials, assignments, experiments, and progress
- API routes for server-side data access and workflow control

This modular strategy reduced coupling and made it possible to add newer features such as tutorials, assignments, and authored concept definitions without rewriting the full platform.

### 3.3 Iterative Feature Development
Development has been carried out in increments. The major progression pattern has been:

- build a simulation or academic workflow
- verify the behavior locally
- add persistence and reporting support
- expose the workflow through dashboard pages and API routes
- document the feature for presentation and future maintenance

This approach helped the project move from a narrow proof of concept toward a more complete educational platform.

### 3.4 Data-Driven and Extensible Content Workflow
An important methodological decision was to avoid locking all future content into hardcoded UI only. The project now supports MongoDB-backed tutorials and authored concept definitions, which means learning content and even new module definitions can be added or updated with much less redevelopment effort.

This improves scalability because the platform can grow beyond the original set of experiments while preserving a consistent workflow for tutorials, lab sessions, assignments, and reporting.

### 3.5 Verification and Validation Method
The project uses both technical testing and academic validation:

- automated test coverage is used for route logic, library logic, and experiment-related behavior
- production build verification is used to confirm application readiness
- experiment validation compares measured values with theoretical expectations for supported modules
- evidence summaries and lab report generation create traceable academic artifacts for review

This methodology ensures that the platform is evaluated not only as software, but also as a learning tool with measurable outcomes.

## 4. Implementation Progress
The project has expanded into several functional areas. The most important completed or working areas are listed below.

### 4.1 Interactive Experiment Layer
The platform includes built-in experiment definitions spanning multiple domains:

| Area | Current Built-in Coverage |
| --- | --- |
| Physics | 8 modules |
| Chemistry | 6 modules |
| Mathematics | 4 modules |
| Total built-in experiment definitions | 18 |

These modules are supported by workbench components for simulation, controls, graphing, and data presentation. The codebase currently contains 22 workbench-related components, reflecting a broad practical scope rather than a single-lab prototype.

### 4.2 Tutorials and Guided Learning
The tutorial layer extends the platform beyond experimentation. MongoDB-backed tutorials allow students to read learning objectives, prerequisites, chapter content, examples, and formulas before opening a lab. This supports a blended learning model in which theory and practical activity are connected inside the same system.

### 4.3 Student and Instructor Workflows
The project now includes role-based dashboards and management flows for:

- student access and progress
- instructor dashboard actions
- student management and authentication
- assignment creation and tracking
- instructor review queue
- showcase and presentation pages for demonstrations

This means the project has moved into a usable educational workflow, not only a technical simulation exercise.

### 4.4 Reporting, Evidence, and Review
The platform includes a report generation pipeline that can summarize experiment metadata, captured results, setup state, key metrics, and validation outcomes. Evidence generation and review support help instructors evaluate practical work more systematically.

This part of the implementation is important for academic settings because it connects simulation activity with assessment and supervisor-visible deliverables.

## 5. Codebase Snapshot on 9 April 2026
The following snapshot summarizes the current working version of the project as inspected directly from the repository:

| Metric | Observed Status |
| --- | --- |
| Framework | Next.js 14 with TypeScript |
| Persistence | MongoDB with Mongoose |
| API route files | 18 |
| Built-in experiment definitions | 18 |
| Workbench-related components | 22 |
| Automated test files | 17 |
| Passing tests | 62 out of 62 |
| Production build | Successful |

Recent development activity also shows active expansion in the instructor-facing part of the platform, including assignment workflows, authoring support, showcase pages, and support for generic MongoDB-authored modules.

## 6. Key Engineering Decisions
Several engineering decisions significantly improved the project quality and long-term usefulness.

### 6.1 Real-Time Simulation with Validation Support
The project is not limited to animation. It incorporates measured outputs, theory-aware validation, and report generation, which makes it more valuable for practical education and outcome-based evaluation.

### 6.2 Role-Based Platform Structure
Separating student, teacher, and admin responsibilities reduced access conflicts and made the platform more suitable for real classroom use.

### 6.3 Content Extensibility
The addition of authored concept definitions and database-backed tutorials reduces dependence on future hardcoded changes. This design supports growth in both subject coverage and content maintenance.

### 6.4 Integrated Evidence Pipeline
By linking saved experiment state, result statistics, validation summaries, lab reports, and review records, the system creates a much stronger academic workflow than a simulation-only application.

## 7. Challenges Addressed
The project has required solutions to several practical software engineering challenges:

- maintaining stable simulation behavior while handling real-time updates
- linking simulation state, charts, and UI controls in a responsive way
- preserving scientific meaning through validation rules and measured output summaries
- designing content workflows that remain editable and scalable over time
- supporting multiple user roles without mixing permissions

The current implementation shows meaningful progress on each of these challenges. In particular, the project now demonstrates both technical depth and academic workflow awareness.

## 8. Current Assessment
At this stage, the project can be described as a stable and feature-rich academic prototype with strong functional breadth. It already demonstrates:

- multi-domain practical learning support
- end-to-end student learning flow
- instructor-facing management and review capabilities
- automated testing and build verification
- a foundation for future extensibility

The project is therefore suitable for supervisor update presentation, internal demonstration, and continued refinement toward final submission or deployment.

## 9. Limitations and Remaining Work
Although the current state is strong, some areas still require further work before the system can be considered fully mature:

- broader user testing with real students and instructors
- expansion of validation rules across all available modules
- refinement of analytics and performance reporting
- deployment hardening, monitoring, and security review
- continued polishing of authored content workflows

These are normal next-step tasks for a project that has already reached a functional and demonstrable milestone.

## 10. Next Phase Plan
The short-term next phase should focus on the following priorities:

- conduct supervised user testing sessions and collect feedback
- improve the assignment and review workflow using real classroom scenarios
- expand validation coverage for more experiments and authored modules
- finalize presentation material and sample datasets for demonstrations
- prepare the system for a cleaner deployment and evaluation environment

This next phase will help move the project from a strong prototype into a more complete educational product.

## 11. Conclusion
The project has progressed significantly beyond its starting point. It now represents a complete virtual lab platform that combines simulation, tutorials, reporting, validation, assignment workflows, and instructor tools in one coherent application.

From a methodology perspective, the most important success has been the use of an iterative and modular development process. That methodology allowed the project to grow in a controlled way while preserving system stability and making room for new educational workflows.

Overall, the current version demonstrates clear progress, practical relevance, and a strong foundation for the next stage of academic and technical development.
