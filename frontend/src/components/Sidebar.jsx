import { GridIcon, SettingsIcon, UsersIcon } from './icons.jsx'

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: GridIcon, disabled: true },
  { id: 'customers', label: 'Customers', icon: UsersIcon, active: true },
  { id: 'settings', label: 'Settings', icon: SettingsIcon, disabled: true },
]

export default function Sidebar({ total = 0 }) {
  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center gap-2 border-b border-slate-200 px-6">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-600 text-white">
          <UsersIcon className="h-5 w-5" />
        </div>
        <div className="leading-tight">
          <p className="text-sm font-semibold text-slate-900">Bank Admin</p>
          <p className="text-xs text-slate-500">Customer Directory</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 px-3 py-4">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          return (
            <button
              key={item.id}
              type="button"
              disabled={item.disabled}
              aria-current={item.active ? 'page' : undefined}
              className={[
                'flex w-full items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition',
                item.active
                  ? 'bg-brand-50 text-brand-700'
                  : 'text-slate-600 hover:bg-slate-100',
                item.disabled ? 'cursor-not-allowed opacity-60 hover:bg-transparent' : '',
              ].join(' ')}
            >
              <Icon className="h-5 w-5" />
              <span>{item.label}</span>
              {item.active && total > 0 && (
                <span className="ml-auto rounded-full bg-brand-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {total}
                </span>
              )}
            </button>
          )
        })}
      </nav>

      <div className="border-t border-slate-200 p-4">
        <div className="rounded-lg bg-slate-50 p-3 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Demo workspace</p>
          <p className="mt-1">Data is stored in your cloud PostgreSQL instance.</p>
        </div>
      </div>
    </aside>
  )
}
