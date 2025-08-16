'use client'

import Image from 'next/image'
import { assets } from '../assets/assets'

export default function SponsorsSection() {
  const sponsors = [
    {
      src: assets.genre_bengkulu_logo,
      alt: 'Partner 1',
      width: 120,
      height: 60
    },
    {
      src: assets.genre_bengkulu_logo,
      alt: 'Partner 2',
      width: 120,
      height: 60
    },
    {
      src: assets.genre_bengkulu_logo,
      alt: 'Partner 3',
      width: 120,
      height: 60
    },
    {
      src: assets.genre_bengkulu_logo,
      alt: 'Partner 4',
      width: 120,
      height: 60
    }
  ]

  return (
    <section className="bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 items-center justify-items-center">
          {sponsors.map((sponsor, idx) => (
            <div
              key={idx}
              className="group relative flex items-center justify-center p-4 m-4 rounded-xl hover:scale-105 transition-all duration-300 w-full h-20"
            >
              <Image
                src={sponsor.src}
                alt={sponsor.alt}
                width={sponsor.width}
                height={sponsor.height}
                className="object-contain max-w-full max-h-full opacity-70 dark:opacity-60 transition-opacity duration-300 filter grayscale group-hover:grayscale-0"
                unoptimized
              />
            </div>
          ))}
        </div>

        {/* Garis horizontal */}
        <hr className="border-gray-300 dark:border-gray-700 border-1" /> 
      </div>
    </section>
  )
}
