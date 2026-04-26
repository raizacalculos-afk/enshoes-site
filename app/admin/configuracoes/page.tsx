import { Settings, CreditCard, Truck, MessageCircle, Store } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

export default function AdminSettingsPage() {
  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da loja</p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        {/* Loja */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Store className="h-5 w-5 text-primary" />
              Informações da Loja
            </CardTitle>
            <CardDescription>Dados básicos da sua loja</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="store-name">Nome da Loja</Label>
              <Input id="store-name" defaultValue="EN SHOES" className="bg-background" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="store-price">Preço Único dos Produtos (R$)</Label>
              <Input id="store-price" type="number" defaultValue="200" className="bg-background" />
            </div>
          </CardContent>
        </Card>

        {/* WhatsApp */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              WhatsApp
            </CardTitle>
            <CardDescription>Configurações de contato</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">Número do WhatsApp</Label>
              <Input 
                id="whatsapp" 
                placeholder="5511999999999" 
                defaultValue="5511999999999"
                className="bg-background" 
              />
              <p className="text-xs text-muted-foreground">
                Formato: código do país + DDD + número (sem espaços ou símbolos)
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Pagamento */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5 text-primary" />
              Pagamento
            </CardTitle>
            <CardDescription>Configurações de pagamento</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="mercadopago-link">Link do Mercado Pago</Label>
              <Input 
                id="mercadopago-link" 
                defaultValue="https://link.mercadopago.com.br/videiraconsultoria"
                className="bg-background" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Frete */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-primary" />
              Frete
            </CardTitle>
            <CardDescription>Configurações de envio</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pac-base">PAC - Valor Base (R$)</Label>
                <Input id="pac-base" type="number" defaultValue="25" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pac-days">PAC - Prazo (dias)</Label>
                <Input id="pac-days" defaultValue="8 a 12" className="bg-background" />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sedex-base">SEDEX - Valor Base (R$)</Label>
                <Input id="sedex-base" type="number" defaultValue="45" className="bg-background" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sedex-days">SEDEX - Prazo (dias)</Label>
                <Input id="sedex-days" defaultValue="3 a 5" className="bg-background" />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button className="neon-glow">
            <Settings className="h-4 w-4 mr-2" />
            Salvar Configurações
          </Button>
        </div>
      </div>
    </div>
  )
}
