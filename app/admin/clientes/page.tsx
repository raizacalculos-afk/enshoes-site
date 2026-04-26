import { createClient } from '@/lib/supabase/server'
import { Users, ExternalLink, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Customer } from '@/lib/types'

const WHATSAPP_NUMBER = '5511958046787'

async function getCustomers(): Promise<{ customers: Customer[], error?: string }> {
  try {
    const supabase = await createClient()
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      return { customers: [], error: error.message }
    }
    return { customers: data || [] }
  } catch (err) {
    const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido'
    return { customers: [], error: errorMessage }
  }
}

export default async function AdminCustomersPage() {
  const { customers, error } = await getCustomers()

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    })
  }

  // Se houver erro, mostra aviso
  if (error) {
    return (
      <div className="p-6 md:p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Clientes</h1>
          <p className="text-muted-foreground">Gerencie os clientes da EN SHOES</p>
        </div>

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
              Configure as permissões RLS no Supabase para visualizar os clientes.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Clientes</h1>
        <p className="text-muted-foreground">{customers.length} clientes cadastrados</p>
      </div>

      {customers.length > 0 ? (
        <Card className="bg-card border-border">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Nome</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">WhatsApp</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Cidade/UF</th>
                    <th className="text-left py-4 px-4 font-medium text-muted-foreground">Cadastro</th>
                    <th className="text-right py-4 px-4 font-medium text-muted-foreground">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map(customer => (
                    <tr key={customer.id} className="border-b border-border/50 hover:bg-secondary/30">
                      <td className="py-4 px-4">
                        <p className="font-medium">{customer.name}</p>
                        {customer.email && (
                          <p className="text-sm text-muted-foreground">{customer.email}</p>
                        )}
                      </td>
                      <td className="py-4 px-4 text-sm">{customer.whatsapp}</td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {customer.city && customer.state 
                          ? `${customer.city}/${customer.state}` 
                          : '-'}
                      </td>
                      <td className="py-4 px-4 text-sm text-muted-foreground">
                        {formatDate(customer.created_at)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Button variant="ghost" size="sm" className="text-green-500 hover:text-green-400" asChild>
                          <a 
                            href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(`[CLIENTE] ${customer.name} | WhatsApp: ${customer.whatsapp}`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-1" />
                            WhatsApp
                          </a>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-card border-border">
          <CardContent className="py-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground">Nenhum cliente cadastrado.</p>
            <p className="text-sm text-muted-foreground mt-2">
              Os clientes aparecerão aqui quando finalizarem suas primeiras compras.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
