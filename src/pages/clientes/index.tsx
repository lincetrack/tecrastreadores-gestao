import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import { Cliente, Veiculo } from '@/types'
import { formatCurrency, formatPhone, formatCNPJ } from '@/utils/formatters'
import { clienteService } from '@/services/clienteService'
import { veiculoService } from '@/services/veiculoService'

export default function ClientesPage() {
  const [clientes, setClientes] = useState<Cliente[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [editingCliente, setEditingCliente] = useState<Cliente | null>(null)
  const [notification, setNotification] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  const [newCliente, setNewCliente] = useState<Partial<Cliente>>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: '',
    valor_mensalidade: 39.90,
    dia_vencimento: '10',
    login_plataforma: '',
    veiculos: [],
    ativo: true
  })

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  // Carregar clientes do Supabase
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
      showNotification('Erro ao carregar clientes')
    } finally {
      setLoading(false)
    }
  }

  const showNotification = (message: string) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 3000)
  }

  const handleAddCliente = async () => {
    if (!newCliente.nome || !newCliente.cnpj || !newCliente.telefone) {
      showNotification('Preencha todos os campos obrigatórios!')
      return
    }

    try {
      const { veiculos, ...clienteData } = newCliente
      const clienteCriado = await clienteService.create(clienteData as any)

      // Se há veículos, criar cada um
      if (veiculos && veiculos.length > 0) {
        for (const veiculo of veiculos) {
          const { id, ...veiculoData } = veiculo
          await veiculoService.create({
            ...veiculoData,
            cliente_id: clienteCriado.id
          })
        }
      }

      await loadClientes()
      setShowAddModal(false)
      setNewCliente({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: 'PR',
        cep: '',
        valor_mensalidade: 39.90,
        dia_vencimento: '10',
        login_plataforma: '',
        veiculos: [],
        ativo: true
      })
      showNotification('Cliente adicionado com sucesso!')
    } catch (error) {
      console.error('Erro ao adicionar cliente:', error)
      showNotification('Erro ao adicionar cliente')
    }
  }

  const toggleAtivo = async (id: string) => {
    try {
      await clienteService.toggleAtivo(id)
      await loadClientes()
      showNotification('Status atualizado!')
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
      showNotification('Erro ao atualizar status')
    }
  }

  const handleEditCliente = (cliente: Cliente) => {
    setEditingCliente(cliente)
    setShowEditModal(true)
  }

  const handleUpdateCliente = async () => {
    if (!editingCliente) return

    try {
      const { veiculos, ...clienteData } = editingCliente
      await clienteService.update(editingCliente.id, clienteData)

      // Buscar veículos existentes
      const veiculosExistentes = await veiculoService.getByClienteId(editingCliente.id)

      // Remover veículos que não estão mais na lista
      for (const veiculoExistente of veiculosExistentes) {
        const aindaExists = veiculos?.find(v => v.id === veiculoExistente.id)
        if (!aindaExists) {
          await veiculoService.delete(veiculoExistente.id)
        }
      }

      // Atualizar ou criar veículos
      if (veiculos && veiculos.length > 0) {
        for (const veiculo of veiculos) {
          if (veiculo.id && veiculo.id.toString().length > 20) {
            // UUID do Supabase - atualizar
            const { id, ...veiculoData } = veiculo
            await veiculoService.update(id, veiculoData)
          } else {
            // ID temporário - criar novo
            const { id, ...veiculoData } = veiculo
            await veiculoService.create({
              ...veiculoData,
              cliente_id: editingCliente.id
            })
          }
        }
      }

      await loadClientes()
      setShowEditModal(false)
      setEditingCliente(null)
      showNotification('Cliente atualizado com sucesso!')
    } catch (error) {
      console.error('Erro ao atualizar cliente:', error)
      showNotification('Erro ao atualizar cliente')
    }
  }

  const handleDeleteCliente = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este cliente? Esta ação não pode ser desfeita.')) {
      try {
        await clienteService.delete(id)
        await loadClientes()
        showNotification('Cliente excluído com sucesso!')
      } catch (error) {
        console.error('Erro ao excluir cliente:', error)
        showNotification('Erro ao excluir cliente')
      }
    }
  }

  const filteredClientes = clientes.filter(c =>
    c.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.cnpj.includes(searchTerm) ||
    c.telefone.includes(searchTerm)
  )

  const clientesAtivos = clientes.filter(c => c.ativo).length
  const receitaMensal = clientes
    .filter(c => c.ativo)
    .reduce((acc, c) => acc + c.valor_mensalidade, 0)

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando clientes...</p>
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
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Gestão de Clientes</h1>
          <button
            onClick={() => setShowAddModal(true)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            ➕ Novo Cliente
          </button>
        </div>

        {/* Cards de Resumo */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Total de Clientes</h3>
            <p className="text-3xl font-bold text-primary-600">{clientes.length}</p>
            <p className="text-sm text-gray-600 mt-2">cadastrados no sistema</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Clientes Ativos</h3>
            <p className="text-3xl font-bold text-green-600">{clientesAtivos}</p>
            <p className="text-sm text-gray-600 mt-2">com contrato ativo</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Receita Mensal Recorrente</h3>
            <p className="text-3xl font-bold text-blue-600">{formatCurrency(receitaMensal)}</p>
            <p className="text-sm text-gray-600 mt-2">de clientes ativos</p>
          </div>
        </div>

        {/* Barra de Busca */}
        <div className="bg-white rounded-lg shadow-md p-4">
          <input
            type="text"
            placeholder="Buscar por nome, CNPJ ou telefone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>

        {/* Grid de Clientes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredClientes.length === 0 ? (
            <div className="col-span-2 bg-white rounded-lg shadow-md p-8 text-center text-gray-500">
              Nenhum cliente encontrado.
            </div>
          ) : (
            filteredClientes.map((cliente) => (
              <div key={cliente.id} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{cliente.nome}</h3>
                    <p className="text-sm text-gray-600">CNPJ: {formatCNPJ(cliente.cnpj)}</p>
                  </div>
                  <button
                    onClick={() => toggleAtivo(cliente.id)}
                    className={`px-3 py-1 rounded-full text-xs font-bold ${
                      cliente.ativo
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}
                  >
                    {cliente.ativo ? '✓ ATIVO' : '✕ INATIVO'}
                  </button>
                </div>

                <div className="space-y-2 text-sm text-gray-600 mb-4">
                  <p>📞 {formatPhone(cliente.telefone)}</p>
                  {cliente.email && <p>✉️ {cliente.email}</p>}
                  <p>📍 {cliente.endereco}, {cliente.bairro}</p>
                  <p className="ml-4">{cliente.cidade} - {cliente.estado} {cliente.cep && `| CEP: ${cliente.cep}`}</p>
                </div>

                <div className="pt-4 border-t border-gray-200 space-y-3">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-xs text-gray-500">Mensalidade</p>
                      <p className="text-lg font-bold text-green-600">{formatCurrency(cliente.valor_mensalidade)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Vencimento</p>
                      <p className="text-lg font-bold text-blue-600">Dia {cliente.dia_vencimento}</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditCliente(cliente)}
                      className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteCliente(cliente.id)}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                    >
                      🗑️ Excluir
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Modal de Editar Cliente */}
      {showEditModal && editingCliente && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto my-4 sm:my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Editar Cliente</h2>
              <button
                onClick={() => {
                  setShowEditModal(false)
                  setEditingCliente(null)
                }}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.nome}
                    onChange={(e) => setEditingCliente({ ...editingCliente, nome: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF / CNPJ *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.cnpj}
                    onChange={(e) => setEditingCliente({ ...editingCliente, cnpj: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inscrição Estadual / RG
                  </label>
                  <input
                    type="text"
                    value={editingCliente.inscricao_estadual || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, inscricao_estadual: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="IE ou RG"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={editingCliente.data_nascimento || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, data_nascimento: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.telefone}
                    onChange={(e) => setEditingCliente({ ...editingCliente, telefone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="44999999999"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={editingCliente.email || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, email: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Login da Plataforma
                  </label>
                  <input
                    type="text"
                    value={editingCliente.login_plataforma || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, login_plataforma: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="usuario.plataforma"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Endereço *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.endereco}
                    onChange={(e) => setEditingCliente({ ...editingCliente, endereco: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Bairro *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.bairro}
                    onChange={(e) => setEditingCliente({ ...editingCliente, bairro: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CEP
                  </label>
                  <input
                    type="text"
                    value={editingCliente.cep || ''}
                    onChange={(e) => setEditingCliente({ ...editingCliente, cep: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="00000-000"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cidade *
                  </label>
                  <input
                    type="text"
                    value={editingCliente.cidade}
                    onChange={(e) => setEditingCliente({ ...editingCliente, cidade: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Estado *
                  </label>
                  <select
                    value={editingCliente.estado}
                    onChange={(e) => setEditingCliente({ ...editingCliente, estado: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  >
                    {estados.map(uf => (
                      <option key={uf} value={uf}>{uf}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Valor Mensalidade *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={editingCliente.valor_mensalidade}
                    onChange={(e) => setEditingCliente({ ...editingCliente, valor_mensalidade: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Dia Vencimento *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="31"
                    value={editingCliente.dia_vencimento}
                    onChange={(e) => setEditingCliente({ ...editingCliente, dia_vencimento: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>
              </div>

            {/* Seção de Veículos */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Veículos / Equipamentos</h3>
                <button
                  type="button"
                  onClick={() => {
                    const novoVeiculo = {
                      id: `temp-${Date.now()}`,
                      veiculo: '',
                      placa: '',
                      tipo_rastreador: 'LV-12 4G USB',
                      imei: '',
                      com_bloqueio: false,
                      numero_chip: ''
                    }
                    setEditingCliente({
                      ...editingCliente,
                      veiculos: [...(editingCliente.veiculos || []), novoVeiculo]
                    })
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Adicionar Veículo
                </button>
              </div>

              {editingCliente.veiculos && editingCliente.veiculos.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {editingCliente.veiculos.map((veiculo, index) => (
                    <div key={veiculo.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">Veículo {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setEditingCliente({
                              ...editingCliente,
                              veiculos: editingCliente.veiculos.filter(v => v.id !== veiculo.id)
                            })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Veículo/Modelo *</label>
                          <input
                            type="text"
                            value={veiculo.veiculo}
                            onChange={(e) => {
                              const novosVeiculos = [...editingCliente.veiculos]
                              novosVeiculos[index] = { ...veiculo, veiculo: e.target.value }
                              setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ex: Fiat Strada"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Placa *</label>
                          <input
                            type="text"
                            value={veiculo.placa}
                            onChange={(e) => {
                              const novosVeiculos = [...editingCliente.veiculos]
                              novosVeiculos[index] = { ...veiculo, placa: e.target.value.toUpperCase() }
                              setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm uppercase"
                            placeholder="ABC1234"
                            maxLength={7}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tipo Rastreador *</label>
                          <input
                            type="text"
                            value={veiculo.tipo_rastreador}
                            onChange={(e) => {
                              const novosVeiculos = [...editingCliente.veiculos]
                              novosVeiculos[index] = { ...veiculo, tipo_rastreador: e.target.value }
                              setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ex: GT06N, ST940, Coban"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">IMEI *</label>
                          <input
                            type="text"
                            value={veiculo.imei}
                            onChange={(e) => {
                              const novosVeiculos = [...editingCliente.veiculos]
                              novosVeiculos[index] = { ...veiculo, imei: e.target.value }
                              setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="123456789012345"
                            maxLength={15}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Número do Chip</label>
                          <input
                            type="text"
                            value={veiculo.numero_chip}
                            onChange={(e) => {
                              const novosVeiculos = [...editingCliente.veiculos]
                              novosVeiculos[index] = { ...veiculo, numero_chip: e.target.value }
                              setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="11999999999"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={veiculo.com_bloqueio}
                              onChange={(e) => {
                                const novosVeiculos = [...editingCliente.veiculos]
                                novosVeiculos[index] = { ...veiculo, com_bloqueio: e.target.checked }
                                setEditingCliente({ ...editingCliente, veiculos: novosVeiculos })
                              }}
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-700">Com Bloqueio?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum veículo cadastrado</p>
              )}
            </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditModal(false)
                    setEditingCliente(null)
                  }}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleUpdateCliente}
                  className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Salvar Alterações
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Adicionar Cliente */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto my-4 sm:my-8">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 sm:p-6 flex justify-between items-center">
              <h2 className="text-xl sm:text-2xl font-bold text-gray-800">Novo Cliente</h2>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ✕
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nome / Razão Social *
                  </label>
                  <input
                    type="text"
                    value={newCliente.nome}
                    onChange={(e) => setNewCliente({ ...newCliente, nome: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    CPF / CNPJ *
                  </label>
                  <input
                    type="text"
                    value={newCliente.cnpj}
                    onChange={(e) => setNewCliente({ ...newCliente, cnpj: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="000.000.000-00 ou 00.000.000/0000-00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Inscrição Estadual / RG
                  </label>
                  <input
                    type="text"
                    value={newCliente.inscricao_estadual || ''}
                    onChange={(e) => setNewCliente({ ...newCliente, inscricao_estadual: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="IE ou RG"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Data de Nascimento
                  </label>
                  <input
                    type="date"
                    value={newCliente.data_nascimento || ''}
                    onChange={(e) => setNewCliente({ ...newCliente, data_nascimento: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Telefone *
                  </label>
                  <input
                    type="text"
                    value={newCliente.telefone}
                    onChange={(e) => setNewCliente({ ...newCliente, telefone: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="44999999999"
                  />
                </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={newCliente.email}
                  onChange={(e) => setNewCliente({ ...newCliente, email: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login da Plataforma
                </label>
                <input
                  type="text"
                  value={newCliente.login_plataforma || ''}
                  onChange={(e) => setNewCliente({ ...newCliente, login_plataforma: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="usuario.plataforma"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={newCliente.endereco}
                  onChange={(e) => setNewCliente({ ...newCliente, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={newCliente.bairro}
                  onChange={(e) => setNewCliente({ ...newCliente, bairro: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={newCliente.cep}
                  onChange={(e) => setNewCliente({ ...newCliente, cep: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={newCliente.cidade}
                  onChange={(e) => setNewCliente({ ...newCliente, cidade: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  value={newCliente.estado}
                  onChange={(e) => setNewCliente({ ...newCliente, estado: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {estados.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mensalidade *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={newCliente.valor_mensalidade}
                  onChange={(e) => setNewCliente({ ...newCliente, valor_mensalidade: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Dia Vencimento *
                </label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  value={newCliente.dia_vencimento}
                  onChange={(e) => setNewCliente({ ...newCliente, dia_vencimento: e.target.value })}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>

            {/* Seção de Veículos - Mesmo código do modal de edição */}
            <div className="mt-6 border-t pt-4">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Veículos / Equipamentos</h3>
                <button
                  type="button"
                  onClick={() => {
                    const novoVeiculo = {
                      id: `temp-${Date.now()}`,
                      veiculo: '',
                      placa: '',
                      tipo_rastreador: 'LV-12 4G USB',
                      imei: '',
                      com_bloqueio: false,
                      numero_chip: ''
                    }
                    setNewCliente({
                      ...newCliente,
                      veiculos: [...(newCliente.veiculos || []), novoVeiculo]
                    })
                  }}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm transition-colors"
                >
                  + Adicionar Veículo
                </button>
              </div>

              {newCliente.veiculos && newCliente.veiculos.length > 0 ? (
                <div className="space-y-4 max-h-60 overflow-y-auto">
                  {newCliente.veiculos.map((veiculo, index) => (
                    <div key={veiculo.id} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-center mb-3">
                        <span className="font-medium text-gray-700">Veículo {index + 1}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setNewCliente({
                              ...newCliente,
                              veiculos: (newCliente.veiculos || []).filter(v => v.id !== veiculo.id)
                            })
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          🗑️ Remover
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Veículo/Modelo *</label>
                          <input
                            type="text"
                            value={veiculo.veiculo}
                            onChange={(e) => {
                              const novosVeiculos = [...(newCliente.veiculos || [])]
                              novosVeiculos[index] = { ...veiculo, veiculo: e.target.value }
                              setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ex: Fiat Strada"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Placa *</label>
                          <input
                            type="text"
                            value={veiculo.placa}
                            onChange={(e) => {
                              const novosVeiculos = [...(newCliente.veiculos || [])]
                              novosVeiculos[index] = { ...veiculo, placa: e.target.value.toUpperCase() }
                              setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm uppercase"
                            placeholder="ABC1234"
                            maxLength={7}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Tipo Rastreador *</label>
                          <input
                            type="text"
                            value={veiculo.tipo_rastreador}
                            onChange={(e) => {
                              const novosVeiculos = [...(newCliente.veiculos || [])]
                              novosVeiculos[index] = { ...veiculo, tipo_rastreador: e.target.value }
                              setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="Ex: GT06N, ST940, Coban"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">IMEI *</label>
                          <input
                            type="text"
                            value={veiculo.imei}
                            onChange={(e) => {
                              const novosVeiculos = [...(newCliente.veiculos || [])]
                              novosVeiculos[index] = { ...veiculo, imei: e.target.value }
                              setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="123456789012345"
                            maxLength={15}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Número do Chip</label>
                          <input
                            type="text"
                            value={veiculo.numero_chip}
                            onChange={(e) => {
                              const novosVeiculos = [...(newCliente.veiculos || [])]
                              novosVeiculos[index] = { ...veiculo, numero_chip: e.target.value }
                              setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                            }}
                            className="w-full px-2 py-1 border border-gray-300 rounded text-sm"
                            placeholder="11999999999"
                          />
                        </div>
                        <div className="flex items-center pt-5">
                          <label className="flex items-center cursor-pointer">
                            <input
                              type="checkbox"
                              checked={veiculo.com_bloqueio}
                              onChange={(e) => {
                                const novosVeiculos = [...(newCliente.veiculos || [])]
                                novosVeiculos[index] = { ...veiculo, com_bloqueio: e.target.checked }
                                setNewCliente({ ...newCliente, veiculos: novosVeiculos })
                              }}
                              className="mr-2"
                            />
                            <span className="text-xs text-gray-700">Com Bloqueio?</span>
                          </label>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Nenhum veículo cadastrado</p>
              )}
              </div>

              <div className="sticky bottom-0 bg-white border-t border-gray-200 p-4 sm:p-6 flex flex-col sm:flex-row gap-3 mt-6">
                <button
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 text-sm border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleAddCliente}
                  className="flex-1 px-4 py-2 text-sm bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
                >
                  Adicionar Cliente
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </MainLayout>
  )
}
