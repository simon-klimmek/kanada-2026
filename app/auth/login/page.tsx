import type { Metadata } from 'next'
import Header from '@/components/layout/Header'
import LoginForm from '@/components/auth/LoginForm'

export const metadata: Metadata = { title: 'Anmelden' }

export default function LoginPage() {
  return (
    <>
      <Header />
      <main className="min-h-[80vh] flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <span className="text-4xl">🍁</span>
            <h1 className="font-fraunces text-3xl text-forest mt-3 mb-1">Willkommen zurück</h1>
            <p className="font-serif text-forest/60 text-sm">
              Wir schicken dir einen Magic Link per E-Mail.
            </p>
          </div>
          <LoginForm />
        </div>
      </main>
    </>
  )
}
