'use client'

import { useState, useEffect } from 'react'
import { Settings, CreditCard, Truck, MessageCircle, Store, Loader2, Check, AlertCircle } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'

interface StoreSettings {
  store_name: string
  product_price: number
  whatsapp_number: string
  mercadopago_link: string
  pac_base_price: number
  pac_days: string
  sedex_base_price: number
  sedex_days: string
}

const DEFAULT_SETTINGS: StoreSettings = {
  store_name: 'EN SHOES',
  product_price: 200,
  whatsapp_number: '5511999999999',
  mercadopago_link: 'https://link.mercadopago.com.br/videiraconsultoria',
  pac_base_price: 25,
  pac_days: '8 a 12',
  sedex_base_price: 45,
  sedex_days: '3 a 5'
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<StoreSettings>(DEFAULT_SETTINGS)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      const { data, error: fetchError } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') {
        console.log('[v0] Error loading settings:', fetchError.message)
      }

      if (data) {
        setSettings({
          store_name: data.store_name || DEFAULT_SETTINGS.store_name,
          product_price: data.product_price || DEFAULT_SETTINGS.product_price,
          whatsapp_number: data.whatsapp_number || DEFAULT_SETTINGS.whatsapp_number,
          mercadopago_link: data.mercadopago_link || DEFAULT_SETTINGS.mercadopago_link,
          pac_base_price: data.pac_base_price || DEFAULT_SETTINGS.pac_base_price,
          pac_days: data.pac_days || DEFAULT_SETTINGS.pac_days,
          sedex_base_price: data.sedex_base_price || DEFAULT_SETTINGS.sedex_base_price,
          sedex_days: data.sedex_days || DEFAULT_SETTINGS.sedex_days
        })
      }
    } catch (err) {
      console.log('[v0] Error:', err)
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
      
      // First, check if settings exist
      const { data: existing } = await supabase
        .from('store_settings')
        .select('id')
        .limit(1)
        .single()

      if (existing) {
        // Update existing
        const { error: updateError } = await supabase
          .from('store_settings')
          .update(settings)
          .eq('id', existing.id)

        if (updateError) throw updateError
      } else {
        // Insert new
        const { error: insertError } = await supabase
          .from('store_settings')
          .insert(settings)

        if (insertError) throw insertError
      }

      setSuccess(true)
      setTimeout(() => setSuccess(false), 3000)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao salvar configurações'
      setError(errorMessage)
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
        <div className="mb-6 flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-500">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <p>{error}</p>
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
            <div className="space-y-2">
              <Label htmlFor="store-price">Preço Único dos Produtos (R$)</Label>
              <Input 
                id="store-price" 
                type="number" 
                value={settings.product_price}
                onChange={(e) => handleChange('product_price', parseFloat(e.target.value) || 0)}
                className="bg-background" 
              />
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
                value={settings.whatsapp_number}
                onChange={(e) => handleChange('whatsapp_number', e.target.value)}
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
                value={settings.mercadopago_link}
                onChange={(e) => handleChange('mercadopago_link', e.target.value)}
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
                <Input 
                  id="pac-base" 
                  type="number" 
                  value={settings.pac_base_price}
                  onChange={(e) => handleChange('pac_base_price', parseFloat(e.target.value) || 0)}
                  className="bg-background" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pac-days">PAC - Prazo (dias)</Label>
                <Input 
                  id="pac-days" 
                  value={settings.pac_days}
                  onChange={(e) => handleChange('pac_days', e.target.value)}
                  className="bg-background" 
                />
              </div>
            </div>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="sedex-base">SEDEX - Valor Base (R$)</Label>
                <Input 
                  id="sedex-base" 
                  type="number" 
                  value={settings.sedex_base_price}
                  onChange={(e) => handleChange('sedex_base_price', parseFloat(e.target.value) || 0)}
                  className="bg-background" 
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sedex-days">SEDEX - Prazo (dias)</Label>
                <Input 
                  id="sedex-days" 
                  value={settings.sedex_days}
                  onChange={(e) => handleChange('sedex_days', e.target.value)}
                  className="bg-background" 
                />
              </div>
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
