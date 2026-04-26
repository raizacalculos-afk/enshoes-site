'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2, Package, CheckCircle, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { createClient } from '@/lib/supabase/client'
import ImageUploader from '@/components/image-uploader'
import { ComboboxField, SimpleSelect } from '@/components/combobox-field'
import { Product, ProductImage } from '@/lib/types'

// Opcoes padrao para os campos
const DEFAULT_BRANDS = ['Nike', 'Adidas', 'New Balance', 'On Cloud', 'Asics', 'Olympikus', 'Mizuno', 'Puma']
const DEFAULT_CATEGORIES = ['Feminino', 'Masculino', 'Unissex', 'Running', 'Casual', 'Esportivo']
const DEFAULT_MARKERS = ['Varejo', 'Atacado', 'Promocao']
const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'sold_out', label: 'Esgotado' }
]
const DEFAULT_SIZES = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]

interface PageProps {
  params: Promise<{ id: string }>
}

interface SupabaseError {
  message?: string
  code?: string
  details?: string
  hint?: string
}

interface DistinctValues {
  brands: string[]
  categories: string[]
  models: string[]
  markers: string[]
  groups: { group_slug: string; group_name: string }[]
}

export default function EditProductPage({ params }: PageProps) {
  const { id } = use(params)
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [currentStep, setCurrentStep] = useState('')
  const [product, setProduct] = useState<Product | null>(null)
  const [productImages, setProductImages] = useState<ProductImage[]>([])
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [errorDetails, setErrorDetails] = useState<SupabaseError | null>(null)
  
  // Valores distintos do banco
  const [distinctValues, setDistinctValues] = useState<DistinctValues>({
    brands: [],
    categories: [],
    models: [],
    markers: [],
    groups: []
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)+/g, '')
  }

  useEffect(() => {
    async function loadData() {
      try {
        const supabase = createClient()
        
        // Busca o produto
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', id)
          .single()
        
        if (error || !data) {
          setProduct(null)
          setLoading(false)
          return
        }
        
        setProduct(data)
        
        // Busca as imagens do produto
        const { data: images } = await supabase
          .from('product_images')
          .select('*')
          .eq('product_id', id)
          .order('position', { ascending: true })
        
        if (images) {
          setProductImages(images)
        }

        // Busca as variantes para pegar os tamanhos
        const { data: variants } = await supabase
          .from('product_variants')
          .select('size')
          .eq('product_id', id)
        
        if (variants && variants.length > 0) {
          const sizes = variants.map(v => v.size).sort((a, b) => a - b)
          setProduct(prev => prev ? { ...prev, sizes } : prev)
        }
        
        // Busca valores distintos para os comboboxes
        const { data: allProducts } = await supabase
          .from('products')
          .select('brand, category, model, marker, group_slug, group_name')
        
        if (allProducts) {
          const brands = new Set<string>()
          const categories = new Set<string>()
          const models = new Set<string>()
          const markers = new Set<string>()
          const groups = new Map<string, string>()
          
          for (const p of allProducts) {
            if (p.brand) brands.add(p.brand)
            if (p.category) categories.add(p.category)
            if (p.model) models.add(p.model)
            if (p.marker) markers.add(p.marker)
            if (p.group_slug && !groups.has(p.group_slug)) {
              groups.set(p.group_slug, p.group_name || p.group_slug)
            }
          }
          
          setDistinctValues({
            brands: Array.from(brands).sort(),
            categories: Array.from(categories).sort(),
            models: Array.from(models).sort(),
            markers: Array.from(markers).sort(),
            groups: Array.from(groups.entries()).map(([group_slug, group_name]) => ({
              group_slug,
              group_name
            }))
          })
        }

      } catch {
        setProduct(null)
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [id])

  const handleSizeToggle = (size: number) => {
    if (!product) return
    const currentSizes = product.sizes || []
    const newSizes = currentSizes.includes(size)
      ? currentSizes.filter(s => s !== size)
      : [...currentSizes, size].sort((a, b) => a - b)
    setProduct({ ...product, sizes: newSizes })
  }

  const handleSave = async () => {
    if (!product) return
    
    // Validacao de virgula no momento de salvar
    const colorHasComma = (product.color || '').includes(',')
    const variantLabelHasComma = (product.variant_label || '').includes(',')
    
    if (colorHasComma || variantLabelHasComma) {
      setErrorDetails({
        message: 'Remova a virgula dos campos de cor antes de salvar.',
        code: 'MULTIPLE_COLORS',
        details: 'Cada cor deve ser cadastrada como uma variacao separada.',
        hint: 'Use o botao "Corrigir para primeira cor" ou apague manualmente a virgula.'
      })
      return
    }
    
    setSaving(true)
    setSuccess(false)
    setSuccessMessage('')
    setErrorDetails(null)

    try {
      const supabase = createClient()
      
      // Etapa 1: Atualizar produto - SOMENTE colunas existentes na tabela products
      setCurrentStep('Salvando produto...')
      
      const productUpdate = {
        name: product.name,
        slug: product.slug,
        brand: product.brand || null,
        model: product.model || null,
        category: product.category || null,
        color: product.color || null,
        description: product.description || null,
        details: product.details || null,
        price: product.price,
        cost: product.cost || 200,
        marker: product.marker || 'Varejo',
        payment_link: product.payment_link || null,
        status: product.status || 'active',
        group_slug: product.group_slug || null,
        group_name: product.group_name || null,
        variant_label: product.variant_label || null
      }

      const { error } = await supabase
        .from('products')
        .update(productUpdate)
        .eq('id', id)

      if (error) {
        throw error
      }

      // Etapa 2: Atualizar tamanhos na tabela product_variants
      if (product.sizes && product.sizes.length > 0) {
        setCurrentStep('Salvando tamanhos...')
        
        // Remove variantes antigas
        await supabase
          .from('product_variants')
          .delete()
          .eq('product_id', id)

        // Insere novas variantes
        const variantsToInsert = product.sizes.map(size => ({
          product_id: id,
          size,
          stock_quantity: 1,
          status: 'active'
        }))

        await supabase
          .from('product_variants')
          .insert(variantsToInsert)
      }

      setCurrentStep('')
      setSuccess(true)
      setSuccessMessage('Produto atualizado com sucesso!')
      
      // Aguarda 1 segundo e redireciona
      setTimeout(() => {
        router.push('/admin/produtos?success=updated')
        router.refresh()
      }, 1000)

    } catch (err) {
      const supabaseErr = err as SupabaseError
      setErrorDetails({
        message: supabaseErr.message || 'Erro desconhecido',
        code: supabaseErr.code,
        details: supabaseErr.details,
        hint: supabaseErr.hint
      })
    } finally {
      setSaving(false)
      setCurrentStep('')
    }
  }

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!product) {
    return (
      <div className="p-8 text-center">
        <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h1 className="text-xl font-semibold mb-2">Produto nao encontrado</h1>
        <Button asChild>
          <Link href="/admin/produtos">Voltar aos Produtos</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/produtos">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Editar Produto</h1>
          <p className="text-muted-foreground">{product.name}</p>
        </div>
      </div>

      {/* Mensagem de Sucesso */}
      {success && (
        <Card className="bg-green-500/10 border-green-500/30 mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
            <div>
              <p className="text-green-500 font-medium">{successMessage}</p>
              <p className="text-muted-foreground text-sm">Redirecionando...</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Mensagem de Erro Detalhada */}
      {errorDetails && (
        <Card className="bg-destructive/10 border-destructive/30 mb-6">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-0.5" />
              <div className="space-y-2 flex-1">
                <p className="text-destructive font-medium">Erro ao salvar produto</p>
                
                {errorDetails.message && (
                  <div className="bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm font-mono">
                      <span className="text-muted-foreground">message:</span> {errorDetails.message}
                    </p>
                  </div>
                )}
                
                {errorDetails.code && (
                  <div className="bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm font-mono">
                      <span className="text-muted-foreground">code:</span> {errorDetails.code}
                    </p>
                  </div>
                )}
                
                {errorDetails.details && (
                  <div className="bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm font-mono">
                      <span className="text-muted-foreground">details:</span> {errorDetails.details}
                    </p>
                  </div>
                )}
                
                {errorDetails.hint && (
                  <div className="bg-background/50 p-3 rounded border border-border">
                    <p className="text-sm font-mono">
                      <span className="text-muted-foreground">hint:</span> {errorDetails.hint}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Progresso */}
      {saving && currentStep && (
        <Card className="bg-primary/10 border-primary/30 mb-6">
          <CardContent className="p-4 flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
            <span className="text-primary">{currentStep}</span>
          </CardContent>
        </Card>
      )}

      <div className="grid lg:grid-cols-2 gap-8 max-w-5xl">
        {/* Informacoes do Grupo/Modelo */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Modelo / Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nome do Modelo</Label>
                <ComboboxField
                  value={product.group_name || ''}
                  onChange={(value) => {
                    setProduct({ 
                      ...product, 
                      group_name: value,
                      group_slug: generateSlug(value)
                    })
                  }}
                  options={distinctValues.groups.map(g => g.group_name)}
                  placeholder="Ex: New Balance 9060"
                  disabled={saving}
                />
                <p className="text-xs text-muted-foreground">
                  Nome que aparece no catalogo (sem a cor)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="group_slug">Slug do Modelo</Label>
                <Input
                  id="group_slug"
                  value={product.group_slug || ''}
                  onChange={(e) => setProduct({ ...product, group_slug: e.target.value })}
                  placeholder="new-balance-9060"
                  className="bg-background"
                  disabled={saving}
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="variant_label">Label da Variacao</Label>
                <Input
                  id="variant_label"
                  value={product.variant_label || ''}
                  onChange={(e) => setProduct({ ...product, variant_label: e.target.value })}
                  placeholder="Ex: Off Ouro"
                  className="bg-background"
                  disabled={saving}
                />
                {(product.variant_label || '').includes(',') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 space-y-2">
                    <p className="text-yellow-500 text-sm">
                      Mantenha apenas uma cor e cadastre as demais como novas variacoes.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      onClick={() => {
                        const firstColor = (product.variant_label || product.color || '').split(',')[0].trim()
                        setProduct({ ...product, variant_label: firstColor, color: firstColor })
                      }}
                    >
                      Corrigir para primeira cor
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Texto que aparece no seletor de cores (uma cor por vez)
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  value={product.color || ''}
                  onChange={(e) => setProduct({ ...product, color: e.target.value })}
                  placeholder="Ex: Preto"
                  className="bg-background"
                  disabled={saving}
                />
                {(product.color || '').includes(',') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 space-y-2">
                    <p className="text-yellow-500 text-sm">
                      Mantenha apenas uma cor e cadastre as demais como novas variacoes.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      onClick={() => {
                        const firstColor = (product.color || product.variant_label || '').split(',')[0].trim()
                        setProduct({ ...product, color: firstColor, variant_label: firstColor })
                      }}
                    >
                      Corrigir para primeira cor
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Uma cor por cadastro</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Cores deste modelo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Cada cor deve ser cadastrada como uma variação separada, usando o mesmo Slug do Modelo.
            </p>
            <Button asChild variant="outline" className="border-primary/50 hover:bg-primary/10">
              <Link href={`/admin/produtos/novo?group_slug=${encodeURIComponent(product.group_slug || product.slug)}`}>
                Adicionar nova cor para este modelo
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto</Label>
              <Input
                id="name"
                value={product.name}
                onChange={(e) => setProduct({ ...product, name: e.target.value })}
                className="bg-background"
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="slug">Slug (URL)</Label>
              <Input
                id="slug"
                value={product.slug}
                onChange={(e) => setProduct({ ...product, slug: e.target.value })}
                className="bg-background"
                disabled={saving}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <ComboboxField
                  value={product.brand || ''}
                  onChange={(value) => setProduct({ ...product, brand: value })}
                  options={distinctValues.brands}
                  defaultOptions={DEFAULT_BRANDS}
                  placeholder="Selecione ou digite..."
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <ComboboxField
                  value={product.model || ''}
                  onChange={(value) => setProduct({ ...product, model: value })}
                  options={distinctValues.models}
                  placeholder="Ex: 9060, Air Jordan High"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <ComboboxField
                value={product.category || ''}
                onChange={(value) => setProduct({ ...product, category: value })}
                options={distinctValues.categories}
                defaultOptions={DEFAULT_CATEGORIES}
                placeholder="Selecione ou digite..."
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={product.description || ''}
                onChange={(e) => setProduct({ ...product, description: e.target.value })}
                className="bg-background"
                rows={3}
                disabled={saving}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Detalhes</Label>
              <Textarea
                id="details"
                value={product.details || ''}
                onChange={(e) => setProduct({ ...product, details: e.target.value })}
                className="bg-background"
                rows={3}
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Precos e Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preco de Venda (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={product.price}
                  onChange={(e) => setProduct({ ...product, price: parseFloat(e.target.value) || 0 })}
                  className="bg-background"
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={product.cost || 200}
                  onChange={(e) => setProduct({ ...product, cost: parseFloat(e.target.value) || 200 })}
                  className="bg-background"
                  disabled={saving}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marcador</Label>
                <ComboboxField
                  value={product.marker || 'Varejo'}
                  onChange={(value) => setProduct({ ...product, marker: value })}
                  options={distinctValues.markers}
                  defaultOptions={DEFAULT_MARKERS}
                  placeholder="Selecione..."
                  disabled={saving}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <SimpleSelect
                  value={product.status || 'active'}
                  onChange={(value) => setProduct({ ...product, status: value })}
                  options={STATUS_OPTIONS}
                  disabled={saving}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_link">Link de Pagamento</Label>
              <Input
                id="payment_link"
                value={product.payment_link || ''}
                onChange={(e) => setProduct({ ...product, payment_link: e.target.value })}
                placeholder="https://mpago.la/..."
                className="bg-background"
                disabled={saving}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tamanhos */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Tamanhos Disponiveis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  disabled={saving}
                  className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                    (product.sizes || []).includes(size)
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card className="bg-card border-border lg:col-span-2">
          <CardHeader>
            <CardTitle>Imagens do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              productId={id}
              productSlug={product.slug}
              images={productImages}
              onImagesChange={setProductImages}
            />
          </CardContent>
        </Card>

        {/* Botao Salvar */}
        <div className="lg:col-span-2">
          <Button
            onClick={handleSave}
            size="lg"
            className="w-full"
            disabled={saving || success}
          >
            {saving ? (
              <>
                <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Salvar Alteracoes
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
