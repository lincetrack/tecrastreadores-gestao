import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { Cliente } from '@/types'
import { formatPhone, generateWhatsappLink } from '@/utils/formatters'
import { clienteService } from '@/services/clienteService'

interface Aniversariante extends Cliente {
  dia_nascimento: number
  mes_nascimento: number
  idade: number
}

export default function AniversariantesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)

  useEffect(() => {
    loadClientes()
  }, [])

  const loadClientes = async () => {
    try {
      setLoading(true)
      const data = await clienteService.getAll()
      setClientes(data)
    } catch (error) {
      console.error('Erro ao carregar clientes:', error)
    } finally {
      setLoading(false)
    }
  }

  // Filtrar aniversariantes do mês selecionado
  const aniversariantesDoMes = clientes
    .filter(cliente => {
      if (!cliente.data_nascimento) return false
      const dataNasc = new Date(cliente.data_nascimento + 'T00:00:00')
      return dataNasc.getMonth() + 1 === selectedMonth
    })
    .map(cliente => {
      const dataNasc = new Date(cliente.data_nascimento! + 'T00:00:00')
      const hoje = new Date()
      let idade = hoje.getFullYear() - dataNasc.getFullYear()

      return {
        ...cliente,
        dia_nascimento: dataNasc.getDate(),
        mes_nascimento: dataNasc.getMonth() + 1,
        idade
      } as Aniversariante
    })
    .sort((a, b) => a.dia_nascimento - b.dia_nascimento)

  const handleSendWhatsapp = (cliente: Aniversariante) => {
    const message = `Olá ${cliente.nome}! 🎉🎂\n\nA equipe da Tec Rastreadores deseja um Feliz Aniversário! 🎈\n\nQue este novo ciclo seja repleto de saúde, paz e realizações!\n\nObrigado por confiar em nossos serviços!\n\nAbraços,\nEquipe Tec Rastreadores`
    const link = `https://wa.me/55${cliente.telefone.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
    window.open(link, '_blank')
  }

  const meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' }
  ]

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando aniversariantes...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Aniversariantes</h1>
            <p className="text-gray-600 mt-1">Gestão de aniversários dos clientes</p>
          </div>
          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(Number(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white"
          >
            {meses.map(mes => (
              <option key={mes.value} value={mes.value}>
                {mes.label}
              </option>
            ))}
          </select>
        </div>

        {/* Card de Resumo */}
        <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-lg shadow-md p-6 text-white">
          <div className="flex items-center gap-4">
            <div className="text-5xl">🎂</div>
            <div>
              <h3 className="text-2xl font-bold">{aniversariantesDoMes.length}</h3>
              <p className="text-primary-100">
                Aniversariante{aniversariantesDoMes.length !== 1 ? 's' : ''} em {meses.find(m => m.value === selectedMonth)?.label}
              </p>
            </div>
          </div>
        </div>

        {/* Lista de Aniversariantes */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          {aniversariantesDoMes.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <div className="text-6xl mb-4">🎈</div>
              <p className="text-lg">Nenhum aniversariante em {meses.find(m => m.value === selectedMonth)?.label}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dia
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Cliente
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Telefone
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Idade
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Ações
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {aniversariantesDoMes.map((cliente) => {
                    const hoje = new Date()
                    const isHoje = hoje.getDate() === cliente.dia_nascimento && (hoje.getMonth() + 1) === selectedMonth

                    return (
                      <tr key={cliente.id} className={`hover:bg-gray-50 ${isHoje ? 'bg-yellow-50' : ''}`}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            {isHoje && <span className="text-2xl">🎉</span>}
                            <span className="text-2xl font-bold text-primary-600">{cliente.dia_nascimento}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">{cliente.nome}</p>
                            {cliente.email && <p className="text-sm text-gray-500">{cliente.email}</p>}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatPhone(cliente.telefone)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className="text-lg font-semibold text-gray-700">{cliente.idade}</span>
                          <span className="text-xs text-gray-500 ml-1">anos</span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            cliente.ativo
                              ? 'bg-green-100 text-green-700'
                              : 'bg-red-100 text-red-700'
                          }`}>
                            {cliente.ativo ? 'ATIVO' : 'INATIVO'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => handleSendWhatsapp(cliente)}
                            className="bg-green-600 p-2 rounded text-white hover:bg-green-700 transition-colors inline-flex items-center gap-1"
                            title="Enviar mensagem de aniversário"
                          >
                            💬 Parabenizar
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Informação adicional */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded">
          <div className="flex items-start gap-3">
            <div className="text-blue-500 text-xl">ℹ️</div>
            <div className="text-sm text-blue-800">
              <p className="font-medium mb-1">Dica:</p>
              <p>Clientes sem data de nascimento cadastrada não aparecerão nesta lista. Para incluí-los, edite o cadastro do cliente e adicione a data de nascimento.</p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  )
}
