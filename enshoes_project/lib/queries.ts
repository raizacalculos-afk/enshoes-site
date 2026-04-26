import { createClient } from '@/lib/supabase/server'
import { Product, ProductImage, ProductVariant } from './types'

// Busca a imagem principal de um produto
// Prioridade: is_main = true, senão a primeira por position
function getMainImageUrl(images: ProductImage[]): string | undefined {
  if (!images || images.length === 0) return undefined
  
  // Primeiro, procura por is_main = true
  const mainImage = images.find(img => img.is_main === true)
  if (mainImage) return mainImage.image_url
  
  // Se não encontrar, ordena por position e pega a primeira
  const sortedImages = [...images].sort((a, b) => (a.position || 0) - (b.position || 0))
  return sortedImages[0]?.image_url
}

// Interface para grupo de produtos (agrupados por group_slug)
export interface ProductGroup {
  group_slug: string
  group_name: string
  slug: string // slug do primeiro produto do grupo
  brand?: string
  category?: string
  minPrice: number
  maxPrice: number
  image_url?: string
  variations: ProductVariation[]
  totalStock: number
}

// Interface para variação de cor dentro de um grupo
export interface ProductVariation {
  id: string
  slug: string
  name: string
  color: string
  variant_label?: string
  price: number
  cost?: number
  image_url?: string
  images: ProductImage[]
  sizes: number[]
  stock: number
  description?: string
}

// Busca produtos e agrupa por group_slug
export async function getProductsGrouped(options?: {
  search?: string
  limit?: number
}): Promise<ProductGroup[]> {
  const supabase = await createClient()
  
  // Busca todos os produtos
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.search) {
    query = query.or(`name.ilike.%${options.search}%,group_name.ilike.%${options.search}%,color.ilike.%${options.search}%,brand.ilike.%${options.search}%`)
  }
  
  const { data: products, error } = await query
  
  if (error || !products || products.length === 0) {
    return []
  }
  
  // Busca imagens para todos os produtos
  const productIds = products.map(p => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('position', { ascending: true })
  
  // Busca variantes para todos os produtos
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds)
    .order('size', { ascending: true })
  
  // Agrupa produtos por group_slug (ou usa o slug como fallback se não tiver grupo)
  const groups: Map<string, ProductGroup> = new Map()
  
  for (const product of products) {
    // Usa group_slug como chave de agrupamento, ou o slug se não tiver
    const groupKey = product.group_slug || product.slug
    
    const productImages = images?.filter(img => img.product_id === product.id) || []
    const productVariants = variants?.filter(v => v.product_id === product.id) || []
    
    const sizes = productVariants.length > 0 
      ? productVariants.map(v => v.size)
      : product.sizes || []
    
    const stock = productVariants.length > 0
      ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || v.stock || 0), 0)
      : product.stock || 0
    
    const variation: ProductVariation = {
      id: product.id,
      slug: product.slug,
      name: product.name,
      color: product.color || product.variant_label || 'Padrão',
      variant_label: product.variant_label,
      price: product.price,
      cost: product.cost,
      image_url: getMainImageUrl(productImages) || product.image_url,
      images: productImages,
      sizes,
      stock,
      description: product.description
    }
    
    if (groups.has(groupKey)) {
      const group = groups.get(groupKey)!
      group.variations.push(variation)
      group.minPrice = Math.min(group.minPrice, product.price)
      group.maxPrice = Math.max(group.maxPrice, product.price)
      group.totalStock += stock
    } else {
      groups.set(groupKey, {
        group_slug: groupKey,
        group_name: product.group_name || product.name.split(' - ')[0].split(' / ')[0].trim(),
        slug: product.slug,
        brand: product.brand,
        category: product.category,
        minPrice: product.price,
        maxPrice: product.price,
        image_url: getMainImageUrl(productImages) || product.image_url,
        variations: [variation],
        totalStock: stock
      })
    }
  }
  
  // Converte Map para array
  let result = Array.from(groups.values())
  
  // Aplica limite se especificado
  if (options?.limit) {
    result = result.slice(0, options.limit)
  }
  
  return result
}

// Busca produtos com suas imagens (sem agrupamento - para admin e outros usos)
export async function getProducts(options?: {
  featured?: boolean
  search?: string
  limit?: number
  categoryId?: string
}): Promise<Product[]> {
  const supabase = await createClient()
  
  let query = supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
  
  if (options?.search) {
    query = query.ilike('name', `%${options.search}%`)
  }
  
  if (options?.categoryId) {
    query = query.eq('category_id', options.categoryId)
  }
  
  if (options?.limit) {
    query = query.limit(options.limit)
  }
  
  const { data: products, error } = await query
  
  if (error || !products || products.length === 0) {
    return []
  }
  
  // Busca imagens para todos os produtos
  const productIds = products.map(p => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('position', { ascending: true })
  
  // Busca variantes para todos os produtos
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds)
    .order('size', { ascending: true })
  
  // Mapeia produtos com suas imagens e variantes
  return products.map(product => {
    const productImages = images?.filter(img => img.product_id === product.id) || []
    const productVariants = variants?.filter(v => v.product_id === product.id) || []
    
    const sizes = productVariants.length > 0 
      ? productVariants.map(v => v.size)
      : product.sizes || []
    
    const stock = productVariants.length > 0
      ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || v.stock || 0), 0)
      : product.stock || 0
    
    return {
      ...product,
      image_url: getMainImageUrl(productImages) || product.image_url,
      images: productImages,
      sizes,
      stock
    }
  })
}

