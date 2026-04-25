'use client'

import { useState, useTransition } from 'react'
import type { Comment } from '@/lib/types'

interface Props {
  stationId: string
  initialComments: (Comment & { user_email?: string })[]
  isAuthenticated: boolean
  isWhitelisted: boolean
}

export default function CommentSection({
  stationId,
  initialComments,
  isAuthenticated,
  isWhitelisted,
}: Props) {
  const [comments, setComments] = useState(initialComments)
  const [text, setText] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    setError(null)

    startTransition(async () => {
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stationId, content: text.trim() }),
        })
        if (!res.ok) {
          const data = await res.json()
          setError(data.error ?? 'Fehler beim Senden.')
          return
        }
        const { comment } = await res.json()
        setComments(prev => [...prev, comment])
        setText('')
      } catch {
        setError('Netzwerkfehler. Bitte erneut versuchen.')
      }
    })
  }

  return (
    <section className="mt-8">
      <h3 className="font-fraunces text-2xl text-forest mb-4">Kommentare</h3>

      {comments.length === 0 ? (
        <p className="text-forest/50 text-sm font-serif italic">Noch keine Kommentare – sei der Erste!</p>
      ) : (
        <ul className="space-y-4 mb-6">
          {comments.map(c => (
            <li key={c.id} className="bg-white rounded-xl border border-cream-300 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-serif text-forest/40">
                  {c.user_email ? c.user_email.split('@')[0] : 'Jemand'}
                </span>
                <span className="text-xs text-forest/30">·</span>
                <time className="text-xs text-forest/30" dateTime={c.created_at}>
                  {new Date(c.created_at).toLocaleDateString('de-DE', {
                    day: 'numeric', month: 'short', year: 'numeric',
                  })}
                </time>
              </div>
              <p className="text-sm font-serif text-forest/80 leading-relaxed">{c.content}</p>
            </li>
          ))}
        </ul>
      )}

      {isAuthenticated && isWhitelisted ? (
        <form onSubmit={handleSubmit} className="flex flex-col gap-2">
          <textarea
            value={text}
            onChange={e => setText(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder="Schreib etwas…"
            className="w-full rounded-xl border border-cream-300 bg-white px-4 py-3 text-sm font-serif
                       text-forest placeholder-forest/30 focus:outline-none focus:ring-2 focus:ring-amber-400
                       resize-none"
          />
          {error && <p className="text-red-600 text-xs font-serif">{error}</p>}
          <div className="flex items-center justify-between">
            <span className="text-xs text-forest/40 font-serif">{text.length}/1000</span>
            <button type="submit" disabled={isPending || !text.trim()} className="btn-primary text-xs px-4 py-2">
              {isPending ? 'Wird gesendet…' : 'Kommentieren'}
            </button>
          </div>
        </form>
      ) : !isAuthenticated ? (
        <p className="text-sm font-serif text-forest/50">
          <a href="/auth/login" className="text-forest underline underline-offset-2 hover:text-amber-400">
            Anmelden
          </a>{' '}um zu kommentieren.
        </p>
      ) : (
        <p className="text-sm font-serif text-forest/50 italic">
          Kommentieren ist nur für eingeladene Freunde möglich.
        </p>
      )}
    </section>
  )
}
