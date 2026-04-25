import { requireAdmin } from '@/lib/auth'
import Link from 'next/link'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin()

  return (
    <div className="min-h-screen bg-cream flex">
      {/* Sidebar */}
      <aside className="w-56 bg-forest text-cream flex-shrink-0 hidden sm:flex flex-col">
        <div className="p-5 border-b border-white/10">
          <Link href="/" className="font-fraunces text-lg font-medium">🍁 Kanada 2026</Link>
          <p className="text-cream/50 text-xs font-serif mt-0.5">Admin-Bereich</p>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 text-sm font-serif">
          {[
            { href: '/admin', label: 'Dashboard' },
            { href: '/admin/stationen', label: 'Stationen' },
            { href: '/admin/medien', label: 'Medien & Fotos' },
            { href: '/admin/whitelist', label: 'Whitelist' },
            { href: '/admin/kommentare', label: 'Kommentare' },
          ].map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center px-3 py-2 rounded-lg text-cream/70 hover:text-cream hover:bg-white/10 transition-colors"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/10">
          <Link href="/privat" className="flex items-center px-3 py-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/10 text-xs font-serif transition-colors">
            Privater Bereich
          </Link>
          <form action="/api/auth/logout" method="post">
            <button className="w-full text-left flex items-center px-3 py-2 rounded-lg text-cream/50 hover:text-cream hover:bg-white/10 text-xs font-serif transition-colors">
              Abmelden
            </button>
          </form>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        <main className="flex-1 p-6 sm:p-8">{children}</main>
      </div>
    </div>
  )
}
