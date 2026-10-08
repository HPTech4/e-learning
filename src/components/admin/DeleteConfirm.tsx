import { AlertTriangle, Loader2, X } from 'lucide-react'

interface DeleteConfirmProps {
  open: boolean
  title: string
  description: string
  confirmLabel?: string
  confirming?: boolean
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirm({
  open,
  title,
  description,
  confirmLabel = 'Delete',
  confirming = false,
  onCancel,
  onConfirm,
}: DeleteConfirmProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={confirming ? undefined : onCancel}
      />
      <div className="relative w-full max-w-sm bg-white rounded-xl shadow-lg p-6">
        <button
          onClick={onCancel}
          disabled={confirming}
          className="absolute top-4 right-4 p-1 text-gray-400 hover:text-gray-700 disabled:opacity-50"
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="w-11 h-11 rounded-full bg-red-50 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-red-600" />
        </div>

        <h3 className="text-base font-semibold text-gray-900 mb-1">
          {title}
        </h3>
        <p className="text-sm text-gray-500 mb-6">{description}</p>

        <div className="flex gap-2 justify-end">
          <button
            onClick={onCancel}
            disabled={confirming}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-red-600 hover:bg-red-700 disabled:bg-red-300 text-white transition-colors"
          >
            {confirming && <Loader2 size={14} className="animate-spin" />}
{confirming ? 'Working...' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
