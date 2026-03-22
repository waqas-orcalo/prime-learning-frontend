interface StatusDotProps {
  status: 'online' | 'offline' | 'busy' | 'away'
  size?: number
}

const STATUS_COLORS = {
  online: '#22c55e',
  offline: '#cbd5e1',
  busy: '#f43f5e',
  away: '#f59e0b',
}

export default function StatusDot({ status, size = 10 }: StatusDotProps) {
  return (
    <div style={{
      width: size, height: size,
      borderRadius: '50%',
      backgroundColor: STATUS_COLORS[status],
      border: '2px solid #fff',
      flexShrink: 0,
    }} />
  )
}
