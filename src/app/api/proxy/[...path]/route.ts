/**
 * Universal proxy route — forwards every request to the backend.
 *
 * Browser  →  https://primecollege.org/api/proxy/<path>
 *          →  (server-side Node.js, no mixed-content restriction)
 *          →  http://gateway.primecollege.org/api/v1/<path>
 *
 * Env vars (set on the deployment platform, NOT in the browser bundle):
 *   BACKEND_URL   — backend base URL  (default: http://gateway.primecollege.org/api/v1)
 *
 * Frontend env var (baked into the browser bundle):
 *   NEXT_PUBLIC_API_URL=https://primecollege.org/api/proxy   ← for production
 *   NEXT_PUBLIC_API_URL=https://gateway.primecollege.org/api/v1          ← for local dev
 */

import { NextRequest, NextResponse } from 'next/server'

const BACKEND = (
  process.env.BACKEND_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  'https://gateway.primecollege.org/api/v1'
).replace(/\/+$/, '')

type Ctx = { params: { path: string[] } }

async function proxy(req: NextRequest, { params }: Ctx): Promise<NextResponse> {
  const { path } = params
  const slug = path.join('/')
  const search = req.nextUrl.search          // ?page=1&limit=10 etc.
  const targetUrl = `${BACKEND}/${slug}${search}`

  // Forward relevant headers; drop host so the backend sees its own
  const headers: Record<string, string> = {}
  const forward = ['content-type', 'authorization', 'accept', 'x-request-id']
  for (const key of forward) {
    const val = req.headers.get(key)
    if (val) headers[key] = val
  }

  let body: BodyInit | undefined
  if (!['GET', 'HEAD'].includes(req.method)) {
    body = await req.arrayBuffer()
  }

  try {
    const upstream = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
      // @ts-ignore — Node 18+ fetch supports this
      duplex: 'half',
    })

    const resBody = await upstream.arrayBuffer()
    const resHeaders = new Headers()

    // Forward safe response headers
    const passthroughHeaders = ['content-type', 'content-length', 'cache-control']
    for (const key of passthroughHeaders) {
      const val = upstream.headers.get(key)
      if (val) resHeaders.set(key, val)
    }

    return new NextResponse(resBody, {
      status: upstream.status,
      statusText: upstream.statusText,
      headers: resHeaders,
    })
  } catch (err: any) {
    console.error(`[proxy] ${req.method} ${targetUrl} →`, err?.message)
    return NextResponse.json(
      { message: 'Upstream request failed', error: err?.message },
      { status: 502 },
    )
  }
}

export const GET     = proxy
export const POST    = proxy
export const PUT     = proxy
export const PATCH   = proxy
export const DELETE  = proxy
export const OPTIONS = proxy
