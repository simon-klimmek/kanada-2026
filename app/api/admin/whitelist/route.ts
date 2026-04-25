import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'
import { isAdmin } from '@/lib/auth'

export async function POST(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 403 })

  const { email, note, addedBy } = await request.json()
  if (!email) return NextResponse.json({ error: 'E-Mail fehlt.' }, { status: 400 })

  const admin = createAdminClient()
  const { data: entry, error } = await admin
    .from('whitelist')
    .insert({ email: email.toLowerCase(), note, added_by: addedBy })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ entry })
}

export async function DELETE(request: NextRequest) {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Nicht autorisiert.' }, { status: 403 })

  const { id } = await request.json()
  const admin = createAdminClient()
  const { error } = await admin.from('whitelist').delete().eq('id', id)
  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
