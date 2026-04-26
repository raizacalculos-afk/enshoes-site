'use client'

import { useState, useRef } from 'react'
import Image from 'next/image'
import { Upload, X, Star, Link as LinkIcon, Loader2, ImageIcon } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductImage } from '@/lib/types'

interface ImageUploaderProps {
  productId?: string
  productSlug: string
  images: ProductImage[]
  onImagesChange: (images: ProductImage[]) => void
  onUploadSuccess?: (image: ProductImage) => void
  onUploadError?: (error: string) => void
}

// Limpa o nome do arquivo conforme regras
function cleanFileName(fileName: string): string {
  return fileName
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove acentos
    .replace(/[()[\]{}]/g, '')       // Remove parênteses e colchetes
    .replace(/[^a-z0-9.-]/g, '-')    // Substitui caracteres especiais por hífen
    .replace(/-+/g, '-')             // Remove hífens múltiplos
    .replace(/^-|-$/g, '')           // Remove hífens do início e fim
}

export default function ImageUploader({
  productId,
  productSlug,
  images = [],
  onImagesChange,
  onUploadSuccess,
  onUploadError
}: ImageUploaderProps) {
  // Garante que images seja sempre um array
  const safeImages = images || []
  
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState('')
  const [urlInput, setUrlInput] = useState('')
  const [showUrlInput, setShowUrlInput] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text })
    setTimeout(() => setMessage(null), 5000)
  }

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files
    if (!selectedFiles || selectedFiles.length === 0) return

    // Converte FileList para array de todos os arquivos
    const filesArray = Array.from(selectedFiles)
    const totalFiles = filesArray.length
    
    setUploading(true)
    setUploadProgress(`Preparando ${totalFiles} imagem(ns)...`)
    
    const supabase = createClient()
    
    // Array para acumular todas as novas imagens
    const newImages: ProductImage[] = []
    let successCount = 0
    let errorCount = 0

    // Processa TODOS os arquivos selecionados
    for (let index = 0; index < filesArray.length; index++) {
      const file = filesArray[index]
      const currentNum = index + 1
      
      setUploadProgress(`Enviando imagem ${currentNum} de ${totalFiles}...`)

      try {
        if (!file.type.startsWith('image/')) {
          throw new Error(`${file.name}: arquivo inválido. Envie apenas imagens.`)
        }
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`${file.name}: imagem maior que 5MB.`)
        }

        // Limpa o nome do arquivo
        const cleanedName = cleanFileName(file.name)
        const timestamp = Date.now()
        const filePath = `${productSlug}/${timestamp}-${index}-${cleanedName}`

        // Faz upload para o Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(filePath, file, {
            cacheControl: '3600',
            upsert: false
          })

        if (uploadError) {
          throw uploadError
        }

        // Obtém a URL pública
        const { data: { publicUrl } } = supabase.storage
          .from('product-images')
          .getPublicUrl(filePath)

        // Determina se é a imagem principal (primeira imagem se não houver nenhuma)
        const isMain = safeImages.length === 0 && newImages.length === 0
        const position = safeImages.length + newImages.length

        // Cria o objeto de imagem temporário
        const newImage: ProductImage = {
          id: `temp-${timestamp}-${index}`,
          product_id: productId || '',
          image_url: publicUrl,
          position,
          is_main: isMain,
          created_at: new Date().toISOString()
        }

        // Se tiver productId, salva no banco imediatamente
        if (productId) {
          const { data: savedImage, error: dbError } = await supabase
            .from('product_images')
            .insert({
              product_id: productId,
              image_url: publicUrl,
              position,
              is_main: isMain
            })
            .select()
            .single()

          if (dbError) {
            throw dbError
          }

          newImage.id = savedImage.id
        }

        // Adiciona à lista de novas imagens
        newImages.push(newImage)
        successCount++
        
        onUploadSuccess?.(newImage)

      } catch (err) {
        errorCount++
        const errorMessage = err instanceof Error ? err.message : 'Erro ao enviar imagem'
        onUploadError?.(errorMessage)
      }
    }

    // IMPORTANTE: Atualiza o estado apenas UMA vez com TODAS as imagens
    // Mantém as imagens anteriores e adiciona as novas
    const allImages = [...safeImages, ...newImages]
    onImagesChange(allImages)

    // Mostra mensagem de resultado
    setUploadProgress('')
    if (successCount > 0 && errorCount === 0) {
      showMessage('success', `${successCount} imagem(ns) enviada(s) com sucesso!`)
    } else if (successCount > 0 && errorCount > 0) {
      showMessage('error', `${successCount} enviada(s), ${errorCount} erro(s)`)
    } else if (errorCount > 0) {
      showMessage('error', `Erro ao enviar ${errorCount} imagem(ns)`)
    }

    setUploading(false)
    
    // Limpa o input para permitir selecionar os mesmos arquivos novamente
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleUrlAdd = async () => {
    if (!urlInput.trim()) return

    setUploading(true)
    const supabase = createClient()

    try {
      const isMain = safeImages.length === 0
      const position = safeImages.length
      const timestamp = Date.now()

      const newImage: ProductImage = {
        id: `temp-${timestamp}`,
        product_id: productId || '',
        image_url: urlInput.trim(),
        position,
        is_main: isMain,
        created_at: new Date().toISOString()
      }

      // Se tiver productId, salva no banco
      if (productId) {
        const { data: savedImage, error: dbError } = await supabase
          .from('product_images')
          .insert({
            product_id: productId,
            image_url: urlInput.trim(),
            position,
            is_main: isMain
          })
          .select()
          .single()

        if (dbError) {
          throw dbError
        }

        newImage.id = savedImage.id
      }

      onImagesChange([...safeImages, newImage])
      setUrlInput('')
      setShowUrlInput(false)
      showMessage('success', 'Imagem adicionada com sucesso')
      onUploadSuccess?.(newImage)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao adicionar imagem'
      showMessage('error', errorMessage)
      onUploadError?.(errorMessage)
    }

    setUploading(false)
  }

  const handleRemoveImage = async (imageId: string) => {
    const supabase = createClient()

    try {
      // Se é uma imagem salva no banco, remove
      if (!imageId.startsWith('temp-')) {
        await supabase
          .from('product_images')
          .delete()
          .eq('id', imageId)
      }

      // Remove da lista local
      const updatedImages = safeImages.filter(img => img.id !== imageId)
      
      // Se a imagem removida era a principal, define a primeira como principal
      if (updatedImages.length > 0) {
        const removedImage = safeImages.find(img => img.id === imageId)
        if (removedImage?.is_main) {
          updatedImages[0].is_main = true
          if (!updatedImages[0].id.startsWith('temp-')) {
            await supabase
              .from('product_images')
              .update({ is_main: true })
              .eq('id', updatedImages[0].id)
          }
        }
      }

      // Reordena as posições
      updatedImages.forEach((img, index) => {
        img.position = index
      })

      onImagesChange(updatedImages)
      showMessage('success', 'Imagem removida')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao remover imagem'
      showMessage('error', errorMessage)
    }
  }

  const handleSetMain = async (imageId: string) => {
    const supabase = createClient()

    try {
      // Atualiza localmente
      const updatedImages = safeImages.map(img => ({
        ...img,
        is_main: img.id === imageId
      }))

      // Atualiza no banco
      for (const img of updatedImages) {
        if (!img.id.startsWith('temp-')) {
          await supabase
            .from('product_images')
            .update({ is_main: img.id === imageId })
            .eq('id', img.id)
        }
      }

      onImagesChange(updatedImages)
      showMessage('success', 'Imagem principal definida')

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao definir imagem principal'
      showMessage('error', errorMessage)
    }
  }

  return (
    <div className="space-y-4">
      <Label>Imagens do produto</Label>

      {/* Mensagem de feedback */}
      {message && (
        <div className={`p-3 rounded-lg text-sm ${
          message.type === 'success' 
            ? 'bg-green-500/10 border border-green-500/30 text-green-500' 
            : 'bg-destructive/10 border border-destructive/30 text-destructive'
        }`}>
          {message.text}
        </div>
      )}

      {/* Progresso de upload */}
      {uploadProgress && (
        <div className="p-3 rounded-lg text-sm bg-primary/10 border border-primary/30 text-primary flex items-center gap-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          {uploadProgress}
        </div>
      )}

      {/* Área de upload */}
      <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/jpg,image/webp"
          multiple
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
          disabled={uploading}
        />
        
        <label 
          htmlFor="image-upload" 
          className={`cursor-pointer flex flex-col items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {uploading ? (
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
          ) : (
            <Upload className="h-10 w-10 text-muted-foreground" />
          )}
          <span className="text-sm text-muted-foreground">
            {uploading ? uploadProgress || 'Enviando...' : 'Clique para selecionar ou arraste imagens aqui'}
          </span>
          <span className="text-xs text-muted-foreground">
            PNG, JPG ou WEBP - Selecione várias imagens de uma vez
          </span>
        </label>
      </div>

      {/* Botão para adicionar URL */}
      <div className="flex gap-2">
        <Button 
          type="button" 
          variant="outline" 
          size="sm"
          onClick={() => setShowUrlInput(!showUrlInput)}
          className="text-xs"
          disabled={uploading}
        >
          <LinkIcon className="h-3 w-3 mr-1" />
          Colar URL
        </Button>
      </div>

      {/* Input de URL */}
      {showUrlInput && (
        <div className="flex gap-2">
          <Input
            value={urlInput}
            onChange={(e) => setUrlInput(e.target.value)}
            placeholder="https://exemplo.com/imagem.jpg"
            className="bg-background flex-1"
          />
          <Button 
            type="button" 
            onClick={handleUrlAdd}
            disabled={!urlInput.trim() || uploading}
            size="sm"
          >
            Adicionar
          </Button>
        </div>
      )}

      {/* Grid de imagens */}
      {safeImages.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {safeImages.map((image) => (
            <div 
              key={image.id}
              className={`relative aspect-square rounded-lg overflow-hidden border-2 group ${
                image.is_main ? 'border-primary ring-2 ring-primary/30' : 'border-border'
              }`}
            >
              {image.image_url ? (
                <Image
                  src={image.image_url}
                  alt={`Imagem ${image.position + 1}`}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary">
                  <ImageIcon className="h-8 w-8 text-muted-foreground" />
                </div>
              )}

              {/* Badge de imagem principal */}
              {image.is_main && (
                <div className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded-full flex items-center gap-1">
                  <Star className="h-3 w-3 fill-current" />
                  Principal
                </div>
              )}

              {/* Overlay com ações */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                {!image.is_main && (
                  <Button
                    type="button"
                    size="sm"
                    variant="secondary"
                    onClick={() => handleSetMain(image.id)}
                    className="text-xs"
                  >
                    <Star className="h-3 w-3 mr-1" />
                    Principal
                  </Button>
                )}
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={() => handleRemoveImage(image.id)}
                  className="text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Mensagem se não houver imagens */}
      {safeImages.length === 0 && !uploading && (
        <p className="text-sm text-muted-foreground text-center py-4">
          Nenhuma imagem adicionada. A primeira imagem será definida como principal.
        </p>
      )}
    </div>
  )
}
