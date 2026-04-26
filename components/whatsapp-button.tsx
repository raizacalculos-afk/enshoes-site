'use client'

import { MessageCircle } from 'lucide-react'
import { STORE_CONFIG } from '@/lib/fallback-data'

export function WhatsAppButton() {
  const message = encodeURIComponent('Olá! Vim do site EN SHOES e gostaria de mais informações.')
  
  return (
    <a
      href={`https://wa.me/${STORE_CONFIG.whatsapp}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg hover:scale-110 transition-all duration-300 flex items-center justify-center"
      aria-label="Fale conosco no WhatsApp"
    >
      <MessageCircle className="h-6 w-6" />
    </a>
  )
}
