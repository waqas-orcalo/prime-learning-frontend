'use client'

export default function TaskBarChart() {
  const tasks = [
    { label: 'In Progress', value: 8, color: '#3b82f6' },
    { label: 'Complete', value: 15, color: '#10b981' },
    { label: 'Pending', value: 4, color: '#f59e0b' },
  ]
  const maxValue = Math.max(...tasks.map(t => t.value))

  return (
    <div style={{ backgroundColor: '#ffffff', border: '1px solid #e8eaed', borderRadius: '8px', padding: '16px', minWidth: '280px' }}>
      <h3 style={{ fontSize: '14px', fontWeight: 600, marginBottom: '16px', color: '#1a1d2e', margin: '0 0 16px 0' }}>Task Distribution</h3>
      {tasks.map((task, index) => (
        <div key={index} style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
            <label style={{ fontSize: '12px', fontWeight: 500, color: '#6b7280' }}>{task.label}</label>
            <span style={{ fontSize: '12px', fontWeight: 600, color: '#1a1d2e' }}>{task.value}</span>
          </div>
          <div style={{ width: '100%', height: '20px', backgroundColor: '#f4f5f7', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{ width: `${(task.value / maxValue) * 100}%`, height: '100%', backgroundColor: task.color, transition: 'width 0.3s ease' }} />
          </div>
        </div>
      ))}
    </div>
  )
}
