import { Category } from './types'

// Categorias da loja (usadas para filtros)
export const FALLBACK_CATEGORIES: Category[] = [
  { id: 'cat-fem', name: 'Feminino', slug: 'feminino', description: 'Tênis femininos' },
  { id: 'cat-masc', name: 'Masculino', slug: 'masculino', description: 'Tênis masculinos' },
  { id: 'cat-uni', name: 'Unissex', slug: 'unissex', description: 'Tênis unissex' },
  { id: 'cat-run', name: 'Running', slug: 'running', description: 'Tênis para corrida' },
]

// Dados da loja
export const STORE_CONFIG = {
  name: 'EN SHOES',
  domain: 'enshoes.com.br',
  whatsapp: '5511958046787',
  whatsappFormatted: '(11) 95804-6787',
  instagram: '@enshoes00',
  instagramUrl: 'https://instagram.com/enshoes00',
  mercadoPagoLink: 'https://link.mercadopago.com.br/videiraconsultoria'
}
