// Tipos baseados nas tabelas reais do Supabase

export interface Product {
  id: string
  name: string
  slug: string
  description?: string
  price: number
  original_price?: number
  image_url?: string // Será preenchido via JOIN com product_images
  images?: ProductImage[]
  category_id?: string
  category?: string
  color?: string
  brand?: string
  model?: string
  // Novos campos para agrupamento
  group_slug?: string
  group_name?: string
  variant_label?: string
  sizes?: number[]
  stock?: number
  featured?: boolean
  active?: boolean
  cost?: number
  marker?: string
  payment_link?: string
  status?: string
  details?: string
  created_at: string
  updated_at?: string
}

export interface ProductImage {
  id: string
  product_id: string
  image_url: string
  alt?: string
  position: number
  is_main: boolean
  created_at?: string
}

export interface ProductVariant {
  id: string
  product_id: string
  size: number
  color?: string
  stock: number
  stock_quantity?: number
  sku?: string
  status?: string
  created_at?: string
}

export interface Category {
  id: string
  name: string
  slug: string
  description?: string
  image_url?: string
  created_at?: string
  updated_at?: string
}

export interface Customer {
  id: string
  name: string
  whatsapp: string
  cep?: string
  address?: string
  city?: string
  state?: string
  email?: string
  created_at: string
  updated_at?: string
}

export interface Order {
  id: string
  customer_id?: string
  customer?: Customer
  status: 'pending' | 'paid' | 'shipped' | 'delivered' | 'cancelled'
  payment_method: string
  shipping_method: 'pac' | 'sedex'
  shipping_cost: number
  subtotal: number
  total: number
  notes?: string
  tracking_code?: string
  items?: OrderItem[]
  created_at: string
  updated_at?: string
}

export interface OrderItem {
  id: string
  order_id: string
  product_id?: string
  product_name: string
  product_image?: string
  product_color?: string
  size: number
  quantity: number
  price: number
  created_at?: string
}

export interface CartItem {
  id: string
  product: Product
  size: number
  quantity: number
}

export interface ShippingOption {
  method: 'pac' | 'sedex'
  name: string
  price: number
  days: string
}

export interface Cart {
  id: string
  customer_id?: string
  items: CartItem[]
  total: number
  created_at: string
  updated_at?: string
}

export interface AbandonedCart {
  id: string
  customer_name?: string
  customer_whatsapp?: string
  customer_cep?: string
  items: CartItem[] | Record<string, unknown>[]
  total: number
  recovered: boolean
  created_at: string
  updated_at?: string
}

export interface AdminUser {
  id: string
  email: string
  name: string
  created_at: string
}

export interface StoreEvent {
  id: string
  type: string
  data: Record<string, unknown>
  created_at: string
}

// Tipo para produto com imagens e variantes carregados
export interface ProductWithDetails extends Product {
  product_images?: ProductImage[]
  product_variants?: ProductVariant[]
}
