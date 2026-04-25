import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import StationCard from '@/components/stations/StationCard'
import { createClient } from '@/lib/supabase-server'
import type { Station } from '@/lib/types'

export const metadata: Metadata = {
  title: 'Alle Stationen',
  description: 'Alle Reisestationen unserer Kanada-Reise 2026 – von Vancouver bis Québec City.',
}

export const revalidate = 3600

async function getStations(): Promise<Station[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stations')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
  return data ?? []
}

export default async function StationsPage() {
  const stations = await getStations()

  return (
    <>
      <Header />
      <main className="max-w-5xl mx-auto px-4 sm:px-6 py-12">
        <div className="mb-10">
          <h1 className="section-title mb-3">Alle Stationen</h1>
          <p className="font-serif text-forest/60">
            {stations.length > 0
              ? `${stations.length} Station${stations.length > 1 ? 'en' : ''} – klick dich rein!`
              : 'Die Berichte erscheinen ab Juni 2026.'}
          </p>
        </div>

        {stations.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {stations.map(station => (
              <StationCard key={station.id} station={station} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-cream-200 rounded-2xl">
            <p className="text-5xl mb-4">🍁</p>
            <h2 className="font-fraunces text-2xl text-forest/70 mb-2">Noch nichts zu sehen</h2>
            <p className="font-serif text-forest/40 text-sm">
              Die Reise startet im Sommer 2026 – komm dann wieder!
            </p>
          </div>
        )}
      </main>
      <Footer />
    </>
  )
}
