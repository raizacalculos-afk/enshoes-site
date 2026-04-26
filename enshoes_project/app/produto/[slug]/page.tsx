import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductDetailsWithVariations } from './product-details-variations'
import { ProductGroupCard } from '@/components/product-group-card'
import { getProductBySlug, getProductsGrouped } from '@/lib/queries'

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  
  if (!result) {
    return { title: 'Produto não encontrado | EN SHOES' }
  }
  
  const { product } = result
  
  return {
    title: `${product.name} | EN SHOES`,
    description: product.description || `${product.name} por apenas R$ ${product.price.toFixed(2)}`,
    openGraph: {
      title: product.name,
      description: product.description || `${product.name} por apenas R$ ${product.price.toFixed(2)}`,
      images: product.image_url ? [product.image_url] : [],
    },
  }
}

export default async function ProductPage({ params }: PageProps) {
  const { slug } = await params
  const result = await getProductBySlug(slug)
  
  if (!result) {
    notFound()
  }
  
  const { product, variations } = result
  
  // Busca outros modelos para "você também pode gostar"
  const allGroups = await getProductsGrouped({ limit: 5 })
  const relatedGroups = allGroups
    .filter(g => g.model !== product.model && g.slug !== product.slug)
    .slice(0, 4)
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      
      <main className="flex-1">
        {/* Breadcrumb */}
        <div className="bg-card border-b border-border">
          <div className="container mx-auto px-4 py-3">
            <nav className="flex items-center gap-2 text-sm text-muted-foreground">
              <Link href="/" className="hover:text-primary transition-colors">
                Início
              </Link>
              <ChevronRight className="h-4 w-4" />
              <Link href="/catalogo" className="hover:text-primary transition-colors">
                Catálogo
              </Link>
              <ChevronRight className="h-4 w-4" />
              <span className="text-foreground truncate max-w-[200px]">
                {product.model || product.name}
              </span>
            </nav>
          </div>
        </div>
        
        <ProductDetailsWithVariations 
          product={product} 
          variations={variations} 
        />
        
        {relatedGroups.length > 0 && (
          <section className="py-12 bg-card border-t border-border">
            <div className="container mx-auto px-4">
              <h2 className="text-2xl font-bold mb-8">Você também pode gostar</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
                {relatedGroups.map(group => (
                  <ProductGroupCard key={group.model} group={group} />
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
