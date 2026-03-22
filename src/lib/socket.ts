/**
 * socket.ts — stub file
 * ──────────────────────────────────────────────────────────────────────────────
 * The real-time channel is now implemented via SSE (Server-Sent Events).
 * See src/lib/sse.ts for the active implementation.
 *
 * This file keeps the SOCKET_EVENTS constants for any component that still
 * imports them, but the actual socket.io-client transport is replaced.
 */

export { connectSse as connectSocket, disconnectSse as disconnectSocket } from './sse'

export const SOCKET_EVENTS = {
  CONNECT: 'connect',
  DISCONNECT: 'disconnect',
  CONNECT_ERROR: 'connect_error',
  MESSAGE_NEW: 'new-message',
  MESSAGE_READ: 'message-read',
  TASK_UPDATED: 'task:updated',
  TASK_ASSIGNED: 'task:assigned',
  NOTIFICATION_NEW: 'notification:new',
} as const
