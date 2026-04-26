import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button'
import { CartDrawer } from '@/components/cart-drawer'
import { RefreshCcw, Truck, Shield, FileText } from 'lucide-react'

export default function PoliticasPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      
      <main className="flex-1">
        <section className="py-12 bg-card border-b border-border">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold text-center flex items-center justify-center gap-3">
              <FileText className="h-8 w-8 text-primary" />
              Políticas da Loja
            </h1>
            <p className="text-muted-foreground text-center mt-2">
              Conheça nossas políticas de trocas, envio e privacidade
            </p>
          </div>
        </section>

        <section className="py-12">
          <div className="container mx-auto px-4 max-w-4xl space-y-8">
            {/* Trocas e Devoluções */}
            <div id="trocas" className="bg-card rounded-lg border border-border p-6 md:p-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <RefreshCcw className="h-6 w-6 text-primary" />
                Trocas e Devoluções
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Na <span className="text-primary font-semibold">EN SHOES</span>, queremos que você fique 100% satisfeito com sua compra. Por isso, oferecemos políticas claras e justas para trocas e devoluções.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Prazo para Troca</h3>
                <p>
                  Você tem até <strong className="text-foreground">7 dias corridos</strong> após o recebimento do produto para solicitar a troca ou devolução, conforme o Código de Defesa do Consumidor.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Condições para Troca</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>O produto deve estar em sua embalagem original</li>
                  <li>Não pode ter sido usado (exceto para experimentação)</li>
                  <li>Deve estar em perfeitas condições, sem danos ou sujeiras</li>
                  <li>A etiqueta original deve estar intacta</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">Como Solicitar</h3>
                <p>
                  Entre em contato conosco pelo WhatsApp informando o número do pedido e o motivo da troca. Nossa equipe irá orientá-lo sobre os próximos passos.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Custos de Frete</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Defeito de fabricação:</strong> O frete de devolução é por nossa conta</li>
                  <li><strong>Troca de tamanho/modelo:</strong> O custo do frete é responsabilidade do cliente</li>
                </ul>
              </div>
            </div>

            {/* Política de Envio */}
            <div id="envio" className="bg-card rounded-lg border border-border p-6 md:p-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Truck className="h-6 w-6 text-primary" />
                Política de Envio
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  Enviamos para todo o Brasil através dos Correios, oferecendo duas modalidades de frete.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Modalidades de Envio</h3>
                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">PAC</h4>
                    <p className="text-sm mt-1">Prazo: 8 a 12 dias úteis</p>
                    <p className="text-sm">Econômico e com rastreamento</p>
                  </div>
                  <div className="bg-secondary/50 rounded-lg p-4">
                    <h4 className="font-semibold text-foreground">SEDEX</h4>
                    <p className="text-sm mt-1">Prazo: 3 a 5 dias úteis</p>
                    <p className="text-sm">Entrega expressa com rastreamento</p>
                  </div>
                </div>

                <h3 className="text-lg font-semibold text-foreground mt-6">Prazo de Postagem</h3>
                <p>
                  Após a confirmação do pagamento, o pedido é despachado em até <strong className="text-foreground">2 dias úteis</strong>.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Rastreamento</h3>
                <p>
                  Você receberá o código de rastreamento via WhatsApp assim que o pedido for postado. Você pode acompanhar a entrega diretamente no site dos Correios.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Observações</h3>
                <ul className="list-disc list-inside space-y-2">
                  <li>Os prazos de entrega começam a contar a partir da postagem</li>
                  <li>O prazo pode variar de acordo com a região de destino</li>
                  <li>Em períodos de alta demanda (Black Friday, Natal), os prazos podem ser estendidos</li>
                </ul>
              </div>
            </div>

            {/* Privacidade */}
            <div id="privacidade" className="bg-card rounded-lg border border-border p-6 md:p-8 scroll-mt-24">
              <h2 className="text-2xl font-semibold mb-6 flex items-center gap-3">
                <Shield className="h-6 w-6 text-primary" />
                Política de Privacidade
              </h2>
              
              <div className="space-y-4 text-muted-foreground">
                <p>
                  A <span className="text-primary font-semibold">EN SHOES</span> está comprometida com a proteção dos seus dados pessoais. Esta política descreve como coletamos, usamos e protegemos suas informações.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Dados Coletados</h3>
                <p>
                  Coletamos apenas as informações necessárias para processar seu pedido:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Nome completo</li>
                  <li>Número de WhatsApp</li>
                  <li>Endereço de entrega (CEP, cidade, estado, endereço)</li>
                  <li>E-mail (opcional)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">Uso dos Dados</h3>
                <p>
                  Seus dados são utilizados exclusivamente para:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Processar e enviar seu pedido</li>
                  <li>Entrar em contato sobre o status da compra</li>
                  <li>Enviar informações sobre promoções (apenas com seu consentimento)</li>
                </ul>

                <h3 className="text-lg font-semibold text-foreground mt-6">Proteção dos Dados</h3>
                <p>
                  Utilizamos medidas de segurança para proteger suas informações contra acesso não autorizado, alteração ou destruição.
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Compartilhamento</h3>
                <p>
                  Não vendemos, alugamos ou compartilhamos seus dados pessoais com terceiros, exceto quando necessário para processar seu pedido (ex: Correios para entrega).
                </p>

                <h3 className="text-lg font-semibold text-foreground mt-6">Seus Direitos</h3>
                <p>
                  Você tem direito a:
                </p>
                <ul className="list-disc list-inside space-y-2 mt-2">
                  <li>Solicitar acesso aos seus dados pessoais</li>
                  <li>Solicitar a correção de dados incorretos</li>
                  <li>Solicitar a exclusão dos seus dados</li>
                </ul>
                <p className="mt-4">
                  Para exercer esses direitos, entre em contato conosco pelo WhatsApp.
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
