'use client'

interface CalendarWidgetProps {
  month?: number
  year?: number
}

export default function CalendarWidget({ month = 5, year = 2025 }: CalendarWidgetProps) {
  const getDaysInMonth = (m: number, y: number) => new Date(y, m, 0).getDate()
  const getFirstDayOfMonth = (m: number, y: number) => new Date(y, m - 1, 1).getDay()

  const daysInMonth = getDaysInMonth(month, year)
  const firstDay = getFirstDayOfMonth(month, year)
  const monthNames = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const days: (number | null)[] = []
  for (let i = 0; i < firstDay; i++) days.push(null)
  for (let i = 1; i <= daysInMonth; i++) days.push(i)

  const isHighlighted = (day: number) => day >= 23 && day <= 27

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8eaed', borderRadius: '8px', padding: '16px', minWidth: '280px' }}>
      <div style={{ marginBottom: '16px', textAlign: 'center' }}>
        <h3 style={{ fontSize: '14px', fontWeight: 600, color: '#1a1d2e', margin: 0 }}>{monthNames[month]} {year}</h3>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {dayNames.map(day => (
              <th key={day} style={{ padding: '8px', textAlign: 'center', fontSize: '12px', fontWeight: 600, color: '#6b7280' }}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: Math.ceil(days.length / 7) }).map((_, weekIndex) => (
            <tr key={weekIndex}>
              {days.slice(weekIndex * 7, (weekIndex + 1) * 7).map((day, dayIndex) => (
                <td key={dayIndex} style={{ padding: '8px', textAlign: 'center' }}>
                  {day ? (
                    <div style={{
                      padding: '6px', borderRadius: '4px',
                      backgroundColor: isHighlighted(day) ? '#6366f1' : 'transparent',
                      color: isHighlighted(day) ? '#ffffff' : '#1a1d2e',
                      fontSize: '13px', fontWeight: 500,
                    }}>{day}</div>
                  ) : null}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
