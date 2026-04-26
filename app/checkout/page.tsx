'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ShoppingBag, Truck, CreditCard, Loader2 } from 'lucide-react'
import { useCart } from '@/contexts/cart-context'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ShippingOption } from '@/lib/types'

const MERCADO_PAGO_LINK = 'https://link.mercadopago.com.br/videiraconsultoria'

interface CustomerData {
  name: string
  whatsapp: string
  email: string
  cep: string
  address: string
  city: string
  state: string
}

export default function CheckoutPage() {
  const { items, subtotal, shipping, setShipping, total, clearCart } = useCart()
  const [customerData, setCustomerData] = useState<CustomerData>({
    name: '',
    whatsapp: '',
    email: '',
    cep: '',
    address: '',
    city: '',
    state: ''
  })
  const [loadingCep, setLoadingCep] = useState(false)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [step, setStep] = useState<'cart' | 'shipping' | 'payment'>('cart')

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCustomerData(prev => ({ ...prev, [name]: value }))
  }

  const formatWhatsApp = (value: string) => {
    const numbers = value.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
    }
    return value
  }

  const handleWhatsAppChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatWhatsApp(e.target.value)
    setCustomerData(prev => ({ ...prev, whatsapp: formatted }))
  }

  const handleCepChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const cep = e.target.value.replace(/\D/g, '')
    setCustomerData(prev => ({ ...prev, cep }))

    if (cep.length === 8) {
      setLoadingCep(true)
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
        const data = await response.json()
        if (!data.erro) {
          setCustomerData(prev => ({
            ...prev,
            address: `${data.logradouro}, ${data.bairro}`,
            city: data.localidade,
            state: data.uf
          }))
        }
      } catch {
        // Silently handle error
      } finally {
        setLoadingCep(false)
      }
    }
  }

  const calculateShipping = async () => {
    if (customerData.cep.length !== 8) return
    
    setLoadingShipping(true)
    
    // Simulated shipping calculation (in production, integrate with Correios API)
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const basePac = 25 + (subtotal * 0.05)
    const baseSedex = 45 + (subtotal * 0.08)
    
    setShippingOptions([
      {
        method: 'pac',
        name: 'PAC - Correios',
        price: Math.round(basePac * 100) / 100,
        days: '8 a 12 dias úteis'
      },
      {
        method: 'sedex',
        name: 'SEDEX - Correios',
        price: Math.round(baseSedex * 100) / 100,
        days: '3 a 5 dias úteis'
      }
    ])
    
    setLoadingShipping(false)
  }

  const handleSelectShipping = (option: ShippingOption) => {
    setShipping(option)
  }

  const handleProceedToPayment = async () => {
    // Save order to database via API
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: customerData,
          items: items.map(item => ({
            product_id: item.product.id,
            product_name: item.product.name,
            product_image: item.product.image_url,
            size: item.size,
            quantity: item.quantity,
            price: item.product.price
          })),
          shipping,
          subtotal,
          total
        })
      })

      if (response.ok) {
        // Clear cart and redirect to Mercado Pago
        clearCart()
        window.location.href = MERCADO_PAGO_LINK
      }
    } catch {
      // Even if save fails, redirect to payment
      window.location.href = MERCADO_PAGO_LINK
    }
  }

  const canProceedToShipping = customerData.name && customerData.whatsapp && customerData.cep.length === 8
  const canProceedToPayment = shipping !== null

  if (items.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <CartDrawer />
        <main className="flex-1 flex items-center justify-center">
          <div className="text-center p-8">
            <ShoppingBag className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
            <h1 className="text-2xl font-bold mb-2">Seu carrinho está vazio</h1>
            <p className="text-muted-foreground mb-6">Adicione produtos para continuar</p>
            <Button asChild>
              <Link href="/catalogo">Ver Catálogo</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      
      <main className="flex-1 py-8">
        <div className="container mx-auto px-4">
          <Link 
            href="/catalogo" 
            className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Continuar comprando
          </Link>

          <h1 className="text-3xl font-bold mb-8">Finalizar Compra</h1>

          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-4">
              <div className={`flex items-center gap-2 ${step === 'cart' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'cart' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
                <span className="hidden sm:inline">Dados</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 ${step === 'shipping' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'shipping' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
                <span className="hidden sm:inline">Frete</span>
              </div>
              <div className="w-8 h-0.5 bg-border" />
              <div className={`flex items-center gap-2 ${step === 'payment' ? 'text-primary' : 'text-muted-foreground'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${step === 'payment' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
                <span className="hidden sm:inline">Pagamento</span>
              </div>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              {step === 'cart' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <ShoppingBag className="h-5 w-5 text-primary" />
                    Seus Dados
                  </h2>
                  
                  <div className="grid gap-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Nome completo *</Label>
                        <Input
                          id="name"
                          name="name"
                          value={customerData.name}
                          onChange={handleInputChange}
                          placeholder="Seu nome"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="whatsapp">WhatsApp *</Label>
                        <Input
                          id="whatsapp"
                          name="whatsapp"
                          value={customerData.whatsapp}
                          onChange={handleWhatsAppChange}
                          placeholder="(11) 99999-9999"
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">E-mail (opcional)</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={customerData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        className="bg-background"
                      />
                    </div>

                    <div className="grid sm:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="cep">CEP *</Label>
                        <div className="relative">
                          <Input
                            id="cep"
                            name="cep"
                            value={customerData.cep}
                            onChange={handleCepChange}
                            placeholder="00000-000"
                            maxLength={8}
                            className="bg-background"
                          />
                          {loadingCep && (
                            <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                          )}
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="city">Cidade</Label>
                        <Input
                          id="city"
                          name="city"
                          value={customerData.city}
                          onChange={handleInputChange}
                          placeholder="Cidade"
                          className="bg-background"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="state">Estado</Label>
                        <Input
                          id="state"
                          name="state"
                          value={customerData.state}
                          onChange={handleInputChange}
                          placeholder="UF"
                          maxLength={2}
                          className="bg-background"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="address">Endereço completo</Label>
                      <Input
                        id="address"
                        name="address"
                        value={customerData.address}
                        onChange={handleInputChange}
                        placeholder="Rua, número, bairro, complemento"
                        className="bg-background"
                      />
                    </div>
                  </div>

                  <Button
                    className="w-full mt-6 neon-glow"
                    disabled={!canProceedToShipping}
                    onClick={() => {
                      calculateShipping()
                      setStep('shipping')
                    }}
                  >
                    Continuar para Frete
                  </Button>
                </div>
              )}

              {step === 'shipping' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <Truck className="h-5 w-5 text-primary" />
                    Escolha o Frete
                  </h2>

                  {loadingShipping ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {shippingOptions.map(option => (
                        <button
                          key={option.method}
                          onClick={() => handleSelectShipping(option)}
                          className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                            shipping?.method === option.method
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{option.name}</p>
                              <p className="text-sm text-muted-foreground">{option.days}</p>
                            </div>
                            <span className="text-lg font-semibold text-primary">
                              R$ {option.price.toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}

                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep('cart')}
                    >
                      Voltar
                    </Button>
                    <Button
                      className="flex-1 neon-glow"
                      disabled={!canProceedToPayment}
                      onClick={() => setStep('payment')}
                    >
                      Continuar para Pagamento
                    </Button>
                  </div>
                </div>
              )}

              {step === 'payment' && (
                <div className="bg-card rounded-lg border border-border p-6">
                  <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Pagamento
                  </h2>

                  <div className="bg-secondary/50 rounded-lg p-6 text-center">
                    <p className="text-muted-foreground mb-4">
                      Ao clicar em &quot;Pagar com Mercado Pago&quot;, você será redirecionado para finalizar o pagamento de forma segura.
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Aceitamos cartão de crédito, débito, PIX e boleto.
                    </p>
                  </div>

                  <div className="flex gap-4 mt-6">
                    <Button
                      variant="outline"
                      onClick={() => setStep('shipping')}
                    >
                      Voltar
                    </Button>
                    <Button
                      className="flex-1 neon-glow bg-[#009ee3] hover:bg-[#008ed0]"
                      onClick={handleProceedToPayment}
                    >
                      Pagar com Mercado Pago
                    </Button>
                  </div>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-lg font-semibold mb-4">Resumo do Pedido</h2>
                
                <div className="space-y-4 mb-4">
                  {items.map(item => (
                    <div key={item.id} className="flex gap-3">
                      <div className="relative w-16 h-16 bg-muted rounded-md overflow-hidden flex-shrink-0">
                        {item.product.image_url ? (
                          <Image
                            src={item.product.image_url}
                            alt={item.product.name}
                            fill
                            className="object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <ShoppingBag className="h-6 w-6 text-muted-foreground" />
                          </div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.product.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Tam: {item.size} | Qtd: {item.quantity}
                        </p>
                        <p className="text-sm text-primary">
                          R$ {(item.product.price * item.quantity).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="border-t border-border pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>R$ {subtotal.toFixed(2).replace('.', ',')}</span>
                  </div>
                  {shipping && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Frete ({shipping.name})</span>
                      <span>R$ {shipping.price.toFixed(2).replace('.', ',')}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-semibold pt-2 border-t border-border">
                    <span>Total</span>
                    <span className="text-primary">R$ {total.toFixed(2).replace('.', ',')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
