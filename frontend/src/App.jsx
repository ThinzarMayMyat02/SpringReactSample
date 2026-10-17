import { useCallback, useEffect, useMemo, useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import SearchBar from './components/SearchBar.jsx'
import CustomerTable from './components/CustomerTable.jsx'
import CustomerFormModal from './components/CustomerFormModal.jsx'
import ConfirmDialog from './components/ConfirmDialog.jsx'
import Toast from './components/Toast.jsx'
import customerService, { API_BASE_URL, toCustomerPayload } from './api/customerService.js'

const SEARCH_DEBOUNCE_MS = 300

export default function App() {
  const [customers, setCustomers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const [query, setQuery] = useState('')
  const [debouncedQuery, setDebouncedQuery] = useState('')

  const [modalOpen, setModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)
  const [saving, setSaving] = useState(false)

  const [pendingDelete, setPendingDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)

  const [toast, setToast] = useState(null)

  // --- Data loading -------------------------------------------------------
  const loadCustomers = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await customerService.list(debouncedQuery)
      setCustomers(Array.isArray(data) ? data : [])
    } catch (err) {
      setError(err.message)
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [debouncedQuery])

  // Debounce the search box, then refetch.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedQuery(query.trim()), SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    loadCustomers()
  }, [loadCustomers])

  // Auto-dismiss toasts.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 4000)
    return () => clearTimeout(timer)
  }, [toast])

  // --- Derived state ------------------------------------------------------
  const stats = useMemo(() => {
    const withEmail = customers.filter((customer) => customer.email).length
    return { showing: customers.length, withEmail }
  }, [customers])

  // --- Handlers -----------------------------------------------------------
  const openCreateModal = () => {
    setEditing(null)
    setModalOpen(true)
  }

  const openEditModal = (customer) => {
    setEditing(customer)
    setModalOpen(true)
  }

  const closeModal = () => {
    if (saving) return
    setModalOpen(false)
    setEditing(null)
  }

  const handleSubmit = async (form) => {
    setSaving(true)
    try {
      const payload = toCustomerPayload(form)
      if (editing?.id) {
        await customerService.update(editing.id, payload)
        setToast({ type: 'success', message: 'Customer updated successfully.' })
      } else {
        await customerService.create(payload)
        setToast({ type: 'success', message: 'Customer created successfully.' })
      }
      setModalOpen(false)
      setEditing(null)
      await loadCustomers()
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setSaving(false)
    }
  }

  const handleConfirmDelete = async () => {
    if (!pendingDelete) return
    setDeleting(true)
    try {
      await customerService.remove(pendingDelete.id)
      setToast({ type: 'success', message: 'Customer deleted.' })
      setPendingDelete(null)
      await loadCustomers()
    } catch (err) {
      setToast({ type: 'error', message: err.message })
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="flex h-full min-h-screen bg-slate-100">
      <Sidebar total={stats.showing} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
          <div>
            <h1 className="text-base font-semibold text-slate-900">Customers</h1>
            <p className="text-xs text-slate-500">
              Showing {stats.showing} record{stats.showing === 1 ? '' : 's'}
              {stats.withEmail > 0 ? ` · ${stats.withEmail} with email` : ''}
            </p>
          </div>
          <span
            className="hidden items-center gap-1.5 rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500 sm:inline-flex"
            title={API_BASE_URL}
          >
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
            API: {API_BASE_URL}
          </span>
        </header>

        <main className="flex-1 space-y-4 overflow-y-auto p-6">
          <SearchBar
            value={query}
            onChange={setQuery}
            onAdd={openCreateModal}
            onRefresh={loadCustomers}
            loading={loading}
          />

          {error && (
            <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <p className="font-medium">Could not load customers</p>
              <p className="mt-0.5">{error}</p>
            </div>
          )}

          <CustomerTable
            customers={customers}
            loading={loading}
            onEdit={openEditModal}
            onDelete={setPendingDelete}
          />
        </main>
      </div>

      <CustomerFormModal
        open={modalOpen}
        customer={editing}
        saving={saving}
        onClose={closeModal}
        onSubmit={handleSubmit}
      />

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title="Delete customer"
        description={
          pendingDelete
            ? `This will permanently remove ${pendingDelete.firstName} ${pendingDelete.lastName}. This action cannot be undone.`
            : ''
        }
        confirmLabel="Delete"
        busy={deleting}
        onCancel={() => (deleting ? null : setPendingDelete(null))}
        onConfirm={handleConfirmDelete}
      />

      <Toast toast={toast} onDismiss={() => setToast(null)} />
    </div>
  )
}
