'use client'

import { Suspense } from 'react'
import { useTrainerLearners } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const AVATAR_COLORS = ['#1c1c1c', '#3b5bdb', '#2f9e44', '#c92a2a', '#e67700', '#6741d9']

function ProgressRow({ learner, index }: { learner: any; index: number }) {
  const fullName  = `${learner.firstName} ${learner.lastName}`
  // Use real stats from API (enriched by /trainer/my-learners)
  const progress  = learner.stats?.progressPercent ?? 0
  const statusLabel = progress >= 60 ? 'On Track' : progress >= 30 ? 'Behind' : 'At Risk'
  const statusColor = progress >= 60 ? '#16a34a' : progress >= 30 ? '#d97706' : '#b91c1c'
  const statusBg    = progress >= 60 ? '#dcfce7' : progress >= 30 ? '#fef3c7' : '#fee2e2'
  const init = `${learner.firstName?.[0] ?? ''}${learner.lastName?.[0] ?? ''}`.toUpperCase()

  return (
    <div style={{
      display: 'grid', gridTemplateColumns: '36px 1fr 120px 180px 80px',
      alignItems: 'center', gap: 14, padding: '14px 18px',
      borderBottom: '1px solid rgba(28,28,28,0.06)',
    }}>
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: AVATAR_COLORS[index % AVATAR_COLORS.length],
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <span style={font(12, 600, '#fff')}>{init}</span>
      </div>
      <div>
        <div style={font(13, 600)}>{fullName}</div>
        <div style={font(11, 400, '#888')}>{learner.email}</div>
        {learner.programme && <div style={font(10, 400, '#aaa')}>{learner.programme}</div>}
      </div>
      <span style={{
        padding: '3px 10px', borderRadius: 20, textAlign: 'center',
        background: statusBg, color: statusColor, ...font(11, 500, statusColor),
      }}>
        {statusLabel}
      </span>
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
          <span style={font(11, 400, '#888')}>
            {learner.stats ? `${learner.stats.completedTasks}/${learner.stats.totalTasks} tasks` : 'Overall Progress'}
          </span>
          <span style={font(11, 600)}>{progress}%</span>
        </div>
        <div style={{ height: 6, background: '#f0f0f0', borderRadius: 3, overflow: 'hidden' }}>
          <div style={{
            height: '100%', width: `${progress}%`, borderRadius: 3,
            background: progress >= 60 ? '#16a34a' : progress >= 30 ? '#f59e0b' : '#ef4444',
            transition: 'width 0.4s',
          }} />
        </div>
      </div>
      <button
        onClick={() => window.location.href = `/trainer-dashboard/learners/${learner._id}/portfolio`}
        style={{
          padding: '5px 14px', background: '#1c1c1c', color: '#fff',
          border: 'none', borderRadius: 6, cursor: 'pointer', ...font(11, 500, '#fff'),
        }}
      >
        Review
      </button>
    </div>
  )
}

function ProgressInner() {
  const { data, isLoading, isError } = useTrainerLearners({ limit: 50 })
  const learners = data?.data ?? []

  // Count statuses using real API stats
  const onTrack = learners.filter((l: any) => (l.stats?.progressPercent ?? 0) >= 60).length
  const behind  = learners.filter((l: any) => { const p = l.stats?.progressPercent ?? 0; return p >= 30 && p < 60 }).length
  const atRisk  = learners.filter((l: any) => (l.stats?.progressPercent ?? 0) < 30).length

  return (
    <div style={{ maxWidth: 1100, ...FF }}>
      <h1 style={{ ...font(22, 700), marginBottom: 24 }}>Learner Progress</h1>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'On Track', count: onTrack, bg: '#dcfce7', border: '#86d9a8', color: '#15803d' },
          { label: 'Behind',   count: behind,  bg: '#fef3c7', border: '#fbbf24', color: '#92400e' },
          { label: 'At Risk',  count: atRisk,  bg: '#fee2e2', border: '#fca5a5', color: '#b91c1c' },
        ].map(card => (
          <div key={card.label} style={{ background: card.bg, border: `1px solid ${card.border}`, borderRadius: 12, padding: '16px 20px' }}>
            <div style={font(12, 500, card.color)}>{card.label}</div>
            <div style={{ ...font(28, 700, card.color), marginTop: 4 }}>
              {isLoading ? '–' : card.count}
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '12px 18px', background: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>
          <span style={font(13, 600)}>All Learners ({learners.length})</span>
        </div>

        {isError && (
          <div style={{ padding: '10px 16px', background: '#fef2f2' }}>
            <span style={font(12, 400, '#ef4444')}>Failed to load progress data.</span>
          </div>
        )}

        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '14px 18px', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f0f0f0' }} />
              <div style={{ flex: 1 }}>
                <div style={{ height: 13, width: '40%', background: '#f0f0f0', borderRadius: 4, marginBottom: 6 }} />
                <div style={{ height: 10, width: '60%', background: '#f0f0f0', borderRadius: 4 }} />
              </div>
            </div>
          ))
          : learners.length === 0
            ? <p style={{ ...font(14, 400, '#aaa'), textAlign: 'center', padding: '40px 0' }}>No learners assigned. Use the Learners page to assign learners.</p>
            : learners.map((l: any, i: number) => <ProgressRow key={l._id} learner={l} index={i} />)
        }
      </div>
    </div>
  )
}

export default function ProgressPage() {
  return <Suspense><ProgressInner /></Suspense>
}
