import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Types for our database tables
export interface StrukturJabatan {
  id: number
  nama_jabatan: string
  urutan: number
}

export interface Pengurus {
  id: number
  nama: string
  ttl?: string
  jabatan_pengurus?: string
  asal_pikr?: string
  tlpn?: string
  email?: string
  instagram?: string
  image_url?: string
  jabatan_id: number
  periode: string
  role_type?: 'administrator' | 'member'
  struktur_jabatan?: StrukturJabatan
}

export interface PikRSubmission {
  id: number
  nama: string
  ttl?: string
  asal_pikr: string
  asal_kabupaten: string
  tlpn?: string
  email?: string
  jabatan_pikr: string
  bukti_ss?: string
  submitted_at: string
}

export interface FormControl {
  id: boolean
  buka: string | null
  tutup: string | null
}

export interface Kegiatan {
  id: number
  judul: string
  deskripsi?: string
  tanggal?: string
  image_url_1?: string
  image_url_2?: string
  image_url_3?: string
  created_at?: string
}

