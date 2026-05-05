'use client'
import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser,
} from 'firebase/auth'
import { auth } from '@/lib/firebase-client'

interface AuthCtx {
  user:        FirebaseUser | null
  loading:     boolean
  loginEmail:  (email: string, pw: string) => Promise<void>
  registerEmail:(email: string, pw: string) => Promise<void>
  loginGoogle: () => Promise<void>
  logout:      () => Promise<void>
  getToken:    () => Promise<string>
}

const Ctx = createContext<AuthCtx | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user,    setUser]    = useState<FirebaseUser | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      setUser(u)
      setLoading(false)
    })
    return unsub
  }, [])

  const loginEmail  = (e: string, p: string) =>
    signInWithEmailAndPassword(auth, e, p).then(() => {})
  const registerEmail = (e: string, p: string) =>
    createUserWithEmailAndPassword(auth, e, p).then(() => {})
  const loginGoogle = () =>
    signInWithPopup(auth, new GoogleAuthProvider()).then(() => {})
  const logout      = () => signOut(auth)
  const getToken    = () => user!.getIdToken()

  return (
    <Ctx.Provider value={{ user, loading, loginEmail, registerEmail, loginGoogle, logout, getToken }}>
      {children}
    </Ctx.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
