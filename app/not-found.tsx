import Link from 'next/link'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function NotFound() {
  return (
    <>
      <Header />
      <main className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-6xl mb-4">🍁</p>
          <h1 className="font-fraunces text-4xl text-forest mb-3">Seite nicht gefunden</h1>
          <p className="font-serif text-forest/50 mb-8">
            Diese Seite existiert nicht – vielleicht ist sie noch in der Wildnis unterwegs.
          </p>
          <Link href="/" className="btn-primary">Zurück zur Startseite</Link>
        </div>
      </main>
      <Footer />
    </>
  )
}
