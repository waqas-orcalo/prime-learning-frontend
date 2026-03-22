'use client'

/**
 * use-socket.ts
 * ──────────────────────────────────────────────────────────────────────────────
 * Previously used socket.io-client; now uses SSE (Server-Sent Events).
 * The connectSse / disconnectSse functions are drop-in equivalents for the
 * real-time channel used by the messages page.
 *
 * If you install socket.io-client in the future, restore the original
 * socket.io-based implementation from git history.
 */

export { connectSse as connectSocket, disconnectSse as disconnectSocket } from '@/lib/sse'
