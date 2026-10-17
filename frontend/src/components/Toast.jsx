import { AlertIcon, CheckIcon } from './icons.jsx'

export default function Toast({ toast, onDismiss }) {
  if (!toast) return null

  const isError = toast.type === 'error'

  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[60]">
      <div
        role="status"
        className={`pointer-events-auto flex items-start gap-3 rounded-xl border px-4 py-3 shadow-lg ${
          isError
            ? 'border-red-200 bg-red-50 text-red-800'
            : 'border-emerald-200 bg-emerald-50 text-emerald-800'
        }`}
      >
        <span className="mt-0.5">
          {isError ? <AlertIcon className="h-5 w-5" /> : <CheckIcon className="h-5 w-5" />}
        </span>
        <p className="max-w-xs text-sm font-medium">{toast.message}</p>
        <button
          type="button"
          onClick={onDismiss}
          className="ml-2 text-xs font-semibold uppercase opacity-70 hover:opacity-100"
        >
          Close
        </button>
      </div>
    </div>
  )
}
