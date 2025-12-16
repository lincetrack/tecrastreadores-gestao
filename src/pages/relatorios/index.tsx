import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { Cliente, Fatura, Despesa } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { clienteService } from '@/services/clienteService'
import { faturaService } from '@/services/faturaService'
import { despesaService } from '@/services/despesaService'

type ReportType = 'faturas' | 'despesas' | 'clientes' | 'financeiro'

export default function RelatoriosPage() {
  const [reportType, setReportType] = useState<ReportType | null>(null)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [faturas, setFaturas] = useState<Fatura[]>([])
  const [despesas, setDespesas] = useState<Despesa[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros para relatório de faturas
  const [filterCliente, setFilterCliente] = useState('todos')
  const [filterStatus, setFilterStatus] = useState<'todos' | 'pendente' | 'pago'>('todos')

  useEffect(() => {
    loadData()

    const now = new Date()
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0)
    setStartDate(firstDay.toISOString().split('T')[0])
    setEndDate(lastDay.toISOString().split('T')[0])
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [clientesData, faturasData, despesasData] = await Promise.all([
        clienteService.getAll(),
        faturaService.getAll(),
        despesaService.getAll()
      ])
      setClientes(clientesData)
      setFaturas(faturasData)
      setDespesas(despesasData)
    } catch (error) {
      console.error('Erro ao carregar dados:', error)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  const filterByDate = <T extends { data_vencimento: string }>(items: T[]) => {
    return items.filter(item => {
      const date = new Date(item.data_vencimento)
      const start = new Date(startDate)
      const end = new Date(endDate)
      return date >= start && date <= end
    })
  }

  const renderFaturasReport = () => {
    // Primeiro filtrar por data
    let filteredFaturas = filterByDate(faturas)

    // Depois aplicar filtro de cliente
    if (filterCliente !== 'todos') {
      filteredFaturas = filteredFaturas.filter(f => f.cliente_id === filterCliente)
    }

    // Por último aplicar filtro de status
    if (filterStatus !== 'todos') {
      filteredFaturas = filteredFaturas.filter(f => f.status === filterStatus)
    }

    const totalFaturas = filteredFaturas.reduce((acc, f) => acc + f.valor, 0)
    const totalPagas = filteredFaturas.filter(f => f.status === 'pago').reduce((acc, f) => acc + f.valor, 0)
    const totalPendentes = filteredFaturas.filter(f => f.status === 'pendente').reduce((acc, f) => acc + f.valor, 0)

    // Lista de clientes únicos para o filtro
    const clientesUnicos = Array.from(new Set(faturas.map(f => f.cliente_id)))
      .map(clienteId => {
        const fatura = faturas.find(f => f.cliente_id === clienteId)
        return { id: clienteId, nome: fatura?.cliente_nome || '' }
      })
      .sort((a, b) => a.nome.localeCompare(b.nome))

    const hasActiveFilters = filterCliente !== 'todos' || filterStatus !== 'todos'

    const clearFilters = () => {
      setFilterCliente('todos')
      setFilterStatus('todos')
    }

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Relatório - Visível na impressão */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório de Faturas</h1>
          <p className="text-sm text-gray-600">
            Período: {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
          {filterCliente !== 'todos' && (
            <p className="text-sm text-gray-600">
              Cliente: {clientesUnicos.find(c => c.id === filterCliente)?.nome}
            </p>
          )}
          {filterStatus !== 'todos' && (
            <p className="text-sm text-gray-600">
              Status: {filterStatus === 'pendente' ? 'Pendente' : 'Pago'}
            </p>
          )}
        </div>

        {/* Filtros */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 print:hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
              <select
                value={filterCliente}
                onChange={(e) => setFilterCliente(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="todos">Todos os Clientes</option>
                {clientesUnicos.map(cliente => (
                  <option key={cliente.id} value={cliente.id}>
                    {cliente.nome}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as 'todos' | 'pendente' | 'pago')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
              >
                <option value="todos">Todos os Status</option>
                <option value="pendente">Pendente</option>
                <option value="pago">Pago</option>
              </select>
            </div>
          </div>

          {/* Badges de filtros ativos */}
          {hasActiveFilters && (
            <div className="flex items-center gap-2 mt-4 flex-wrap">
              <span className="text-sm text-gray-600 font-medium">Filtros ativos:</span>
              {filterCliente !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                  Cliente: {clientesUnicos.find(c => c.id === filterCliente)?.nome}
                </span>
              )}
              {filterStatus !== 'todos' && (
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                  Status: {filterStatus === 'pendente' ? 'Pendente' : 'Pago'}
                </span>
              )}
              <button
                onClick={clearFilters}
                className="text-sm text-red-600 hover:text-red-700 underline"
              >
                Limpar filtros
              </button>
            </div>
          )}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-summary-card">
          <div className="bg-blue-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total de Faturas</p>
            <p className="text-2xl font-bold text-blue-600">{formatCurrency(totalFaturas)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Faturas Pagas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPagas)}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Faturas Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">{formatCurrency(totalPendentes)}</p>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-gray-300 print:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredFaturas.map(fatura => (
                <tr key={fatura.id}>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(fatura.data_vencimento)}</td>
                  <td className="border border-gray-300 px-4 py-2">{fatura.cliente_nome}</td>
                  <td className="border border-gray-300 px-4 py-2">{fatura.descricao}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(fatura.valor)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      fatura.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {fatura.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderDespesasReport = () => {
    const filteredDespesas = filterByDate(despesas)
    const totalDespesas = filteredDespesas.reduce((acc, d) => acc + d.valor, 0)
    const totalPagas = filteredDespesas.filter(d => d.status === 'pago').reduce((acc, d) => acc + d.valor, 0)
    const totalPendentes = filteredDespesas.filter(d => d.status === 'pendente').reduce((acc, d) => acc + d.valor, 0)

    const porCategoria = filteredDespesas.reduce((acc, d) => {
      if (!acc[d.categoria]) acc[d.categoria] = 0
      acc[d.categoria] += d.valor
      return acc
    }, {} as Record<string, number>)

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Relatório - Visível na impressão */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório de Despesas</h1>
          <p className="text-sm text-gray-600">
            Período: {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print-summary-card">
          <div className="bg-red-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total de Despesas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Despesas Pagas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalPagas)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Despesas Pendentes</p>
            <p className="text-2xl font-bold text-orange-600">{formatCurrency(totalPendentes)}</p>
          </div>
        </div>

        <div className="bg-white p-4 rounded-lg border border-gray-300 print-no-break">
          <h3 className="font-bold text-lg mb-4">Despesas por Categoria</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 print:grid-cols-4">
            {Object.entries(porCategoria).map(([categoria, valor]) => (
              <div key={categoria} className="text-center p-3 bg-gray-50 rounded print-no-break">
                <p className="text-sm text-gray-600">{categoria}</p>
                <p className="text-lg font-bold text-gray-800">{formatCurrency(valor)}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-gray-300 print:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Data</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Descrição</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Categoria</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Fornecedor</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Valor</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredDespesas.map(despesa => (
                <tr key={despesa.id}>
                  <td className="border border-gray-300 px-4 py-2">{formatDate(despesa.data_vencimento)}</td>
                  <td className="border border-gray-300 px-4 py-2">{despesa.descricao}</td>
                  <td className="border border-gray-300 px-4 py-2">{despesa.categoria}</td>
                  <td className="border border-gray-300 px-4 py-2">{despesa.fornecedor || '-'}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(despesa.valor)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      despesa.status === 'pago' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {despesa.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderClientesReport = () => {
    const clientesAtivos = clientes.filter(c => c.ativo)
    const receitaMensal = clientesAtivos.reduce((acc, c) => acc + c.valor_mensalidade, 0)
    const totalVeiculos = clientesAtivos.reduce((acc, c) => acc + (c.veiculos?.length || 0), 0)

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Relatório - Visível na impressão */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório de Clientes</h1>
          <p className="text-sm text-gray-600">
            Data de geração: {new Date().toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-summary-card">
          <div className="bg-blue-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total de Clientes</p>
            <p className="text-2xl font-bold text-blue-600">{clientes.length}</p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Clientes Ativos</p>
            <p className="text-2xl font-bold text-green-600">{clientesAtivos.length}</p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Receita Mensal</p>
            <p className="text-2xl font-bold text-purple-600">{formatCurrency(receitaMensal)}</p>
          </div>
          <div className="bg-orange-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total de Veículos</p>
            <p className="text-2xl font-bold text-orange-600">{totalVeiculos}</p>
          </div>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full border-collapse border border-gray-300 print:text-sm">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-left">Cliente</th>
                <th className="border border-gray-300 px-4 py-2 text-left">CNPJ</th>
                <th className="border border-gray-300 px-4 py-2 text-left">Cidade</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Veículos</th>
                <th className="border border-gray-300 px-4 py-2 text-right">Mensalidade</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Status</th>
              </tr>
            </thead>
            <tbody>
              {clientes.map(cliente => (
                <tr key={cliente.id}>
                  <td className="border border-gray-300 px-4 py-2">{cliente.nome}</td>
                  <td className="border border-gray-300 px-4 py-2">{cliente.cnpj}</td>
                  <td className="border border-gray-300 px-4 py-2">{cliente.cidade} - {cliente.estado}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">{cliente.veiculos?.length || 0}</td>
                  <td className="border border-gray-300 px-4 py-2 text-right">{formatCurrency(cliente.valor_mensalidade)}</td>
                  <td className="border border-gray-300 px-4 py-2 text-center">
                    <span className={`px-2 py-1 rounded text-xs ${
                      cliente.ativo ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    )
  }

  const renderFinanceiroReport = () => {
    const filteredFaturas = filterByDate(faturas)
    const filteredDespesas = filterByDate(despesas)

    const totalReceitas = filteredFaturas.filter(f => f.status === 'pago').reduce((acc, f) => acc + f.valor, 0)
    const totalDespesas = filteredDespesas.filter(d => d.status === 'pago').reduce((acc, d) => acc + d.valor, 0)
    const resultado = totalReceitas - totalDespesas

    return (
      <div className="space-y-6">
        {/* Cabeçalho do Relatório - Visível na impressão */}
        <div className="hidden print:block mb-4">
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Relatório Financeiro Consolidado</h1>
          <p className="text-sm text-gray-600">
            Período: {new Date(startDate).toLocaleDateString('pt-BR')} a {new Date(endDate).toLocaleDateString('pt-BR')}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 print-summary-card">
          <div className="bg-green-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total Receitas</p>
            <p className="text-2xl font-bold text-green-600">{formatCurrency(totalReceitas)}</p>
          </div>
          <div className="bg-red-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Total Despesas</p>
            <p className="text-2xl font-bold text-red-600">{formatCurrency(totalDespesas)}</p>
          </div>
          <div className={`p-4 rounded-lg print-no-break ${resultado >= 0 ? 'bg-blue-50' : 'bg-orange-50'}`}>
            <p className="text-sm text-gray-600">Resultado</p>
            <p className={`text-2xl font-bold ${resultado >= 0 ? 'text-blue-600' : 'text-orange-600'}`}>
              {formatCurrency(resultado)}
            </p>
          </div>
          <div className="bg-purple-50 p-4 rounded-lg print-no-break">
            <p className="text-sm text-gray-600">Margem</p>
            <p className="text-2xl font-bold text-purple-600">
              {totalReceitas > 0 ? ((resultado / totalReceitas) * 100).toFixed(1) : 0}%
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:grid-cols-2">
          <div className="bg-white p-4 rounded-lg border border-gray-300 print-no-break">
            <h3 className="font-bold text-lg mb-4 text-green-700">Receitas Recebidas</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
              {filteredFaturas.filter(f => f.status === 'pago').map(fatura => (
                <div key={fatura.id} className="flex justify-between border-b pb-2">
                  <span className="text-sm">{fatura.cliente_nome}</span>
                  <span className="text-sm font-bold text-green-600">{formatCurrency(fatura.valor)}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white p-4 rounded-lg border border-gray-300 print-no-break">
            <h3 className="font-bold text-lg mb-4 text-red-700">Despesas Pagas</h3>
            <div className="space-y-2 max-h-96 overflow-y-auto print:max-h-none print:overflow-visible">
              {filteredDespesas.filter(d => d.status === 'pago').map(despesa => (
                <div key={despesa.id} className="flex justify-between border-b pb-2">
                  <span className="text-sm">{despesa.descricao}</span>
                  <span className="text-sm font-bold text-red-600">{formatCurrency(despesa.valor)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando relatórios...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800 print:hidden">Relatórios Gerenciais</h1>

        {!reportType ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <button
              onClick={() => setReportType('faturas')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-4xl mb-4">💵</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatório de Faturas</h3>
              <p className="text-sm text-gray-600">Análise detalhada de todas as faturas e recebimentos</p>
            </button>

            <button
              onClick={() => setReportType('despesas')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-4xl mb-4">💸</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatório de Despesas</h3>
              <p className="text-sm text-gray-600">Controle detalhado de todas as despesas por categoria</p>
            </button>

            <button
              onClick={() => setReportType('clientes')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-4xl mb-4">👥</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatório de Clientes</h3>
              <p className="text-sm text-gray-600">Análise completa da base de clientes e veículos</p>
            </button>

            <button
              onClick={() => setReportType('financeiro')}
              className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow text-left"
            >
              <div className="text-4xl mb-4">📊</div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Relatório Financeiro Consolidado</h3>
              <p className="text-sm text-gray-600">Visão completa: Receitas x Despesas e resultado</p>
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6 print:shadow-none print:p-0">
              <div className="flex justify-between items-center mb-6 print:hidden">
                <h2 className="text-2xl font-bold text-gray-800">
                  {reportType === 'faturas' && 'Relatório de Faturas'}
                  {reportType === 'despesas' && 'Relatório de Despesas'}
                  {reportType === 'clientes' && 'Relatório de Clientes'}
                  {reportType === 'financeiro' && 'Relatório Financeiro Consolidado'}
                </h2>
                <div className="flex gap-2 print:hidden">
                  <button
                    onClick={() => setReportType(null)}
                    className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                  >
                    Voltar
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    🖨️ Imprimir
                  </button>
                </div>
              </div>

              {(reportType === 'faturas' || reportType === 'despesas' || reportType === 'financeiro') && (
                <div className="flex gap-4 mb-6 print:hidden">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Inicial</label>
                    <input
                      type="date"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Data Final</label>
                    <input
                      type="date"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg"
                    />
                  </div>
                </div>
              )}

              {reportType === 'faturas' && renderFaturasReport()}
              {reportType === 'despesas' && renderDespesasReport()}
              {reportType === 'clientes' && renderClientesReport()}
              {reportType === 'financeiro' && renderFinanceiroReport()}
            </div>
          </div>
        )}
      </div>
    </MainLayout>
  )
}
