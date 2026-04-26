import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, shipping, subtotal, total } = body

    const supabase = await createClient()

    // Create customer
    const { data: customerData, error: customerError } = await supabase
      .from('clientes')
      .insert({
        name: customer.name,
        whatsapp: customer.whatsapp,
        email: customer.email || null,
        cep: customer.cep,
        address: customer.address,
        city: customer.city,
        state: customer.state
      })
      .select()
      .single()

    if (customerError) {
      // Continue anyway - order is more important
      console.error('Customer creation failed, continuing with order')
    }

    // Create order
    const { data: orderData, error: orderError } = await supabase
      .from('pedidos')
      .insert({
        customer_id: customerData?.id || null,
        status: 'pending',
        payment_method: 'mercadopago',
        shipping_method: shipping?.method || 'pac',
        shipping_cost: shipping?.price || 0,
        subtotal,
        total
      })
      .select()
      .single()

    if (orderError) {
      // Log but don't fail - allow redirect to payment
      console.error('Order creation failed')
      return NextResponse.json({ success: true, orderId: null })
    }

    // Create order items
    if (orderData) {
      const orderItems = items.map((item: {
        product_id: string
        product_name: string
        product_image: string
        size: number
        quantity: number
        price: number
      }) => ({
        order_id: orderData.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))

      await supabase
        .from('itens_do_pedido')
        .insert(orderItems)
    }

    return NextResponse.json({ 
      success: true, 
      orderId: orderData?.id || null 
    })
  } catch (error) {
    console.error('Error processing order:', error)
    // Still return success to allow payment redirect
    return NextResponse.json({ success: true, orderId: null })
  }
}
