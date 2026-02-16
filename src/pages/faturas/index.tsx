import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import InvoiceModal from '@/components/Faturas/InvoiceModal'
import { Fatura, Cliente } from '@/types'
import { formatCurrency, formatDate, generateWhatsappLink } from '@/utils/formatters'
import { faturaService } from '@/services/faturaService'
import { clienteService } from '@/services/clienteService'

export default function FaturasPage() {
  const [selectedMonth, setSelectedMonth] = useState('2025-12')
  const [selectedInvoice, setSelectedInvoice] = useState<Fatura | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState<Cliente | null>(null)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingFatura, setEditingFatura] = useState<Fatura | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  // Filtros
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('todos')
  const [filterDay, setFilterDay] = useState<string>('todos')

  // Carregar do Supabase
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [faturas, setFaturas] = useState<Fatura[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      console.log('\n📥 [DEBUG] Carregando dados do Supabase...')
      setLoading(true)

      const [clientesData, faturasData] = await Promise.all([
        clienteService.getAll(),
        faturaService.getAll()
      ])

      console.log(`✅ [DEBUG] Clientes carregados: ${clientesData.length}`)
      console.log(`✅ [DEBUG] Faturas carregadas: ${faturasData.length}`)
      console.log(`\n👥 [DEBUG] Clientes ativos:`, clientesData.filter(c => c.ativo).map(c => ({
        id: c.id,
        nome: c.nome,
        ativo: c.ativo,
        dia_vencimento: c.dia_vencimento,
        valor_mensalidade: c.valor_mensalidade
      })))

      setClientes(clientesData)
      setFaturas(faturasData)
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao carregar dados:', error)
      console.error('❌ [DEBUG] Detalhes:', JSON.stringify(error, null, 2))
      showNotification('Erro ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const generateInvoices = async () => {
    try {
      console.log('🚀 [DEBUG] Iniciando geração de faturas...')
      const [year, month] = selectedMonth.split('-')
      console.log(`📅 [DEBUG] Período selecionado: ${year}-${month}`)
      console.log(`👥 [DEBUG] Total de clientes cadastrados: ${clientes.length}`)

      let count = 0
      const newInvoices: Omit<Fatura, 'id' | 'numero_fatura' | 'created_at' | 'updated_at'>[] = []

      // Função auxiliar para obter o último dia do mês
      const getLastDayOfMonth = (year: number, month: number): number => {
        // Cria uma data no primeiro dia do mês seguinte e subtrai 1 dia
        return new Date(year, month, 0).getDate()
      }

      for (const cliente of clientes) {
        console.log(`\n🔍 [DEBUG] Processando cliente: ${cliente.nome} (ID: ${cliente.id})`)
        console.log(`   ↳ Ativo: ${cliente.ativo}`)

        if (!cliente.ativo) {
          console.log(`   ⚠️ [DEBUG] Cliente inativo - pulando...`)
          continue
        }

        console.log(`   ↳ Dia vencimento: ${cliente.dia_vencimento}`)
        console.log(`   ↳ Valor mensalidade: R$ ${cliente.valor_mensalidade}`)
        console.log(`   ↳ Quantidade veículos: ${cliente.veiculos?.length || 1}`)

        // Validar e ajustar o dia de vencimento para o mês selecionado
        const yearNum = parseInt(year)
        const monthNum = parseInt(month)
        const lastDayOfMonth = getLastDayOfMonth(yearNum, monthNum)
        const diaVencimento = parseInt(cliente.dia_vencimento)

        // Se o dia de vencimento for maior que o último dia do mês, usar o último dia
        const diaAjustado = Math.min(diaVencimento, lastDayOfMonth)

        console.log(`   ↳ Último dia do mês ${month}/${year}: ${lastDayOfMonth}`)
        if (diaVencimento > lastDayOfMonth) {
          console.log(`   ⚠️ [DEBUG] Dia ${diaVencimento} não existe em ${month}/${year}. Ajustando para ${diaAjustado}`)
        }

        const dueDate = `${year}-${month}-${diaAjustado.toString().padStart(2, '0')}`
        console.log(`   ↳ Data vencimento calculada: ${dueDate}`)

        console.log(`   🔎 [DEBUG] Verificando se fatura já existe...`)
        const exists = await faturaService.checkExists(cliente.id, dueDate)
        console.log(`   ↳ Fatura já existe? ${exists ? 'SIM ✅' : 'NÃO ❌'}`)

        if (!exists) {
          const novaFatura = {
            cliente_id: cliente.id,
            cliente_nome: cliente.nome,
            descricao: 'Loc. Equipamento e Software para Rastreamento Veicular',
            valor: cliente.valor_mensalidade,
            quantidade_veiculos: cliente.veiculos?.length || 1,
            data_vencimento: dueDate,
            data_emissao: new Date().toISOString().split('T')[0],
            status: 'pendente',
            enviado_whatsapp: false
          }
          console.log(`   ✅ [DEBUG] Fatura adicionada para criação:`, novaFatura)
          newInvoices.push(novaFatura)
          count++
        }
      }

      console.log(`\n📊 [DEBUG] Resumo da geração:`)
      console.log(`   ↳ Total de faturas a serem criadas: ${count}`)
      console.log(`   ↳ Faturas preparadas:`, newInvoices)

      if (count > 0) {
        console.log(`\n💾 [DEBUG] Salvando ${count} fatura(s) no banco de dados...`)
        await faturaService.createMany(newInvoices)
        console.log(`✅ [DEBUG] Faturas salvas com sucesso!`)

        console.log(`🔄 [DEBUG] Recarregando dados...`)
        await loadData()
        console.log(`✅ [DEBUG] Dados recarregados!`)

        showNotification(`${count} fatura(s) gerada(s) com sucesso!`)
      } else {
        console.log(`ℹ️ [DEBUG] Nenhuma fatura nova para criar.`)
        showNotification('Todas as faturas deste mês já foram geradas.')
      }
    } catch (error) {
      console.error('❌ [DEBUG] Erro ao gerar faturas:', error)
      console.error('❌ [DEBUG] Stack trace:', (error as Error).stack)
      console.error('❌ [DEBUG] Detalhes do erro:', JSON.stringify(error, null, 2))
      showNotification('Erro ao gerar faturas')
    }
  }

  const toggleStatus = async (id: string) => {
    try {
      await faturaService.toggleStatus(id)
      await loadData()
      showNotification('Status atualizado!')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showNotification('Erro ao atualizar status')
    }
  }

  const handlePrintInvoice = (fatura: Fatura) => {
    const cliente = clientes.find(c => c.id === fatura.cliente_id)
    if (cliente) {
      setSelectedInvoice(fatura)
      setSelectedCustomer(cliente)
    }
  }

  const handleSendWhatsapp = async (fatura: Fatura) => {
    try {
      const cliente = clientes.find(c => c.id === fatura.cliente_id)
      if (cliente) {
        const link = generateWhatsappLink(cliente.telefone, cliente.nome, fatura.data_vencimento, fatura.valor)
        window.open(link, '_blank')

        await faturaService.markWhatsappSent(fatura.id)
        await loadData()
      }
    } catch (error) {
      console.error('Erro ao marcar WhatsApp:', error)
    }
  }

  const handleEditFatura = (fatura: Fatura) => {
    setEditingFatura(fatura)
    setShowEditModal(true)
  }

  const handleUpdateFatura = async () => {
    if (!editingFatura) return

    try {
      await faturaService.update(editingFatura.id, editingFatura)
      await loadData()
      setShowEditModal(false)
      setEditingFatura(null)
      showNotification('Fatura atualizada com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar fatura:', error)
      showNotification('Erro ao atualizar fatura')
    }
  }

  const handleDeleteFatura = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta fatura? Esta ação não pode ser desfeita.')) {
      try {
        await faturaService.delete(id)
        await loadData()
        showNotification('Fatura excluída com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir fatura:', error)
        showNotification('Erro ao excluir fatura')
      }
    }
  }

  // Filtrar faturas por mês, nome do cliente, status e dia de vencimento
  const filteredFaturas = faturas
    .filter(f => f.data_vencimento.startsWith(selectedMonth))
    .filter(f => {
      // Filtro por nome do cliente
      if (searchTerm) {
        return f.cliente_nome.toLowerCase().includes(searchTerm.toLowerCase())
      }
      return true
    })
    .filter(f => {
      // Filtro por status
      if (filterStatus !== 'todos') {
        return f.status === filterStatus
      }
      return true
    })
    .filter(f => {
      // Filtro por dia de vencimento
      if (filterDay !== 'todos') {
        const dia = new Date(f.data_vencimento + 'T00:00:00').getDate()
        return dia.toString() === filterDay
      }
      return true
    })

  const totalPendente = filteredFaturas
    .filter(f => f.status === 'pendente')
    .reduce((acc, f) => acc + f.valor, 0)

  const totalPago = filteredFaturas
    .filter(f => f.status === 'pago')
    .reduce((acc, f) => acc + f.valor, 0)

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando faturas...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Notificação */}
        {notification && (
          <div className="fixed top-4 right-4 bg-green-600 text-white px-4 py-3 rounded-lg shadow-lg z-50 animate-bounce">
            ✓ {notification}
          </div>
        )}

        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Faturas</h1>
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <input
              type="month"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <button
              onClick={generateInvoices}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
            >
              🔄 Gerar Faturas
            </button>
          </div>
        </div>

        {/* Barra de Filtros */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Buscar por Cliente
              </label>
              <input
                type="text"
                placeholder="Digite o nome do cliente..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dia de Vencimento
              </label>
              <select
                value={filterDay}
                onChange={(e) => setFilterDay(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="todos">Todos os Dias</option>
                {Array.from({ length: 31 }, (_, i) => i + 1).map(day => (
                  <option key={day} value={day.toString()}>Dia {day}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>
          {(searchTerm || filterStatus !== 'todos' || filterDay !== 'todos') && (
            <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-gray-600">
              <span className="font-medium">Filtros ativos:</span>
              {searchTerm && (
                <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
                  Cliente: &quot;{searchTerm}&quot;
                </span>
              )}
              {filterDay !== 'todos' && (
                <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded">
                  Dia: {filterDay}
                </span>
              )}
              {filterStatus !== 'todos' && (
                <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                  Status: {filterStatus}
                </span>
              )}
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFilterStatus('todos')
                  setFilterDay('todos')
                }}
                className="text-red-600 hover:text-red-700 ml-2"
              >
                ✕ Limpar filtros
              </button>
            </div>
          )}
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Faturas</h3>
            <p className="text-3xl font-bold text-primary-600">{filteredFaturas.length}</p>
            <p className="text-sm text-gray-600 mt-2">no período selecionado</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Faturas Pendentes</h3>
            <p className="text-3xl font-bold text-yellow-600">{formatCurrency(totalPendente)}</p>
            <p className="text-sm text-gray-600 mt-2">aguardando pagamento</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Faturas Pagas</h3>
            <p className="text-3xl font-bold text-green-600">{formatCurrency(totalPago)}</p>
            <p className="text-sm text-gray-600 mt-2">já recebidas</p>
          </div>
        </div>

        {/* Tabela de Faturas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Vencimento
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cliente
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    WhatsApp
                  </th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFaturas.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma fatura encontrada para este período. Clique em &quot;Gerar Faturas&quot; para criar.
                    </td>
                  </tr>
                ) : (
                  filteredFaturas.map((fatura) => (
                    <tr key={fatura.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {formatDate(fatura.data_vencimento)}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">
                        {fatura.cliente_nome}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                        {formatCurrency(fatura.valor)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <button
                          onClick={() => toggleStatus(fatura.id)}
                          className={`px-3 py-1 rounded-full text-xs font-bold border-2 transition-colors ${
                            fatura.status === 'pago'
                              ? 'border-green-500 text-green-600 bg-green-50 hover:bg-green-100'
                              : 'border-yellow-500 text-yellow-600 bg-yellow-50 hover:bg-yellow-100'
                          }`}
                        >
                          {fatura.status === 'pago' ? '✓ PAGO' : '⏱ PENDENTE'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        {fatura.enviado_whatsapp ? (
                          <span className="text-green-600 text-xs">✓ Enviado</span>
                        ) : (
                          <span className="text-gray-400 text-xs">Não enviado</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-center">
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => handleSendWhatsapp(fatura)}
                            className="bg-green-600 p-2 rounded text-white hover:bg-green-700 transition-colors"
                            title="Enviar WhatsApp"
                          >
                            💬
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(fatura)}
                            className="bg-blue-600 p-2 rounded text-white hover:bg-blue-700 transition-colors"
                            title="Visualizar/Imprimir Fatura"
                          >
                            🖨️
                          </button>
                          <button
                            onClick={() => handleEditFatura(fatura)}
                            className="bg-yellow-600 p-2 rounded text-white hover:bg-yellow-700 transition-colors"
                            title="Editar Fatura"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => handleDeleteFatura(fatura.id)}
                            className="bg-red-600 p-2 rounded text-white hover:bg-red-700 transition-colors"
                            title="Excluir Fatura"
                          >
                            🗑️
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal de Visualização da Fatura */}
      {selectedInvoice && selectedCustomer && (
        <InvoiceModal
          invoice={selectedInvoice}
          customer={selectedCustomer}
          onClose={() => {
            setSelectedInvoice(null)
            setSelectedCustomer(null)
          }}
        />
      )}

      {/* Modal de Editar Fatura */}
      {showEditModal && editingFatura && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">Editar Fatura</h2>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cliente
                </label>
                <input
                  type="text"
                  value={editingFatura.cliente_nome}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Descrição *
                </label>
                <input
                  type="text"
                  value={editingFatura.descricao}
                  onChange={(e) => setEditingFatura({ ...editingFatura, descricao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={editingFatura.valor}
                  onChange={(e) => setEditingFatura({ ...editingFatura, valor: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Vencimento *
                </label>
                <input
                  type="date"
                  value={editingFatura.data_vencimento}
                  onChange={(e) => setEditingFatura({ ...editingFatura, data_vencimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Data de Emissão *
                </label>
                <input
                  type="date"
                  value={editingFatura.data_emissao}
                  onChange={(e) => setEditingFatura({ ...editingFatura, data_emissao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Observações
                </label>
                <textarea
                  value={editingFatura.observacoes || ''}
                  onChange={(e) => setEditingFatura({ ...editingFatura, observacoes: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingFatura(null)
                }}
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleUpdateFatura}
                className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
              >
                Salvar Alterações
              </button>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
