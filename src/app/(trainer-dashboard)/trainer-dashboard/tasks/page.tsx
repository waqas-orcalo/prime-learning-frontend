'use client'

import { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter } from 'next/navigation'
import { useTrainerTasks, useTrainerLearners } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

// ── Status colors matching admin panel ─────────────────────────────────────
const STATUS_MAP: Record<string, { label: string; color: string }> = {
  PENDING:     { label: 'Pending',     color: '#59a8d4' },
  IN_PROGRESS: { label: 'In Progress', color: '#8a8cd9' },
  COMPLETED:   { label: 'Complete',    color: '#4aa785' },
  CANCELLED:   { label: 'Cancelled',   color: 'rgba(28,28,28,0.4)' },
  OVERDUE:     { label: 'Overdue',     color: '#f87171' },
  // lowercase variants
  pending:     { label: 'Pending',     color: '#59a8d4' },
  in_progress: { label: 'In Progress', color: '#8a8cd9' },
  complete:    { label: 'Complete',    color: '#4aa785' },
  completed:   { label: 'Complete',    color: '#4aa785' },
  approved:    { label: 'Approved',    color: '#ffc555' },
  rejected:    { label: 'Rejected',    color: 'rgba(28,28,28,0.4)' },
}

const PERIOD_OPTIONS = ['Show All', 'Today', 'This Week', 'This Month', 'Last Month']
const STATUS_OPTIONS = ['All Statuses', 'Pending task', 'In Progress', 'Complete', 'Overdue', 'Cancelled']

const STATUS_FILTER_MAP: Record<string, string[]> = {
  'All Statuses': [],
  'Pending task': ['PENDING', 'pending'],
  'In Progress':  ['IN_PROGRESS', 'in_progress'],
  'Complete':     ['COMPLETED', 'COMPLETE', 'complete', 'approved'],
  'Overdue':      ['OVERDUE', 'overdue'],
  'Cancelled':    ['CANCELLED', 'cancelled'],
}

// ── Arrow icon ─────────────────────────────────────────────────────────────
function ArrowDown() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0 }}>
      <path d="M4 6l4 4 4-4" stroke="#1c1c1c" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

// ── Custom Dropdown ────────────────────────────────────────────────────────
function DropdownButton({ value, options, onChange }: { value: string; options: string[]; onChange: (v: string) => void }) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...font(14, 400),
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 8px', height: '28px',
          border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px',
          backgroundColor: '#fff', cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        }}
      >
        {value}<ArrowDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '32px', left: 0, zIndex: 100,
          backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '140px', overflow: 'hidden',
        }}>
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onChange(o); setOpen(false) }}
              style={{
                ...font(14, value === o ? 500 : 400, value === o ? '#1c1c1c' : 'rgba(28,28,28,0.7)'),
                display: 'block', width: '100%', padding: '8px 12px',
                background: value === o ? 'rgba(28,28,28,0.04)' : 'transparent',
                border: 'none', textAlign: 'left', cursor: 'pointer',
              }}
            >{o}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Learner Dropdown (with learner list) ───────────────────────────────────
function LearnerDropdown({ value, learners, onChange }: {
  value: string
  learners: Array<{ _id: string; firstName: string; lastName: string }>
  onChange: (v: string) => void
}) {
  const options = [{ _id: '', firstName: 'All', lastName: 'Learners' }, ...learners]
  const selected = options.find(l => l._id === value)
  const label = selected ? `${selected.firstName} ${selected.lastName}` : 'All Learners'
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          ...font(14, 400),
          display: 'flex', alignItems: 'center', gap: '4px',
          padding: '4px 8px', height: '28px',
          border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px',
          backgroundColor: '#fff', cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        }}
      >
        {label}<ArrowDown />
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '32px', left: 0, zIndex: 100,
          backgroundColor: '#fff', border: '1px solid rgba(28,28,28,0.1)',
          borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
          minWidth: '160px', overflow: 'hidden',
        }}>
          {options.map(l => (
            <button
              key={l._id}
              onClick={() => { onChange(l._id); setOpen(false) }}
              style={{
                ...font(14, value === l._id ? 500 : 400, value === l._id ? '#1c1c1c' : 'rgba(28,28,28,0.7)'),
                display: 'block', width: '100%', padding: '8px 12px',
                background: value === l._id ? 'rgba(28,28,28,0.04)' : 'transparent',
                border: 'none', textAlign: 'left', cursor: 'pointer',
              }}
            >{l.firstName} {l.lastName}</button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Status dot + label (matches admin panel) ───────────────────────────────
function StatusLabel({ status }: { status: string }) {
  const st = STATUS_MAP[status] ?? STATUS_MAP[status?.toLowerCase()] ?? { label: status, color: 'rgba(28,28,28,0.4)' }
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <div style={{ width: '16px', height: '16px', position: 'relative', flexShrink: 0 }}>
        <div style={{ position: 'absolute', inset: '31.25%', borderRadius: '50%', backgroundColor: st.color }} />
      </div>
      <span style={font(14, 400, st.color, { whiteSpace: 'nowrap' })}>{st.label}</span>
    </div>
  )
}

function formatDate(dt?: string) {
  if (!dt) return '—'
  const d = new Date(dt)
  if (isNaN(d.getTime())) return dt
  return d.toLocaleDateString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric' }) +
    ' ' + d.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })
}

