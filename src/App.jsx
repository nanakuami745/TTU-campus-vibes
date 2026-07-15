import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { NotificationProvider } from './context/NotificationContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Feed from './pages/Feed'
import Network from './pages/Network'
import Messages from './pages/Messages'
import Notifications from './pages/Notifications'
import Profile from './pages/Profile'
import ForgotPassword from './pages/ForgotPassword'
import ProtectedRoute from './components/ProtectedRoute'
import AdminLayout from './layouts/AdminLayout'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminModeration from './pages/admin/AdminModeration'
import AdminUsers from './pages/admin/AdminUsers'
import AdminBroadcast from './pages/admin/AdminBroadcast'
import DigitalID from './pages/DigitalID'
import LostFound from './pages/LostFound'
import Jobs from './pages/Jobs'
import CourseFeedback from './pages/CourseFeedback'
import AcademicResources from './pages/AcademicResources'
import AdminJobs from './pages/admin/AdminJobs'
import AdminFeedbackModeration from './pages/admin/AdminFeedbackModeration'
import Attendance from './pages/Attendance'
import AttendanceCheckIn from './pages/AttendanceCheckIn'
import AdminClassReps from './pages/admin/AdminClassReps'
import AdminCourses from './pages/admin/AdminCourses'
import AdminAddStudent from './pages/admin/AdminAddStudent'
import Marketplace from './pages/Marketplace'
import CourseGroups from './pages/CourseGroups'
import CourseGroupDetail from './pages/CourseGroupDetail'

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <div className="min-h-screen bg-slate-50 font-sans text-slate-900">
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            {/* Protected Student Routes */}
            <Route path="/" element={
              <ProtectedRoute>
                <Feed />
              </ProtectedRoute>
            } />
            <Route path="/network" element={
              <ProtectedRoute>
                <Network />
              </ProtectedRoute>
            } />
            <Route path="/messages" element={
              <ProtectedRoute>
                <Messages />
              </ProtectedRoute>
            } />
            <Route path="/notifications" element={
              <ProtectedRoute>
                <Notifications />
              </ProtectedRoute>
            } />
            <Route path="/profile/:userId" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/profile" element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } />
            <Route path="/digital-id" element={
              <ProtectedRoute>
                <DigitalID />
              </ProtectedRoute>
            } />
            <Route path="/lost-found" element={
              <ProtectedRoute>
                <LostFound />
              </ProtectedRoute>
            } />
            <Route path="/jobs" element={
              <ProtectedRoute>
                <Jobs />
              </ProtectedRoute>
            } />
            <Route path="/course-feedback" element={
              <ProtectedRoute>
                <CourseFeedback />
              </ProtectedRoute>
            } />
            <Route path="/academic-resources" element={
              <ProtectedRoute>
                <AcademicResources />
              </ProtectedRoute>
            } />
            <Route path="/marketplace" element={
              <ProtectedRoute>
                <Marketplace />
              </ProtectedRoute>
            } />
            <Route path="/course-groups" element={
              <ProtectedRoute>
                <CourseGroups />
              </ProtectedRoute>
            } />
            <Route path="/course-groups/:groupId" element={
              <ProtectedRoute>
                <CourseGroupDetail />
              </ProtectedRoute>
            } />
            <Route path="/attendance" element={
              <ProtectedRoute>
                <Attendance />
              </ProtectedRoute>
            } />
            <Route path="/attendance/checkin/:sessionId" element={
              <ProtectedRoute>
                <AttendanceCheckIn />
              </ProtectedRoute>
            } />

            {/* Admin Routes */}
            <Route path="/admin" element={
              <ProtectedRoute roleRequired="admin">
                <AdminLayout />
              </ProtectedRoute>
            }>
              <Route index element={<Navigate to="dashboard" replace />} />
              <Route path="dashboard" element={<AdminDashboard />} />
              <Route path="moderation" element={<AdminModeration />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="broadcast" element={<AdminBroadcast />} />
              <Route path="jobs" element={<AdminJobs />} />
              <Route path="feedback" element={<AdminFeedbackModeration />} />
              <Route path="class-reps" element={<AdminClassReps />} />
              <Route path="courses" element={<AdminCourses />} />
              <Route path="add-student" element={<AdminAddStudent />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </NotificationProvider>
    </AuthProvider>
  )
}

export default App
