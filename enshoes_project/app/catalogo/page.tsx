import { Suspense } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { ProductGroupCard } from '@/components/product-group-card'
import { CatalogFilters } from './catalog-filters'
import { Spinner } from '@/components/ui/spinner'
import { getProductsGrouped } from '@/lib/queries'

interface PageProps {
  searchParams: Promise<{ busca?: string }>
}

async function CatalogContent({ search }: { search?: string }) {
  const productGroups = await getProductsGrouped({ search })

  return (
    <>
      <CatalogFilters searchQuery={search} />

      {productGroups.length > 0 ? (
        <>
          <p className="text-sm text-muted-foreground mb-4">
            {productGroups.length} modelo{productGroups.length !== 1 ? 's' : ''} encontrado{productGroups.length !== 1 ? 's' : ''}
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {productGroups.map(group => (
              <ProductGroupCard key={group.group_slug} group={group} />
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-16 bg-card/50 rounded-xl border border-border">
          <p className="text-muted-foreground text-lg mb-2">
            Nenhum produto encontrado.
          </p>
          <p className="text-sm text-muted-foreground">
            Tente buscar por outro termo.
          </p>
        </div>
      )}
    </>
  )
}

export default async function CatalogoPage({ searchParams }: PageProps) {
  const params = await searchParams
  
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <CartDrawer />
      
      <main className="flex-1">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center">
              <span className="text-primary neon-text">Catálogo</span>
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Encontre o tênis perfeito para você
            </p>
          </div>
        </section>

        <section className="py-8">
          <div className="container mx-auto px-4">
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-16">
                <Spinner className="h-8 w-8 text-primary mb-4" />
                <p className="text-muted-foreground">Carregando produtos...</p>
              </div>
            }>
              <CatalogContent search={params.busca} />
            </Suspense>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
