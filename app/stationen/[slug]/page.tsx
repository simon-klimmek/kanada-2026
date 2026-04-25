import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import ReactionBar from '@/components/reactions/ReactionBar'
import CommentSection from '@/components/comments/CommentSection'
import { createClient } from '@/lib/supabase-server'
import { getUser } from '@/lib/auth'
import { createAdminClient } from '@/lib/supabase-server'
import type { Station, Post, Photo, ReactionType } from '@/lib/types'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('stations').select('title, subtitle').eq('slug', slug).single()
  if (!data) return { title: 'Station nicht gefunden' }
  return {
    title: data.title,
    description: data.subtitle ?? undefined,
  }
}

export const revalidate = 300

export default async function StationPage({ params }: Props) {
  const { slug } = await params
  const supabase = await createClient()

  const { data: station } = await supabase
    .from('stations')
    .select('*')
    .eq('slug', slug)
    .eq('is_published', true)
    .single()

  if (!station) notFound()

  const [{ data: posts }, { data: photos }, { data: reactions }, user] = await Promise.all([
    supabase.from('posts').select('*').eq('station_id', station.id).eq('is_published', true).order('sort_order'),
    supabase.from('photos').select('*').eq('station_id', station.id).order('sort_order'),
    supabase.from('reactions').select('type').eq('station_id', station.id),
    getUser(),
  ])

  const { data: comments } = await supabase
    .from('comments')
    .select('*')
    .eq('station_id', station.id)
    .eq('is_hidden', false)
    .order('created_at')

  // Tally reaction counts
  const counts: Record<ReactionType, number> = { like: 0, heart: 0, haha: 0, wow: 0 }
  reactions?.forEach(r => { counts[r.type as ReactionType]++ })

  // Current user's reactions
  let userReactions: ReactionType[] = []
  let isWhitelisted = false
  if (user) {
    const { data: myReactions } = await supabase
      .from('reactions')
      .select('type')
      .eq('station_id', station.id)
      .eq('user_id', user.id)
    userReactions = (myReactions ?? []).map(r => r.type as ReactionType)

    // Server-side whitelist check using service role
    const admin = createAdminClient()
    const { data: wl } = await admin
      .from('whitelist')
      .select('id')
      .ilike('email', user.email ?? '')
      .single()
    isWhitelisted = !!wl
  }

  return (
    <>
      <Header />
      <main>
        {/* Hero image */}
        <div className="relative w-full h-[60vh] min-h-[360px] bg-forest overflow-hidden">
          {station.cover_image_url ? (
            <Image
              src={station.cover_image_url}
              alt={station.title}
              fill
              priority
              className="object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-8xl opacity-10">🍁</div>
          )}
          <div className="image-overlay absolute inset-0" />
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 max-w-5xl mx-auto">
            {station.date_start && (
              <p className="text-cream/70 text-sm font-serif mb-1">
                {new Date(station.date_start).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}
                {station.date_end && ` – ${new Date(station.date_end).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' })}`}
              </p>
            )}
            <h1 className="font-fraunces text-4xl sm:text-6xl text-cream font-light tracking-tight">
              {station.title}
            </h1>
            {station.subtitle && (
              <p className="text-cream/80 font-serif text-xl mt-2 italic">{station.subtitle}</p>
            )}
          </div>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10">
          {/* Reactions */}
          <div className="mb-8 pb-8 border-b border-cream-300">
            <ReactionBar
              stationId={station.id}
              counts={counts}
              userReactions={userReactions}
              isAuthenticated={!!user}
            />
          </div>

          {/* Description */}
          {station.description && (
            <div className="prose-kanada mb-10">
              <p>{station.description}</p>
            </div>
          )}

          {/* Posts / Reports */}
          {(posts ?? []).map((post: Post) => (
            <article key={post.id} className="mb-12">
              <h2 className="font-fraunces text-2xl sm:text-3xl text-forest mb-4">{post.title}</h2>
              {post.content && (
                <div className="prose-kanada">
                  {post.content.split('\n\n').map((para, i) => (
                    <p key={i}>{para}</p>
                  ))}
                </div>
              )}
            </article>
          ))}

          {/* Photo grid */}
          {(photos ?? []).length > 0 && (
            <section className="mb-12">
              <h2 className="font-fraunces text-2xl text-forest mb-5">Fotos</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-3">
                {(photos as Photo[]).map(photo => (
                  <div key={photo.id} className="relative aspect-square rounded-lg overflow-hidden bg-cream-200">
                    <Image
                      src={photo.url}
                      alt={photo.alt_text ?? photo.caption ?? station.title}
                      fill
                      className="object-cover hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Comments */}
          <CommentSection
            stationId={station.id}
            initialComments={comments ?? []}
            isAuthenticated={!!user}
            isWhitelisted={isWhitelisted}
          />
        </div>
      </main>
      <Footer />
    </>
  )
}
