import Link from 'next/link'
import Image from 'next/image'
import type { Station } from '@/lib/types'

interface Props {
  station: Station
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start) return ''
  const fmt = (d: string) =>
    new Date(d).toLocaleDateString('de-DE', { day: 'numeric', month: 'long' })
  return end ? `${fmt(start)} – ${fmt(end)}` : fmt(start)
}

export default function StationCard({ station }: Props) {
  return (
    <Link
      href={`/stationen/${station.slug}`}
      className="card group block hover:shadow-md transition-shadow duration-200"
    >
      <div className="relative aspect-[4/3] bg-forest/10 overflow-hidden">
        {station.cover_image_url ? (
          <Image
            src={station.cover_image_url}
            alt={station.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-4xl opacity-20">
            🍁
          </div>
        )}
        <div className="image-overlay absolute inset-0" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <p className="text-cream/80 text-xs font-serif">
            {formatDateRange(station.date_start, station.date_end)}
          </p>
        </div>
      </div>
      <div className="p-4">
        <h3 className="font-fraunces text-xl text-forest group-hover:text-forest-400 transition-colors">
          {station.title}
        </h3>
        {station.subtitle && (
          <p className="text-forest/60 text-sm mt-1 font-serif">{station.subtitle}</p>
        )}
        {station.location_name && (
          <p className="text-forest/40 text-xs mt-2 font-serif flex items-center gap-1">
            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
            </svg>
            {station.location_name}
          </p>
        )}
      </div>
    </Link>
  )
}
