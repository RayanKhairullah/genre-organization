import { Navigation } from '@/components/Navigation'
import { Footer } from '@/components/Footer'
import KegiatanList from '@/components/KegiatanList'

export default function KegiatansPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
      <Navigation />
      <section className="py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Kegiatan</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Dokumentasi kegiatan dan aktivitas GenRe/PIK-R.</p>
          </div>
          <KegiatanList />
        </div>
      </section>
      <Footer />
    </div>
  )
}
