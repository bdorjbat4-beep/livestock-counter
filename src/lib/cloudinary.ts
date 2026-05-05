import { v2 as cloudinary } from 'cloudinary'

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
})

export async function uploadToCloudinary(
  fileBuffer: Buffer,
  fileName:   string,
  userId:     string,
): Promise<{ url: string; publicId: string }> {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder:         `livestock/${userId}`,
        public_id:      `${Date.now()}_${fileName.replace(/\.[^/.]+$/, '')}`,
        resource_type:  'image',
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error || !result) return reject(error ?? new Error('Upload failed'))
        resolve({ url: result.secure_url, publicId: result.public_id })
      },
    )
    stream.end(fileBuffer)
  })
}

export async function deleteFromCloudinary(publicId: string) {
  return cloudinary.uploader.destroy(publicId)
}
