'use client'

import Link from 'next/link'
import React from 'react'
import Image from 'next/image'
import { assets } from '@/assets/assets'

type Size = 'sm' | 'md' | 'lg'

const sizeMap: Record<Size, string> = {
  sm: 'w-6 h-6 text-xs',
  md: 'w-8 h-8 text-sm',
  lg: 'w-10 h-10 text-base',
}

export function AdminLogo({ size = 'md', withLink = false }: { size?: Size; withLink?: boolean }) {
  const box = sizeMap[size]
  const logoEl = (
    <Link href="/admin" className="flex items-center space-x-1 group">
    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105">
      <Image
        src={assets.genre_bengkulu_logo}
        alt="Logo Genre Kota Bengkulu"
        className="opacity-90"
        priority
      />
    </div>
  </Link>
  )
  if (withLink) {
    return (
      <Link href="/admin" className="inline-flex items-center group" aria-label="Ke Dashboard Admin">
        <span className="transform transition-transform group-hover:scale-105 group-hover:shadow-xl">{logoEl}</span>
      </Link>
    )
  }
  return logoEl
}
