import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import {
  getSchoolBySlug,
  getDepartmentBySlug,
} from '../lib/queries'
import { LevelTabs } from '../components/LevelTabs'
import { EmptyState } from '../components/ui/EmptyState'

export default function DepartmentPage() {
  const { schoolSlug = '', deptSlug = '' } = useParams()

  const { data: school, isLoading: loadingSchool } = useQuery({
    queryKey: ['school', schoolSlug],
    queryFn: () => getSchoolBySlug(schoolSlug),
  })

  const { data: department, isLoading: loadingDept } = useQuery({
    queryKey: ['department', school?.id, deptSlug],
    queryFn: () => getDepartmentBySlug(school!.id, deptSlug),
    enabled: !!school?.id,
  })

  if (loadingSchool || loadingDept) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <div className="h-8 w-64 bg-gray-100 rounded animate-pulse mb-3" />
          <div className="h-4 w-48 bg-gray-100 rounded animate-pulse" />
        </div>
      </Layout>
    )
  }

  if (!school || !department) {
    return (
      <Layout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
          <EmptyState
            title="Department not found"
            description="That department does not exist."
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
          to={`/school/${school.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6"
        >
          <ArrowLeft size={16} />
          {school.short_name}
        </Link>

        <div className="mb-8">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            {school.short_name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {department.name}
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Choose a level to view its materials.
          </p>
        </div>

        <LevelTabs schoolSlug={school.slug} deptSlug={department.slug} />
      </div>
    </Layout>
  )
}
