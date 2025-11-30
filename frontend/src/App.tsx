import './App.css'
import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './pages/LoginPage'
import { SignupPage } from './pages/SignupPage'
import { DashboardPage } from './pages/DashboardPage'
import { CalendarPage } from './pages/CalendarPage'
import { FamilyPage } from './pages/FamilyPage'
import { ProfilePage } from './pages/ProfilePage'
import { JournalPage } from './pages/JournalPage'
import { InvitationPage } from './pages/InvitationPage'
import { SetupFamilyPage } from './pages/SetupFamilyPage'
import { SetupChildrenPage } from './pages/SetupChildrenPage'
import { SetupCaregiversPage } from './pages/SetupCaregiversPage'
import { SetupReviewPage } from './pages/SetupReviewPage'
import { LandingPage } from './pages/LandingPage'
import { ProtectedRoute } from './components/ProtectedRoute'
import { useAuth } from './contexts/AuthContext'
import { LoadingSpinner } from './components/LoadingSpinner'

function App() {
  const { loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/invite/:token" element={<InvitationPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/calendar"
        element={
          <ProtectedRoute>
            <CalendarPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/journal"
        element={
          <ProtectedRoute>
            <JournalPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/family"
        element={
          <ProtectedRoute>
            <FamilyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup/family"
        element={
          <ProtectedRoute>
            <SetupFamilyPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup/children"
        element={
          <ProtectedRoute>
            <SetupChildrenPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup/caregivers"
        element={
          <ProtectedRoute>
            <SetupCaregiversPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/setup/review"
        element={
          <ProtectedRoute>
            <SetupReviewPage />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<LandingPage />} />
    </Routes>
  )
}

export default App
