import { Fatura, Cliente } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'

interface InvoiceModalProps {
  invoice: Fatura | null
  customer: Cliente | null
  onClose: () => void
}

export default function InvoiceModal({ invoice, customer, onClose }: InvoiceModalProps) {
  if (!invoice || !customer) return null

  // Usar quantidade de veículos salva na fatura (histórico preservado)
  const quantidadeVeiculos = invoice.quantidade_veiculos || 1
  const valorUnitario = invoice.valor / quantidadeVeiculos

  const handlePrint = () => {
    window.print()
  }

  return (
    <>
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #invoice-print-content,
          #invoice-print-content * {
            visibility: visible;
          }
          #invoice-print-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            background: white;
            padding: 20px;
            margin: 0;
            box-shadow: none;
          }
        }
      `}</style>
      <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
        <div id="invoice-print-content" className="bg-white w-full max-w-4xl max-h-[95vh] overflow-y-auto my-2 sm:my-4 p-4 sm:p-8 shadow-2xl relative text-xs sm:text-sm font-sans text-gray-800">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 sm:top-4 sm:right-4 text-gray-500 hover:text-red-500 print:hidden text-2xl font-bold z-10"
        >
          ✕
        </button>

        {/* HEADER */}
        <div className="flex flex-col sm:flex-row justify-between gap-4 border-b-2 border-gray-800 pb-4 mb-4">
          <div className="flex items-center gap-4">
            <div className="w-40 h-28 flex items-center justify-center">
              <img
                src="/logo-tecrastr-new.png"
                alt="Tec Rastreadores Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div>
              <h1 className="font-bold text-xl text-gray-900">TEC RASTREADORES</h1>
              <p className="text-xs text-gray-500 tracking-widest">RASTREAMENTO VEICULAR</p>
            </div>
          </div>
          <div className="text-right">
            <div className="border border-gray-800 p-2 mb-2 inline-block text-center min-w-[120px]">
              <p className="text-xs font-bold">Nº FATURA</p>
              <p className="text-lg font-bold">{invoice.numero_fatura}</p>
            </div>
            <p className="text-sm"><strong>VENCIMENTO:</strong> {formatDate(invoice.data_vencimento)}</p>
            <p className="text-sm">Data de emissão: {formatDate(invoice.data_emissao)}</p>
          </div>
        </div>

        {/* EMISSOR */}
        <div className="mb-6 text-xs">
          <p className="font-bold">TEC RASTREADORES</p>
          <p>Rua 240 nº 400, Sala 02</p>
          <p>CEP: 88220-000 | CONTATO: (47) 99123-4391 | e-mail: comercial@tecrastreadores.com.br</p>
          <p className="mt-1"><strong>CNPJ: 41.054.830/0001-89</strong> | Inscrição Estadual: ISENTO</p>
        </div>

        {/* DESTINATÁRIO */}
        <div className="border border-gray-400 p-4 mb-6 bg-gray-50">
          <h3 className="font-bold text-gray-900 mb-2 border-b border-gray-300 pb-1">DESTINATÁRIO</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p><span className="font-bold">Nome/Razão Social:</span> {customer.nome}</p>
              <p><span className="font-bold">Endereço:</span> {customer.endereco}</p>
              <p><span className="font-bold">Cidade:</span> {customer.cidade}</p>
            </div>
            <div>
              <p><span className="font-bold">CNPJ:</span> {customer.cnpj}</p>
              <p><span className="font-bold">Bairro:</span> {customer.bairro}</p>
              <p><span className="font-bold">UF:</span> {customer.estado}</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <p className="font-bold mb-1">Referente a solicitação de fornecimento</p>
          <p className="text-gray-600">Fornecimento de equipamento e software para rastreamento veicular.</p>
        </div>

        {/* DADOS BANCÁRIOS */}
        <div className="mb-6 bg-gray-100 p-3 rounded">
          <p className="font-bold">Dados Bancários:</p>
          <p className="text-lg font-bold">PIX CELULAR: (47) 99123-4391</p>
          <p className="text-xs text-gray-500 mt-1">Ou Boleto.</p>
        </div>

        {/* TABELA */}
        <table className="w-full mb-8 border-collapse border border-gray-800">
          <thead className="bg-gray-200">
            <tr>
              <th className="border border-gray-800 p-2 text-left">Descrição</th>
              <th className="border border-gray-800 p-2 text-center">Qtde.</th>
              <th className="border border-gray-800 p-2 text-right">Vlr Unit.</th>
              <th className="border border-gray-800 p-2 text-right">TOTAL</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-gray-800 p-2">{invoice.descricao}</td>
              <td className="border border-gray-800 p-2 text-center">{quantidadeVeiculos}</td>
              <td className="border border-gray-800 p-2 text-right">{formatCurrency(valorUnitario)}</td>
              <td className="border border-gray-800 p-2 text-right font-bold">{formatCurrency(invoice.valor)}</td>
            </tr>
          </tbody>
        </table>

        {/* TOTAIS */}
        <div className="flex justify-end mb-8">
          <div className="w-1/2">
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span>Retenção de ISSQN:</span>
              <span>NÃO</span>
            </div>
            <div className="flex justify-between border-b border-gray-300 py-1">
              <span>Valor da Retenção:</span>
              <span>R$ 0,00</span>
            </div>
            <div className="flex justify-between py-2 text-lg font-bold bg-gray-200 px-2 mt-2">
              <span>TOTAL GERAL:</span>
              <span>{formatCurrency(invoice.valor)}</span>
            </div>
          </div>
        </div>

        {/* RODAPÉ LEGAL */}
        <div className="text-[10px] text-gray-500 text-center border-t border-gray-300 pt-4 mt-auto">
          <p>Operação não sujeita a emissão de nota fiscal de serviço - Vetada a cobrança de ISSQN conforme lei complementar 116/2003</p>
          <p>Documento emitido por ME ou EPP Optante pelo Simples Nacional</p>
          <p className="mt-2 font-bold">ITAPEMA - SC, {new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <div className="sticky bottom-0 bg-white border-t border-gray-300 p-3 sm:p-4 print:hidden mt-6">
          <button
            onClick={handlePrint}
            className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded flex items-center justify-center gap-2 hover:bg-blue-700 text-sm sm:text-base"
          >
            🖨️ Imprimir / Salvar PDF
          </button>
        </div>
        </div>
      </div>
    </>
  )
}
