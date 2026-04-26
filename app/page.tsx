import Link from 'next/link'
import { ArrowRight, Truck, CreditCard, Shield, Star, Sparkles } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductGroupCard } from '@/components/product-group-card'
import { Button } from '@/components/ui/button'
import { getFeaturedProducts } from '@/lib/queries'

export default async function HomePage() {
  const featuredProducts = await getFeaturedProducts(8)

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-gradient-to-br from-background via-card to-background py-20 md:py-32">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/20 via-transparent to-transparent" />
          <div className="absolute top-10 left-10 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative">
            <div className="max-w-3xl mx-auto text-center">
              <div className="inline-flex items-center gap-2 bg-primary/10 border border-primary/20 rounded-full px-4 py-2 mb-6">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-sm text-primary">Qualidade Premium</span>
              </div>
              <h1 className="text-5xl md:text-7xl font-bold mb-6">
                <span className="text-primary neon-text">EN SHOES</span>
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground mb-8 text-balance">
                Os melhores tênis com preços que cabem no seu bolso. Qualidade garantida em cada par.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button size="lg" className="neon-glow text-lg" asChild>
                  <Link href="/catalogo">
                    Ver Catálogo
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg border-primary/50 hover:bg-primary/10" asChild>
                  <Link href="/guia-de-medidas">
                    Guia de Medidas
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16 bg-card border-y border-border">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Truck className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Entrega Nacional</h3>
                <p className="text-sm text-muted-foreground">
                  Enviamos para todo o Brasil via PAC e SEDEX
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <CreditCard className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Pagamento Seguro</h3>
                <p className="text-sm text-muted-foreground">
                  Pague com Mercado Pago em até 12x
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Shield className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Compra Garantida</h3>
                <p className="text-sm text-muted-foreground">
                  7 dias para troca ou devolução
                </p>
              </div>
              <div className="flex flex-col items-center text-center p-6 rounded-xl bg-background/50 border border-border hover:border-primary/30 transition-colors">
                <div className="w-14 h-14 rounded-full bg-primary/20 flex items-center justify-center mb-4">
                  <Star className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Qualidade Premium</h3>
                <p className="text-sm text-muted-foreground">
                  Tênis selecionados com garantia
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Featured Products */}
        <section className="py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between mb-10">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold">
                  Produtos em Destaque
                </h2>
                <p className="text-muted-foreground mt-1">
                  Confira nossos tênis mais vendidos
                </p>
              </div>
              <Button variant="ghost" className="hidden sm:flex" asChild>
                <Link href="/catalogo">
                  Ver todos
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
            
            {featuredProducts.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {featuredProducts.map(group => (
                  <ProductGroupCard key={group.group_slug} group={group} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
                <p className="text-muted-foreground text-lg mb-4">
                  Carregando produtos...
                </p>
                <Button asChild>
                  <Link href="/catalogo">Ver Catálogo</Link>
                </Button>
              </div>
            )}
            
            <div className="mt-8 text-center sm:hidden">
              <Button asChild>
                <Link href="/catalogo">
                  Ver Catálogo Completo
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 relative overflow-hidden bg-card border-y border-border">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-primary/10 to-primary/5" />
          <div className="absolute top-0 left-1/4 w-64 h-64 bg-primary/10 rounded-full blur-3xl" />
          <div className="container mx-auto px-4 relative text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Encontre seu tênis perfeito
            </h2>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto text-balance">
              Navegue pelo nosso catálogo e escolha o modelo ideal para você. 
              Tênis de qualidade com os melhores preços do mercado!
            </p>
            <Button size="lg" className="neon-glow" asChild>
              <Link href="/catalogo">
                Explorar Catálogo
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
