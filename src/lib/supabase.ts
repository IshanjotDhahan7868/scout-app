import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Structure = {
  id: string
  name: string
  type: 'house' | 'cabin' | 'portable' | 'shed' | 'campsite' | 'pool' | 'forest' | 'other'
  status: 'untouched' | 'in_progress' | 'ready' | 'revenue'
  notes: string | null
  priority: number
  lat: number | null
  lng: number | null
  cover_photo: string | null
  created_at: string
}

export type Room = {
  id: string
  structure_id: string
  name: string
  notes: string | null
  ai_description: string | null
  photos: string[]
  created_at: string
}

export type WorkOrder = {
  id: string
  structure_id: string
  title: string
  description: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  category: string | null
  estimated_cost: number | null
  actual_cost: number | null
  assigned_to: string | null
  due_date: string | null
  photos: string[]
  created_at: string
  updated_at: string
}

export type WishlistItem = {
  id: string
  name: string
  category: string | null
  max_price: number | null
  radius_km: number
  notes: string | null
  room_id: string | null
  active: boolean
  created_at: string
}

export type Listing = {
  id: string
  source: string
  external_id: string | null
  title: string
  description: string | null
  price: number | null
  location: string | null
  distance_km: number | null
  url: string | null
  photos: string[]
  ai_score: number | null
  ai_verdict: string | null
  ai_match_notes: string | null
  status: 'new' | 'saved' | 'dismissed' | 'purchased'
  wishlist_item_id: string | null
  scraped_at: string
}