// ── Table header / cell ────────────────────────────────────────────────────
function TH({ children, align = 'left', width }: { children: React.ReactNode; align?: 'left' | 'center'; width?: string }) {
  return (
    <th style={{
      ...font(14, 400, 'rgba(28,28,28,0.6)', { lineHeight: '18px' }),
      padding: '11px 16px', textAlign: align, fontWeight: 400,
      borderLeft: '1px solid transparent', whiteSpace: 'nowrap',
      width,
    }}>{children}</th>
  )
}
function TD({ children, align = 'left', style: s }: { children: React.ReactNode; align?: 'left' | 'center'; style?: React.CSSProperties }) {
  return (
    <td style={{ padding: '8px 16px', verticalAlign: 'middle', textAlign: align, ...s }}>{children}</td>
  )
}

interface Task {
  _id?: string
  id?: string
  title: string
  status: string
  priority?: string
  dueDate?: string
  createdAt?: string
  updatedAt?: string
  assignedTo?: { _id: string; firstName: string; lastName: string; email?: string }
  createdBy?: { _id: string; firstName: string; lastName: string; email?: string }
}

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
      {[160, undefined, 140, 140, 120, 100].map((w, i) => (
        <td key={i} style={{ padding: '12px 16px' }}>
          <div style={{ height: 13, width: w ?? '70%', background: '#f0f0f0', borderRadius: 4,
            backgroundImage: 'linear-gradient(90deg,#f0f0f0 25%,#e8e8e8 50%,#f0f0f0 75%)',
            backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' }} />
        </td>
      ))}
    </tr>
  )
}

