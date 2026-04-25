import type { Metadata } from 'next'
import { Fraunces, Source_Serif_4 } from 'next/font/google'
import './globals.css'

const fraunces = Fraunces({
  subsets: ['latin'],
  variable: '--font-fraunces',
  display: 'swap',
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
})

const sourceSerif4 = Source_Serif_4({
  subsets: ['latin'],
  variable: '--font-source-serif',
  display: 'swap',
  weight: ['300', '400', '600'],
})

export const metadata: Metadata = {
  title: {
    default: 'Kanada 2026 – Simon & Franzis Abenteuer',
    template: '%s · Kanada 2026',
  },
  description: 'Ein interaktives Reisetagebuch unserer Kanada-Reise 2026 – von Vancouver bis Quebec City.',
  openGraph: {
    type: 'website',
    locale: 'de_DE',
    siteName: 'Kanada 2026',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de" className={`${fraunces.variable} ${sourceSerif4.variable}`}>
      <body>{children}</body>
    </html>
  )
}
