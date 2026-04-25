import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-server'
import type { BudgetItem } from '@/lib/types'

export const metadata: Metadata = { title: 'Budget' }

const CATEGORY_ICONS: Record<string, string> = {
  accommodation: '🏨',
  food: '🍽️',
  transport: '🚗',
  activities: '🎯',
  shopping: '🛍️',
  misc: '📋',
}

export default async function BudgetPage() {
  const admin = createAdminClient()
  const { data: items } = await admin
    .from('budget_items')
    .select('*')
    .order('item_date', { ascending: true, nullsFirst: false })

  const planned = (items as BudgetItem[])?.filter(i => i.is_planned) ?? []
  const actual = (items as BudgetItem[])?.filter(i => !i.is_planned) ?? []
  const totalPlanned = planned.reduce((s, i) => s + i.amount, 0)
  const totalActual = actual.reduce((s, i) => s + i.amount, 0)

  return (
    <div>
      <h1 className="font-fraunces text-3xl text-forest mb-6">Budget</h1>

      {/* Summary */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="card p-5">
          <p className="font-serif text-xs text-forest/50 uppercase tracking-wider mb-1">Geplant</p>
          <p className="font-fraunces text-3xl text-forest">
            {totalPlanned.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </p>
          <p className="font-serif text-xs text-forest/40 mt-0.5">CAD</p>
        </div>
        <div className="card p-5">
          <p className="font-serif text-xs text-forest/50 uppercase tracking-wider mb-1">Tatsächlich</p>
          <p className="font-fraunces text-3xl text-forest">
            {totalActual.toLocaleString('de-DE', { minimumFractionDigits: 2 })}
          </p>
          <p className="font-serif text-xs text-forest/40 mt-0.5">CAD</p>
        </div>
      </div>

      {/* Items */}
      <div className="card overflow-hidden">
        <table className="w-full text-sm font-serif">
          <thead className="bg-cream-200 text-forest/60 text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-4 py-3">Kategorie</th>
              <th className="text-left px-4 py-3">Beschreibung</th>
              <th className="text-right px-4 py-3">Betrag</th>
              <th className="text-left px-4 py-3 hidden sm:table-cell">Typ</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cream-300">
            {(items as BudgetItem[])?.map(item => (
              <tr key={item.id} className="hover:bg-cream-100">
                <td className="px-4 py-3">
                  <span>{CATEGORY_ICONS[item.category] ?? '📋'}</span>
                  <span className="ml-1 text-forest/60 capitalize">{item.category}</span>
                </td>
                <td className="px-4 py-3 text-forest">{item.description}</td>
                <td className="px-4 py-3 text-right font-medium text-forest tabular-nums">
                  {item.amount.toLocaleString('de-DE', { minimumFractionDigits: 2 })} {item.currency}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className={`text-xs px-2 py-0.5 rounded-full ${
                    item.is_planned ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                  }`}>
                    {item.is_planned ? 'Geplant' : 'Ausgegeben'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {!items?.length && (
          <div className="text-center py-12 text-forest/40 font-serif text-sm">
            Noch keine Budget-Einträge.
          </div>
        )}
      </div>
    </div>
  )
}
