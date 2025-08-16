"use client"

import { useEffect, useState } from 'react'
import { type Kegiatan, supabase } from '@/lib/supabase'

function KegiatanCard({ item, onOpen }: { item: Kegiatan; onOpen: (item: Kegiatan) => void }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_CHARS = 150 // Karakter maksimum sebelum dipotong

  const hasSlider = images.length > 1
  const current = images[index] || null

  const prev = () => setIndex((i) => (i - 1 + images.length) % images.length)
  const next = () => setIndex((i) => (i + 1) % images.length)

  // Autoplay every 4s; pause on hover
  useEffect(() => {
    if (!hasSlider || paused) return
    const id = setInterval(() => setIndex((i) => (i + 1) % images.length), 4000)
    return () => clearInterval(id)
  }, [hasSlider, paused, images.length])

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
      {/* Slider */}
      {current ? (
        <div
          className="relative group"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <img src={current} alt={item.judul} className="h-56 w-full object-cover" />
          {hasSlider && (
            <>
              {/* Controls */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  prev()
                }}
                aria-label="Sebelumnya"
                className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition"
              >
                ‹
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  next()
                }}
                aria-label="Berikutnya"
                className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/80 dark:bg-gray-800/80 border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-200 hover:bg-white dark:hover:bg-gray-800 opacity-0 group-hover:opacity-100 transition"
              >
                ›
              </button>
              {/* Dots */}
              <div className="absolute inset-x-0 bottom-2 flex items-center justify-center gap-1.5">
                {images.map((_, i) => (
                  <button
                    key={i}
                    aria-label={`Ke gambar ${i + 1}`}
                    onClick={(e) => {
                      e.stopPropagation()
                      setIndex(i)
                    }}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? 'w-5 bg-white dark:bg-gray-200' : 'w-2 bg-white/60 dark:bg-gray-500'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      ) : null}

      <div className="p-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1">{item.judul}</h3>
        {item.tanggal && (
          <p className="text-xs text-gray-500 dark:text-gray-400">{item.tanggal}</p>
        )}
        {item.deskripsi && (
          <div className="mt-2 text-sm text-gray-700 dark:text-gray-300">
            <div 
              className="relative"
              style={{ 
                overflowWrap: 'break-word', 
                wordBreak: 'break-word',
                maxHeight: isExpanded ? 'none' : '4.5em' // ~3 lines
              }}
            >
              <p 
                className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-3 whitespace-pre-line'}
              >
                {item.deskripsi}
              </p>
            </div>
            
            {/* Tampilkan tombol hanya jika teks lebih panjang dari MAX_CHARS */}
            {item.deskripsi.length > MAX_CHARS && (
              <button 
                onClick={(e) => {
                  e.stopPropagation()
                  setIsExpanded(!isExpanded)
                }}
                className="mt-1 text-blue-500 hover:text-blue-700 text-xs font-medium"
              >
                {isExpanded ? 'Tampilkan lebih sedikit' : 'Tampilkan lebih banyak'}
              </button>
            )}
          </div>
        )}
      </div>
    </article>
  )
}

export default function KegiatanList() {
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

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
      </div>
    )
  }

  if (error) {
    return <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
  }

  if (items.length === 0) {
    return <p className="text-center text-sm text-gray-600 dark:text-gray-300">Belum ada kegiatan.</p>
  }

  return (
    <>
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {items.map((item) => (
          <KegiatanCard key={item.id} item={item} onOpen={setSelected} />
        ))}
      </div>

      {/* Modal Detail */}
      {selected && (
        <DetailModal item={selected} onClose={() => setSelected(null)} />)
      }
    </>
  )
}

function DetailModal({ item, onClose }: { item: Kegiatan; onClose: () => void }) {
  const images = [item.image_url_1, item.image_url_2, item.image_url_3].filter(Boolean) as string[]
  const [index, setIndex] = useState(0)
  const [isExpanded, setIsExpanded] = useState(false)
  const MAX_CHARS = 500 // Karakter maksimum sebelum dipotong

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
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="w-full max-w-3xl bg-white dark:bg-gray-900 rounded-xl shadow-xl overflow-hidden">
          <div className="relative p-2 md:p-3">
            {current && (
              <img src={current} alt={item.judul} className="w-full h-80 object-cover rounded-lg" />
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
          <div className="p-4">
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
                    maxHeight: isExpanded ? 'none' : '15em' // ~10 lines
                  }}
                >
                  <p 
                    className={isExpanded ? 'whitespace-pre-line' : 'line-clamp-10 whitespace-pre-line'}
                  >
                    {item.deskripsi}
                  </p>
                </div>
                
                {/* Tampilkan tombol hanya jika teks lebih panjang dari MAX_CHARS */}
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