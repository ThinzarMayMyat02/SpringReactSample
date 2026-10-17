import { PencilIcon, TrashIcon, UsersIcon } from './icons.jsx'
import { avatarColor, formatDate, initials, maskBan } from '../lib/format.js'

function SkeletonRow() {
  return (
    <tr className="border-b border-slate-100">
      {Array.from({ length: 6 }).map((_, index) => (
        <td key={index} className="px-4 py-3">
          <div className="h-4 w-full max-w-[10rem] animate-pulse rounded bg-slate-200" />
        </td>
      ))}
    </tr>
  )
}

export default function CustomerTable({ customers, loading, onEdit, onDelete }) {
  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Customer</th>
              <th scope="col" className="px-4 py-3">Date of birth</th>
              <th scope="col" className="px-4 py-3">Phone</th>
              <th scope="col" className="px-4 py-3">BAN</th>
              <th scope="col" className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading &&
              Array.from({ length: 5 }).map((_, index) => <SkeletonRow key={`skeleton-${index}`} />)}

            {!loading &&
              customers.map((customer) => (
                <tr key={customer.id} className="transition hover:bg-slate-50">
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${avatarColor(
                          `${customer.firstName}${customer.lastName}`,
                        )}`}
                      >
                        {initials(customer.firstName, customer.lastName)}
                      </span>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-900">
                          {customer.firstName} {customer.lastName}
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          {customer.email || 'No email on file'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {formatDate(customer.dateOfBirth)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 text-slate-600">
                    {customer.phoneNumber || '—'}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 font-mono text-slate-600">
                    {maskBan(customer.ban)}
                  </td>
                  <td className="whitespace-nowrap px-4 py-3">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        type="button"
                        onClick={() => onEdit(customer)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-brand-700 hover:bg-brand-50"
                      >
                        <PencilIcon className="h-4 w-4" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(customer)}
                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50"
                      >
                        <TrashIcon className="h-4 w-4" />
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

            {!loading && customers.length === 0 && (
              <tr>
                <td colSpan={5} className="px-4 py-16">
                  <div className="flex flex-col items-center gap-3 text-center">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-400">
                      <UsersIcon className="h-6 w-6" />
                    </span>
                    <div>
                      <p className="font-medium text-slate-700">No customers found</p>
                      <p className="text-sm text-slate-500">
                        Try a different search, or create your first customer.
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
