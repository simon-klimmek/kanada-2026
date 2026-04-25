'use client'

import { useState } from 'react'

type State = 'idle' | 'loading' | 'sent' | 'error'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<State>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setState('loading')
    setErrorMsg('')

    try {
      const res = await fetch('/api/auth/magic-link', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error ?? 'Fehler beim Senden.')
        setState('error')
        return
      }
      setState('sent')
    } catch {
      setErrorMsg('Netzwerkfehler. Bitte erneut versuchen.')
      setState('error')
    }
  }

  if (state === 'sent') {
    return (
      <div className="card p-8 text-center">
        <span className="text-4xl block mb-3">📬</span>
        <h2 className="font-fraunces text-xl text-forest mb-2">E-Mail gesendet!</h2>
        <p className="font-serif text-forest/60 text-sm leading-relaxed">
          Schau in deinen Posteingang – wir haben dir einen Anmeldelink geschickt.
          <br />Der Link ist 1 Stunde gültig.
        </p>
        <button
          onClick={() => { setState('idle'); setEmail('') }}
          className="mt-5 text-xs text-forest/40 hover:text-forest underline font-serif"
        >
          Andere E-Mail verwenden
        </button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="card p-6 flex flex-col gap-4">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-serif text-forest/60 uppercase tracking-wider">E-Mail-Adresse</span>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
          autoFocus
          placeholder="du@beispiel.de"
          className="rounded-lg border border-cream-300 bg-cream px-4 py-2.5 text-sm font-serif
                     text-forest placeholder-forest/30 focus:outline-none focus:ring-2 focus:ring-amber-400"
        />
      </label>

      {state === 'error' && (
        <p className="text-red-600 text-xs font-serif bg-red-50 rounded-lg px-3 py-2">{errorMsg}</p>
      )}

      <button
        type="submit"
        disabled={state === 'loading' || !email.trim()}
        className="btn-primary justify-center disabled:opacity-50"
      >
        {state === 'loading' ? 'Wird gesendet…' : 'Magic Link anfordern'}
      </button>

      <p className="text-xs text-forest/40 font-serif text-center leading-relaxed">
        Nur eingeladene Freunde können sich anmelden.
        <br />Kein Account nötig – einfach E-Mail eingeben.
      </p>
    </form>
  )
}
