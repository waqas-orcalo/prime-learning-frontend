import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { MOCK_TASKS } from '@/constants/mock-data'

export async function GET(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const page = parseInt(searchParams.get('page') || '1')
  const pageSize = parseInt(searchParams.get('pageSize') || '10')
  const status = searchParams.get('status') || ''
  const search = searchParams.get('search') || ''

  let filtered = MOCK_TASKS
  if (status) filtered = filtered.filter((t) => t.status === status)
  if (search) filtered = filtered.filter((t) => t.title.toLowerCase().includes(search.toLowerCase()))

  const total = filtered.length
  const data = filtered.slice((page - 1) * pageSize, page * pageSize)

  return NextResponse.json({
    data,
    total,
    page,
    pageSize,
    totalPages: Math.ceil(total / pageSize),
  })
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json()
  const newTask = {
    ...body,
    id: Date.now().toString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }

  return NextResponse.json({ data: newTask, message: 'Task created', success: true }, { status: 201 })
}
