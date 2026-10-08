import { Link, useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Search, FileText, Download, Clock } from 'lucide-react'
import { Layout } from '../components/layout/Layout'
import { searchMaterialsDetailed } from '../lib/queries'
import { Card } from '../components/ui/Card'
import { EmptyState } from '../components/ui/EmptyState'
import { Button } from '../components/ui/Button'
import { formatDate, formatFileSize } from '../lib/utils'
import { incrementDownload } from '../lib/queries'
import type { SearchResult } from '../lib/queries'
import { usePageTitle } from '../hooks/usePageTitle' 

export default function SearchResults() {
  usePageTitle(q ? \Search: ${q}` : 'Search')`
  const [params] = useSearchParams()
  const q = (params.get('q') ?? '').trim()

  const {
    data: results,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['search', q],
    queryFn: () => searchMaterialsDetailed(q),
    enabled: q.length > 0,
  })

  return (
    <Layout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Search
          </h1>
          {q && (
            <p className="text-sm text-gray-500 mt-2">
              {isLoading
                ? 'Searching...'
                : `${results?.length ?? 0} result${
                    results?.length === 1 ? '' : 's'
                  } for "${q}"`}
            </p>
          )}
        </div>

        {/* No query */}
        {!q && (
          <EmptyState
            icon={<Search size={28} />}
            title="Start typing to search"
            description="Search by course code (e.g. CSC 101) or course title."
            action={
              <Link to="/browse">
                <Button variant="secondary" size="sm">
                  Browse by school instead
                </Button>
              </Link>
            }
          />
        )}

        {/* Loading */}
        {q && isLoading && (
          <div className="space-y-3">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="h-28 rounded-xl bg-gray-100 animate-pulse"
              />
            ))}
          </div>
        )}

        {/* Error */}
        {q && error && (
          <EmptyState
            title="Search failed"
            description="Something went wrong. Try again in a moment."
          />
        )}

        {/* No results */}
        {q && !isLoading && results && results.length === 0 && (
          <EmptyState
            icon={<FileText size={28} />}
            title={`No results for "${q}"`}
            description="Try a shorter query, or browse by school to find what you need."
            action={
              <Link to="/browse">
                <Button variant="secondary" size="sm">
                  Browse all schools
                </Button>
              </Link>
            }
          />
        )}

        {/* Results */}
        {q && !isLoading && results && results.length > 0 && (
          <div className="space-y-3">
            {results.map((r) => (
              <ResultCard key={r.id} result={r} query={q} />
            ))}
          </div>
        )}
      </div>
    </Layout>
  )
}

function ResultCard({
  result,
  query,
}: {
  result: SearchResult
  query: string
}) {
  async function handleDownload() {
    try {
      await incrementDownload(result.id)
    } catch {
      // ignore
    }
    window.open(result.file_url, '_blank', 'noopener')
  }

  const school = result.department.school
  const dept = result.department

  return (
    <Card className="p-4 hover:border-brand-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          <FileText size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-block px-2 py-0.5 rounded-md bg-brand-600 text-white text-xs font-semibold">
              <Highlight text={result.course_code} query={query} />
            </span>
            <span className="text-xs text-gray-400">
              {formatFileSize(result.file_size)}
            </span>
          </div>

          <h3 className="text-sm font-medium text-gray-900 leading-snug mb-1">
            <Highlight text={result.course_title} query={query} />
          </h3>

          <Link
            to={`/school/${school.slug}/${dept.slug}/${result.level}`}
            className="text-xs text-brand-600 hover:text-brand-700 font-medium"
          >
            {school.short_name} &middot; {dept.name} &middot; {result.level}L
          </Link>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatDate(result.uploaded_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download size={12} />
              {result.download_count} downloads
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          aria-label={`Download ${result.course_code}`}
          className="shrink-0 w-10 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors"
        >
          <Download size={18} />
        </button>
      </div>
    </Card>
  )
}

function Highlight({ text, query }: { text: string; query: string }) {
  const q = query.trim()
  if (!q) return <>{text}</>

  const idx = text.toLowerCase().indexOf(q.toLowerCase())
  if (idx === -1) return <>{text}</>

  const before = text.slice(0, idx)
  const match = text.slice(idx, idx + q.length)
  const after = text.slice(idx + q.length)

  return (
    <>
      {before}
      <mark className="bg-accent-400/40 text-inherit rounded px-0.5">
        {match}
      </mark>
      {after}
    </>
  )
}
