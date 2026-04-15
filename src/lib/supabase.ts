import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type ConfidenceLevel =
  | 'verified_on_site'
  | 'verified_by_owner'
  | 'verified_from_listing'
  | 'public_reference_inference'
  | 'unknown'

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
  structure_id: string | null
  zone_id: string | null
  title: string
  description: string | null
  priority: 'urgent' | 'high' | 'medium' | 'low'
  status: 'todo' | 'in_progress' | 'done' | 'blocked'
  category: string | null
  benefit_tag: 'sale_helpful' | 'guest_helpful' | 'both'
  confidence_level: ConfidenceLevel
  estimated_cost: number | null
  actual_cost: number | null
  assigned_to: string | null
  due_date: string | null
  photos: string[]
  created_at: string
  updated_at: string
}

export type GroundsZone = {
  id: string
  structure_id: string | null
  name: string
  type: 'arrival' | 'outdoor_experience' | 'trail' | 'parking' | 'service' | 'storage' | 'recreation' | 'pool' | 'boundary' | 'other'
  condition: 'excellent' | 'good' | 'fair' | 'rough' | 'unsafe' | 'unknown'
  status: 'inactive' | 'candidate' | 'active' | 'blocked'
  activated: boolean
  notes: string | null
  confidence_level: ConfidenceLevel
  created_at: string
}

export type Utility = {
  id: string
  structure_id: string | null
  name: string
  category: 'power' | 'water' | 'septic' | 'heat' | 'internet' | 'lighting' | 'security' | 'other'
  status: 'working' | 'partial' | 'offline' | 'unknown' | 'needs_review'
  notes: string | null
  last_checked_at: string | null
  confidence_level: ConfidenceLevel
  created_at: string
}

export type Hazard = {
  id: string
  structure_id: string | null
  zone_id: string | null
  title: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'monitoring' | 'mitigated' | 'closed'
  notes: string | null
  confidence_level: ConfidenceLevel
  created_at: string
}

export type ComplianceCheck = {
  id: string
  structure_id: string | null
  zone_id: string | null
  category: 'zoning' | 'fire_safety' | 'building' | 'septic' | 'water' | 'insurance' | 'tax' | 'burn_permit' | 'listing_accuracy' | 'other'
  title: string
  status: 'unknown' | 'not_started' | 'in_progress' | 'review_needed' | 'pass' | 'fail'
  notes: string | null
  due_date: string | null
  confidence_level: ConfidenceLevel
  created_at: string
}

export type MediaEvidence = {
  id: string
  structure_id: string | null
  zone_id: string | null
  room_id: string | null
  title: string
  type: 'listing_photo' | 'walkthrough_video' | 'site_photo' | 'document' | 'map' | 'note' | 'other'
  url: string | null
  notes: string | null
  confidence_level: ConfidenceLevel
  created_at: string
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
