import { useState, useEffect, type FormEvent } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Search } from 'lucide-react'
import { cn } from '../lib/utils'

interface SearchBarProps {
  size?: 'md' | 'lg'
  autoFocus?: boolean
  className?: string
}

export function SearchBar({
  size = 'md',
  autoFocus = false,
  className,
}: SearchBarProps) {
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const [q, setQ] = useState(params.get('q') ?? '')

  // Keep the input in sync if the URL changes (e.g. back button)
  useEffect(() => {
    setQ(params.get('q') ?? '')
  }, [params])

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  const isLarge = size === 'lg'

  return (
    <form onSubmit={onSubmit} className={cn('w-full', className)}>
      <div className="relative">
        <Search
          size={isLarge ? 20 : 18}
          className={cn(
            'absolute top-1/2 -translate-y-1/2 text-gray-400',
            isLarge ? 'left-4' : 'left-3'
          )}
        />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          autoFocus={autoFocus}
          placeholder={
            isLarge
              ? 'Search by course code or title (e.g. CSC 101)'
              : 'Search course code or title'
          }
          className={cn(
            'w-full rounded-lg border border-gray-200 bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition',
            isLarge
              ? 'pl-12 pr-28 py-4 text-sm sm:text-base rounded-xl shadow-sm focus:ring-4'
              : 'pl-10 pr-4 py-2 text-sm'
          )}
        />
        {isLarge && (
          <button
            type="submit"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            Search
          </button>
        )}
      </div>
    </form>
  )
}
