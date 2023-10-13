import './globals.css'
import type { Metadata } from 'next'
import { cn, constructMetadata } from '@/lib/utils'
import Providers from '@/components/Providers'
import Navbar from '@/components/Navbar'
import 'simplebar-react/dist/simplebar.min.css'
import "react-loading-skeleton/dist/skeleton.css"
import { Toaster } from '@/components/ui/toaster'

export const metadata = constructMetadata()

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <Providers>
      <body className={cn('min-h-screen antialiased grainy')}>
        <Toaster />
        <Navbar />
      {children}</body>
      </Providers>
    </html>
  )
}
