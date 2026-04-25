import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-server'
import type { Booking } from '@/lib/types'

export const metadata: Metadata = { title: 'Buchungen' }

const CATEGORY_LABELS: Record<string, string> = {
  flight: '✈️ Flug',
  hotel: '🏨 Hotel',
  activity: '🎯 Aktivität',
  transport: '🚗 Transport',
  other: '📋 Sonstiges',
}

export default async function BookingsPage() {
  const admin = createAdminClient()
  const { data: bookings } = await admin
    .from('bookings')
    .select('*')
    .order('checkin_date', { ascending: true, nullsFirst: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-fraunces text-3xl text-forest">Buchungen</h1>
      </div>

      <div className="space-y-3">
        {(bookings as Booking[])?.map(booking => (
          <div key={booking.id} className="card p-5 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-serif text-forest/50">
                  {CATEGORY_LABELS[booking.category] ?? booking.category}
                </span>
                {booking.confirmation_number && (
                  <span className="text-xs font-mono bg-cream-200 px-1.5 py-0.5 rounded text-forest/60">
                    #{booking.confirmation_number}
                  </span>
                )}
              </div>
              <h3 className="font-fraunces text-lg text-forest">{booking.title}</h3>
              {booking.provider && (
                <p className="font-serif text-sm text-forest/50">{booking.provider}</p>
              )}
              {(booking.checkin_date || booking.booking_date) && (
                <p className="font-serif text-xs text-forest/40 mt-1">
                  {booking.checkin_date
                    ? `${new Date(booking.checkin_date).toLocaleDateString('de-DE')}${booking.checkout_date ? ` – ${new Date(booking.checkout_date).toLocaleDateString('de-DE')}` : ''}`
                    : new Date(booking.booking_date!).toLocaleDateString('de-DE')}
                </p>
              )}
            </div>
            {booking.amount && (
              <div className="text-right">
                <p className="font-fraunces text-xl text-forest">
                  {booking.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
                </p>
                <p className="font-serif text-xs text-forest/40">{booking.currency}</p>
              </div>
            )}
          </div>
        ))}
        {!bookings?.length && (
          <div className="text-center py-16 bg-cream-200 rounded-2xl">
            <p className="text-3xl mb-3">✈️</p>
            <p className="font-fraunces text-xl text-forest/60">Noch keine Buchungen erfasst</p>
          </div>
        )}
      </div>
    </div>
  )
}
