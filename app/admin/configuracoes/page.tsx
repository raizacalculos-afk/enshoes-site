'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Settings, CreditCard, Truck, MessageCircle, Store, Loader2, Check, AlertCircle, Instagram, DollarSign } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface StoreSettings {
  id?: string
  store_name: string
  whatsapp: string
  mercado_pago_url: string
  instagram: string
  default_product_price: number
  default_product_cost: number
  shipping_name: string
  shipping_price: number
  shipping_description: string
  updated_at?: string
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'EN SHOES',
  whatsapp: '5511999999999',
  mercado_pago_url: 'https://link.mercadopago.com.br/videiraconsultoria',
  instagram: '@enshoes',
  default_product_price: 200,
  default_product_cost: 100,
  shipping_name: 'Frete Padrão',
  shipping_price: 25,
  shipping_description: 'Entrega em 8 a 12 dias úteis'
}

export default function AdminSettingsPage() {
  const router = useRouter()
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [existingId, setExistingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<{
    message: string
    code?: string
    details?: string
    hint?: string
  } | null>(null)

  useEffect(() => {
    checkSessionAndLoad()
  }, [])

  const checkSessionAndLoad = async () => {
    try {
      const supabase = createClient()
      
      // Verificar sessão
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        router.push('/admin/login')
        return
      }

      // Carregar configurações
      await loadSettings()
    } catch (err) {
      console.log('[v0] Session check error:', err)
      router.push('/admin/login')
    }
  }

  const loadSettings = async () => {
    setError(null)
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        setError({
          message: fetchError.message,
          code: fetchError.code,
          details: fetchError.details,
          hint: fetchError.hint
        })
      }

      if (data) {
        setExistingId(data.id)
        setSettings({
          id: data.id,
          store_name: data.store_name || DEFAULT_SETTINGS.store_name,
          whatsapp: data.whatsapp || DEFAULT_SETTINGS.whatsapp,
          mercado_pago_url: data.mercado_pago_url || DEFAULT_SETTINGS.mercado_pago_url,
          instagram: data.instagram || DEFAULT_SETTINGS.instagram,
          default_product_price: data.default_product_price || DEFAULT_SETTINGS.default_product_price,
          default_product_cost: data.default_product_cost || DEFAULT_SETTINGS.default_product_cost,
          shipping_name: data.shipping_name || DEFAULT_SETTINGS.shipping_name,
          shipping_price: data.shipping_price || DEFAULT_SETTINGS.shipping_price,
          shipping_description: data.shipping_description || DEFAULT_SETTINGS.shipping_description,
          updated_at: data.updated_at
        })
      }
    } catch (err) {
      console.log('[v0] Load error:', err)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    setSaving(true)
    setError(null)
    setSuccess(false)

    try {
      const supabase = createClient()
      
      // Verificar sessão antes de salvar
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError || !session) {
        router.push('/admin/login')
        return
      }

      // Preparar dados para salvar (somente campos válidos)
      const dataToSave = {
        store_name: settings.store_name,
        whatsapp: settings.whatsapp,
        mercado_pago_url: settings.mercado_pago_url,
        instagram: settings.instagram,
        default_product_price: settings.default_product_price,
        default_product_cost: settings.default_product_cost,
        shipping_name: settings.shipping_name,
        shipping_price: settings.shipping_price,
        shipping_description: settings.shipping_description,
        updated_at: new Date().toISOString()
      }

      if (existingId) {
        // Update existing
        const { error: updateError } = await supabase
          .from('store_settings')
          .update(dataToSave)
          .eq('id', existingId)

        if (updateError) {
          setError({
            message: updateError.message,
            code: updateError.code,
            details: updateError.details,
            hint: updateError.hint
          })
          return
        }
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('store_settings')
          .insert(dataToSave)

        if (insertError) {
          setError({
            message: insertError.message,
            code: insertError.code,
            details: insertError.details,
            hint: insertError.hint
          })
          return
        }
      }

      setSuccess(true)
      // Recarregar dados do Supabase
      await loadSettings()
      setTimeout(() => setSuccess(false), 3000)
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'message' in err) {
        const supaError = err as { message: string; code?: string; details?: string; hint?: string }
        setError({
          message: supaError.message,
          code: supaError.code,
          details: supaError.details,
          hint: supaError.hint
        })
      } else {
        setError({ message: 'Erro ao salvar configurações' })
      }
    } finally {
      setSaving(false)
    }
  }

  const handleChange = (field: keyof StoreSettings, value: string | number) => {
    setSettings(prev => ({ ...prev, [field]: value }))
  }

  if (loading) {
    return (
      <div className="p-6 md:p-8">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 md:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Configurações</h1>
        <p className="text-muted-foreground">Gerencie as configurações da loja</p>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
          <div className="flex items-center gap-2 mb-2">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <p className="font-medium">Erro ao carregar/salvar configurações</p>
          </div>
          <div className="text-sm font-mono space-y-1">
            <p><strong>message:</strong> {error.message}</p>
            {error.code && <p><strong>code:</strong> {error.code}</p>}
            {error.details && <p><strong>details:</strong> {error.details}</p>}
            {error.hint && <p><strong>hint:</strong> {error.hint}</p>}
          </div>
        </div>
      )}

      {success && (
        <div className="mb-6 flex items-center gap-2 p-4 bg-green-500/10 border border-green-500/30 rounded-lg text-green-500">
          <Check className="h-5 w-5 flex-shrink-0" />
          <p>Configurações salvas com sucesso!</p>
        </div>
      )}

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
              <Input 
                id="store-name" 
                value={settings.store_name}
                onChange={(e) => handleChange('store_name', e.target.value)}
                className="bg-background" 
              />
            </div>
          </CardContent>
        </Card>

        {/* Preços */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5 text-primary" />
              Preços Padrão
            </CardTitle>
            <CardDescription>Valores padrão para novos produtos</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="default-price">Preço de Venda (R$)</Label>
                <Input 
                  id="default-price" 
                  type="number" 
                  value={settings.default_product_price}
                  onChange={(e) => handleChange('default_product_price', parseFloat(e.target.value) || 0)}
                  className="bg-background" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="default-cost">Custo (R$)</Label>
                <Input 
                  id="default-cost" 
                  type="number" 
                  value={settings.default_product_cost}
                  onChange={(e) => handleChange('default_product_cost', parseFloat(e.target.value) || 0)}
                  className="bg-background" 
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-primary" />
              Contato
            </CardTitle>
            <CardDescription>Informações de contato e redes sociais</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="whatsapp">WhatsApp</Label>
              <Input 
                id="whatsapp" 
                placeholder="5511999999999" 
                value={settings.whatsapp}
                onChange={(e) => handleChange('whatsapp', e.target.value)}
                className="bg-background" 
              />
              <p className="text-xs text-muted-foreground">
                Formato: código do país + DDD + número (sem espaços ou símbolos)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="instagram" className="flex items-center gap-2">
                <Instagram className="h-4 w-4" />
                Instagram
              </Label>
              <Input 
                id="instagram" 
                placeholder="@enshoes" 
                value={settings.instagram}
                onChange={(e) => handleChange('instagram', e.target.value)}
                className="bg-background" 
              />
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
              <Label htmlFor="mercado-pago-url">URL do Mercado Pago</Label>
              <Input 
                id="mercado-pago-url" 
                value={settings.mercado_pago_url}
                onChange={(e) => handleChange('mercado_pago_url', e.target.value)}
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
            <div className="space-y-2">
              <Label htmlFor="shipping-name">Nome do Frete</Label>
              <Input 
                id="shipping-name" 
                value={settings.shipping_name}
                onChange={(e) => handleChange('shipping_name', e.target.value)}
                className="bg-background" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-price">Valor do Frete (R$)</Label>
              <Input 
                id="shipping-price" 
                type="number" 
                value={settings.shipping_price}
                onChange={(e) => handleChange('shipping_price', parseFloat(e.target.value) || 0)}
                className="bg-background" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="shipping-description">Descrição do Frete</Label>
              <Input 
                id="shipping-description" 
                placeholder="Entrega em 8 a 12 dias úteis"
                value={settings.shipping_description}
                onChange={(e) => handleChange('shipping_description', e.target.value)}
                className="bg-background" 
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button 
            className="neon-glow"
            onClick={saveSettings}
            disabled={saving}
          >
            {saving ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Salvando...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Salvar Configurações
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
