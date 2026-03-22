'use client'

import type { ReactNode } from 'react'

// ── Style helpers ──────────────────────────────────────────────────────────
const thStyle = {
  padding: '12px 16px',
  textAlign: 'left' as const,
  fontFamily: "'Inter', sans-serif",
  fontSize: '13px',
  fontWeight: 600,
  color: '#888888',
  letterSpacing: '-0.065px',
  borderBottom: '1px solid #e4e7ec',
  whiteSpace: 'nowrap' as const,
  backgroundColor: '#fafafa',
}

const tdStyle = {
  padding: '14px 16px',
  fontFamily: "'Inter', sans-serif",
  fontSize: '14px',
  color: '#1e293b',
  borderBottom: '1px solid rgba(28,28,28,0.06)',
  verticalAlign: 'middle' as const,
}

// ── Column definition ──────────────────────────────────────────────────────
export interface Column<T> {
  key: string
  header: string
  width?: string | number
  render?: (row: T, index: number) => ReactNode
}

// ── Table component ────────────────────────────────────────────────────────
interface TableProps<T> {
  columns: Column<T>[]
  data: T[]
  loading?: boolean
  emptyMessage?: string
  onRowClick?: (row: T) => void
}

export default function Table<T extends { id: string }>({
  columns, data, loading, emptyMessage = 'No records found.', onRowClick,
}: TableProps<T>) {
  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {columns.map((col) => (
              <th key={col.key} style={{ ...thStyle, width: col.width }}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {loading ? (
            <tr>
              <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                Loading...
              </td>
            </tr>
          ) : data.length === 0 ? (
            <tr>
              <td colSpan={columns.length} style={{ ...tdStyle, textAlign: 'center', color: '#94a3b8', padding: '40px' }}>
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((row, index) => (
              <tr
                key={row.id}
                onClick={() => onRowClick?.(row)}
                style={{ cursor: onRowClick ? 'pointer' : 'default', transition: 'background 0.1s' }}
                onMouseEnter={(e) => { if (onRowClick) (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc' }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.backgroundColor = '' }}
              >
                {columns.map((col) => (
                  <td key={col.key} style={tdStyle}>
                    {col.render ? col.render(row, index) : String((row as any)[col.key] ?? '')}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
