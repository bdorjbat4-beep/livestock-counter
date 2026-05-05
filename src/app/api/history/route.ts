import { NextRequest, NextResponse } from 'next/server'
import { verifyToken } from '@/lib/auth-verify'
import { adminDb }     from '@/lib/firebase-admin'
import { Timestamp }   from 'firebase-admin/firestore'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  try {
    const userId = await verifyToken(req)
    const { searchParams } = new URL(req.url)
    const limitParam = parseInt(searchParams.get('limit') ?? '20', 10)

    const snap = await adminDb
      .collection('records')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limitParam)
      .get()

    const records = snap.docs.map(doc => {
      const data = doc.data()
      const ts   = data.createdAt as Timestamp | null
      return {
        id:        doc.id,
        userId:    data.userId,
        imageUrl:  data.imageUrl,
        publicId:  data.publicId,
        counts:    data.counts,
        location:  data.location ?? '',
        createdAt: ts ? ts.toDate().toISOString() : new Date().toISOString(),
      }
    })

    return NextResponse.json({ records })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Алдаа гарлаа'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const userId = await verifyToken(req)
    const { searchParams } = new URL(req.url)
    const recordId = searchParams.get('id')
    if (!recordId) return NextResponse.json({ error: 'id шаардлагатай' }, { status: 400 })

    const ref = adminDb.collection('records').doc(recordId)
    const doc = await ref.get()
    if (!doc.exists || doc.data()?.userId !== userId) {
      return NextResponse.json({ error: 'Олдсонгүй' }, { status: 404 })
    }
    await ref.delete()
    return NextResponse.json({ success: true })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Алдаа гарлаа'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
