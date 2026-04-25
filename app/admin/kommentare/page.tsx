import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase-server'
import type { Comment } from '@/lib/types'

export const metadata: Metadata = { title: 'Kommentare moderieren' }

export default async function AdminCommentsPage() {
  const admin = createAdminClient()
  const { data: comments } = await admin
    .from('comments')
    .select('*, stations(title)')
    .order('created_at', { ascending: false })
    .limit(100)

  return (
    <div>
      <h1 className="font-fraunces text-3xl text-forest mb-8">Kommentare</h1>

      <div className="space-y-3">
        {(comments as (Comment & { stations: { title: string } | null })[])?.map(comment => (
          <div key={comment.id} className={`card p-4 ${comment.is_hidden ? 'opacity-50' : ''}`}>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1 text-xs font-serif text-forest/50">
                  <span>{comment.stations?.title ?? 'Unbekannte Station'}</span>
                  <span>·</span>
                  <time>{new Date(comment.created_at).toLocaleDateString('de-DE')}</time>
                  {comment.is_hidden && (
                    <span className="bg-red-100 text-red-600 px-1.5 py-0.5 rounded text-xs">Versteckt</span>
                  )}
                </div>
                <p className="font-serif text-sm text-forest leading-relaxed">{comment.content}</p>
              </div>
            </div>
          </div>
        ))}
        {!comments?.length && (
          <div className="text-center py-12 text-forest/40 font-serif text-sm">Keine Kommentare vorhanden.</div>
        )}
      </div>
    </div>
  )
}
