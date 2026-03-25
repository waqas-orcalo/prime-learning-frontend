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
  complete:    { bg: '#dcfce7', color: '#15803d', label: 'Complete'    },
  submitted:   { bg: '#dcfce7', color: '#15803d', label: 'Complete'    },
  approved:    { bg: '#dcfce7', color: '#15803d', label: 'Approved'    },
  rejected:    { bg: '#fee2e2', color: '#b91c1c', label: 'Rejected'    },
}

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: '#f3f4f6', color: '#374151', label: status }
  return (
    <span style={{
      padding: '4px 10px', borderRadius: 4,
      background: s.bg,
      color: s.color,
      ...font(11, 500, s.color),
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
  return new Date(d).toLocaleString('en-GB', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

function isOverdueTask(dueDate: string | undefined, status: string): boolean {
  if (!dueDate || status === 'approved' || status === 'complete' || status === 'submitted') return false
  return new Date(dueDate) < new Date()
}

interface Task {
  _id?: string
  id?: string
  title: string
  status: string
  dueDate?: string
  createdAt?: string
  assignedTo?: { firstName: string; lastName: string }
  createdBy?: { firstName: string; lastName: string }
}

interface ReassignModalProps {
  isOpen: boolean
  task: Task | null
  onClose: () => void
}

function ReassignModal({ isOpen, task, onClose }: ReassignModalProps) {
  const [reassignTo, setReassignTo] = useState<'trainer' | 'learner'>('trainer')
  const [comments, setComments] = useState('')

  if (!isOpen || !task) return null

  const handleSubmit = () => {
    // TODO: Call API to reassign task
    console.log('Reassign to:', reassignTo, 'Comments:', comments)
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000
    }}>
      <div style={{
        background: '#fff', borderRadius: 12, maxWidth: 480, width: '90%', boxShadow: '0 10px 40px rgba(0,0,0,0.2)', overflow: 'hidden'
      }}>
        {/* Header */}
        <div style={{
          padding: '16px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
        }}>
          <h2 style={font(16, 700)}>Reassign Task</h2>
          <button
            onClick={onClose}
            style={{
              background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#666', padding: 0, width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}
          >
            ×
          </button>
        </div>

        {/* Yellow warning banner */}
        <div style={{ padding: '10px 16px', background: '#fef9c3', borderBottom: '1px solid #fbbf24' }}>
          <p style={font(13, 500, '#854d0e')}>{task.title}</p>
        </div>

        {/* Content */}
        <div style={{ padding: '20px 20px' }}>
          <p style={font(13, 400, '#555', { marginBottom: 16 })}>
            You can reassign this task to the following user(s). If you need to reassign this task to a different user then you must contact your Centre Manager.
          </p>

          {/* Reassign to label */}
          <label style={font(13, 600, '#1c1c1c', { display: 'block', marginBottom: 12 })}>
            Reassign task to:
          </label>

          {/* Radio buttons */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, cursor: 'pointer' }}>
              <input
                type="radio"
                name="reassign"
                value="trainer"
                checked={reassignTo === 'trainer'}
                onChange={() => setReassignTo('trainer')}
                style={{ display: 'none' }}
              />
              <div style={{
                width: 16, height: 16, borderRadius: '50%', border: '2px solid #1c1c1c',
                background: reassignTo === 'trainer' ? '#1c1c1c' : 'transparent', transition: 'all 0.2s'
              }} />
              <span style={font(13, 400)}>Reassign to Trainer</span>
            </label>

            <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <input
                type="radio"
                name="reassign"
                value="learner"
                checked={reassignTo === 'learner'}
                onChange={() => setReassignTo('learner')}
                style={{ display: 'none' }}
              />
              <div style={{
                width: 16, height: 16, borderRadius: '50%', border: '2px solid #1c1c1c',
                background: reassignTo === 'learner' ? '#1c1c1c' : 'transparent', transition: 'all 0.2s'
              }} />
              <span style={font(13, 400)}>Reassign to Learner</span>
            </label>
          </div>

          {/* Comments label */}
          <label style={font(13, 600, '#1c1c1c', { display: 'block', marginBottom: 8 })}>
            Add additional comments or instructions to recipient (optional):
          </label>

          {/* Textarea */}
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder="Enter your comments here..."
            style={{
              width: '100%', minHeight: 100, padding: '10px 12px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6,
              ...font(13, 400), fontFamily: "'Inter', sans-serif", resize: 'vertical', boxSizing: 'border-box', marginBottom: 20
            }}
          />

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 16px', border: '1px solid rgba(28,28,28,0.2)', background: '#fff', borderRadius: 6,
                cursor: 'pointer', ...font(13, 500), transition: 'all 0.2s'
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              style={{
                padding: '8px 16px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 6,
                cursor: 'pointer', ...font(13, 500, '#fff'), transition: 'all 0.2s'
              }}
            >
              Reassign Task
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function TasksInner() {
  const [cohortFilter, setCohortFilter] = useState('')
  const [learnerFilter, setLearnerFilter] = useState('')
  const [periodFilter, setPeriodFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('pending')
  const [hiddenTasks, setHiddenTasks] = useState<Set<string>>(new Set())
  const [reassignModal, setReassignModal] = useState<{ isOpen: boolean; task: Task | null }>({ isOpen: false, task: null })

  const { data, isLoading, isError } = useTrainerTasks({
    limit: 100,
    status: statusFilter || undefined,
  })

  const tasks = (data?.data ?? []).filter(task => !hiddenTasks.has(task._id || (task as any).id || ''))
  const pendingCount = tasks.filter(t => t.status === 'pending').length

  const handleHideTask = (taskId: string) => {
    const newHidden = new Set(hiddenTasks)
    newHidden.add(taskId)
    setHiddenTasks(newHidden)
  }

  const handleReassignClick = (task: Task) => {
    setReassignModal({ isOpen: true, task })
  }

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '20px', ...FF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={font(28, 700)}>Tasks</h1>
      </div>

      {/* Filter bar */}
      <div style={{
        display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16, flexWrap: 'wrap',
        padding: '12px 16px', background: '#fafafa', borderRadius: 8
      }}>
        {/* Cohort filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={font(12, 500)}>Cohort:</label>
          <select
            value={cohortFilter}
            onChange={e => setCohortFilter(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...font(12),
              background: '#fff', cursor: 'pointer', appearance: 'none', paddingRight: 26,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231c1c1c' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center'
            }}
          >
            <option value="">Show All</option>
          </select>
        </div>

        {/* Learner filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={font(12, 500)}>Learner:</label>
          <select
            value={learnerFilter}
            onChange={e => setLearnerFilter(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...font(12),
              background: '#fff', cursor: 'pointer', appearance: 'none', paddingRight: 26,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231c1c1c' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center'
            }}
          >
            <option value="">Everyone</option>
          </select>
        </div>

        {/* Period filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={font(12, 500)}>Period:</label>
          <select
            value={periodFilter}
            onChange={e => setPeriodFilter(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...font(12),
              background: '#fff', cursor: 'pointer', appearance: 'none', paddingRight: 26,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231c1c1c' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center'
            }}
          >
            <option value="">Show All</option>
          </select>
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <label style={font(12, 500)}>Status:</label>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              padding: '6px 10px', border: '1px solid rgba(28,28,28,0.18)', borderRadius: 6, ...font(12),
              background: '#fff', cursor: 'pointer', appearance: 'none', paddingRight: 26,
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath fill='%231c1c1c' d='M1 1l5 5 5-5'/%3E%3C/svg%3E")`,
              backgroundRepeat: 'no-repeat', backgroundPosition: 'right 6px center'
            }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending task</option>
            <option value="in_progress">In Progress</option>
            <option value="complete">Complete</option>
            <option value="approved">Approved</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Pending badge */}
      {pendingCount > 0 && (
        <div style={{
          padding: '12px 16px', background: '#fed7aa', border: '1px solid #fb923c', borderRadius: 6, marginBottom: 16
        }}>
          <p style={font(13, 500, '#92400e')}>
            There are {pendingCount} pending task{pendingCount !== 1 ? 's' : ''}!
          </p>
        </div>
      )}

      {/* Table card */}
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 8, overflow: 'hidden' }}>
        {/* Error */}
        {isError && (
          <div style={{ padding: '12px 16px', background: '#fef2f2', borderBottom: '1px solid rgba(239,68,68,0.2)' }}>
            <span style={font(12, 400, '#ef4444')}>Failed to load tasks. Please try again.</span>
          </div>
        )}

        {/* Table */}
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={TH}>Date Set</th>
                <th style={TH}>Task</th>
                <th style={TH}>Date Due</th>
                <th style={TH}>Date Completed</th>
                <th style={TH}>Status</th>
                <th style={{ ...TH, textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                : tasks.length === 0
                  ? (
                    <tr>
                      <td colSpan={6} style={{ ...TD, textAlign: 'center', color: '#aaa', padding: '40px' }}>
                        No tasks to display.
                      </td>
                    </tr>
                  )
                  : tasks.map((task, i) => {
                    const taskId = task._id || (task as any).id || i.toString()
                    const overdue = isOverdueTask(task.dueDate, task.status)
                    return (
                      <tr key={taskId}
                        onMouseEnter={e => (e.currentTarget.style.background = '#fafafa')}
                        onMouseLeave={e => (e.currentTarget.style.background = '')}
                      >
                        <td style={TD}>{fmtDate(task.createdAt)}</td>
                        <td style={{ ...TD, maxWidth: 280 }}>
                          <a
                            href="#"
                            onClick={e => e.preventDefault()}
                            style={{
                              color: overdue ? '#E53935' : '#3b5bdb',
                              fontWeight: overdue ? 600 : 400,
                              textDecoration: 'none', cursor: 'pointer'
                            }}
                          >
                            {task.title}
                          </a>
                        </td>
                        <td style={TD}>{fmtDate(task.dueDate)}</td>
                        <td style={TD}>—</td>
                        <td style={TD}><StatusBadge status={task.status} /></td>
                        <td style={{ ...TD, textAlign: 'center' }}>
                          <div style={{ display: 'flex', gap: 8, alignItems: 'center', justifyContent: 'center' }}>
                            <button
                              onClick={() => handleReassignClick(task)}
                              style={{
                                padding: '6px 12px', background: '#1c1c1c', color: '#fff', border: 'none', borderRadius: 4,
                                cursor: 'pointer', ...font(11, 500, '#fff'), transition: 'all 0.2s'
                              }}
                            >
                              Reassign task
                            </button>
                            <button
                              onClick={() => handleHideTask(taskId)}
                              style={{
                                padding: '6px 12px', background: 'transparent', border: '1px solid rgba(28,28,28,0.2)',
                                color: '#1c1c1c', borderRadius: 4, cursor: 'pointer', ...font(11, 500), transition: 'all 0.2s'
                              }}
                            >
                              Hide
                            </button>
                          </div>
                        </td>
                      </tr>
                    )
                  })
              }
            </tbody>
          </table>
        </div>

        {data?.pagination && data.pagination.total > 0 && (
          <div style={{ padding: '12px 16px', borderTop: '1px solid rgba(28,28,28,0.06)', display: 'flex', justifyContent: 'flex-end' }}>
            <span style={font(11, 400, '#888')}>Showing {tasks.length} of {data.pagination.total} tasks</span>
          </div>
        )}
      </div>

      {/* Reassign Modal */}
      <ReassignModal
        isOpen={reassignModal.isOpen}
        task={reassignModal.task}
        onClose={() => setReassignModal({ isOpen: false, task: null })}
      />
    </div>
  )
}

export default function TasksPage() {
  return <Suspense><TasksInner /></Suspense>
}
