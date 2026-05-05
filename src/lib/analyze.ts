import { GoogleGenerativeAI } from '@google/generative-ai'
import { LivestockCount } from '@/types'

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!)

const SYSTEM_PROMPT = `Та бол Монголын малын тооллого хийх мэргэжилтэн.
Зурагт харагдах малыг нарийн тоолж, заавал JSON форматаар хариул.
Дүрмүүд:
- Зөвхөн БҮРЭН харагдах малыг тоол
- Хагас харагдах эсвэл бүдэг малыг бүү тоол
- JSON-оос өөр ямар ч текст бичихгүй
- note талбарт тооллогын нөхцөл байдлыг товч тайлбарла`

const USER_PROMPT = `Энэ зурагт байгаа малыг тоолж дараах JSON форматаар хариул:
{
  "uukher": 0,
  "morin":  0,
  "khoni":  0,
  "yamaa":  0,
  "temee":  0,
  "niit":   0,
  "note":   "тооллогын тайлбар"
}`

// Эхлээд Flash, дараа нь Flash-Lite (илүү бага ачаалалтай) ашиглана
const MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite']
const MAX_RETRIES = 3

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function callGemini(
  modelName: string,
  base64:    string,
  mimeType:  string,
): Promise<string> {
  const model = genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: SYSTEM_PROMPT,
    generationConfig: {
      responseMimeType: 'application/json',
      maxOutputTokens: 512,
    },
  })

  const result = await model.generateContent([
    { inlineData: { data: base64, mimeType } },
    { text: USER_PROMPT },
  ])

  return result.response.text()
}

export async function analyzeLivestock(
  imageUrl: string,
): Promise<LivestockCount> {
  // Cloudinary URL-ээс зургийг татаж base64 болгох
  const imageRes  = await fetch(imageUrl)
  const arrayBuf  = await imageRes.arrayBuffer()
  const base64    = Buffer.from(arrayBuf).toString('base64')
  const mimeType  = imageRes.headers.get('content-type') ?? 'image/jpeg'

  let lastError: unknown = null

  // Загвар бүрээр оролдох
  for (const modelName of MODELS) {
    // Загвар тус бүрд хэд хэдэн удаа retry хийх
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        console.log(`[analyze] ${modelName} оролдлого ${attempt}/${MAX_RETRIES}`)
        const text = await callGemini(modelName, base64, mimeType)
        if (!text) throw new Error('Хариу хоосон')

        const parsed = JSON.parse(text) as LivestockCount

        // niit-г баталгаажуулах
        parsed.niit =
          (parsed.uukher ?? 0) +
          (parsed.morin  ?? 0) +
          (parsed.khoni  ?? 0) +
          (parsed.yamaa  ?? 0) +
          (parsed.temee  ?? 0)

        return parsed
      } catch (err: unknown) {
        lastError = err
        const message = err instanceof Error ? err.message : String(err)

        // 503/429 бол retry. Бусад алдаа бол шууд гарах
        const isRetryable = /503|429|overloaded|unavailable|high demand/i.test(message)

        if (!isRetryable) {
          console.error(`[analyze] ${modelName} fatal error:`, message)
          break // дараагийн загвар руу шилжих
        }

        // Exponential backoff: 2s → 4s → 8s
        const waitMs = Math.pow(2, attempt) * 1000
        console.warn(`[analyze] ${modelName} ачаалалтай, ${waitMs}ms хүлээж байна...`)
        await sleep(waitMs)
      }
    }
    console.warn(`[analyze] ${modelName} амжилтгүй боллоо, дараагийн загвар руу шилжье`)
  }

  // Бүх загвар, бүх retry амжилтгүй болсон
  const finalMessage = lastError instanceof Error ? lastError.message : 'Үл мэдэгдэх алдаа'
  throw new Error(
    `AI үйлчилгээ түр зуурын ачаалалтай байна. Дахин оролдоно уу. (${finalMessage})`,
  )
}
