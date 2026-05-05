import { NextRequest, NextResponse } from 'next/server'
import { verifyToken }       from '@/lib/auth-verify'
import { uploadToCloudinary } from '@/lib/cloudinary'
import { analyzeLivestock }  from '@/lib/analyze'
import { adminDb }           from '@/lib/firebase-admin'
import { FieldValue }        from 'firebase-admin/firestore'

export const runtime = 'nodejs'
export const maxDuration = 120

export async function POST(req: NextRequest) {
  try {
    // 1. Auth шалгах
    const userId = await verifyToken(req)

    // 2. Зураг авах
    const formData = await req.formData()
    const file     = formData.get('image') as File | null
    const location = (formData.get('location') as string) ?? ''

    if (!file) {
      return NextResponse.json({ error: 'Зураг оруулаагүй байна' }, { status: 400 })
    }
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'Зургийн хэмжээ 10MB-аас бага байх ёстой' }, { status: 400 })
    }

    // 3. Cloudinary-д upload
    const buffer   = Buffer.from(await file.arrayBuffer())
    const { url, publicId } = await uploadToCloudinary(buffer, file.name, userId)

    // 4. Claude Vision-оор дүн шинжилгээ
    const counts = await analyzeLivestock(url)

    // 5. Firestore-д хадгалах
    const docRef = await adminDb.collection('records').add({
      userId,
      imageUrl:  url,
      publicId,
      counts,
      location,
      createdAt: FieldValue.serverTimestamp(),
    })

    return NextResponse.json({
      id: docRef.id,
      imageUrl: url,
      counts,
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Алдаа гарлаа'
    console.error('[/api/analyze]', err)
    // 503/ачаалал гэх мэт түр зуурын алдааг 503 status-аар буцаах
    const isOverload = /ачаалал|overload|unavailable|503|high demand/i.test(message)
    return NextResponse.json(
      { error: message },
      { status: isOverload ? 503 : 500 },
    )
  }
}
