'use client'
import { useState, useEffect, useCallback } from 'react'
import Image     from 'next/image'
import { format } from 'date-fns'
import { mn }    from 'date-fns/locale'
import { useAuth }     from '@/hooks/useAuth'
import { CountRecord } from '@/types'
import toast           from 'react-hot-toast'

const ANIMALS = [
  { key: 'uukher', label: 'Үхэр',  emoji: '🐄' },
  { key: 'morin',  label: 'Морь',  emoji: '🐎' },
  { key: 'khoni',  label: 'Хонь',  emoji: '🐑' },
  { key: 'yamaa',  label: 'Ямаа',  emoji: '🐐' },
  { key: 'temee',  label: 'Тэмээ', emoji: '🐪' },
] as const

interface Props { refresh: number }

export default function HistoryList({ refresh }: Props) {
  const { getToken }   = useAuth()
  const [records, setRecords] = useState<CountRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchHistory = useCallback(async () => {
    setLoading(true)
    try {
      const token = await getToken()
      const res   = await fetch('/api/history?limit=50', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data  = await res.json()
      if (!res.ok) throw new Error(data.error)
      setRecords(data.records)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Түүх татахад алдаа')
    } finally { setLoading(false) }
  }, [getToken])

  useEffect(() => { fetchHistory() }, [fetchHistory, refresh])

  async function handleDelete(id: string) {
    if (!confirm('Устгах уу?')) return
    try {
      const token = await getToken()
      const res   = await fetch(`/api/history?id=${id}`, {
        method:  'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error((await res.json()).error)
      setRecords(prev => prev.filter(r => r.id !== id))
      toast.success('Устгалаа')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа')
    }
  }

  if (loading) return (
    <div className="space-y-3">
      {[1,2,3].map(i => (
        <div key={i} className="h-24 rounded-2xl shimmer" />
      ))}
    </div>
  )

  if (!records.length) return (
    <div className="text-center py-16 text-stone-400">
      <div className="text-5xl mb-3">📋</div>
      <p>Тооллогын бичлэг байхгүй байна</p>
    </div>
  )

  return (
    <div className="space-y-3">
      {records.map(rec => (
        <div key={rec.id} className="card p-4 flex gap-4 hover:shadow-md transition-shadow">
          {/* Thumbnail */}
          <div className="relative w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 bg-stone-100">
            <Image src={rec.imageUrl} alt="mal" fill className="object-cover" />
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-semibold text-stone-800">
                  Нийт {rec.counts.niit} мал
                </p>
                {rec.location && (
                  <p className="text-xs text-stone-500 mt-0.5">📍 {rec.location}</p>
                )}
                <p className="text-xs text-stone-400 mt-0.5">
                  {format(new Date(rec.createdAt), 'yyyy оны M сарын d, HH:mm', { locale: mn })}
                </p>
              </div>
              <button
                onClick={() => handleDelete(rec.id)}
                className="text-stone-300 hover:text-red-400 transition-colors text-lg leading-none"
              >
                ×
              </button>
            </div>

            {/* Animal counts */}
            <div className="flex flex-wrap gap-2 mt-2">
              {ANIMALS.map(a => rec.counts[a.key] > 0 && (
                <span key={a.key} className="text-xs bg-stone-100 text-stone-600 px-2 py-0.5 rounded-full">
                  {a.emoji} {rec.counts[a.key]}
                </span>
              ))}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
