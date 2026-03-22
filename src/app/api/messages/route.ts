import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth-server'
import { MOCK_CONTACTS } from '@/constants/mock-data'

export async function GET() {
  const session = await auth()
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json({ data: MOCK_CONTACTS, success: true })
}
