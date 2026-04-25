import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'
import type { ReactionType } from '@/lib/types'

const VALID_TYPES: ReactionType[] = ['like', 'heart', 'haha', 'wow']

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { stationId, type } = await request.json()
  if (!stationId || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 })
  }

  // Server-side whitelist check
  const admin = createAdminClient()
  const { data: wl } = await admin.from('whitelist').select('id').ilike('email', user.email ?? '').single()
  if (!wl) return NextResponse.json({ error: 'Keine Berechtigung.' }, { status: 403 })

  const { error } = await supabase
    .from('reactions')
    .insert({ station_id: stationId, user_id: user.id, type })

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}

export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { stationId, type } = await request.json()
  if (!stationId || !VALID_TYPES.includes(type)) {
    return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 })
  }

  const { error } = await supabase
    .from('reactions')
    .delete()
    .eq('station_id', stationId)
    .eq('user_id', user.id)
    .eq('type', type)

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ ok: true })
}
