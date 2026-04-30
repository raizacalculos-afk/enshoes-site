'use client'

import Link from 'next/link'
import { ShoppingBag, Menu, X } from 'lucide-react'
import { useState } from 'react'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'

export function Header() {
  const [menuOpen, setMenuOpen] = useState(false)
  const { itemCount, setIsOpen } = useCart()

  return (
    <header className="sticky top-0 z-50 bg-background/95 backdrop-blur border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-2xl font-bold text-primary neon-text">EN SHOES</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-foreground/80 hover:text-primary transition-colors">
              Início
            </Link>
            <Link href="/catalogo" className="text-foreground/80 hover:text-primary transition-colors">
              Catálogo
            </Link>
            <Link href="/guia-de-medidas" className="text-foreground/80 hover:text-primary transition-colors">
              Guia de Medidas
            </Link>
            <Link href="/politicas" className="text-foreground/80 hover:text-primary transition-colors">
              Políticas
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(true)}
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                  {itemCount}
                </span>
              )}
            </Button>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {menuOpen && (
          <nav className="md:hidden py-4 border-t border-border">
            <div className="flex flex-col gap-4">
              <Link 
                href="/" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Início
              </Link>
              <Link 
                href="/catalogo" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link 
                href="/guia-de-medidas" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Guia de Medidas
              </Link>
              <Link 
                href="/politicas" 
                className="text-foreground/80 hover:text-primary transition-colors"
                onClick={() => setMenuOpen(false)}
              >
                Políticas
              </Link>
            </div>
          </nav>
        )}
      </div>
    </header>
  )
}
