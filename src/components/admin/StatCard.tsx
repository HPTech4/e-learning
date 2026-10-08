import type { LucideIcon } from 'lucide-react'
import { cn } from '../../lib/utils'

interface StatCardProps {
  label: string
  value: string | number
  hint?: string
  icon: LucideIcon
  accent?: 'brand' | 'accent' | 'green' | 'gray'
}

const ACCENTS = {
  brand: {
    iconBg: 'bg-brand-50',
    iconText: 'text-brand-600',
  },
  accent: {
    iconBg: 'bg-amber-50',
    iconText: 'text-amber-600',
  },
  green: {
    iconBg: 'bg-emerald-50',
    iconText: 'text-emerald-600',
  },
  gray: {
    iconBg: 'bg-gray-100',
    iconText: 'text-gray-600',
  },
} as const

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = 'brand',
}: StatCardProps) {
  const a = ACCENTS[accent]

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-3">
        <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          {label}
        </span>
        <div
          className={cn(
            'w-9 h-9 rounded-lg flex items-center justify-center',
            a.iconBg
          )}
        >
          <Icon size={18} className={a.iconText} />
        </div>
      </div>
      <div className="text-2xl font-bold text-gray-900 leading-tight">
        {value}
      </div>
      {hint && <p className="text-xs text-gray-500 mt-1">{hint}</p>}
    </div>
  )
}
