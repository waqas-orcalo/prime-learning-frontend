import { NextResponse } from 'next/server'
import { MOCK_JOURNAL_ENTRIES } from '@/constants/mock-data'

// GET /api/learning-journals/[id]
export async function GET(_request: Request, { params }: { params: { id: string } }) {
  const entry = MOCK_JOURNAL_ENTRIES.find(e => e.id === params.id)
  if (!entry) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 })
  return NextResponse.json({ data: entry, success: true })
}

// PUT /api/learning-journals/[id] — full update
export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const idx = MOCK_JOURNAL_ENTRIES.findIndex(e => e.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 })

  const body = await request.json()
  if (!body.title?.trim()) return NextResponse.json({ error: 'Title is required', success: false }, { status: 400 })

  const updated = {
    ...MOCK_JOURNAL_ENTRIES[idx],
    ...body,
    id: params.id,                         // prevent id change
    createdAt: MOCK_JOURNAL_ENTRIES[idx].createdAt, // preserve original
    updatedAt: new Date().toISOString(),
  }
  MOCK_JOURNAL_ENTRIES[idx] = updated

  return NextResponse.json({ data: updated, message: 'Journal entry updated', success: true })
}

// PATCH /api/learning-journals/[id] — partial update
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const idx = MOCK_JOURNAL_ENTRIES.findIndex(e => e.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 })

  const body = await request.json()
  MOCK_JOURNAL_ENTRIES[idx] = { ...MOCK_JOURNAL_ENTRIES[idx], ...body, id: params.id, updatedAt: new Date().toISOString() }

  return NextResponse.json({ data: MOCK_JOURNAL_ENTRIES[idx], message: 'Journal entry updated', success: true })
}

// DELETE /api/learning-journals/[id]
export async function DELETE(_request: Request, { params }: { params: { id: string } }) {
  const idx = MOCK_JOURNAL_ENTRIES.findIndex(e => e.id === params.id)
  if (idx === -1) return NextResponse.json({ error: 'Not found', success: false }, { status: 404 })

  const deleted = MOCK_JOURNAL_ENTRIES.splice(idx, 1)[0]
  return NextResponse.json({ data: deleted, message: 'Journal entry deleted', success: true })
}
