import { Routes, Route } from 'react-router-dom'
import { ProtectedRoute } from './routes/ProtectedRoute'
import Home from './pages/Home'
import Browse from './pages/Browse'
import SchoolPage from './pages/SchoolPage'
import DepartmentPage from './pages/DepartmentPage'
import LevelPage from './pages/LevelPage'
import SearchResults from './pages/SearchResults'
import NotFound from './pages/NotFound'
import AdminLogin from './pages/admin/Login'
import AdminDashboard from './pages/admin/Dashboard'
import AdminUpload from './pages/admin/Upload'
import AdminMaterials from './pages/admin/Materials'

export default function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Home />} />
      <Route path="/browse" element={<Browse />} />
      <Route path="/school/:schoolSlug" element={<SchoolPage />} />
      <Route path="/school/:schoolSlug/:deptSlug" element={<DepartmentPage />} />
      <Route path="/school/:schoolSlug/:deptSlug/:level" element={<LevelPage />} />
      <Route path="/search" element={<SearchResults />} />

      {/* Admin */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/upload"
        element={
          <ProtectedRoute>
            <AdminUpload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/materials"
        element={
          <ProtectedRoute>
            <AdminMaterials />
          </ProtectedRoute>
        }
      />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}
