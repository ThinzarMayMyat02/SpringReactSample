import { useEffect } from 'react'
import { AlertIcon, SpinnerIcon } from './icons.jsx'

export default function ConfirmDialog({
  open,
  title = 'Are you sure?',
  description,
  confirmLabel = 'Confirm',
  busy = false,
  onCancel,
  onConfirm,
}) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event) => {
      if (event.key === 'Escape' && !busy) onCancel()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [open, busy, onCancel])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={onCancel} aria-hidden="true" />

      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-title"
        className="relative z-10 w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
      >
        <div className="flex items-start gap-4">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-100 text-red-600">
            <AlertIcon className="h-5 w-5" />
          </span>
          <div className="flex-1">
            <h2 id="confirm-title" className="text-base font-semibold text-slate-900">
              {title}
            </h2>
            {description && <p className="mt-1 text-sm text-slate-600">{description}</p>}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-2">
          <button type="button" onClick={onCancel} className="btn-secondary" disabled={busy}>
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="btn-danger" disabled={busy}>
            {busy && <SpinnerIcon className="h-4 w-4" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
