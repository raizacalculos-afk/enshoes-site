import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { Ruler, Footprints } from 'lucide-react'

const sizeChart = [
  { br: 34, cm: 22.5, us: 4 },
  { br: 35, cm: 23.0, us: 4.5 },
  { br: 36, cm: 23.5, us: 5 },
  { br: 37, cm: 24.0, us: 6 },
  { br: 38, cm: 24.5, us: 6.5 },
  { br: 39, cm: 25.5, us: 7.5 },
  { br: 40, cm: 26.0, us: 8 },
  { br: 41, cm: 26.5, us: 8.5 },
  { br: 42, cm: 27.5, us: 9.5 },
  { br: 43, cm: 28.0, us: 10 },
  { br: 44, cm: 28.5, us: 10.5 },
]

export default function GuiaDeMedidasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      
      <main className="flex-1">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-3">
              <Ruler className="h-8 w-8 text-primary" />
              Guia de Medidas
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Encontre o tamanho perfeito para você
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl">
            {/* How to Measure */}
            <div className="bg-card rounded-lg border border-border p-6 md:p-8 mb-8">
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Footprints className="h-5 w-5 text-primary" />
                Como Medir seu Pé
              </h2>
              <ol className="list-decimal list-inside space-y-3 text-muted-foreground">
                <li>
                  <span className="text-foreground">Coloque uma folha de papel no chão</span> e apoie o pé sobre ela, encostando o calcanhar na parede.
                </li>
                <li>
                  <span className="text-foreground">Marque a ponta do dedo mais longo</span> com uma caneta ou lápis.
                </li>
                <li>
                  <span className="text-foreground">Meça a distância</span> do início do papel (onde está o calcanhar) até a marca que você fez.
                </li>
                <li>
                  <span className="text-foreground">Compare com a tabela abaixo</span> para encontrar seu número ideal.
                </li>
              </ol>
              <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                <p className="text-sm text-primary">
                  <strong>Dica:</strong> Se a medida do seu pé ficar entre dois tamanhos, escolha sempre o maior para maior conforto.
                </p>
              </div>
            </div>

            {/* Size Table */}
            <div className="bg-card rounded-lg border border-border overflow-hidden">
              <div className="p-6">
                <h2 className="text-xl font-semibold mb-4">Tabela de Tamanhos</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="bg-secondary">
                      <th className="px-6 py-4 text-left font-semibold">Brasil (BR)</th>
                      <th className="px-6 py-4 text-left font-semibold">Centímetros (cm)</th>
                      <th className="px-6 py-4 text-left font-semibold">Estados Unidos (US)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sizeChart.map((size, index) => (
                      <tr 
                        key={size.br}
                        className={index % 2 === 0 ? 'bg-background' : 'bg-card'}
                      >
                        <td className="px-6 py-4 font-medium text-primary">{size.br}</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.cm.toFixed(1)}</td>
                        <td className="px-6 py-4 text-muted-foreground">{size.us}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tips */}
            <div className="mt-8 grid md:grid-cols-2 gap-6">
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-3 text-primary">Meça no Final do Dia</h3>
                <p className="text-sm text-muted-foreground">
                  Os pés tendem a inchar ao longo do dia. Meça no final da tarde ou à noite para obter a medida mais precisa.
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-3 text-primary">Use Meias</h3>
                <p className="text-sm text-muted-foreground">
                  Ao medir, use as meias que você normalmente usaria com tênis para uma medida mais realista.
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-3 text-primary">Meça os Dois Pés</h3>
                <p className="text-sm text-muted-foreground">
                  É comum ter pés de tamanhos diferentes. Meça os dois e use a maior medida como referência.
                </p>
              </div>
              <div className="bg-card rounded-lg border border-border p-6">
                <h3 className="font-semibold mb-3 text-primary">Dúvidas?</h3>
                <p className="text-sm text-muted-foreground">
                  Entre em contato conosco pelo WhatsApp. Nossa equipe está pronta para ajudá-lo a encontrar o tamanho ideal!
                </p>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
      <WhatsAppButton />
    </div>
  )
}
