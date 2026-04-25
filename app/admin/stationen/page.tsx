import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'
import type { Station } from '@/lib/types'

export const metadata: Metadata = { title: 'Stationen verwalten' }

export default async function AdminStationsPage() {
  const admin = createAdminClient()
  const { data: stations } = await admin
    .from('stations')
    .select('*')
    .order('sort_order')

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-fraunces text-3xl text-forest">Stationen</h1>
        <Link href="/admin/stationen/neu" className="btn-primary">+ Neue Station</Link>
      </div>

      <div className="card overflow-hidden">
        <table className="w-full text-sm font-serif">
          <thead className="bg-cream-200 text-forest/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">#</th>
              <th className="text-left px-4 py-3">Station</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Zeitraum</th>
              <th className="text-left px-4 py-3">Status</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300">
            {(stations as Station[])?.map(station => (
              <tr key={station.id} className="hover:bg-cream-100 transition-colors">
                <td className="px-4 py-3 text-forest/40">{station.sort_order}</td>
                <td className="px-4 py-3">
                  <p className="font-medium text-forest">{station.title}</p>
                  <p className="text-forest/50 text-xs">{station.location_name}</p>
                </td>
                <td className="px-4 py-3 text-forest/60 hidden sm:table-cell">
                  {station.date_start
                    ? new Date(station.date_start).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' })
                    : '—'}
                </td>
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium
                    ${station.is_published
                      ? 'bg-green-100 text-green-700'
                      : 'bg-amber-100 text-amber-700'}`}>
                    {station.is_published ? 'Veröffentlicht' : 'Entwurf'}
                  </span>
                </td>
                <td className="px-4 py-3 text-right">
                  <Link href={`/admin/stationen/${station.slug}`}
                    className="text-forest/50 hover:text-forest text-xs underline underline-offset-2">
                    Bearbeiten
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!stations?.length && (
          <div className="text-center py-12 text-forest/40 font-serif text-sm">
            Noch keine Stationen angelegt.
          </div>
        )}
      </div>
    </div>
  )
}
