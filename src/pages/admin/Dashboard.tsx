import { AdminLayout } from '../../components/admin/AdminLayout'

export default function Dashboard() {
  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          Full stats coming in Phase 5.
        </p>
      </div>
    </AdminLayout>
  )
}
