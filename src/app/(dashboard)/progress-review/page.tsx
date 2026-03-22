'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

function ProgressBar({ value }: { value: number }) {
  return (
    <div style={{ width: '100%', height: '8px', backgroundColor: 'rgba(28,28,28,0.1)', borderRadius: '4px', overflow: 'hidden' }}>
      <div style={{ height: '100%', width: `${value}%`, backgroundColor: '#1c1c1c', transition: 'width 0.3s' }} />
    </div>
  )
}

export default function ProgressReviewPage() {
  const router = useRouter()

  return (
    <div>
      {/* Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <img src={iconBackCircle} alt="Back" style={{ width: '32px', height: '32px', cursor: 'pointer' }} onClick={() => router.back()} />
        <h1 style={{ ...font(24, 700, '#1c1c1c'), margin: 0 }}>Progress Review Details</h1>
      </div>

      {/* Summary Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Summary</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { label: 'Actual Date', value: '03/01/2025' },
            { label: 'Scheduled Progress Review Date', value: '08/01/2025' },
            { label: 'Last Progress Review Date', value: 'None' },
            { label: 'Progress Review Type', value: 'Progress Review' },
            { label: 'LSF', value: 'Not specified' },
            { label: 'Learner Status', value: '01. Active on Target' },
          ].map((row, i) => (
            <div key={i}>
              <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '4px' }}>{row.label}</div>
              <div style={{ ...font(13, 400, '#1c1c1c') }}>{row.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Unit Progression Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Unit Progression between progress reviews</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
          {[
            { name: '[Unit 01] End Point Assessment', progress: 51 },
            { name: '[Unit 01] Gateway to End Point Assessment', progress: 51 },
            { name: '[01] NCFE Level 2 Functional Skills Qualification in English', progress: 51 },
          ].map((unit, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(28,28,28,0.02)', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px' }}>
              <div style={{ ...font(13, 600, '#4169e1'), marginBottom: '8px' }}>{unit.name}</div>
              <div style={{ ...font(11, 400, 'rgba(28,28,28,0.5)'), marginBottom: '6px' }}>Planned end date: <span style={{ ...font(11, 400, '#1c1c1c') }}>03/01/2025</span></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ ...font(11, 400, 'rgba(28,28,28,0.5)') }}>Progress</span>
              </div>
              <ProgressBar value={unit.progress} />
              <div style={{ ...font(12, 600, '#1c1c1c'), marginTop: '4px' }}>{unit.progress}%</div>
            </div>
          ))}
        </div>
      </div>

      {/* Achievements between reviews Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Achievements between reviews</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <span style={{ ...font(12, 600, '#1c1c1c') }}>Learning Activities Completed: </span>
            <span style={{ ...font(13, 400, '#1c1c1c') }}>[AS1] [PRJ1]</span>
          </div>
          <div>
            <span style={{ ...font(12, 600, '#1c1c1c') }}>Units Signed Off: </span>
            <span style={{ ...font(13, 400, '#1c1c1c') }}>No units signed off</span>
          </div>
          <div>
            <span style={{ ...font(12, 600, '#1c1c1c') }}>Attachments: </span>
            <span style={{ ...font(13, 400, '#1c1c1c') }}>Nothing is attached</span>
          </div>
        </div>
      </div>

      {/* Feedback & Comments Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Feedback & Comments</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '8px' }}>From: Tahmidul Hassan (Trainer) on 10/02/2025 19:49 To: John doe (Learner) Unread</div>
          <div style={{ ...font(13, 400, '#1c1c1c'), marginBottom: '16px' }}>Good job</div>

          <textarea placeholder="Add your feedback..." style={{ width: '100%', minHeight: '80px', boxSizing: 'border-box', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '12px', backgroundColor: '#fff', ...font(14, 400, 'rgba(28,28,28,0.3)'), outline: 'none', resize: 'none', marginBottom: '12px' }} />

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end' }}>
            <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save</button>
            <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Save & Quit</button>
          </div>
        </div>
      </div>

      {/* Declarations Card */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Declarations</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { name: 'John Doe (Learner)', date: '2025/03/03', checked: true },
            { name: 'Trainer', date: '2025/03/04', checked: true },
            { name: 'Employer', date: '', checked: false },
            { name: 'External Quality Assurer', date: '', checked: false },
          ].map((sig, i) => (
            <div key={i} style={{ backgroundColor: 'rgba(28,28,28,0.04)', border: '1px solid rgba(28,28,28,0.08)', borderRadius: '8px', padding: '12px 16px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: 1 }}>
                <input type="checkbox" checked={sig.checked} readOnly style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer', marginTop: '2px', flexShrink: 0 }} />
                <div>
                  <div style={{ ...font(13, 600, '#1c1c1c'), marginBottom: '4px' }}>Signature</div>
                  <div style={{ ...font(12, 400, 'rgba(28,28,28,0.5)', { fontStyle: 'italic' }) }}>I agree that the information provided here is an accurate account of what has taken place.</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' as const, flexShrink: 0, marginLeft: '16px' }}>
                <div style={{ ...font(13, 400, '#1c1c1c') }}>{sig.name}</div>
                {sig.date && <div style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), marginTop: '2px' }}>{sig.date}</div>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cancel Button */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <button onClick={() => router.back()} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 20px', ...font(14, 600, '#1c1c1c') }}>Cancel</button>
      </div>
    </div>
  )
}
