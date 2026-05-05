'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth }   from '@/hooks/useAuth'
import toast         from 'react-hot-toast'

export default function LoginPage() {
  const { user, loading, loginEmail, registerEmail, loginGoogle } = useAuth()
  const router  = useRouter()
  const [mode,  setMode]  = useState<'login' | 'register'>('login')
  const [email, setEmail] = useState('')
  const [pw,    setPw]    = useState('')
  const [busy,  setBusy]  = useState(false)

  useEffect(() => { if (!loading && user) router.replace('/dashboard') }, [user, loading, router])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setBusy(true)
    try {
      if (mode === 'login') await loginEmail(email, pw)
      else                  await registerEmail(email, pw)
      toast.success(mode === 'login' ? 'Нэвтэрлээ!' : 'Бүртгэл үүслээ!')
      router.replace('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally { setBusy(false) }
  }

  async function handleGoogle() {
    setBusy(true)
    try {
      await loginGoogle()
      toast.success('Google-оор нэвтэрлээ!')
      router.replace('/dashboard')
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : 'Алдаа гарлаа')
    } finally { setBusy(false) }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-steppe-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-steppe-50 via-stone-50 to-earth-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-steppe-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-3xl">🐄</span>
          </div>
          <h1 className="text-2xl font-semibold text-stone-800">Мал Тооллого</h1>
          <p className="text-stone-500 text-sm mt-1">AI ашиглан зурагнаас мал тоолох систем</p>
        </div>

        <div className="card p-8">
          {/* Tabs */}
          <div className="flex rounded-xl bg-stone-100 p-1 mb-6">
            {(['login', 'register'] as const).map(m => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                  mode === m
                    ? 'bg-white text-stone-800 shadow-sm'
                    : 'text-stone-500 hover:text-stone-700'
                }`}
              >
                {m === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">И-мэйл</label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="input"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-stone-700 block mb-1.5">Нууц үг</label>
              <input
                type="password" required minLength={6}
                value={pw} onChange={e => setPw(e.target.value)}
                placeholder="••••••••"
                className="input"
              />
            </div>
            <button type="submit" disabled={busy} className="btn-primary w-full">
              {busy ? 'Уншиж байна…' : mode === 'login' ? 'Нэвтрэх' : 'Бүртгүүлэх'}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-stone-200" />
            </div>
            <div className="relative flex justify-center text-xs text-stone-400 bg-white px-3">эсвэл</div>
          </div>

          <button onClick={handleGoogle} disabled={busy} className="btn-outline w-full flex items-center justify-center gap-2">
            <svg width="18" height="18" viewBox="0 0 18 18">
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            Google-оор нэвтрэх
          </button>
        </div>
      </div>
    </div>
  )
}
