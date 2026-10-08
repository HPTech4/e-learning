import { FileText, Download, Clock } from 'lucide-react'
import { Card } from './ui/Card'
import { formatDate, formatFileSize } from '../lib/utils'
import { incrementDownload } from '../lib/queries'
import type { Material } from '../types/database'

export function MaterialRow({ material }: { material: Material }) {
  async function handleDownload() {
    try {
      await incrementDownload(material.id)
    } catch {
      // non-critical — download still proceeds
    }
    window.open(material.file_url, '_blank', 'noopener')
  }

  return (
    <Card className="p-4 hover:border-brand-200 transition-colors">
      <div className="flex items-start gap-4">
        <div className="w-10 h-10 shrink-0 rounded-lg bg-brand-50 flex items-center justify-center text-brand-600">
          <FileText size={18} />
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="inline-block px-2 py-0.5 rounded-md bg-brand-600 text-white text-xs font-semibold">
              {material.course_code}
            </span>
            <span className="text-xs text-gray-400">
              {formatFileSize(material.file_size)}
            </span>
          </div>

          <h3 className="text-sm font-medium text-gray-900 leading-snug truncate">
            {material.course_title}
          </h3>

          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="inline-flex items-center gap-1">
              <Clock size={12} />
              {formatDate(material.uploaded_at)}
            </span>
            <span className="inline-flex items-center gap-1">
              <Download size={12} />
              {material.download_count} downloads
            </span>
          </div>
        </div>

        <button
          onClick={handleDownload}
          aria-label={`Download ${material.course_code}`}
          className="shrink-0 w-10 h-10 rounded-lg bg-brand-600 hover:bg-brand-700 text-white flex items-center justify-center transition-colors"
        >
          <Download size={18} />
        </button>
      </div>
    </Card>
  )
}
