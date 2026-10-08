import { Link } from 'react-router-dom'
import { ChevronRight, Building2 } from 'lucide-react'
import { Card } from './ui/Card'
import type { Department } from '../types/database'

export function DepartmentCard({
  department,
  schoolSlug,
}: {
  department: Department
  schoolSlug: string
}) {
  return (
    <Link
      to={`/school/${schoolSlug}/${department.slug}`}
      className="block group"
    >
      <Card className="p-4 hover:border-brand-200 hover:shadow-md transition-all">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
            <Building2 size={18} />
          </div>
          <h3 className="flex-1 text-sm font-medium text-gray-900 truncate">
            {department.name}
          </h3>
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0"
          />
        </div>
      </Card>
    </Link>
  )
}
