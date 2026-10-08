import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
      <h1 className="text-6xl font-bold text-brand-700 mb-4">404</h1>
      <p className="text-gray-600 mb-6">Page not found</p>
      <Link
        to="/"
        className="bg-brand-500 hover:bg-brand-600 text-white px-6 py-3 rounded-lg font-medium"
      >
        Back to Home
      </Link>
    </div>
  )
}
