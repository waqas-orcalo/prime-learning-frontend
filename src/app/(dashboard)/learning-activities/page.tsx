'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

/* ── inline SVG helpers ── */
const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconPlus = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M8 3v10M3 8h10" stroke="#fff" stroke-width="1.8" stroke-linecap="round"/></svg>`)
const iconSearch = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><circle cx="7" cy="7" r="4.5" stroke="#1c1c1c" stroke-width="1.3" opacity=".45"/><path d="M11 11l2.5 2.5" stroke="#1c1c1c" stroke-width="1.3" stroke-linecap="round" opacity=".45"/></svg>`)
const iconChevLeft = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M10 12L6 8l4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="none"><path d="M6 4l4 4-4 4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

/* ── helpers ── */
function formatMethod(method: string): string {
  return method.split('_').map(w => w.charAt(0) + w.slice(1).toLowerCase()).join(' ')
}

function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const d = String(date.getDate()).padStart(2, '0')
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const y = date.getFullYear()
  return `${d}/${m}/${y}`
}

function formatActionRequiredBy(val: string): string {
  if (!val) return '—'
  return val.charAt(0).toUpperCase() + val.slice(1).toLowerCase()
}

/* ── types ── */
type Status = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
interface Activity {
  id: string
  ref: string
  title: string
  method: string
  date: string
  trainerTime: number
  learnerTime: number
  plan: string
  actionRequiredBy: string
  status: Status
  addToShowcase: boolean
}

const STATUS_OPTIONS = [
  { label: 'All', value: '' },
  { label: 'Pending', value: 'PENDING' },
  { label: 'In Progress', value: 'IN_PROGRESS' },
  { label: 'Completed', value: 'COMPLETED' },
  { label: 'Cancelled', value: 'CANCELLED' },
]
const PER_PAGE_OPTIONS = [10, 20, 50]

const STATUS_COLORS: Record<Status, string> = {
  PENDING: '#f59e0b',
  IN_PROGRESS: '#3b82f6',
  COMPLETED: '#22c55e',
  CANCELLED: '#ef4444',
}

function StatusBadge({ status }: { status: Status }) {
  const labels: Record<Status, string> = { PENDING: 'Pending', IN_PROGRESS: 'In Progress', COMPLETED: 'Completed', CANCELLED: 'Cancelled' }
  const color = STATUS_COLORS[status] ?? '#9ca3af'
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      padding: '3px 8px', borderRadius: '20px',
      backgroundColor: color + '18',
      ...font(12, 500, color),
    }}>
      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: color, flexShrink: 0 }} />
      {labels[status] ?? status}
    </span>
  )
}

export default function LearningActivitiesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken

  const [activities, setActivities] = useState<Activity[]>([])
  const [loading, setLoading] = useState(true)

  /* pagination state */
  const [page, setPage] = useState(1)
  const [limit, setLimit] = useState(10)
  const [total, setTotal] = useState(0)
  const [totalPages, setTotalPages] = useState(1)

  /* filter / search state — these drive API calls */
  const [statusFilter, setStatusFilter] = useState('')
  const [search, setSearch] = useState('')
  const [filterOpen, setFilterOpen] = useState(false)

  /* debounce search */
  const searchTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [debouncedSearch, setDebouncedSearch] = useState('')

  const handleSearchChange = (val: string) => {
    setSearch(val)
    if (searchTimer.current) clearTimeout(searchTimer.current)
    searchTimer.current = setTimeout(() => {
      setDebouncedSearch(val)
      setPage(1)
    }, 400)
  }

  const handleStatusChange = (val: string) => {
    setStatusFilter(val)
    setFilterOpen(false)
    setPage(1)
  }

  const handleLimitChange = (val: number) => {
    setLimit(val)
    setPage(1)
  }

  /* fetch from API */
  const loadActivities = useCallback(async () => {
    if (!token) { setLoading(false); return }
    setLoading(true)
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: String(limit),
      })
      if (debouncedSearch.trim()) params.set('search', debouncedSearch.trim())
      if (statusFilter) params.set('status', statusFilter)

      const response = await apiFetch<any>(`/learning-activities?${params.toString()}`, token)

      const mapped = (response.data as any[]).map((a: any) => ({
        id: a._id,
        ref: a.ref || 'LA' + Math.random().toString(36).substr(2, 5),
        title: a.title,
        method: formatMethod(a.method),
        date: formatDate(a.activityDate),
        trainerTime: a.trainerTimeMinutes ?? a.trainerTime ?? 0,
        learnerTime: a.learnerTimeMinutes ?? a.learnerTime ?? 0,
        plan: a.planOfActivityRef || a.plan || 'None',
        actionRequiredBy: formatActionRequiredBy(a.actionRequiredBy || 'LEARNER'),
        status: a.status || 'PENDING',
        addToShowcase: a.addToShowcase || false,
      }))

      setActivities(mapped)
      setTotal(response.pagination?.total ?? mapped.length)
      setTotalPages(response.pagination?.totalPages ?? 1)
    } catch (err) {
      console.error('Failed to load activities:', err)
      setActivities([])
    } finally {
      setLoading(false)
    }
  }, [token, page, limit, debouncedSearch, statusFilter])

  useEffect(() => { loadActivities() }, [loadActivities])

  const toggleShowcase = (id: string) =>
    setActivities(prev => prev.map(a => a.id === id ? { ...a, addToShowcase: !a.addToShowcase } : a))

  const openActivity = (id: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('currentActivityId', id)
      const act = activities.find(a => a.id === id)
      if (act) localStorage.setItem('currentActivity', JSON.stringify(act))
    }
    router.push(`/learning-activities/evidence?id=${id}`)
  }

  /* pagination helpers */
  const from = total === 0 ? 0 : (page - 1) * limit + 1
  const to = Math.min(page * limit, total)

  const selectedLabel = STATUS_OPTIONS.find(o => o.value === statusFilter)?.label ?? 'All'

  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {/* Left: filter + search */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* Status filter dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setFilterOpen(v => !v)}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', padding: '7px 12px', cursor: 'pointer', ...font(13, 400) }}
            >
              Show: {selectedLabel}
              <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
            </button>
            {filterOpen && (
              <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '4px', backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', boxShadow: '0 4px 16px rgba(0,0,0,0.1)', zIndex: 50, minWidth: '150px', overflow: 'hidden' }}>
                {STATUS_OPTIONS.map(opt => (
                  <div
                    key={opt.value}
                    onClick={() => handleStatusChange(opt.value)}
                    style={{ padding: '10px 14px', cursor: 'pointer', ...font(13, statusFilter === opt.value ? 600 : 400), backgroundColor: statusFilter === opt.value ? 'rgba(28,28,28,0.05)' : 'transparent' }}
                    onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                    onMouseLeave={e => (e.currentTarget.style.backgroundColor = statusFilter === opt.value ? 'rgba(28,28,28,0.05)' : 'transparent')}
                  >
                    {opt.label}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Search */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', padding: '7px 12px' }}>
            <img src={iconSearch} alt="" style={{ width: '14px', height: '14px' }} />
            <input
              type="text"
              value={search}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search by title or ref…"
              style={{ border: 'none', outline: 'none', background: 'transparent', ...font(13), width: '200px' }}
            />
          </div>
        </div>

        {/* Right: Create */}
        <button
          onClick={() => router.push('/learning-activities/new-activity')}
          style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', ...font(14, 600, '#fff'), display: 'flex', alignItems: 'center', gap: '6px' }}
        >
          <img src={iconPlus} alt="" style={{ width: '14px', height: '14px' }} />
          Create Learning Activity
        </button>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {/* Table header */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.03)', padding: '0 20px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                {[
                  { label: 'Date', w: '90px' },
                  { label: 'Ref', w: '80px' },
                  { label: 'Learning Activity Title', w: undefined },
                  { label: 'Method', w: '130px' },
                  { label: 'Trainer Time (min)', w: '120px' },
                  { label: 'Learner Time (min)', w: '120px' },
                  { label: 'Plan of Activity', w: '110px' },
                  { label: 'Action Required By', w: '130px' },
                  { label: 'Status', w: '110px' },
                  { label: 'Showcase', w: '80px' },
                ].map(col => (
                  <th key={col.label} style={{ ...font(12, 500, 'rgba(28,28,28,0.5)'), padding: '12px 8px', textAlign: 'left', fontWeight: 500, whiteSpace: 'nowrap', width: col.w }}>
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
          </table>
        </div>

        <div style={{ padding: '0 20px' }}>
          {loading ? (
            <div style={{ padding: '40px 0', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
              Loading…
            </div>
          ) : activities.length === 0 ? (
            <div style={{ padding: '40px 0', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
              No learning activities found.
            </div>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {activities.map((row) => (
                  <tr key={row.id} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                    <td style={{ ...font(13), padding: '13px 8px', width: '90px' }}>{row.date}</td>
                    <td style={{ ...font(13, 500), padding: '13px 8px', width: '80px' }}>{row.ref}</td>
                    <td style={{ padding: '13px 8px' }}>
                      <span
                        onClick={() => openActivity(row.id)}
                        style={{ ...font(13, 400, '#4169e1'), cursor: 'pointer', textDecoration: 'underline' }}
                      >
                        {row.title}
                      </span>
                    </td>
                    <td style={{ ...font(13), padding: '13px 8px', width: '130px' }}>{row.method}</td>
                    <td style={{ ...font(13), padding: '13px 8px', width: '120px', textAlign: 'center' }}>{row.trainerTime}</td>
                    <td style={{ ...font(13), padding: '13px 8px', width: '120px', textAlign: 'center' }}>{row.learnerTime}</td>
                    <td style={{ ...font(13), padding: '13px 8px', width: '110px' }}>{row.plan}</td>
                    <td style={{ ...font(13), padding: '13px 8px', width: '130px' }}>{row.actionRequiredBy}</td>
                    <td style={{ padding: '13px 8px', width: '110px' }}><StatusBadge status={row.status} /></td>
                    <td style={{ padding: '13px 8px', width: '80px', textAlign: 'center' }}>
                      <input
                        type="checkbox"
                        checked={row.addToShowcase}
                        onChange={() => toggleShowcase(row.id)}
                        style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Footer: record count + pagination */}
        <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          {/* Left: record info */}
          <span style={{ ...font(13, 400, 'rgba(28,28,28,0.5)') }}>
            {total === 0 ? '0 records' : `${from}–${to} of ${total} record${total !== 1 ? 's' : ''}`}
          </span>

          {/* Right: per-page + page nav */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {/* Per page */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ ...font(13, 400, 'rgba(28,28,28,0.5)') }}>Rows per page:</span>
              <div style={{ position: 'relative' }}>
                <select
                  value={limit}
                  onChange={e => handleLimitChange(Number(e.target.value))}
                  style={{ appearance: 'none', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', padding: '4px 28px 4px 10px', cursor: 'pointer', ...font(13), outline: 'none' }}
                >
                  {PER_PAGE_OPTIONS.map(n => (
                    <option key={n} value={n}>{n}</option>
                  ))}
                </select>
                <img src={iconCaretDown} alt="" style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', width: '12px', height: '12px', pointerEvents: 'none' }} />
              </div>
            </div>

            {/* Page nav */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', cursor: page <= 1 ? 'not-allowed' : 'pointer', opacity: page <= 1 ? 0.4 : 1 }}
              >
                <img src={iconChevLeft} alt="Prev" style={{ width: '14px', height: '14px' }} />
              </button>

              {/* Page number pills */}
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .reduce<(number | '...')[]>((acc, p, i, arr) => {
                  if (i > 0 && typeof arr[i - 1] === 'number' && (p as number) - (arr[i - 1] as number) > 1) acc.push('...')
                  acc.push(p)
                  return acc
                }, [])
                .map((p, i) =>
                  p === '...' ? (
                    <span key={`ellipsis-${i}`} style={{ ...font(13, 400, 'rgba(28,28,28,0.4)'), padding: '0 4px' }}>…</span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => setPage(p as number)}
                      style={{
                        minWidth: '30px', height: '30px', padding: '0 6px',
                        border: '1px solid ' + (page === p ? '#1c1c1c' : 'rgba(28,28,28,0.15)'),
                        borderRadius: '6px',
                        backgroundColor: page === p ? '#1c1c1c' : '#fff',
                        cursor: 'pointer',
                        ...font(13, page === p ? 600 : 400, page === p ? '#fff' : '#1c1c1c'),
                      }}
                    >
                      {p}
                    </button>
                  )
                )}

              <button
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '30px', height: '30px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', cursor: page >= totalPages ? 'not-allowed' : 'pointer', opacity: page >= totalPages ? 0.4 : 1 }}
              >
                <img src={iconChevRight} alt="Next" style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
