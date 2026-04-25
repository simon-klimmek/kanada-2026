export type ReactionType = 'like' | 'heart' | 'haha' | 'wow'

export interface Station {
  id: string
  slug: string
  title: string
  subtitle: string | null
  description: string | null
  location_name: string | null
  lat: number | null
  lng: number | null
  date_start: string | null
  date_end: string | null
  cover_image_url: string | null
  is_published: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Post {
  id: string
  station_id: string
  title: string
  content: string | null
  is_published: boolean
  published_at: string | null
  sort_order: number
  created_at: string
  updated_at: string
}

export interface Photo {
  id: string
  station_id: string
  post_id: string | null
  storage_path: string
  url: string
  caption: string | null
  alt_text: string | null
  sort_order: number
  created_at: string
}

export interface Reaction {
  id: string
  station_id: string
  user_id: string
  type: ReactionType
  created_at: string
}

export interface Comment {
  id: string
  station_id: string
  user_id: string
  content: string
  is_hidden: boolean
  created_at: string
  updated_at: string
}

export interface WhitelistEntry {
  id: string
  email: string
  note: string | null
  added_by: string | null
  created_at: string
}

export interface Booking {
  id: string
  title: string
  category: string
  station_id: string | null
  booking_date: string | null
  checkin_date: string | null
  checkout_date: string | null
  confirmation_number: string | null
  provider: string | null
  amount: number | null
  currency: string
  notes: string | null
  document_url: string | null
  created_at: string
  updated_at: string
}

export interface BudgetItem {
  id: string
  category: string
  description: string
  amount: number
  currency: string
  item_date: string | null
  is_planned: boolean
  station_id: string | null
  created_at: string
  updated_at: string
}

export interface PackingItem {
  id: string
  category: string
  item: string
  quantity: number
  is_packed: boolean
  notes: string | null
  sort_order: number
  created_at: string
}

export interface ReactionCounts {
  like: number
  heart: number
  haha: number
  wow: number
}

export const REACTION_EMOJI: Record<ReactionType, string> = {
  like: '👍',
  heart: '❤️',
  haha: '😂',
  wow: '😮',
}

export const REACTION_LABELS: Record<ReactionType, string> = {
  like: 'Gefällt mir',
  heart: 'Liebe es',
  haha: 'Haha',
  wow: 'Wow',
}
