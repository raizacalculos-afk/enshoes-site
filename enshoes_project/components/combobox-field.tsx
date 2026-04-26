'use client'

import { useState, useRef, useEffect } from 'react'
import { Check, ChevronDown, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ComboboxFieldProps {
  value: string
  onChange: (value: string) => void
  options: string[]
  defaultOptions?: string[]
  placeholder?: string
  disabled?: boolean
  className?: string
  allowCustom?: boolean
  label?: string
}

export function ComboboxField({
  value,
  onChange,
  options = [],
  defaultOptions = [],
  placeholder = 'Selecione ou digite...',
  disabled = false,
  className,
  allowCustom = true,
  label
}: ComboboxFieldProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Combina opções do banco com opções padrão, removendo duplicatas
  const safeOptions = Array.isArray(options) ? options : []
  const safeDefaultOptions = Array.isArray(defaultOptions) ? defaultOptions : []

  // Combina opções do banco com opções padrão, removendo duplicatas e valores vazios
  const allOptions = Array.from(new Set([...safeDefaultOptions, ...safeOptions]))
    .filter((opt): opt is string => typeof opt === 'string' && opt.trim() !== '')

  // Filtra opções baseado na busca
  const filteredOptions = allOptions.filter(opt =>
    opt.toLowerCase().includes(search.toLowerCase())
  )
  
  // Verifica se o valor digitado é novo (não existe nas opções)
  const isNewValue = search.trim() !== '' && 
    !allOptions.some(opt => opt.toLowerCase() === search.toLowerCase())

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSelect = (selectedValue: string) => {
    onChange(selectedValue)
    setSearch('')
    setIsOpen(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSearch = e.target.value
    setSearch(newSearch)
    setIsOpen(true)
    
    // Se allowCustom, atualiza o valor em tempo real
    if (allowCustom) {
      onChange(newSearch)
    }
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    setSearch(value)
  }

  const handleClear = () => {
    onChange('')
    setSearch('')
    inputRef.current?.focus()
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <div className="relative">
        <Input
          ref={inputRef}
          value={isOpen ? search : value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          placeholder={placeholder}
          disabled={disabled}
          className="bg-background pr-16"
        />
        <div className="absolute right-1 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={handleClear}
              disabled={disabled}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => {
              if (!disabled) {
                setIsOpen(!isOpen)
                if (!isOpen) setSearch(value)
              }
            }}
            disabled={disabled}
          >
            <ChevronDown className={cn('h-4 w-4 transition-transform', isOpen && 'rotate-180')} />
          </Button>
        </div>
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 w-full max-h-60 overflow-auto rounded-md border border-border bg-popover shadow-lg">
          {filteredOptions.length === 0 && !isNewValue && (
            <div className="p-3 text-sm text-muted-foreground text-center">
              Nenhuma opção encontrada
            </div>
          )}
          
          {/* Opção para adicionar novo valor */}
          {allowCustom && isNewValue && (
            <button
              type="button"
              className="w-full p-3 text-left text-sm hover:bg-accent flex items-center gap-2 border-b border-border bg-primary/5"
              onClick={() => handleSelect(search.trim())}
            >
              <span className="text-primary font-medium">+ Adicionar:</span>
              <span className="font-semibold">{search.trim()}</span>
            </button>
          )}
          
          {/* Lista de opções */}
          {filteredOptions.map((option) => (
            <button
              key={option}
              type="button"
              className={cn(
                'w-full p-3 text-left text-sm hover:bg-accent flex items-center justify-between',
                option.toLowerCase() === value.toLowerCase() && 'bg-accent'
              )}
              onClick={() => handleSelect(option)}
            >
              <span>{option}</span>
              {option.toLowerCase() === value.toLowerCase() && (
                <Check className="h-4 w-4 text-primary" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// Select simples com opções fixas
interface SimpleSelectProps {
  value: string
  onChange: (value: string) => void
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

export function SimpleSelect({
  value,
  onChange,
  options = [],
  placeholder = 'Selecione...',
  disabled = false,
  className
}: SimpleSelectProps) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={cn(
        'w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring',
        disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {(Array.isArray(options) ? options : []).map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.label}
        </option>
      ))}
    </select>
  )
}
