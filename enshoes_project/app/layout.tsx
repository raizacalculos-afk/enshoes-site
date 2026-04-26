import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { CartProvider } from '@/contexts/cart-context'
import './globals.css'

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'EN SHOES | Tênis de Qualidade com Preço Único',
  description: 'Loja de tênis com preço único de R$ 200,00. Entrega para todo o Brasil via Correios PAC e SEDEX. Pagamento via Mercado Pago.',
  keywords: ['tênis', 'calçados', 'en shoes', 'promoção', 'preço único'],
  openGraph: {
    title: 'EN SHOES | Tênis de Qualidade',
    description: 'Todos os tênis por R$ 200,00. Frete para todo o Brasil!',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="pt-BR" className="bg-background">
      <body className={`${inter.className} antialiased min-h-screen`}>
        <CartProvider>
          {children}
        </CartProvider>
        {process.env.NODE_ENV === 'production' && <Analytics />}
      </body>
    </html>
  )
}
