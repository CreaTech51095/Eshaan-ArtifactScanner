import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { useOfflineSyncContext } from './contexts/OfflineSyncContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import ArtifactListPage from './pages/ArtifactListPage'
import ArtifactCreatePage from './pages/ArtifactCreatePage'
import ArtifactEditPage from './pages/ArtifactEditPage'
import ArtifactDetailPage from './pages/ArtifactDetailPage'
import ScannerPage from './pages/ScannerPage'
import UserProfilePage from './pages/UserProfilePage'
import EditProfilePage from './pages/EditProfilePage'
import ChangePasswordPage from './pages/ChangePasswordPage'
import DeleteAccountPage from './pages/DeleteAccountPage'
import RequestRolePage from './pages/RequestRolePage'
import AdminPanelPage from './pages/AdminPanelPage'
import UserManagementPage from './pages/UserManagementPage'
import LoadingSpinner from './components/common/LoadingSpinner'
import ErrorBoundary from './components/common/ErrorBoundary'
import AppHeader from './components/common/AppHeader'
import OfflineIndicator from './components/common/OfflineIndicator'

function App() {
  const { user, loading } = useAuth()
  const { syncStatus } = useOfflineSyncContext()

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gray-50">
        {user && <AppHeader />}
        {user && (
          <OfflineIndicator 
            showOnlineState={true}
            isSyncing={syncStatus.isSyncing}
            lastSyncAt={syncStatus.lastSyncAt}
            pendingChanges={syncStatus.pendingChanges}
          />
        )}
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/dashboard" replace /> : <LoginPage />} 
          />
          <Route 
            path="/dashboard" 
            element={user ? <DashboardPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/artifacts" 
            element={user ? <ArtifactListPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/artifacts/new" 
            element={user ? <ArtifactCreatePage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/artifacts/:id/edit" 
            element={user ? <ArtifactEditPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/artifacts/:id" 
            element={user ? <ArtifactDetailPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/scanner" 
            element={user ? <ScannerPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile" 
            element={user ? <UserProfilePage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile/edit" 
            element={user ? <EditProfilePage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile/change-password" 
            element={user ? <ChangePasswordPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile/delete" 
            element={user ? <DeleteAccountPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/profile/request-role" 
            element={user ? <RequestRolePage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin" 
            element={user ? <AdminPanelPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/admin/users" 
            element={user ? <UserManagementPage /> : <Navigate to="/login" replace />} 
          />
          <Route 
            path="/" 
            element={<Navigate to={user ? "/dashboard" : "/login"} replace />} 
          />
        </Routes>
      </div>
    </ErrorBoundary>
  )
}

export default App
