'use client'

import { useState } from 'react'
import Link from 'next/link'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)

const FF = { fontFamily: "'Inter', sans-serif", fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1" } as const
const font = (size: number, weight = 400, color = '#1c1c1c', extra: Record<string, unknown> = {}) => ({ ...FF, fontSize: `${size}px`, fontWeight: weight, color, ...extra })

const ACTIVITIES_DATA = [
  { date: '03/01/2025', ref: 'PRJ1', title: 'UI UX Design for onefile', method: 'Assignment', trainerTime: '0', learnerTime: '60', plan: 'None', actionRequired: 'Learner' },
  { date: '03/01/2025', ref: 'PRJ1', title: 'UI UX Design for onefile', method: 'Assignment', trainerTime: '0', learnerTime: '60', plan: 'None', actionRequired: 'Trainer' },
  { date: '03/01/2025', ref: 'PRJ1', title: 'UI UX Design for onefile', method: 'Assignment', trainerTime: '0', learnerTime: '60', plan: 'None', actionRequired: 'Learner' },
  { date: '03/01/2025', ref: 'PRJ1', title: 'UI UX Design for onefile', method: 'Assignment', trainerTime: '0', learnerTime: '60', plan: 'None', actionRequired: 'Learner' },
  { date: '03/01/2025', ref: 'PRJ1', title: 'UI UX Design for onefile', method: 'Assignment', trainerTime: '0', learnerTime: '60', plan: 'None', actionRequired: 'Learner' },
]

export default function LearningActivitiesPage() {
  return (
    <div>
      {/* Top Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px', backgroundColor: '#fff', padding: '6px 12px' }}>
          <span style={{ ...font(13, 400, '#1c1c1c') }}>Show: Pending</span>
          <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
        </div>
        <Link href="/learning-activities/new-activity">
          <button style={{ backgroundColor: '#1c1c1c', border: 'none', borderRadius: '8px', padding: '8px 16px', cursor: 'pointer', ...font(14, 600, '#fff'), display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span>Create Learning Activity</span>
            <span>+</span>
          </button>
        </Link>
      </div>

      {/* Table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)', overflow: 'hidden' }}>
        <div style={{ padding: '0 20px 24px' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' as const, marginTop: '0' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
                {['Date', 'Ref', 'Learning Activity Title', 'Method', 'Trainer Learning Activity Time (minutes)', "Learner's Learning Activity Time (minutes)", 'Related Plan Of Activity/action', 'Action Required By', 'Add to showcase'].map((h) => (
                  <th key={h} style={{ ...font(13, 400, 'rgba(28,28,28,0.5)'), padding: '10px 8px', textAlign: 'left' as const, fontWeight: 400, whiteSpace: 'nowrap' as const }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ACTIVITIES_DATA.map((row, i) => (
                <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.date}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.ref}</td>
                  <td style={{ padding: '12px 8px' }}>
                    <Link href="/learning-activities/evidence">
                      <span style={{ ...font(13, 400, '#4169e1'), cursor: 'pointer', textDecoration: 'none' }}>{row.title}</span>
                    </Link>
                  </td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.method}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.trainerTime}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.learnerTime}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.plan}</td>
                  <td style={{ ...font(13, 400, '#1c1c1c'), padding: '12px 8px' }}>{row.actionRequired}</td>
                  <td style={{ padding: '12px 8px', textAlign: 'center' as const }}>
                    <input type="checkbox" style={{ width: '15px', height: '15px', accentColor: '#1c1c1c', cursor: 'pointer' }} />
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
