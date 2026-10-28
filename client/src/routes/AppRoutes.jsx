import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import MainLayout from '../layouts/MainLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Route Guards
import ProtectedRoute from './ProtectedRoute';

// Pages
import LandingPage from '../pages/LandingPage';
import RegisterPage from '../pages/RegisterPage';
import LoginPage from '../pages/LoginPage';
import ServicesPage from '../pages/ServicesPage';
import ServiceDetailPage from '../pages/ServiceDetailPage';
import UserDashboardPage from '../pages/UserDashboardPage';
import BookAppointmentPage from '../pages/BookAppointmentPage';
import BookingConfirmationPage from '../pages/BookingConfirmationPage';
import QueueTrackingPage from '../pages/QueueTrackingPage';
import MyAppointmentsPage from '../pages/MyAppointmentsPage';
import ProfilePage from '../pages/ProfilePage';

// Staff Pages
import StaffDashboardPage from '../pages/StaffDashboardPage';
import StaffQueuePage from '../pages/StaffQueuePage';

// Admin Pages
import AdminDashboardPage from '../pages/AdminDashboardPage';
import AdminServicesPage from '../pages/AdminServicesPage';
import AdminStaffPage from '../pages/AdminStaffPage';
import AdminAppointmentsPage from '../pages/AdminAppointmentsPage';
import AdminAnalyticsPage from '../pages/AdminAnalyticsPage';
import AdminUsersPage from '../pages/AdminUsersPage';

// Utility Pages
import UnauthorizedPage from '../pages/UnauthorizedPage';
import NotFoundPage from '../pages/NotFoundPage';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* 1. Public & Informational Routes (MainLayout) */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/services" element={<ServicesPage />} />
        <Route path="/services/:id" element={<ServiceDetailPage />} />
        <Route path="/queue/live" element={<QueueTrackingPage />} />
        <Route path="/queue/:serviceId" element={<QueueTrackingPage />} />
        <Route path="/unauthorized" element={<UnauthorizedPage />} />
      </Route>

      {/* 2. Authenticated Dashboard Routes (DashboardLayout) */}
      <Route
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        {/* Student / Universal Authenticated Routes */}
        <Route path="/dashboard" element={<UserDashboardPage />} />
        <Route path="/book" element={<BookAppointmentPage />} />
        <Route path="/confirmation/:bookingReference" element={<BookingConfirmationPage />} />
        <Route path="/appointments" element={<MyAppointmentsPage />} />
        <Route path="/profile" element={<ProfilePage />} />

        {/* Staff Protected Routes */}
        <Route
          path="/staff"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/staff/queue"
          element={
            <ProtectedRoute allowedRoles={['staff', 'admin']}>
              <StaffQueuePage />
            </ProtectedRoute>
          }
        />

        {/* Administrator Protected Routes */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/services"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminServicesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/staff"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminStaffPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/appointments"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAppointmentsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminAnalyticsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <AdminUsersPage />
            </ProtectedRoute>
          }
        />
      </Route>

      {/* 3. 404 Catch-All Route */}
      <Route element={<MainLayout />}>
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
};

export default AppRoutes;
