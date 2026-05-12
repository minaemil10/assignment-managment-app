// Shared Types for the University Assignment Management System
// These ensure all 3 developers agree on the data shapes, allowing parallel work.

// ---------------------------------------------------------
// DEV 1: Admin & Academic Structure Models
// ---------------------------------------------------------

export interface Department {
  id: number;
  name: string;
}

export interface Term {
  id: number;
  number: number;
  level: number;
  department_id: number | null; // null for prep level
}

export interface Section {
  id: number;
  name: string;
  course_id: number;
}

export interface LabGroup {
  id: number;
  name: string;
  course_id: number;
}

export interface Course {
  id: number;
  code: string;
  name: string;
  is_elective: boolean;
  term_id: number;
  department_id: number | null;
}

export interface CourseWithDetails {
  id: number;
  code: string;
  name: string;
  is_elective: boolean;
  sections: Section[];
  labs: LabGroup[];
}

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'STUDENT' | 'COORDINATOR' | 'ADMIN';
  department_id: number | null;
  term: number | null;
  is_active: boolean;
}

// ---------------------------------------------------------
// DEV 2: Coordinator & Assignment Models
// ---------------------------------------------------------

export interface AssignmentOverride {
  id: number;
  assignment_id: number;
  section_id: number;
  due_date: string; // ISO Date String
}

export interface BaseAssignment {
  id: number;
  course_id: number;
  title: string;
  type: 'LAB' | 'SHEET' | 'QUIZ' | 'MIDTERM' | 'FINAL_PROJECT' | 'OTHER';
  description: string;
  due_date: string; // Default Deadline
  resource_link: string | null;
  submission_link: string | null;
  team_size: number;
  overrides: AssignmentOverride[];
}

// ---------------------------------------------------------
// DEV 3: Student Experience Models
// ---------------------------------------------------------

export interface StudentDashboardItem {
  assignment_id: number;
  title: string;
  course_code: string;
  course_name: string;
  type: string;
  resolved_deadline: string; // The backend calculates if they get the override or default
  is_done: boolean;
  urgency: 'NORMAL' | 'WARNING' | 'OVERDUE'; 
}

export interface Enrollment {
  id: number;
  student_id: number;
  section_id: number;
  lab_group_id: number;
  enrolled_at: string;
}