function TasksInner() {
  const router = useRouter()
  const [period, setPeriod] = useState('Show All')
  const [statusFilter, setStatusFilter] = useState('All Statuses')
  const [learnerFilter, setLearnerFilter] = useState('')

  const { data, isLoading, isError, refetch } = useTrainerTasks({ limit: 200 })
  const { data: learnersData } = useTrainerLearners({ limit: 200 })

  const allTasks: Task[] = data?.data ?? []
  const myLearners = learnersData?.data ?? []

  // Client-side filtering
  const filtered = allTasks.filter(t => {
    // Status filter
    const allowed = STATUS_FILTER_MAP[statusFilter]
    if (allowed && allowed.length > 0 && !allowed.includes(t.status)) return false

    // Learner filter
    if (learnerFilter) {
      const assignedId = t.assignedTo?._id ?? ''
      const createdId = t.createdBy?._id ?? ''
      if (assignedId !== learnerFilter && createdId !== learnerFilter) return false
    }

    // Period filter
    if (period !== 'Show All' && t.createdAt) {
      const d = new Date(t.createdAt)
      const now = new Date()
      if (period === 'Today') {
        if (d.toDateString() !== now.toDateString()) return false
      } else if (period === 'This Week') {
        const cutoff = new Date(now); cutoff.setDate(now.getDate() - 7)
        if (d < cutoff) return false
      } else if (period === 'This Month') {
        if (d.getMonth() !== now.getMonth() || d.getFullYear() !== now.getFullYear()) return false
      } else if (period === 'Last Month') {
        const last = new Date(now); last.setMonth(now.getMonth() - 1)
        if (d.getMonth() !== last.getMonth() || d.getFullYear() !== last.getFullYear()) return false
      }
    }
    return true
  })

  const pendingCount = allTasks.filter(t =>
    ['PENDING', 'IN_PROGRESS', 'pending', 'in_progress'].includes(t.status)
  ).length

  return (
    <div>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Assign New Task button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '16px' }}>
        <button
          onClick={() => router.push('/trainer-dashboard/tasks/assign')}
          style={{
            ...font(14, 500, '#fff'),
            backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px',
            padding: '0 16px', height: '34px', cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M7 2v10M2 7h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
          Assign New Task
        </button>
      </div>

      {/* Main card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px rgba(13,10,44,0.08)', overflow: 'hidden' }}>

        {/* Card header */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', display: 'flex', alignItems: 'center', padding: '0 16px', borderRadius: '12px 12px 0 0' }}>
          <span style={font(18, 700, '#000', { letterSpacing: '-0.36px', lineHeight: 'normal' })}>Tasks</span>
        </div>

        {/* Card content */}
        <div style={{ padding: '24px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>

          {/* Filter bar */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', padding: '8px 12px', backgroundColor: 'rgba(28,28,28,0.02)', borderRadius: '8px', border: '1px solid rgba(28,28,28,0.06)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <span style={font(14, 400, '#1c1c1c', { padding: '4px 2px' })}>Learner:</span>
              <LearnerDropdown value={learnerFilter} learners={myLearners} onChange={setLearnerFilter} />
              <span style={font(14, 400, '#1c1c1c', { padding: '4px 2px', marginLeft: '4px' })}>Period:</span>
              <DropdownButton value={period} options={PERIOD_OPTIONS} onChange={setPeriod} />
              <span style={font(14, 400, '#1c1c1c', { padding: '4px 2px', marginLeft: '4px' })}>Status:</span>
              <DropdownButton value={statusFilter} options={STATUS_OPTIONS} onChange={setStatusFilter} />
              <button
                onClick={() => refetch()}
                title="Refresh"
                style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), background: 'none', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '4px 8px', height: '28px', cursor: 'pointer', marginLeft: '4px' }}
              >↻</button>
            </div>

            {pendingCount > 0 && (
              <div style={{ backgroundColor: '#ffe999', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', height: '28px', display: 'flex', alignItems: 'center', padding: '0 8px' }}>
                <span style={font(12, 400, '#1c1c1c', { whiteSpace: 'nowrap' })}>
                  There are {pendingCount} pending task{pendingCount !== 1 ? 's' : ''}!
                </span>
              </div>
            )}
          </div>

          {/* Table */}
          {isError ? (
            <div style={{ padding: '32px', textAlign: 'center' }}>
              <div style={font(14, 400, '#dc2626', { marginBottom: '12px' })}>Failed to load tasks.</div>
              <button onClick={() => refetch()} style={{ ...font(13, 500, '#fff'), backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 16px', cursor: 'pointer' }}>Retry</button>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '700px' }}>
                <colgroup>
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '150px' }} />
                  <col />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '150px' }} />
                  <col style={{ width: '130px' }} />
                  <col style={{ width: '110px' }} />
                </colgroup>
                <thead>
                  <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                    <TH>Learner</TH>
                    <TH>Date Set</TH>
                    <TH align="center">Task (click to view)</TH>
                    <TH align="center">Date Due</TH>
                    <TH align="center">Date Completed</TH>
                    <TH align="center">Status</TH>
                    <TH>Action</TH>
                  </tr>
                </thead>
                <tbody>
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : filtered.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: '40px', textAlign: 'center', ...font(14, 400, 'rgba(28,28,28,0.4)') }}>
                        {allTasks.length === 0 ? 'No tasks yet. Click "Assign New Task" to get started.' : 'No tasks match the selected filters.'}
                      </td>
                    </tr>
                  ) : (
                    filtered.map((t) => {
                      const taskId = t._id || (t as any).id
                      const isComplete = ['COMPLETED', 'complete', 'approved'].includes(t.status?.toLowerCase())
                      const learner = t.assignedTo ?? t.createdBy
                      const learnerName = learner ? `${learner.firstName} ${learner.lastName}` : '—'
                      return (
                        <tr key={taskId} style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}
                          onMouseEnter={e => (e.currentTarget.style.background = 'rgba(28,28,28,0.01)')}
                          onMouseLeave={e => (e.currentTarget.style.background = '')}
                        >
                          <TD>
                            <span style={font(13, 500)}>{learnerName}</span>
                          </TD>
                          <TD>
                            <span style={font(14, 400, '#1c1c1c', { lineHeight: '18px' })}>{formatDate(t.createdAt)}</span>
                          </TD>
                          <TD align="center">
                            <span style={font(14, 400, '#1c1c1c', { lineHeight: '18px', cursor: 'default' })}>
                              {t.title}
                            </span>
                          </TD>
                          <TD align="center">
                            <span style={font(14, 400, '#1c1c1c')}>{t.dueDate ? formatDate(t.dueDate) : '—'}</span>
                          </TD>
                          <TD align="center">
                            <span style={font(14, 400, '#1c1c1c')}>
                              {isComplete && t.updatedAt ? formatDate(t.updatedAt) : '—'}
                            </span>
                          </TD>
                          <td style={{ padding: '8px 12px 8px 16px', verticalAlign: 'middle', height: '40px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <StatusLabel status={t.status} />
                            </div>
                          </td>
                          <TD>
                            <button
                              onClick={() => router.push(`/trainer-dashboard/tasks/${taskId}`)}
                              style={{
                                ...font(14, 400, '#fff', { lineHeight: '20px' }),
                                backgroundColor: '#000', border: 'none', borderRadius: '16px',
                                padding: '0 10px', height: '24px', cursor: 'pointer',
                                whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              }}
                            >
                              More Details
                            </button>
                          </TD>
                        </tr>
                      )
                    })
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function TrainerTasksPage() {
  return (
    <Suspense fallback={<div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading tasks…</div>}>
      <TasksInner />
    </Suspense>
  )
}
