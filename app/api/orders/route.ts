import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { customer, items, shipping, subtotal, total } = body

    const supabase = await createClient()

    // First, create or find customer
    let customerId: string | null = null

    if (customer && customer.whatsapp) {
      const cleanWhatsapp = customer.whatsapp.replace(/\D/g, '')
      
      // Check if customer exists
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('id')
        .eq('whatsapp', cleanWhatsapp)
        .single()

      if (existingCustomer) {
        customerId = existingCustomer.id
        // Update customer data
        await supabase
          .from('customers')
          .update({
            name: customer.name,
            email: customer.email || null,
            cep: customer.cep,
            address: customer.address,
            city: customer.city,
            state: customer.state,
            updated_at: new Date().toISOString()
          })
          .eq('id', customerId)
      } else {
        // Create new customer
        const { data: newCustomer, error: customerError } = await supabase
          .from('customers')
          .insert({
            name: customer.name,
            whatsapp: cleanWhatsapp,
            email: customer.email || null,
            cep: customer.cep,
            address: customer.address,
            city: customer.city,
            state: customer.state
          })
          .select('id')
          .single()

        if (customerError) {
          console.error('Customer creation error:', customerError.message)
        } else {
          customerId = newCustomer?.id || null
        }
      }
    }

    // Create order
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        customer_id: customerId,
        status: 'pending',
        payment_method: 'mercadopago',
        shipping_method: shipping?.method || 'pac',
        shipping_cost: shipping?.price || 0,
        subtotal: subtotal,
        total: total
      })
      .select('id')
      .single()

    if (orderError) {
      console.error('Order creation error:', orderError.message)
      return NextResponse.json({ success: true, orderId: null })
    }

    // Create order items
    if (order && items && items.length > 0) {
      const orderItems = items.map((item: {
        product_id: string
        product_name: string
        product_image?: string
        size: number
        quantity: number
        price: number
      }) => ({
        order_id: order.id,
        product_id: item.product_id,
        product_name: item.product_name,
        product_image: item.product_image || null,
        size: item.size,
        quantity: item.quantity,
        price: item.price
      }))

      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems)

      if (itemsError) {
        console.error('Order items error:', itemsError.message)
      }
    }

    return NextResponse.json({ success: true, orderId: order?.id })
  } catch (error) {
    console.error('Error processing order:', error)
    return NextResponse.json({ success: true, orderId: null })
  }
}
