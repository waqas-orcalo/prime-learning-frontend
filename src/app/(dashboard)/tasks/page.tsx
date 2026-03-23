'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

// ── Status display mapping (backend enum → UI) ────────────────────────────────
const STATUS_MAP: Record<string, { label: string; dot: string }> = {
  PENDING:    { label: 'Pending',     dot: '#9291a5' },
  IN_PROGRESS:{ label: 'In Progress', dot: '#95b5ff' },
  COMPLETED:  { label: 'Complete',    dot: '#7bc67e' },
  CANCELLED:  { label: 'Cancelled',   dot: '#9ca3af' },
  OVERDUE:    { label: 'Overdue',     dot: '#f87171' },
  // legacy UI labels (in case tasks were created with lowercase)
  Pending:    { label: 'Pending',     dot: '#9291a5' },
  'In Progress':{ label: 'In Progress', dot: '#95b5ff' },
  Complete:   { label: 'Complete',    dot: '#7bc67e' },
  Approved:   { label: 'Approved',    dot: '#f6a723' },
  Rejected:   { label: 'Rejected',    dot: '#9291a5' },
}

const PERIOD_OPTIONS = ['Show All', 'Today', 'This Week', 'This Month', 'Last Month']
const STATUS_OPTIONS = ['All Statuses', 'Pending', 'In Progress', 'Complete', 'Overdue', 'Cancelled']

interface Task {
  _id: string
  title: string
  description?: string
  status: string
  priority: string
  assignedTo?: string
  createdBy?: string
  dueDate?: string
  createdAt?: string
}

function DropdownSelect({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        style={{
          ...FF,
          fontSize: '14px',
          color: '#1c1c1c',
          backgroundColor: '#fff',
          border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px',
          padding: '3px 28px 3px 10px',
          height: '28px',
          appearance: 'none',
          cursor: 'pointer',
          outline: 'none',
        }}
      >
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: 'rgba(28,28,28,0.5)' }}>▾</span>
    </div>
  )
}

function formatDate(dt?: string) {
  if (!dt) return ''
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

export default function TasksPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined

  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [period, setPeriod] = useState('Show All')
  const [statusFilter, setStatusFilter] = useState('All Statuses')

  const isAdmin = ['TRAINER', 'ORG_ADMIN', 'SUPER_ADMIN'].includes((session?.user as any)?.role)

  const loadTasks = async () => {
    if (!token) return
    setLoading(true)
    setError('')
    try {
      const res = await apiFetch<any>('/tasks?page=1&limit=200', token)
      const raw: Task[] = res?.data ?? res?.tasks ?? []
      setTasks(raw)
    } catch (err: any) {
      setError(err?.message ?? 'Failed to load tasks')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (token) loadTasks()
  }, [token])

  // Filter tasks
  const filtered = tasks.filter(t => {
    if (statusFilter !== 'All Statuses') {
      const display = STATUS_MAP[t.status]?.label ?? t.status
      if (display !== statusFilter) return false
    }
    if (period !== 'Show All' && t.dueDate) {
      const due = new Date(t.dueDate)
      const now = new Date()
      if (period === 'Today') {
        if (due.toDateString() !== now.toDateString()) return false
      } else if (period === 'This Week') {
        const weekAgo = new Date(now); weekAgo.setDate(now.getDate() - 7)
        if (due < weekAgo || due > now) return false
      } else if (period === 'This Month') {
        if (due.getMonth() !== now.getMonth() || due.getFullYear() !== now.getFullYear()) return false
      }
    }
    return true
  })

  const pendingCount = tasks.filter(t =>
    t.status === 'PENDING' || t.status === 'IN_PROGRESS' || t.status === 'Pending' || t.status === 'In Progress'
  ).length

  return (
    <div>
      {/* Title row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <h1 style={{ ...font(22, 700), letterSpacing: '-0.44px', lineHeight: '28px', margin: 0 }}>Tasks</h1>
        {isAdmin && (
          <button
            onClick={() => router.push('/tasks/assign')}
            style={{
              ...font(14, 500, '#fff'),
              backgroundColor: '#1c1c1c',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 16px',
              height: '34px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
            Assign New Task
          </button>
        )}
      </div>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={font(14, 400)}>Period:</span>
          <DropdownSelect value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={font(14, 400)}>Status:</span>
          <DropdownSelect value={statusFilter} onChange={setStatusFilter} options={STATUS_OPTIONS} />
        </div>

        {/* Pending badge */}
        {pendingCount > 0 && (
          <div style={{ marginLeft: 'auto' }}>
            <div style={{
              backgroundColor: '#fef9c3',
              border: '1px solid #fde047',
              borderRadius: '8px',
              padding: '4px 12px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <circle cx="7" cy="7" r="6.5" stroke="#ca8a04" strokeWidth="1"/>
                <path d="M7 4v3.5h2.5" stroke="#ca8a04" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              <span style={font(13, 500, '#854d0e')}>There are {pendingCount} pending tasks!</span>
            </div>
          </div>
        )}

        {/* Refresh */}
        <button
          onClick={loadTasks}
          style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), background: 'none', border: '1px solid rgba(28,28,28,0.12)', borderRadius: '8px', padding: '4px 10px', height: '28px', cursor: 'pointer' }}
        >
          ↻ Refresh
        </button>
      </div>

      {/* Table card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 2px 6px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
            <div style={{ marginBottom: '8px' }}>Loading tasks…</div>
          </div>
        ) : error ? (
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <div style={font(14, 400, '#dc2626', { marginBottom: '12px' })}>{error}</div>
            <button onClick={loadTasks} style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}>
              Retry
            </button>
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
            {tasks.length === 0 ? 'No tasks assigned yet.' : 'No tasks match the selected filters.'}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Date Set', 'Task (click to open)', 'Date Due', 'Date Completed', 'Status', 'Action'].map((h, i) => (
                  <th
                    key={h}
                    style={{
                      ...font(14, 400, 'rgba(28,28,28,0.6)'),
                      padding: '12px 16px',
                      textAlign: i === 5 ? 'center' as const : 'left' as const,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => {
                const st = STATUS_MAP[t.status] ?? { label: t.status, dot: '#9291a5' }
                const isComplete = t.status === 'COMPLETED' || t.status === 'Complete'
                return (
                  <tr
                    key={t._id}
                    style={{ borderBottom: idx < filtered.length - 1 ? '1px solid rgba(28,28,28,0.08)' : 'none' }}
                  >
                    <td style={{ ...font(14, 400), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      {formatDate(t.createdAt)}
                    </td>
                    <td style={{ ...font(14, 400), padding: '14px 16px', maxWidth: '320px', verticalAlign: 'middle' }}>
                      {t.title}
                    </td>
                    <td style={{ ...font(14, 400), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      {t.dueDate ? formatDate(t.dueDate) : ''}
                    </td>
                    <td style={{ ...font(14, 400), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                      {isComplete ? formatDate(t.createdAt) : ''}
                    </td>
                    <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: st.dot, flexShrink: 0 }} />
                        <span style={font(14, 400)}>{st.label}</span>
                      </div>
                    </td>
                    <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                      <button
                        onClick={() => router.push(`/tasks/${t._id}`)}
                        style={{
                          ...font(13, 500, '#fff'),
                          backgroundColor: '#1c1c1c',
                          border: 'none',
                          borderRadius: '20px',
                          padding: '5px 14px',
                          height: '28px',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        More Details
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
