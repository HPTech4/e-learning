import { Routes, Route, Link } from 'react-router-dom'

function Home() {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-brand-700 mb-4">
          FUT Minna E-Library
        </h1>
        <p className="text-gray-600 mb-6">Setup complete. Ready to build.</p>
        <Link
          to="/admin/login"
          className="inline-block bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium"
        >
          Admin Login
        </Link>
      </div>
    </div>
  )
}

function AdminLogin() {
  return (
    <div className="min-h-screen bg-brand-50 flex items-center justify-center p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-brand-700">Admin Login</h1>
        <p className="text-gray-600 mt-2">Coming next.</p>
        <Link to="/" className="text-brand-500 underline mt-4 inline-block">
          ← Back home
        </Link>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/admin/login" element={<AdminLogin />} />
    </Routes>
  )
}
