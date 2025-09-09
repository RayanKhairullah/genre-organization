'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowRight } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { assets } from '@/assets/assets'

interface HeroSlide {
  id: number
  title: string
  hashtag: string
  subtitle: string
  description: string
  primaryButton: {
    text: string
    href: string
  }
  secondaryButton: {
    text: string
    href: string
  }
  icon: React.ReactNode
}

const HeaderSlider: React.FC = () => {
  const heroSlides: HeroSlide[] = [
    {
      id: 1,
      hashtag: '#ForumGenReBengkulu',
      title: 'Forum GenRe Kota Bengkulu',
      subtitle: 'Generasi Berencana untuk Masa Depan',
      description: 'Program BKKBN untuk kehidupan berkeluarga bagi remaja melalui pemahaman, perencanaan, dan persiapan yang matang.',
      primaryButton: { text: 'Pengurus', href: '/pengurus' },
      secondaryButton: { text: 'Duta Genre', href: '/duta-genre' },
      icon: (
        <Image
          src={assets.genre_bengkulu_logo}
          alt="Ikon Masa Depan Cerah"
          width={350}
          height={100}
          className="w-full h-auto max-w-[280px] md:max-w-full opacity-90"
          priority
        />
      )
    },
    {
      id: 2,
      hashtag: '#PIK-R',
      title: 'PIK-R Bengkulu',
      subtitle: 'Pusat Informasi dan Konseling Remaja',
      description: 'Wadah kegiatan program GenRe yang dikelola dari, oleh, dan untuk remaja guna memberikan pelayanan informasi dan konseling.',
      primaryButton: { text: 'Form Pik-R', href: '/pik-rform' },
      secondaryButton: { text: 'Pelajari Lebih Lanjut', href: '#faq' },
      icon: (
        <Image
          src={assets.genre_bengkulu_logo}
          alt="Ikon Masa Depan Cerah"
          width={350}
          height={100}
          className="w-full h-auto max-w-[280px] md:max-w-full opacity-90"
          priority
        />
      )
    },
    {
      id: 3,
      hashtag: '#MasaDepanCerah',
      title: 'Masa Depan Cerah',
      subtitle: 'Bersama Membangun Generasi Berencana',
      description: 'Bergabunglah dengan komunitas remaja yang peduli masa depan dan siap mempersiapkan kehidupan berkeluarga yang berkualitas.',
      primaryButton: { text: 'Kegiatan', href: '/pik-rform' },
      secondaryButton: { text: 'Duta Genre', href: '/duta-genre' },
      icon: (
        <Image
          src={assets.genre_bengkulu_logo}
          alt="Ikon Masa Depan Cerah"
          width={350}
          height={100}
          className="w-full h-auto max-w-[280px] md:max-w-full opacity-90"
          priority
        />
      )
    }
  ]

  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [heroSlides.length])

  return (
    <div className="relative py-8 md:py-4 overflow-hidden">
      {/* Background image */}
      <Image
        src={assets.genrebackground}
        alt="Background"
        fill
        priority
        className="object-cover object-center dark:opacity-100 select-none pointer-events-none"
      />
      {/* Readability overlay */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-white/30 via-white/30 to-white/30 dark:from-gray-900/80 dark:via-gray-900/70 dark:to-gray-900/80" />

      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        {/* Gunakan min-h untuk memastikan ruang yang cukup untuk konten */}
        <div className="min-h-[440px] md:min-h-[600px] flex items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={heroSlides[currentSlide].id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.8, ease: 'easeInOut' }}
              className="w-full flex flex-col md:flex-row items-center justify-between px-4 md:px-8 py-6 md:py-10"
              layout // Penting untuk mencegah layout shift [[4]]
            >
              {/* Text Section */}
              <div className="z-10 w-full md:w-1/2 text-center md:text-left mb-6 md:mb-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="mb-3"
                >
                  <span className="inline-flex items-center px-3 text-sm font-medium text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-900/30 rounded-full border border-blue-100 dark:border-blue-900/50">
                    {heroSlides[currentSlide].hashtag}
                  </span>
                </motion.div>
                
                <h1 className="text-2xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-2 md:mb-3 leading-tight tracking-tight">
                  {heroSlides[currentSlide].title}
                </h1>
                <p className="text-base md:text-xl font-medium text-blue-600 dark:text-blue-400 mb-3 md:mb-4 opacity-90">
                  {heroSlides[currentSlide].subtitle}
                </p>
                <p className="text-sm md:text-lg text-gray-600 dark:text-gray-300 mb-6 md:mb-8 max-w-xl mx-auto md:mx-0 leading-relaxed">
                  {heroSlides[currentSlide].description}
                </p>

                <div className="flex flex-col sm:flex-row gap-2 md:gap-3 justify-center md:justify-start">
                  <Link
                    href={heroSlides[currentSlide].primaryButton.href}
                    className="inline-flex items-center justify-center px-4 md:px-6 py-2 md:py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-all duration-300 shadow hover:shadow-md hover:scale-[1.02] focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-950"
                  >
                    {heroSlides[currentSlide].primaryButton.text}
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Link>
                  <Link
                    href={heroSlides[currentSlide].secondaryButton.href}
                    className="inline-flex items-center justify-center px-4 md:px-6 py-2 md:py-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg font-medium transition-all duration-300 hover:shadow"
                  >
                    {heroSlides[currentSlide].secondaryButton.text}
                  </Link>
                </div>
              </div>

              {/* Icon Section - Perbaikan utama di sini */}
              <motion.div
                className="z-10 w-full md:w-1/2 flex justify-center"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                layout // Penting untuk animasi layout yang smooth [[4]]
              >
                {heroSlides[currentSlide].icon}
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}

export default HeaderSlider