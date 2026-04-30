import Link from 'next/link'
import { LayoutDashboard, Package, ShoppingCart, Users, Settings, DollarSign, ShoppingBasket, LogOut } from 'lucide-react'
import { LogoutButton } from '@/components/admin/logout-button'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-card border-r border-border flex-shrink-0 hidden md:flex md:flex-col">
        <div className="p-6 border-b border-border">
          <Link href="/admin" className="text-xl font-bold text-primary neon-text">
            EN SHOES Admin
          </Link>
        </div>
        <nav className="p-4 flex-1">
          <ul className="space-y-2">
            <li>
              <Link 
                href="/admin"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <LayoutDashboard className="h-5 w-5" />
                Dashboard
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/produtos"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Package className="h-5 w-5" />
                Produtos
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/pedidos"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ShoppingCart className="h-5 w-5" />
                Pedidos
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/clientes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Users className="h-5 w-5" />
                Clientes
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/carrinhos"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <ShoppingBasket className="h-5 w-5" />
                Carrinhos
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/financeiro"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <DollarSign className="h-5 w-5" />
                Financeiro
              </Link>
            </li>
            <li>
              <Link 
                href="/admin/configuracoes"
                className="flex items-center gap-3 px-4 py-3 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
              >
                <Settings className="h-5 w-5" />
                Configurações
              </Link>
            </li>
          </ul>
        </nav>
        <div className="p-4 border-t border-border space-y-2">
          <Link 
            href="/"
            className="block text-center text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            ← Voltar para a loja
          </Link>
          <LogoutButton />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
