"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { type Kegiatan, supabase } from '@/lib/supabase'

function Card({ item }: { item: Kegiatan }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const cover = images[0] || null
  return (
    <article className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm">
      {cover && (
        <img src={cover} alt={item.judul} className="h-48 w-full object-cover" />
      )}
      <div className="p-4">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1 line-clamp-2">{item.judul}</h3>
        {item.tanggal && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.tanggal}</p>
        )}
        {item.deskripsi && (
          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300 line-clamp-3 whitespace-pre-line">{item.deskripsi}</p>
        )}
      </div>
    </article>
  )
}

export default function KegiatanPreview() {
  const [items, setItems] = useState<Kegiatan[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const load = async () => {
      try {
        const { data, error } = await supabase
          .from('kegiatan')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3)
        if (error) throw error
        setItems(data || [])
      } catch (e) {
        console.error(e)
        setError('Gagal memuat kegiatan')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kegiatan Terbaru</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cuplikan beberapa aktivitas terbaru GenRe/PIK-R.</p>
          </div>
          <Link
            href="http://localhost:3000/kegiatans"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            see more
          </Link>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
        ) : items.length === 0 ? (
          <p className="text-center text-sm text-gray-600 dark:text-gray-300">Belum ada kegiatan.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((it) => (
              <Card key={it.id} item={it} />
            ))}
          </div>
        )}

        {/* Absolute URL requirement note: Next Link will resolve to http://localhost:3000/kegiatans in dev */}
      </div>
    </section>
  )
}
