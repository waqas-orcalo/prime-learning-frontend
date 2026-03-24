'use client'

import { useState, Suspense } from 'react'
import { useTrainerLearners } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const AVATAR_COLORS = ['#1c1c1c', '#3b5bdb', '#2f9e44', '#c92a2a', '#e67700', '#6741d9']

function initials(first: string, last: string) {
  return `${first?.[0] ?? ''}${last?.[0] ?? ''}`.toUpperCase()
}

function Avatar({ firstName, lastName, index }: { firstName: string; lastName: string; index: number }) {
  return (
    <div style={{
      width: 42, height: 42, borderRadius: '50%', flexShrink: 0,
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={font(14, 600, '#fff')}>{initials(firstName, lastName)}</span>
    </div>
  )
}

function LearnerCard({ learner, index }: { learner: any; index: number }) {
  const fullName = `${learner.firstName} ${learner.lastName}`
  const status = learner.status ?? 'active'
  const statusColor = status === 'active' ? '#16a34a' : status === 'inactive' ? '#6b7280' : '#d97706'

  return (
    <div style={{
      border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, padding: '18px 20px',
      display: 'flex', flexDirection: 'column', gap: 14,
      background: '#fff',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <Avatar firstName={learner.firstName} lastName={learner.lastName} index={index} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ ...font(14, 600), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{fullName}</div>
          <div style={{ ...font(12, 400, '#888'), overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{learner.email}</div>
        </div>
        <span style={{
          padding: '3px 10px', borderRadius: 20,
          background: status === 'active' ? '#dcfce7' : '#f3f4f6',
          color: statusColor, ...font(11, 500, statusColor),
        }}>
          {status.charAt(0).toUpperCase() + status.slice(1)}
        </span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={font(11, 400, '#aaa')}>
          Joined {new Date(learner.createdAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
        </span>
        <button style={{
          padding: '5px 14px', background: '#1c1c1c', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer', ...font(12, 500, '#fff'),
        }}>
          View Profile
        </button>
      </div>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, padding: '18px 20px', background: '#fff' }}>
      <div style={{ display: 'flex', gap: 12, marginBottom: 14 }}>
        <div style={{ width: 42, height: 42, borderRadius: '50%', background: '#f0f0f0' }} />
        <div style={{ flex: 1 }}>
          <div style={{ height: 14, width: '60%', background: '#f0f0f0', borderRadius: 4, marginBottom: 6 }} />
          <div style={{ height: 12, width: '80%', background: '#f0f0f0', borderRadius: 4 }} />
        </div>
      </div>
      <div style={{ height: 26, background: '#f0f0f0', borderRadius: 6 }} />
    </div>
  )
}

function LearnersInner() {
  const [search, setSearch] = useState('')

  const { data, isLoading, isError } = useTrainerLearners({ limit: 50, search: search || undefined })
  const learners = data?.data ?? []

  return (
    <div style={{ maxWidth: 1100, ...FF }}>
      <style>{`@keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`}</style>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={font(22, 700)}>My Learners</h1>
        {data?.pagination && (
          <span style={font(13, 400, '#888')}>{data.pagination.total} learner{data.pagination.total !== 1 ? 's' : ''}</span>
        )}
      </div>

      {/* Search */}
      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="Search learners by name or email..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{
            width: '100%', maxWidth: 400, padding: '9px 14px',
            border: '1px solid rgba(28,28,28,0.18)', borderRadius: 8,
            ...font(13), outline: 'none', background: '#fff', boxSizing: 'border-box',
          }}
        />
      </div>

      {/* Error */}
      {isError && (
        <div style={{ padding: '10px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16 }}>
          <span style={font(13, 400, '#ef4444')}>Failed to load learners. Please try again.</span>
        </div>
      )}

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {isLoading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)
          : learners.length === 0
            ? (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px 0', color: '#aaa' }}>
                <p style={font(14)}>No learners found.</p>
              </div>
            )
            : learners.map((learner, i) => <LearnerCard key={learner._id} learner={learner} index={i} />)
        }
      </div>
    </div>
  )
}

export default function LearnersPage() {
  return <Suspense><LearnersInner /></Suspense>
}
