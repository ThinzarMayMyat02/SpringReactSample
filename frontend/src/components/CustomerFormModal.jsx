import { useEffect, useMemo, useRef, useState } from 'react'
import { CloseIcon, SpinnerIcon } from './icons.jsx'

const EMPTY_FORM = {
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  phoneNumber: '',
  email: '',
  ban: '',
}

const MAX_DOB = new Date().toISOString().slice(0, 10)

function validate(form) {
  const errors = {}
  if (!form.firstName.trim()) errors.firstName = 'First name is required.'
  if (!form.lastName.trim()) errors.lastName = 'Last name is required.'

  if (form.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = 'Enter a valid email address.'
  }
  if (form.phoneNumber.trim() && !/^[+()\d][\d\s()+-]{4,}$/.test(form.phoneNumber.trim())) {
    errors.phoneNumber = 'Enter a valid phone number.'
  }
  if (form.dateOfBirth && form.dateOfBirth > MAX_DOB) {
    errors.dateOfBirth = 'Date of birth cannot be in the future.'
  }
  return errors
}

export default function CustomerFormModal({ open, customer, saving, onClose, onSubmit }) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [touched, setTouched] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const firstFieldRef = useRef(null)

  const isEditing = Boolean(customer?.id)

  // Reset the form each time the modal opens (or the target customer changes).
  useEffect(() => {
    if (!open) return
    setTouched({})
    setSubmitted(false)
    setForm(
      customer
        ? {
            firstName: customer.firstName ?? '',
            lastName: customer.lastName ?? '',
            dateOfBirth: customer.dateOfBirth ?? '',
            phoneNumber: customer.phoneNumber ?? '',
            email: customer.email ?? '',
            ban: customer.ban ?? '',
          }
        : EMPTY_FORM,
    )
  }, [open, customer])

  // Focus the first field and close on Escape.
  useEffect(() => {
    if (!open) return
    const frame = requestAnimationFrame(() => firstFieldRef.current?.focus())
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [open, onClose])

  const errors = useMemo(() => validate(form), [form])
  const showError = (field) => (submitted || touched[field]) && errors[field]

  if (!open) return null

  const update = (field) => (event) => {
    setForm((prev) => ({ ...prev, [field]: event.target.value }))
  }
  const blur = (field) => () => setTouched((prev) => ({ ...prev, [field]: true }))

  const handleSubmit = (event) => {
    event.preventDefault()
    setSubmitted(true)
    if (Object.keys(errors).length > 0) return
    onSubmit(form)
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="customer-modal-title"
        className="relative z-10 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-white shadow-2xl"
      >
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 id="customer-modal-title" className="text-lg font-semibold text-slate-900">
              {isEditing ? 'Edit customer' : 'New customer'}
            </h2>
            <p className="text-sm text-slate-500">
              {isEditing
                ? `Updating record #${customer.id}`
                : 'Add a customer to the directory.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="space-y-5 px-6 py-5">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="firstName">
                First name <span className="text-red-500">*</span>
              </label>
              <input
                id="firstName"
                ref={firstFieldRef}
                className="input"
                value={form.firstName}
                onChange={update('firstName')}
                onBlur={blur('firstName')}
                autoComplete="given-name"
                placeholder="Ada"
              />
              {showError('firstName') && (
                <p className="mt-1 text-xs text-red-600">{errors.firstName}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="lastName">
                Last name <span className="text-red-500">*</span>
              </label>
              <input
                id="lastName"
                className="input"
                value={form.lastName}
                onChange={update('lastName')}
                onBlur={blur('lastName')}
                autoComplete="family-name"
                placeholder="Lovelace"
              />
              {showError('lastName') && (
                <p className="mt-1 text-xs text-red-600">{errors.lastName}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="dateOfBirth">Date of birth</label>
              <input
                id="dateOfBirth"
                type="date"
                max={MAX_DOB}
                className="input"
                value={form.dateOfBirth}
                onChange={update('dateOfBirth')}
                onBlur={blur('dateOfBirth')}
              />
              {showError('dateOfBirth') && (
                <p className="mt-1 text-xs text-red-600">{errors.dateOfBirth}</p>
              )}
            </div>

            <div>
              <label className="label" htmlFor="phoneNumber">Phone number</label>
              <input
                id="phoneNumber"
                className="input"
                value={form.phoneNumber}
                onChange={update('phoneNumber')}
                onBlur={blur('phoneNumber')}
                autoComplete="tel"
                placeholder="+44 20 7946 0958"
              />
              {showError('phoneNumber') && (
                <p className="mt-1 text-xs text-red-600">{errors.phoneNumber}</p>
              )}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                className="input"
                value={form.email}
                onChange={update('email')}
                onBlur={blur('email')}
                autoComplete="email"
                placeholder="ada@example.com"
              />
              {showError('email') && <p className="mt-1 text-xs text-red-600">{errors.email}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="label" htmlFor="ban">BAN (Bank Account Number)</label>
              <input
                id="ban"
                className="input font-mono"
                value={form.ban}
                onChange={update('ban')}
                onBlur={blur('ban')}
                placeholder="GB29 NWBK 6016 1331 9268 19"
              />
              <p className="mt-1 text-xs text-slate-500">
                Up to 34 characters (IBAN-compatible). Stored as plain text for this demo.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-200 pt-4">
            <button type="button" onClick={onClose} className="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving}>
              {saving && <SpinnerIcon className="h-4 w-4" />}
              {isEditing ? 'Save changes' : 'Create customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
