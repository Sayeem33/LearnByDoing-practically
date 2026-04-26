# SimuLab Diagram Mermaid Source

Use Mermaid Live Editor, Mermaid CLI, or a Markdown editor with Mermaid support to render these diagrams. Export each as PNG or SVG and insert it into the matching LaTeX figure placeholder.

## 1. Use Case Diagram

```mermaid
flowchart LR
    Student((Student))
    Teacher((Teacher))
    Admin((Admin))
    Evaluator((Supervisor / Evaluator))

    subgraph System[SimuLab Platform]
        UC1[Register / Login]
        UC2[View Dashboard]
        UC3[Study Tutorials]
        UC4[Run Virtual Lab]
        UC5[Save Draft]
        UC6[Generate Lab Report]
        UC7[Submit Experiment]
        UC8[View Assignments]
        UC9[Track Progress]
        UC10[Create Assignment]
        UC11[Review Submission]
        UC12[Give Feedback]
        UC13[Use Authoring Studio]
        UC14[Manage Students]
        UC15[View Showcase Dashboard]
    end

    Student --> UC1
    Student --> UC2
    Student --> UC3
    Student --> UC4
    Student --> UC5
    Student --> UC6
    Student --> UC7
    Student --> UC8
    Student --> UC9

    Teacher --> UC1
    Teacher --> UC2
    Teacher --> UC10
    Teacher --> UC11
    Teacher --> UC12
    Teacher --> UC13
    Teacher --> UC15

    Admin --> UC10
    Admin --> UC11
    Admin --> UC12
    Admin --> UC13
    Admin --> UC14
    Admin --> UC15

    Evaluator --> UC15
```

## 2. Activity Diagram

```mermaid
flowchart TD
    A([Start]) --> B[Open SimuLab]
    B --> C{Authenticated?}
    C -- No --> D[Login or Register]
    D --> E[Create / Verify Session]
    C -- Yes --> E
    E --> F{Role}

    F -- Student --> G[Open Student Dashboard]
    G --> H[Choose Tutorial or Assignment]
    H --> I[Open Lab Workspace]
    I --> J[Adjust Parameters and Run Simulation]
    J --> K[Capture Data and View Charts]
    K --> L[Save Draft]
    L --> M[Generate / Edit Report]
    M --> N{Ready to Submit?}
    N -- No --> J
    N -- Yes --> O[Submit Experiment]
    O --> P[Wait for Instructor Review]

    F -- Teacher/Admin --> Q[Open Instructor Dashboard]
    Q --> R[Create Assignment or Open Review Queue]
    R --> S[Open Submitted Experiment]
    S --> T[Read Report, Validation, Evidence]
    T --> U[Write Feedback]
    U --> V[Approve or Request Changes]

    P --> W([End])
    V --> W
```

## 3. DFD - Level 1

```mermaid
flowchart LR
    Student[Student]
    Teacher[Teacher / Admin]

    P1((Authentication))
    P2((Tutorial and Lab Workspace))
    P3((Progress and Persistence))
    P4((Assignment Management))
    P5((Review and Feedback))
    P6((Authoring Studio))

    D1[(Users)]
    D2[(Tutorials)]
    D3[(Experiments)]
    D4[(UserProgress)]
    D5[(Assignments)]
    D6[(ConceptDefinitions)]

    Student -->|credentials| P1
    Teacher -->|credentials| P1
    P1 --> D1
    D1 --> P1
    P1 -->|session| Student
    P1 -->|session| Teacher

    Student -->|tutorial/lab request| P2
    P2 --> D2
    P2 --> D6
    P2 -->|content and workspace| Student

    Student -->|state, result, report| P3
    P3 --> D3
    P3 --> D4
    D3 --> P3
    D4 --> P3
    P3 -->|saved status and progress| Student

    Teacher -->|assignment data| P4
    P4 --> D5
    D5 --> P4
    P4 -->|assigned work| Student

    Teacher -->|review decision| P5
    P5 --> D3
    D3 --> P5
    P5 -->|feedback| Student

    Teacher -->|concept definition| P6
    P6 --> D6
    P6 --> D2
```

## 4. Control Flow Diagram

```mermaid
flowchart TD
    A[Incoming Page/API Request] --> B{Public Route?}
    B -- Yes --> C[Render Page or Process Public API]
    B -- No --> D[Read Auth Cookie]
    D --> E{Valid Token?}
    E -- No --> F[Redirect to Login / Return 401]
    E -- Yes --> G[Load User Role]
    G --> H{Required Role?}
    H -- Student Allowed --> I[Run Student Operation]
    H -- Teacher/Admin Allowed --> J[Run Instructor Operation]
    H -- Admin Only --> K{Is Admin?}
    K -- No --> L[Return 403 Forbidden]
    K -- Yes --> M[Run Admin Operation]
    I --> N[Read/Write MongoDB]
    J --> N
    M --> N
    N --> O[Return JSON or Render UI]
    C --> O
```

