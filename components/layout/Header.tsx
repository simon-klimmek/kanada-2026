'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function Header() {
  const [open, setOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 bg-cream/90 backdrop-blur-sm border-b border-cream-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between h-16">
        <Link href="/" className="font-fraunces text-xl font-medium text-forest tracking-tight">
          🍁 Kanada 2026
        </Link>

        {/* Desktop nav */}
        <nav className="hidden sm:flex items-center gap-6 text-sm font-serif">
          <Link href="/stationen" className="text-forest/70 hover:text-forest transition-colors">
            Stationen
          </Link>
          <Link href="/stationen" className="text-forest/70 hover:text-forest transition-colors">
            Karte
          </Link>
          <Link href="/auth/login" className="btn-primary text-xs px-4 py-2">
            Anmelden
          </Link>
        </nav>

        {/* Mobile menu button */}
        <button
          className="sm:hidden p-2 text-forest"
          onClick={() => setOpen(!open)}
          aria-label="Menü"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile nav */}
      {open && (
        <div className="sm:hidden border-t border-cream-300 bg-cream px-4 py-3 flex flex-col gap-3 text-sm font-serif">
          <Link href="/stationen" className="text-forest/70 py-1" onClick={() => setOpen(false)}>Stationen</Link>
          <Link href="/auth/login" className="btn-primary text-xs text-center" onClick={() => setOpen(false)}>Anmelden</Link>
        </div>
      )}
    </header>
  )
}
