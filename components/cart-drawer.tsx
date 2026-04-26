'use client'

import { useState } from 'react'
import { X, Minus, Plus, ShoppingBag, Trash2, MessageCircle, CreditCard } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const WHATSAPP_NUMBER = '5511958046787'
const MERCADO_PAGO_LINK = 'https://link.mercadopago.com.br/videiraconsultoria'

export function CartDrawer() {
  const { items, isOpen, setIsOpen, removeItem, updateQuantity, subtotal, itemCount } = useCart()
  const [quickCheckout, setQuickCheckout] = useState(false)
  const [customerData, setCustomerData] = useState({ name: '', whatsapp: '', cep: '' })

  const handleWhatsAppCheckout = () => {
    const itemsList = items.map(item => 
      `- ${item.quantity}x ${item.product.name} (Tam: ${item.size}) - R$ ${(item.product.price * item.quantity).toFixed(2).replace('.', ',')}`
    ).join('\n')
    
    const message = `Olá! Gostaria de finalizar minha compra:\n\n${itemsList}\n\n*Subtotal: R$ ${subtotal.toFixed(2).replace('.', ',')}*\n\n${customerData.name ? `*Nome:* ${customerData.name}` : ''}\n${customerData.cep ? `*CEP:* ${customerData.cep}` : ''}`
    
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const handleMercadoPagoCheckout = () => {
    window.open(MERCADO_PAGO_LINK, '_blank')
  }

  if (!isOpen) return null

  return (
    <>
      <div 
        className="fixed inset-0 bg-black/60 z-50"
        onClick={() => setIsOpen(false)}
      />
      <div className="fixed right-0 top-0 h-full w-full max-w-md bg-card z-50 shadow-xl flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Carrinho ({itemCount})</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        {items.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-4 p-4">
            <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            <p className="text-muted-foreground">Seu carrinho está vazio</p>
            <Button onClick={() => setIsOpen(false)} asChild>
              <Link href="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {items.map(item => (
                <div key={item.id} className="flex gap-4 bg-secondary/50 rounded-lg p-3">
                  <div className="relative w-20 h-20 bg-muted rounded-md overflow-hidden flex-shrink-0">
                    {item.product.image_url ? (
                      <Image
                        src={item.product.image_url}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ShoppingBag className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium truncate">{item.product.name}</h3>
                    <p className="text-sm text-muted-foreground">Tamanho: {item.size}</p>
                    <p className="text-primary font-semibold">
                      R$ {item.product.price.toFixed(2).replace('.', ',')}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="w-8 text-center text-sm">{item.quantity}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 ml-auto text-destructive hover:text-destructive"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

              {/* Quick Checkout Form */}
              {quickCheckout && (
                <div className="bg-background rounded-lg p-4 space-y-3 border border-border">
                  <h3 className="font-semibold text-sm">Seus dados (opcional)</h3>
                  <div className="space-y-2">
                    <Label htmlFor="cart-name" className="text-xs">Nome</Label>
                    <Input
                      id="cart-name"
                      placeholder="Seu nome"
                      value={customerData.name}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, name: e.target.value }))}
                      className="h-9 bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-whatsapp" className="text-xs">WhatsApp</Label>
                    <Input
                      id="cart-whatsapp"
                      placeholder="(11) 99999-9999"
                      value={customerData.whatsapp}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, whatsapp: e.target.value }))}
                      className="h-9 bg-card"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cart-cep" className="text-xs">CEP</Label>
                    <Input
                      id="cart-cep"
                      placeholder="00000-000"
                      value={customerData.cep}
                      onChange={(e) => setCustomerData(prev => ({ ...prev, cep: e.target.value.replace(/\D/g, '').slice(0, 8) }))}
                      className="h-9 bg-card"
                      maxLength={8}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-border p-4 space-y-4">
              <div className="flex items-center justify-between text-lg font-semibold">
                <span>Subtotal:</span>
                <span className="text-primary">
                  R$ {subtotal.toFixed(2).replace('.', ',')}
                </span>
              </div>
              <p className="text-sm text-muted-foreground">
                Frete calculado no checkout
              </p>
              
              {!quickCheckout ? (
                <>
                  <Button 
                    className="w-full neon-glow" 
                    size="lg"
                    onClick={() => setIsOpen(false)}
                    asChild
                  >
                    <Link href="/checkout">
                      <CreditCard className="mr-2 h-5 w-5" />
                      Finalizar Compra
                    </Link>
                  </Button>
                  
                  <div className="grid grid-cols-2 gap-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-primary/50 text-primary hover:bg-primary/10"
                      onClick={() => setQuickCheckout(true)}
                    >
                      Compra Rápida
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                      onClick={handleWhatsAppCheckout}
                    >
                      <MessageCircle className="mr-1 h-4 w-4" />
                      WhatsApp
                    </Button>
                  </div>
                </>
              ) : (
                <div className="space-y-2">
                  <Button 
                    className="w-full bg-[#009ee3] hover:bg-[#008ed0]" 
                    size="lg"
                    onClick={handleMercadoPagoCheckout}
                  >
                    <CreditCard className="mr-2 h-5 w-5" />
                    Pagar com Mercado Pago
                  </Button>
                  <Button 
                    className="w-full border-green-500 text-green-500 hover:bg-green-500/10" 
                    variant="outline"
                    size="lg"
                    onClick={handleWhatsAppCheckout}
                  >
                    <MessageCircle className="mr-2 h-5 w-5" />
                    Finalizar pelo WhatsApp
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="w-full"
                    onClick={() => setQuickCheckout(false)}
                  >
                    Voltar
                  </Button>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </>
  )
}
