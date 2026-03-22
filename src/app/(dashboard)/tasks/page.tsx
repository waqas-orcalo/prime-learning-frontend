'use client'

const STATUS_COLORS: Record<string, string> = {
  'Completed': '#baedbd',
  'In Progress': '#bfdbfe',
  'Pending': '#fef3c7',
  'Overdue': '#fecaca',
  'Not Started': 'rgba(28,28,28,0.08)',
}

const tasks = [
  { id: 1, title: 'Complete Unit 01 workbook', dueDate: '20/01/2025', priority: 'High', status: 'In Progress', assignedBy: 'Josseme' },
  { id: 2, title: 'Upload evidence for UI UX module', dueDate: '18/01/2025', priority: 'High', status: 'Pending', assignedBy: 'Josseme' },
  { id: 3, title: 'Attend progress review session', dueDate: '15/01/2025', priority: 'Medium', status: 'Completed', assignedBy: 'Josseme' },
  { id: 4, title: 'Submit timesheet for December', dueDate: '05/01/2025', priority: 'Low', status: 'Overdue', assignedBy: 'Josseme' },
  { id: 5, title: 'Review training agreement document', dueDate: '25/01/2025', priority: 'Low', status: 'Not Started', assignedBy: 'Josseme' },
  { id: 6, title: 'Complete online assessment module 3', dueDate: '28/01/2025', priority: 'Medium', status: 'Not Started', assignedBy: 'Self' },
  { id: 7, title: 'Book observation visit with trainer', dueDate: '30/01/2025', priority: 'Medium', status: 'Pending', assignedBy: 'Self' },
]

const tdStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '14px', color: '#1c1c1c',
  padding: '8px 16px', borderBottom: '1px solid rgba(28,28,28,0.1)',
}
const thStyle: React.CSSProperties = {
  fontFamily: "'Inter', sans-serif", fontWeight: 400, fontSize: '14px', color: 'rgba(28,28,28,0.6)',
  padding: '8px 16px', textAlign: 'left', borderBottom: '1px solid rgba(28,28,28,0.1)', whiteSpace: 'nowrap',
}

export default function TasksPage() {
  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h1 style={{ fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.36px', color: '#000', margin: 0 }}>My Tasks</h1>
        <button style={{ padding: '4px 12px', height: '28px', backgroundColor: '#000', borderRadius: '8px', border: 'none', color: '#fff', fontFamily: "'Inter', sans-serif", fontSize: '14px', cursor: 'pointer' }}>
          + New Task
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>
        {[
          { label: 'Total Tasks', value: tasks.length, bg: '#baedbd' },
          { label: 'Completed', value: tasks.filter(t => t.status === 'Completed').length, bg: '#baedbd' },
          { label: 'In Progress', value: tasks.filter(t => t.status === 'In Progress').length, bg: '#bfdbfe' },
          { label: 'Overdue', value: tasks.filter(t => t.status === 'Overdue').length, bg: '#fecaca' },
        ].map((stat, i) => (
          <div key={i} style={{ flex: 1, backgroundColor: '#fff', borderRadius: '12px', border: '1px solid rgba(28,28,28,0.1)', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', color: '#1c1c1c' }}>
              {stat.value}
            </div>
            <span style={{ fontFamily: "'Inter', sans-serif", fontSize: '14px', color: 'rgba(28,28,28,0.6)' }}>{stat.label}</span>
          </div>
        ))}
      </div>

      {/* Tasks table */}
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', border: '1px solid rgba(28,28,28,0.1)', overflow: 'hidden' }}>
        <div style={{ backgroundColor: 'rgba(28,28,28,0.05)', padding: '12px 16px', borderBottom: '1px solid rgba(28,28,28,0.1)', fontFamily: "'Inter', sans-serif", fontWeight: 700, fontSize: '18px', letterSpacing: '-0.36px', color: '#000' }}>
          Task List
        </div>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={thStyle}>#</th>
              <th style={thStyle}>Task Title</th>
              <th style={thStyle}>Due Date</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Priority</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Status</th>
              <th style={thStyle}>Assigned By</th>
              <th style={{ ...thStyle, textAlign: 'center' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task, i) => (
              <tr key={task.id}>
                <td style={tdStyle}>{task.id}</td>
                <td style={{ ...tdStyle, color: '#3b6df4', fontWeight: 500 }}>{task.title}</td>
                <td style={tdStyle}>{task.dueDate}</td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: task.priority === 'High' ? '#fecaca' : task.priority === 'Medium' ? '#fef3c7' : 'rgba(28,28,28,0.08)', color: '#1c1c1c' }}>
                    {task.priority}
                  </span>
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <span style={{ padding: '2px 8px', borderRadius: '12px', fontSize: '12px', backgroundColor: STATUS_COLORS[task.status] || 'rgba(28,28,28,0.08)', color: '#1c1c1c' }}>
                    {task.status}
                  </span>
                </td>
                <td style={tdStyle}>{task.assignedBy}</td>
                <td style={{ ...tdStyle, textAlign: 'center', borderBottom: i === tasks.length - 1 ? 'none' : undefined }}>
                  <div style={{ display: 'flex', gap: '4px', justifyContent: 'center' }}>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                    <button style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '2px', borderRadius: '6px' }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><polyline points="3 6 5 6 21 6" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/><path d="M19 6l-1 14H6L5 6m5 0V4h4v2" stroke="#1c1c1c" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
