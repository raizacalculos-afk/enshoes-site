export const dynamic = "force-dynamic"
export const revalidate = 0

import Link from 'next/link'

export default function NewProductPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
      <h1 className="text-2xl font-bold mb-4">
        Cadastro de produto temporariamente indisponível
      </h1>
      <p className="text-muted-foreground mb-6">
        Esta funcionalidade está em manutenção.
      </p>
      <Link
        href="/admin/produtos"
        className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
      >
        Voltar para produtos
      </Link>
    </div>
  )
}
