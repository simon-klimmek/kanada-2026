import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'

export default async function PrivatLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-cream">
      <header className="bg-forest text-cream px-4 sm:px-6 py-4 flex items-center justify-between">
        <div>
          <Link href="/" className="font-fraunces text-lg font-medium">🍁 Kanada 2026</Link>
          <span className="ml-3 text-amber-400 text-xs font-serif">Privater Bereich</span>
        </div>
        <Link href="/admin" className="text-cream/60 hover:text-cream text-sm font-serif transition-colors">
          Admin →
        </Link>
      </header>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <nav className="flex gap-1 mb-8 bg-cream-200 rounded-xl p-1 text-sm font-serif">
          {[
            { href: '/privat', label: '🏠 Übersicht' },
            { href: '/privat/buchungen', label: '✈️ Buchungen' },
            { href: '/privat/budget', label: '💰 Budget' },
            { href: '/privat/packliste', label: '🎒 Packliste' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex-1 text-center px-3 py-2 rounded-lg text-forest/60 hover:text-forest hover:bg-white transition-all text-xs sm:text-sm"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        {children}
      </div>
    </div>
  )
}
