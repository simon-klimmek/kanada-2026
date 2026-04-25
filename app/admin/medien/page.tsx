import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Medien & Fotos' }

export default function AdminMediaPage() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="font-fraunces text-3xl text-forest">Medien & Fotos</h1>
        <p className="font-serif text-forest/50 text-sm mt-1">
          Fotos zu Stationen hochladen und verwalten.
        </p>
      </div>

      <div className="card p-10 text-center border-2 border-dashed border-cream-300 bg-cream">
        <span className="text-5xl block mb-4">📸</span>
        <h2 className="font-fraunces text-xl text-forest mb-2">Upload-Bereich</h2>
        <p className="font-serif text-sm text-forest/50 mb-5 max-w-sm mx-auto">
          Fotos per Drag & Drop hier ablegen oder auf den Button klicken.
          Bilder werden automatisch in Supabase Storage gespeichert.
        </p>
        <button className="btn-primary" disabled>
          Fotos auswählen (coming soon)
        </button>
        <p className="text-xs text-forest/30 font-serif mt-3">
          Supabase Storage Bucket "photos" muss zuerst angelegt werden.
        </p>
      </div>
    </div>
  )
}
