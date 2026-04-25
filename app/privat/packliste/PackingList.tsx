'use client'

import { useState, useTransition } from 'react'
import type { PackingItem } from '@/lib/types'

interface Props { initialItems: PackingItem[] }

const CATEGORY_ICONS: Record<string, string> = {
  clothing: '👕',
  electronics: '💻',
  documents: '📄',
  hygiene: '🧴',
  misc: '📦',
}

export default function PackingList({ initialItems }: Props) {
  const [items, setItems] = useState(initialItems)
  const [isPending, startTransition] = useTransition()

  function toggleItem(id: string, currentValue: boolean) {
    setItems(prev => prev.map(i => i.id === id ? { ...i, is_packed: !currentValue } : i))
    startTransition(async () => {
      await fetch('/api/admin/packing', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, is_packed: !currentValue }),
      })
    })
  }

  const categories = [...new Set(items.map(i => i.category))]
  const total = items.length
  const packed = items.filter(i => i.is_packed).length

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 bg-cream-300 rounded-full h-2 overflow-hidden">
          <div
            className="bg-amber-400 h-full rounded-full transition-all duration-500"
            style={{ width: total > 0 ? `${(packed / total) * 100}%` : '0%' }}
          />
        </div>
        <span className="font-serif text-sm text-forest/60 whitespace-nowrap">
          {packed} / {total} gepackt
        </span>
      </div>

      <div className="space-y-6">
        {categories.map(category => {
          const categoryItems = items.filter(i => i.category === category)
          return (
            <div key={category}>
              <h2 className="font-fraunces text-lg text-forest mb-3 flex items-center gap-2">
                <span>{CATEGORY_ICONS[category] ?? '📦'}</span>
                <span className="capitalize">{category}</span>
                <span className="text-forest/30 text-sm font-serif font-normal">
                  ({categoryItems.filter(i => i.is_packed).length}/{categoryItems.length})
                </span>
              </h2>
              <ul className="space-y-1.5">
                {categoryItems.map(item => (
                  <li key={item.id}>
                    <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-cream-200 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={item.is_packed}
                        onChange={() => toggleItem(item.id, item.is_packed)}
                        disabled={isPending}
                        className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
                      />
                      <span className={`font-serif text-sm flex-1 ${item.is_packed ? 'line-through text-forest/30' : 'text-forest'}`}>
                        {item.item}
                        {item.quantity > 1 && (
                          <span className="text-forest/40 ml-1">×{item.quantity}</span>
                        )}
                      </span>
                      {item.notes && (
                        <span className="text-xs text-forest/30 font-serif">{item.notes}</span>
                      )}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )
        })}
        {items.length === 0 && (
          <div className="text-center py-16 bg-cream-200 rounded-2xl">
            <p className="text-3xl mb-3">🎒</p>
            <p className="font-fraunces text-xl text-forest/60">Packliste ist noch leer</p>
          </div>
        )}
      </div>
    </div>
  )
}
