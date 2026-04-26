'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState } from 'react'
import { ChevronLeft, ShoppingBag, ShoppingCart, Truck, Shield, Ruler, MessageCircle, Package, Check } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const WHATSAPP_NUMBER = '5511958046787'

interface ProductDetailsProps {
  product: Product
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [cep, setCep] = useState('')
  const [shippingResult, setShippingResult] = useState<{ pac: number; sedex: number; pacDays: string; sedexDays: string } | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem, openCart } = useCart()
  
  // Coleta as URLs das imagens do produto
  // product.images pode ser array de ProductImage ou strings
  const imageUrls: string[] = (() => {
    if (product.images && product.images.length > 0) {
      // Se for array de ProductImage (do Supabase)
      if (typeof product.images[0] === 'object' && 'image_url' in product.images[0]) {
        return (product.images as Array<{ image_url: string }>).map(img => img.image_url)
      }
      // Se já for array de strings
      return product.images as unknown as string[]
    }
    // Fallback para image_url principal
    if (product.image_url) {
      return [product.image_url]
    }
    return []
  })()

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    if (!selectedSize) return
    addItem(product, selectedSize)
    openCart()
  }

  const handleWhatsApp = () => {
    const message = `Olá! Tenho interesse no tênis *${product.name}*${product.color ? ` na cor *${product.color}*` : ''}${selectedSize ? ` tamanho *${selectedSize}*` : ''}. Preço: R$ ${product.price.toFixed(2).replace('.', ',')}. Poderia me ajudar?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const calculateShipping = async () => {
    if (cep.length !== 8) return
    setLoadingShipping(true)
    
    // Simulação de cálculo de frete
    await new Promise(resolve => setTimeout(resolve, 800))
    
    const basePac = 25 + Math.random() * 15
    const baseSedex = 45 + Math.random() * 20
    
    setShippingResult({
      pac: Math.round(basePac * 100) / 100,
      sedex: Math.round(baseSedex * 100) / 100,
      pacDays: '8 a 12 dias úteis',
      sedexDays: '3 a 5 dias úteis'
    })
    setLoadingShipping(false)
  }

  return (
    <section className="py-8">
      <div className="container mx-auto px-4">
        <Link 
          href="/catalogo" 
          className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
        >
          <ChevronLeft className="h-4 w-4 mr-1" />
          Voltar ao catálogo
        </Link>

        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12">
          {/* Imagens */}
          <div className="space-y-4">
            <div className="relative aspect-square bg-card rounded-xl overflow-hidden border border-border">
              {imageUrls.length > 0 ? (
                <Image
                  src={imageUrls[selectedImage]}
                  alt={product.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-secondary">
                  <Package className="h-32 w-32 text-muted-foreground/30" />
                </div>
              )}
              {product.featured && (
                <Badge className="absolute top-4 left-4 bg-primary neon-glow">
                  Destaque
                </Badge>
              )}
            </div>
            
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === index ? 'border-primary ring-2 ring-primary/30' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${product.name} - Imagem ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Detalhes */}
          <div className="space-y-6">
            {/* Categoria e Nome */}
            <div>
              {product.category && (
                <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
                  {product.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
              {product.color && (
                <p className="text-lg text-muted-foreground mt-2">Cor: {product.color}</p>
              )}
            </div>

            {/* Preço */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary neon-text">
                R$ {product.price.toFixed(2).replace('.', ',')}
              </span>
              {product.original_price && product.original_price > product.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {product.original_price.toFixed(2).replace('.', ',')}
                  </span>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    {Math.round((1 - product.price / product.original_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Parcelamento */}
            <p className="text-sm text-muted-foreground">
              ou 12x de R$ {(product.price / 12).toFixed(2).replace('.', ',')} sem juros
            </p>

            {/* Descrição */}
            {product.description && (
              <p className="text-muted-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                {product.description}
              </p>
            )}

            {/* Seleção de Tamanho */}
            <div className="bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <label className="font-semibold text-lg">Selecione o tamanho:</label>
                <Link 
                  href="/guia-de-medidas" 
                  className="text-sm text-primary hover:underline flex items-center gap-1"
                >
                  <Ruler className="h-4 w-4" />
                  Guia de medidas
                </Link>
              </div>
              <div className="flex flex-wrap gap-3">
                {(product.sizes || []).map(size => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`w-14 h-14 rounded-lg border-2 font-semibold text-lg transition-all ${
                      selectedSize === size
                        ? 'border-primary bg-primary text-primary-foreground neon-glow scale-105'
                        : 'border-border bg-background hover:border-primary/50 hover:scale-105'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
              {!selectedSize && (
                <p className="text-sm text-amber-500 mt-3 flex items-center gap-2">
                  <span className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                  Selecione um tamanho para continuar
                </p>
              )}
            </div>

            {/* Calcular Frete */}
            <div className="bg-card rounded-xl border border-border p-6">
              <h3 className="font-semibold mb-4 flex items-center gap-2">
                <Truck className="h-5 w-5 text-primary" />
                Calcular Frete
              </h3>
              <div className="flex gap-2">
                <Input
                  placeholder="Digite seu CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value.replace(/\D/g, '').slice(0, 8))}
                  className="bg-background"
                  maxLength={8}
                />
                <Button 
                  variant="outline" 
                  onClick={calculateShipping}
                  disabled={cep.length !== 8 || loadingShipping}
                  className="shrink-0"
                >
                  {loadingShipping ? 'Calculando...' : 'Calcular'}
                </Button>
              </div>
              
              {shippingResult && (
                <div className="mt-4 space-y-2">
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">PAC - Correios</p>
                      <p className="text-xs text-muted-foreground">{shippingResult.pacDays}</p>
                    </div>
                    <span className="font-semibold text-primary">
                      R$ {shippingResult.pac.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-3 bg-background rounded-lg">
                    <div>
                      <p className="font-medium">SEDEX - Correios</p>
                      <p className="text-xs text-muted-foreground">{shippingResult.sedexDays}</p>
                    </div>
                    <span className="font-semibold text-primary">
                      R$ {shippingResult.sedex.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Botões de Ação */}
            <div className="space-y-3">
              <Button
                size="lg"
                className="w-full neon-glow text-lg h-14"
                disabled={!selectedSize}
                onClick={handleBuyNow}
              >
                <ShoppingBag className="mr-2 h-5 w-5" />
                Comprar Agora
              </Button>
              
              <div className="grid grid-cols-2 gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="border-primary/50 hover:bg-primary/10"
                  disabled={!selectedSize}
                  onClick={handleAddToCart}
                >
                  {addedToCart ? (
                    <>
                      <Check className="mr-2 h-5 w-5 text-green-500" />
                      Adicionado!
                    </>
                  ) : (
                    <>
                      <ShoppingCart className="mr-2 h-5 w-5" />
                      Adicionar
                    </>
                  )}
                </Button>
                
                <Button
                  size="lg"
                  variant="outline"
                  className="border-green-500/50 text-green-500 hover:bg-green-500/10"
                  onClick={handleWhatsApp}
                >
                  <MessageCircle className="mr-2 h-5 w-5" />
                  WhatsApp
                </Button>
              </div>
            </div>

            {/* Benefícios */}
            <div className="grid grid-cols-2 gap-4 pt-6 border-t border-border">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Truck className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Frete Nacional</p>
                  <p className="text-xs text-muted-foreground">PAC e SEDEX</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Garantia</p>
                  <p className="text-xs text-muted-foreground">7 dias para troca</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
