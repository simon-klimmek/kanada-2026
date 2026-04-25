import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import { createClient } from '@/lib/supabase-server'
import StationCard from '@/components/stations/StationCard'
import type { Station } from '@/lib/types'

export const revalidate = 3600

async function getPublishedStations(): Promise<Station[]> {
  const supabase = await createClient()
  const { data } = await supabase
    .from('stations')
    .select('*')
    .eq('is_published', true)
    .order('sort_order')
    .limit(4)
  return data ?? []
}

export default async function HomePage() {
  const stations = await getPublishedStations()

  return (
    <>
      <Header />
      <main>
        {/* Hero */}
        <section className="relative min-h-[85vh] flex flex-col items-center justify-center text-center px-4 overflow-hidden bg-forest">
          {/* Background texture */}
          <div className="absolute inset-0 opacity-10"
               style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #D4A017 0%, transparent 50%), radial-gradient(circle at 80% 20%, #2E8B57 0%, transparent 40%)' }} />

          <div className="relative z-10 max-w-2xl">
            <span className="inline-block text-amber-400 font-serif text-sm tracking-widest uppercase mb-6 opacity-80">
              Sommer 2026
            </span>
            <h1 className="font-fraunces text-5xl sm:text-7xl text-cream font-light tracking-tight leading-[1.1] mb-6">
              Kanada
              <br />
              <em className="text-amber-400 not-italic">Abenteuer</em>
            </h1>
            <p className="font-serif text-cream/70 text-lg sm:text-xl leading-relaxed mb-10 max-w-lg mx-auto">
              Simon & Franzis Reisetagebuch quer durch den zweitgrößten Staat der Welt –
              von der Westküste bis nach Québec.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/stationen" className="btn-amber">
                Alle Stationen entdecken
              </Link>
              <Link href="/auth/login" className="btn-secondary border-cream/40 text-cream hover:bg-cream hover:text-forest">
                Als Freund anmelden
              </Link>
            </div>
          </div>

          {/* Scroll indicator */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 animate-bounce text-cream/40">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </section>

        {/* Route overview */}
        <section className="py-16 px-4 max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="section-title mb-3">Die Route</h2>
            <p className="font-serif text-forest/60 max-w-md mx-auto">
              Von Vancouver an die Ostküste – 4 Wochen, 8 Stationen, unzählige Momente.
            </p>
          </div>

          {/* Station strip */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {[
              'Vancouver', 'Whistler', 'Banff', 'Jasper',
              'Toronto', 'Niagara Falls', 'Montréal', 'Québec City',
            ].map((city, i) => (
              <span key={city}
                className="flex items-center gap-1.5 px-3 py-1 bg-cream-200 rounded-full text-sm font-serif text-forest/70">
                <span className="text-amber-400 font-medium text-xs">{i + 1}</span>
                {city}
              </span>
            ))}
          </div>

          {stations.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                {stations.map(station => (
                  <StationCard key={station.id} station={station} />
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/stationen" className="btn-secondary">
                  Alle Stationen anzeigen
                </Link>
              </div>
            </>
          ) : (
            <div className="text-center py-16 bg-cream-200 rounded-2xl">
              <p className="text-4xl mb-3">🍁</p>
              <p className="font-fraunces text-xl text-forest/60">
                Die Reise beginnt bald…
              </p>
              <p className="font-serif text-sm text-forest/40 mt-2">
                Die ersten Berichte erscheinen ab Juni 2026
              </p>
            </div>
          )}
        </section>

        {/* Features strip */}
        <section className="bg-forest py-16 px-4">
          <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-8 text-center">
            {[
              { icon: '📸', title: 'Fotos & Berichte', desc: 'Cineastische Bilder und persönliche Geschichten von unterwegs' },
              { icon: '🗺️', title: 'Interaktive Karte', desc: 'Verfolgt unsere Route von Vancouver bis nach Québec City' },
              { icon: '💬', title: 'Reaktionen', desc: 'Freunde können Bilder liken, kommentieren und mitfeiern' },
            ].map(f => (
              <div key={f.title}>
                <span className="text-4xl block mb-3">{f.icon}</span>
                <h3 className="font-fraunces text-lg text-cream mb-2">{f.title}</h3>
                <p className="font-serif text-cream/60 text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  )
}
