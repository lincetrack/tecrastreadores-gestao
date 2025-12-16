import { PropostaComercial } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { useRef } from 'react'
import jsPDF from 'jspdf'
import html2canvas from 'html2canvas'

interface PropostaModalProps {
  proposta: PropostaComercial
  onClose: () => void
}

export default function PropostaModal({ proposta, onClose }: PropostaModalProps) {
  const contentRef = useRef<HTMLDivElement>(null)

  const handleDownloadPDF = async () => {
    if (!contentRef.current) return

    try {
      // Capturar o conteúdo como imagem
      const canvas = await html2canvas(contentRef.current, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff'
      })

      const imgData = canvas.toDataURL('image/png')

      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      const pdfWidth = pdf.internal.pageSize.getWidth()
      const pdfHeight = pdf.internal.pageSize.getHeight()
      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight)
      const imgX = (pdfWidth - imgWidth * ratio) / 2

      // Calcular quantas páginas são necessárias
      const pageHeight = pdfHeight
      const totalPages = Math.ceil((imgHeight * ratio) / pageHeight)

      for (let i = 0; i < totalPages; i++) {
        if (i > 0) {
          pdf.addPage()
        }

        const position = -(pageHeight * i)
        pdf.addImage(imgData, 'PNG', imgX, position, imgWidth * ratio, imgHeight * ratio)
      }

      // Baixar o PDF
      pdf.save(`Proposta_${String(proposta.numero_proposta).padStart(4, '0')}.pdf`)
    } catch (error) {
      console.error('Erro ao gerar PDF:', error)
      alert('Erro ao gerar PDF. Por favor, tente novamente.')
    }
  }

  const recursos = [
    'Acesso ilimitado ao portal de rastreamento, via Internet, 24hs dia/7dias semana',
    'Plataforma com acesso exclusivo e restrito para sua Empresa através de um link enviado com login e senha, e também pelo nosso aplicativo para celular',
    'Central 24 Horas, 7 dias por semana, para atendimento em caso de Roubo ou Furto',
    'Gestão de manutenção preventiva',
    'Opções de Mapas detalhado',
    'Relatórios das ruas percorridas pelo veículo com velocidade',
    'Relatórios com históricos dos veículos por data ou período',
    'Criação de Cercas Eletrônicas',
    'Relatório de deslocamento e Paradas',
    'Cobertura via GPS em todo território nacional',
    'Mapas com sobreposição de camadas',
    'Envio de alertas via Aplicativo'
  ]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        {/* Botões de ação */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center z-10">
          <h2 className="text-xl font-bold text-gray-800">Proposta Comercial #{String(proposta.numero_proposta).padStart(4, '0')}</h2>
          <div className="flex gap-2">
            <button
              onClick={handleDownloadPDF}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              📥 Baixar PDF
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Fechar
            </button>
          </div>
        </div>

        {/* Conteúdo da Proposta */}
        <div ref={contentRef} className="p-6 bg-white" style={{ maxWidth: '800px', fontSize: '13px' }}>
          {/* Cabeçalho com Logo */}
          <div className="flex justify-between items-start mb-4 border-b-2 border-primary-600 pb-3">
            <div className="flex items-center gap-3">
              <div className="w-28 h-20 flex items-center justify-center">
                <img
                  src="/logo-tecrastr-new.png"
                  alt="Tec Rastreadores Logo"
                  className="w-full h-full object-contain"
                />
              </div>
              <div>
                <h1 className="font-bold text-base text-gray-900">TEC RASTREADORES</h1>
                <p className="text-xs text-gray-500 tracking-wider">RASTREAMENTO VEICULAR</p>
                <p className="text-xs text-gray-500">CNPJ: 41.054.830/0001-89</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs text-gray-600">Proposta Comercial</p>
              <p className="text-xl font-bold text-gray-800">#{String(proposta.numero_proposta).padStart(4, '0')}</p>
              <p className="text-xs text-gray-500">Data: {formatDate(proposta.created_at.split('T')[0])}</p>
              <p className="text-xs text-gray-500">Validade: {formatDate(proposta.data_validade)}</p>
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800 mb-2 bg-gray-100 p-1.5 rounded">
              DADOS DO CLIENTE - {proposta.tipo_pessoa === 'fisica' ? 'PESSOA FÍSICA' : 'PESSOA JURÍDICA'}
            </h3>
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div>
                <p className="text-gray-600">{proposta.tipo_pessoa === 'fisica' ? 'Nome' : 'Empresa'}</p>
                <p className="font-semibold text-gray-800">{proposta.prospect_nome}</p>
              </div>
              <div>
                <p className="text-gray-600">Contato</p>
                <p className="font-semibold text-gray-800">{proposta.prospect_contato}</p>
              </div>
              <div>
                <p className="text-gray-600">Telefone</p>
                <p className="font-semibold text-gray-800">{proposta.prospect_telefone}</p>
              </div>
              <div>
                <p className="text-gray-600">{proposta.tipo_pessoa === 'fisica' ? 'CPF' : 'CNPJ'}</p>
                <p className="font-semibold text-gray-800">{proposta.prospect_documento}</p>
              </div>
              <div>
                <p className="text-gray-600">Localização</p>
                <p className="font-semibold text-gray-800">{proposta.prospect_cidade}/{proposta.prospect_estado}</p>
              </div>
              <div>
                <p className="text-gray-600">Email</p>
                <p className="font-semibold text-gray-800 text-xs">{proposta.prospect_email}</p>
              </div>
            </div>
          </div>

          {/* Detalhes da Proposta */}
          <div className="mb-3">
            <h3 className="text-sm font-bold text-gray-800 mb-2 bg-gray-100 p-1.5 rounded">DETALHES DA PROPOSTA</h3>

            <div className="bg-primary-50 p-3 rounded mb-2">
              <div className="grid grid-cols-4 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Equipamento</p>
                  <p className="font-bold text-gray-800">{proposta.tipo_equipamento}</p>
                </div>
                <div>
                  <p className="text-gray-600">Plano</p>
                  <p className="font-bold text-gray-800">{proposta.plano}</p>
                </div>
                <div>
                  <p className="text-gray-600">Veículos</p>
                  <p className="font-bold text-gray-800">{proposta.quantidade_veiculos}</p>
                </div>
                <div>
                  <p className="text-gray-600">Valor Unit.</p>
                  <p className="font-bold text-gray-800">{formatCurrency(proposta.valor_mensal)}/mês</p>
                </div>
              </div>
            </div>

            <div className="bg-white border-2 border-primary-600 p-3 rounded">
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div>
                  <p className="text-gray-600">Valor Mensal Total</p>
                  <p className="text-xl font-bold text-primary-600">
                    {formatCurrency(proposta.valor_mensal * proposta.quantidade_veiculos)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Instalação</p>
                  <p className="text-xl font-bold text-green-600">
                    {proposta.instalacao_gratuita ? 'GRATUITA' : formatCurrency(proposta.valor_instalacao || 0)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Permanência</p>
                  <p className="text-xl font-bold text-gray-800">{proposta.prazo_permanencia} meses</p>
                </div>
              </div>
            </div>
          </div>

          {/* Observações - LOGO ABAIXO DOS VALORES */}
          {proposta.observacoes && (
            <div className="mb-2">
              <h3 className="text-sm font-bold text-gray-800 mb-1.5 bg-gray-100 p-1.5 rounded">OBSERVAÇÕES</h3>
              <p className="text-xs text-gray-700 whitespace-pre-wrap">{proposta.observacoes}</p>
            </div>
          )}

          {/* SEÇÃO: Instalação e Sinal - COMPACTA */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-800 mb-1.5 bg-gray-100 p-1.5 rounded">INSTALAÇÃO E SINAL GPS/GPRS</h3>
            <div className="bg-blue-50 p-2 rounded text-xs space-y-1.5">
              <p className="text-gray-700">
                <strong>🔧 Instalação Profissional:</strong> Equipamento estrategicamente posicionado em locais ocultos do veículo,
                garantindo máxima discrição e proteção contra tentativas de remoção.
              </p>
              <p className="text-gray-700">
                <strong>📡 Cobertura Premium:</strong> Tecnologia multi-operadora com conexão simultânea de até 5 operadoras diferentes via Algar Telecom,
                garantindo rastreamento em todo território nacional.
              </p>
            </div>
          </div>

          {/* Recursos Incluídos - COMPACTO */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-800 mb-1.5 bg-gray-100 p-1.5 rounded">RECURSOS INCLUÍDOS</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs">
              {recursos.map((recurso, index) => (
                <div key={index} className="flex items-start gap-1">
                  <span className="text-green-600 font-bold">✓</span>
                  <p className="text-gray-700 leading-tight">{recurso}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Informações Adicionais - COMPLETAS EM 2 COLUNAS */}
          <div className="mb-2">
            <h3 className="text-sm font-bold text-gray-800 mb-1.5 bg-gray-100 p-1.5 rounded">INFORMAÇÕES IMPORTANTES</h3>
            <div className="grid grid-cols-2 gap-x-3 gap-y-0.5 text-xs text-gray-700">
              <p>• <strong>Comodato:</strong> Equipamento em regime de comodato durante o período de contrato</p>
              <p>• <strong>Cobertura Nacional:</strong> Sistema funciona em todo território nacional via GPS/GPRS</p>
              <p>• <strong>Suporte 24/7:</strong> Central de atendimento disponível 24 horas por dia, 7 dias por semana</p>
              <p>• <strong>Aplicativo Mobile:</strong> Acesso via aplicativo iOS e Android incluído</p>
              <p>• <strong>Garantia:</strong> Equipamento com garantia contra defeitos de fabricação</p>
            </div>
          </div>

          {/* Rodapé - COMPACTO */}
          <div className="mt-3 pt-2 border-t border-gray-300">
            <div className="text-center text-xs text-gray-600">
              <p className="font-bold text-gray-800 mb-0.5">TEC RASTREADORES</p>
              <p>CNPJ: 41.054.830/0001-89 | Email: comercial@tecrastreadores.com.br | Tel: (47) 99123-4391</p>
              <p>Rua 240 nº 400, Sala 02 | CEP: 88220-000</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
