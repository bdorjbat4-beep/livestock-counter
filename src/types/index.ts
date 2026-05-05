export interface LivestockCount {
  uukher: number   // үхэр
  morin:  number   // морь
  khoni:  number   // хонь
  yamaa:  number   // ямаа
  temee:  number   // тэмээ
  niit:   number   // нийт
  note?:  string   // тэмдэглэл
}

export interface CountRecord {
  id:          string
  userId:      string
  imageUrl:    string
  publicId:    string
  counts:      LivestockCount
  location?:   string
  createdAt:   string   // ISO string (Firestore timestamp → string)
  confidence?: string
}

export interface User {
  uid:         string
  email:       string | null
  displayName: string | null
  photoURL:    string | null
}
