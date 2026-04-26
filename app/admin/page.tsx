import { createClient } from '@/lib/supabase/server'
import { Package, AlertTriangle, Edit, ExternalLink, DollarSign, Archive } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Image from 'next/image'
import Link from 'next/link'

interface ProductWithDetails {
  id: string
  name: string
  slug: string
  brand?: string
  model?: string
  category?: string
  color?: string
  description?: string
  details?: string
  price: number
  cost?: number
  marker?: string
  status?: string
  created_at: string
  image_url?: string
  sizes?: number[]
  total_stock?: number
}

interface DashboardData {
  products: ProductWithDetails[]
  totalProducts: number
  totalStock: number
  defaultCost: number
  error?: string
  adminDataUnavailable?: boolean
}

async function getDashboardData(): Promise<DashboardData> {
  try {
    const supabase = await createClient()
    
    // Busca produtos da tabela products
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('id, name, slug, brand, model, category, color, description, details, price, cost, marker, status, created_at')
      .order('created_at', { ascending: false })
    
    if (productsError) {
      return {
        products: [],
        totalProducts: 0,
        totalStock: 0,
        defaultCost: 200,
        error: `Erro ao carregar produtos: ${productsError.message}`
      }
    }

    if (!products || products.length === 0) {
      return {
        products: [],
        totalProducts: 0,
        totalStock: 0,
        defaultCost: 200
      }
    }

    // Busca imagens dos produtos
    const productIds = products.map(p => p.id)
    const { data: images } = await supabase
      .from('product_images')
      .select('product_id, image_url, position, is_main')
      .in('product_id', productIds)
      .order('position', { ascending: true })

    // Busca variantes (tamanhos e estoque)
    const { data: variants } = await supabase
      .from('product_variants')
      .select('product_id, size, stock_quantity, status')
      .in('product_id', productIds)

    // Mapeia imagens e variantes para os produtos
    const productsWithDetails: ProductWithDetails[] = products.map(product => {
      // Encontra a imagem principal
      const productImages = images?.filter(img => img.product_id === product.id) || []
      const mainImage = productImages.find(img => img.is_main) || productImages[0]
      
      // Encontra tamanhos e estoque
      const productVariants = variants?.filter(v => v.product_id === product.id) || []
      const sizes = productVariants.map(v => v.size).sort((a, b) => a - b)
      const totalStock = productVariants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0)

      return {
        ...product,
        image_url: mainImage?.image_url,
        sizes,
        total_stock: totalStock
      }
    })

    // Calcula totais
    const totalStock = productsWithDetails.reduce((sum, p) => sum + (p.total_stock || 0), 0)

    return {
      products: productsWithDetails,
      totalProducts: products.length,
      totalStock,
      defaultCost: 200
    }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return {
      products: [],
      totalProducts: 0,
      totalStock: 0,
      defaultCost: 200,
      error: `Erro ao conectar com o banco de dados: ${errorMessage}`
    }
  }
}

const WHATSAPP_NUMBER = '5511958046787'

export default async function AdminDashboard() {
  const data = await getDashboardData()

  // Se houver erro, mostra card de erro
  if (data.error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-muted-foreground">EN SHOES - Gestão da Loja</p>
        </div>

        <Card className="bg-red-950/30 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Erro ao carregar painel administrativo
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-400/80 font-mono bg-red-950/50 p-3 rounded">
              {data.error}
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Verifique a conexão com o Supabase e tente novamente.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Painel Administrativo</h1>
        <p className="text-muted-foreground">EN SHOES - Gestão da Loja</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{data.totalProducts}</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Estoque Total Estimado
            </CardTitle>
            <Archive className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStock} unidades</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Custo Padrão
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {data.defaultCost.toFixed(2).replace('.', ',')}</div>
          </CardContent>
        </Card>
      </div>

      {/* Aviso de dados administrativos */}
      <Card className="bg-yellow-950/20 border-yellow-500/30 mb-8">
        <CardContent className="py-4">
          <p className="text-yellow-500 text-sm flex items-center gap-2">
            <AlertTriangle className="h-4 w-4" />
            Dados administrativos (clientes, pedidos, carrinhos) ainda não disponíveis. Configure as permissões RLS no Supabase.
          </p>
        </CardContent>
      </Card>

      {/* Lista de Produtos */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Lista de Produtos ({data.totalProducts})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.products.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Imagem</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Cor</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Preço</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Custo</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Tamanhos</th>
                    <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {data.products.map((product) => (
                    <tr key={product.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-2">
                        <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-secondary">
                          {product.image_url ? (
                            <Image
                              src={product.image_url}
                              alt={product.name}
                              fill
                              className="object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Package className="h-5 w-5 text-muted-foreground/50" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div>
                          <p className="font-medium text-sm">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-muted-foreground">{product.brand}</p>
                          )}
                          {product.marker && (
                            <Badge variant="outline" className="text-xs mt-1">
                              {product.marker}
                            </Badge>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {product.color || '-'}
                      </td>
                      <td className="py-3 px-2 text-sm text-right font-medium text-primary">
                        R$ {product.price.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-2 text-sm text-right text-muted-foreground">
                        R$ {(product.cost || data.defaultCost).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex flex-wrap gap-1">
                          {product.sizes && product.sizes.length > 0 ? (
                            product.sizes.slice(0, 4).map(size => (
                              <span 
                                key={size} 
                                className="text-xs px-1.5 py-0.5 bg-secondary rounded text-muted-foreground"
                              >
                                {size}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-muted-foreground">-</span>
                          )}
                          {product.sizes && product.sizes.length > 4 && (
                            <span className="text-xs text-muted-foreground">
                              +{product.sizes.length - 4}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                                `[ADMIN] Produto: ${product.name} | Cor: ${product.color || 'N/A'} | Preço: R$ ${product.price.toFixed(2).replace('.', ',')}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-primary hover:text-primary/80 hover:bg-primary/10"
                            asChild
                          >
                            <Link href={`/admin/produtos/${product.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                Nenhum produto encontrado no catálogo.
              </p>
              <p className="text-sm text-muted-foreground mt-2">
                Adicione produtos no Supabase para visualizá-los aqui.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
