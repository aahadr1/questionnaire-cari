import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Providers } from './providers'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Questionnaire CARI',
  description: 'Créez et partagez vos formulaires',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${inter.className} min-h-screen antialiased`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  )
}

