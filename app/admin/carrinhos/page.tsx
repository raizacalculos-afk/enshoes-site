import { createClient } from '@/lib/supabase/server'
import { ShoppingBasket, AlertTriangle, ExternalLink } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface CartWithItems {
  id: string
  customer_name?: string
  customer_whatsapp?: string
  customer_email?: string
  total?: number
  status?: string
  created_at: string
  items_count?: number
}

const WHATSAPP_NUMBER = '5511958046787'

async function getCarts(): Promise<{ carts: CartWithItems[], error?: string }> {
  try {
    const supabase = await createClient()
    
    const { data: carts, error } = await supabase
      .from('carts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50)
    
    if (error) {
      return { carts: [], error: error.message }
    }

    // Busca itens dos carrinhos
    if (carts && carts.length > 0) {
      const cartIds = carts.map(c => c.id)
      const { data: items } = await supabase
        .from('cart_items')
        .select('cart_id')
        .in('cart_id', cartIds)

      const cartsWithItems = carts.map(cart => ({
        ...cart,
        items_count: items?.filter(item => item.cart_id === cart.id).length || 0
      }))

      return { carts: cartsWithItems }
    }
    
    return { carts: carts || [] }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return { carts: [], error: errorMessage }
  }
}

export default async function CarrinhosPage() {
  const { carts, error } = await getCarts()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Carrinhos</h1>
        <p className="text-muted-foreground">Visualização de carrinhos de compras</p>
      </div>

      {error ? (
        <Card className="bg-yellow-950/20 border-yellow-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-yellow-500">
              <AlertTriangle className="h-5 w-5" />
              Dados administrativos ainda não disponíveis
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-yellow-400/80 font-mono bg-yellow-950/50 p-3 rounded">
              {error}
            </p>
            <p className="text-muted-foreground mt-4 text-sm">
              Configure as permissões RLS no Supabase para visualizar os carrinhos.
            </p>
          </CardContent>
        </Card>
      ) : carts.length === 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <ShoppingBasket className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum carrinho encontrado.</p>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingBasket className="h-5 w-5 text-primary" />
              Carrinhos ({carts.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">ID</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Cliente</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">WhatsApp</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Itens</th>
                    <th className="text-right py-3 px-4 text-sm font-medium text-muted-foreground">Total</th>
                    <th className="text-left py-3 px-4 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-center py-3 px-4 text-sm font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {carts.map((cart) => (
                    <tr key={cart.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-3 px-4 text-sm font-mono">
                        #{cart.id.slice(0, 8)}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {cart.customer_name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-sm text-muted-foreground">
                        {cart.customer_whatsapp || '-'}
                      </td>
                      <td className="py-3 px-4 text-sm text-center">
                        {cart.items_count || 0}
                      </td>
                      <td className="py-3 px-4 text-sm text-right font-medium">
                        R$ {(cart.total || 0).toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant="outline" className="text-xs">
                          {cart.status || 'Ativo'}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {cart.customer_whatsapp && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="text-green-500 hover:text-green-400 hover:bg-green-500/10"
                            asChild
                          >
                            <a
                              href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
                                `[CARRINHO] Cliente: ${cart.customer_name || 'N/A'} | WhatsApp: ${cart.customer_whatsapp} | Total: R$ ${(cart.total || 0).toFixed(2).replace('.', ',')} | Itens: ${cart.items_count || 0}`
                              )}`}
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
