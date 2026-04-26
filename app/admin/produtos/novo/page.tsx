'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, Save, Loader2, AlertTriangle, Plus, CheckCircle, Info } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import ImageUploader from '@/components/image-uploader'
import { ComboboxField, SimpleSelect } from '@/components/combobox-field'
import { ProductImage } from '@/lib/types'

const DEFAULT_SIZES = [34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44]

// Opcoes padrao para os campos
const DEFAULT_BRANDS = ['Nike', 'Adidas', 'New Balance', 'On Cloud', 'Asics', 'Olympikus', 'Mizuno', 'Puma']
const DEFAULT_CATEGORIES = ['Feminino', 'Masculino', 'Unissex', 'Running', 'Casual', 'Esportivo']
const DEFAULT_MARKERS = ['Varejo', 'Atacado', 'Promocao']
const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativo' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'sold_out', label: 'Esgotado' }
]

interface ErrorDetails {
  step: string
  message: string
  code?: string
  details?: string
  hint?: string
}

interface ExistingGroup {
  group_slug: string
  group_name: string
}

interface DistinctValues {
  brands: string[]
  categories: string[]
  models: string[]
  markers: string[]
}

// Funcao para limpar texto e gerar slug
function cleanSlug(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '')
}

function hasComma(value?: string | null): boolean {
  return typeof value === 'string' && value.includes(',')
}

function buildVariationSlug(groupSlug: string, variantLabel: string, fallbackSlug: string): string {
  const cleanGroup = cleanSlug(groupSlug || '')
  const cleanVariant = cleanSlug(variantLabel || '')
  if (cleanGroup && cleanVariant) return `${cleanGroup}-${cleanVariant}`
  return cleanSlug(fallbackSlug || cleanGroup || cleanVariant)
}

