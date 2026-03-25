'use client'

import React from 'react'

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

interface Learner {
  id: string
  name: string
  initials: string
  avatarColor: string
  programme: string
  categories: Category[]
  lastAssessed: string
}

const demoData: Learner[] = [
  {
    id: '1',
    name: 'Sarah Thompson',
    initials: 'ST',
    avatarColor: '#3b5bdb',
    programme: 'Level 3 Business Administrator',
    lastAssessed: '15 Mar 2025',
    categories: [
      {
        name: 'Knowledge',
        criteria: [
          {
            label: 'Business Fundamentals',
            rating: 4,
            evidence: 'Demonstrated strong understanding in Q2 review',
          },
          {
            label: 'IT Skills',
            rating: 3,
            evidence: 'Competent with Office suite, needs advanced Excel',
          },
          {
            label: 'Communication Principles',
            rating: 5,
            evidence: 'Excellent written and verbal communication',
          },
        ],
      },
      {
        name: 'Skills',
        criteria: [
          {
            label: 'Project Management',
            rating: 3,
            evidence: 'Successfully managed team project',
          },
          {
            label: 'Stakeholder Management',
            rating: 4,
            evidence: 'Good relationship building with clients',
          },
        ],
      },
      {
        name: 'Behaviours',
        criteria: [
          {
            label: 'Professionalism',
            rating: 5,
            evidence: 'Consistently professional conduct',
          },
          {
            label: 'Adaptability',
            rating: 4,
            evidence: 'Adapts well to changing priorities',
          },
        ],
      },
    ],
  },
  {
    id: '2',
    name: 'James Wilson',
    initials: 'JW',
    avatarColor: '#2f9e44',
    programme: 'Level 3 Business Administrator',
    lastAssessed: '12 Mar 2025',
    categories: [
      {
        name: 'Knowledge',
        criteria: [
          {
            label: 'Business Fundamentals',
            rating: 2,
            evidence: 'Needs further development in business processes',
          },
          {
            label: 'IT Skills',
            rating: 3,
            evidence: 'Basic competency achieved',
          },
          {
            label: 'Communication Principles',
            rating: 3,
            evidence: 'Improving, needs more presentation practice',
          },
        ],
      },
      {
        name: 'Skills',
        criteria: [
          {
            label: 'Project Management',
            rating: 1,
            evidence: 'Not yet started project work',
          },
          {
            label: 'Stakeholder Management',
            rating: 2,
            evidence: 'Building confidence in meetings',
          },
        ],
      },
      {
        name: 'Behaviours',
        criteria: [
          {
            label: 'Professionalism',
            rating: 4,
            evidence: 'Good punctuality and work ethic',
          },
          {
            label: 'Adaptability',
            rating: 3,
            evidence: 'Coping well with role changes',
          },
        ],
      },
    ],
  },
]

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

const LearnerCard: React.FC<{ learner: Learner }> = ({ learner }) => (
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
      {/* Avatar */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: learner.avatarColor,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        <span style={font(14, 600, 'white')}>
          {learner.initials}
        </span>
      </div>
      {/* Name and Programme */}
      <div>
        <div style={font(15, 600)}>
          {learner.name}
        </div>
        <div style={font(12, 400, '#9291A5')}>
          {learner.programme}
        </div>
      </div>
    </div>

    {/* Categories and Criteria */}
    <div style={{ marginBottom: '12px', border: '1px solid rgba(28,28,28,0.06)', borderRadius: '8px', overflow: 'hidden' }}>
      {learner.categories.map((category, idx) => (
        <CategoryGroup key={idx} category={category} />
      ))}
    </div>

    {/* Last Assessed */}
    <div style={{ textAlign: 'right' }}>
      <span style={font(11, 400, '#9291A5')}>
        Last assessed: {learner.lastAssessed}
      </span>
    </div>
  </div>
)

export default function ScorecardPage() {
  return (
    <div style={{ padding: '24px' }}>
      <h1 style={font(22, 700, '#1c1c1c', { marginBottom: '24px' })}>
        KSB Assessment
      </h1>

      <div>
        {demoData.map((learner) => (
          <LearnerCard key={learner.id} learner={learner} />
        ))}
      </div>
    </div>
  )
}
