import { Link } from 'react-router-dom'
import { ChevronRight, School as SchoolIcon } from 'lucide-react'
import { Card } from './ui/Card'
import type { School } from '../types/database'

export function SchoolCard({ school }: { school: School }) {
  return (
    <Link to={`/school/${school.slug}`} className="block group">
      <Card className="p-5 h-full hover:border-brand-200 hover:shadow-md transition-all">
        <div className="flex items-start gap-4">
          <div className="w-11 h-11 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600 group-hover:bg-brand-100 transition-colors">
            <SchoolIcon size={20} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-brand-600 text-white text-xs font-semibold tracking-wide mb-2">
              {school.short_name}
            </div>
            <h3 className="text-sm font-medium text-gray-900 leading-snug line-clamp-2">
              {school.name}
            </h3>
          </div>
          <ChevronRight
            size={18}
            className="text-gray-300 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all shrink-0 mt-1"
          />
        </div>
      </Card>
    </Link>
  )
}
