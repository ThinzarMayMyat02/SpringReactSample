import { CloseIcon, PlusIcon, SearchIcon } from './icons.jsx'

export default function SearchBar({ value, onChange, onAdd, onRefresh, loading }) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="relative w-full sm:max-w-md">
        <SearchIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder="Search by name, email, phone or BAN…"
          aria-label="Search customers"
          className="input pl-9 pr-9"
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear search"
            className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <CloseIcon className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button type="button" onClick={onRefresh} disabled={loading} className="btn-secondary">
          Refresh
        </button>
        <button type="button" onClick={onAdd} className="btn-primary">
          <PlusIcon className="h-4 w-4" />
          New customer
        </button>
      </div>
    </div>
  )
}
