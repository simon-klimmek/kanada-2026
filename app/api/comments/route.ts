import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase-server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Nicht angemeldet.' }, { status: 401 })

  const { stationId, content } = await request.json()
  if (!stationId || typeof content !== 'string' || content.trim().length === 0) {
    return NextResponse.json({ error: 'Ungültige Eingabe.' }, { status: 400 })
  }
  if (content.length > 1000) {
    return NextResponse.json({ error: 'Kommentar zu lang (max. 1000 Zeichen).' }, { status: 400 })
  }

  // Server-side whitelist check
  const admin = createAdminClient()
  const { data: wl } = await admin.from('whitelist').select('id').ilike('email', user.email ?? '').single()
  if (!wl) return NextResponse.json({ error: 'Kommentieren ist nur für eingeladene Freunde möglich.' }, { status: 403 })

  const { data: comment, error } = await supabase
    .from('comments')
    .insert({ station_id: stationId, user_id: user.id, content: content.trim() })
    .select()
    .single()

  if (error) return NextResponse.json({ error: error.message }, { status: 400 })
  return NextResponse.json({ comment: { ...comment, user_email: user.email } })
}
