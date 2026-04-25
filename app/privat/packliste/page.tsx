import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-server'
import type { PackingItem } from '@/lib/types'
import PackingList from './PackingList'

export const metadata: Metadata = { title: 'Packliste' }

export default async function PackingPage() {
  const admin = createAdminClient()
  const { data: items } = await admin
    .from('packing_items')
    .select('*')
    .order('category')
    .order('sort_order')

  return (
    <div>
      <h1 className="font-fraunces text-3xl text-forest mb-6">Packliste</h1>
      <PackingList initialItems={(items as PackingItem[]) ?? []} />
    </div>
  )
}
