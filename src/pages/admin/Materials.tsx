
import { useState, useMemo } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import {
  Search,
  FileStack,
  Download,
  Trash2,
  ExternalLink,
  Filter,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { DeleteConfirm } from '../../components/admin/DeleteConfirm'
import { EmptyState } from '../../components/ui/EmptyState'
import {
  getAllMaterials,
  deleteMaterial,
  getSchools,
  getDepartmentsBySchool,
} from '../../lib/queries'
import { supabase } from '../../lib/supabase'
import { formatDate, formatFileSize } from '../../lib/utils'

interface MaterialRow {
  id: string
  department_id: string
  level: number
  course_code: string
  course_title: string
  file_url: string
  file_name: string
  file_size: number | null
  download_count: number
  uploaded_at: string
  department: {
    id: string
    name: string
    school_id: string
    school: {
      id: string
      short_name: string
    }
  } | null
}

const LEVELS = [100, 200, 300, 400, 500]

export default function Materials() {
  const qc = useQueryClient()

  const [search, setSearch] = useState('')
  const [schoolFilter, setSchoolFilter] = useState('')
  const [deptFilter, setDeptFilter] = useState('')
  const [levelFilter, setLevelFilter] = useState<number | ''>('')

  const [pendingDelete, setPendingDelete] = useState<MaterialRow | null>(null)

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: getSchools,
  })

  const { data: departments } = useQuery({
    queryKey: ['departments', schoolFilter],
    queryFn: () => getDepartmentsBySchool(schoolFilter),
    enabled: !!schoolFilter,
  })

  const { data, isLoading, error } = useQuery({
    queryKey: ['materials', 'all'],
    queryFn: async (): Promise<MaterialRow[]> => {
      const { data, error } = await supabase
        .from('materials')
        .select(
          `
          id, department_id, level, course_code, course_title,
          file_url, file_name, file_size, download_count, uploaded_at,
          department:departments (
            id, name, school_id,
            school:schools ( id, short_name )
          )
        `
        )
        .order('uploaded_at', { ascending: false })
      if (error) throw error
      return (data ?? []) as unknown as MaterialRow[]
    },
  })

  const deleteMutation = useMutation({
    mutationFn: async (row: MaterialRow) => {
      // Delete DB row
      await deleteMaterial(row.id)
      // Best-effort delete file from storage
      try {
        const url = new URL(row.file_url)
        const idx = url.pathname.indexOf('/materials/')
        if (idx !== -1) {
          const path = decodeURIComponent(url.pathname.slice(idx + 11))
          await supabase.storage.from('materials').remove([path])
        }
      } catch {
        // ignore storage errors — DB row already removed
      }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['materials'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })
      setPendingDelete(null)
    },
  })

  const filtered = useMemo(() => {
    if (!data) return []
    const q = search.trim().toLowerCase()
    return data.filter((m) => {
      if (q) {
        const hit =
          m.course_code.toLowerCase().includes(q) ||
          m.course_title.toLowerCase().includes(q)
        if (!hit) return false
      }
      if (schoolFilter && m.department?.school?.id !== schoolFilter) return false
      if (deptFilter && m.department_id !== deptFilter) return false
      if (levelFilter && m.level !== levelFilter) return false
      return true
    })
  }, [data, search, schoolFilter, deptFilter, levelFilter])

  const hasFilters = !!(search || schoolFilter || deptFilter || levelFilter)

  function clearFilters() {
    setSearch('')
    setSchoolFilter('')
    setDeptFilter('')
    setLevelFilter('')
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-start justify-between gap-4 mb-6 flex-wrap">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Materials</h1>
            <p className="text-sm text-gray-500 mt-1">
              {data?.length ?? 0} total · {filtered.length} shown
            </p>
          </div>
          {hasFilters && (
            <button
              onClick={clearFilters}
              className="text-sm text-brand-600 hover:text-brand-700 font-medium"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl border border-gray-100 p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search
              size={16}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search course code or title"
              className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
            />
          </div>

          <select
            value={schoolFilter}
            onChange={(e) => {
              setSchoolFilter(e.target.value)
              setDeptFilter('')
            }}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          >
            <option value="">All schools</option>
            {schools?.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name}
              </option>
            ))}
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            disabled={!schoolFilter}
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none disabled:bg-gray-50 disabled:text-gray-400"
          >
            <option value="">All departments</option>
            {departments?.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
              </option>
            ))}
          </select>

          <select
            value={levelFilter}
            onChange={(e) =>
              setLevelFilter(e.target.value ? Number(e.target.value) : '')
            }
            className="w-full px-3 py-2 text-sm rounded-lg border border-gray-200 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
          >
            <option value="">All levels</option>
            {LEVELS.map((l) => (
              <option key={l} value={l}>
                {l} Level
              </option>
            ))}
          </select>
        </div>

        {isLoading && (
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="h-16 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            title="Failed to load"
            description="Could not load materials. Refresh and try again."
          />
        )}

        {!isLoading && !error && data && data.length === 0 && (
          <EmptyState
            icon={<FileStack size={28} />}
            title="No materials yet"
            description="Upload your first material to see it here."
          />
        )}

        {!isLoading && filtered.length === 0 && data && data.length > 0 && (
          <EmptyState
            icon={<Filter size={28} />}
            title="No matches"
            description="Try adjusting your filters."
          />
        )}

        {!isLoading && filtered.length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 border-b border-gray-100 bg-gray-50/50">
                    <th className="font-medium px-4 py-3">Course</th>
                    <th className="font-medium px-4 py-3 hidden md:table-cell">
                      Department
                    </th>
                    <th className="font-medium px-4 py-3 text-right">Level</th>
                    <th className="font-medium px-4 py-3 text-right hidden sm:table-cell">
                      Size
                    </th>
                    <th className="font-medium px-4 py-3 text-right hidden lg:table-cell">
                      Downloads
                    </th>
                    <th className="font-medium px-4 py-3 text-right hidden lg:table-cell">
                      Uploaded
                    </th>
                    <th className="font-medium px-4 py-3 text-right">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((m) => (
                    <tr
                      key={m.id}
                      className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                    >
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">
                          {m.course_code}
                        </div>
                        <div className="text-xs text-gray-500 truncate max-w-[220px]">
                          {m.course_title}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-gray-600 hidden md:table-cell">
                        {m.department ? (
                          <>
                            {m.department.school.short_name} ·{' '}
                            {m.department.name}
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700">
                        {m.level}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500 hidden sm:table-cell">
                        {formatFileSize(m.file_size)}
                      </td>
                      <td className="px-4 py-3 text-right text-gray-700 hidden lg:table-cell">
                        {m.download_count}
                      </td>
                      <td className="px-4 py-3 text-right text-xs text-gray-500 hidden lg:table-cell">
                        {formatDate(m.uploaded_at)}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-end gap-1">
                          <a
                            href={m.file_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-lg text-gray-500 hover:text-brand-600 hover:bg-brand-50 transition-colors"
                            aria-label="Open file"
                          >
                            <ExternalLink size={16} />
                          </a>
                          <button
                            onClick={() => setPendingDelete(m)}
                            className="p-2 rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                            aria-label="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <DeleteConfirm
        open={!!pendingDelete}
        title="Delete this material?"
        description={
          pendingDelete
            ? `${pendingDelete.course_code} — ${pendingDelete.course_title} will be permanently removed.`
            : ''
        }
        confirming={deleteMutation.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => pendingDelete && deleteMutation.mutate(pendingDelete)}
      />
    </AdminLayout>
  )
}
