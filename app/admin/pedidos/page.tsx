import { createClient } from '@/lib/supabase/server'
import { ShoppingCart, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

interface Order {
  id: string
  status: string
  total: number
  subtotal: number
  shipping_cost: number
  shipping_method?: string
  tracking_code?: string
  created_at: string
  customer?: {
    name: string
    whatsapp: string
    address?: string
    city?: string
    state?: string
  } | null
  items?: {
    id: string
    product_name: string
    size: number
    quantity: number
    price: number
  }[]
}

const WHATSAPP_NUMBER = '5511958046787'

interface SupabaseError {
  message: string
  code?: string
  details?: string
  hint?: string
}

async function getOrders(): Promise<{ orders: Order[], error?: SupabaseError }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('orders')
      .select('*, customer:customers(*), items:order_items(*)')
      .order('created_at', { ascending: false })
    
    if (error) {
      return { 
        orders: [], 
        error: {
          message: error.message,
          code: error.code,
          details: error.details,
          hint: error.hint
        }
      }
    }
    return { orders: data || [] }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return { orders: [], error: { message: errorMessage } }
  }
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/30',
  paid: 'bg-blue-500/20 text-blue-500 border-blue-500/30',
  shipped: 'bg-purple-500/20 text-purple-500 border-purple-500/30',
  delivered: 'bg-green-500/20 text-green-500 border-green-500/30',
  cancelled: 'bg-red-500/20 text-red-500 border-red-500/30'
}

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado'
}

export default async function AdminOrdersPage() {
  const { orders, error } = await getOrders()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Se houver erro, mostra aviso
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Pedidos</h1>
          <p className="text-muted-foreground">Gerencie os pedidos da EN SHOES</p>
        </div>

        <Card className="bg-red-950/20 border-red-500/30">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-500">
              <AlertTriangle className="h-5 w-5" />
              Erro ao carregar pedidos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm font-mono bg-red-950/50 p-3 rounded space-y-1">
              <p className="text-red-400"><strong>message:</strong> {error.message}</p>
              {error.code && <p className="text-red-400/80"><strong>code:</strong> {error.code}</p>}
              {error.details && <p className="text-red-400/80"><strong>details:</strong> {error.details}</p>}
              {error.hint && <p className="text-red-400/80"><strong>hint:</strong> {error.hint}</p>}
            </div>
            <p className="text-muted-foreground text-sm">
              Verifique se as tabelas orders, customers e order_items existem e se as permissões RLS estão configuradas.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Calculate summary
  const totalRevenue = orders
    .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
    .reduce((sum, o) => sum + (o.total || 0), 0)
  const pendingCount = orders.filter(o => o.status === 'pending').length

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Pedidos</h1>
        <p className="text-muted-foreground">Gerencie os pedidos da EN SHOES</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Total Pedidos</p>
            <p className="text-2xl font-bold">{orders.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-500">{pendingCount}</p>
          </CardContent>
        </Card>
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Receita</p>
            <p className="text-2xl font-bold text-primary">R$ {totalRevenue.toFixed(0)}</p>
          </CardContent>
        </Card>
      </div>

      {orders.length > 0 ? (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id} className="bg-card border-border hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <span className="font-mono text-sm bg-secondary px-2 py-1 rounded">#{order.id.slice(0, 8)}</span>
                      <span className={`text-xs px-2 py-1 rounded-full border ${statusColors[order.status] || 'bg-gray-500/20 text-gray-500'}`}>
                        {statusLabels[order.status] || order.status}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.created_at)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-primary">
                      R$ {order.total.toFixed(2).replace('.', ',')}
                    </p>
                    {order.shipping_method && (
                      <p className="text-sm text-muted-foreground">
                        {order.shipping_method.toUpperCase()} - R$ {(order.shipping_cost || 0).toFixed(2).replace('.', ',')}
                      </p>
                    )}
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">Cliente</h4>
                      <p className="font-semibold">{order.customer?.name || 'N/A'}</p>
                      <p className="text-sm text-muted-foreground">{order.customer?.whatsapp || '-'}</p>
                      {order.customer?.address && (
                        <p className="text-sm text-muted-foreground">
                          {order.customer.address}, {order.customer.city} - {order.customer.state}
                        </p>
                      )}
                      {order.customer?.whatsapp && (
                        <Button variant="ghost" size="sm" className="mt-2 text-green-500 hover:text-green-400 p-0" asChild>
                          <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`[PEDIDO #${order.id.slice(0, 8)}] Cliente: ${order.customer.name} | WhatsApp: ${order.customer.whatsapp} | Total: R$ ${order.total.toFixed(2).replace('.', ',')}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            Abrir WhatsApp
                          </a>
                        </Button>
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium mb-2 text-sm text-muted-foreground uppercase tracking-wide">
                        Itens ({order.items?.length || 0})
                      </h4>
                      <div className="space-y-1">
                        {order.items?.map(item => (
                          <div key={item.id} className="flex justify-between text-sm">
                            <span className="text-muted-foreground">
                              {item.quantity}x {item.product_name} (Tam: {item.size})
                            </span>
                            <span className="text-primary">
                              R$ {(item.price * item.quantity).toFixed(2).replace('.', ',')}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {order.tracking_code && (
                  <div className="mt-4 p-3 bg-primary/10 rounded-lg border border-primary/20">
                    <p className="text-sm">
                      <span className="font-medium">Código de rastreio:</span>{' '}
                      <span className="font-mono text-primary">{order.tracking_code}</span>
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <ShoppingCart className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Os pedidos aparecerão aqui quando os clientes finalizarem suas compras.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
