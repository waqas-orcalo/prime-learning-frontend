const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://gateway.primecollege.org/api/v1'

export async function apiFetch<T = any>(
  path: string,
  token: string | undefined,
  options: RequestInit = {},
): Promise<T> {
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  }
  if (token) headers['Authorization'] = `Bearer ${token}`

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })

  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }))
    throw new Error(err?.message || `Request failed: ${res.status}`)
  }

  return res.json()
}
