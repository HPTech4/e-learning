import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, Building2 } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { getSchoolBySlug, getDepartmentsBySchool } from '../lib/queries'
import { DepartmentCard } from '../components/DepartmentCard'
import { EmptyState } from '../components/ui/EmptyState'

export default function SchoolPage() {
  const { schoolSlug = '' } = useParams()

  const { data: school, isLoading: loadingSchool } = useQuery({
    queryKey: ['school', schoolSlug],
    queryFn: () => getSchoolBySlug(schoolSlug),
  })

  const { data: departments, isLoading: loadingDepts } = useQuery({
    queryKey: ['departments', school?.id],
    queryFn: () => getDepartmentsBySchool(school!.id),
    enabled: !!school?.id,
  })

  if (loadingSchool) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse" />
        </div>
      </Layout>
    )
  }

  if (!school) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <EmptyState
            title="School not found"
            description="That school does not exist in the library."
            action={
              <Link
                to="/browse"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Back to all schools
              </Link>
            }
          />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to="/browse"
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6"
        >
          <ArrowLeft size={16} />
          All schools
        </Link>

        <div className="mb-8">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-brand-600 text-white text-xs font-semibold tracking-wide mb-3">
            {school.short_name}
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {school.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            {departments?.length ?? 0} department
            {departments?.length === 1 ? '' : 's'}
          </p>
        </div>

        {loadingDepts && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-16 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {departments && departments.length === 0 && (
          <EmptyState
            icon={<Building2 size={28} />}
            title="No departments yet"
            description="Departments for this school will appear here."
          />
        )}

        {departments && departments.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {departments.map((d) => (
              <DepartmentCard
                key={d.id}
                department={d}
                schoolSlug={school.slug}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
