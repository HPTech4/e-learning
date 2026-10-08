import { Link } from 'react-router-dom'
import { Home, Compass, GraduationCap } from 'lucide-react'
import { Layout } from '../components/layout/Layout'

export default function NotFound() {
  return (
    <Layout>
      <div className="max-w-lg mx-auto px-6 py-20 text-center">
        <div className="w-16 h-16 mx-auto rounded-full bg-brand-50 flex items-center justify-center mb-6">
          <Compass size={28} className="text-brand-600" />
        </div>

        <p className="text-sm font-semibold text-brand-600 uppercase tracking-wider mb-2">
          404
        </p>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">
          Page not found
        </h1>
        <p className="text-sm text-gray-500 mb-8 max-w-sm mx-auto">
          The page you're looking for doesn't exist. It may have been moved or
          the URL was typed incorrectly.
        </p>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 text-white text-sm font-medium transition-colors"
          >
            <Home size={16} />
            Go home
          </Link>
          <Link
            to="/browse"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg bg-white border border-gray-200 hover:border-brand-300 text-gray-700 text-sm font-medium transition-colors"
          >
            <GraduationCap size={16} />
            Browse schools
          </Link>
        </div>
      </div>
    </Layout>
  )
}
