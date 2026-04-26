import { createClient } from '@/lib/supabase/server'
import { DollarSign, TrendingUp, TrendingDown, Package, ShoppingCart } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

async function getFinancialData() {
  try {
    const supabase = await createClient()
    
    const [productsResult, variantsResult, ordersResult] = await Promise.all([
      supabase.from('products').select('id, price, cost'),
      supabase.from('product_variants').select('product_id, stock_quantity'),
      supabase.from('orders').select('total, subtotal, status, created_at')
    ])

    const products = productsResult.data || []
    const variants = variantsResult.data || []
    const orders = ordersResult.data || []

    // Calculate stock per product from variants
    const stockByProduct = variants.reduce((acc, v) => {
      acc[v.product_id] = (acc[v.product_id] || 0) + (v.stock_quantity || 0)
      return acc
    }, {} as Record<string, number>)

    // Calculate product metrics
    const totalInventoryValue = products.reduce((sum, p) => {
      const stock = stockByProduct[p.id] || 1
      return sum + ((p.price || 0) * stock)
    }, 0)
    const totalInventoryCost = products.reduce((sum, p) => {
      const stock = stockByProduct[p.id] || 1
      return sum + ((p.cost || 200) * stock)
    }, 0)
    const potentialProfit = totalInventoryValue - totalInventoryCost

    // Calculate order metrics
    const completedOrders = orders.filter(o => o.status === 'paid' || o.status === 'shipped' || o.status === 'delivered')
    const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0)
    const averageTicket = completedOrders.length > 0 ? totalRevenue / completedOrders.length : 0

    // Monthly breakdown (last 6 months)
    const monthlyData = Array.from({ length: 6 }, (_, i) => {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const month = date.toLocaleString('pt-BR', { month: 'short' })
      const year = date.getFullYear()
      const monthOrders = orders.filter(o => {
        const orderDate = new Date(o.created_at)
        return orderDate.getMonth() === date.getMonth() && orderDate.getFullYear() === year
      })
      const revenue = monthOrders
        .filter(o => o.status !== 'cancelled' && o.status !== 'pending')
        .reduce((sum, o) => sum + (o.total || 0), 0)
      return { month: `${month}/${year}`, revenue, orders: monthOrders.length }
    }).reverse()

    return {
      totalInventoryValue,
      totalInventoryCost,
      potentialProfit,
      totalRevenue,
      averageTicket,
      totalOrders: orders.length,
      completedOrders: completedOrders.length,
      monthlyData,
      productCount: products.length
    }
  } catch {
    return {
      totalInventoryValue: 0,
      totalInventoryCost: 0,
      potentialProfit: 0,
      totalRevenue: 0,
      averageTicket: 0,
      totalOrders: 0,
      completedOrders: 0,
      monthlyData: [],
      productCount: 0
    }
  }
}

export default async function AdminFinanceiroPage() {
  const data = await getFinancialData()

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Financeiro</h1>
        <p className="text-muted-foreground">Visão financeira da EN SHOES</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Receita Total
            </CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              R$ {data.totalRevenue.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {data.completedOrders} pedidos concluídos
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Ticket Médio
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {data.averageTicket.toFixed(2).replace('.', ',')}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Por pedido
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Valor em Estoque
            </CardTitle>
            <Package className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">
              R$ {data.totalInventoryValue.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Preço de venda
            </p>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Lucro Potencial
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">
              R$ {data.potentialProfit.toFixed(0)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Se vender tudo
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Cost Breakdown */}
      <div className="grid lg:grid-cols-2 gap-8 mb-8">
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Custos
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Custo Total do Estoque</span>
              <span className="text-xl font-bold text-red-500">
                R$ {data.totalInventoryCost.toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Custo Médio por Produto</span>
              <span className="text-xl font-bold">
                R$ {(data.totalInventoryCost / Math.max(data.productCount, 1)).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Margem Média</span>
              <span className="text-xl font-bold text-green-500">
                {((data.potentialProfit / Math.max(data.totalInventoryValue, 1)) * 100).toFixed(1)}%
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart className="h-5 w-5 text-primary" />
              Resumo de Vendas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Total de Pedidos</span>
              <span className="text-xl font-bold">{data.totalOrders}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Pedidos Concluídos</span>
              <span className="text-xl font-bold text-green-500">{data.completedOrders}</span>
            </div>
            <div className="flex justify-between items-center p-4 bg-secondary/50 rounded-lg">
              <span className="text-muted-foreground">Taxa de Conversão</span>
              <span className="text-xl font-bold">
                {data.totalOrders > 0 ? ((data.completedOrders / data.totalOrders) * 100).toFixed(1) : 0}%
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Revenue */}
      {data.monthlyData.length > 0 && (
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Receita Mensal</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {data.monthlyData.map((month, index) => (
                <div key={index} className="text-center p-4 bg-secondary/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">{month.month}</p>
                  <p className="text-lg font-bold text-primary">
                    R$ {month.revenue.toFixed(0)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {month.orders} pedido(s)
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {data.productCount === 0 && data.totalOrders === 0 && (
        <Card className="bg-card border-border">
          <CardContent className="py-8 text-center">
            <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">
              Nenhum dado financeiro disponível ainda.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Os dados aparecerão aqui quando houver produtos e pedidos cadastrados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
