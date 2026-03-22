'use client'

import { useRouter } from 'next/navigation'
import Link from 'next/link'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevronDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

export default function PlanOfActivityPage() {
  const router = useRouter()

  return (
    <div>
      {/* Back + Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
        <img src={iconBackCircle} alt="Back" style={{ width: '32px', height: '32px', cursor: 'pointer' }} onClick={() => router.back()} />
        <h1 style={{ ...font(24, 700, '#1c1c1c'), margin: 0 }}>Plan Of Activity/action</h1>
      </div>

      {/* Section 1: Schedules and Appointments */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Schedules and Appointments</span>
          <span style={{ ...font(13, 400, '#0ea5e9') }}>This plan of activity/action has already been signed.</span>
        </div>

        <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {/* Left Column */}
          <div>
            <div style={{ ...font(12, 600, '#1c1c1c'), marginBottom: '12px' }}>This Plan Of Activity/action Visit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Title: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>Plan Of Activity/action - Mon 10/02/2025</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Date: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>📅 03/01/2025</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Type: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>✓ Face-to-face visit</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Learner Status: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>01. Active on Target</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Outcome: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>Not Set</span></div>
            </div>
          </div>

          {/* Right Column */}
          <div>
            <div style={{ ...font(12, 600, '#1c1c1c'), marginBottom: '12px' }}>Set Next Planned Visit</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Visit Type: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>New visit</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Type: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>✓ Face-to-face visit</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Location: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>Google Meet</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Start Date: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>📅 03/01/2025</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>End Date: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>📅 03/01/2025</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>Start Time: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>12:30PM</span></div>
              <div><span style={{ ...font(12, 400, 'rgba(28,28,28,0.6)') }}>End Time: </span><span style={{ ...font(13, 400, '#1c1c1c') }}>13:30PM</span></div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Plan Of Activity/Action */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Plan Of Activity/Action</span>
          <span style={{ ...font(13, 400, '#0ea5e9') }}>This plan of activity/action has already been signed.</span>
        </div>

        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
            <img src={iconChevronDown} alt="" style={{ width: '16px', height: '16px' }} />
            <span style={{ ...font(13, 700, '#1c1c1c') }}>Tasks</span>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginBottom: '16px' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Details of Planned Learning Activity', 'Learning Outcomes', 'Method', 'Start by', 'Map Evidence', 'Start Date', 'Due Date'].map((h) => (
                  <th key={h} style={{ ...font(12, 400, 'rgba(28,28,28,0.5)'), padding: '8px', textAlign: 'left' as const, fontWeight: 400, whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>To take your English Reading Test L2</td>
                <td style={{ ...font(13, 400, '#4169e1'), padding: '12px 8px', cursor: 'pointer' }}>[01 - 1 outcome, 1 criteria]</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>FS Exam (FSE1)</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>Trainer</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>Holistically</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>03/01/2025</td>
                <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>03/01/2025</td>
              </tr>
            </tbody>
          </table>

          <div style={{ marginBottom: '12px' }}>
            <span style={{ ...font(13, 700, '#1c1c1c'), marginBottom: '6px', display: 'block' }}>Learning Resources:</span>
            <span style={{ ...font(13, 400, '#4169e1'), cursor: 'pointer' }}>📄 OneFile documentation.pdf</span>
          </div>

          <Link href="/learning-activities/evidence">
            <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Go to Learning Activity</button>
          </Link>
        </div>
      </div>

      {/* Section 3: Attachments */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Attachments</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <span style={{ ...font(13, 400, '#1c1c1c') }}>Nothing Attached</span>
        </div>
      </div>

      {/* Section 4: Feedback & Comments */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Feedback & Comments</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ ...font(12, 400, 'rgba(28,28,28,0.6)'), marginBottom: '4px' }}>From: Tahmidul Hassan (Trainer) on 10/02/2025 19:49 To: John doe (Learner) Unread</div>
          <div style={{ ...font(13, 400, '#1c1c1c') }}>Good job</div>
        </div>
      </div>

      {/* Section 5: Issues Arising */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Issues Arising</span>
        </div>
        <div style={{ padding: '16px 20px' }}>
          <span style={{ ...font(13, 400, '#1c1c1c') }}>no issue</span>
        </div>
      </div>

      {/* Section 6: Signatures */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', height: '45px', paddingLeft: '20px', paddingRight: '20px', display: 'flex', alignItems: 'center' }}>
          <span style={{ ...font(15, 700, '#1c1c1c') }}>Signatures</span>
        </div>
        <div style={{ padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { name: 'John Doe (Learner)', date: '2025/03/03', checked: true },
            { name: 'Trainer', date: '2025/03/04', checked: true },
            { name: 'Internal Quality Assurer', date: '', checked: false },
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
