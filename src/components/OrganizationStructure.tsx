'use client'

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { type Pengurus } from '@/lib/supabase'
import Image from 'next/image'
import { Instagram, Search, X } from 'lucide-react'

interface OrganizationStructureProps {
  pengurus: Pengurus[]
}

export function OrganizationStructure({ pengurus }: OrganizationStructureProps) {
  const [query, setQuery] = useState('')
  const [selectedPeriode, setSelectedPeriode] = useState<string | null>(null)
  const lastActiveElement = useRef<HTMLElement | null>(null)
  const modalCloseBtnRef = useRef<HTMLButtonElement | null>(null)

  // Group pengurus by periode
  const groupedByPeriode = useMemo(() => {
    return pengurus.reduce((acc, person) => {
      if (!acc[person.periode]) acc[person.periode] = []
      acc[person.periode].push(person)
      return acc
    }, {} as Record<string, Pengurus[]>)
  }, [pengurus])

  const periodes = useMemo(() => Object.keys(groupedByPeriode).sort().reverse(), [groupedByPeriode])
  const activePeriode = selectedPeriode ?? periodes[0] ?? ''

  // Active pengurus for periode, sorted by urutan
  const activePengurus = useMemo(() => {
    const list = groupedByPeriode[activePeriode] ?? []
    return [...list].sort((a, b) => {
      const urA = a.struktur_jabatan?.urutan ?? 999
      const urB = b.struktur_jabatan?.urutan ?? 999
      return urA - urB
    })
  }, [groupedByPeriode, activePeriode])

  // Live filter by query (name, jabatan, alias)
  const filteredPengurus = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return activePengurus
    return activePengurus.filter((p) => {
      const hay = `${p.nama} ${p.struktur_jabatan?.nama_jabatan ?? ''} ${p.jabatan_pengurus ?? ''}`.toLowerCase()
      return hay.includes(q)
    })
  }, [activePengurus, query])

  // Small groups (BPI, BPH, etc.) — keep original rules
  const getGroup = (p: Pengurus) => {
    const ur = p.struktur_jabatan?.urutan ?? 999
    if (ur <= 4) return 'bpi'
    if (ur >= 5 && ur <= 6) return 'bph'
    if (ur >= 7 && ur <= 8) return 'perencanaan'
    if (ur >= 9 && ur <= 10) return 'advokasi'
    if (ur >= 11 && ur <= 12) return 'data'
    if (ur >= 13 && ur <= 14) return 'ekonomi'
    return 'lainnya'
  }

  const groups = useMemo(() => {
    return filteredPengurus.reduce((acc: Record<string, Pengurus[]>, p) => {
      const g = getGroup(p)
      if (!acc[g]) acc[g] = []
      acc[g].push(p)
      return acc
    }, {})
  }, [filteredPengurus])

  // Identify BPI Ketua (urutan 1) and others for layout
  const bpiMembers = useMemo(() => groups['bpi'] ?? [], [groups])
  const ketuaBPI = useMemo(() => bpiMembers.find(p => p.struktur_jabatan?.urutan === 1) ?? null, [bpiMembers])
  const otherBPIMembers = useMemo(() => bpiMembers.filter(p => p.id !== (ketuaBPI?.id ?? -1)), [bpiMembers, ketuaBPI])

  if (pengurus.length === 0) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-2xl shadow-lg p-8">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-gray-200 rounded-full flex items-center justify-center">
            <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <p className="text-gray-500">
            Belum ada data struktur organisasi yang tersedia.
          </p>
        </div>
      </div>
    )
  }

  const MemberCard = ({ person, isLeadership = false }: { person: Pengurus; isLeadership?: boolean }) => {
    const roleLabel = person.struktur_jabatan?.nama_jabatan ?? 'Jabatan tidak diketahui'
    const fallback = 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=800&q=60'
    const photo = person.image_url || fallback
    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`Detail ${person.nama}`}
        className={`group relative rounded-2xl overflow-hidden bg-white dark:bg-gray-800 shadow-sm hover:shadow-xl transition-all duration-300 border border-gray-100 dark:border-gray-700 h-full`}
      >
        {/* Photo area: fully visible, no overlays */}
        <div className="relative w-full h-56 sm:h-64 bg-gray-100 dark:bg-gray-900">
          <Image
            src={photo}
            alt={person.nama}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-contain object-center"
            onError={(e: any) => {
              try {
                (e.currentTarget as HTMLImageElement).src = fallback
              } catch {}
            }}
          />
        </div>

        {/* Caption area: does not cover the image */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h4 className="font-semibold text-gray-900 dark:text-white text-base leading-tight truncate">{person.nama}</h4>
              <p className={`text-xs mt-1 ${isLeadership ? 'text-yellow-700 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'} truncate`}>{roleLabel}</p>
            </div>
            {isLeadership && (
              <span className="shrink-0 inline-flex items-center gap-1 rounded-full bg-yellow-100 dark:bg-yellow-900/40 text-yellow-800 dark:text-yellow-300 px-2 py-0.5 text-[10px] font-semibold border border-yellow-300/60 dark:border-yellow-700/60">Inti</span>
            )}
          </div>

          {person.jabatan_pengurus && (
            <div className="mt-2">
              <span className="text-xs text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-700 rounded-full px-3 py-1 inline-block truncate">
                {person.jabatan_pengurus}
              </span>
            </div>
          )}

          <div className="mt-3 flex items-center justify-between text-[11px]">
            {person.asal_pikr ? (
              <div className="flex items-center text-gray-700 dark:text-gray-300">
                <svg className="w-4 h-4 mr-1.5 text-blue-500 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                </svg>
                <span className="truncate">{person.asal_pikr}</span>
              </div>
            ) : <span />}

            {person.instagram && (
              <a
                href={`https://instagram.com/${person.instagram.replace('@', '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center text-pink-600 hover:text-pink-700 dark:text-pink-400 dark:hover:text-pink-300 transition-colors"
              >
                <Instagram className="w-4 h-4 mr-1.5" />
                <span className="truncate">{person.instagram}</span>
              </a>
            )}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="from-blue-50 to-indigo-100 dark:from-gray-800 dark:to-gray-700 rounded-2xl shadow-lg dark:shadow-2xl px-4 py-6 sm:p-8 transition-colors duration-300">
      {/* Header + controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <div className="text-left sm:text-left">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Struktur Organisasi GenRe Kota Bengkulu</h2>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">Periode <span className="font-semibold text-gray-800 dark:text-gray-100">{activePeriode}</span> · <span className="text-xs text-gray-500">{filteredPengurus.length} anggota</span></p>
          <div className="w-24 h-1 bg-gradient-to-r from-blue-400 to-indigo-500 dark:from-blue-500 dark:to-indigo-600 rounded-full mt-3" />
        </div>

        <div className="flex-1 sm:flex-initial flex flex-col sm:flex-row items-stretch gap-3 w-full sm:w-auto">
          <label className="relative flex items-center bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg px-3 py-2 shadow-sm w-full sm:w-[320px]">
            <Search className="w-4 h-4 text-gray-400 mr-2" />
            <input
              aria-label="Cari nama atau jabatan"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cari nama, jabatan, atau posisi..."
              className="bg-transparent outline-none text-sm text-gray-700 dark:text-gray-200 w-full"
            />
          </label>

          <div className="mt-2 sm:mt-0 sm:ml-3">
            <label className="sr-only" htmlFor="periode-select">Pilih Periode</label>
            <select
              id="periode-select"
              value={selectedPeriode ?? periodes[0] ?? ''}
              onChange={(e) => setSelectedPeriode(e.target.value || null)}
              className="px-3 py-2 text-sm rounded-lg bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              {periodes.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* BPI */}
      {bpiMembers.length > 0 && (
        <section className="mb-10">
          <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">🏆 BPI (Badan Pengurus Inti)</h3>

          {/* Ketua at centered top */}
          {ketuaBPI && (
            <div className="mb-6 flex justify-center">
              <div className="w-full sm:w-2/3 md:w-1/2 lg:w-1/3">
                <MemberCard person={ketuaBPI} isLeadership />
              </div>
            </div>
          )}

          {/* Other BPI members below */}
          {otherBPIMembers.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherBPIMembers.map((p) => (
                <MemberCard key={p.id} person={p} isLeadership />
              ))}
            </div>
          )}
        </section>
      )}

      {/* other groups */}
      {['bph', 'perencanaan', 'advokasi', 'data', 'ekonomi', 'lainnya'].map((gKey) => (
        groups[gKey] && groups[gKey].length > 0 ? (
          <section key={gKey} className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4 text-center">
              {gKey === 'bph' && '📋 BPH (Badan Pengurus Harian)'}
              {gKey === 'perencanaan' && '🎯 Bidang Perencanaan dan Pengembangan'}
              {gKey === 'advokasi' && '🤝 Bidang Advokasi dan Kerja Sama'}
              {gKey === 'data' && '📊 Bidang Data dan Informasi'}
              {gKey === 'ekonomi' && '💡 Bidang Ekonomi Kreatif'}
              {gKey === 'lainnya' && '👥 Lainnya'}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {groups[gKey].map((p) => <MemberCard key={p.id} person={p} />)}
            </div>
          </section>
        ) : null
      ))}

      {/* other periods hint */}
      {periodes.length > 1 && (
        <div className="text-center pt-6 border-t border-white/50">
          <p className="text-sm text-gray-500">💼 Periode lainnya: {periodes.slice(1).join(', ')}</p>
        </div>
      )}
    </div>
  )
}