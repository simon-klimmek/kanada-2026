import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'

export const metadata: Metadata = { title: 'Privater Bereich' }

export default async function PrivatPage() {
  const admin = createAdminClient()

  const [
    { count: bookingCount },
    { count: budgetCount },
    { count: packingCount },
    { data: packedItems },
  ] = await Promise.all([
    admin.from('bookings').select('*', { count: 'exact', head: true }),
    admin.from('budget_items').select('*', { count: 'exact', head: true }),
    admin.from('packing_items').select('*', { count: 'exact', head: true }),
    admin.from('packing_items').select('is_packed').eq('is_packed', true),
  ])

  const packedCount = packedItems?.length ?? 0
  const totalPacking = packingCount ?? 0
  const packingPercent = totalPacking > 0 ? Math.round((packedCount / totalPacking) * 100) : 0

  return (
    <div>
      <h1 className="font-fraunces text-3xl text-forest mb-8">Unsere Reisedaten</h1>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Link href="/privat/buchungen" className="card p-6 hover:shadow-md transition-shadow group">
          <span className="text-3xl block mb-3">✈️</span>
          <p className="font-fraunces text-4xl text-forest">{bookingCount ?? 0}</p>
          <p className="font-serif text-forest/50 mt-1">Buchungen</p>
          <p className="text-xs text-forest/30 font-serif mt-3 group-hover:text-forest/50 transition-colors">
            Öffnen →
          </p>
        </Link>

        <Link href="/privat/budget" className="card p-6 hover:shadow-md transition-shadow group">
          <span className="text-3xl block mb-3">💰</span>
          <p className="font-fraunces text-4xl text-forest">{budgetCount ?? 0}</p>
          <p className="font-serif text-forest/50 mt-1">Budget-Einträge</p>
          <p className="text-xs text-forest/30 font-serif mt-3 group-hover:text-forest/50 transition-colors">
            Öffnen →
          </p>
        </Link>

        <Link href="/privat/packliste" className="card p-6 hover:shadow-md transition-shadow group">
          <span className="text-3xl block mb-3">🎒</span>
          <div className="flex items-baseline gap-2 mb-1">
            <p className="font-fraunces text-4xl text-forest">{packedCount}</p>
            <p className="font-serif text-forest/40 text-sm">/ {totalPacking}</p>
          </div>
          <p className="font-serif text-forest/50 mt-1">Gegenstände eingepackt</p>
          <div className="mt-3 bg-cream-300 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-amber-400 h-full rounded-full transition-all duration-500"
              style={{ width: `${packingPercent}%` }}
            />
          </div>
          <p className="text-xs text-forest/30 font-serif mt-1">{packingPercent}% gepackt</p>
        </Link>
      </div>
    </div>
  )
}
