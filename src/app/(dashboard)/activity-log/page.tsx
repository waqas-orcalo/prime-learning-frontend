'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

const svg = (s: string) => `data:image/svg+xml,${encodeURIComponent(s)}`

const iconBackCircle = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="15" stroke="#1c1c1c" stroke-width="1.5"/><path d="M18 11l-5 5 5 5" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCaretDown = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M4 6l4 4 4-4" stroke="#1c1c1c" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`)
const iconCalendar = svg(`<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="#1c1c1c" stroke-width="1.2"/><path d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3" stroke="#1c1c1c" stroke-width="1.2" stroke-linecap="round"/></svg>`)

const fontFamily: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif",
  fontFeatureSettings: "'ss01' 1, 'cv01' 1, 'cv11' 1",
}

const font = (
  size: number,
  weight: number = 400,
  color: string = '#1c1c1c',
  extra: React.CSSProperties = {}
): React.CSSProperties => ({
  ...fontFamily,
  fontSize: `${size}px`,
  fontWeight: weight,
  color,
  ...extra,
})

const ROW_COUNT = 20
const TABLE_DATA = Array.from({ length: ROW_COUNT }, () => ({
  dateTime: '07/02/2025 22:16:40',
  category: 'Login',
  description: 'JDOE62 logged in',
  portfolio: '',
  user: 'John doe',
}))

const TOTAL_PAGES = 68

export default function ActivityLogPage() {
  const router = useRouter()
  const [currentPage, setCurrentPage] = useState(1)
  const [pageNumber] = useState(1)
  const [recordsPerPage] = useState(50)

  const renderPagination = () => {
    const pages: (number | string)[] = []
    pages.push(1)
    if (TOTAL_PAGES > 1) pages.push(2)
    if (TOTAL_PAGES > 2) pages.push(3)
    if (TOTAL_PAGES > 4) pages.push('...')
    if (TOTAL_PAGES > 3) pages.push(TOTAL_PAGES - 1)
    if (TOTAL_PAGES > 3) pages.push(TOTAL_PAGES)

    return pages.map((p, i) => (
      <button
        key={i}
        onClick={() => typeof p === 'number' && setCurrentPage(p)}
        style={{
          width: p === '...' ? 'auto' : '32px',
          height: '32px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          border: currentPage === p ? '1.5px solid #1c1c1c' : 'none',
          borderRadius: '6px',
          backgroundColor: 'transparent',
          cursor: p === '...' ? 'default' : 'pointer',
          ...font(14, currentPage === p ? 600 : 400, '#1c1c1c'),
          padding: '0 4px',
        }}
      >
        {p}
      </button>
    ))
  }

  return (
    <div>
      {/* Title Row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '24px' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={iconBackCircle}
          alt="Back"
          style={{ width: '32px', height: '32px', cursor: 'pointer' }}
          onClick={() => router.back()}
        />
        <h1 style={{ ...font(24, 700, '#1c1c1c'), margin: 0, lineHeight: '32px' }}>Activity Log</h1>
      </div>

      {/* Main Card */}
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        boxShadow: '0px 2px 6px 0px rgba(13,10,44,0.08)',
        padding: '24px',
        overflow: 'hidden',
      }}>
        {/* Controls Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ ...font(16, 700, '#1c1c1c') }}>Entries</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ ...font(14, 400, '#615E83') }}>Page number:</span>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '4px',
                border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px',
                padding: '4px 8px', cursor: 'pointer', minWidth: '48px',
              }}>
                <span style={{ ...font(14, 400, '#1c1c1c') }}>{pageNumber}</span>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...font(14, 400, '#615E83') }}>Records per page:</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '4px',
              border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px',
              padding: '4px 8px', cursor: 'pointer', minWidth: '56px',
            }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>{recordsPerPage}</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconCaretDown} alt="" style={{ width: '14px', height: '14px' }} />
            </div>
          </div>
        </div>

        {/* Date Filters Row */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '20px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...font(14, 400, '#615E83') }}>Date From:</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px',
              padding: '6px 10px', backgroundColor: '#fff',
            }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>12/12/2025</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconCalendar} alt="" style={{ width: '16px', height: '16px', opacity: 0.6 }} />
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ ...font(14, 400, '#615E83') }}>Date To:</span>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '6px',
              border: '1px solid rgba(28,28,28,0.15)', borderRadius: '6px',
              padding: '6px 10px', backgroundColor: '#fff',
            }}>
              <span style={{ ...font(14, 400, '#1c1c1c') }}>18/12/2025</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={iconCalendar} alt="" style={{ width: '16px', height: '16px', opacity: 0.6 }} />
            </div>
          </div>

          <button style={{
            backgroundColor: '#1c1c1c',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '7px 20px',
            cursor: 'pointer',
            ...font(14, 600, '#fff'),
          }}>
            Submit
          </button>
        </div>

        {/* Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid rgba(28,28,28,0.1)' }}>
              <th style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: 'left', width: '200px' }}>Date/time</th>
              <th style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: 'left', width: '140px' }}>Category</th>
              <th style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: 'left' }}>Description</th>
              <th style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: 'left', width: '140px' }}>Portfolio</th>
              <th style={{ ...font(14, 400, 'rgba(28,28,28,0.5)'), padding: '12px 16px', textAlign: 'left', width: '140px' }}>User</th>
            </tr>
          </thead>
          <tbody>
            {TABLE_DATA.map((row, i) => (
              <tr key={i} style={{ borderBottom: '1px solid rgba(28,28,28,0.06)' }}>
                <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 16px' }}>{row.dateTime}</td>
                <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 16px' }}>{row.category}</td>
                <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 16px' }}>{row.description}</td>
                <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 16px' }}>{row.portfolio}</td>
                <td style={{ ...font(14, 400, '#1c1c1c'), padding: '12px 16px' }}>{row.user}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Pagination */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '4px',
          marginTop: '20px',
          paddingTop: '16px',
        }}>
          {renderPagination()}
        </div>
      </div>
    </div>
  )
}
