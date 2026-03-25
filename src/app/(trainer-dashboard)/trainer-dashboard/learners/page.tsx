'use client'

import { useState, Suspense } from 'react'
import { useTrainerLearners } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const AVATAR_COLORS = ['#1c1c1c', '#3b5bdb', '#2f9e44', '#c92a2a', '#e67700', '#6741d9']

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr)
  const now = new Date()
  const diffMs = now.getTime() - d.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  if (diffMins < 60) return `${diffMins} min ago`
  const diffHours = Math.floor(diffMins / 60)
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`
  const diffDays = Math.floor(diffHours / 24)
  if (diffDays === 1) return 'Yesterday'
  if (diffDays < 30) return `${diffDays} days ago`
  return d.toLocaleDateString()
}

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

function getStatusFromProgress(percent: number): 'On Track' | 'Behind' | 'At Risk' {
  if (percent >= 60) return 'On Track'
  if (percent >= 30) return 'Behind'
  return 'At Risk'
}

function getStatusBadgeColors(status: string) {
  switch (status) {
    case 'On Track':
      return { bg: '#dcfce7', color: '#15803d' }
    case 'Behind':
      return { bg: '#fef3c7', color: '#92400e' }
    case 'At Risk':
      return { bg: '#fee2e2', color: '#b91c1c' }
    default:
      return { bg: '#f3f4f6', color: '#6b7280' }
  }
}

function getProgressBarColor(status: string): string {
  switch (status) {
    case 'On Track':
      return '#15803d'
    case 'Behind':
      return '#92400e'
    case 'At Risk':
      return '#b91c1c'
    default:
      return '#6b7280'
  }
}

function Avatar({ firstName, lastName, index }: { firstName: string; lastName: string; index: number }) {
  return (
    <div style={{
      width: 48, height: 48, borderRadius: '50%', flexShrink: 0,
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={font(16, 600, '#fff')}>{initials(firstName, lastName)}</span>
    </div>
  )
}

function FilterChip({
  label,
  count,
  isActive,
  onClick,
}: {
  label: string
  count?: number
  isActive: boolean
  onClick: () => void
}) {
  const bgColor = isActive ? '#1c1c1c' : '#fff'
  const textColor = isActive ? '#fff' : '#1c1c1c'
  const borderColor = isActive ? '#1c1c1c' : 'rgba(28,28,28,0.15)'

  return (
    <button
      onClick={onClick}
      style={{
        padding: '8px 16px',
        borderRadius: 8,
        border: `1px solid ${borderColor}`,
        background: bgColor,
        ...font(13, 500, textColor),
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        whiteSpace: 'nowrap',
      }}
    >
      {label}
      {count !== undefined && label !== 'All' && <span>({count})</span>}
    </button>
  )
}

function LearnerCard({ learner, index }: { learner: any; index: number }) {
  const fullName = `${learner.firstName} ${learner.lastName}`

  // Use real data from API if available, fallback to defaults
  const programme = learner.programme || 'Not Assigned'
  const employer = learner.employer || 'Not Assigned'

  // Use real stats from enriched API response
  const stats = learner.stats
  const progressPercent = stats?.progressPercent ?? 0
  const completedUnits = stats?.completedTasks ?? 0
  const totalUnits = stats?.totalTasks ?? 0

  // Get status based on progress
  const status = getStatusFromProgress(progressPercent)
  const statusColors = getStatusBadgeColors(status)
  const progressBarColor = getProgressBarColor(status)

  // Real data from stats
  const pendingTasks = stats?.pendingTasks ?? 0
  const unreadMessages = stats?.unreadMessages ?? 0

  // Format last activity
  const lastActivityAt = learner.lastActivityAt
  const lastActivity = lastActivityAt
    ? formatTimeAgo(lastActivityAt)
    : 'Never'

  return (
    <div
      style={{
        border: '1px solid rgba(28,28,28,0.1)',
        borderRadius: 12,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        background: '#fff',
      }}
    >
      {/* Top row: Avatar + Name/Programme/Employer + Status Badge */}
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
        <Avatar firstName={learner.firstName} lastName={learner.lastName} index={index} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...font(14, 600), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {fullName}
          </div>
          <div style={{ ...font(12, 400, '#666'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {programme}
          </div>
          <div style={{ ...font(12, 400, '#999'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {employer}
          </div>
        </div>
        <span
          style={{
            padding: '4px 10px',
            borderRadius: 20,
            background: statusColors.bg,
            color: statusColors.color,
            ...font(11, 500, statusColors.color),
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {status}
        </span>
      </div>

      {/* Progress section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
        <div style={{ ...font(12, 600, '#1c1c1c') }}>Overall Progress</div>
        <div style={{ ...font(12, 400, '#666') }}>
          {completedUnits}/{totalUnits} tasks · {progressPercent}%
        </div>
        <div
          style={{
            width: '100%',
            height: 6,
            background: 'rgba(28,28,28,0.08)',
            borderRadius: 3,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              height: '100%',
              width: `${progressPercent}%`,
              background: progressBarColor,
              transition: 'width 0.3s ease',
            }}
          />
        </div>
      </div>

      {/* Bottom row: Meta items + View profile button */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#666', flex: 1, minWidth: 0 }}>
          {/* Pending tasks */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            <span style={font(11, 400, '#666')}>
              {pendingTasks} task{pendingTasks !== 1 ? 's' : ''}
            </span>
            {pendingTasks > 3 && (
              <div
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: '50%',
                  background: '#ef4444',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  ...font(10, 700, '#fff'),
                }}
              >
                !
              </div>
            )}
          </div>

          {/* Messages */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap' }}>
            {unreadMessages > 0 ? (
              <>
                <span style={font(11, 400, '#666')}>{unreadMessages} new</span>
                <div
                  style={{
                    minWidth: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#3b5bdb',
                    color: '#fff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    ...font(10, 600, '#fff'),
                  }}
                >
                  {unreadMessages}
                </div>
              </>
            ) : (
              <span style={font(11, 400, '#999')}>No messages</span>
            )}
          </div>

          {/* Last activity */}
          <span style={font(11, 400, '#999')}>Last active {lastActivity}</span>
        </div>

        {/* View profile button */}
        <button
          style={{
            padding: '6px 14px',
            background: '#fff',
            color: '#1c1c1c',
            border: '1px solid rgba(28,28,28,0.2)',
            borderRadius: 6,
            cursor: 'pointer',
            ...font(12, 500, '#1c1c1c'),
            whiteSpace: 'nowrap',
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f5f5f5'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.2)'
          }}
        >
          View profile
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, padding: '16px', background: '#fff' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f0f0f0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '60%', background: '#f0f0f0', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 12, width: '80%', background: '#f0f0f0', borderRadius: 4, marginBottom: 4 }} />
          <div style={{ height: 12, width: '70%', background: '#f0f0f0', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, marginBottom: 12 }} />
      <div style={{ display: 'flex', gap: 8 }}>
        <div style={{ height: 20, width: '20%', background: '#f0f0f0', borderRadius: 4 }} />
        <div style={{ height: 20, width: '25%', background: '#f0f0f0', borderRadius: 4 }} />
      </div>
    </div>
  )
}

function LearnersInner() {
  const [filter, setFilter] = useState<'All' | 'On Track' | 'Behind' | 'At Risk'>('All')

  const { data, isLoading, isError } = useTrainerLearners({ limit: 50 })
  const learners = data?.data ?? []

  // Calculate status counts using real stats from API
  const onTrackCount = learners.filter((l: any) => {
    const pct = l.stats?.progressPercent ?? 0
    return getStatusFromProgress(pct) === 'On Track'
  }).length
  const behindCount = learners.filter((l: any) => {
    const pct = l.stats?.progressPercent ?? 0
    return getStatusFromProgress(pct) === 'Behind'
  }).length
  const atRiskCount = learners.filter((l: any) => {
    const pct = l.stats?.progressPercent ?? 0
    return getStatusFromProgress(pct) === 'At Risk'
  }).length

  // Filter learners based on selected filter
  const filteredLearners =
    filter === 'All'
      ? learners
      : learners.filter((l: any) => {
          const pct = l.stats?.progressPercent ?? 0
          return getStatusFromProgress(pct) === filter
        })

  return (
    <div style={{ maxWidth: 1200, ...FF }}>
      <style>{`
        @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
        @media(max-width:480px){
          .learners-grid { grid-template-columns: 1fr !important; }
          .learners-topbar { flex-direction: column !important; align-items: flex-start !important; }
          .learners-topbar .more-filters-btn { margin-left: 0 !important; }
        }
      `}</style>

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={font(28, 700)}>My Learners</h1>
      </div>

      {/* Top bar with filter chips and more filters button */}
      <div className="learners-topbar" style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        {/* Filter chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <FilterChip label="All" isActive={filter === 'All'} onClick={() => setFilter('All')} />
          <FilterChip
            label="On Track"
            count={onTrackCount}
            isActive={filter === 'On Track'}
            onClick={() => setFilter('On Track')}
          />
          <FilterChip
            label="Behind"
            count={behindCount}
            isActive={filter === 'Behind'}
            onClick={() => setFilter('Behind')}
          />
          <FilterChip
            label="At Risk"
            count={atRiskCount}
            isActive={filter === 'At Risk'}
            onClick={() => setFilter('At Risk')}
          />
        </div>

        {/* More filters button */}
        <button
          style={{
            marginLeft: 'auto',
            padding: '8px 14px',
            background: '#fff',
            color: '#1c1c1c',
            border: '1px solid rgba(28,28,28,0.2)',
            borderRadius: 6,
            cursor: 'pointer',
            ...font(12, 500, '#1c1c1c'),
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            transition: 'all 0.2s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = '#f5f5f5'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.3)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = '#fff'
            e.currentTarget.style.borderColor = 'rgba(28,28,28,0.2)'
          }}
        >
          <svg width={16} height={16} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth={1.5}>
            <line x1={2} y1={4} x2={14} y2={4} />
            <line x1={3} y1={8} x2={13} y2={8} />
            <line x1={4} y1={12} x2={12} y2={12} />
          </svg>
          More filters
        </button>
      </div>

      {/* Error state */}
      {isError && (
        <div style={{ padding: '12px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 24 }}>
          <span style={font(13, 400, '#ef4444')}>Failed to load learners. Please try again.</span>
        </div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="learners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      ) : filteredLearners.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#aaa' }}>
          <p style={font(16, 400, '#aaa')}>
            {filter === 'All' ? 'No learners found.' : `No learners ${filter.toLowerCase()}.`}
          </p>
        </div>
      ) : (
        <div className="learners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {filteredLearners.map((learner: any, i: number) => (
            <LearnerCard key={learner._id} learner={learner} index={i} />
          ))}
        </div>
      )}
    </div>
  )
}

export default function LearnersPage() {
  return (
    <Suspense fallback={<div style={{ padding: '60px 20px', textAlign: 'center', color: '#aaa' }}>Loading learners...</div>}>
      <LearnersInner />
    </Suspense>
  )
}