## 5. Class Diagram

```mermaid
classDiagram
    class User {
        +ObjectId _id
        +string name
        +string email
        +string password
        +string role
        +string institution
        +string grade
    }

    class Experiment {
        +ObjectId _id
        +ObjectId userId
        +string title
        +string experimentType
        +string category
        +string status
        +object state
        +array results
        +string labReport
        +object validation
        +object evidence
        +object review
    }

    class Tutorial {
        +ObjectId _id
        +string experimentId
        +string experimentName
        +string category
        +string description
        +array objectives
        +array chapters
    }

    class UserProgress {
        +ObjectId _id
        +ObjectId userId
        +array completedSteps
        +array achievements
        +object tutorialProgress
        +object labProgress
    }

    class Assignment {
        +ObjectId _id
        +string title
        +string sourceType
        +string sourceId
        +date dueDate
        +array assignedStudentIds
        +array assignedClasses
        +ObjectId createdBy
    }

    class ConceptDefinition {
        +ObjectId _id
        +string conceptId
        +string name
        +string category
        +string theory
        +array controls
        +array formulas
        +array charts
        +array tutorialChapters
        +array validationRules
        +object defaultState
        +boolean isPublished
    }

    User "1" --> "many" Experiment : owns
    User "1" --> "1" UserProgress : has
    User "1" --> "many" Assignment : creates
    Assignment "many" --> "many" User : assignedTo
    Tutorial "1" --> "many" Assignment : source
    ConceptDefinition "1" --> "many" Tutorial : syncs
    ConceptDefinition "1" --> "many" Assignment : assignable
```

## 6. Gantt Chart

```mermaid
gantt
    title SimuLab Project Plan
    dateFormat  YYYY-MM-DD
    axisFormat  %d %b

    section Planning
    Problem identification       :done, a1, 2026-01-01, 7d
    Requirement analysis         :done, a2, after a1, 10d
    SRS preparation              :done, a3, after a2, 7d

    section Design
    Architecture design          :done, b1, 2026-01-25, 8d
    Database design              :done, b2, after b1, 6d
    UI and workflow design       :done, b3, after b2, 7d

    section Implementation
    Auth and RBAC                :done, c1, 2026-02-15, 10d
    Lab and tutorial modules     :done, c2, after c1, 20d
    Persistence and progress     :done, c3, after c2, 10d
    Report and validation        :done, c4, after c3, 10d
    Assignment and review        :done, c5, after c4, 10d
    Authoring and showcase       :done, c6, after c5, 8d

    section Testing and Documentation
    Unit and API testing         :done, d1, 2026-03-30, 8d
    User manual and report       :active, d2, after d1, 12d
    Final presentation prep      :d3, after d2, 5d
```

## 7. State Diagram

```mermaid
stateDiagram-v2
    [*] --> Draft
    Draft --> Draft: Save draft
    Draft --> Completed: Mark completed
    Completed --> Submitted: Submit
    Submitted --> PendingReview: Added to review queue
    PendingReview --> Approved: Teacher approves
    PendingReview --> ChangesRequested: Teacher requests changes
    ChangesRequested --> Draft: Student edits report/lab
    Approved --> Archived: Final record stored
    Archived --> [*]
```

## 8. Sequence Diagram

```mermaid
sequenceDiagram
    actor Student
    participant UI as Lab Workspace UI
    participant API as Experiments API
    participant Auth as Auth/RBAC Helper
    participant Val as Validation Service
    participant Ev as Evidence Builder
    participant DB as MongoDB
    actor Teacher
    participant Review as Review Queue UI

    Student->>UI: Run lab and capture data
    UI->>API: Save draft/state/report
    API->>Auth: Verify student session
    Auth-->>API: Authorized
    API->>Val: Build validation summary
    Val-->>API: Validation result
    API->>Ev: Build evidence summary
    Ev-->>API: Evidence result
    API->>DB: Store experiment record
    DB-->>API: Saved experiment id
    API-->>UI: Save success

    Student->>UI: Submit experiment
    UI->>API: Update status to submitted
    API->>Auth: Verify owner/session
    Auth-->>API: Authorized
    API->>DB: Update status and review state
    DB-->>API: Updated record
    API-->>UI: Submitted

    Teacher->>Review: Open review queue
    Review->>API: Request submitted experiments
    API->>Auth: Verify teacher/admin role
    Auth-->>API: Authorized
    API->>DB: Fetch submitted experiments
    DB-->>API: Experiment list
    API-->>Review: Review data
    Teacher->>Review: Add feedback and decision
    Review->>API: Save review
    API->>DB: Update review fields
    DB-->>API: Updated
    API-->>Review: Review saved
```
