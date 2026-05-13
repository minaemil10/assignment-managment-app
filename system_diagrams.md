# System Architecture Diagrams

This document contains the core architectural diagrams for the Assignment Management System. Because these are written in Mermaid.js, you can view them directly in your IDE (if you have a markdown preview plugin) or by pasting this file into a GitHub repository.

## 1. Use Case Diagram
This outlines the primary actors in the system and their allowed interactions.

```mermaid
flowchart LR
    %% Actors
    Admin(["Admin"])
    Coord(["Coordinator"])
    Student(["Student"])

    %% Use Cases
    subgraph AMS["Assignment Management System"]
        UC1("Manage Users & Roles")
        UC2("Manage Departments & Terms")
        UC3("Manage Course Catalog")
        
        UC4("Request Coordinator Access")
        UC5("Approve/Reject Requests")
        
        UC6("Create/Edit Assignments")
        UC7("Set Deadline Overrides")
        
        UC8("Enroll in Courses")
        UC9("View Dashboard/Deadlines")
        UC10("Mark Assignments as Done")
    end

    %% Connections
    Admin --> UC1
    Admin --> UC2
    Admin --> UC3
    Admin --> UC5

    Student --> UC4
    Student --> UC8
    Student --> UC9
    Student --> UC10

    Coord --> UC6
    Coord --> UC7
    Coord --> UC9
    
    %% Coordinator is a user, they also enroll/take courses in some contexts, but mostly manage
```

## 2. Class / Entity-Relationship Diagram
This illustrates the database schema and the relationships between the core data models.

```mermaid
classDiagram
    class User {
        +Int id
        +String name
        +String email
        +String password_hash
        +Role role
        +Boolean is_active
        +Int department_id
    }

    class Department {
        +Int id
        +String name
    }

    class Term {
        +Int id
        +Int level
        +Int number
        +Int department_id
    }

    class Course {
        +Int id
        +String code
        +String name
        +Boolean is_elective
        +Int term_id
        +Int department_id
    }

    class Assignment {
        +Int id
        +String title
        +String description
        +DateTime original_deadline
        +String resource_link
        +String submission_link
        +Int course_id
    }

    class DeadlineOverride {
        +Int id
        +DateTime override_deadline
        +Int assignment_id
        +Int section_id
        +Int lab_group_id
    }

    class Submission {
        +Int id
        +Boolean is_done
        +DateTime submitted_at
        +Int user_id
        +Int assignment_id
    }
    
    class Enrollment {
        +Int id
        +Int user_id
        +Int course_id
        +Int section_id
        +Int lab_group_id
    }

    %% Relationships
    Department "1" <-- "many" User : Belongs to
    Department "1" <-- "many" Term : Contains
    Department "1" <-- "many" Course : Belongs to
    Term "1" <-- "many" Course : Included in
    
    Course "1" <-- "many" Assignment : Has
    Course "1" <-- "many" Enrollment : Has
    
    User "1" <-- "many" Enrollment : Has
    User "1" <-- "many" Submission : Makes
    
    Assignment "1" <-- "many" Submission : Receives
    Assignment "1" <-- "many" DeadlineOverride : Has
```

## 3. Sequence Diagram
This demonstrates the chronological flow of a Student viewing their dashboard and marking an assignment as done.

```mermaid
sequenceDiagram
    actor Student
    participant UI as Frontend App
    participant API as Next.js API (/api/student)
    participant DB as MySQL Database

    Student->>UI: Navigates to Dashboard
    UI->>API: GET /api/student/dashboard
    
    API->>DB: Fetch Enrollments for User
    DB-->>API: Returns Enrolled Courses
    
    API->>DB: Fetch Assignments for Enrolled Courses
    DB-->>API: Returns Assignments
    
    API->>DB: Fetch Overrides (Section/Lab match)
    DB-->>API: Returns Overrides
    
    API->>API: Calculate Resolved Deadlines
    API-->>UI: JSON (Assignments + Status)
    
    UI-->>Student: Displays Dashboard UI
    
    Student->>UI: Clicks "Mark Done"
    UI->>API: POST /api/student/submissions { assignment_id }
    
    API->>DB: Insert/Update Submission (is_done = true)
    DB-->>API: Success
    
    API-->>UI: 200 OK
    UI-->>Student: Updates UI to Completed State
```

## 4. Activity Diagram
This flowchart maps the logical decision process for calculating the **True (Resolved) Deadline** of an assignment for a specific student.

```mermaid
flowchart TD
    Start([Start: Fetch Assignment for Student]) --> Q1{Does an Override exist?}
    
    Q1 -- Yes --> Q2{Does Override match Student's Section?}
    Q1 -- No --> Base[Use Original Assignment Deadline]
    
    Q2 -- Yes --> UseSec[Use Section Override Deadline]
    Q2 -- No --> Q3{Does Override match Student's Lab Group?}
    
    Q3 -- Yes --> UseLab[Use Lab Group Override Deadline]
    Q3 -- No --> Base
    
    UseSec --> Compare{Is Lab Override also present?}
    Compare -- Yes --> Q3
    Compare -- No --> FinalSec[Final Deadline = Section Override]
    
    UseLab --> FinalLab[Final Deadline = Lab Override]
    Base --> FinalBase[Final Deadline = Original Deadline]
    
    FinalSec --> End([Display on Dashboard])
    FinalLab --> End
    FinalBase --> End
```

## 5. State Machine Diagram
This shows the lifecycle states of an `Assignment` relative to a student's `Submission`.

```mermaid
stateDiagram-v2
    [*] --> Pending : Assignment Created

    Pending --> DueSoon : Time < 24h to Deadline
    Pending --> Completed : Student Marks Done
    
    DueSoon --> Overdue : Deadline Passes
    DueSoon --> Completed : Student Marks Done
    
    Overdue --> Completed : Student Marks Done (Late)
    
    Completed --> [*]
```
