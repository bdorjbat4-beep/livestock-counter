import { NextRequest } from 'next/server'
import { adminAuth } from './firebase-admin'

export async function verifyToken(req: NextRequest): Promise<string> {
  const authHeader = req.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new Error('Нэвтрээгүй байна')
  }
  const token = authHeader.slice(7)
  const decoded = await adminAuth.verifyIdToken(token)
  return decoded.uid
}
