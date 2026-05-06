import { createBrowserRouter } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';

// Public
import Home from '../pages/public/Home';
import Login from '../pages/public/Login';
import ForgotPassword from '../pages/public/ForgotPassword';
import ResetPassword from '../pages/public/ResetPassword';
import PublicCourses from '../pages/public/Courses';
import UnderConstruction from '../pages/public/UnderConstruction';

// Student
import StudentDashboard from '../pages/student/Dashboard';
import StudentCourses from '../pages/student/Courses';
import StudentCatalog from '../pages/student/Catalog';
import StudentCertificates from '../pages/student/Certificates';
import CoursePlayer from '../pages/student/CoursePlayer';
import StudentLiveSessions from '../pages/student/LiveSessions';

// Trainer
import TrainerDashboard from '../pages/trainer/Dashboard';
import TrainerCourses from '../pages/trainer/Courses';
import TrainerLiveSessions from '../pages/trainer/LiveSessions';
import TrainerStudents from '../pages/trainer/Students';
import TrainerCurriculum from '../pages/trainer/Curriculum';

// Admin
import AdminDashboard from '../pages/admin/Dashboard';
import AdminCourses from '../pages/admin/Courses';
import AdminCategories from '../pages/admin/Categories';
import AdminUsers from '../pages/admin/Users';
import AdminAssessments from '../pages/admin/Assessments';
import AdminCurriculum from '../pages/admin/Curriculum';
import AdminFeedbacks from '../pages/admin/Feedbacks';
import AdminStudents from '../pages/admin/Students';
import ResetRequests from '../pages/admin/ResetRequests';

// Shared
import Profile from '../pages/shared/Profile';

import ErrorBoundary from '../components/ErrorBoundary';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <MainLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      { index: true, element: <Home /> },
      { path: 'courses', element: <PublicCourses /> },
      { path: 'under-construction', element: <UnderConstruction /> },
    ],
  },
  {
    path: '/login',
    element: <Login />,
    errorElement: <ErrorBoundary />
  },

  {
    path: '/forgot-password',
    element: <ForgotPassword />,
    errorElement: <ErrorBoundary />
  },
  {
    path: '/reset-password',
    element: <ResetPassword />,
    errorElement: <ErrorBoundary />
  },

  {
    path: '/student',
    element: <ProtectedRoute allowedRoles={['student']} />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <StudentDashboard /> },
          { path: 'browse', element: <StudentCatalog /> },
          { path: 'courses', element: <StudentCourses /> },
          { path: 'live-sessions', element: <StudentLiveSessions /> },
          { path: 'certificates', element: <StudentCertificates /> },
          { path: 'profile', element: <Profile /> }
        ]
      },
      // Course player is full-screen — no sidebar/nav layout
      { path: 'course/:id', element: <CoursePlayer /> },
    ]
  },
  {
    path: '/trainer',
    element: <ProtectedRoute allowedRoles={['trainer']} />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <TrainerDashboard /> },
          { path: 'courses', element: <TrainerCourses /> },
          { path: 'students', element: <TrainerStudents /> },
          { path: 'live-sessions', element: <TrainerLiveSessions /> },
          { path: 'assessments', element: <AdminAssessments /> },
          { path: 'profile', element: <Profile /> }
        ]
      },
      // Full-screen trainer preview
      { path: 'course/:id', element: <TrainerCurriculum /> }
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute allowedRoles={['admin']} />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { index: true, element: <AdminDashboard /> },
          { path: 'categories', element: <AdminCategories /> },
          { path: 'courses', element: <AdminCourses /> },
          { path: 'users', element: <AdminUsers /> },
          { path: 'students', element: <AdminStudents /> },
          { path: 'assessments', element: <AdminAssessments /> },
          { path: 'feedbacks', element: <AdminFeedbacks /> },
          { path: 'reset-requests', element: <ResetRequests /> },
        ]
      }
    ]
  },
  // Shared Management Protected Routes
  {
    path: '/manage',
    element: <ProtectedRoute allowedRoles={['admin', 'trainer']} />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
          { path: 'course/:courseId', element: <AdminCurriculum /> }
        ]
      }
    ]
  }
]);
