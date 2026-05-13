# 🎓 University Assignment Management System (AMS)

![Next.js](https://img.shields.io/badge/Next.js-15-black)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-v4-38bdf8)

A professional, role-based web application designed to replace fragmented Google Sheets for tracking university assignments. This system centralizes academic deadlines across departments and levels, offering precision tracking for students and flexible management for coordinators.

---

## Quick Start (Local Demo)

Follow these steps to get the system running on your local machine in under 2 minutes.

### 1. Prerequisites
Ensure you have [Docker Desktop](https://www.docker.com/products/docker-desktop/) and [Node.js 20+](https://nodejs.org/) installed.

### 2. Environment Setup
Create a `.env` file in the root directory:
```env
DATABASE_URL="postgresql://ams_user:ams_password@localhost:5432/ams_db"
NEXTAUTH_SECRET="your-random-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

### 3. Launching the System
```bash
# Start the PostgreSQL database
docker-compose up -d

# Install dependencies
npm install

# Start the development server
npm run dev
```
The application will be live at **http://localhost:3000**.

---

## 🛠 Tech Stack & Architecture
- **Frontend & Backend:** Next.js 15 (App Router) for a unified Full-Stack architecture.
- **Database:** PostgreSQL for robust relational data management.
- **Data Access:** Raw SQL via the `pg` driver (No ORM for maximum control and performance).
- **Authentication:** NextAuth.js with JWT strategy and Credentials provider.
- **Styling:** Tailwind CSS v4 for a modern, utility-first responsive UI.

---

## ✨ Features by Role

###  Student Module (End-User Experience)
- **Course Catalog:** Browse academic offerings by Department and Term.
- **Self-Enrollment:** Direct enrollment into specific Sections and Lab Groups.
- **Intelligent Dashboard:** View assignments with "Resolved Deadlines" (calculating default vs. section overrides).
- **Urgency Indicators:** Visual badges (Red/Amber) based on real-time deadline proximity.
- **Completion Tracking:** Permanent "Mark as Done" functionality to lock finished tasks.

### Coordinator Module (Content Management)
- **Course Overview:** Manage assigned courses and view student enrollment metrics.
- **Assignment Engine:** Create/Edit assignments with default due dates.
- **Deadline Overrides:** Apply per-section exceptions for specific groups without duplicating records.

### Admin Module (Infrastructure)
- **Academic Hierarchy:** Full CRUD for Departments, Terms, Courses, and Sections.
- **User Provisioning:** Approve or reject Coordinator signup requests.
- **Course Assignment:** Link approved Coordinators to their respective academic courses.

---

## 📐 Database Schema Highlights
The system utilizes a high-performance relational schema centered around the **Override Pattern**:
- `assignments` table stores the global default due date.
- `assignment_overrides` stores section-specific exceptions.
- The **Master Query** uses a `LEFT JOIN` and `COALESCE` to resolve the final date for each student, ensuring data integrity and zero duplication.

---

## 📚 Development Methodology (SDLC)
This project was developed strictly following the **Software Development Lifecycle**:
1. **Requirements:** Identified the synchronization issues in university assignment tracking.
2. **Design:** Modeled the system using 5 core UML diagrams (Use Case, Class, Sequence, Activity, State Machine).
3. **Implementation:** Developed using Vertical Feature Slices.
4. **Testing:** Verified through manual unit testing of SQL join logic and integration testing of the enrollment-to-dashboard flow.