// Busca todas as variações de cor de um grupo específico por group_slug
export async function getProductVariationsByGroupSlug(groupSlug: string): Promise<Product[]> {
  const supabase = await createClient()
  
  // Busca todos os produtos com o mesmo group_slug
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('group_slug', groupSlug)
    .order('color', { ascending: true })
  
  if (error || !products || products.length === 0) {
    return []
  }
  
  // Busca imagens para todos os produtos
  const productIds = products.map(p => p.id)
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .in('product_id', productIds)
    .order('position', { ascending: true })
  
  // Busca variantes para todos os produtos
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .in('product_id', productIds)
    .order('size', { ascending: true })
  
  return products.map(product => {
    const productImages = images?.filter(img => img.product_id === product.id) || []
    const productVariants = variants?.filter(v => v.product_id === product.id) || []
    
    const sizes = productVariants.length > 0 
      ? productVariants.map(v => v.size)
      : product.sizes || []
    
    const stock = productVariants.length > 0
      ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || v.stock || 0), 0)
      : product.stock || 0
    
    return {
      ...product,
      image_url: getMainImageUrl(productImages) || product.image_url,
      images: productImages,
      sizes,
      stock
    }
  })
}

// Busca um produto específico por slug com todas as variações do mesmo grupo
export async function getProductBySlug(slug: string): Promise<{ product: Product; variations: Product[] } | null> {
  const supabase = await createClient()
  
  // Busca o produto principal
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('slug', slug)
    .single()
  
  if (error || !product) {
    return null
  }
  
  // Busca imagens do produto principal
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('position', { ascending: true })
  
  // Busca variantes do produto principal
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)
    .order('size', { ascending: true })
  
  const productImages = images || []
  const productVariants = variants || []
  
  const sizes = productVariants.length > 0 
    ? productVariants.map(v => v.size)
    : product.sizes || []
  
  const stock = productVariants.length > 0
    ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || v.stock || 0), 0)
    : product.stock || 0
  
  const mainProduct: Product = {
    ...product,
    image_url: getMainImageUrl(productImages) || product.image_url,
    images: productImages,
    sizes,
    stock
  }
  
  // Se tiver group_slug, busca as outras variações
  let variations: Product[] = []
  if (product.group_slug) {
    variations = await getProductVariationsByGroupSlug(product.group_slug)
  } else {
    // Se não tiver grupo, retorna apenas o próprio produto como variação
    variations = [mainProduct]
  }
  
  return { product: mainProduct, variations }
}

// Busca um produto por ID
export async function getProductById(id: string): Promise<Product | null> {
  const supabase = await createClient()
  
  const { data: product, error } = await supabase
    .from('products')
    .select('*')
    .eq('id', id)
    .single()
  
  if (error || !product) {
    return null
  }
  
  // Busca imagens do produto
  const { data: images } = await supabase
    .from('product_images')
    .select('*')
    .eq('product_id', product.id)
    .order('position', { ascending: true })
  
  // Busca variantes do produto
  const { data: variants } = await supabase
    .from('product_variants')
    .select('*')
    .eq('product_id', product.id)
    .order('size', { ascending: true })
  
  const productImages = images || []
  const productVariants = variants || []
  
  const sizes = productVariants.length > 0 
    ? productVariants.map(v => v.size)
    : product.sizes || []
  
  const stock = productVariants.length > 0
    ? productVariants.reduce((sum, v) => sum + (v.stock_quantity || v.stock || 0), 0)
    : product.stock || 0
  
  return {
    ...product,
    image_url: getMainImageUrl(productImages) || product.image_url,
    images: productImages,
    sizes,
    stock
  }
}

// Busca todos os grupos existentes para uso no admin (para adicionar nova cor a grupo existente)
export async function getExistingGroups(): Promise<{ group_slug: string; group_name: string }[]> {
  const supabase = await createClient()
  
  const { data: products, error } = await supabase
    .from('products')
    .select('group_slug, group_name')
    .not('group_slug', 'is', null)
    .order('group_name', { ascending: true })
  
  if (error || !products) {
    return []
  }
  
  // Remove duplicatas
  const uniqueGroups = new Map<string, string>()
  for (const p of products) {
    if (p.group_slug && !uniqueGroups.has(p.group_slug)) {
      uniqueGroups.set(p.group_slug, p.group_name || p.group_slug)
    }
  }
  
  return Array.from(uniqueGroups.entries()).map(([group_slug, group_name]) => ({
    group_slug,
    group_name
  }))
}

// Busca produtos em destaque (agrupados)
export async function getFeaturedProducts(limit = 8): Promise<ProductGroup[]> {
  return getProductsGrouped({ limit })
}

// Busca todos os produtos ativos
export async function getAllProducts(): Promise<Product[]> {
  return getProducts()
}

// Busca produtos por categoria
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  return getProducts({ categoryId })
}
