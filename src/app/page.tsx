'use client'

import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import HeaderSlider from '@/components/HeaderSlider'
import QuickLinksSection from '@/components/QuickLinksSection'
import FAQSection from '@/components/FAQSection'
import PIKRSection from '@/components/PIKRSection'
import SponsorsSection from '@/components/SponsorsSection'
import KegiatanPreview from '@/components/KegiatanPreview'

export default function Home() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'GenRe Kota Bengkulu',
    url: siteUrl,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${siteUrl}/kegiatans?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  }
  const orgLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'GenRe Kota Bengkulu',
    url: siteUrl,
    logo: `${siteUrl}/genre-bengkulu-logo.png`,
    sameAs: [
      'https://instagram.com/genre_bengkulu'
    ]
  }
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(orgLd) }} />
      <Navigation />
      
      {/* Hero Section */}
      <HeaderSlider />

      {/* Sponsors Section */}
      <SponsorsSection />

      {/* Quick Links Section */}
      <QuickLinksSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* PIK-R Section */}
      <PIKRSection />

      {/* Kegiatan Preview Section */}
      <KegiatanPreview />

      <Footer />
    </div>
  )
}
