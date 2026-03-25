'use client'

import { useRouter } from 'next/navigation'

const FF = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1"
} as const

const font = (
  size: number,
  weight = 400,
  color = '#1c1c1c',
  extra: React.CSSProperties = {}
) =>
  ({
    ...FF,
    fontSize: `${size}px`,
    fontWeight: weight,
    color,
    lineHeight: '1.5',
    ...extra
  } as React.CSSProperties)

const items = [
  {
    label: 'Activity Plan Template',
    description: 'Standard template for planning learning activities'
  },
  {
    label: 'Session Record Template',
    description: 'Record details of each learning session'
  },
  {
    label: 'Workshop Plan Template',
    description: 'Structure and plan workshop sessions'
  },
  {
    label: 'Mentoring Session Template',
    description: 'Document mentoring activities and outcomes'
  }
]

export default function LearningActivityTemplatesPage() {
  const router = useRouter()

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '50%',
          backgroundColor: '#2c2c2c',
          border: 'none',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '24px'
        }}
      >
        <svg
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      {/* Title */}
      <h1 style={font(22, 700, '#1c1c1c', { marginBottom: '24px' })}>
        Learning Activity Templates
      </h1>

      {/* Card with Items List */}
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '12px',
          border: '1px solid #e5e5e5',
          overflow: 'hidden'
        }}
      >
        {items.map((item, index) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderBottom: index < items.length - 1 ? '1px solid #e5e5e5' : 'none',
              cursor: 'pointer',
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = '#f9f9f9'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = '#ffffff'
            }}
          >
            {/* File Icon Container */}
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '8px',
                backgroundColor: '#e5e5e5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginRight: '16px',
                flexShrink: 0
              }}
            >
              <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#666666"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z" />
                <polyline points="13 2 13 9 20 9" />
              </svg>
            </div>

            {/* Text Content */}
            <div style={{ flex: 1 }}>
              <div style={font(14, 600)}>
                {item.label}
              </div>
              <div style={font(12, 400, '#999999')}>
                {item.description}
              </div>
            </div>

            {/* Right Chevron */}
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#999999"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              style={{ marginLeft: '16px', flexShrink: 0 }}
            >
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </div>
        ))}
      </div>
    </div>
  )
}
