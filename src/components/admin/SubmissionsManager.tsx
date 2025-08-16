'use client'

import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase'
import { AdminLogo } from '@/components/admin/AdminLogo'
import { Trash2, Download, Search, AlertCircle } from 'lucide-react'

type Submission = {
  id: number
  nama: string
  ttl: string
  asal_pikr: string
  asal_kabupaten: string
  tlpn: string
  email: string
  jabatan_pikr: string
  bukti_ss: string
  submitted_at: string
}

export function SubmissionsManager() {
  const [submissions, setSubmissions] = useState<Submission[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState('')
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set())

  useEffect(() => {
    fetchSubmissions()
  }, [])

  async function fetchSubmissions() {
    setLoading(true)
    setError(null)
    const { data, error } = await supabase
      .from('pik_r_submissions')
      .select('*')
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('Error fetching submissions:', error)
      setError('Gagal memuat data pendaftar. Silakan coba lagi.')
    } else {
      setSubmissions(data || [])
    }
    setLoading(false)
  }

  const filteredSubmissions = useMemo(() => {
    return submissions.filter(
      (s) =>
        s.nama.toLowerCase().includes(filter.toLowerCase()) ||
        s.email.toLowerCase().includes(filter.toLowerCase()) ||
        s.asal_pikr.toLowerCase().includes(filter.toLowerCase())
    )
  }, [submissions, filter])

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = new Set(filteredSubmissions.map((s) => s.id))
      setSelectedIds(allIds)
    } else {
      setSelectedIds(new Set())
    }
  }

  const handleSelectOne = (id: number) => {
    const newSelectedIds = new Set(selectedIds)
    if (newSelectedIds.has(id)) {
      newSelectedIds.delete(id)
    } else {
      newSelectedIds.add(id)
    }
    setSelectedIds(newSelectedIds)
  }

  const handleDeleteSelected = async () => {
    if (selectedIds.size === 0) return
    if (!confirm(`Apakah Anda yakin ingin menghapus ${selectedIds.size} pendaftar terpilih?`)) {
      return
    }

    const idsToDelete = Array.from(selectedIds)
    const { error } = await supabase.from('pik_r_submissions').delete().in('id', idsToDelete)

    if (error) {
      console.error('Error deleting submissions:', error)
      setError('Gagal menghapus pendaftar.')
    } else {
      setSubmissions(submissions.filter((s) => !selectedIds.has(s.id)))
      setSelectedIds(new Set())
    }
  }

  const exportToCSV = () => {
    if (filteredSubmissions.length === 0) return

    const headers = [
      'ID', 'Nama Lengkap', 'Tanggal Lahir', 'Asal PIK-R', 'Asal Kabupaten',
      'No. Telepon', 'Email', 'Jabatan di PIK-R', 'URL Bukti SS', 'Waktu Pendaftaran'
    ]
    const rows = filteredSubmissions.map(s => [
      s.id,
      `"${s.nama}"`,
      `"${s.ttl}"`,
      `"${s.asal_pikr}"`,
      `"${s.asal_kabupaten}"`,
      `"${s.tlpn}"`,
      `"${s.email}"`,
      `"${s.jabatan_pikr}"`,
      `"${s.bukti_ss}"`,
      `"${new Date(s.submitted_at).toLocaleString('id-ID')}"`
    ].join(','))

    const csvContent = [headers.join(','), ...rows].join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `pendaftar_pik-r_${new Date().toISOString().split('T')[0]}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
      <div className="flex items-center gap-3 mb-4">
        <AdminLogo size="sm" />
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Manajemen Pendaftar</h2>
      </div>
      
      <div className="flex flex-col md:flex-row justify-between items-center mb-4 gap-4">
        <div className="relative w-full md:w-1/3">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Cari nama, email, atau PIK-R..."
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 dark:bg-gray-700 dark:border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={exportToCSV}
            disabled={filteredSubmissions.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Download size={18} />
            Export CSV
          </button>
          <button
            onClick={handleDeleteSelected}
            disabled={selectedIds.size === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
          >
            <Trash2 size={18} />
            Hapus ({selectedIds.size})
          </button>
        </div>
      </div>

      {loading && <p className="text-center py-4">Memuat data...</p>}
      {error && 
        <div className="flex items-center gap-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 p-4 rounded-lg">
          <AlertCircle size={20} />
          <span>{error}</span>
        </div>
      }

      {!loading && !error && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-gray-500 dark:text-gray-400">
            <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
              <tr>
                <th scope="col" className="p-4">
                  <input type="checkbox" 
                    onChange={handleSelectAll}
                    checked={selectedIds.size > 0 && selectedIds.size === filteredSubmissions.length}
                    className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                  />
                </th>
                <th scope="col" className="px-6 py-3">Nama</th>
                <th scope="col" className="px-6 py-3">Asal PIK-R</th>
                <th scope="col" className="px-6 py-3">No. Telepon</th>
                <th scope="col" className="px-6 py-3">Email</th>
                <th scope="col" className="px-6 py-3">Waktu Daftar</th>
                <th scope="col" className="px-6 py-3">Bukti</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubmissions.map((s) => (
                <tr key={s.id} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                  <td className="w-4 p-4">
                    <input type="checkbox" 
                      checked={selectedIds.has(s.id)}
                      onChange={() => handleSelectOne(s.id)}
                      className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"
                    />
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{s.nama}</td>
                  <td className="px-6 py-4">{s.asal_pikr}</td>
                  <td className="px-6 py-4">{s.tlpn}</td>
                  <td className="px-6 py-4">{s.email}</td>
                  <td className="px-6 py-4">{new Date(s.submitted_at).toLocaleDateString('id-ID')}</td>
                  <td className="px-6 py-4">
                    <a href={s.bukti_ss} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">Lihat</a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredSubmissions.length === 0 && (
            <p className="text-center py-8 text-gray-500 dark:text-gray-400">Tidak ada data pendaftar yang cocok.</p>
          )}
        </div>
      )}
    </div>
  )
}
