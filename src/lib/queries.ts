import { supabase } from './supabase'
import type { School, Department, Material } from '../types/database'

// ============================================================
// SCHOOLS
// ============================================================

export async function getSchools(): Promise<School[]> {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .order('short_name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getSchoolBySlug(slug: string): Promise<School | null> {
  const { data, error } = await supabase
    .from('schools')
    .select('*')
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

// ============================================================
// DEPARTMENTS
// ============================================================

export async function getDepartmentsBySchool(schoolId: string): Promise<Department[]> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('school_id', schoolId)
    .order('name', { ascending: true })

  if (error) throw error
  return data ?? []
}

export async function getDepartmentBySlug(
  schoolId: string,
  slug: string
): Promise<Department | null> {
  const { data, error } = await supabase
    .from('departments')
    .select('*')
    .eq('school_id', schoolId)
    .eq('slug', slug)
    .maybeSingle()

  if (error) throw error
  return data
}

// ============================================================
// MATERIALS
// ============================================================

export async function getMaterialsByDepartmentAndLevel(
  departmentId: string,
  level: number
): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .eq('department_id', departmentId)
    .eq('level', level)
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function searchMaterials(query: string): Promise<Material[]> {
  const q = query.trim()
  if (!q) return []

  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .or(`course_code.ilike.%${q}%,course_title.ilike.%${q}%`)
    .order('download_count', { ascending: false })
    .limit(50)

  if (error) throw error
  return data ?? []
}

// ============================================================
// DOWNLOAD
// ============================================================

export async function incrementDownload(materialId: string): Promise<void> {
  const { error } = await supabase.rpc('increment_download', {
    material_id: materialId,
  })
  if (error) throw error
}

// ============================================================
// ADMIN — UPLOAD
// ============================================================

export async function uploadMaterialFile(
  file: File,
  departmentSlug: string,
  level: number
): Promise<{ path: string; publicUrl: string }> {
  const ext = file.name.split('.').pop() ?? 'pdf'
  const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
  const path = `${departmentSlug}/${level}/${unique}.${ext}`

  const { error: uploadError } = await supabase.storage
    .from('materials')
    .upload(path, file, {
      cacheControl: '3600',
      upsert: false,
      contentType: file.type,
    })

  if (uploadError) throw uploadError

  const { data } = supabase.storage.from('materials').getPublicUrl(path)
  return { path, publicUrl: data.publicUrl }
}

export async function createMaterial(input: {
  department_id: string
  level: number
  course_code: string
  course_title: string
  file_url: string
  file_name: string
  file_size: number
  uploaded_by: string
}): Promise<Material> {
  const { data, error } = await supabase
    .from('materials')
    .insert(input)
    .select()
    .single()

  if (error) throw error
  return data
}

export async function getAllMaterials(): Promise<Material[]> {
  const { data, error } = await supabase
    .from('materials')
    .select('*')
    .order('uploaded_at', { ascending: false })

  if (error) throw error
  return data ?? []
}

export async function deleteMaterial(id: string): Promise<void> {
  const { error } = await supabase.from('materials').delete().eq('id', id)
  if (error) throw error
}

// ============================================================
// ADMIN — DASHBOARD STATS
// ============================================================

export async function getDashboardStats() {
  const [materialsRes, departmentsRes] = await Promise.all([
    supabase.from('materials').select('*'),
    supabase.from('departments').select('id'),
  ])

  if (materialsRes.error) throw materialsRes.error
  if (departmentsRes.error) throw departmentsRes.error

  const materials = materialsRes.data ?? []
  const totalDownloads = materials.reduce((sum, m) => sum + (m.download_count ?? 0), 0)

  const weekAgo = Date.now() - 7 * 86400000
  const uploadsThisWeek = materials.filter(
    (m) => new Date(m.uploaded_at).getTime() > weekAgo
  ).length

  const activeDepts = new Set(materials.map((m) => m.department_id)).size

  const mostDownloaded = [...materials]
    .sort((a, b) => b.download_count - a.download_count)
    .slice(0, 10)

  const recentUploads = [...materials]
    .sort(
      (a, b) =>
        new Date(b.uploaded_at).getTime() - new Date(a.uploaded_at).getTime()
    )
    .slice(0, 8)

  return {
    totalMaterials: materials.length,
    totalDownloads,
    uploadsThisWeek,
    activeDepartments: activeDepts,
    totalDepartments: departmentsRes.data?.length ?? 0,
    mostDownloaded,
    recentUploads,
  }
}
