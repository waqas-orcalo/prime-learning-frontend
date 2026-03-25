'use client'

import React, { Suspense } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useSession } from 'next-auth/react'
import { apiFetch } from '@/lib/api-client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

interface Criterion {
  label: string
  rating: number
  evidence: string
}

interface Category {
  name: string
  criteria: Criterion[]
}

interface ScorecardItem {
  _id: string
  learner?: { _id: string; firstName: string; lastName: string }
  learnerId?: string
  criteria?: any[]
  scores?: Record<string, { rating: number; evidence: string }>
  status?: string
  createdAt?: string
  updatedAt?: string
}

const AVATAR_COLORS = ['#3b5bdb', '#2f9e44', '#c92a2a', '#e67700', '#6741d9', '#1c1c1c']

function useTrainerScorecards() {
  const { data: session } = useSession()
  const token = (session?.user as any)?.accessToken as string | undefined
  return useQuery<any>({
    queryKey: ['trainer-scorecards'],
    queryFn: () => apiFetch('/scorecard?limit=50', token),
    enabled: !!token,
    staleTime: 30_000,
  })
}

const RatingDots: React.FC<{ rating: number; maxRating?: number }> = ({ rating, maxRating = 5 }) => {
  const dots = Array.from({ length: maxRating }, (_, i) => i < rating)

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <div style={{ display: 'flex', gap: '4px' }}>
        {dots.map((filled, idx) => (
          <div
            key={idx}
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              backgroundColor: filled ? '#1c1c1c' : '#E8E8E8',
            }}
          />
        ))}
      </div>
      <span style={font(12, 400, '#1c1c1c')}>{`${rating}/${maxRating}`}</span>
    </div>
  )
}

const CriteriaRow: React.FC<{ criterion: Criterion }> = ({ criterion }) => (
  <div
    style={{
      padding: '12px 16px',
      borderBottom: '1px solid rgba(28,28,28,0.06)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '16px',
    }}
  >
    <div style={{ flex: 1 }}>
      <div style={font(13, 500)}>
        {criterion.label}
      </div>
      <div style={font(12, 400, '#9291A5', { marginTop: '4px' })}>
        {criterion.evidence}
      </div>
    </div>
    <div style={{ flexShrink: 0 }}>
      <RatingDots rating={criterion.rating} />
    </div>
  </div>
)

const CategoryGroup: React.FC<{ category: Category }> = ({ category }) => (
  <div>
    <div style={{ padding: '10px 16px', backgroundColor: '#fafafa', borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
      <div style={font(13, 600)}>
        {category.name}
      </div>
    </div>
    <div>
      {category.criteria.map((criterion, idx) => (
        <CriteriaRow key={idx} criterion={criterion} />
      ))}
    </div>
  </div>
)

function ScorecardCard({ scorecard, index }: { scorecard: ScorecardItem; index: number }) {
  const learnerName = scorecard.learner
    ? `${scorecard.learner.firstName} ${scorecard.learner.lastName}`
    : 'Unknown Learner'
  const initials = scorecard.learner
    ? `${scorecard.learner.firstName[0]}${scorecard.learner.lastName[0]}`
    : '??'

  // Transform scores/criteria from backend into categories for display
  const categories: Category[] = []
  if (scorecard.scores && typeof scorecard.scores === 'object') {
    const grouped: Record<string, Criterion[]> = {}
    Object.entries(scorecard.scores).forEach(([label, data]: [string, any]) => {
      const catName = data.category || 'General'
      if (!grouped[catName]) grouped[catName] = []
      grouped[catName].push({ label, rating: data.rating || 0, evidence: data.evidence || '' })
    })
    Object.entries(grouped).forEach(([name, criteria]) => {
      categories.push({ name, criteria })
    })
  } else if (scorecard.criteria && Array.isArray(scorecard.criteria)) {
    const grouped: Record<string, Criterion[]> = {}
    scorecard.criteria.forEach((c: any) => {
      const catName = c.category || 'General'
      if (!grouped[catName]) grouped[catName] = []
      grouped[catName].push({ label: c.label || c.name || 'Criterion', rating: c.rating || 0, evidence: c.evidence || '' })
    })
    Object.entries(grouped).forEach(([name, criteria]) => {
      categories.push({ name, criteria })
    })
  }

  return (
    <div
      style={{
        backgroundColor: 'white',
        border: '1px solid rgba(28,28,28,0.1)',
        borderRadius: '12px',
        padding: '20px',
        marginBottom: '20px',
      }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <div
          style={{
            width: '40px',
            height: '40px',
            borderRadius: '50%',
            backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length],
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          <span style={font(14, 600, 'white')}>{initials}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div style={font(15, 600)}>{learnerName}</div>
          {scorecard.status && (
            <span style={{
              ...font(11, 500, scorecard.status === 'SUBMITTED' ? '#16a34a' : '#d97706'),
              padding: '2px 8px', borderRadius: 12,
              background: scorecard.status === 'SUBMITTED' ? '#dcfce7' : '#fef3c7',
            }}>
              {scorecard.status}
            </span>
          )}
        </div>
        {scorecard.updatedAt && (
          <span style={font(11, 400, '#9291A5')}>
            Last assessed: {new Date(scorecard.updatedAt).toLocaleDateString()}
          </span>
        )}
      </div>

      {/* Categories and Criteria */}
      {categories.length > 0 ? (
        <div style={{ marginBottom: '12px', border: '1px solid rgba(28,28,28,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
          {categories.map((category, idx) => (
            <CategoryGroup key={idx} category={category} />
          ))}
        </div>
      ) : (
        <p style={font(12, 400, '#aaa')}>No criteria scores recorded yet.</p>
      )}
    </div>
  )
}

function ScorecardInner() {
  const { data, isLoading, isError } = useTrainerScorecards()
  const scorecards: ScorecardItem[] = data?.data ?? []

  return (
    <div style={{ padding: '24px' }}>
      <h1 style={font(22, 700, '#1c1c1c', { marginBottom: '24px' })}>
        KSB Assessment
      </h1>

      {isLoading && <p style={font(14, 400, '#888')}>Loading scorecards...</p>}
      {isError && <p style={font(14, 400, '#ef4444')}>Failed to load scorecards.</p>}

      {!isLoading && scorecards.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '60px 20px',
          border: '1px solid rgba(28,28,28,0.1)', borderRadius: 12, background: '#fafafa',
        }}>
          <p style={font(14, 400, '#888')}>No scorecards found. Scorecards will appear here once they are created for your learners.</p>
        </div>
      )}

      <div>
        {scorecards.map((scorecard, i) => (
          <ScorecardCard key={scorecard._id} scorecard={scorecard} index={i} />
        ))}
      </div>
    </div>
  )
}

export default function ScorecardPage() {
  return <Suspense><ScorecardInner /></Suspense>
}
