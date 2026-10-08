import { useQuery } from '@tanstack/react-query'
import { School as SchoolIcon } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { getSchools } from '../lib/queries'
import { SchoolCard } from '../components/SchoolCard'
import { EmptyState } from '../components/ui/EmptyState'
import { usePageTitle } from '../hooks/usePageTitle' 

export default function Browse() {
  
  const { data: schools, isLoading, error } = useQuery({
    queryKey: ['schools'],
    queryFn: getSchools,
  })

  usePageTitle('Browse Schools')

  return (
    <Layout>
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            All Schools
          </h1>
          <p className="text-sm text-gray-500 mt-2">
            Select a school to browse its departments.
          </p>
        </div>

        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-24 rounded-xl bg-gray-100 animate-pulse" />
            ))}
          </div>
        )}

        {error && (
          <EmptyState
            title="Could not load schools"
            description="Check your connection and try again."
          />
        )}

        {schools && schools.length === 0 && (
          <EmptyState
            icon={<SchoolIcon size={28} />}
            title="No schools yet"
            description="Schools will appear here once added."
          />
        )}

        {schools && schools.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {schools.map((school) => (
              <SchoolCard key={school.id} school={school} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}