export default function NewProductPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [loadingData, setLoadingData] = useState(true)
  const [currentStep, setCurrentStep] = useState('')
  const [errorDetails, setErrorDetails] = useState<ErrorDetails | null>(null)
  const [success, setSuccess] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [imageWarning, setImageWarning] = useState('')
  const [pendingImages, setPendingImages] = useState<ProductImage[]>([])
  const [existingGroups, setExistingGroups] = useState<ExistingGroup[]>([])
  const [groupMode, setGroupMode] = useState<'new' | 'existing'>('new')
  const [selectedGroupSlug, setSelectedGroupSlug] = useState('')
  
  // Valores distintos do banco
  const [distinctValues, setDistinctValues] = useState<DistinctValues>({
    brands: [],
    categories: [],
    models: [],
    markers: []
  })
  
  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    brand: '',
    model: '',
    category: '',
    color: '',
    variant_label: '',
    group_slug: '',
    group_name: '',
    description: '',
    details: '',
    price: '200.00',
    cost: '200.00',
    marker: 'Varejo',
    payment_link: '',
    status: 'active',
    sizes: DEFAULT_SIZES,
    stock_per_size: '1'
  })

  // Carrega grupos existentes e valores distintos
  useEffect(() => {
    async function loadData() {
      setLoadingData(true)
      try {
        const supabase = createClient()
        
        // Busca todos os produtos para extrair valores distintos
        const { data: products, error } = await supabase
          .from('products')
          .select('group_slug, group_name, slug, brand, category, model, marker')
          .order('group_name', { ascending: true })
        
        if (error) {
          console.error('[v0] Erro ao carregar dados:', error)
          setExistingGroups([])
          return
        }

        const productsData = products || []
        
        // Extrai grupos unicos
        const uniqueGroups = new Map<string, string>()
        const brands = new Set<string>()
        const categories = new Set<string>()
        const models = new Set<string>()
        const markers = new Set<string>()
        
        for (const p of productsData) {
          // Grupos
          const groupSlug = p.group_slug || p.slug
          const groupName = p.group_name || groupSlug
          if (groupSlug && !uniqueGroups.has(groupSlug)) {
            uniqueGroups.set(groupSlug, groupName)
          }
          
          // Valores distintos
          if (p.brand) brands.add(p.brand)
          if (p.category) categories.add(p.category)
          if (p.model) models.add(p.model)
          if (p.marker) markers.add(p.marker)
        }
        
        setExistingGroups(
          Array.from(uniqueGroups.entries()).map(([group_slug, group_name]) => ({
            group_slug,
            group_name
          }))
        )
        
        setDistinctValues({
          brands: Array.from(brands).sort(),
          categories: Array.from(categories).sort(),
          models: Array.from(models).sort(),
          markers: Array.from(markers).sort()
        })
        
      } catch (err) {
        console.error('[v0] Erro ao carregar dados:', err)
        setExistingGroups([])
      } finally {
        setLoadingData(false)
      }
    }
    loadData()
  }, [])

  const safeExistingGroups = Array.isArray(existingGroups) ? existingGroups : []
  const safeDistinctValues = {
    brands: Array.isArray(distinctValues.brands) ? distinctValues.brands : [],
    categories: Array.isArray(distinctValues.categories) ? distinctValues.categories : [],
    models: Array.isArray(distinctValues.models) ? distinctValues.models : [],
    markers: Array.isArray(distinctValues.markers) ? distinctValues.markers : []
  }

  const selectedGroup = safeExistingGroups.find(g => g.group_slug === selectedGroupSlug)
  const resolvedGroupSlug = groupMode === 'existing'
    ? (selectedGroupSlug || formData.group_slug)
    : (formData.group_slug || cleanSlug(formData.group_name || formData.model || formData.name))
  const resolvedGroupName = groupMode === 'existing'
    ? (selectedGroup?.group_name || formData.group_name || formData.name)
    : (formData.group_name || formData.name)
  const resolvedVariantLabel = formData.variant_label || formData.color

  // Slug unico da variação: group_slug + cor/variação.
  const generatedVariationSlug = buildVariationSlug(resolvedGroupSlug, resolvedVariantLabel, formData.slug || formData.name)

  useEffect(() => {
    const groupSlugFromUrl = searchParams.get('group_slug')
    if (!groupSlugFromUrl || safeExistingGroups.length === 0) return

    const group = safeExistingGroups.find(g => g.group_slug === groupSlugFromUrl)
    if (!group) return

    setGroupMode('existing')
    setSelectedGroupSlug(group.group_slug)
    setFormData(prev => ({
      ...prev,
      group_slug: group.group_slug,
      group_name: group.group_name,
      name: prev.name || group.group_name,
      slug: ''
    }))
  }, [searchParams, safeExistingGroups.length])

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value
    setFormData(prev => ({
      ...prev,
      name,
      slug: cleanSlug(name)
    }))
  }

  const handleGroupNameChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      group_name: value,
      group_slug: cleanSlug(value)
    }))
  }

  const handleSelectExistingGroup = (groupSlug: string) => {
    setSelectedGroupSlug(groupSlug)
    const group = safeExistingGroups.find(g => g.group_slug === groupSlug)
    if (group) {
      setFormData(prev => ({
        ...prev,
        group_slug: group.group_slug,
        group_name: group.group_name,
        name: prev.name || group.group_name,
        slug: ''
      }))
    }
  }

  const handleSizeToggle = (size: number) => {
    setFormData(prev => ({
      ...prev,
      sizes: (prev.sizes || []).includes(size)
        ? (prev.sizes || []).filter(s => s !== size)
        : [...(prev.sizes || []), size].sort((a, b) => a - b)
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setErrorDetails(null)
    setSuccess(false)
    setSuccessMessage('')
    setImageWarning('')

    const supabase = createClient()
    let productId: string | null = null
    const imageErrors: string[] = []

    const groupSlugToSave = resolvedGroupSlug || cleanSlug(formData.name)
    const groupNameToSave = resolvedGroupName || formData.name
    const variantLabelToSave = resolvedVariantLabel || formData.color || 'Padrao'
    const finalSlug = generatedVariationSlug || buildVariationSlug(groupSlugToSave, variantLabelToSave, formData.slug || formData.name)

    // Validacao: variant_label obrigatorio quando adicionando cor a modelo existente
    if (groupMode === 'existing' && !formData.variant_label.trim()) {
      setErrorDetails({
        step: 'Validacao',
        message: 'O campo "Label da Variacao" e obrigatorio quando adicionando cor a modelo existente.',
        code: 'MISSING_VARIANT_LABEL',
        hint: 'Informe a cor/variacao, ex: "Preto Nude", "Rosa Branco"'
      })
      setLoading(false)
      return
    }

    // Validacao: virgula nos campos de cor
    if (hasComma(formData.color) || hasComma(formData.variant_label)) {
      setErrorDetails({
        step: 'Validacao',
        message: 'Cadastre uma cor por vez. Remova a virgula do campo Cor ou Label da Variacao.',
        code: 'MULTIPLE_COLORS',
        hint: 'Para cadastrar outra cor, use "Adicionar Cor a Modelo Existente" apos salvar este produto.'
      })
      setLoading(false)
      return
    }

    try {
      // ETAPA 0: Verificar se slug ja existe
      setCurrentStep('Verificando se variacao ja existe...')
      
      const { data: existingProduct } = await supabase
        .from('products')
        .select('id, name')
        .eq('slug', finalSlug)
        .single()

      if (existingProduct) {
        setErrorDetails({
          step: 'Validacao',
          message: 'Essa cor/variacao ja existe para este modelo.',
          code: 'DUPLICATE_VARIATION',
          details: `Produto existente: ${existingProduct.name}`,
          hint: 'Escolha outra cor ou verifique se o produto ja foi cadastrado.'
        })
        setLoading(false)
        return
      }

      // ETAPA 1: Criar produto
      setCurrentStep('Salvando produto...')
      
      const productData = {
        name: formData.name,
        slug: finalSlug,
        brand: formData.brand || null,
        model: formData.model || null,
        category: formData.category || null,
        color: formData.color || variantLabelToSave || null,
        variant_label: variantLabelToSave || null,
        group_slug: groupSlugToSave || null,
        group_name: groupNameToSave || null,
        description: formData.description || null,
        details: formData.details || null,
        price: parseFloat(formData.price) || 200,
        cost: parseFloat(formData.cost) || 200,
        marker: formData.marker || 'Varejo',
        payment_link: formData.payment_link || null,
        status: formData.status || 'active'
      }

      const { data: product, error: insertError } = await supabase
        .from('products')
        .insert(productData)
        .select()
        .single()

      if (insertError) {
        setErrorDetails({
          step: 'Salvar produto',
          message: insertError.message || 'Erro desconhecido',
          code: insertError.code,
          details: insertError.details,
          hint: insertError.hint
        })
        setLoading(false)
        return
      }

      productId = product.id

      // ETAPA 2: Salvar tamanhos na tabela product_variants
      const sizesToInsert = formData.sizes || []
      if (sizesToInsert.length > 0) {
        setCurrentStep('Salvando tamanhos...')
        
        const variantsToInsert = sizesToInsert.map(size => ({
          product_id: productId,
          size: size,
          stock_quantity: parseInt(formData.stock_per_size) || 1,
          status: 'active'
        }))

        const { error: variantsError } = await supabase
          .from('product_variants')
          .insert(variantsToInsert)

        if (variantsError) {
          setErrorDetails({
            step: 'Salvar tamanhos',
            message: variantsError.message || 'Erro desconhecido',
            code: variantsError.code,
            details: variantsError.details,
            hint: variantsError.hint
          })
          setLoading(false)
          return
        }
      }

      // ETAPA 3: Salvar imagens na tabela product_images
      const imagesToInsert = pendingImages || []
      if (imagesToInsert.length > 0) {
        setCurrentStep(`Salvando imagens (0/${imagesToInsert.length})...`)
        
        for (let i = 0; i < imagesToInsert.length; i++) {
          const img = imagesToInsert[i]
          setCurrentStep(`Salvando imagens (${i + 1}/${imagesToInsert.length})...`)
          
          const { error: imageError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: img.image_url,
              position: i,
              is_main: img.is_main || i === 0
            })

          if (imageError) {
            imageErrors.push(`Imagem ${i + 1}: ${imageError.message}`)
          }
        }
      }

      // Finalizando
      setCurrentStep('Finalizando cadastro...')

      // Produto salvo com sucesso
      if (imageErrors.length > 0) {
        setSuccess(true)
        setImageWarning(`Produto salvo, mas ${imageErrors.length} imagem(ns) nao foram enviadas.`)
        setSuccessMessage(groupMode === 'existing' ? 'Nova cor adicionada com sucesso!' : 'Produto cadastrado com sucesso!')
        
        setTimeout(() => {
          router.push('/admin/produtos?success=created')
          router.refresh()
        }, 2000)
      } else {
        setSuccess(true)
        setSuccessMessage(groupMode === 'existing' ? 'Nova cor adicionada com sucesso!' : 'Produto salvo com sucesso!')
        
        setTimeout(() => {
          router.push('/admin/produtos?success=created')
          router.refresh()
        }, 1000)
      }

    } catch (err) {
      setErrorDetails({
        step: currentStep || 'Erro inesperado',
        message: err instanceof Error ? err.message : 'Erro desconhecido',
        code: 'UNKNOWN',
        details: String(err)
      })
    } finally {
      setLoading(false)
      setCurrentStep('')
    }
  }

  return (
    <div className="p-6 md:p-8">
      <Link 
        href="/admin/produtos"
        className="inline-flex items-center text-muted-foreground hover:text-primary transition-colors mb-6"
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Voltar para Produtos
      </Link>

      <div className="mb-8">
        <h1 className="text-3xl font-bold">Novo Produto</h1>
        <p className="text-muted-foreground">Adicione um novo produto ou nova cor a um modelo existente</p>
      </div>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6">
        {/* Mensagem de Sucesso */}
        {success && (
          <Card className="bg-green-500/10 border-green-500/30">
            <CardContent className="p-4 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-500 flex-shrink-0" />
              <div>
                <p className="text-green-500 font-medium">{successMessage}</p>
                {imageWarning && (
                  <p className="text-yellow-500 text-sm mt-1">{imageWarning}</p>
                )}
                <p className="text-muted-foreground text-sm mt-1">Redirecionando...</p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Mensagem de Erro */}
        {errorDetails && (
          <Card className="bg-destructive/10 border-destructive/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-destructive flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                Erro ao salvar produto
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-destructive">Etapa:</span>
                <p className="text-foreground">{errorDetails.step}</p>
              </div>
              <div>
                <span className="font-medium text-destructive">Mensagem:</span>
                <p className="text-foreground">{errorDetails.message}</p>
              </div>
              {errorDetails.code && (
                <div>
                  <span className="font-medium text-destructive">Codigo:</span>
                  <p className="text-foreground font-mono">{errorDetails.code}</p>
                </div>
              )}
              {errorDetails.details && (
                <div>
                  <span className="font-medium text-destructive">Detalhes:</span>
                  <p className="text-foreground">{errorDetails.details}</p>
                </div>
              )}
              {errorDetails.hint && (
                <div>
                  <span className="font-medium text-destructive">Dica:</span>
                  <p className="text-foreground">{errorDetails.hint}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Progresso */}
        {loading && currentStep && (
          <Card className="bg-primary/10 border-primary/30">
            <CardContent className="p-4 flex items-center gap-3">
              <Loader2 className="h-5 w-5 animate-spin text-primary flex-shrink-0" />
              <span className="text-primary">{currentStep}</span>
            </CardContent>
          </Card>
        )}

        {/* Selecao de Grupo/Modelo */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Modelo / Grupo</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-4">
              <Button
                type="button"
                variant={groupMode === 'new' ? 'default' : 'outline'}
                onClick={() => {
                  setGroupMode('new')
                  setSelectedGroupSlug('')
                  setFormData(prev => ({ ...prev, group_slug: '', group_name: '' }))
                }}
              >
                <Plus className="h-4 w-4 mr-2" />
                Criar Novo Modelo
              </Button>
              <Button
                type="button"
                variant={groupMode === 'existing' ? 'default' : 'outline'}
                onClick={() => setGroupMode('existing')}
                disabled={loadingData || safeExistingGroups.length === 0}
              >
                {loadingData ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Carregando...
                  </>
                ) : (
                  'Adicionar Cor a Modelo Existente'
                )}
              </Button>
            </div>

            {groupMode === 'new' && (
              <div className="grid sm:grid-cols-2 gap-4 pt-4 border-t border-border">
                <div className="space-y-2">
                  <Label htmlFor="group_name">Nome do Modelo</Label>
                  <ComboboxField
                    value={formData.group_name}
                    onChange={handleGroupNameChange}
                    options={safeExistingGroups.map(g => g.group_name)}
                    placeholder="Ex: New Balance 9060"
                    disabled={loading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Nome que aparecera no catalogo (sem a cor)
                  </p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="group_slug">Slug do Modelo</Label>
                  <Input
                    id="group_slug"
                    value={formData.group_slug}
                    onChange={(e) => setFormData(prev => ({ ...prev, group_slug: e.target.value }))}
                    placeholder="new-balance-9060"
                    className="bg-background"
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            {groupMode === 'existing' && (
              <div className="pt-4 border-t border-border space-y-4">
                <Label>Selecione o modelo existente:</Label>
                
                {loadingData ? (
                  <div className="flex items-center gap-2 text-muted-foreground py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Carregando modelos...</span>
                  </div>
                ) : safeExistingGroups.length === 0 ? (
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-4 text-center">
                      <p className="text-muted-foreground">
                        Nenhum modelo existente encontrado.
                      </p>
                      <p className="text-sm text-muted-foreground mt-1">
                        Crie um novo modelo primeiro.
                      </p>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="mt-3"
                        onClick={() => setGroupMode('new')}
                      >
                        Criar Novo Modelo
                      </Button>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="grid sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {safeExistingGroups.map(group => (
                      <button
                        key={group.group_slug}
                        type="button"
                        onClick={() => handleSelectExistingGroup(group.group_slug)}
                        className={`p-3 rounded-lg border-2 text-left transition-all ${
                          selectedGroupSlug === group.group_slug
                            ? 'border-primary bg-primary/10'
                            : 'border-border hover:border-primary/50'
                        }`}
                      >
                        <p className="font-medium">{group.group_name}</p>
                        <p className="text-xs text-muted-foreground">{group.group_slug}</p>
                      </button>
                    ))}
                  </div>
                )}

                {selectedGroupSlug && (
                  <Card className="bg-muted/30 border-muted">
                    <CardContent className="p-4 space-y-2">
                      <div className="flex items-center gap-2 text-primary">
                        <Info className="h-4 w-4" />
                        <span className="font-medium text-sm">Slug da variacao (gerado automaticamente)</span>
                      </div>
                      <p className="font-mono text-sm bg-background px-3 py-2 rounded border border-border">
                        {generatedVariationSlug || `${selectedGroupSlug}-[label-da-variacao]`}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Informacoes Basicas */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Informacoes Basicas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Produto *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={handleNameChange}
                placeholder="Ex: New Balance 9060 - Preto Nude"
                className="bg-background"
                required
                disabled={loading}
              />
            </div>

            {groupMode === 'new' && (
              <div className="space-y-2">
                <Label htmlFor="slug">Slug (URL)</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                  placeholder="new-balance-9060-preto-nude"
                  className="bg-background"
                  disabled={loading}
                />
              </div>
            )}

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marca</Label>
                <ComboboxField
                  value={formData.brand}
                  onChange={(value) => setFormData(prev => ({ ...prev, brand: value }))}
                  options={safeDistinctValues.brands}
                  defaultOptions={DEFAULT_BRANDS}
                  placeholder="Selecione ou digite..."
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Modelo</Label>
                <ComboboxField
                  value={formData.model}
                  onChange={(value) => setFormData(prev => ({ ...prev, model: value }))}
                  options={safeDistinctValues.models}
                  placeholder="Ex: 9060, Air Jordan High"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Categoria</Label>
              <ComboboxField
                value={formData.category}
                onChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                options={safeDistinctValues.categories}
                defaultOptions={DEFAULT_CATEGORIES}
                placeholder="Selecione ou digite..."
                disabled={loading}
              />
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="color">Cor</Label>
                <Input
                  id="color"
                  value={formData.color}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData(prev => ({ ...prev, color: value }))
                  }}
                  placeholder="Ex: Preto Nude"
                  className="bg-background"
                  disabled={loading}
                />
                {formData.color.includes(',') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 space-y-2">
                    <p className="text-yellow-500 text-sm">
                      Cadastre uma cor por vez.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      onClick={() => {
                        const firstColor = formData.color.split(',')[0].trim()
                        setFormData(prev => ({ ...prev, color: firstColor }))
                      }}
                    >
                      Corrigir para primeira cor
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Uma cor por cadastro</p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="variant_label">Label da Variacao</Label>
                <Input
                  id="variant_label"
                  value={formData.variant_label}
                  onChange={(e) => {
                    const value = e.target.value
                    setFormData(prev => ({ ...prev, variant_label: value }))
                  }}
                  placeholder="Ex: Preto Nude"
                  className="bg-background"
                  disabled={loading}
                />
                {formData.variant_label.includes(',') && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-md p-3 space-y-2">
                    <p className="text-yellow-500 text-sm">
                      Cadastre uma cor por vez.
                    </p>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      className="text-yellow-500 border-yellow-500/30 hover:bg-yellow-500/10"
                      onClick={() => {
                        const firstColor = formData.variant_label.split(',')[0].trim()
                        setFormData(prev => ({ ...prev, variant_label: firstColor }))
                      }}
                    >
                      Corrigir para primeira cor
                    </Button>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">Texto que aparece no seletor de cores</p>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descricao</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descricao do produto..."
                className="bg-background min-h-[80px]"
                disabled={loading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="details">Detalhes</Label>
              <Textarea
                id="details"
                value={formData.details}
                onChange={(e) => setFormData(prev => ({ ...prev, details: e.target.value }))}
                placeholder="Detalhes tecnicos, material, etc..."
                className="bg-background min-h-[80px]"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Precos e Status */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Precos e Status</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preco de Venda (R$)</Label>
                <Input
                  id="price"
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                  className="bg-background"
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="cost">Custo (R$)</Label>
                <Input
                  id="cost"
                  type="number"
                  step="0.01"
                  value={formData.cost}
                  onChange={(e) => setFormData(prev => ({ ...prev, cost: e.target.value }))}
                  className="bg-background"
                  disabled={loading}
                />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Marcador</Label>
                <ComboboxField
                  value={formData.marker}
                  onChange={(value) => setFormData(prev => ({ ...prev, marker: value }))}
                  options={safeDistinctValues.markers}
                  defaultOptions={DEFAULT_MARKERS}
                  placeholder="Selecione..."
                  disabled={loading}
                />
              </div>
              <div className="space-y-2">
                <Label>Status</Label>
                <SimpleSelect
                  value={formData.status}
                  onChange={(value) => setFormData(prev => ({ ...prev, status: value }))}
                  options={STATUS_OPTIONS}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="payment_link">Link de Pagamento (Mercado Pago)</Label>
              <Input
                id="payment_link"
                value={formData.payment_link}
                onChange={(e) => setFormData(prev => ({ ...prev, payment_link: e.target.value }))}
                placeholder="https://mpago.la/..."
                className="bg-background"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Tamanhos */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Tamanhos Disponiveis</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {DEFAULT_SIZES.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeToggle(size)}
                  disabled={loading}
                  className={`w-12 h-12 rounded-lg border-2 font-medium transition-all ${
                    (formData.sizes || []).includes(size)
                      ? 'border-primary bg-primary/20 text-primary'
                      : 'border-border hover:border-primary/50'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>

            <div className="space-y-2 max-w-[200px]">
              <Label htmlFor="stock_per_size">Estoque por Tamanho</Label>
              <Input
                id="stock_per_size"
                type="number"
                min="0"
                value={formData.stock_per_size}
                onChange={(e) => setFormData(prev => ({ ...prev, stock_per_size: e.target.value }))}
                className="bg-background"
                disabled={loading}
              />
            </div>
          </CardContent>
        </Card>

        {/* Imagens */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Imagens do Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <ImageUploader
              productSlug={generatedVariationSlug || formData.slug || 'novo-produto'}
              images={pendingImages}
              onImagesChange={setPendingImages}
            />
          </CardContent>
        </Card>

        {/* Botao Salvar */}
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={loading || success}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 mr-2 animate-spin" />
              Salvando...
            </>
          ) : (
            <>
              <Save className="h-5 w-5 mr-2" />
              Salvar Produto
            </>
          )}
        </Button>
      </form>
    </div>
  )
}
