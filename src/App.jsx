import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom'
import { AuthProvider, useAuth } from './context/AuthContext'
import { SocketProvider } from './context/SocketContext'
import { NotificationProvider } from './context/NotificationContext'
import { ToastProvider } from './components/common/Toast'
import DashboardLayout from './layouts/DashboardLayout'
import LoadingSpinner from './components/common/LoadingSpinner'

// ── Public ────────────────────────────────────────────────────
const LandingPage         = lazy(() => import('./pages/public/LandingPage'))
const Login               = lazy(() => import('./pages/auth/Login'))
const Register            = lazy(() => import('./pages/auth/Register'))
const ForgotPassword      = lazy(() => import('./pages/auth/ForgotPassword'))
const ResetPassword       = lazy(() => import('./pages/auth/ResetPassword'))
const VerifyEmail         = lazy(() => import('./pages/auth/VerifyEmail'))

// ── Doctor ────────────────────────────────────────────────────
const DoctorDashboard     = lazy(() => import('./pages/doctor/DoctorDashboard'))
const DoctorActivity      = lazy(() => import('./pages/doctor/DoctorActivity'))       // FIX 5
const DoctorAppointments  = lazy(() => import('./pages/doctor/DoctorAppointments'))
const DoctorPatients      = lazy(() => import('./pages/doctor/DoctorPatients'))
const DoctorPrescriptions = lazy(() => import('./pages/doctor/DoctorPrescriptions'))
const DoctorMessages      = lazy(() => import('./pages/doctor/DoctorMessages'))       // FIX 1
const DoctorVideo         = lazy(() => import('./pages/doctor/DoctorVideo'))          // FIX 2

// ── Patient ───────────────────────────────────────────────────
const PatientDashboard    = lazy(() => import('./pages/patient/PatientDashboard'))
const PatientHealth       = lazy(() => import('./pages/patient/PatientHealth'))        // FIX 4
const BookAppointment     = lazy(() => import('./pages/patient/BookAppointment'))
const PatientAppointments = lazy(() => import('./pages/patient/PatientAppointments'))
const PatientPrescriptions= lazy(() => import('./pages/patient/PatientPrescriptions'))
const PatientDocuments    = lazy(() => import('./pages/patient/PatientDocuments'))     // FIX 3
const PatientMessages     = lazy(() => import('./pages/patient/PatientMessages'))      // FIX 1
const PatientVideo        = lazy(() => import('./pages/patient/PatientVideo'))         // FIX 2
const PatientProfile      = lazy(() => import('./pages/shared/Profile'))

// ── Admin ─────────────────────────────────────────────────────
const AdminDashboard      = lazy(() => import('./pages/admin/AdminDashboard'))
const AdminUsers          = lazy(() => import('./pages/admin/AdminUsers'))
const AdminAppointments   = lazy(() => import('./pages/admin/AdminAppointments'))
const AdminAuditLogs      = lazy(() => import('./pages/admin/AdminAuditLogs'))
const AdminAnalytics      = lazy(() => import('./pages/admin/AdminAnalytics'))

// ── Shared ────────────────────────────────────────────────────
const NotificationsPage   = lazy(() => import('./pages/shared/Notifications'))
const Settings            = lazy(() => import('./pages/shared/Settings'))
const SecuritySettings    = lazy(() => import('./pages/shared/SecuritySettings'))

// ── Loading fallback ──────────────────────────────────────────
const PageLoader = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '4rem' }}>
    <LoadingSpinner />
  </div>
)

// ── Guest guard — redirect logged-in users away from /login ───
const RequireGuest = () => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (user)    return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}

// ── Auth guard — redirect unauthenticated to /login ───────────
const RequireAuth = ({ roles }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner fullScreen />
  if (!user)   return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.role)) return <Navigate to={`/${user.role}`} replace />
  return <Outlet />
}

