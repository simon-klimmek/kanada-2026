import type { Metadata } from 'next'
import Link from 'next/link'
import { createAdminClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'

export const metadata: Metadata = { title: 'Admin Dashboard' }

export default async function AdminDashboard() {
  const [user, admin] = await Promise.all([getUser(), Promise.resolve(createAdminClient())])

  const [
    { count: stationCount },
    { count: photoCount },
    { count: commentCount },
    { count: whitelistCount },
  ] = await Promise.all([
    admin.from('stations').select('*', { count: 'exact', head: true }),
    admin.from('photos').select('*', { count: 'exact', head: true }),
    admin.from('comments').select('*', { count: 'exact', head: true }).eq('is_hidden', false),
    admin.from('whitelist').select('*', { count: 'exact', head: true }),
  ])

  const stats = [
    { label: 'Stationen', value: stationCount ?? 0, href: '/admin/stationen', icon: '📍' },
    { label: 'Fotos', value: photoCount ?? 0, href: '/admin/medien', icon: '📸' },
    { label: 'Kommentare', value: commentCount ?? 0, href: '/admin/kommentare', icon: '💬' },
    { label: 'Whitelist', value: whitelistCount ?? 0, href: '/admin/whitelist', icon: '✉️' },
  ]

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl text-forest">Dashboard</h1>
        <p className="font-serif text-forest/50 text-sm mt-1">Willkommen zurück, {user?.email}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        {stats.map(s => (
          <Link key={s.label} href={s.href}
            className="card p-5 hover:shadow-md transition-shadow">
            <span className="text-2xl block mb-2">{s.icon}</span>
            <p className="font-fraunces text-3xl text-forest">{s.value}</p>
            <p className="font-serif text-sm text-forest/50 mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {[
          { href: '/admin/stationen', icon: '📍', title: 'Station erstellen', desc: 'Neue Reisestation anlegen und Bericht schreiben' },
          { href: '/admin/medien', icon: '📸', title: 'Fotos hochladen', desc: 'Bilder zu Stationen hinzufügen' },
          { href: '/admin/whitelist', icon: '✉️', title: 'Freunde einladen', desc: 'E-Mail zur Whitelist hinzufügen' },
          { href: '/admin/kommentare', icon: '💬', title: 'Kommentare moderieren', desc: 'Kommentare prüfen und verwalten' },
        ].map(a => (
          <Link key={a.href} href={a.href}
            className="card p-5 flex gap-4 items-start hover:shadow-md transition-shadow group">
            <span className="text-2xl">{a.icon}</span>
            <div>
              <h3 className="font-fraunces text-lg text-forest group-hover:text-forest-400 transition-colors">
                {a.title}
              </h3>
              <p className="font-serif text-sm text-forest/50 mt-0.5">{a.desc}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
