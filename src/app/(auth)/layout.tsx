import type { ReactNode } from 'react'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div style={{
      minHeight: '100vh',
      position: 'relative',
      overflow: 'hidden',
      background: 'linear-gradient(180deg, #7ec8e3 0%, #a8dff0 18%, #c6eefc 35%, #dff7fd 55%, #f0fbff 72%, #f5f5f5 88%, #e8e8e8 100%)',
    }}>
      {/* Decorative circular arc lines (from Figma background) */}
      <svg
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none', opacity: 0.18 }}
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1512 800"
        preserveAspectRatio="xMidYMid slice"
      >
        <circle cx="756" cy="800" r="360" fill="none" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="756" cy="800" r="480" fill="none" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="756" cy="800" r="600" fill="none" stroke="#fff" strokeWidth="1.5"/>
        <circle cx="756" cy="800" r="720" fill="none" stroke="#fff" strokeWidth="1.5"/>
      </svg>

      {/* Clouds bottom */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '260px',
        background: 'radial-gradient(ellipse 800px 200px at 20% 110%, rgba(255,255,255,0.9) 0%, transparent 70%), radial-gradient(ellipse 600px 160px at 70% 105%, rgba(255,255,255,0.85) 0%, transparent 65%), radial-gradient(ellipse 400px 120px at 50% 108%, rgba(255,255,255,0.95) 0%, transparent 60%)',
        pointerEvents: 'none',
      }} />

      {/* Prime Learning Platform logo — top left */}
      <div style={{ position: 'absolute', top: '40px', left: '108px', display: 'flex', alignItems: 'center', gap: '6px' }}>
        <svg width="176" height="88" viewBox="0 0 176 88" fill="none" xmlns="http://www.w3.org/2000/svg">
          {/* Book icon */}
          <rect x="4" y="8" width="64" height="56" rx="6" fill="none" stroke="#1c1c1c" strokeWidth="3"/>
          <rect x="10" y="8" width="52" height="56" rx="4" fill="none" stroke="#1c1c1c" strokeWidth="2"/>
          <line x1="36" y1="8" x2="36" y2="64" stroke="#1c1c1c" strokeWidth="2"/>
          {/* Feather/pen icon */}
          <path d="M48 12 Q64 4 68 18 Q60 22 54 30 L44 42 L48 12Z" fill="#1c1c1c"/>
          <path d="M44 42 L40 50 L48 46Z" fill="#1c1c1c"/>
          {/* Text: Prime */}
          <text x="82" y="34" fontFamily="Inter, sans-serif" fontWeight="800" fontSize="18" fill="#1c1c1c" letterSpacing="-0.5">Prime</text>
          {/* Text: Learning Platform */}
          <text x="82" y="52" fontFamily="Inter, sans-serif" fontWeight="400" fontSize="11" fill="#1c1c1c" letterSpacing="0.2">Learning Platform</text>
        </svg>
      </div>

      {/* Centered card */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        minHeight: '100vh',
        paddingTop: '40px',
        paddingBottom: '40px',
      }}>
        {children}
      </div>
    </div>
  )
}
