import { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Cell,
} from 'recharts'
import {
  FileStack,
  Download,
  Building2,
  CalendarPlus,
  Trophy,
  ArrowUpDown,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import { StatCard } from '../../components/admin/StatCard'
import { ChartCard } from '../../components/admin/ChartCard'
import { getDashboardData } from '../../lib/dashboard'
import { formatDate } from '../../lib/utils'
import { cn } from '../../lib/utils'
import { usePageTitle } from '../../hooks/usePageTitle' 

type LevelMetric = 'materials' | 'downloads'
type DeptSortKey = 'name' | 'materials' | 'downloads' | 'lastUpload'

export default function Dashboard() {
  usePageTitle('Dashboard')
  const [levelMetric, setLevelMetric] = useState<LevelMetric>('materials')
  const [deptSort, setDeptSort] = useState<DeptSortKey>('materials')
  const [deptSortAsc, setDeptSortAsc] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['dashboard'],
    queryFn: getDashboardData,
  })

  const sortedDepartments = useMemo(() => {
    if (!data) return []
    const arr = [...data.departmentActivity]
    arr.sort((a, b) => {
      let cmp = 0
      if (deptSort === 'name') cmp = a.name.localeCompare(b.name)
      else if (deptSort === 'materials') cmp = a.materials - b.materials
      else if (deptSort === 'downloads') cmp = a.downloads - b.downloads
      else if (deptSort === 'lastUpload') {
        const at = a.lastUpload ? new Date(a.lastUpload).getTime() : 0
        const bt = b.lastUpload ? new Date(b.lastUpload).getTime() : 0
        cmp = at - bt
      }
      return deptSortAsc ? cmp : -cmp
    })
    return arr
  }, [data, deptSort, deptSortAsc])

  function toggleSort(key: DeptSortKey) {
    if (deptSort === key) setDeptSortAsc((v) => !v)
    else {
      setDeptSort(key)
      setDeptSortAsc(false)
    }
  }

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="h-8 w-48 bg-gray-100 rounded animate-pulse mb-2" />
          <div className="h-4 w-64 bg-gray-100 rounded animate-pulse mb-8" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
            <div className="h-72 rounded-xl bg-gray-100 animate-pulse" />
          </div>
        </div>
      </AdminLayout>
    )
  }

  if (error || !data) {
    return (
      <AdminLayout>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 text-sm text-red-700">
            Failed to load dashboard. Refresh the page to try again.
          </div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-1">
            Library activity and material distribution.
          </p>
        </div>

        {/* Row 1 — Stat cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          <StatCard
            label="Total Materials"
            value={data.totalMaterials}
            icon={FileStack}
            accent="brand"
          />
          <StatCard
            label="Total Downloads"
            value={data.totalDownloads}
            icon={Download}
            accent="green"
          />
          <StatCard
            label="Active Departments"
            value={`${data.activeDepartments} / ${data.totalDepartments}`}
            hint="Departments with uploads"
            icon={Building2}
            accent="brand"
          />
          <StatCard
            label="This Week"
            value={data.uploadsThisWeek}
            hint="Materials uploaded"
            icon={CalendarPlus}
            accent="accent"
          />
          <StatCard
            label="Most Downloaded"
            value={data.mostDownloadedCourse?.course_code ?? '—'}
            hint={
              data.mostDownloadedCourse
                ? `${data.mostDownloadedCourse.download_count} downloads`
                : 'No data yet'
            }
            icon={Trophy}
            accent="accent"
          />
        </div>

        {/* Row 2 — Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard
            title="Materials by School"
            description="Number of files per school"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.materialsBySchool}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={52}
                    tick={{ fontSize: 11, fill: '#374151' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(124, 58, 237, 0.06)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="materials"
                    fill="#7c3aed"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard
            title="Downloads by School"
            description="Total downloads per school"
          >
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.downloadsBySchool}
                  layout="vertical"
                  margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    type="number"
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <YAxis
                    type="category"
                    dataKey="shortName"
                    width={52}
                    tick={{ fontSize: 11, fill: '#374151' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(245, 158, 11, 0.08)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey="downloads"
                    fill="#f59e0b"
                    radius={[0, 4, 4, 0]}
                    barSize={16}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Row 3 — Level distribution */}
        <div className="mb-6">
          <ChartCard
            title="Level Distribution"
            description={
              levelMetric === 'materials'
                ? 'Materials available per level'
                : 'Downloads per level'
            }
            action={
              <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setLevelMetric('materials')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    levelMetric === 'materials'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Materials
                </button>
                <button
                  onClick={() => setLevelMetric('downloads')}
                  className={cn(
                    'px-3 py-1 rounded-md text-xs font-medium transition-colors',
                    levelMetric === 'downloads'
                      ? 'bg-white text-brand-700 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  )}
                >
                  Downloads
                </button>
              </div>
            }
          >
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={data.levelDistribution}
                  margin={{ top: 4, right: 8, left: -8, bottom: 4 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="#f3f4f6"
                  />
                  <XAxis
                    dataKey="level"
                    tick={{ fontSize: 11, fill: '#374151' }}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#6b7280' }}
                  />
                  <Tooltip
                    cursor={{ fill: 'rgba(124, 58, 237, 0.05)' }}
                    contentStyle={{
                      borderRadius: 8,
                      border: '1px solid #e5e7eb',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    dataKey={levelMetric}
                    radius={[4, 4, 0, 0]}
                    barSize={48}
                  >
                    {data.levelDistribution.map((_, i) => (
                      <Cell
                        key={i}
                        fill={levelMetric === 'materials' ? '#7c3aed' : '#f59e0b'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </div>

        {/* Row 4 — Tables */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
          <ChartCard
            title="Top Downloaded"
            description="Top 10 most downloaded materials"
          >
            {data.topDownloaded.length === 0 ? (
              <EmptyRow label="No downloads yet." />
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="font-medium px-2 py-2">Course</th>
                      <th className="font-medium px-2 py-2">Dept</th>
                      <th className="font-medium px-2 py-2 text-right">
                        Downloads
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.topDownloaded.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-2 py-2.5">
                          <div className="font-medium text-gray-900">
                            {m.course_code}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {m.course_title}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-gray-500">
                          {m.school_short} · {m.level}L
                        </td>
                        <td className="px-2 py-2.5 text-right font-semibold text-gray-900">
                          {m.download_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>

          <ChartCard
            title="Recent Uploads"
            description="The 8 most recent materials added"
          >
            {data.recentUploads.length === 0 ? (
              <EmptyRow label="No uploads yet." />
            ) : (
              <div className="-mx-2 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                      <th className="font-medium px-2 py-2">Course</th>
                      <th className="font-medium px-2 py-2">Level</th>
                      <th className="font-medium px-2 py-2 text-right">
                        Added
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.recentUploads.map((m) => (
                      <tr
                        key={m.id}
                        className="border-b border-gray-50 last:border-0"
                      >
                        <td className="px-2 py-2.5">
                          <div className="font-medium text-gray-900">
                            {m.course_code}
                          </div>
                          <div className="text-xs text-gray-500 truncate max-w-[200px]">
                            {m.school_short} · {m.department_name}
                          </div>
                        </td>
                        <td className="px-2 py-2.5 text-xs text-gray-500">
                          {m.level}L
                        </td>
                        <td className="px-2 py-2.5 text-right text-xs text-gray-500">
                          {formatDate(m.uploaded_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </ChartCard>
        </div>

        {/* Row 5 — Department activity */}
        <ChartCard
          title="Department Activity"
          description="Materials and downloads per department"
        >
          <div className="overflow-x-auto -mx-2">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 border-b border-gray-100">
                  <SortHeader
                    label="Department"
                    active={deptSort === 'name'}
                    asc={deptSortAsc}
                    onClick={() => toggleSort('name')}
                  />
                  <th className="font-medium px-2 py-2">School</th>
                  <SortHeader
                    label="Materials"
                    active={deptSort === 'materials'}
                    asc={deptSortAsc}
                    onClick={() => toggleSort('materials')}
                    align="right"
                  />
                  <SortHeader
                    label="Downloads"
                    active={deptSort === 'downloads'}
                    asc={deptSortAsc}
                    onClick={() => toggleSort('downloads')}
                    align="right"
                  />
                  <SortHeader
                    label="Last Upload"
                    active={deptSort === 'lastUpload'}
                    asc={deptSortAsc}
                    onClick={() => toggleSort('lastUpload')}
                    align="right"
                  />
                </tr>
              </thead>
              <tbody>
                {sortedDepartments.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-gray-50 last:border-0 hover:bg-gray-50/60"
                  >
                    <td className="px-2 py-2.5 font-medium text-gray-900">
                      {d.name}
                    </td>
                    <td className="px-2 py-2.5 text-xs text-gray-500">
                      {d.school_short}
                    </td>
                    <td className="px-2 py-2.5 text-right font-semibold text-gray-900">
                      {d.materials}
                    </td>
                    <td className="px-2 py-2.5 text-right text-gray-700">
                      {d.downloads}
                    </td>
                    <td className="px-2 py-2.5 text-right text-xs text-gray-500">
                      {d.lastUpload ? formatDate(d.lastUpload) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ChartCard>
      </div>
    </AdminLayout>
  )
}

function SortHeader({
  label,
  active,
  asc,
  onClick,
  align = 'left',
}: {
  label: string
  active: boolean
  asc: boolean
  onClick: () => void
  align?: 'left' | 'right'
}) {
  return (
    <th
      className={cn(
        'font-medium px-2 py-2 select-none',
        align === 'right' ? 'text-right' : 'text-left'
      )}
    >
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center gap-1 transition-colors',
          active ? 'text-brand-600' : 'text-gray-500 hover:text-gray-800'
        )}
      >
        {label}
        <ArrowUpDown size={11} className={active ? 'opacity-100' : 'opacity-40'} />
      </button>
    </th>
  )
}

function EmptyRow({ label }: { label: string }) {
  return (
    <div className="py-10 text-center text-sm text-gray-400">{label}</div>
  )
}
