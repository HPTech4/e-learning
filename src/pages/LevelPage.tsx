import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Download, Search } from 'lucide-react'
import { useState } from 'react'
import { Layout } from '../components/layout/Layout'
import {
  getSchoolBySlug,
  getDepartmentBySlug,
  getMaterialsByDepartmentAndLevel,
} from '../lib/queries'
import { LevelTabs } from '../components/LevelTabs'
import { MaterialRow } from '../components/MaterialRow'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle' 

export default function LevelPage() {
   
  const { schoolSlug = '', deptSlug = '', level = '' } = useParams()
  const levelNum = Number(level)
  const [filter, setFilter] = useState('')

  const { data: school } = useQuery({
    queryKey: ['school', schoolSlug],
    queryFn: () => getSchoolBySlug(schoolSlug),
  })

  const { data: department } = useQuery({
    queryKey: ['department', school?.id, deptSlug],
    queryFn: () => getDepartmentBySlug(school!.id, deptSlug),
    enabled: !!school?.id,
  })

  const { data: materials, isLoading } = useQuery({
    queryKey: ['materials', department?.id, levelNum],
    queryFn: () => getMaterialsByDepartmentAndLevel(department!.id, levelNum),
    enabled: !!department?.id && !!levelNum,
  })

  usePageTitle(`${department?.name} ${levelNum}L`)

  const filtered = materials?.filter((m) => {
    const q = filter.trim().toLowerCase()
    if (!q) return true
    return (
      m.course_code.toLowerCase().includes(q) ||
      m.course_title.toLowerCase().includes(q)
    )
  })

  if (!school || !department) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <EmptyState title="Not found" description="Check the URL." />
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <Link
          to={`/school/${school.slug}/${department.slug}`}
          className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-brand-600 mb-6"
        >
          <ArrowLeft size={16} />
          {department.name}
        </Link>

        <div className="mb-6">
          <p className="text-xs font-semibold text-brand-600 uppercase tracking-wider mb-1">
            {school.short_name} &middot; {department.name}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            {levelNum} Level Materials
          </h1>
        </div>

        <div className="mb-6">
          <LevelTabs
            schoolSlug={school.slug}
            deptSlug={department.slug}
            activeLevel={levelNum}
          />
        </div>

        {materials && materials.length > 0 && (
          <div className="relative mb-5">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              placeholder="Filter by course code or title"
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
            />
          </div>
        )}

        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {!isLoading && materials && materials.length === 0 && (
          <EmptyState
            icon={<FileText size={28} />}
            title="No materials yet"
            description={`No materials have been uploaded for ${levelNum} Level in ${department.name}. Check back later.`}
          />
        )}

        {!isLoading && filtered && filtered.length === 0 && materials && materials.length > 0 && (
          <EmptyState
            icon={<Search size={28} />}
            title="No matches"
            description={`Nothing matches "${filter}". Try a different course code.`}
          />
        )}

        {filtered && filtered.length > 0 && (
          <div className="space-y-3">
            {filtered.map((m) => (
              <MaterialRow key={m.id} material={m} />
            ))}
          </div>
        )}

        {materials && materials.length > 0 && (
          <div className="mt-6 text-center text-xs text-gray-400 inline-flex items-center gap-1.5 w-full justify-center">
            <Download size={12} />
            {materials.length} material{materials.length === 1 ? '' : 's'} available
          </div>
        )}
      </div>
    </Layout>
  )
}
