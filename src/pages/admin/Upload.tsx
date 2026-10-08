import { useState, useRef, useMemo, DragEvent, ChangeEvent, FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  UploadCloud,
  FileText,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react'
import { AdminLayout } from '../../components/admin/AdminLayout'
import {
  getSchools,
  getDepartmentsBySchool,
  uploadMaterialFile,
  createMaterial,
} from '../../lib/queries'
import { useAuth } from '../../hooks/useAuth'
import { cn, formatFileSize } from '../../lib/utils'
import { usePageTitle } from '../../hooks/usePageTitle'

const LEVELS = [100, 200, 300, 400, 500]
const MAX_SIZE = 50 * 1024 * 1024 // 50 MB
const ACCEPT = '.pdf,.doc,.docx,.ppt,.pptx,.txt'

export default function Upload() {
  usePageTitle('Upload')
  const qc = useQueryClient()
  const { user } = useAuth()

  const [schoolId, setSchoolId] = useState('')
  const [departmentId, setDepartmentId] = useState('')
  const [level, setLevel] = useState<number | ''>('')
  const [courseCode, setCourseCode] = useState('')
  const [courseTitle, setCourseTitle] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [dragging, setDragging] = useState(false)

  const [submitting, setSubmitting] = useState(false)
  const [progress, setProgress] = useState('')
  const [success, setSuccess] = useState<{
    courseCode: string
    fileUrl: string
  } | null>(null)
  const [error, setError] = useState('')

  const inputRef = useRef<HTMLInputElement>(null)

  const { data: schools } = useQuery({
    queryKey: ['schools'],
    queryFn: getSchools,
  })

  const { data: departments } = useQuery({
    queryKey: ['departments', schoolId],
    queryFn: () => getDepartmentsBySchool(schoolId),
    enabled: !!schoolId,
  })

  const selectedDept = useMemo(
    () => departments?.find((d) => d.id === departmentId),
    [departments, departmentId]
  )

  function resetForm() {
    setSchoolId('')
    setDepartmentId('')
    setLevel('')
    setCourseCode('')
    setCourseTitle('')
    setFile(null)
    setProgress('')
    setError('')
    if (inputRef.current) inputRef.current.value = ''
  }

  function handleFile(f: File | null) {
    setError('')
    if (!f) return
    if (f.size > MAX_SIZE) {
      setError(`File too large. Max is ${formatFileSize(MAX_SIZE)}.`)
      return
    }
    setFile(f)
  }

  function onDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    handleFile(e.dataTransfer.files?.[0] ?? null)
  }

  function onFileInput(e: ChangeEvent<HTMLInputElement>) {
    handleFile(e.target.files?.[0] ?? null)
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault()
    setError('')
    setSuccess(null)

    if (!schoolId || !departmentId || !level || !courseCode || !courseTitle) {
      setError('Fill in every field before uploading.')
      return
    }
    if (!file) {
      setError('Choose a file to upload.')
      return
    }
    if (!selectedDept) {
      setError('Selected department is invalid.')
      return
    }

    setSubmitting(true)
    try {
      setProgress('Uploading file...')
      const { publicUrl } = await uploadMaterialFile(
        file,
        selectedDept.slug,
        Number(level)
      )

      setProgress('Saving record...')
      await createMaterial({
        department_id: departmentId,
        level: Number(level),
        course_code: courseCode.trim().toUpperCase(),
        course_title: courseTitle.trim(),
        file_url: publicUrl,
        file_name: file.name,
        file_size: file.size,
        uploaded_by: user?.email ?? 'admin',
      })

      // Invalidate cached lists so browse + dashboard refresh
      qc.invalidateQueries({ queryKey: ['materials'] })
      qc.invalidateQueries({ queryKey: ['search'] })
      qc.invalidateQueries({ queryKey: ['dashboard'] })

      setSuccess({
        courseCode: courseCode.trim().toUpperCase(),
        fileUrl: publicUrl,
      })
      resetForm()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed.')
    } finally {
      setSubmitting(false)
      setProgress('')
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Upload material</h1>
          <p className="text-sm text-gray-500 mt-1">
            Add a new file to the library. It appears immediately on the
            student side.
          </p>
        </div>

        {success && (
          <div className="mb-6 flex items-start gap-3 p-4 rounded-xl bg-green-50 border border-green-100">
            <CheckCircle2 size={20} className="text-green-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-green-900">
                {success.courseCode} uploaded successfully.
              </p>
              <a
                href={success.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-700 hover:text-green-800 mt-1"
              >
                Open file
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        )}

        <form
          onSubmit={onSubmit}
          className="grid grid-cols-1 lg:grid-cols-5 gap-6"
        >
          {/* Left: fields */}
          <div className="lg:col-span-3 space-y-5 bg-white rounded-xl border border-gray-100 p-6">
            <Field label="School" required>
              <select
                value={schoolId}
                onChange={(e) => {
                  setSchoolId(e.target.value)
                  setDepartmentId('')
                }}
                required
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              >
                <option value="">Select a school</option>
                {schools?.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.short_name} — {s.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Department" required>
              <select
                value={departmentId}
                onChange={(e) => setDepartmentId(e.target.value)}
                required
                disabled={!schoolId}
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none disabled:bg-gray-50 disabled:text-gray-400"
              >
                <option value="">
                  {schoolId ? 'Select a department' : 'Select a school first'}
                </option>
                {departments?.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Level" required>
              <div className="flex gap-2 flex-wrap">
                {LEVELS.map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setLevel(l)}
                    className={cn(
                      'px-4 py-2 rounded-lg text-sm font-semibold border transition-colors',
                      level === l
                        ? 'bg-brand-600 text-white border-brand-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300'
                    )}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </Field>

            <Field label="Course code" required>
              <input
                type="text"
                value={courseCode}
                onChange={(e) => setCourseCode(e.target.value)}
                required
                placeholder="e.g. CSC 101"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </Field>

            <Field label="Course title" required>
              <input
                type="text"
                value={courseTitle}
                onChange={(e) => setCourseTitle(e.target.value)}
                required
                placeholder="e.g. Introduction to Computer Science"
                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none"
              />
            </Field>
          </div>

          {/* Right: file + submit */}
          <div className="lg:col-span-2 space-y-5">
            <div className="bg-white rounded-xl border border-gray-100 p-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                File <span className="text-red-500">*</span>
              </label>

              {!file ? (
                <div
                  onDragOver={(e) => {
                    e.preventDefault()
                    setDragging(true)
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors',
                    dragging
                      ? 'border-brand-400 bg-brand-50'
                      : 'border-gray-200 hover:border-brand-300 hover:bg-gray-50'
                  )}
                >
                  <UploadCloud
                    size={32}
                    className="mx-auto text-brand-500 mb-3"
                  />
                  <p className="text-sm font-medium text-gray-700 mb-1">
                    Drop file here or click to browse
                  </p>
                  <p className="text-xs text-gray-400">
                    PDF, DOCX, PPTX &middot; max {formatFileSize(MAX_SIZE)}
                  </p>
                </div>
              ) : (
                <div className="flex items-start gap-3 p-4 rounded-lg bg-brand-50 border border-brand-100">
                  <FileText
                    size={20}
                    className="text-brand-600 shrink-0 mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setFile(null)
                      if (inputRef.current) inputRef.current.value = ''
                    }}
                    className="shrink-0 p-1 text-gray-400 hover:text-red-600"
                    aria-label="Remove file"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}

              <input
                ref={inputRef}
                type="file"
                accept={ACCEPT}
                onChange={onFileInput}
                className="hidden"
              />
            </div>

            {error && (
              <div className="flex items-start gap-2 p-3 rounded-lg bg-red-50 border border-red-100 text-sm text-red-700">
                <AlertCircle size={16} className="shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full inline-flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 disabled:bg-brand-300 text-white px-4 py-3 rounded-lg text-sm font-medium transition-colors"
            >
              {submitting && <Loader2 size={16} className="animate-spin" />}
              {submitting ? progress || 'Uploading...' : 'Upload material'}
            </button>

            <p className="text-xs text-gray-400 text-center">
              Need to edit or delete an upload? Go to{' '}
              <Link
                to="/admin/materials"
                className="text-brand-600 hover:text-brand-700 font-medium"
              >
                Materials
              </Link>
              .
            </p>
          </div>
        </form>
      </div>
    </AdminLayout>
  )
}

function Field({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  )
}
