'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSearchParams } from 'next/navigation'
import { Plus, Package, Edit, Eye, DollarSign, CheckCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { Product } from '@/lib/types'

export default function AdminProductsPage() {
  const searchParams = useSearchParams()
  const successParam = searchParams.get('success')
  
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [showToast, setShowToast] = useState(false)
  const [toastMessage, setToastMessage] = useState('')

  // Carrega produtos
  useEffect(() => {
    async function loadProducts() {
      try {
        const supabase = createClient()
        const { data } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
        
        if (data) {
          // Carrega imagens e variantes para cada produto
          const productsWithData = await Promise.all(data.map(async (product) => {
            // Busca imagem principal
            const { data: images } = await supabase
              .from('product_images')
              .select('image_url')
              .eq('product_id', product.id)
              .eq('is_main', true)
              .limit(1)
            
            // Busca estoque total
            const { data: variants } = await supabase
              .from('product_variants')
              .select('stock_quantity')
              .eq('product_id', product.id)
            
            const stock = variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) || 0
            const image_url = images?.[0]?.image_url || product.image_url

            return { ...product, image_url, stock }
          }))
          
          setProducts(productsWithData)
        }
      } catch (err) {
        console.error('[v0] Erro ao carregar produtos:', err)
      } finally {
        setLoading(false)
      }
    }
    loadProducts()
  }, [])

  // Mostra toast de sucesso baseado no parametro da URL
  useEffect(() => {
    if (successParam === 'created') {
      setToastMessage('Produto cadastrado com sucesso!')
      setShowToast(true)
      // Remove o parametro da URL sem recarregar
      window.history.replaceState({}, '', '/admin/produtos')
    } else if (successParam === 'updated') {
      setToastMessage('Produto atualizado com sucesso!')
      setShowToast(true)
      window.history.replaceState({}, '', '/admin/produtos')
    }
  }, [successParam])

  // Auto-fecha o toast apos 5 segundos
  useEffect(() => {
    if (showToast) {
      const timer = setTimeout(() => {
        setShowToast(false)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [showToast])

  // Calculate totals - garantir que products e array
  const productsList = products || []
  const totalStock = productsList.reduce((sum, p) => sum + (p.stock || 0), 0)
  const totalValue = productsList.reduce((sum, p) => sum + (p.price * (p.stock || 1)), 0)
  const totalCost = productsList.reduce((sum, p) => sum + ((p.cost || 200) * (p.stock || 1)), 0)
  const potentialProfit = totalValue - totalCost

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      {/* Toast de sucesso */}
      {showToast && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 fade-in duration-300">
          <Card className="bg-green-500/10 border-green-500/30 shadow-lg">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500 flex-shrink-0" />
              <span className="text-green-500 font-medium">{toastMessage}</span>
              <button 
                onClick={() => setShowToast(false)}
                className="ml-2 text-green-500/70 hover:text-green-500 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Produtos</h1>
          <p className="text-muted-foreground">Gerencie o catalogo EN SHOES</p>
        </div>
        <Button asChild className="neon-glow">
          <Link href="/admin/produtos/novo">
            <Plus className="h-4 w-4 mr-2" />
            Novo Produto
          </Link>
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Produtos</p>
            <p className="text-2xl font-bold">{productsList.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Estoque Total</p>
            <p className="text-2xl font-bold">{totalStock}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Valor em Estoque</p>
            <p className="text-2xl font-bold text-primary">R$ {totalValue.toFixed(0)}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Lucro Potencial</p>
            <p className="text-2xl font-bold text-green-500">R$ {potentialProfit.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {productsList.length > 0 ? (
        <div className="grid gap-4">
          {productsList.map(product => (
            <Card key={product.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <div className="relative w-20 h-20 bg-secondary rounded-lg overflow-hidden flex-shrink-0">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Package className="h-8 w-8 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="font-semibold truncate">{product.name}</h3>
                      {product.status === 'active' && (
                        <Badge className="bg-green-500/20 text-green-500 text-xs">Ativo</Badge>
                      )}
                      {product.status === 'inactive' && (
                        <Badge variant="secondary" className="text-xs">Inativo</Badge>
                      )}
                      {product.status === 'draft' && (
                        <Badge variant="outline" className="text-xs">Rascunho</Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      {product.category && <span>{product.category}</span>}
                      {product.color && <span>• {product.color}</span>}
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-primary font-bold">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-muted-foreground flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        Custo: R$ {(product.cost || 200).toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        Estoque: {product.stock || 0}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/produto/${product.slug}`} target="_blank">
                        <Eye className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/produtos/${product.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="text-center">
              <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              Nenhum produto cadastrado
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-muted-foreground mb-4">
              Comece adicionando seu primeiro produto.
            </p>
            <Button asChild>
              <Link href="/admin/produtos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Produto
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
