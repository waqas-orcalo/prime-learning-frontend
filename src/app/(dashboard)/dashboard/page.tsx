'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconQuestion = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5" fill="none"/><text x="16" y="22" text-anchor="middle" font-family="Inter,sans-serif" font-size="18" font-weight="600" fill="#1c1c1c">?</text></svg>`)
const iconChartPolar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M128 24a104 104 0 1 0 104 104A104.11 104.11 0 0 0 128 24Zm0 192a88 88 0 1 1 88-88 88.1 88.1 0 0 1-88 88Zm0-160a72 72 0 1 0 72 72 72.08 72.08 0 0 0-72-72Zm0 128a56 56 0 1 1 56-56 56.06 56.06 0 0 1-56 56Z" fill="#1c1c1c"/></svg>`)
const iconFiles = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM160 51.31 188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Z" fill="#1c1c1c"/></svg>`)
const iconCalendarCheck = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M208 32h-24V24a8 8 0 0 0-16 0v8H88V24a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16ZM72 48v8a8 8 0 0 0 16 0V48h80v8a8 8 0 0 0 16 0V48h24v32H48V48Zm136 160H48V96h160v112Zm-68.69-82.34a8 8 0 0 1 0 11.32l-40 40a8 8 0 0 1-11.31 0l-16-16a8 8 0 0 1 11.31-11.31L93.66 160l34.34-34.34a8 8 0 0 1 11.31 0Z" fill="#1c1c1c"/></svg>`)
const iconCalendarBlank = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M208 32h-24V24a8 8 0 0 0-16 0v8H88V24a8 8 0 0 0-16 0v8H48a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h160a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16ZM72 48v8a8 8 0 0 0 16 0V48h80v8a8 8 0 0 0 16 0V48h24v32H48V48Zm136 160H48V96h160v112Z" fill="#1c1c1c"/></svg>`)
const iconDownload = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M224 152v56a16 16 0 0 1-16 16H48a16 16 0 0 1-16-16v-56a8 8 0 0 1 16 0v56h160v-56a8 8 0 0 1 16 0Zm-101.66 5.66a8 8 0 0 0 11.32 0l40-40a8 8 0 0 0-11.32-11.32L136 132.69V40a8 8 0 0 0-16 0v92.69l-26.34-26.35a8 8 0 0 0-11.32 11.32Z" fill="#1c1c1c"/></svg>`)
const iconUsers = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M117.25 157.92a60 60 0 1 0-66.5 0A95.83 95.83 0 0 0 16 207a8 8 0 0 0 16 0 80 80 0 0 1 160 0 8 8 0 0 0 16 0 95.83 95.83 0 0 0-50.75-49.08ZM40 108a44 44 0 1 1 44 44 44.05 44.05 0 0 1-44-44Zm210.14 98.7a8 8 0 0 1-6.14-9.46 80.05 80.05 0 0 0-54.07-91.94 8 8 0 1 1 4.07-15.48 96 96 0 0 1 64.93 110.35 8 8 0 0 1-8.79 6.53ZM201.3 34.92a8 8 0 0 1 4-15.49 96.06 96.06 0 0 1 0 186.14 8 8 0 0 1-4-15.49 80.06 80.06 0 0 0 0-155.16Z" fill="#1c1c1c"/></svg>`)
const iconPresentation = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M216 40H136V24a8 8 0 0 0-16 0v16H40a16 16 0 0 0-16 16v160a16 16 0 0 0 16 16h176a16 16 0 0 0 16-16V56a16 16 0 0 0-16-16ZM40 56h176v160H40Zm144 36H72a8 8 0 0 0 0 16h112a8 8 0 0 0 0-16Zm0 40H72a8 8 0 0 0 0 16h112a8 8 0 0 0 0-16Zm0 40H72a8 8 0 0 0 0 16h112a8 8 0 0 0 0-16Z" fill="#1c1c1c"/></svg>`)
const iconSearch = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M229.66 218.34l-50.07-50.07a88.11 88.11 0 1 0-11.31 11.31l50.06 50.07a8 8 0 0 0 11.32-11.31ZM40 112a72 72 0 1 1 72 72 72.08 72.08 0 0 1-72-72Z" fill="#1c1c1c"/></svg>`)
const iconTrendUp = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M240 56v64a8 8 0 0 1-16 0V75.31l-82.34 82.35a8 8 0 0 1-11.32 0L96 123.31l-74.34 74.35a8 8 0 0 1-11.32-11.32l80-80a8 8 0 0 1 11.32 0L136 140.69 212.69 64H168a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Z" fill="#1c1c1c"/></svg>`)
const iconGauge = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M200 168a72.08 72.08 0 0 0-72-72A72 72 0 0 0 60.59 196a8 8 0 1 0 13.85-8A56 56 0 1 1 184 168a56.62 56.62 0 0 1-3.41 19.2 8 8 0 0 0 15.09 5.33A72.51 72.51 0 0 0 200 168Zm-72-48a8 8 0 0 0-8 8v37.49l-16.63 16.63a8 8 0 1 0 11.32 11.32l18.57-18.57A8 8 0 0 0 136 172v-44a8 8 0 0 0-8-8Z" fill="#1c1c1c"/></svg>`)
const iconPieChart = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M232 128A104 104 0 0 1 43.1 185.12 104 104 0 0 1 128 24a8 8 0 0 1 8 8v88h88a8 8 0 0 1 8 8Zm-24.37 20H120V35.47A88 88 0 1 0 207.63 148Z" fill="#1c1c1c"/></svg>`)
const iconFormDoc = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM160 51.31 188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Zm-40-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h56a8 8 0 0 1 8 8Zm16 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h72a8 8 0 0 1 8 8Z" fill="#1c1c1c"/></svg>`)
const iconChevronSmall = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M6 3l5 5-5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevronLeft = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M15 18l-6-6 6-6" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconChevronRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M9 18l6-6-6-6" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><path d="M7 10l5 5 5-5" stroke="#1c1c1c" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconArrowCircleRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="9" stroke="#1c1c1c" stroke-width="1.5"/><path d="M10 8l4 4-4 4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconArrowLineRight = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10m0 0l-4-4m4 4l-4 4" stroke="#9291A5" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconClipboard = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M200 32h-36.26a47.92 47.92 0 0 0-71.48 0H56a16 16 0 0 0-16 16v168a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V48a16 16 0 0 0-16-16Zm-72 0a32 32 0 0 1 32 32H96a32 32 0 0 1 32-32Zm72 184H56V48h26.75A47.93 47.93 0 0 0 80 64v8a8 8 0 0 0 8 8h80a8 8 0 0 0 8-8v-8a47.93 47.93 0 0 0-2.75-16H200Z" fill="#615E83"/></svg>`)
const iconDocument = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" fill="none"><path d="M213.66 82.34l-56-56A8 8 0 0 0 152 24H56a16 16 0 0 0-16 16v176a16 16 0 0 0 16 16h144a16 16 0 0 0 16-16V88a8 8 0 0 0-2.34-5.66ZM160 51.31 188.69 80H160ZM200 216H56V40h88v48a8 8 0 0 0 8 8h48v120Zm-32-80a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Zm0 32a8 8 0 0 1-8 8H96a8 8 0 0 1 0-16h64a8 8 0 0 1 8 8Z" fill="#615E83"/></svg>`)
const iconTrainerAvatar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48" fill="none"><rect width="48" height="48" rx="24" fill="#E8E8ED"/><circle cx="24" cy="20" r="8" fill="#9291A5"/><path d="M8 42c0-8.837 7.163-16 16-16s16 7.163 16 16" fill="#9291A5"/></svg>`)
const dotSvg = (color: string) => svg(`<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 14 14"><circle cx="7" cy="7" r="7" fill="${color}"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })
const cardStyle = { backgroundColor: '#fff', borderRadius: '16px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' } as const
const chartCardStyle: React.CSSProperties = { backgroundColor: '#fff', borderRadius: '20px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', width: '377px', minHeight: '459px', padding: '24px', display: 'flex', flexDirection: 'column' }
function Divider({ mb = '20px' }: { mb?: string }) {
  return <div style={{ width: '100%', height: '1px', backgroundColor: 'rgba(28,28,28,0.1)', marginBottom: mb }} />
}

function DonutChartCard() {
  const progress = 70, size = 247, strokeWidth = 24
  const radius = (size - strokeWidth) / 2, circumference = 2 * Math.PI * radius
  const progressOffset = circumference - (progress / 100) * circumference
  return (
    <div style={chartCardStyle}>
      <div style={{ ...font(18, 400, '#9291A5'), marginBottom: '4px' }}>Statistics</div>
      <div style={{ ...font(22, 700, '#1E1B39'), marginBottom: '16px', lineHeight: '28px' }}>Overall &amp; target progress</div>
      <Divider />
      <div style={{ display: 'flex', justifyContent: 'center', flex: 1, alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', width: `${size}px`, height: `${size}px` }}>
          <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#E8E8ED" strokeWidth={strokeWidth} />
            <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#5FC966" strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={progressOffset} strokeLinecap="round" />
          </svg>
          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
            <div style={{ ...font(16, 400, '#615E83') }}>Total Progress</div>
            <div style={{ ...font(22, 700, '#1E1B39') }}>{progress}%</div>
          </div>
        </div>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '40px' }}>
        {[{ color: '#5FC966', label: 'Progress', val: `${progress}%` }, { color: '#E8E8ED', label: 'Due', val: `${100-progress}%` }].map(item => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <img src={dotSvg(item.color)} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={{ ...font(14, 400, '#9291A5') }}>{item.label}</span>
            <span style={{ ...font(16, 500, '#1E1B39') }}>{item.val}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const MONTHS_CAL = ['January','February','March','April','May','June','July','August','September','October','November','December']
function CalendarCard() {
  const [month, setMonth] = useState(4); const [year, setYear] = useState(2025)
  const today = 23, rangeStart = 23, rangeEnd = 27
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells: { n: number; active: boolean }[] = []
  for (let i = 1; i <= daysInMonth; i++) cells.push({ n: i, active: true })
  let nd = 1; while (cells.length % 7 !== 0) cells.push({ n: nd++, active: false })
  return (
    <div style={chartCardStyle}>
      <div style={{ ...font(18, 400, '#9291A5'), marginBottom: '4px' }}>Calendar</div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <span style={{ ...font(22, 700, '#1E1B39') }}>{MONTHS_CAL[month]} {year}</span>
        <div style={{ display: 'flex', gap: '4px' }}>
          <button onClick={() => { if (month === 0) { setMonth(11); setYear(y => y-1) } else setMonth(m => m-1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}><img src={iconChevronLeft} alt="" style={{ width: '24px', height: '24px' }} /></button>
          <button onClick={() => { if (month === 11) { setMonth(0); setYear(y => y+1) } else setMonth(m => m+1) }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}><img src={iconChevronRight} alt="" style={{ width: '24px', height: '24px' }} /></button>
        </div>
      </div>
      <Divider mb="12px" />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
        {['Mo','Tu','We','Th','Fr','Sa','Su'].map(d => <div key={d} style={{ ...font(14, 400, '#141736'), textAlign: 'center', padding: '6px 0' }}>{d}</div>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', flex: 1 }}>
        {cells.map((cell, i) => {
          const isTd = cell.active && cell.n === today, isEnd = cell.active && cell.n === rangeEnd, inR = cell.active && cell.n >= rangeStart && cell.n <= rangeEnd
          return (
            <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '8px 4px', borderRadius: (isTd || isEnd) ? '50%' : '4px', cursor: cell.active ? 'pointer' : 'default', backgroundColor: isTd ? '#000' : inR ? 'rgba(28,28,28,0.08)' : 'transparent', border: isEnd && !isTd ? '1.5px solid #1c1c1c' : 'none', ...font(14, isTd ? 600 : 400, isTd ? '#fff' : cell.active ? '#141736' : '#A5B4CB') }}>
              {cell.n}
            </div>
          )
        })}
      </div>
    </div>
  )
}

const BARS = [
  { label: 'Immediately', count: 2, barWidth: 108, color: '#9747FF', bgColor: 'rgba(151,71,255,0.1)', dotColor: '#9747FF' },
  { label: 'This week', count: 0, barWidth: 0, color: 'rgba(42,120,183,0.1)', bgColor: 'rgba(42,120,183,0.1)', dotColor: '#C4C4C4' },
  { label: 'Next week', count: 3, barWidth: 160, color: '#F8B637', bgColor: 'rgba(248,182,55,0.1)', dotColor: '#F8B637' },
  { label: 'In two weeks', count: 1, barWidth: 61, color: '#5FC966', bgColor: 'rgba(95,201,102,0.1)', dotColor: '#5FC966' },
]
function BarChartCard() {
  return (
    <div style={chartCardStyle}>
      <div style={{ ...font(18, 400, '#9291A5'), marginBottom: '4px' }}>Statistics</div>
      <div style={{ ...font(22, 700, '#1E1B39'), marginBottom: '16px', lineHeight: '28px' }}>Task Due</div>
      <Divider />
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', flex: 1 }}>
        {BARS.map((bar, idx) => (
          <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '12px', position: 'relative' }}>
            <div style={{ ...font(14, 400, '#615E83'), width: '100px', flexShrink: 0 }}>{bar.label}</div>
            <div style={{ flex: 1, position: 'relative', height: '12px' }}>
              <div style={{ width: '214px', height: '12px', borderRadius: '4px', backgroundColor: bar.bgColor }} />
              {bar.barWidth > 0 && <div style={{ position: 'absolute', left: 0, top: 0, width: `${bar.barWidth}px`, height: '12px', borderRadius: '4px', backgroundColor: bar.color }} />}
              {idx === 1 && (
                <div style={{ position: 'absolute', right: 0, top: '-18px', width: '24px', height: '26px', backgroundColor: '#1c1c1c', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <span style={{ ...font(12, 500, '#fff') }}>3</span>
                  <div style={{ position: 'absolute', bottom: '-4px', left: '50%', transform: 'translateX(-50%)', width: 0, height: 0, borderLeft: '4px solid transparent', borderRight: '4px solid transparent', borderTop: '4px solid #1c1c1c' }} />
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '12px', paddingLeft: '112px' }}>
        {[0,1,2,3,4].map(n => <span key={n} style={{ ...font(14, 400, '#615E83') }}>{n}</span>)}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 16px', marginTop: '16px' }}>
        {BARS.map(bar => (
          <div key={bar.label} style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <img src={dotSvg(bar.dotColor)} alt="" style={{ width: '14px', height: '14px' }} />
            <span style={{ ...font(14, 400, '#9291A5') }}>{bar.label}:</span>
            <span style={{ ...font(14, 500, '#1E1B39') }}>{bar.count}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

const AIMS = ['Business Administrator Apprenticeship Standard','Business Administrator Gateway to End Point','NCFE Level 2 Functional Skills Qualification in English (September 2019)','Business Administrator End Point Assessment','NCFE Level 2 Functional Skills Qualification in Mathematics (September 2019)']
const INFO_OPTIONS = [
  { label: 'Plan Of Activity/action (1)', route: '/plan-of-activity' },
  { label: 'Unit Summaries (7)', route: '/progress-review' },
  { label: 'Learning Activities (2)', route: '/learning-activities/new-activity' },
  { label: 'Progress Reviews (0)', route: '/progress-review' },
  { label: 'Cancellations (0)', route: '/dashboard' },
  { label: 'Expert Witnesses & Witnesses (0)', route: '/dashboard' },
]
const MAIN_TABS = ['Activity','Manage','Progress','Forms']

const TAB_PILLS: Record<string, { label: string; icon: string; route: string }[]> = {
  Activity: [
    { label: 'Activity', icon: iconChartPolar, route: '/activity-log' },
    { label: 'Learning Activity Evidence', icon: iconFiles, route: '/learning-activities/evidence' },
    { label: 'Timesheet', icon: iconCalendarCheck, route: '/learning-journals/timesheet' },
    { label: 'Visit', icon: iconCalendarBlank, route: '/learning-activities/visit' },
  ],
  Manage: [
    { label: 'Download Portfolio', icon: iconDownload, route: '/learning-activities/download-portfolio' },
    { label: 'Expert / Witnesses', icon: iconUsers, route: '/learning-activities/expert-witnesses' },
    { label: 'Portfolio Showcase', icon: iconPresentation, route: '/learning-activities/showcase' },
  ],
  Progress: [
    { label: 'Gap Analysis', icon: iconSearch, route: '/gap-analysis' },
    { label: 'Learning Journey', icon: iconTrendUp, route: '/learning-journey' },
    { label: 'Scorecard', icon: iconGauge, route: '/scorecard' },
    { label: 'Progress (0%)', icon: iconPieChart, route: '/progress-review' },
  ],
  Forms: [
    { label: 'Learner feedback from teach sessions', icon: iconFormDoc, route: '/learning-activities' },
    { label: 'Exit review and Programme Evaluation', icon: iconFormDoc, route: '/learning-activities' },
    { label: '5. Learning Support Form', icon: iconFormDoc, route: '/learning-activities' },
  ],
}
const INFO_CARDS = [
  { title: 'Plan Of Activity/action', desc: 'View pending and completed Plan Of Activity/action', icon: iconClipboard, statLabel: 'Pending:', stat: '01 / 03', route: '/plan-of-activity' },
  { title: "View the learner's Off-The-Job training record", desc: 'Lorem Ipsum place holder text', icon: iconDocument, statLabel: 'OTJ Total:', stat: '0 / 0', route: '/learning-journals/timesheet' },
  { title: 'Progress Reviews', desc: "View the learner's progress reviews.", icon: iconClipboard, statLabel: 'Next Set:', stat: '27/02/2025', route: '/progress-review' },
]

export default function DashboardPage() {
  const router = useRouter()
  const [mainTab, setMainTab] = useState('Activity')

  return (
    <div>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '16px' }}>
          <h1 style={{ ...font(30, 700, '#000'), margin: 0, letterSpacing: '-0.6px', lineHeight: '40px' }}>Welcome John</h1>
          <img src={iconQuestion} alt="?" style={{ width: '32px', height: '32px', cursor: 'pointer' }} />
        </div>
        <p style={{ ...font(16, 400, '#000'), margin: 0, letterSpacing: '-0.32px' }}>
          If you are concerned or worried you can talk to one of our safeguarding team:{' '}
          <span style={{ textDecoration: 'underline', fontWeight: 500 }}>Email: info@primelearning.uk</span>{' '}
          <span style={{ textDecoration: 'underline', fontWeight: 500 }}>Phone: +4409988423</span>
        </p>
      </div>

      {/* Tab Card */}
      <div style={{ ...cardStyle, padding: '16px', marginBottom: '30px' }}>
        <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
          {MAIN_TABS.map(tab => (
            <button key={tab} onClick={() => setMainTab(tab)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '8px 12px', borderRadius: '8px', ...font(16, mainTab === tab ? 600 : 400, '#1c1c1c'), position: 'relative' }}>
              {tab}
              {mainTab === tab && <div style={{ position: 'absolute', bottom: 0, left: '12px', right: '12px', height: '2px', backgroundColor: '#1c1c1c', borderRadius: '1px' }} />}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' as const, flex: 1 }}>
            {(TAB_PILLS[mainTab] ?? []).map(st => (
              <button key={st.label} onClick={() => router.push(st.route)} style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(28,28,28,0.1)', borderRadius: '16px', padding: '10px 16px', backgroundColor: '#fff', cursor: 'pointer', ...font(14, 400, '#1c1c1c') }}
                onMouseEnter={e => (e.currentTarget.style.backgroundColor = 'rgba(28,28,28,0.04)')}
                onMouseLeave={e => (e.currentTarget.style.backgroundColor = '#fff')}
              >
                <img src={st.icon} alt="" style={{ width: '20px', height: '20px' }} />
                <span>{st.label}</span>
                <img src={iconChevronSmall} alt="" style={{ width: '14px', height: '14px' }} />
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', border: '1px solid rgba(28,28,28,0.2)', borderRadius: '16px', padding: '8px', width: '190px', flexShrink: 0, marginLeft: '12px' }}>
            <img src={iconTrainerAvatar} alt="avatar" style={{ width: '48px', height: '48px', borderRadius: '80px' }} />
            <div>
              <div style={{ ...font(14, 700, '#1c1c1c'), lineHeight: '20px' }}>Cris Curtis</div>
              <div style={{ ...font(14, 400, 'rgba(28,28,28,0.6)'), lineHeight: '20px' }}>Primary Trainer</div>
              <div style={{ ...font(14, 400, '#5FC966'), lineHeight: '20px' }}>Online</div>
            </div>
          </div>
        </div>
      </div>

      {/* Three Chart Cards */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px', overflowX: 'auto' as const }}>
        <DonutChartCard />
        <CalendarCard />
        <BarChartCard />
      </div>

      {/* Three Info Cards */}
      <div style={{ display: 'flex', gap: '30px', marginBottom: '30px' }}>
        {INFO_CARDS.map((card, i) => (
          <div key={i} onClick={() => router.push(card.route)} style={{ ...cardStyle, padding: '30px', display: 'flex', flexDirection: 'column' as const, gap: '12px', flex: 1, cursor: 'pointer' }}>
            <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start' }}>
              <div style={{ width: '44px', height: '44px', borderRadius: '8px', backgroundColor: 'rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <img src={card.icon} alt="" style={{ width: '24px', height: '24px' }} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ ...font(18, 600, '#1E1B39'), lineHeight: '22px', marginBottom: '4px' }}>{card.title}</div>
                <div style={{ ...font(14, 400, '#615E83'), lineHeight: '20px' }}>{card.desc}</div>
              </div>
            </div>
            <div>
              <div style={{ ...font(14, 400, '#9291A5'), marginBottom: '4px' }}>{card.statLabel}</div>
              <div style={{ ...font(24, 700, '#1E1B39') }}>{card.stat}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Black Info Bar */}
      <div style={{ backgroundColor: '#1c1c1c', borderRadius: '8px', padding: '8px', display: 'flex', marginBottom: '30px' }}>
        {[
          { text: 'Workplace : Default Workplace', ul: true },
          { text: 'Mentor name : Josseme', ul: false },
          { text: 'Phone number: ********', ul: false },
          { text: 'Email: None', ul: true },
        ].map((item, i) => (
          <div key={i} style={{ flex: 1, padding: '8px 16px', textAlign: 'center' as const, ...font(14, 700, '#fff'), textDecoration: item.ul ? 'underline' : 'none', whiteSpace: 'nowrap' as const }}>{item.text}</div>
        ))}
      </div>

      {/* Learning Aims + Info Options */}
      <div style={{ display: 'flex', gap: '30px', alignItems: 'flex-start' }}>
        <div style={{ ...cardStyle, flex: 1, padding: '12px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Learning Aim','Current Progress','Target Progress','Action'].map((h, i) => (
                  <th key={h} style={{ ...font(14, 400, 'rgba(28,28,28,0.6)'), padding: '12px', textAlign: (i === 0 ? 'left' : 'center') as 'left' | 'center', fontWeight: 400, width: i === 0 ? undefined : i === 3 ? '75px' : '150px' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {AIMS.map((aim, i) => (
                <tr key={i} style={{ borderBottom: i < AIMS.length - 1 ? '1px solid rgba(28,28,28,0.1)' : 'none' }}>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px' }}>{aim}</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px', textAlign: 'center' as const }}>0%</td>
                  <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px', textAlign: 'center' as const }}>0%</td>
                  <td style={{ padding: '12px', textAlign: 'center' as const }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto' }}>
                      <img src={iconCaretDown} alt="" style={{ width: '24px', height: '24px' }} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ ...cardStyle, width: '345px', flexShrink: 0, display: 'flex', flexDirection: 'column' as const }}>
          <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', padding: '12px 30px', height: '45px', display: 'flex', alignItems: 'center', borderRadius: '16px 16px 0 0', ...font(18, 700, '#000'), letterSpacing: '-0.36px' }}>Information &amp; Options</div>
          {INFO_OPTIONS.map((opt, i) => (
            <button key={opt.label} onClick={() => router.push(opt.route)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', padding: '12px 16px', borderTop: 'none', borderLeft: 'none', borderRight: 'none', borderBottom: i < INFO_OPTIONS.length - 1 ? '1px solid rgba(28,28,28,0.1)' : 'none', background: 'none', cursor: 'pointer', textAlign: 'left' as const }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <img src={iconArrowCircleRight} alt="" style={{ width: '24px', height: '24px' }} />
                <span style={{ ...font(14, 400, '#1c1c1c') }}>{opt.label}</span>
              </div>
              <img src={iconArrowLineRight} alt="" style={{ width: '16px', height: '16px' }} />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
