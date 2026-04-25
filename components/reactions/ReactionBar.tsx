'use client'

import { useState, useTransition } from 'react'
import { REACTION_EMOJI, REACTION_LABELS, type ReactionType } from '@/lib/types'

interface Props {
  stationId: string
  counts: Record<ReactionType, number>
  userReactions: ReactionType[]
  isAuthenticated: boolean
}

const REACTION_TYPES: ReactionType[] = ['like', 'heart', 'haha', 'wow']

export default function ReactionBar({ stationId, counts, userReactions, isAuthenticated }: Props) {
  const [optimisticCounts, setOptimisticCounts] = useState(counts)
  const [optimisticUserReactions, setOptimisticUserReactions] = useState(userReactions)
  const [isPending, startTransition] = useTransition()

  async function handleReaction(type: ReactionType) {
    if (!isAuthenticated) {
      window.location.href = '/auth/login'
      return
    }

    const isActive = optimisticUserReactions.includes(type)

    // Optimistic update
    setOptimisticCounts(prev => ({
      ...prev,
      [type]: isActive ? prev[type] - 1 : prev[type] + 1,
    }))
    setOptimisticUserReactions(prev =>
      isActive ? prev.filter(r => r !== type) : [...prev, type]
    )

    startTransition(async () => {
      try {
        const res = await fetch('/api/reactions', {
          method: isActive ? 'DELETE' : 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ stationId, type }),
        })
        if (!res.ok) throw new Error()
      } catch {
        // Revert on error
        setOptimisticCounts(counts)
        setOptimisticUserReactions(userReactions)
      }
    })
  }

  return (
    <div className="flex flex-wrap gap-2" aria-label="Reaktionen">
      {REACTION_TYPES.map(type => {
        const active = optimisticUserReactions.includes(type)
        const count = optimisticCounts[type]
        return (
          <button
            key={type}
            onClick={() => handleReaction(type)}
            disabled={isPending}
            aria-label={`${REACTION_LABELS[type]} (${count})`}
            aria-pressed={active}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm
              border transition-all duration-150 active:scale-95 disabled:opacity-60
              ${active
                ? 'border-amber-400 bg-amber-400/15 text-forest font-semibold'
                : 'border-cream-300 bg-white text-forest/60 hover:border-amber-300 hover:bg-amber-50'
              }`}
          >
            <span className="text-base leading-none">{REACTION_EMOJI[type]}</span>
            {count > 0 && <span className="font-serif tabular-nums">{count}</span>}
          </button>
        )
      })}
    </div>
  )
}
