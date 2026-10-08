import { useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import {
  LayoutDashboard,
  Upload,
  FileStack,
  LogOut,
  Menu,
  X,
  GraduationCap,
  ExternalLink,
} from 'lucide-react'
import { cn } from '../../lib/utils'
import { useAuth } from '../../hooks/useAuth'
import type { ReactNode } from 'react'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/upload', label: 'Upload', icon: Upload, end: false },
  { to: '/admin/materials', label: 'Materials', icon: FileStack, end: false },
]

export function AdminLayout({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleSignOut() {
    await signOut()
    navigate('/admin/login', { replace: true })
  }

  return (
    <div className="h-screen bg-gray-50 flex overflow-hidden">
      {/* Sidebar - desktop */}
      <aside className="hidden lg:flex lg:flex-col w-60 shrink-0 bg-white border-r border-gray-100 h-screen">
        <SidebarContent user={user?.email} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div
            className="fixed inset-0 bg-black/40 z-40 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-64 bg-white z-50 lg:hidden flex flex-col">
            <button
              onClick={() => setOpen(false)}
              className="absolute top-4 right-4 p-2 text-gray-500 hover:text-gray-900"
              aria-label="Close menu"
            >
              <X size={20} />
            </button>
            <SidebarContent
              user={user?.email}
              onSignOut={handleSignOut}
              onNavigate={() => setOpen(false)}
            />
          </aside>
        </>
      )}

      {/* Main column */}
      <div className="flex-1 min-w-0 flex flex-col h-screen">
        {/* Mobile top bar */}
        <header className="lg:hidden sticky top-0 z-30 h-14 bg-white border-b border-gray-100 flex items-center px-4 gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 -ml-2 text-gray-700"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="text-sm font-semibold text-gray-900">Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">{children}</main>
      </div>
    </div>
  )
}

function SidebarContent({
  user,
  onSignOut,
  onNavigate,
}: {
  user?: string
  onSignOut: () => void
  onNavigate?: () => void
}) {
  return (
    <>
      <div className="h-16 flex items-center gap-2 px-5 border-b border-gray-100 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
          <GraduationCap size={18} className="text-white" />
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold text-gray-900">FUT Minna</div>
          <div className="text-xs text-gray-500">Admin Panel</div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}

        <Link
          to="/"
          onClick={onNavigate}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-colors"
        >
          <ExternalLink size={18} />
          View site
        </Link>
      </nav>

      <div className="border-t border-gray-100 p-3 space-y-2 shrink-0">
        <div className="px-3 py-2">
          <p className="text-xs text-gray-400">Signed in as</p>
          <p className="text-xs font-medium text-gray-700 truncate">
            {user ?? '—'}
          </p>
        </div>
        <button
          onClick={onSignOut}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut size={18} />
          Sign out
        </button>
      </div>
    </>
  )
}
