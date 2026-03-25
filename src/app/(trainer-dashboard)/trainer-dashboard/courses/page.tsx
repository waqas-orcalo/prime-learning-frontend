'use client'

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: React.CSSProperties = {}) =>
  ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, lineHeight: '1.5', ...extra } as React.CSSProperties)

export default function CoursesPage() {
  return (
    <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', ...FF }}>
      <div style={{ textAlign: 'center' }}>
        {/* SVG Illustration of Stacked Books */}
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: 32, marginLeft: 'auto', marginRight: 'auto', display: 'block' }}>
          {/* Base ellipse */}
          <ellipse cx="60" cy="85" rx="35" ry="12" fill="#f0f0f0" />

          {/* Three stacked rectangles (books) */}
          <rect x="25" y="65" width="70" height="14" rx="2" fill="#d4d4d4" />
          <rect x="22" y="50" width="76" height="14" rx="2" fill="#e5e5e5" />
          <rect x="20" y="35" width="80" height="14" rx="2" fill="#f5f5f5" />

          {/* Line with circle */}
          <line x1="30" y1="28" x2="70" y2="28" stroke="#1c1c1c" strokeWidth="2" />
          <circle cx="75" cy="28" r="4" fill="#1c1c1c" />

          {/* Decorative circles */}
          <circle cx="85" cy="55" r="3" fill="#bbb" />
          <circle cx="88" cy="70" r="2.5" fill="#ddd" />
          <circle cx="92" cy="45" r="2" fill="#e5e5e5" />
        </svg>

        {/* Main text */}
        <h2 style={{ ...font(16, 600), marginBottom: 8, marginTop: 0 }}>
          You currently don't have the access to course module
        </h2>

        {/* Secondary text */}
        <p style={{ ...font(14, 400, '#666'), marginBottom: 24, marginTop: 0 }}>
          Courses will appear when you buy subscription module!
        </p>

        {/* Buy Subscription button */}
        <button style={{
          background: '#1c1c1c',
          color: '#fff',
          border: 'none',
          borderRadius: 6,
          padding: '10px 28px',
          cursor: 'pointer',
          ...font(14, 600, '#fff'),
        }}>
          Buy Subscription
        </button>
      </div>
    </div>
  )
}
