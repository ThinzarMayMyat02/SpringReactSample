/** Small, dependency-free formatting helpers. */

/** 1990-05-14 -> "14 May 1990" */
export function formatDate(isoDate) {
  if (!isoDate) return '—'
  const date = new Date(`${isoDate}T00:00:00`)
  if (Number.isNaN(date.getTime())) return isoDate
  return date.toLocaleDateString(undefined, {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

/** "Ada Lovelace" -> "AL" */
export function initials(firstName = '', lastName = '') {
  const first = firstName.trim().charAt(0)
  const last = lastName.trim().charAt(0)
  return `${first}${last}`.toUpperCase() || '?'
}

/** Masks all but the last 4 characters, e.g. IBAN/BAN privacy in the table. */
export function maskBan(ban) {
  if (!ban) return '—'
  const value = ban.replace(/\s+/g, '')
  if (value.length <= 4) return value
  return `•••• ${value.slice(-4)}`
}

/** Deterministic avatar colour so the same person keeps the same tint. */
const AVATAR_COLORS = [
  'bg-brand-100 text-brand-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
  'bg-sky-100 text-sky-700',
  'bg-violet-100 text-violet-700',
]

export function avatarColor(seed = '') {
  let hash = 0
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) % AVATAR_COLORS.length
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length]
}
