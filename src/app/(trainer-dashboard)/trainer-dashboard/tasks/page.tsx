'use client'

import { useState, Suspense } from 'react'
import { useTrainerTasks } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const TH: React.CSSProperties = { padding: '10px 14px', ...font(12, 500, '#555') as object, textAlign: 'left', borderBottom: '1px solid rgba(28,28,28,0.1)', background: '#fafafa', whiteSpace: 'nowrap' }
const TD: React.CSSProperties = { padding: '12px 14px', ...font(12) as object, borderBottom: '1px solid rgba(28,28,28,0.06)', verticalAlign: 'middle' }

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
  pending:     { bg: '#fef9c3', color: '#854d0e', label: 'Pending'     },
  in_progress: { bg: '#dbeafe', color: '#1e40af', label: 'In Progress' },
  completed:   { bg: '#dcfce7', color: '#15803d', label: 'Completed'   },
  submitted:   { bg: '#ede9fe', color: '#6d28d9', label: 'Submitted'   },
  approved:    { bg: '#dcfce7', color: '#15803d', label: 'Approved'    },
  rejected:    { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected'    },
}

const STATUS_OPTIONS = ['', 'pending', 'in_progress', 'completed', 'submitted', 'approved', 'rejected']

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#f3f4f6', color: '#374151', label: status }
  const isOverdue = false // could check dueDate
  return (
    <span style={{
      padding: '3px 10px', borderRadius: 20,
      background: isOverdue ? '#fee2e2' : s.bg,
      color: isOverdue ? '#b91c1c' : s.color,
      ...font(11, 500, isOverdue ? '#b91c1c' : s.color),
    }}>
      {s.label}
    </span>
  )
}

function SkeletonRow() {
  return (
    <tr>
      {Array.from({ length: 6 }).map((_, i) => (
        <td key={i} style={TD}>
          <div style={{ height: 13, width: i === 1 ? '70%' : '50%', background: '#f0f0f0', borderRadius: 4 }} />
        </td>
      ))}
    </tr>
  )
}

function fmtDate(d: string | undefined) {
  if (!d) return '—'
  return new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function TasksInner() {
  const [statusFilter, setStatusFilter] = useState('')

  const { data, isLoading, isError } = useTrainerTasks({
    limit: 100,
    status: statusFilter || undefined,
  })

  const tasks = data?.data ?? []
  const pending = tasks.filter(t => t.status === 'pending').length

  return (
    <div style={{ maxWidth: 1100, ...FF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={font(22, 700)}>Tasks</h1>
        {pending > 0 && (
          <span style={{
            padding: '5px 14px', background: '#fef9c3', border: '1px solid #fbbf24',
            borderRadius: 20, ...font(12, 600, '#854d0e'),
          }}>
            ⏳ {pending} pending task{pending !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Table card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden' }}>
        {/* Filters */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.08)', flexWrap: 'wrap' }}>
          <span style={font(13, 600)}>All Tasks</span>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 10, alignItems: 'center' }}>
            <span style={font(12, 500)}>Status:</span>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '5px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...font(12), background: '#fff', cursor: 'pointer' }}
            >
              {STATUS_OPTIONS.map(s => (
                <option key={s} value={s}>{s ? s.replace('_', ' ').replace(/^\w/, c => c.toUpperCase()) : 'All Statuses'}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Error */}
        {isError && (
          <div style={{ padding: '10px 16px', background: '#fef2f2', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={font(12, 400, '#ef4444')}>Failed to load tasks. Please try again.</span>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Task Title</th>
                <th style={TH}>Assigned To</th>
                <th style={TH}>Date Set</th>
                <th style={TH}>Due Date</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign: 'center' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : tasks.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: '40px' }}>
                        No tasks found.
                      </td>
                    </tr>
                  )
                  : tasks.map((task, i) => (
                    <tr key={task._id || i}
                      onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                      onMouseLeave={e => (e.currentTarget.style.background = '')}
                    >
                      <td style={{ ...TD, maxWidth: 280 }}>
                        <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {task.title}
                        </span>
                      </td>
                      <td style={TD}>
                        {task.assignedTo
                          ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                          : task.createdBy
                            ? `${task.createdBy.firstName} ${task.createdBy.lastName}`
                            : '—'}
                      </td>
                      <td style={TD}>{fmtDate(task.createdAt)}</td>
                      <td style={TD}>{fmtDate(task.dueDate)}</td>
                      <td style={TD}><StatusBadge status={task.status} /></td>
                      <td style={{ ...TD, textAlign: 'center' }}>
                        <button style={{
                          padding: '5px 14px', background: '#1c1c1c', color: '#fff',
                          border: 'none', borderRadius: 6, cursor: 'pointer', ...font(11, 500, '#fff'),
                        }}>
                          View
                        </button>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.total > 0 && (
          <div style={{ padding: '10px 16px', borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={font(11, 400, '#888')}>Showing {tasks.length} of {data.pagination.total} tasks</span>
          </div>
        )}
      </div>
    </div>
  )
}

export default function TasksPage() {
  return <Suspense><TasksInner /></Suspense>
}
