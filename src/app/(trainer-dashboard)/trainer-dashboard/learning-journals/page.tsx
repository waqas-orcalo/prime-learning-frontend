'use client'

import { useState, Suspense } from 'react'
import { useTrainerJournals, useUpdateTrainerJournal } from '@/hooks/use-trainer'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

const STATUS_TABS = [
  { key: '',          label: 'All'            },
  { key: 'published', label: 'Pending Review' },
  { key: 'reviewed',  label: 'Reviewed'       },
  { key: 'revision',  label: 'Needs Revision' },
]

const STATUS_BADGE: Record<string, { bg: string; color: string; label: string }> = {
  published: { bg: '#fef9c3', color: '#854d0e', label: 'Pending Review' },
  reviewed:  { bg: '#dcfce7', color: '#15803d', label: 'Reviewed'       },
  revision:  { bg: '#fee2e2', color: '#b91c1c', label: 'Needs Revision' },
  draft:     { bg: '#f3f4f6', color: '#374151', label: 'Draft'          },
}

const AVATAR_COLORS = ['#1c1c1c', '#3b5bdb', '#2f9e44', '#c92a2a', '#e67700', '#6741d9']

function Avatar({ name, index }: { name: string; index: number }) {
  const parts = name.split(' ')
  const init = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '')
  return (
    <div style={{
      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
      background: AVATAR_COLORS[index % AVATAR_COLORS.length],
      display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <span style={font(12, 600, '#fff')}>{init.toUpperCase()}</span>
    </div>
  )
}

function JournalCard({ journal, index }: { journal: any; index: number }) {
  const [expanded, setExpanded]   = useState(false)
  const [feedback, setFeedback]   = useState(journal.trainerFeedback ?? journal.trainerComment ?? '')
  const [saving,   setSaving]     = useState(false)
  const [saved,    setSaved]      = useState(false)

  const update = useUpdateTrainerJournal()

  const learnerName = journal.createdBy
    ? `${journal.createdBy.firstName} ${journal.createdBy.lastName}`
    : 'Unknown Learner'

  const badge = STATUS_BADGE[journal.status] ?? { bg: '#f3f4f6', color: '#374151', label: journal.status ?? '—' }

  async function handleMarkReviewed() {
    setSaving(true)
    try {
      await update.mutateAsync({ id: journal._id, status: 'reviewed', trainerFeedback: feedback })
      setSaved(true)
      setTimeout(() => setSaved(false), 2000)
    } finally { setSaving(false) }
  }

  async function handleRequestRevision() {
    setSaving(true)
    try {
      await update.mutateAsync({ id: journal._id, status: 'revision', trainerFeedback: feedback })
    } finally { setSaving(false) }
  }

  return (
    <div style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, overflow: 'hidden', background: '#fff' }}>
      {/* Header */}
      <button
        onClick={() => setExpanded(e => !e)}
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '14px 18px', background: 'none', border: 'none', cursor: 'pointer', textAlign: 'left',
        }}
      >
        <Avatar name={learnerName} index={index} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <span style={font(14, 600)}>{journal.title}</span>
            <span style={{
              padding: '2px 8px', borderRadius: 20,
              background: badge.bg, color: badge.color, ...font(11, 500, badge.color),
            }}>
              {badge.label}
            </span>
          </div>
          <span style={font(12, 400, '#888')}>{learnerName} · {journal.publishedAt ? new Date(journal.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'}</span>
        </div>
        <span style={{ fontSize: 14, color: '#888', transition: 'transform 0.2s', transform: expanded ? 'rotate(180deg)' : 'none' }}>▾</span>
      </button>

      {/* Expanded body */}
      {expanded && (
        <div style={{ padding: '0 18px 18px', borderTop: '1px solid rgba(28,28,28,0.06)' }}>
          {/* Meta */}
          <div style={{ display: 'flex', gap: 20, padding: '12px 0', flexWrap: 'wrap' }}>
            {[
              ['Category', journal.category ?? '—'],
              ['Duration',  journal.otjHours ? `${Math.round(journal.otjHours * 60)} mins` : '—'],
              ['Type',      'On the job'],
            ].map(([k, v]) => (
              <div key={k}>
                <div style={font(11, 500, '#888')}>{k}</div>
                <div style={font(12)}>{v}</div>
              </div>
            ))}
          </div>

          {/* Reflection */}
          {journal.content && (
            <div style={{ marginBottom: 14 }}>
              <div style={{ ...font(12, 600), marginBottom: 4 }}>Learner Reflection</div>
              <p style={{ ...font(13, 400, '#444'), margin: 0, lineHeight: 1.6 }}>{journal.content}</p>
            </div>
          )}

          {/* Trainer feedback */}
          <div style={{ marginBottom: 12 }}>
            <div style={{ ...font(12, 600), marginBottom: 6 }}>Trainer Feedback</div>
            <textarea
              value={feedback}
              onChange={e => setFeedback(e.target.value)}
              placeholder="Leave feedback for the learner..."
              rows={3}
              style={{
                width: '100%', padding: '9px 12px',
                border: '1px solid rgba(28,28,28,0.18)', borderRadius: 8,
                ...font(12), resize: 'vertical', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {journal.status !== 'reviewed' && (
              <button
                onClick={handleRequestRevision}
                disabled={saving}
                style={{
                  padding: '7px 16px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: 8,
                  background: '#fff', cursor: saving ? 'not-allowed' : 'pointer', ...font(12, 500),
                }}
              >
                Request Revision
              </button>
            )}
            <button
              onClick={handleMarkReviewed}
              disabled={saving}
              style={{
                padding: '7px 16px', background: '#1c1c1c', color: '#fff',
                border: 'none', borderRadius: 8, cursor: saving ? 'not-allowed' : 'pointer',
                ...font(12, 500, '#fff'),
              }}
            >
              {saving ? 'Saving…' : saved ? '✓ Saved' : journal.status === 'reviewed' ? 'Update Feedback' : 'Mark as Reviewed'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function JournalsInner() {
  const [activeTab, setActiveTab] = useState('')

  const { data, isLoading, isError } = useTrainerJournals({ limit: 100, status: activeTab || undefined })
  const journals = data?.data ?? []

  const counts = STATUS_TABS.reduce<Record<string, number>>((acc, tab) => {
    if (tab.key === '') {
      acc[''] = data?.pagination?.total ?? 0
    } else {
      acc[tab.key] = journals.filter(j => j.status === tab.key).length
    }
    return acc
  }, {})

  return (
    <div style={{ maxWidth: 900, ...FF }}>
      <h1 style={{ ...font(22, 700), marginBottom: 24 }}>Learning Journals</h1>

      {/* Status tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              padding: '6px 16px', borderRadius: 20,
              border: '1px solid rgba(28,28,28,0.15)',
              background: activeTab === tab.key ? '#1c1c1c' : '#fff',
              color: activeTab === tab.key ? '#fff' : '#1c1c1c',
              cursor: 'pointer', ...font(12, 500, activeTab === tab.key ? '#fff' : '#1c1c1c'),
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Error */}
      {isError && (
        <div style={{ padding: '10px 16px', background: '#fef2f2', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 8, marginBottom: 16 }}>
          <span style={font(12, 400, '#ef4444')}>Failed to load journals.</span>
        </div>
      )}

      {/* Journal cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} style={{ border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, padding: 18, background: '#fff' }}>
              <div style={{ height: 16, width: '50%', background: '#f0f0f0', borderRadius: 4, marginBottom: 8 }} />
              <div style={{ height: 12, width: '30%', background: '#f0f0f0', borderRadius: 4 }} />
            </div>
          ))
          : journals.length === 0
            ? <p style={{ ...font(14, 400, '#aaa'), textAlign: 'center', padding: '40px 0' }}>No journals found.</p>
            : journals.map((j, i) => <JournalCard key={j._id} journal={j} index={i} />)
        }
      </div>
    </div>
  )
}

export default function LearningJournalsPage() {
  return <Suspense><JournalsInner /></Suspense>
}
