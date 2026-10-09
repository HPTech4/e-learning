import { Link, useParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import {
  ArrowLeft,
  FileText,
  Download,
  Search,
  SlidersHorizontal,
  X,
} from 'lucide-react'
import { useState, useMemo } from 'react'
import { Layout } from '../components/layout/Layout'
import {
  getSchoolBySlug,
  getDepartmentBySlug,
  getMaterialsByDepartmentAndLevel,
} from '../lib/queries'
import { LevelTabs } from '../components/LevelTabs'
import { MaterialRow } from '../components/MaterialRow'
import { EmptyState } from '../components/ui/EmptyState'
import { cn } from '../lib/utils'

type SortOption = 'newest' | 'oldest' | 'downloads' | 'code'

export default function LevelPage() {
  const { schoolSlug = '', deptSlug = '', level = '' } = useParams()
  const levelNum = Number(level)

  const [search, setSearch] = useState('')
  const [courseFilter, setCourseFilter] = useState('')
  const [yearFilter, setYearFilter] = useState<number | ''>('')
  const [sort, setSort] = useState<SortOption>('newest')
  const [showFilters, setShowFilters] = useState(false)

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

  // Build unique course codes and years from materials
  const courseCodes = useMemo(() => {
    if (!materials) return []
    const set = new Set(materials.map((m) => m.course_code))
    return Array.from(set).sort()
  }, [materials])

  const years = useMemo(() => {
    if (!materials) return []
    const set = new Set(
      materials.map((m) => new Date(m.uploaded_at).getFullYear())
    )
    return Array.from(set).sort((a, b) => b - a)
  }, [materials])

  // Apply filters + sort
  const filtered = useMemo(() => {
    if (!materials) return []
    let result = materials

    const q = search.trim().toLowerCase()
    if (q) {
      result = result.filter(
        (m) =>
          m.course_code.toLowerCase().includes(q) ||
          m.course_title.toLowerCase().includes(q)
      )
    }

    if (courseFilter) {
      result = result.filter((m) => m.course_code === courseFilter)
    }

    if (yearFilter) {
      result = result.filter(
        (m) => new Date(m.uploaded_at).getFullYear() === yearFilter
      )
    }

    result = [...result]
    result.sort((a, b) => {
      if (sort === 'newest')
        return (
          new Date(b.uploaded_at).getTime() -
          new Date(a.uploaded_at).getTime()
        )
      if (sort === 'oldest')
        return (
          new Date(a.uploaded_at).getTime() -
          new Date(b.uploaded_at).getTime()
        )
      if (sort === 'downloads') return b.download_count - a.download_count
      if (sort === 'code') return a.course_code.localeCompare(b.course_code)
      return 0
    })

    return result
  }, [materials, search, courseFilter, yearFilter, sort])

  const hasActiveFilters =
    !!search || !!courseFilter || !!yearFilter || sort !== 'newest'

  function clearFilters() {
    setSearch('')
    setCourseFilter('')
    setYearFilter('')
    setSort('newest')
  }

  if (!school || !department) {
    return (
      <Layout>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
          <EmptyState title="Not found" description="Check the URL." />
        </div>
      </Layout>
    )
  }

  const totalCount = materials?.length ?? 0
  const shownCount = filtered.length

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

        {/* Filter bar */}
        {totalCount > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 mb-5">
            {/* Search + toggle row */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search
                  size={18}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search course code or title"
                  className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                />
              </div>

              <button
                type="button"
                onClick={() => setShowFilters((v) => !v)}
                className={cn(
                  'shrink-0 inline-flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium border transition-colors',
                  showFilters
                    ? 'bg-brand-50 border-brand-300 text-brand-700'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-brand-300'
                )}
              >
                <SlidersHorizontal size={16} />
                <span className="hidden sm:inline">Filters</span>
              </button>
            </div>

            {/* Extended filters */}
            {showFilters && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4 pt-4 border-t border-gray-100">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Course Code
                  </label>
                  <select
                    value={courseFilter}
                    onChange={(e) => setCourseFilter(e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  >
                    <option value="">All courses</option>
                    {courseCodes.map((code) => (
                      <option key={code} value={code}>
                        {code}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Year
                  </label>
                  <select
                    value={yearFilter}
                    onChange={(e) =>
                      setYearFilter(
                        e.target.value ? Number(e.target.value) : ''
                      )
                    }
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  >
                    <option value="">All years</option>
                    {years.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1.5">
                    Sort by
                  </label>
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
                  >
                    <option value="newest">Newest first</option>
                    <option value="oldest">Oldest first</option>
                    <option value="downloads">Most downloaded</option>
                    <option value="code">Course code A–Z</option>
                  </select>
                </div>
              </div>
            )}

            {/* Active state row */}
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-xs text-gray-500">
                {hasActiveFilters
                  ? `${shownCount} of ${totalCount} shown`
                  : `${totalCount} material${totalCount === 1 ? '' : 's'}`}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="inline-flex items-center gap-1 text-xs font-medium text-brand-600 hover:text-brand-700"
                >
                  <X size={12} />
                  Clear filters
                </button>
              )}
            </div>
          </div>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => (
              <div
                key={i}
                className="h-24 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* No materials at all */}
        {!isLoading && totalCount === 0 && (
          <EmptyState
            icon={<FileText size={28} />}
            title="No materials yet"
            description={`No materials have been uploaded for ${levelNum} Level in ${department.name}. Check back later.`}
          />
        )}

        {/* Filtered to nothing */}
        {!isLoading && totalCount > 0 && shownCount === 0 && (
          <EmptyState
            icon={<Search size={28} />}
            title="No matches"
            description="Try removing a filter or changing your search."
            action={
              <button
                onClick={clearFilters}
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Clear all filters
              </button>
            }
          />
        )}

        {/* Results */}
        {!isLoading && shownCount > 0 && (
          <div className="space-y-3">
            {filtered.map((m) => (
              <MaterialRow key={m.id} material={m} />
            ))}
          </div>
        )}

        {!isLoading && totalCount > 0 && (
          <div className="mt-6 text-center text-xs text-gray-400 inline-flex items-center gap-1.5 w-full justify-center">
            <Download size={12} />
            {shownCount} material{shownCount === 1 ? '' : 's'} available
          </div>
        )}
      </div>
    </Layout>
  )
}
