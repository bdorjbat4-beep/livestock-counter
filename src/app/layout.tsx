import type { Metadata } from 'next'
import { Inter, JetBrains_Mono } from 'next/font/google'
import './globals.css'
import { AuthProvider } from '@/hooks/useAuth'
import { Toaster }      from 'react-hot-toast'

const inter = Inter({
  variable: '--font-geist-sans',
  subsets:  ['latin', 'cyrillic'],
})

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-geist-mono',
  subsets:  ['latin'],
})

export const metadata: Metadata = {
  title:       'Мал Тооллого',
  description: 'AI ашиглан зурагнаас мал тоолох систем',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className={`${inter.variable} ${jetbrainsMono.variable}`}>
        <AuthProvider>
          {children}
          <Toaster
            position="top-right"
            toastOptions={{
              style: { borderRadius: '12px', fontFamily: 'var(--font-geist-sans)' },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  )
}
