"use client"

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { type Kegiatan, supabase } from '@/lib/supabase'

function Card({ item, onOpen }: { item: Kegiatan; onOpen: (item: Kegiatan) => void }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const cover = images[0] || null
  return (
    <article
      className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 overflow-hidden shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
      role="button"
      tabIndex={0}
      onClick={() => onOpen(item)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onOpen(item)
        }
      }}
    >
      {cover && (
        <img src={cover} alt={item.judul} className="w-full h-40 sm:h-48 object-cover" loading="lazy" />
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
  const [selected, setSelected] = useState<Kegiatan | null>(null)

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
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-3 sm:gap-4">
          <div className="w-full">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Kegiatan Terbaru</h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Cuplikan beberapa aktivitas terbaru GenRe/PIK-R.</p>
          </div>
          <Link
            href="/kegiatans"
            className="inline-flex items-center justify-center rounded-lg bg-blue-600 px-4 md:px-5 py-2 text-sm md:text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 w-full sm:w-auto whitespace-nowrap"
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
              <Card key={it.id} item={it} onOpen={setSelected} />
            ))}
          </div>
        )}

        {selected && (
          <DetailModal item={selected} onClose={() => setSelected(null)} />
        )}

        {/* Absolute URL requirement note: Next Link will resolve to http://localhost:3000/kegiatans in dev */}
      </div>
    </section>
  )
}

function DetailModal({ item, onClose }: { item: Kegiatan; onClose: () => void }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const [index, setIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_CHARS = 500

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') setIndex((i) => (i - 1 + images.length) % images.length)
      if (e.key === 'ArrowRight') setIndex((i) => (i + 1) % images.length)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, images.length])

  useEffect(() => {
    if (images.length <= 1) return
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 4000)
    return () => clearInterval(id)
  }, [images.length])

  const current = images[index]

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className="absolute inset-0 flex items-center justify-center p-3">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden max-h-[90vh]">
          <div className="relative p-2 md:p-3">
            {current && (
              <img src={current} alt={item.judul} className="w-full h-56 sm:h-72 md:h-80 object-cover rounded-lg" loading="lazy" />
            )}
            {images.length > 1 && (
              <>
                <button
                  onClick={() => setIndex((i) => (i - 1 + images.length) % images.length)}
                  aria-label="Sebelumnya"
                  className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                >
                  ‹
                </button>
                <button
                  onClick={() => setIndex((i) => (i + 1) % images.length)}
                  aria-label="Berikutnya"
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/90 dark:bg-gray-800/90 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800"
                >
                  ›
                </button>
                <div className="absolute inset-x-0 bottom-3 flex items-center justify-center gap-1.5">
                  {images.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setIndex(i)}
                      className={`h-1.5 rounded-full transition-all ${
                        i === index ? 'w-5 bg-white dark:bg-gray-200' : 'w-2 bg-white/60 dark:bg-gray-500'
                      }`}
                    />
                  ))}
                </div>
              </>
            )}
            <button
              onClick={onClose}
              aria-label="Tutup"
              className="absolute top-3 right-3 px-2 py-1 rounded-md bg-black/50 text-white text-sm hover:bg-black/70"
            >
              Tutup
            </button>
          </div>
          <div className="p-4 overflow-y-auto">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100">{item.judul}</h3>
            {item.tanggal && (
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{item.tanggal}</p>
            )}
            {item.deskripsi && (
              <div className="mt-3 text-sm text-gray-700 dark:text-gray-300">
                <div 
                  className="relative"
                  style={{ 
                    overflowWrap: 'break-word', 
                    wordBreak: 'break-word',
                    maxHeight: isExpanded ? 'none' : '15em'
                  }}
                >
                  <p 
                    className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-10 whitespace-pre-line'}
                  >
                    {item.deskripsi}
                  </p>
                </div>
                {item.deskripsi.length > MAX_CHARS && (
                  <button 
                    onClick={(e) => {
                      e.stopPropagation()
                      setIsExpanded(!isExpanded)
                    }}
                    className="mt-2 text-blue-500 hover:text-blue-700 text-sm font-medium"
                  >
                    {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
