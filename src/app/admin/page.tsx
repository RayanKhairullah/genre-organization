'use client'

import { useState, useEffect } from 'react'
import { supabase, type FormControl, type Pengurus, type PikRSubmission, type StrukturJabatan, type Kegiatan, type DutaGenreCategory, type DutaGenreWinner } from '@/lib/supabase'
import { FormControlManager } from '@/components/admin/FormControlManager'
import { OrganizationManager } from '@/components/admin/OrganizationManager'
import { SubmissionsManager } from '@/components/admin/SubmissionsManager'
import { KegiatanManager } from '@/components/admin/KegiatanManager'
import { DutaGenreManager } from '@/components/admin/DutaGenreManager'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'form-control' | 'organization' | 'submissions' | 'kegiatan' | 'duta-genre'>('form-control')
  const [formControl, setFormControl] = useState<FormControl | null>(null)
  const [pengurus, setPengurus] = useState<Pengurus[]>([])
  const [strukturJabatan, setStrukturJabatan] = useState<StrukturJabatan[]>([])
  const [submissions, setSubmissions] = useState<PikRSubmission[]>([])
  const [kegiatan, setKegiatan] = useState<Kegiatan[]>([])
  const [dutaCats, setDutaCats] = useState<DutaGenreCategory[]>([])
  const [dutaWinners, setDutaWinners] = useState<DutaGenreWinner[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAllData()
  }, [])

  const fetchAllData = async () => {
    try {
      const logErr = (label: string, err: unknown) => {
        if (!err) return
        if (typeof err === 'object' && err !== null && 'message' in err) {
          const e = err as { name?: string; message?: string; code?: string; details?: string; hint?: string; stack?: string }
          console.error(`${label} error:`, {
            name: e.name,
            message: e.message,
            code: e.code,
            details: e.details,
            hint: e.hint,
            stack: e.stack,
          })
        } else {
          console.error(`${label} error:`, err)
        }
      }

      const formPromise = supabase.from('form_control').select('*').maybeSingle()
      const pengurusPromise = supabase.from('pengurus').select('*').order('periode', { ascending: false })
      const strukturPromise = supabase.from('struktur_jabatan').select('*').order('urutan')
      const submissionsPromise = supabase.from('pik_r_submissions').select('*').order('submitted_at', { ascending: false })
      const kegiatanPromise = supabase.from('kegiatan').select('*').order('created_at', { ascending: false })
      const catPromise = supabase.from('duta_genre_categories').select('*').order('order', { ascending: true })
      const winnerPromise = supabase.from('duta_genre_winners').select('*').order('created_at', { ascending: false })

      const [
        { data: formData, error: formError },
        { data: pengurusData, error: pengurusError },
        { data: strukturData, error: strukturError },
        { data: submissionsData, error: submissionsError },
        { data: kegiatanData, error: kegiatanError },
        { data: catData, error: catError },
        { data: winnerData, error: winnerError },
      ] = await Promise.all([
        formPromise,
        pengurusPromise,
        strukturPromise,
        submissionsPromise,
        kegiatanPromise,
        catPromise,
        winnerPromise,
      ])

      logErr('form_control', formError)
      logErr('pengurus', pengurusError)
      logErr('struktur_jabatan', strukturError)
      logErr('pik_r_submissions', submissionsError)
      logErr('kegiatan', kegiatanError)
      logErr('duta_genre_categories', catError)
      logErr('duta_genre_winners', winnerError)

      setFormControl(formData || null)
      setPengurus(pengurusData || [])
      setStrukturJabatan(strukturData || [])
      setSubmissions(submissionsData || [])
      setKegiatan(kegiatanData || [])
      setDutaCats(catData || [])
      setDutaWinners(winnerData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const tabs = [
    { id: 'form-control', label: 'Kontrol Formulir', icon: '⚙️' },
    { id: 'submissions', label: 'Pendataan Pik-R', icon: '📋' },
    { id: 'kegiatan', label: 'Kegiatan', icon: '🖼️' },
    { id: 'organization', label: 'Pengurus & Jabatan', icon: '👥' },
    { id: 'duta-genre', label: 'Duta GenRe', icon: '🏆' }
  ] as const

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16 bg-white dark:bg-gray-900 transition-colors">
        <div className="animate-spin rounded-full h-10 w-10 border-4 border-blue-200 dark:border-blue-900 border-t-blue-600 dark:border-t-blue-500" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Dashboard Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6">
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">📝</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Pendaftar
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {submissions.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">👥</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Pengurus
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {pengurus.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
        <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🏆</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Duta GenRe
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {dutaWinners.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">🖼️</div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Total Post Kegiatan
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {kegiatan.length}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-800 shadow-sm">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="text-2xl">
                  {formControl?.buka && formControl?.tutup ? 
                    (new Date() >= new Date(formControl.buka) && new Date() <= new Date(formControl.tutup) ? '🟢' : '🔴') 
                    : '🔴'
                  }
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 dark:text-gray-400 truncate">
                    Status Formulir
                  </dt>
                  <dd className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formControl?.buka && formControl?.tutup ? 
                      (new Date() >= new Date(formControl.buka) && new Date() <= new Date(formControl.tutup) ? 'Aktif' : 'Tutup') 
                      : 'Tutup'
                    }
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-sm">
        <div className="px-3 pt-3">
          <nav className="flex flex-wrap gap-2" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-gray-200 dark:border-gray-700'
                } inline-flex items-center gap-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-colors`}
              >
                <span>{tab.icon}</span>
                <span>{tab.label}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'form-control' && (
            <FormControlManager 
              formControl={formControl} 
              onUpdate={fetchAllData}
            />
          )}
          
          {activeTab === 'organization' && (
            <OrganizationManager 
              pengurus={pengurus}
              strukturJabatan={strukturJabatan}
              onUpdate={fetchAllData}
            />
          )}
          
          {activeTab === 'submissions' && (
            <SubmissionsManager />
          )}

          {activeTab === 'kegiatan' && (
            <KegiatanManager kegiatan={kegiatan} onUpdate={fetchAllData} />
          )}

          {activeTab === 'duta-genre' && (
            <DutaGenreManager categories={dutaCats} winners={dutaWinners} onUpdate={fetchAllData} />
          )}
        </div>
      </div>
    </div>
  )
}
