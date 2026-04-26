'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface CatalogFiltersProps {
  searchQuery?: string
}

export function CatalogFilters({ searchQuery }: CatalogFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [search, setSearch] = useState(searchQuery || '')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams(searchParams.toString())
    
    if (search) {
      params.set('busca', search)
    } else {
      params.delete('busca')
    }
    
    router.push(`/catalogo?${params.toString()}`)
  }

  const clearSearch = () => {
    setSearch('')
    router.push('/catalogo')
  }

  return (
    <div className="mb-8">
      <form onSubmit={handleSearch} className="flex gap-2 max-w-md mx-auto">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Buscar tênis..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card border-border"
          />
          {search && (
            <button
              type="button"
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        <Button type="submit" className="neon-glow">
          Buscar
        </Button>
      </form>

      {searchQuery && (
        <div className="text-center mt-4">
          <span className="text-sm text-muted-foreground">
            Resultados para: <strong className="text-primary">{searchQuery}</strong>
          </span>
          <Button
            variant="link"
            size="sm"
            onClick={clearSearch}
            className="text-muted-foreground hover:text-primary ml-2"
          >
            Limpar busca
          </Button>
        </div>
      )}
    </div>
  )
}
