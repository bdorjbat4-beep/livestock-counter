'use client'
import { useState, useEffect, useCallback } from 'react'
import { useRouter }  from 'next/navigation'
import { useAuth }    from '@/hooks/useAuth'
import { CountRecord } from '@/types'
import UploadAnalyze  from '@/app/_components/UploadAnalyze'
import HistoryList    from '@/app/_components/HistoryList'
import StatsChart     from '@/app/_components/StatsChart'
import toast          from 'react-hot-toast'

type Tab = 'upload' | 'history' | 'stats'

export default function Dashboard() {
  const { user, loading, logout, getToken } = useAuth()
  const router = useRouter()
  const [tab,       setTab]       = useState<Tab>('upload')
  const [records,   setRecords]   = useState<CountRecord[]>([])
  const [refresh,   setRefresh]   = useState(0)

  useEffect(() => {
    if (!loading && !user) router.replace('/login')
  }, [user, loading, router])

  const fetchRecords = useCallback(async () => {
    if (!user) return
    try {
      const token = await getToken()
      const res   = await fetch('/api/history?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data  = await res.json()
      if (res.ok) setRecords(data.records)
    } catch { /* silent */ }
  }, [user, getToken])

  useEffect(() => { fetchRecords() }, [fetchRecords, refresh])

  function handleNewRecord(r: CountRecord) {
    setRecords(prev => [r, ...prev])
    setRefresh(n => n + 1)
    setTab('history')
  }

  async function handleLogout() {
    await logout()
    toast.success('Гарлаа')
    router.replace('/login')
  }

  if (loading || !user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-steppe-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  const TABS: { id: Tab; label: string; emoji: string }[] = [
    { id: 'upload',  label: 'Тоолох',    emoji: '📷' },
    { id: 'history', label: 'Түүх',      emoji: '📋' },
    { id: 'stats',   label: 'Статистик', emoji: '📊' },
  ]

  return (
    <div className="min-h-screen bg-stone-50">
      {/* Header */}
      <header className="bg-white border-b border-stone-100 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-steppe-600 rounded-lg flex items-center justify-center text-base">🐄</div>
            <span className="font-semibold text-stone-800">Мал Тооллого</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-stone-400 hidden sm:block truncate max-w-[160px]">
              {user.displayName ?? user.email}
            </span>
            <button onClick={handleLogout} className="text-sm text-stone-500 hover:text-stone-700 transition-colors">
              Гарах
            </button>
          </div>
        </div>
      </header>

      {/* Stats bar */}
      {records.length > 0 && (
        <div className="bg-steppe-600 text-white">
          <div className="max-w-2xl mx-auto px-4 py-2 flex gap-6 text-sm">
            <span>📊 Нийт тооллого: <strong>{records.length}</strong></span>
            <span>🐾 Нийт мал: <strong>{records.reduce((s, r) => s + r.counts.niit, 0)}</strong></span>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="bg-white border-b border-stone-100">
        <div className="max-w-2xl mx-auto px-4 flex gap-1 pt-1">
          {TABS.map(t => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`px-4 py-2.5 text-sm font-medium rounded-t-lg border-b-2 transition-all ${
                tab === t.id
                  ? 'border-steppe-600 text-steppe-700'
                  : 'border-transparent text-stone-500 hover:text-stone-700'
              }`}
            >
              <span className="mr-1.5">{t.emoji}</span>{t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      <main className="max-w-2xl mx-auto px-4 py-6">
        {tab === 'upload'  && <UploadAnalyze onSuccess={handleNewRecord} />}
        {tab === 'history' && <HistoryList refresh={refresh} />}
        {tab === 'stats'   && (
          <div className="space-y-4">
            <StatsChart records={records} />
            {!records.length && (
              <div className="text-center py-16 text-stone-400">
                <div className="text-5xl mb-3">📊</div>
                <p>Статистик харахын тулд эхлээд тооллого хий</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  )
}
