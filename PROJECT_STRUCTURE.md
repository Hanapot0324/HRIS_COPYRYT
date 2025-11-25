# HRIS System - Project Structure and API Documentation

## Table of Contents

1. [Project Structure](#project-structure)
2. [API Endpoints](#api-endpoints)
   - [Authentication](#authentication)
   - [Users](#users)
   - [Dashboard](#dashboard)
   - [Department Management](#department-management)
   - [Tasks](#tasks)
   - [System Settings](#system-settings)
   - [Payroll](#payroll)
   - [Leave Management](#leave-management)
   - [Attendance](#attendance)
   - [Documents](#documents)
   - [Performance Reviews](#performance-reviews)
   - [Training and Development](#training-and-development)
3. [Database Schema](#database-schema)
4. [Environment Variables](#environment-variables)
5. [Setup Instructions](#setup-instructions)

## Project Structure

```
HRIS_CPRT/
├── backend/                    # Backend server
│   ├── config/                 # Configuration files
│   │   ├── database.js         # Database configuration
│   │   ├── email.js            # Email service configuration
│   │   └── passport.js         # Authentication configuration
│   │
│   ├── dashboardRoutes/        # Dashboard related routes
│   │   ├── Attendance.js       # Attendance management
│   │   ├── Children.js         # Dependents management
│   │   ├── College.js          # Education management
│   │   ├── Department.js       # Department management
│   │   ├── Employee.js         # Employee management
│   │   ├── Employment.js       # Employment details
│   │   ├── Government.js       # Government records
│   │   ├── History.js          # Employee history
│   │   ├── Leave.js            # Leave management
│   │   ├── Personal.js         # Personal information
│   │   ├── Training.js         # Training records
│   │   └── Work.js             # Work experience
│   │
│   ├── middleware/             # Custom middleware
│   │   ├── auth.js             # Authentication middleware
│   │   └── upload.js           # File upload handling
│   │
│   ├── payrollRoutes/          # Payroll related routes
│   │   ├── Payroll.js          # Main payroll processing
│   │   ├── PayrollJO.js        # Job order payroll
│   │   ├── PayrollReleased.js  # Released payroll records
│   │   ├── PayrollReg.js       # Regular payroll
│   │   ├── PayrollRegSetup.js  # Regular payroll setup
│   │   └── PayrollSetup.js     # Payroll configuration
│   │
│   ├── routes/                 # Core API routes
│   │   ├── auth.js             # Authentication routes
│   │   ├── users.js            # User management
│   │   ├── settings.js         # System settings
│   │   └── ...
│   │
│   ├── uploads/                # File uploads directory
│   ├── .env                    # Environment variables
│   ├── index.js                # Main server file
│   └── package.json            # Backend dependencies
│
├── frontend/                   # React frontend
│   ├── public/                 # Static files
│   │   └── Logo.png            # Application logo
│   │
│   └── src/
│       ├── assets/             # Static assets
│       ├── components/         # Reusable components
│       ├── contexts/           # React contexts
│       ├── App.js              # Main App component
│       ├── index.js            # Entry point
│       └── index.css           # Global styles
│
├── node_modules/               # Node.js dependencies
├── .gitignore                  # Git ignore file
├── AUTHENTICATION_FIXES.md     # Authentication documentation
├── earist_hris (11).sql        # Database schema
├── package.json                # Root package.json
└── README.md                   # Project documentation
```

## API Endpoints

### Authentication

| Method | Endpoint                  | Description               | Authentication         |
| ------ | ------------------------- | ------------------------- | ---------------------- |
| POST   | /api/auth/register        | Register a new user       | Public                 |
| POST   | /api/auth/login           | User login                | Public                 |
| POST   | /api/auth/refresh-token   | Refresh access token      | Requires refresh token |
| POST   | /api/auth/logout          | User logout               | Authenticated          |
| POST   | /api/auth/forgot-password | Request password reset    | Public                 |
| POST   | /api/auth/reset-password  | Reset password with token | Public                 |

### Users

| Method | Endpoint                        | Description                 | Authentication   |
| ------ | ------------------------------- | --------------------------- | ---------------- |
| GET    | /api/users                      | Get all users               | Admin/HR         |
| POST   | /api/users                      | Create new user             | Admin/HR         |
| GET    | /api/users/:employeeNumber      | Get user by employee number | Authenticated    |
| PUT    | /api/users/:employeeNumber      | Update user                 | Admin/HR or Self |
| DELETE | /api/users/:employeeNumber      | Delete user                 | Admin            |
| PUT    | /api/users/:employeeNumber/role | Update user role            | Admin            |
| POST   | /api/users/excel-import         | Bulk import users           | Admin/HR         |

### Dashboard

| Method | Endpoint                                      | Description                 | Authentication |
| ------ | --------------------------------------------- | --------------------------- | -------------- |
| GET    | /api/dashboard/stats                          | Get dashboard statistics    | Authenticated  |
| GET    | /api/dashboard/attendance-overview            | Get attendance overview     | Authenticated  |
| GET    | /api/dashboard/department-distribution        | Get department distribution | Authenticated  |
| GET    | /api/dashboard/leave-stats                    | Get leave statistics        | Authenticated  |
| GET    | /api/dashboard/recent-activities              | Get recent activities       | Authenticated  |
| GET    | /api/dashboard/payroll-summary                | Get payroll summary         | HR/Admin       |
| GET    | /api/dashboard/employee-stats/:employeeNumber | Get employee stats          | Authenticated  |

### Department Management

| Method | Endpoint                       | Description                | Authentication |
| ------ | ------------------------------ | -------------------------- | -------------- |
| GET    | /api/department-table          | Get all departments        | Authenticated  |
| POST   | /api/department-table          | Create department          | Admin/HR       |
| GET    | /api/department-table/:id      | Get department by ID       | Authenticated  |
| PUT    | /api/department-table/:id      | Update department          | Admin/HR       |
| DELETE | /api/department-table/:id      | Delete department          | Admin          |
| GET    | /api/department-assignment     | Get department assignments | Authenticated  |
| POST   | /api/department-assignment     | Create assignment          | Admin/HR       |
| PUT    | /api/department-assignment/:id | Update assignment          | Admin/HR       |
| DELETE | /api/department-assignment/:id | Delete assignment          | Admin          |

### Tasks

| Method | Endpoint              | Description            | Authentication   |
| ------ | --------------------- | ---------------------- | ---------------- |
| GET    | /api/tasks            | Get all tasks          | Authenticated    |
| POST   | /api/tasks            | Create task            | Authenticated    |
| PUT    | /api/tasks/:id/toggle | Toggle task completion | Task Owner       |
| DELETE | /api/tasks/:id        | Delete task            | Task Owner/Admin |

### System Settings

| Method | Endpoint                   | Description              | Authentication |
| ------ | -------------------------- | ------------------------ | -------------- |
| GET    | /api/system-settings       | Get all settings         | Admin          |
| GET    | /api/system-settings/:key  | Get setting by key       | Admin          |
| PUT    | /api/system-settings       | Update multiple settings | Admin          |
| PUT    | /api/system-settings/:key  | Update single setting    | Admin          |
| DELETE | /api/system-settings/:key  | Delete setting           | Admin          |
| POST   | /api/system-settings/reset | Reset to defaults        | Admin          |
| GET    | /api/settings              | Get application settings | Authenticated  |
| POST   | /api/settings              | Update settings          | Admin          |

### Payroll

| Method | Endpoint                              | Description          | Authentication |
| ------ | ------------------------------------- | -------------------- | -------------- |
| GET    | /api/payroll                          | Get payroll records  | HR/Admin       |
| POST   | /api/payroll                          | Process payroll      | HR/Admin       |
| GET    | /api/payroll/:id                      | Get payroll by ID    | HR/Admin       |
| PUT    | /api/payroll/:id                      | Update payroll       | HR/Admin       |
| DELETE | /api/payroll/:id                      | Delete payroll       | Admin          |
| GET    | /api/payroll/employee/:employeeNumber | Get employee payroll | Authenticated  |
| POST   | /api/payroll/generate-payslip         | Generate payslip     | HR/Admin       |

### Leave Management

| Method | Endpoint                            | Description            | Authentication |
| ------ | ----------------------------------- | ---------------------- | -------------- |
| GET    | /api/leave                          | Get all leave requests | Authenticated  |
| POST   | /api/leave                          | Create leave request   | Authenticated  |
| GET    | /api/leave/:id                      | Get leave by ID        | Owner/HR/Admin |
| PUT    | /api/leave/:id                      | Update leave request   | Owner/HR/Admin |
| PUT    | /api/leave/:id/status               | Update leave status    | HR/Admin       |
| GET    | /api/leave/employee/:employeeNumber | Get employee leaves    | Owner/HR/Admin |

### Attendance

| Method | Endpoint                                 | Description             | Authentication |
| ------ | ---------------------------------------- | ----------------------- | -------------- |
| POST   | /api/attendance/check-in                 | Check in                | Authenticated  |
| POST   | /api/attendance/check-out                | Check out               | Authenticated  |
| GET    | /api/attendance                          | Get attendance records  | Authenticated  |
| GET    | /api/attendance/employee/:employeeNumber | Get employee attendance | Owner/HR/Admin |
| GET    | /api/attendance/summary                  | Get attendance summary  | HR/Admin       |

## Database Schema

### Users

- id (PK)
- employee_number (Unique)
- email
- password_hash
- first_name
- last_name
- role (enum: admin, hr, employee, manager)
- department_id (FK)
- position
- hire_date
- status (active/inactive)
- created_at
- updated_at

### Departments

- id (PK)
- name
- code
- manager_id (FK to Users)
- created_at
- updated_at

### Leave Requests

- id (PK)
- user_id (FK)
- leave_type (enum)
- start_date
- end_date
- reason
- status (pending/approved/rejected)
- approved_by (FK to Users)
- created_at
- updated_at

### Payroll

- id (PK)
- user_id (FK)
- basic_salary
- allowances
- deductions
- tax
- net_salary
- payment_date
- status (pending/paid/cancelled)
- created_at
- updated_at

## Environment Variables

```
# Server
NODE_ENV=development
PORT=5000

# Database
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=yourpassword
DB_NAME=hris_db

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRE=30d
JWT_COOKIE_EXPIRE=30

# Email
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_EMAIL=your@email.com
SMTP_PASSWORD=yourpassword
EMAIL_FROM=HRIS <noreply@example.com>

# Frontend
FRONTEND_URL=http://localhost:3000
```

## Setup Instructions

1. Clone the repository
2. Install dependencies:

   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

3. Set up the database:

   - Create a new MySQL database
   - Import the database schema from `database/schema.sql`
   - Update the database configuration in `backend/.env`

4. Start the development servers:

   ```bash
   # Start backend server
   cd backend
   npm run dev

   # In a new terminal, start frontend
   cd frontend
   npm start
   ```

5. Access the application at `http://localhost:3000`

## API Documentation

For detailed API documentation including request/response examples, please refer to the [API Documentation](docs/API.md).

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
