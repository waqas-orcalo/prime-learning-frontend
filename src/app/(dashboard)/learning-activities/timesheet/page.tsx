'use client'

import { useState } from 'react'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconExport = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M8 10V3M5 6l3-3 3 3" stroke="#fff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/><path d="M3 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="#fff" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconClose = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="14.5" stroke="#1c1c1c" stroke-width="1.5"/><path d="M11 11l10 10M21 11l-10 10" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round"/></svg>`)
const iconChevronUp = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 13l5-5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevronRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M7 5l5 5-5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconFile = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M5 3h6.5L15 6.5V17a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z" stroke="#1c1c1c" stroke-width="1.5"/><path d="M11 3v4h4" stroke="#1c1c1c" stroke-width="1.5" stroke-linejoin="round"/></svg>`)
const iconActivity = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><path d="M3 10h3l2-6 3 12 2-6h4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCheck2 = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none"><rect x="2" y="2" width="16" height="16" rx="3" stroke="#1c1c1c" stroke-width="1.5"/><path d="M6 10l3 3 5-6" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCriteria = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="1" y="1" width="12" height="12" rx="2" stroke="#1c1c1c" stroke-width="1.2"/><path d="M4 7l2 2 4-4" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconLink = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5.5 7.5a3 3 0 0 0 4.243 0l2-2a3 3 0 0 0-4.243-4.243L6.414 2.343" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/><path d="M8.5 6.5a3 3 0 0 0-4.243 0l-2 2a3 3 0 0 0 4.243 4.243L7.586 11.657" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconPrivacy = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><rect x="3" y="6" width="8" height="7" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M5 6V4a2 2 0 0 1 4 0v2" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconUpload = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M7 9V3M5 5l2-2 2 2" stroke="#fff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/><path d="M2 9v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V9" stroke="#fff" stroke-width="1.2" stroke-linecap="round"/></svg>`)
const iconQuestion = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#9291A5" stroke-width="1.2"/><path d="M7 7a2 2 0 1 1 2.5 1.94c-.5.14-.5.56-.5 1.06" stroke="#9291A5" stroke-width="1.2" stroke-linecap="round"/><circle cx="9" cy="13" r="0.75" fill="#9291A5"/></svg>`)
const iconCheckCircle2 = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 18 18" fill="none"><circle cx="9" cy="9" r="8" stroke="#9291A5" stroke-width="1.2"/><path d="M6 9l2 2 4-4" stroke="#9291A5" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconUserAvatar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" viewBox="0 0 36 36" fill="none"><rect width="36" height="36" rx="18" fill="#E8E8ED"/><circle cx="18" cy="14" r="6" fill="#9291A5"/><path d="M5 34c0-7.18 5.82-13 13-13s13 5.82 13 13" fill="#9291A5"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

const OTJ_STATS = [
  { label: 'Planned OTJ (Hrs):', value: 'Not Set' },
  { label: 'Actual OTJ (Hrs):', value: 'Not Set' },
  { label: '% of Planned OTJ:', value: 'Not Set' },
  { label: 'Last OTJ Activity:', value: 'Not Set' },
  { label: 'Expected OTJ To Date (Hrs):', value: 'Not Set' },
  { label: 'Duration (Wks):', value: 'Not Set' },
  { label: 'Minimum OTJ (Hrs):', value: 'Not Set' },
]
const SUMMARY_DATA = [
  { category: 'Classroom delivery', offJob: '37h 3m', total: '37h 3m' },
  { category: 'Competition', offJob: '40h 17m', total: '40h 17m' },
  { category: 'Learning Activity(Assignment)', offJob: 'None', total: '30m' },
]
const ENTRIES_DATA = [
  { spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Classroom delivery', dateFrom: '07/02/25\n08:15', dateTo: '08/02/25\n18:15', description: 'Lorem ipsum is a dummy text commonly used in graphic design', time: '2040', offJob: true },
  { spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Learning Activity', dateFrom: '07/02/25\n08:15', dateTo: '08/02/25\n18:15', description: 'Lorem ipsum', time: '2040', offJob: true },
  { spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Competition', dateFrom: '07/02/25\n08:15', dateTo: '08/02/25\n18:15', description: 'Title', time: '2040', offJob: true },
  { spentBy: 'John Doe', recordedBy: 'John Doe', category: 'Classroom delivery', dateFrom: '07/02/25\n08:15', dateTo: '08/02/25\n18:15', description: 'UI Design', time: '2040', offJob: true },
]

function DateFilterRow() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px' }}>
      {['Date From:', 'Date To:'].map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ ...font(14, 400, '#1c1c1c') }}>{label}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '6px 10px', backgroundColor: '#fff' }}>
            <span style={{ ...font(14, 400, '#1c1c1c') }}>{i === 0 ? '12/12/2025' : '18/12/2025'}</span>
            <img src={iconCalendar} alt="" style={{ width: '14px', height: '14px', opacity: 0.6 }} />
          </div>
        </div>
      ))}
      <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '7px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Submit</button>
    </div>
  )
}

