import Link from 'next/link'
import { Instagram, MessageCircle } from 'lucide-react'
import { STORE_CONFIG } from '@/lib/fallback-data'

export function Footer() {
  return (
    <footer className="bg-card border-t border-border mt-auto">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-2xl font-bold text-primary neon-text mb-4">{STORE_CONFIG.name}</h3>
            <p className="text-muted-foreground text-sm">
              Tênis de qualidade com os melhores preços. Entrega para todo o Brasil.
            </p>
            <p className="text-muted-foreground text-sm mt-2">
              {STORE_CONFIG.domain}
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Links</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Início
                </Link>
              </li>
              <li>
                <Link href="/catalogo" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Catálogo
                </Link>
              </li>
              <li>
                <Link href="/guia-de-medidas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Guia de Medidas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Políticas</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/politicas#trocas" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Trocas e Devoluções
                </Link>
              </li>
              <li>
                <Link href="/politicas#envio" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Política de Envio
                </Link>
              </li>
              <li>
                <Link href="/politicas#privacidade" className="text-muted-foreground hover:text-primary transition-colors text-sm">
                  Privacidade
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-4 text-foreground">Contato</h4>
            <div className="flex gap-4 mb-4">
              <a 
                href={`https://wa.me/${STORE_CONFIG.whatsapp}`}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center text-green-500 hover:bg-green-500 hover:text-white transition-all"
              >
                <MessageCircle className="h-5 w-5" />
              </a>
              <a 
                href={STORE_CONFIG.instagramUrl}
                target="_blank" 
                rel="noopener noreferrer"
                className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary hover:bg-primary hover:text-primary-foreground transition-all"
              >
                <Instagram className="h-5 w-5" />
              </a>
            </div>
            <p className="text-muted-foreground text-sm">
              WhatsApp: {STORE_CONFIG.whatsappFormatted}
            </p>
            <p className="text-muted-foreground text-sm">
              Instagram: {STORE_CONFIG.instagram}
            </p>
          </div>
        </div>

        <div className="border-t border-border mt-8 pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            &copy; {new Date().getFullYear()} {STORE_CONFIG.name}. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  )
}
