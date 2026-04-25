import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase-server'

export async function POST(request: NextRequest) {
  const { email } = await request.json()

  if (!email || typeof email !== 'string') {
    return NextResponse.json({ error: 'Ungültige E-Mail-Adresse.' }, { status: 400 })
  }

  const normalizedEmail = email.trim().toLowerCase()

  // SECURITY: Whitelist check is ALWAYS server-side using service role
  const admin = createAdminClient()
  const { data: entry } = await admin
    .from('whitelist')
    .select('id')
    .ilike('email', normalizedEmail)
    .single()

  if (!entry) {
    // Return same message to prevent email enumeration
    return NextResponse.json({
      message: 'Wenn du eingeladen wurdest, erhältst du in Kürze eine E-Mail.',
    })
  }

  const { error } = await admin.auth.admin.generateLink({
    type: 'magiclink',
    email: normalizedEmail,
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? request.nextUrl.origin}/auth/callback`,
    },
  })

  if (error) {
    console.error('Magic link error:', error)
    return NextResponse.json({ error: 'Fehler beim Senden. Bitte versuche es später erneut.' }, { status: 500 })
  }

  return NextResponse.json({ message: 'Magic Link gesendet.' })
}
