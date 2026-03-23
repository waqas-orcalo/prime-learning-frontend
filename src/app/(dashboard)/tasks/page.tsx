'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra } as React.CSSProperties)

// Status config
const STATUS: Record<string, { dot: string; label: string }> = {
  'In Progress': { dot: '#95b5ff', label: 'In Progress' },
  'Complete':    { dot: '#7bc67e', label: 'Complete' },
  'Pending':     { dot: '#9291a5', label: 'Pending' },
  'Approved':    { dot: '#f6a723', label: 'Approved' },
  'Rejected':    { dot: '#9291a5', label: 'Rejected' },
}

const MOCK_TASKS = [
  {
    id: 1,
    dateSet: '19/12/2024 01:59',
    task: 'Complete your new learning activity Q1: learning acc',
    dateDue: '13/02/2025 00:00',
    dateCompleted: '',
    status: 'In Progress',
  },
  {
    id: 2,
    dateSet: '19/12/2024 01:59',
    task: 'Please sign your recently prepared Plan Of Activity/action by Rob Bastow',
    dateDue: '13/02/2025 00:00',
    dateCompleted: '13/03/2025 00:00',
    status: 'Complete',
  },
  {
    id: 3,
    dateSet: '19/12/2024 01:59',
    task: 'Complete your new learning activity Q1: learning acc',
    dateDue: '13/02/2025 00:00',
    dateCompleted: '',
    status: 'Pending',
  },
  {
    id: 4,
    dateSet: '19/12/2024 01:59',
    task: 'You have not recorded any Off-The-Job activity recently. Please record your completed activity.',
    dateDue: '13/02/2025 00:00',
    dateCompleted: '',
    status: 'Approved',
  },
  {
    id: 5,
    dateSet: '19/12/2024 01:59',
    task: 'Complete your new learning activity Q1: learning acc',
    dateDue: '13/02/2025 00:00',
    dateCompleted: '',
    status: 'Rejected',
  },
]

const PERIOD_OPTIONS = ['Show All', 'Today', 'This Week', 'This Month', 'Last Month']
const STATUS_OPTIONS = ['All Statuses', 'Pending task', 'In Progress', 'Complete', 'Approved', 'Rejected']

const DropdownSelect = ({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) => (
  <div style={{ position: 'relative', display: 'inline-block' }}>
    <select
      value={value}
      onChange={e => onChange(e.target.value)}
      style={{
        ...FF,
        fontSize: '14px',
        fontWeight: 400,
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
    {/* caret */}
    <span style={{ position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', fontSize: '10px', color: 'rgba(28,28,28,0.5)' }}>
      ▾
    </span>
  </div>
)

export default function TasksPage() {
  const router = useRouter()
  const [period, setPeriod] = useState('Show All')
  const [status, setStatus] = useState('Pending task')

  const pendingCount = MOCK_TASKS.filter(t => t.status === 'Pending' || t.status === 'In Progress').length

  return (
    <div>
      {/* Page title */}
      <h1 style={{ ...font(22, 700, '#1c1c1c'), letterSpacing: '-0.44px', lineHeight: '28px', marginBottom: '20px' }}>
        Tasks
      </h1>

      {/* Filter bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
        {/* Period filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={font(14, 400, '#1c1c1c')}>Period:</span>
          <DropdownSelect value={period} onChange={setPeriod} options={PERIOD_OPTIONS} />
        </div>

        {/* Status filter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={font(14, 400, '#1c1c1c')}>Status:</span>
          <DropdownSelect value={status} onChange={setStatus} options={STATUS_OPTIONS} />
        </div>

        {/* Pending tasks badge */}
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
      </div>

      {/* Tasks table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
              {['Date Set', 'Task (click to open)', 'Date Due', 'Date Completed', 'Status', 'Action'].map((h, i) => (
                <th
                  key={h}
                  style={{
                    ...font(14, 400, 'rgba(28,28,28,0.6)'),
                    padding: '12px 16px',
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
                    fontWeight: 400,
                    ...(i === 5 ? { textAlign: 'center' as const } : {}),
                  }}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {MOCK_TASKS.map((t, idx) => {
              const st = STATUS[t.status] ?? STATUS['Pending']
              return (
                <tr
                  key={t.id}
                  style={{ borderBottom: idx < MOCK_TASKS.length - 1 ? '1px solid rgba(28,28,28,0.08)' : 'none' }}
                >
                  {/* Date Set */}
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                    {t.dateSet}
                  </td>

                  {/* Task */}
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 16px', maxWidth: '320px', verticalAlign: 'middle' }}>
                    {t.task}
                  </td>

                  {/* Date Due */}
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                    {t.dateDue}
                  </td>

                  {/* Date Completed */}
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '14px 16px', whiteSpace: 'nowrap', verticalAlign: 'middle' }}>
                    {t.dateCompleted || ''}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px', verticalAlign: 'middle' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: st.dot, flexShrink: 0 }} />
                      <span style={font(14, 400, '#1c1c1c')}>{st.label}</span>
                    </div>
                  </td>

                  {/* Action */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', verticalAlign: 'middle' }}>
                    <button
                      onClick={() => router.push(`/tasks/${t.id}`)}
                      style={{
                        backgroundColor: '#1c1c1c',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '20px',
                        padding: '5px 14px',
                        height: '28px',
                        ...font(13, 500, '#fff'),
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
      </div>
    </div>
  )
}
