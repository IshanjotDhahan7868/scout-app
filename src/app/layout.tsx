import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Nav from '@/components/Nav'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Scout',
  description: 'Property ops + deal hunter for Camp Ma-Kee-Wa',
  manifest: '/manifest.json',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Scout' },
}

export const viewport: Viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen`} style={{ background: '#1C1410', color: '#F0E8D8' }}>
        <div className="max-w-lg mx-auto pb-24">
          {children}
        </div>
        <Nav />
      </body>
    </html>
  )
}
