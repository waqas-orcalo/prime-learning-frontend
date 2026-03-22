/**
 * SSE (Server-Sent Events) client utility
 * Replaces socket.io-client for real-time events.
 * Uses native browser EventSource — zero npm dependencies.
 */

let eventSource: EventSource | null = null

export type SseEventType = 'new-message' | 'message-read' | 'user-online' | 'user-offline'

export interface SseMessagePayload {
  _id: string
  senderId: string
  content: string
  createdAt: string
  isRead: boolean
}

export function connectSse(
  token: string,
  onMessage: (type: SseEventType, data: Record<string, unknown>) => void,
): EventSource {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }

  const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3000/api/v1'
  const url = `${apiUrl}/messages/stream?token=${encodeURIComponent(token)}`

  eventSource = new EventSource(url)

  const handleEvent = (type: SseEventType) => (e: MessageEvent) => {
    try {
      const data = JSON.parse(e.data)
      onMessage(type, data)
    } catch {
      // ignore parse errors
    }
  }

  eventSource.addEventListener('new-message', handleEvent('new-message'))
  eventSource.addEventListener('message-read', handleEvent('message-read'))
  eventSource.addEventListener('user-online', handleEvent('user-online'))
  eventSource.addEventListener('user-offline', handleEvent('user-offline'))

  eventSource.onerror = () => {
    // EventSource auto-reconnects — no manual retry needed
  }

  return eventSource
}

export function disconnectSse(): void {
  if (eventSource) {
    eventSource.close()
    eventSource = null
  }
}
