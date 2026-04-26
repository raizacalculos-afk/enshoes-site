'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { Product, CartItem, ShippingOption } from '@/lib/types'

interface CartContextType {
  items: CartItem[]
  addItem: (product: Product, size: number) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  itemCount: number
  subtotal: number
  shipping: ShippingOption | null
  setShipping: (option: ShippingOption | null) => void
  total: number
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  openCart: () => void
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([])
  const [shipping, setShipping] = useState<ShippingOption | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const stored = localStorage.getItem('en-shoes-cart')
    if (stored) {
      try {
        setItems(JSON.parse(stored))
      } catch {
        setItems([])
      }
    }
  }, [])

  useEffect(() => {
    if (mounted) {
      localStorage.setItem('en-shoes-cart', JSON.stringify(items))
    }
  }, [items, mounted])

  const addItem = (product: Product, size: number) => {
    setItems(prev => {
      const existingIndex = prev.findIndex(
        item => item.product.id === product.id && item.size === size
      )
      
      if (existingIndex >= 0) {
        const updated = [...prev]
        updated[existingIndex].quantity += 1
        return updated
      }
      
      return [...prev, {
        id: `${product.id}-${size}-${Date.now()}`,
        product,
        size,
        quantity: 1
      }]
    })
    setIsOpen(true)
  }

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id))
  }

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) {
      removeItem(id)
      return
    }
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, quantity } : item
    ))
  }

  const clearCart = () => {
    setItems([])
    setShipping(null)
  }

  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0)
  const subtotal = items.reduce((sum, item) => sum + (item.product.price * item.quantity), 0)
  const total = subtotal + (shipping?.price || 0)

  const openCart = () => setIsOpen(true)

  return (
    <CartContext.Provider value={{
      items,
      addItem,
      removeItem,
      updateQuantity,
      clearCart,
      itemCount,
      subtotal,
      shipping,
      setShipping,
      total,
      isOpen,
      setIsOpen,
      openCart
    }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
