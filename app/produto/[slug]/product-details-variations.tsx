'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ShoppingBag, ShoppingCart, Truck, Shield, Ruler, MessageCircle, Package, Check, Palette } from 'lucide-react'
import { Product } from '@/lib/types'
import { useCart } from '@/contexts/cart-context'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'

const WHATSAPP_NUMBER = '5511958046787'

interface ProductDetailsWithVariationsProps {
  product: Product
  variations: Product[]
}

export function ProductDetailsWithVariations({ product, variations = [] }: ProductDetailsWithVariationsProps) {
  const router = useRouter()
  
  // O produto atual é a variação selecionada inicialmente
  const [selectedVariation, setSelectedVariation] = useState<Product>(product)
  const [selectedSize, setSelectedSize] = useState<number | null>(null)
  const [selectedImage, setSelectedImage] = useState(0)
  const [cep, setCep] = useState('')
  const [shippingResult, setShippingResult] = useState<{ pac: number; sedex: number; pacDays: string; sedexDays: string } | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)
  const [addedToCart, setAddedToCart] = useState(false)
  const { addItem, openCart } = useCart()
  
  const safeVariations = Array.isArray(variations) && variations.length > 0 ? variations : [product]

  // Sempre mostra a seção de cor, mesmo com uma só variação
  const hasColorVariations = safeVariations.length >= 1
  
  // Extrai as URLs das imagens da variação selecionada
  const imageUrls: string[] = useMemo(() => {
    if (selectedVariation.images && selectedVariation.images.length > 0) {
      if (typeof selectedVariation.images[0] === 'object' && 'image_url' in selectedVariation.images[0]) {
        return (selectedVariation.images as Array<{ image_url: string }>).map(img => img.image_url)
      }
      return selectedVariation.images as unknown as string[]
    }
    if (selectedVariation.image_url) {
      return [selectedVariation.image_url]
    }
    return []
  }, [selectedVariation])

  // Obtém a imagem principal de uma variação
  const getVariationMainImage = (variation: Product): string | null => {
    if (variation.image_url) return variation.image_url
    if (variation.images && variation.images.length > 0) {
      const firstImg = variation.images[0]
      if (typeof firstImg === 'object' && 'image_url' in firstImg) {
        return (firstImg as { image_url: string }).image_url
      }
      return firstImg as unknown as string
    }
    return null
  }

  // Quando muda a variação, reseta imagem e verifica se o tamanho existe na nova cor
  const handleSelectVariation = (variation: Product) => {
    // Se clicar na mesma variação, não faz nada
    if (variation.id === selectedVariation.id) return
    
    setSelectedVariation(variation)
    setSelectedImage(0)
    
    // Verifica se o tamanho selecionado existe na nova variação
    if (selectedSize && variation.sizes) {
      if (!variation.sizes.includes(selectedSize)) {
        // Limpa o tamanho se não existir na nova cor
        setSelectedSize(null)
      }
    } else if (selectedSize && !variation.sizes) {
      setSelectedSize(null)
    }
    
    // Atualiza a URL sem recarregar a página
    if (variation.slug && variation.slug !== selectedVariation.slug) {
      window.history.pushState({}, '', `/produto/${variation.slug}`)
    }
  }

  const handleAddToCart = () => {
    if (!selectedSize) return
    addItem(selectedVariation, selectedSize)
    setAddedToCart(true)
    setTimeout(() => setAddedToCart(false), 2000)
  }

  const handleBuyNow = () => {
    if (!selectedSize) return
    addItem(selectedVariation, selectedSize)
    openCart()
  }

  const handleWhatsApp = () => {
    const colorLabel = selectedVariation.variant_label || selectedVariation.color
    const modelName = selectedVariation.group_name || selectedVariation.name
    const message = `Olá! Tenho interesse no tênis *${modelName}*${colorLabel ? ` na cor *${colorLabel}*` : ''}${selectedSize ? ` tamanho *${selectedSize}*` : ''}. Preço: R$ ${selectedVariation.price.toFixed(2).replace('.', ',')}. Poderia me ajudar?`
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank')
  }

  const calculateShipping = async () => {
    if (cep.length !== 8) return
    setLoadingShipping(true)
    
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

  // Nome do modelo/grupo
  const modelName = selectedVariation.group_name || product.group_name || product.name.split(' - ')[0].split(' / ')[0].trim()
  
  // Label da cor (usa variant_label se disponível, senão color)
  const colorLabel = selectedVariation.variant_label || selectedVariation.color

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
                  alt={selectedVariation.name}
                  fill
                  className="object-cover"
                  priority
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-card to-secondary">
                  <Package className="h-32 w-32 text-muted-foreground/30" />
                </div>
              )}
            </div>
            
            {imageUrls.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {imageUrls.map((imgUrl, index) => (
                  <button
                    key={index}
                    onClick={() => setSelectedImage(index)}
                    className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 flex-shrink-0 transition-all ${
                      selectedImage === index ? 'border-primary ring-2 ring-primary/30 neon-glow' : 'border-border hover:border-primary/50'
                    }`}
                  >
                    <Image
                      src={imgUrl}
                      alt={`${selectedVariation.name} - Imagem ${index + 1}`}
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
            {/* Categoria e Nome do Modelo */}
            <div>
              {selectedVariation.category && (
                <Badge variant="outline" className="mb-3 border-primary/50 text-primary">
                  {selectedVariation.category}
                </Badge>
              )}
              <h1 className="text-3xl md:text-4xl font-bold">{modelName}</h1>
              {colorLabel && (
                <p className="text-lg text-muted-foreground mt-2">
                  Cor: <span className="text-foreground font-medium">{colorLabel}</span>
                </p>
              )}
            </div>

            {/* Seleção de Cor - Estilo similar a grandes lojas */}
            {hasColorVariations && (
              <div className="bg-card rounded-xl border border-border p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Palette className="h-5 w-5 text-primary" />
                  <label className="font-semibold text-lg">Selecione a cor:</label>
                  <span className="text-sm text-muted-foreground">
                    ({safeVariations.length} {safeVariations.length === 1 ? 'opção' : 'opções'})
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {safeVariations.map(variation => {
                    const isSelected = variation.id === selectedVariation.id
                    const variationImage = getVariationMainImage(variation)
                    const varLabel = variation.variant_label || variation.color || 'Padrão'
                    
                    return (
                      <button
                        key={variation.id}
                        onClick={() => handleSelectVariation(variation)}
                        className={`group relative rounded-xl overflow-hidden transition-all duration-200 ${
                          isSelected
                            ? 'ring-2 ring-primary ring-offset-2 ring-offset-background neon-glow scale-[1.02]'
                            : 'border border-border hover:border-primary/50 hover:scale-[1.01]'
                        }`}
                      >
                        {/* Imagem da variação */}
                        <div className="relative aspect-square bg-secondary">
                          {variationImage ? (
                            <Image
                              src={variationImage}
                              alt={varLabel}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-8 w-8 text-muted-foreground/30" />
                            </div>
                          )}
                          {/* Badge de selecionado */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 w-6 h-6 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-4 w-4 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                        {/* Info da variação */}
                        <div className={`p-3 text-left ${isSelected ? 'bg-primary/10' : 'bg-card'}`}>
                          <p className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-foreground'}`}>
                            {varLabel}
                          </p>
                          <p className={`text-sm ${isSelected ? 'text-primary/80' : 'text-muted-foreground'}`}>
                            R$ {variation.price.toFixed(2).replace('.', ',')}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Preço */}
            <div className="flex items-baseline gap-3">
              <span className="text-4xl font-bold text-primary neon-text">
                R$ {selectedVariation.price.toFixed(2).replace('.', ',')}
              </span>
              {selectedVariation.original_price && selectedVariation.original_price > selectedVariation.price && (
                <>
                  <span className="text-xl text-muted-foreground line-through">
                    R$ {selectedVariation.original_price.toFixed(2).replace('.', ',')}
                  </span>
                  <Badge className="bg-green-500/20 text-green-500 border-green-500/30">
                    {Math.round((1 - selectedVariation.price / selectedVariation.original_price) * 100)}% OFF
                  </Badge>
                </>
              )}
            </div>

            {/* Parcelamento */}
            <p className="text-sm text-muted-foreground">
              ou 12x de R$ {(selectedVariation.price / 12).toFixed(2).replace('.', ',')} sem juros
            </p>

            {/* Descrição */}
            {selectedVariation.description && (
              <p className="text-muted-foreground leading-relaxed border-l-2 border-primary/50 pl-4">
                {selectedVariation.description}
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
                {(selectedVariation.sizes || []).map(size => (
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
              {(!selectedVariation.sizes || selectedVariation.sizes.length === 0) && (
                <p className="text-sm text-amber-500 mt-3">
                  Tamanhos não disponíveis para esta cor
                </p>
              )}
              {!selectedSize && selectedVariation.sizes && selectedVariation.sizes.length > 0 && (
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
