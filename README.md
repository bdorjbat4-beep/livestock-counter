# 🐄 Мал Тооллого — AI-д суурилсан систем

**Next.js 14 · Firebase Auth + Firestore · Cloudinary · Google Gemini API (үнэгүй)**

---

## Технологийн стек

| Давхарга | Технологи | Зориулалт |
|---|---|---|
| Frontend | Next.js 14 (App Router) | UI, routing |
| Auth | Firebase Authentication | Нэвтрэх, бүртгүүлэх |
| Database | Cloud Firestore | Тооллогын бичлэг |
| Storage | Cloudinary | Зургийн хадгалалт |
| AI | Google Gemini 2.0 Flash | Малын тооллого (үнэгүй) |
| Styling | Tailwind CSS | UI загвар |

---

## Суулгах заавар

### 1. Репо клон хийх
```bash
git clone <repo-url>
cd livestock-counter
npm install
```

### 2. Firebase тохиргоо
1. [console.firebase.google.com](https://console.firebase.google.com) дээр шинэ төсөл үүсгэ
2. **Authentication** → Email/Password болон Google provider идэвхжүүл
3. **Firestore Database** → Production mode-оор үүсгэ
4. `firestore.rules` файлыг Firebase Console → Firestore → Rules дээр хуулж тавь
5. `firestore.indexes.json`-ийг deploy хий:
   ```bash
   firebase deploy --only firestore:indexes
   ```
6. Project Settings → Service accounts → Generate new private key (Admin SDK JSON татах)

### 3. Cloudinary тохиргоо
1. [cloudinary.com](https://cloudinary.com) дээр бүртгэл үүсгэ (үнэгүй tier хангалттай)
2. Dashboard дээрх Cloud Name, API Key, API Secret-ийг ав

### 4. Google Gemini API key (үнэгүй)
1. [ai.google.dev](https://ai.google.dev) → "Get API key in Google AI Studio"
2. Gmail-аар нэвтэр → Create API key → копидож аваарай
3. **Картын мэдээлэл шаардлагагүй**, өдөрт 1500 хүсэлт үнэгүй

### 5. Environment variables
```bash
cp .env.local.example .env.local
```
`.env.local` файлд бүх утгуудыг бөглө.

### 6. Ажиллуулах
```bash
npm run dev
# http://localhost:3000
```

---

## Гол функцууд

- 📷 **Drag & drop зураг upload** — дрон болон гар утасны зурагтай ажилладаг
- 🤖 **Gemini 2.0 Flash шинжилгээ** — үхэр, морь, хонь, ямаа, тэмээ тоолно
- ☁️ **Cloudinary хадгалалт** — зургийг автоматаар optimize хийж хадгална
- 🔐 **Firebase Auth** — Email/Password болон Google нэвтрэлт
- 📋 **Тооллогын түүх** — Firestore-д хадгалагдсан бүх тооллогыг харах
- 📊 **Статистик** — нийт малын тоо, харьцуулалтын chart
- 📍 **Байршил бичих** — тооллого хийсэн газрыг тэмдэглэх

---

## API Endpoints

### `POST /api/analyze`
Зураг upload + Gemini шинжилгээ + Firestore хадгалах

**Headers:** `Authorization: Bearer <firebase-id-token>`  
**Body:** `multipart/form-data` { image: File, location?: string }  
**Response:** `{ id, imageUrl, counts }`

### `GET /api/history?limit=50`
Хэрэглэгчийн тооллогын түүх

**Headers:** `Authorization: Bearer <firebase-id-token>`  
**Response:** `{ records: CountRecord[] }`

### `DELETE /api/history?id=<recordId>`
Тооллого устгах

---

## Deployment (Vercel)

```bash
npm i -g vercel
vercel
```

Vercel dashboard дээр `.env.local`-ын бүх environment variable-ийг нэмж тавь.

---

## Firestore өгөгдлийн бүтэц

```
records/
  {recordId}/
    userId:    string
    imageUrl:  string       ← Cloudinary URL
    publicId:  string       ← Cloudinary public_id
    counts:
      uukher:  number
      morin:   number
      khoni:   number
      yamaa:   number
      temee:   number
      niit:    number
      note:    string
    location:  string
    createdAt: Timestamp
```
