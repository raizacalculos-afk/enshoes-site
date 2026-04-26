'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { Product } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ProductCardProps {
  product: Product
}

export function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/produto/${product.slug}`}>
      <Card className="group overflow-hidden bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:shadow-primary/10">
        <div className="relative aspect-square bg-muted overflow-hidden">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <ShoppingBag className="h-16 w-16 text-muted-foreground" />
            </div>
          )}
          {product.featured && (
            <Badge className="absolute top-2 left-2 bg-primary neon-glow">
              Destaque
            </Badge>
          )}
          {product.original_price && product.original_price > product.price && (
            <Badge variant="destructive" className="absolute top-2 right-2">
              -{Math.round((1 - product.price / product.original_price) * 100)}%
            </Badge>
          )}
        </div>
        <CardContent className="p-4">
          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors truncate">
            {product.name}
          </h3>
          {product.color && (
            <p className="text-sm text-muted-foreground mt-1">
              {product.color}
            </p>
          )}
          {product.category && (
            <Badge variant="outline" className="mt-2 text-xs">
              {product.category}
            </Badge>
          )}
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-xl font-bold text-primary">
              R$ {product.price.toFixed(2).replace('.', ',')}
            </span>
            {product.original_price && product.original_price > product.price && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {product.original_price.toFixed(2).replace('.', ',')}
              </span>
            )}
          </div>
          {product.sizes && product.sizes.length > 0 && (
            <div className="flex flex-wrap gap-1 mt-3">
              {product.sizes.slice(0, 5).map(size => (
                <span 
                  key={size} 
                  className="text-xs px-2 py-1 bg-secondary rounded text-muted-foreground"
                >
                  {size}
                </span>
              ))}
              {product.sizes.length > 5 && (
                <span className="text-xs px-2 py-1 text-muted-foreground">
                  +{product.sizes.length - 5}
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  )
}
