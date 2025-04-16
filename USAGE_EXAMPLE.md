# Project Management System with Time Tracking - Usage Guide

This document provides an overview of how to use the Project Management System with Time Tracking features.

## User Roles

The system supports three user roles with different permissions and access levels:

1. **Admin** - Full access to all features and data
2. **Manager** - Can manage projects, tasks, team members, and approve leave requests
3. **Employee** - Can track time, manage tasks, and submit leave requests

## Login Credentials

Use the following sample credentials to access the system:

- **Admin**: Username: `admin`, Password: `admin123`
- **Manager**: Username: `manager`, Password: `manager123`
- **Employee**: Username: `employee`, Password: `employee123`

## Key Features

### Time Tracking
- Clock in and clock out to track working hours
- View time entries history and reports
- Add notes to time entries

### Task Management
- Create, assign, and manage tasks
- Track task status and progress
- Associate tasks with projects or keep them standalone

### Project Management
- Create and manage projects
- Assign team members to projects
- Track project deadlines and progress

### Leave Management
- Submit leave requests with date range and reason
- View leave history and status
- Managers can approve or reject leave requests

### Team Management
- View team member information
- Track individual and team productivity
- Monitor team member availability

### Reporting
- Generate reports on time tracking, tasks, and projects
- Visualize data with charts and graphs
- Filter and export report data

## Feature Navigation

### For Employees
1. **Dashboard**: Overview of recent activities, current tasks, and time tracking
2. **Time Tracking**: Clock in/out and manage time entries
3. **My Tasks**: View and manage assigned tasks
4. **Leave Requests**: Submit and track leave requests

### For Managers
1. **Dashboard**: Overview of team performance, project status, and pending approvals
2. **Projects**: Create and manage projects
3. **Team**: View and manage team members
4. **Reports**: Generate and view reports
5. **Leave Approvals**: Approve or reject leave requests

## Leave Management System

The Leave Management System allows employees to request time off and managers to approve or reject these requests.

### For Employees
1. Navigate to **Leave Requests** in the sidebar
2. Click **Request Leave** button
3. Fill in the form with:
   - Leave type (Annual, Sick, Unpaid, etc.)
   - Start and end dates
   - Reason for leave (optional)
4. Submit the request
5. Track the status of your requests (Pending, Approved, Rejected)
6. Cancel pending requests if needed

### For Managers
1. Navigate to **Leave Approvals** in the sidebar
2. View all pending leave requests
3. Review leave request details
4. Approve or reject requests
5. Add comments to provide feedback

## Technical Implementation

The system is built with:
- Frontend: React with TailwindCSS and Shadcn UI components
- Backend: Express.js with PostgreSQL database
- Authentication: Passport.js with session-based auth
- Data access: Drizzle ORM for database operations

## Development Notes

- The system uses role-based access control for security
- PostgreSQL database stores all persistent data
- API endpoints are secured with authentication middleware
- UI adapts responsively to different screen sizes