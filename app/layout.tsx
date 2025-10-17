import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Questionnaire Cari',
  description: 'Form builder & collector with Supabase',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">
        {children}
      </body>
    </html>
  )
}

