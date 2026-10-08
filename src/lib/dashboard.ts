import { supabase } from './supabase'

export type DashboardData = Awaited<ReturnType<typeof getDashboardData>>

interface SchoolRow {
  id: string
  short_name: string
  name: string
}

interface DepartmentRow {
  id: string
  name: string
  slug: string
  school_id: string
}

interface MaterialRow {
  id: string
  department_id: string
  level: number
  course_code: string
  course_title: string
  download_count: number
  uploaded_at: string
}

export async function getDashboardData() {
  const [schoolsRes, departmentsRes, materialsRes] = await Promise.all([
    supabase.from('schools').select('id, short_name, name'),
    supabase.from('departments').select('id, name, slug, school_id'),
    supabase
      .from('materials')
      .select(
        'id, department_id, level, course_code, course_title, download_count, uploaded_at'
      ),
  ])

  if (schoolsRes.error) throw schoolsRes.error
  if (departmentsRes.error) throw departmentsRes.error
  if (materialsRes.error) throw materialsRes.error

  const schools = (schoolsRes.data ?? []) as SchoolRow[]
  const departments = (departmentsRes.data ?? []) as DepartmentRow[]
  const materials = (materialsRes.data ?? []) as MaterialRow[]

  // --- Totals ---
  const totalMaterials = materials.length
  const totalDownloads = materials.reduce(
    (s, m) => s + (m.download_count ?? 0),
    0
  )

  const weekAgo = Date.now() - 7 * 86400000
  const uploadsThisWeek = materials.filter(
    (m) => new Date(m.uploaded_at).getTime() > weekAgo
  ).length

  const deptWithMaterials = new Set(materials.map((m) => m.department_id))
  const activeDepartments = deptWithMaterials.size
  const totalDepartments = departments.length

  // --- Most downloaded course (single top) ---
  const sortedByDownloads = [...materials].sort(
    (a, b) => b.download_count - a.download_count
  )
  const mostDownloadedCourse = sortedByDownloads[0] ?? null

  // --- Materials by school ---
  const deptToSchool = new Map(departments.map((d) => [d.id, d.school_id]))
  const schoolCounts = new Map<string, { materials: number; downloads: number }>()

  for (const s of schools) {
    schoolCounts.set(s.id, { materials: 0, downloads: 0 })
  }

  for (const m of materials) {
    const schoolId = deptToSchool.get(m.department_id)
    if (!schoolId) continue
    const entry = schoolCounts.get(schoolId)
    if (!entry) continue
    entry.materials += 1
    entry.downloads += m.download_count ?? 0
  }

  const materialsBySchool = schools
    .map((s) => ({
      schoolId: s.id,
      shortName: s.short_name,
      name: s.name,
      materials: schoolCounts.get(s.id)?.materials ?? 0,
      downloads: schoolCounts.get(s.id)?.downloads ?? 0,
    }))
    .sort((a, b) => b.materials - a.materials)

  const downloadsBySchool = [...materialsBySchool].sort(
    (a, b) => b.downloads - a.downloads
  )

  // --- Level distribution ---
  const levelCounts: Record<number, { materials: number; downloads: number }> = {
    100: { materials: 0, downloads: 0 },
    200: { materials: 0, downloads: 0 },
    300: { materials: 0, downloads: 0 },
    400: { materials: 0, downloads: 0 },
    500: { materials: 0, downloads: 0 },
  }

  for (const m of materials) {
    const bucket = levelCounts[m.level]
    if (!bucket) continue
    bucket.materials += 1
    bucket.downloads += m.download_count ?? 0
  }

  const levelDistribution = [100, 200, 300, 400, 500].map((level) => ({
    level: `${level}L`,
    materials: levelCounts[level].materials,
    downloads: levelCounts[level].downloads,
  }))

  // --- Top downloaded materials (top 10) ---
  const deptMap = new Map(departments.map((d) => [d.id, d]))
  const schoolMap = new Map(schools.map((s) => [s.id, s]))

  const topDownloaded = sortedByDownloads.slice(0, 10).map((m) => {
    const dept = deptMap.get(m.department_id)
    const school = dept ? schoolMap.get(dept.school_id) : undefined
    return {
      id: m.id,
      course_code: m.course_code,
      course_title: m.course_title,
      level: m.level,
      download_count: m.download_count,
      department_name: dept?.name ?? '—',
      school_short: school?.short_name ?? '—',
    }
  })

  // --- Recent uploads (top 8) ---
  const recentUploads = [...materials]
    .sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    )
    .slice(0, 8)
    .map((m) => {
      const dept = deptMap.get(m.department_id)
      const school = dept ? schoolMap.get(dept.school_id) : undefined
      return {
        id: m.id,
        course_code: m.course_code,
        course_title: m.course_title,
        level: m.level,
        uploaded_at: m.uploaded_at,
        department_name: dept?.name ?? '—',
        school_short: school?.short_name ?? '—',
      }
    })

  // --- Department activity ---
  const deptMaterials = new Map<string, MaterialRow[]>()
  for (const m of materials) {
    if (!deptMaterials.has(m.department_id)) {
      deptMaterials.set(m.department_id, [])
    }
    deptMaterials.get(m.department_id)!.push(m)
  }

  const departmentActivity = departments
    .map((d) => {
      const dms = deptMaterials.get(d.id) ?? []
      const downloads = dms.reduce((s, m) => s + (m.download_count ?? 0), 0)
      const lastUpload = dms.length
        ? dms.reduce(
            (latest, m) =>
              new Date(m.uploaded_at).getTime() > new Date(latest).getTime()
                ? m.uploaded_at
                : latest,
            dms[0].uploaded_at
          )
        : null
      const school = schoolMap.get(d.school_id)
      return {
        id: d.id,
        name: d.name,
        school_short: school?.short_name ?? '—',
        materials: dms.length,
        downloads,
        lastUpload,
      }
    })
    .sort((a, b) => b.materials - a.materials)

  return {
    totalMaterials,
    totalDownloads,
    uploadsThisWeek,
    activeDepartments,
    totalDepartments,
    mostDownloadedCourse,
    materialsBySchool,
    downloadsBySchool,
    levelDistribution,
    topDownloaded,
    recentUploads,
    departmentActivity,
  }
}
