'use client'
import { useState, useCallback } from 'react'
import { useDropzone }           from 'react-dropzone'
import Image                     from 'next/image'
import { useAuth }               from '@/hooks/useAuth'
import { CountRecord }           from '@/types'
import toast                     from 'react-hot-toast'

const ANIMALS = [
  { key: 'uukher', label: 'Үхэр',  emoji: '🐄', color: 'bg-amber-50  text-amber-700  border-amber-200'  },
  { key: 'morin',  label: 'Морь',  emoji: '🐎', color: 'bg-earth-50  text-earth-700  border-earth-200'  },
  { key: 'khoni',  label: 'Хонь',  emoji: '🐑', color: 'bg-blue-50   text-blue-700   border-blue-200'   },
  { key: 'yamaa',  label: 'Ямаа',  emoji: '🐐', color: 'bg-green-50  text-green-700  border-green-200'  },
  { key: 'temee',  label: 'Тэмээ', emoji: '🐪', color: 'bg-orange-50 text-orange-700 border-orange-200' },
] as const

interface Props { onSuccess: (r: CountRecord) => void }

export default function UploadAnalyze({ onSuccess }: Props) {
  const { getToken } = useAuth()
  const [preview,  setPreview]  = useState<string | null>(null)
  const [file,     setFile]     = useState<File | null>(null)
  const [location, setLocation] = useState('')
  const [result,   setResult]   = useState<CountRecord | null>(null)
  const [busy,     setBusy]     = useState(false)

  const onDrop = useCallback((accepted: File[]) => {
    const f = accepted[0]
    if (!f) return
    setFile(f)
    setResult(null)
    const reader = new FileReader()
    reader.onload = e => setPreview(e.target?.result as string)
    reader.readAsDataURL(f)
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    maxSize: 10 * 1024 * 1024,
    multiple: false,
  })

  async function handleAnalyze() {
    if (!file) return
    setBusy(true)
    try {
      const token   = await getToken()
      const form    = new FormData()
      form.append('image',    file)
      form.append('location', location)

      const res  = await fetch('/api/analyze', {
        method:  'POST',
        headers: { Authorization: `Bearer ${token}` },
        body:    form,
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)

      const record: CountRecord = {
        id:        data.id,
        userId:    '',
        imageUrl:  data.imageUrl,
        publicId:  '',
        counts:    data.counts,
        location,
        createdAt: new Date().toISOString(),
      }
      setResult(record)
      onSuccess(record)
      toast.success('Тооллого амжилттай!')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally { setBusy(false) }
  }

  function reset() { setFile(null); setPreview(null); setResult(null); setLocation('') }

  return (
    <div className="space-y-4">
      {!preview ? (
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all
            ${isDragActive
              ? 'border-steppe-500 bg-steppe-50 drop-active'
              : 'border-stone-300 hover:border-steppe-400 hover:bg-steppe-50/50'
            }`}
        >
          <input {...getInputProps()} />
          <div className="text-5xl mb-3">📷</div>
          <p className="text-stone-600 font-medium">Зурагаа энд чирж тавь</p>
          <p className="text-stone-400 text-sm mt-1">эсвэл дарж сонго · JPG, PNG, WEBP · 10MB хүртэл</p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Preview */}
          <div className="relative rounded-2xl overflow-hidden bg-stone-100 aspect-video">
            <Image src={preview} alt="preview" fill className="object-contain" />
            {busy && (
              <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center gap-3">
                <div className="w-10 h-10 border-3 border-white border-t-transparent rounded-full animate-spin" />
                <p className="text-white font-medium text-sm">Claude AI шинжилж байна…</p>
              </div>
            )}
          </div>

          {/* Location input */}
          <input
            type="text"
            value={location}
            onChange={e => setLocation(e.target.value)}
            placeholder="Байршил (жишээ: Архангай аймаг) — заавал биш"
            className="input"
          />

          {/* Result */}
          {result && (
            <div className="card p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-stone-800">Тооллогын дүн</h3>
                <span className="bg-steppe-100 text-steppe-700 text-xs font-medium px-3 py-1 rounded-full">
                  Нийт: {result.counts.niit} мал
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2">
                {ANIMALS.map(a => (
                  <div key={a.key} className={`border rounded-xl p-3 text-center ${a.color}`}>
                    <div className="text-2xl mb-1">{a.emoji}</div>
                    <div className="text-xl font-semibold">{result.counts[a.key]}</div>
                    <div className="text-xs opacity-70">{a.label}</div>
                  </div>
                ))}
              </div>
              {result.counts.note && (
                <p className="text-xs text-stone-500 mt-3 bg-stone-50 rounded-lg px-3 py-2">
                  💬 {result.counts.note}
                </p>
              )}
            </div>
          )}

          <div className="flex gap-2">
            <button onClick={reset}         className="btn-outline flex-1">Дахин оруулах</button>
            <button onClick={handleAnalyze} disabled={busy || !!result} className="btn-primary flex-1">
              {busy ? 'Шинжилж байна…' : result ? 'Дууссан ✓' : '🔍 Тоолох'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
