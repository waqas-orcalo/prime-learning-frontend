import { NextResponse } from 'next/server'
import { MOCK_JOURNAL_ENTRIES } from '@/constants/mock-data'
import type { JournalEntry } from '@/types'

// GET /api/learning-journals — list all entries (supports ?search= and ?privacy=)
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const search = searchParams.get('search')?.toLowerCase() || ''
  const privacy = searchParams.get('privacy') || ''

  let data = [...MOCK_JOURNAL_ENTRIES]
  if (search) data = data.filter(e => e.title.toLowerCase().includes(search) || e.category.toLowerCase().includes(search) || e.reflection.toLowerCase().includes(search))
  if (privacy) data = data.filter(e => e.privacy === privacy)

  // Sort newest first
  data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

  return NextResponse.json({ data, total: data.length, success: true })
}

// POST /api/learning-journals — create a new entry
export async function POST(request: Request) {
  const body = await request.json()

  if (!body.title?.trim()) {
    return NextResponse.json({ error: 'Title is required', success: false }, { status: 400 })
  }

  const now = new Date().toISOString()
  const newEntry: JournalEntry = {
    id: Date.now().toString(),
    title: body.title.trim(),
    category: body.category || '',
    date: body.date || now.slice(0, 10),
    timeHH: body.timeHH || '',
    timeMM: body.timeMM || '',
    amPm: body.amPm || 'AM',
    durationHH: body.durationHH || '',
    durationMM: body.durationMM || '',
    offJob: body.offJob ?? false,
    onJob: body.onJob ?? false,
    reflection: body.reflection || '',
    privacy: body.privacy || 'only_me',
    files: body.files || [],
    createdAt: now,
    updatedAt: now,
  }

  MOCK_JOURNAL_ENTRIES.unshift(newEntry)

  return NextResponse.json({ data: newEntry, message: 'Journal entry created', success: true }, { status: 201 })
}
