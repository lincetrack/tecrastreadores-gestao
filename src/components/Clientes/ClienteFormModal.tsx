import { useState, useEffect } from 'react'
import { Cliente, Veiculo } from '@/types'

interface ClienteFormModalProps {
  isOpen: boolean
  cliente: Cliente | null
  onClose: () => void
  onSave: (cliente: Cliente) => void
}

export default function ClienteFormModal({ isOpen, cliente, onClose, onSave }: ClienteFormModalProps) {
  const [formData, setFormData] = useState<Partial<Cliente>>({
    nome: '',
    cnpj: '',
    telefone: '',
    email: '',
    endereco: '',
    bairro: '',
    cidade: '',
    estado: 'PR',
    cep: '',
    valor_mensalidade: 79.90,
    dia_vencimento: '10',
    login_plataforma: '',
    veiculos: [],
    ativo: true
  })

  const [veiculos, setVeiculos] = useState<Veiculo[]>([])

  const estados = [
    'AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA',
    'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN',
    'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'
  ]

  const tiposRastreador = [
    'GT06N',
    'ST940',
    'Coban',
    'Suntech',
    'Teltonika',
    'Queclink',
    'Outro'
  ]

  useEffect(() => {
    if (cliente) {
      setFormData(cliente)
      setVeiculos(cliente.veiculos || [])
    } else {
      setFormData({
        nome: '',
        cnpj: '',
        telefone: '',
        email: '',
        endereco: '',
        bairro: '',
        cidade: '',
        estado: 'PR',
        cep: '',
        valor_mensalidade: 79.90,
        dia_vencimento: '10',
        login_plataforma: '',
        veiculos: [],
        ativo: true
      })
      setVeiculos([])
    }
  }, [cliente, isOpen])

  const handleAddVeiculo = () => {
    const novoVeiculo: Veiculo = {
      id: `${Date.now()}-${Math.random()}`,
      veiculo: '',
      placa: '',
      tipo_rastreador: 'GT06N',
      imei: '',
      com_bloqueio: false,
      numero_chip: ''
    }
    setVeiculos([...veiculos, novoVeiculo])
  }

  const handleRemoveVeiculo = (id: string) => {
    setVeiculos(veiculos.filter(v => v.id !== id))
  }

  const handleVeiculoChange = (id: string, field: keyof Veiculo, value: any) => {
    setVeiculos(veiculos.map(v =>
      v.id === id ? { ...v, [field]: value } : v
    ))
  }

  const handleSubmit = () => {
    if (!formData.nome || !formData.cnpj || !formData.telefone) {
      alert('Preencha todos os campos obrigatórios!')
      return
    }

    const clienteData: Cliente = {
      id: cliente?.id || `${Date.now()}`,
      nome: formData.nome!,
      cnpj: formData.cnpj!,
      telefone: formData.telefone!,
      email: formData.email,
      endereco: formData.endereco!,
      bairro: formData.bairro!,
      cidade: formData.cidade!,
      estado: formData.estado!,
      cep: formData.cep,
      valor_mensalidade: formData.valor_mensalidade!,
      dia_vencimento: formData.dia_vencimento!,
      login_plataforma: formData.login_plataforma,
      veiculos: veiculos,
      ativo: formData.ativo!,
      created_at: cliente?.created_at || new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    onSave(clienteData)
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-6xl p-6 my-8 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          {cliente ? 'Editar Cliente' : 'Novo Cliente'}
        </h2>

        <div className="space-y-6">
          {/* Dados do Cliente */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados do Cliente</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome / Razão Social *
                </label>
                <input
                  type="text"
                  value={formData.nome}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CNPJ *
                </label>
                <input
                  type="text"
                  value={formData.cnpj}
                  onChange={(e) => setFormData({ ...formData, cnpj: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="00.000.000/0000-00"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Telefone *
                </label>
                <input
                  type="text"
                  value={formData.telefone}
                  onChange={(e) => setFormData({ ...formData, telefone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="44999999999"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Login na Plataforma
                </label>
                <input
                  type="text"
                  value={formData.login_plataforma}
                  onChange={(e) => setFormData({ ...formData, login_plataforma: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Login de acesso do cliente na plataforma externa"
                />
              </div>
            </div>
          </div>

          {/* Endereço */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Endereço</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Endereço *
                </label>
                <input
                  type="text"
                  value={formData.endereco}
                  onChange={(e) => setFormData({ ...formData, endereco: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Bairro *
                </label>
                <input
                  type="text"
                  value={formData.bairro}
                  onChange={(e) => setFormData({ ...formData, bairro: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CEP
                </label>
                <input
                  type="text"
                  value={formData.cep}
                  onChange={(e) => setFormData({ ...formData, cep: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="00000-000"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Cidade *
                </label>
                <input
                  type="text"
                  value={formData.cidade}
                  onChange={(e) => setFormData({ ...formData, cidade: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Estado *
                </label>
                <select
                  value={formData.estado}
                  onChange={(e) => setFormData({ ...formData, estado: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                >
                  {estados.map(uf => (
                    <option key={uf} value={uf}>{uf}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Dados Financeiros */}
          <div className="border-b pb-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">Dados Financeiros</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Valor Mensalidade *
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.valor_mensalidade}
                  onChange={(e) => setFormData({ ...formData, valor_mensalidade: parseFloat(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
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
                  value={formData.dia_vencimento}
                  onChange={(e) => setFormData({ ...formData, dia_vencimento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
              </div>
            </div>
          </div>

          {/* Veículos e Equipamentos */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-700">Veículos e Equipamentos</h3>
              <button
                type="button"
                onClick={handleAddVeiculo}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
              >
                ➕ Adicionar Veículo
              </button>
            </div>

            {veiculos.length === 0 ? (
              <p className="text-gray-500 text-center py-4 border border-dashed border-gray-300 rounded-lg">
                Nenhum veículo cadastrado. Clique em &quot;Adicionar Veículo&quot; para começar.
              </p>
            ) : (
              <div className="space-y-4">
                {veiculos.map((veiculo, index) => (
                  <div key={veiculo.id} className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                    <div className="flex justify-between items-center mb-3">
                      <h4 className="font-semibold text-gray-700">Veículo #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => handleRemoveVeiculo(veiculo.id)}
                        className="text-red-600 hover:text-red-800 font-medium"
                      >
                        ✕ Remover
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Veículo (Modelo/Marca)
                        </label>
                        <input
                          type="text"
                          value={veiculo.veiculo}
                          onChange={(e) => handleVeiculoChange(veiculo.id, 'veiculo', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="Ex: Fiat Strada"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Placa
                        </label>
                        <input
                          type="text"
                          value={veiculo.placa}
                          onChange={(e) => handleVeiculoChange(veiculo.id, 'placa', e.target.value.toUpperCase())}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="ABC1234"
                          maxLength={7}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Tipo do Rastreador
                        </label>
                        <select
                          value={veiculo.tipo_rastreador}
                          onChange={(e) => handleVeiculoChange(veiculo.id, 'tipo_rastreador', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                        >
                          {tiposRastreador.map(tipo => (
                            <option key={tipo} value={tipo}>{tipo}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          IMEI
                        </label>
                        <input
                          type="text"
                          value={veiculo.imei}
                          onChange={(e) => handleVeiculoChange(veiculo.id, 'imei', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="15 dígitos"
                          maxLength={15}
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Número do Chip
                        </label>
                        <input
                          type="text"
                          value={veiculo.numero_chip}
                          onChange={(e) => handleVeiculoChange(veiculo.id, 'numero_chip', e.target.value)}
                          className="w-full px-2 py-1 text-sm border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-primary-500"
                          placeholder="(DDD) 99999-9999"
                        />
                      </div>

                      <div className="flex items-center">
                        <label className="flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={veiculo.com_bloqueio}
                            onChange={(e) => handleVeiculoChange(veiculo.id, 'com_bloqueio', e.target.checked)}
                            className="mr-2 w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                          />
                          <span className="text-sm font-medium text-gray-700">Com Bloqueio?</span>
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div className="flex gap-3 mt-6 pt-4 border-t">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            {cliente ? 'Salvar Alterações' : 'Adicionar Cliente'}
          </button>
        </div>
      </div>
    </div>
  )
}
