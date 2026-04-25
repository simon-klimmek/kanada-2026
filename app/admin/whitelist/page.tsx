import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import type { WhitelistEntry } from '@/lib/types'
import WhitelistManager from './WhitelistManager'

export const metadata: Metadata = { title: 'Whitelist verwalten' }

export default async function WhitelistPage() {
  const [admin, user] = [createAdminClient(), await getUser()]
  const { data: entries } = await admin.from('whitelist').select('*').order('created_at', { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl text-forest">Whitelist</h1>
        <p className="font-serif text-forest/50 text-sm mt-1">
          Eingeladene Freunde können Reaktionen hinterlassen und kommentieren.
        </p>
      </div>
      <WhitelistManager entries={(entries as WhitelistEntry[]) ?? []} adminEmail={user?.email ?? ''} />
    </div>
  )
}