// ── Authenticated shell ───────────────────────────────────────
// Socket + Notification providers only mount AFTER a successful login.
// This prevents unauthenticated API calls (the 401 spam bug).
const AuthenticatedShell = () => (
  <SocketProvider>
    <NotificationProvider>
      <DashboardLayout>
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </DashboardLayout>
    </NotificationProvider>
  </SocketProvider>
)

// ── App ───────────────────────────────────────────────────────
const App = () => (
  <BrowserRouter>
    <AuthProvider>
      <ToastProvider>
        <Suspense fallback={<LoadingSpinner fullScreen />}>
          <Routes>

            {/* Public landing */}
            <Route path="/" element={<LandingPage />} />

            {/* Fully public — no auth check */}
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password"  element={<ResetPassword />} />
            <Route path="/verify-email"    element={<VerifyEmail />} />

            {/* Guest-only */}
            <Route element={<RequireGuest />}>
              <Route path="/login"    element={<Login />} />
              <Route path="/register" element={<Register />} />
            </Route>

            {/* ── Doctor routes ─────────────────────────────── */}
            <Route element={<RequireAuth roles={['doctor']} />}>
              <Route element={<AuthenticatedShell />}>
                <Route path="/doctor"               element={<DoctorDashboard />} />
                <Route path="/doctor/activity"      element={<DoctorActivity />} />
                <Route path="/doctor/appointments"  element={<DoctorAppointments />} />
                <Route path="/doctor/patients"      element={<DoctorPatients />} />
                <Route path="/doctor/prescriptions" element={<DoctorPrescriptions />} />
                <Route path="/doctor/messages"      element={<DoctorMessages />} />
                <Route path="/doctor/video"         element={<DoctorVideo />} />
                <Route path="/doctor/notifications" element={<NotificationsPage />} />
                <Route path="/doctor/settings"      element={<Settings />} />
                <Route path="/doctor/security"      element={<SecuritySettings />} />
              </Route>
            </Route>

            {/* ── Patient routes ────────────────────────────── */}
            <Route element={<RequireAuth roles={['patient']} />}>
              <Route element={<AuthenticatedShell />}>
                <Route path="/patient"               element={<PatientDashboard />} />
                <Route path="/patient/health"        element={<PatientHealth />} />
                <Route path="/patient/book"          element={<BookAppointment />} />
                <Route path="/patient/appointments"  element={<PatientAppointments />} />
                <Route path="/patient/prescriptions" element={<PatientPrescriptions />} />
                <Route path="/patient/documents"     element={<PatientDocuments />} />
                <Route path="/patient/messages"      element={<PatientMessages />} />
                <Route path="/patient/video"         element={<PatientVideo />} />
                <Route path="/patient/notifications" element={<NotificationsPage />} />
                <Route path="/patient/profile"       element={<PatientProfile />} />
                <Route path="/patient/settings"      element={<Settings />} />
                <Route path="/patient/security"      element={<SecuritySettings />} />
              </Route>
            </Route>

            {/* ── Admin routes ──────────────────────────────── */}
            <Route element={<RequireAuth roles={['admin']} />}>
              <Route element={<AuthenticatedShell />}>
                <Route path="/admin"               element={<AdminDashboard />} />
                <Route path="/admin/users"         element={<AdminUsers />} />
                <Route path="/admin/appointments"  element={<AdminAppointments />} />
                <Route path="/admin/audit-logs"    element={<AdminAuditLogs />} />
                <Route path="/admin/analytics"     element={<AdminAnalytics />} />
                <Route path="/admin/notifications" element={<NotificationsPage />} />
                <Route path="/admin/settings"      element={<Settings />} />
                <Route path="/admin/security"      element={<SecuritySettings />} />
              </Route>
            </Route>

            {/* Catch-all — go home, not /login (avoids false logout) */}
            <Route path="*" element={<Navigate to="/" replace />} />

          </Routes>
        </Suspense>
      </ToastProvider>
    </AuthProvider>
  </BrowserRouter>
)

export default App
