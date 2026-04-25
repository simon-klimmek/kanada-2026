'use client'

import { useState, useTransition } from 'react'
import type { WhitelistEntry } from '@/lib/types'

interface Props {
  entries: WhitelistEntry[]
  adminEmail: string
}

export default function WhitelistManager({ entries: initial, adminEmail }: Props) {
  const [entries, setEntries] = useState(initial)
  const [email, setEmail] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setError(null)

    startTransition(async () => {
      const res = await fetch('/api/admin/whitelist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase(), note: note.trim(), addedBy: adminEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error); return }
      setEntries(prev => [data.entry, ...prev])
      setEmail('')
      setNote('')
    })
  }

  async function handleRemove(id: string) {
    startTransition(async () => {
      await fetch('/api/admin/whitelist', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      setEntries(prev => prev.filter(e => e.id !== id))
    })
  }

  return (
    <div className="space-y-6">
      {/* Add form */}
      <form onSubmit={handleAdd} className="card p-5 flex flex-col sm:flex-row gap-3">
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          placeholder="freund@beispiel.de"
          className="flex-1 rounded-lg border border-cream-300 bg-cream px-4 py-2.5 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <input
          type="text"
          value={note}
          onChange={e => setNote(e.target.value)}
          placeholder="Notiz (optional)"
          className="w-40 rounded-lg border border-cream-300 bg-cream px-4 py-2.5 text-sm font-serif focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
        <button type="submit" disabled={isPending} className="btn-primary whitespace-nowrap">
          Hinzufügen
        </button>
      </form>
      {error && <p className="text-red-600 text-sm font-serif">{error}</p>}

      {/* List */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm font-serif">
          <thead className="bg-cream-200 text-forest/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">E-Mail</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Notiz</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Hinzugefügt</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300">
            {entries.map(entry => (
              <tr key={entry.id} className="hover:bg-cream-100">
                <td className="px-4 py-3 text-forest">{entry.email}</td>
                <td className="px-4 py-3 text-forest/50 hidden sm:table-cell">{entry.note ?? '—'}</td>
                <td className="px-4 py-3 text-forest/40 text-xs hidden sm:table-cell">
                  {new Date(entry.created_at).toLocaleDateString('de-DE')}
                </td>
                <td className="px-4 py-3 text-right">
                  <button
                    onClick={() => handleRemove(entry.id)}
                    disabled={isPending}
                    className="text-red-500 hover:text-red-700 text-xs underline underline-offset-2"
                  >
                    Entfernen
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {entries.length === 0 && (
          <div className="text-center py-10 text-forest/40 font-serif text-sm">Noch keine Einträge.</div>
        )}
      </div>
    </div>
  )
}
