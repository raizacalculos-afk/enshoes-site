'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag, Palette } from 'lucide-react'
import { ProductGroup } from '@/lib/queries'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProductGroupCardProps {
  group: ProductGroup
}

export function ProductGroupCard({ group }: ProductGroupCardProps) {
  const variations = Array.isArray(group.variations) ? group.variations : []
  const colorCount = variations.length
  const hasMultipleColors = colorCount > 1
  const priceRange = group.minPrice !== group.maxPrice

  return (
    <Link href={`/produto/${group.slug}`}>
      <Card className="group overflow-hidden bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {group.image_url ? (
            <Image
              src={group.image_url}
              alt={group.group_name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          
          {/* Badge de quantidade de cores */}
          {hasMultipleColors && (
            <Badge className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm">
              <Palette className="h-3 w-3 mr-1" />
              {colorCount} cores
            </Badge>
          )}
          
          {/* Badge de categoria */}
          {group.category && (
            <Badge variant="outline" className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm border-border">
              {group.category}
            </Badge>
          )}
        </div>
        
        <CardContent className="p-4">
          {/* Marca */}
          {group.brand && (
            <p className="text-xs text-primary font-medium mb-1 uppercase tracking-wide">
              {group.brand}
            </p>
          )}
          
          {/* Nome do modelo/grupo */}
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors line-clamp-2">
            {group.group_name}
          </h3>
          
          {/* Preview das cores disponíveis */}
          {hasMultipleColors && (
            <div className="mt-2">
              <p className="text-xs text-muted-foreground">
                {variations.slice(0, 3).map(v => v.variant_label || v.color).join(', ')}
                {colorCount > 3 && ` +${colorCount - 3}`}
              </p>
            </div>
          )}
          
          {/* Preço */}
          <div className="flex items-baseline gap-2 mt-3">
            {priceRange ? (
              <span className="text-lg font-bold text-primary">
                R$ {group.minPrice.toFixed(2).replace('.', ',')} - R$ {group.maxPrice.toFixed(2).replace('.', ',')}
              </span>
            ) : (
              <span className="text-xl font-bold text-primary">
                R$ {group.minPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          
          {/* Indicador de estoque */}
          {group.totalStock > 0 && (
            <p className="text-xs text-green-500 mt-2">
              Em estoque
            </p>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
