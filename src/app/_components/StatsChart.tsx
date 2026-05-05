'use client'
import { useMemo } from 'react'
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from 'recharts'
import { CountRecord } from '@/types'

const COLORS = ['#c9a96e', '#72b872', '#60a5fa', '#fb923c', '#a78bfa']
const ANIMALS = [
  { key: 'uukher', label: 'Үхэр'  },
  { key: 'morin',  label: 'Морь'  },
  { key: 'khoni',  label: 'Хонь'  },
  { key: 'yamaa',  label: 'Ямаа'  },
  { key: 'temee',  label: 'Тэмээ' },
] as const

interface Props { records: CountRecord[] }

export default function StatsChart({ records }: Props) {
  const totals = useMemo(() => {
    const acc = { uukher: 0, morin: 0, khoni: 0, yamaa: 0, temee: 0 }
    records.forEach(r => {
      acc.uukher += r.counts.uukher
      acc.morin  += r.counts.morin
      acc.khoni  += r.counts.khoni
      acc.yamaa  += r.counts.yamaa
      acc.temee  += r.counts.temee
    })
    return ANIMALS.map((a, i) => ({ name: a.label, тоо: acc[a.key], color: COLORS[i] }))
  }, [records])

  const grandTotal = useMemo(() => records.reduce((s, r) => s + r.counts.niit, 0), [records])

  if (!records.length) return null

  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-stone-800">Нийт статистик</h3>
        <span className="text-sm text-stone-500">{records.length} тооллого · {grandTotal} мал</span>
      </div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={totals} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
          <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#78716c' }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 11, fill: '#a8a29e' }} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={{ fill: 'rgba(0,0,0,0.04)' }}
            contentStyle={{ borderRadius: 12, border: '1px solid #e7e5e4', fontSize: 13 }}
          />
          <Bar dataKey="тоо" radius={[6, 6, 0, 0]}>
            {totals.map((t, i) => <Cell key={i} fill={t.color} />)}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