function SectionBar({ children }: { children: React.ReactNode }) {
  return <div style={{ backgroundColor: '#f4f4f4', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)' }}>{children}</div>
}

function EditJournalModal({ onClose }: { onClose: () => void }) {
  const [userExpanded, setUserExpanded] = useState(true)
  const [reflection, setReflection] = useState('')
  const [activityOnJob, setActivityOnJob] = useState(true)
  const [activityOffJob, setActivityOffJob] = useState(false)
  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ backgroundColor: '#f5f5f5', borderRadius: '12px', width: '100%', maxWidth: '600px', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0px 8px 32px rgba(0,0,0,0.25)' }} onClick={e => e.stopPropagation()}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px', borderRadius: '12px 12px 0 0' }}>
          <span style={{ ...font(18, 700, '#1c1c1c') }}>Edit Journal</span>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex' }}>
            <img src={iconClose} alt="Close" style={{ width: '32px', height: '32px' }} />
          </button>
        </div>

        <div style={{ margin: '0 16px 8px', backgroundColor: '#fff', borderRadius: '12px', overflow: 'hidden' }}>
          <button onClick={() => setUserExpanded(!userExpanded)} style={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', background: '#f5f5f5', border: 'none', cursor: 'pointer', borderRadius: userExpanded ? '12px 12px 0 0' : '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <img src={iconUserAvatar} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
              <span style={{ ...font(15, 600, '#1c1c1c') }}>John Doe</span>
            </div>
            <img src={iconChevronUp} alt="" style={{ width: '20px', height: '20px', transform: userExpanded ? 'none' : 'rotate(180deg)', transition: 'transform 0.2s' }} />
          </button>
        </div>

        <div style={{ padding: '0 16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 20px' }}>
            <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px' }}>Title</div>
            <div style={{ ...font(15, 400, '#1c1c1c') }}>Development task 1</div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px' }}>Select a category</div>
              <div style={{ ...font(15, 400, '#1c1c1c') }}>Competition</div>
            </div>
            <img src={iconCaretDown} alt="" style={{ width: '20px', height: '20px' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.2fr', gap: '8px' }}>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px' }}>Date</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <img src={iconCalendar} alt="" style={{ width: '14px', height: '14px', opacity: 0.6 }} />
                  <span style={{ ...font(14, 400, '#1c1c1c') }}>27 Dec, 2024</span>
                </div>
              </div>
              <img src={iconCaretDown} alt="" style={{ width: '16px', height: '16px' }} />
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px' }}>Time</div>
              <div style={{ ...font(14, 400, '#1c1c1c') }}>10:22 AM</div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px' }}>Duration</div>
              <div style={{ ...font(14, 400, '#1c1c1c') }}>1280 minutes</div>
            </div>
            <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 16px' }}>
              <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '8px' }}>Activity type</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                {[{ label: 'Off the job', val: activityOffJob, fn: setActivityOffJob }, { label: 'On the job', val: activityOnJob, fn: setActivityOnJob }].map(cb => (
                  <label key={cb.label} style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer' }}>
                    <input type="checkbox" checked={cb.val} onChange={e => cb.fn(e.target.checked)} style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
                    <span style={{ ...font(13, 400, '#1c1c1c') }}>{cb.label}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
          <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '12px 20px', position: 'relative' }}>
            <textarea value={reflection} onChange={e => setReflection(e.target.value)} placeholder="Type your reflection here" style={{ width: '100%', minHeight: '100px', boxSizing: 'border-box', border: 'none', outline: 'none', resize: 'none', background: 'transparent', ...font(14, 400, '#9291A5'), lineHeight: '22px', paddingRight: '28px' }} />
            <img src={iconQuestion} alt="" style={{ position: 'absolute', top: '12px', right: '14px', width: '18px', height: '18px' }} />
          </div>
          {[{ icon: iconFile, label: 'Files' }, { icon: iconActivity, label: 'Learning Activities' }, { icon: iconCheck2, label: 'Criteria' }].map((row, i) => (
            <div key={i} style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '14px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: i === 2 ? '8px' : 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <img src={row.icon} alt="" style={{ width: '20px', height: '20px' }} />
                <span style={{ ...font(15, 700, '#1c1c1c') }}>{row.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ backgroundColor: '#7C6FEA', borderRadius: '50%', width: '22px', height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', ...font(12, 600, '#fff') }}>1</span>
                <img src={iconChevronRight} alt="" style={{ width: '20px', height: '20px' }} />
              </div>
            </div>
          ))}
        </div>

        <div style={{ borderTop: '1px solid rgba(28,28,28,0.08)', backgroundColor: '#f5f5f5', padding: '14px 24px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: '0 0 12px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {[{ icon: iconCriteria, label: 'Criteria' }, { icon: iconLink, label: 'Link activity' }, { icon: iconPrivacy, label: 'Privacy: Only me' }].map(btn => (
              <button key={btn.label} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <img src={btn.icon} alt="" style={{ width: '14px', height: '14px' }} />
                <span style={{ ...font(13, 400, '#1c1c1c') }}>{btn.label}</span>
              </button>
            ))}
            <button style={{ display: 'flex', alignItems: 'center', gap: '5px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '6px 12px', cursor: 'pointer' }}>
              <img src={iconUpload} alt="" style={{ width: '14px', height: '14px' }} />
              <span style={{ ...font(13, 500, '#fff') }}>Upload file</span>
            </button>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 16px', ...font(14, 500, '#1c1c1c') }}>Cancel</button>
            <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 20px', cursor: 'pointer', ...font(14, 600, '#fff') }}>Update</button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function TimesheetPage() {
  const [editingEntry, setEditingEntry] = useState<number | null>(null)

  return (
    <div>
      {editingEntry !== null && <EditJournalModal onClose={() => setEditingEntry(null)} />}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <img src={iconBackCircle} alt="Back" style={{ width: '32px', height: '32px', cursor: 'pointer' }} />
          <h1 style={{ ...font(24, 700, '#1c1c1c'), margin: 0 }}>Timesheets</h1>
        </div>
        <button style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer' }}>
          <span style={{ ...font(14, 600, '#fff') }}>Export</span>
          <img src={iconExport} alt="" style={{ width: '16px', height: '16px' }} />
        </button>
      </div>

      {/* Off The Job */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <SectionBar><span style={{ ...font(15, 700, '#1c1c1c') }}>Off The Job</span></SectionBar>
        <div style={{ padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' as const }}>
            {OTJ_STATS.map((stat, i) => (
              <div key={i} style={{ flex: '1 1 auto', minWidth: '110px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '8px', padding: '10px 14px', backgroundColor: '#fff' }}>
                <div style={{ ...font(12, 400, '#9291A5'), marginBottom: '4px', lineHeight: '16px' }}>{stat.label}</div>
                <div style={{ ...font(14, 700, '#1c1c1c') }}>{stat.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Summary */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', marginBottom: '16px', overflow: 'hidden' }}>
        <SectionBar><span style={{ ...font(15, 700, '#1c1c1c') }}>Timesheets</span></SectionBar>
        <DateFilterRow />
        <div style={{ padding: '0 20px 20px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Category','Off-the-job','Total'].map((h, i) => <th key={h} style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), padding: '10px 8px', textAlign: (i === 0 ? 'left' : 'right') as 'left' | 'right', fontWeight: 400, width: i === 0 ? undefined : '80px' }}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {SUMMARY_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.category}</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 8px', textAlign: 'right' as const }}>{row.offJob}</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 8px', textAlign: 'right' as const }}>{row.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Entries */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: '#f4f4f4', padding: '12px 20px', borderBottom: '1px solid rgba(28,28,28,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ ...font(15, 700, '#1c1c1c') }}>Entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>Page number:</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '3px 8px', backgroundColor: '#fff', cursor: 'pointer' }}>
                <span style={{ ...font(14, 400, '#1c1c1c') }}>1</span>
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...font(14, 400, '#1c1c1c') }}>Records per page:</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', padding: '3px 8px', backgroundColor: '#fff', cursor: 'pointer' }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>50</span>
              <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
            </div>
          </div>
        </div>
        <DateFilterRow />
        <div style={{ padding: '0 20px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Spent by','Recorded by','Category','Date from','Date to','Description','Time\n(minutes)','Off-the-job','Action'].map((h, i) => (
                  <th key={i} style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), padding: '10px 8px', textAlign: (i === 8 ? 'right' : 'left') as 'left' | 'right', fontWeight: 400, whiteSpace: 'pre-line' as const, verticalAlign: 'bottom' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ENTRIES_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.spentBy}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.recordedBy}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px', whiteSpace: 'pre-line' as const }}>{row.category}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px', whiteSpace: 'pre-line' as const }}>{row.dateFrom}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px', whiteSpace: 'pre-line' as const }}>{row.dateTo}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px', maxWidth: '160px' }}>{row.description}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px', textAlign: 'center' as const }}>{row.time}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const }}>{row.offJob && <img src={iconCheckCircle2} alt="✓" style={{ width: '18px', height: '18px' }} />}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                      <button onClick={() => setEditingEntry(i)} style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', ...font(12, 500, '#fff') }}>Edit</button>
                      <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer', ...font(12, 500, '#fff') }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
