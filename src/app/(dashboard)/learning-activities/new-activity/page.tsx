'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

export default function NewActivityPage() {
  const router = useRouter()
  const [holistic, setHolistic] = useState(false)
  const [separate, setSeparate] = useState(false)

  return (
    <div>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        {/* Header */}
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Start New Learning Activity</span>
        </div>

        {/* Content */}
        <div style={{ padding: '20px' }}>
          {/* Fields Row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '24px' }}>
            {/* Primary Method */}
            <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Primary Method:</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...font(14, 400, 'rgba(28,28,28,0.4)') }}>Select a method</span>
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px', marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Date */}
            <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Date</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={iconCalendar} alt="" style={{ width: '14px', height: '14px' }} />
                <span style={{ ...font(14, 400, 'rgba(28,28,28,0.4)') }}>Pick a date</span>
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px', marginLeft: 'auto' }} />
              </div>
            </div>

            {/* Title */}
            <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '6px' }}>Title</div>
              <input type="text" placeholder="Text" style={{ background: 'transparent', border: 'none', outline: 'none', ...font(14, 400, 'rgba(28,28,28,0.4)') }} />
            </div>
          </div>

          {/* Evidence Recording Section */}
          <div style={{ marginBottom: '24px' }}>
            <div style={{ ...font(13, 400, '#1c1c1c'), marginBottom: '12px' }}>How will the evidence be recorded?</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={holistic} onChange={e => setHolistic(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
                <span style={{ ...font(13, 400, '#1c1c1c') }}>Holistically against multiple criteria</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input type="checkbox" checked={separate} onChange={e => setSeparate(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
                <span style={{ ...font(13, 400, '#1c1c1c') }}>Separately against individual criteria</span>
              </label>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Start</button>
            <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
          </div>
        </div>
      </div>
    </div>
  )
}
