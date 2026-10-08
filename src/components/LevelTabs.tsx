import { Link } from 'react-router-dom'
import { cn } from '../lib/utils'

const LEVELS = [100, 200, 300, 400, 500]

interface LevelTabsProps {
  schoolSlug: string
  deptSlug: string
  activeLevel?: number
}

export function LevelTabs({
  schoolSlug,
  deptSlug,
  activeLevel,
}: LevelTabsProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
      {LEVELS.map((level) => {
        const active = activeLevel === level
        return (
          <Link
            key={level}
            to={`/school/${schoolSlug}/${deptSlug}/${level}`}
            className={cn(
              'shrink-0 px-5 py-2.5 rounded-lg text-sm font-semibold transition-colors border',
              active
                ? 'bg-brand-600 text-white border-brand-600'
                : 'bg-white text-gray-700 border-gray-200 hover:border-brand-300 hover:text-brand-700'
            )}
          >
            {level} Level
          </Link>
        )
      })}
    </div>
  )
}
