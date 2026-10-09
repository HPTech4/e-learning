import { Link, useNavigate } from 'react-router-dom'
import { useState, type FormEvent } from 'react'
import { Search, GraduationCap } from 'lucide-react'

export function Header() {
  const [q, setQ] = useState('')
  const navigate = useNavigate()

  function onSubmit(e: FormEvent) {
    e.preventDefault()
    const trimmed = q.trim()
    if (trimmed) navigate(`/search?q=${encodeURIComponent(trimmed)}`)
  }

  return (
    <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="h-16 flex items-center gap-4">
          <Link to="/" className="flex items-center gap-2 shrink-0">
            <div className="w-9 h-9 rounded-lg bg-brand-600 flex items-center justify-center">
              <GraduationCap size={20} className="text-white" />
            </div>
            <div className="hidden sm:block leading-tight">
              <div className="text-sm font-semibold text-gray-900">
                FUT Minna
              </div>
              <div className="text-xs text-gray-500">E-Library</div>
            </div>
          </Link>

          <form onSubmit={onSubmit} className="flex-1 max-w-md ml-auto">
            <div className="relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="search"
                value={q}
                onChange={(e) => setQ(e.target.value)}
                placeholder="Search course code or title"
                className="w-full pl-10 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:bg-white focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
          </form>
        </div>
      </div>
    </header>
  )
}
