DROP TABLE IF EXISTS coordinator_requests CASCADE;
DROP TABLE IF EXISTS student_submissions CASCADE;
DROP TABLE IF EXISTS assignment_overrides CASCADE;
DROP TABLE IF EXISTS assignments CASCADE;
DROP TABLE IF EXISTS enrollments CASCADE;
DROP TABLE IF EXISTS lab_groups CASCADE;
DROP TABLE IF EXISTS sections CASCADE;
DROP TABLE IF EXISTS course_coordinators CASCADE;
DROP TABLE IF EXISTS courses CASCADE;
DROP TABLE IF EXISTS terms CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS departments CASCADE;

DROP TYPE IF EXISTS user_role CASCADE;
DROP TYPE IF EXISTS assignment_type CASCADE;
DROP TYPE IF EXISTS request_status CASCADE;

CREATE TYPE user_role AS ENUM ('STUDENT', 'COORDINATOR', 'ADMIN');
CREATE TYPE assignment_type AS ENUM ('LAB', 'SHEET', 'QUIZ', 'MIDTERM', 'FINAL_PROJECT', 'OTHER');
CREATE TYPE request_status AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

CREATE TABLE departments (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE
);

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'STUDENT',
    department_id INTEGER REFERENCES departments(id),
    term INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE terms (
    id SERIAL PRIMARY KEY,
    number INTEGER NOT NULL,
    level INTEGER NOT NULL,
    department_id INTEGER REFERENCES departments(id)
);

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    code VARCHAR(50) NOT NULL,
    name VARCHAR(255) NOT NULL,
    is_elective BOOLEAN DEFAULT FALSE,
    term_id INTEGER REFERENCES terms(id),
    department_id INTEGER REFERENCES departments(id)
);

CREATE TABLE course_coordinators (
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    PRIMARY KEY (course_id, user_id)
);

CREATE TABLE sections (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE lab_groups (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL
);

CREATE TABLE enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id),
    lab_group_id INTEGER REFERENCES lab_groups(id),
    enrolled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE assignments (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    type assignment_type NOT NULL,
    description TEXT,
    due_date TIMESTAMP NOT NULL,
    resource_link VARCHAR(255),
    submission_link VARCHAR(255),
    team_size INTEGER DEFAULT 1
);

CREATE TABLE assignment_overrides (
    id SERIAL PRIMARY KEY,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    section_id INTEGER REFERENCES sections(id) ON DELETE CASCADE,
    due_date TIMESTAMP NOT NULL
);

CREATE TABLE student_submissions (
    id SERIAL PRIMARY KEY,
    student_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    assignment_id INTEGER REFERENCES assignments(id) ON DELETE CASCADE,
    is_done BOOLEAN DEFAULT FALSE,
    marked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE coordinator_requests (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status request_status DEFAULT 'PENDING',
    reviewed_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
