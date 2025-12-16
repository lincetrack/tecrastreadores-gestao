import { useState, useEffect } from 'react'
import MainLayout from '@/components/Layout/MainLayout'
import PropostaModal from '@/components/Propostas/PropostaModal'
import { PropostaComercial } from '@/types'
import { formatCurrency, formatDate } from '@/utils/formatters'
import { propostaService } from '@/services/propostaService'

export default function PropostasPage() {
  const [propostas, setPropostas] = useState<PropostaComercial[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingProposta, setEditingProposta] = useState<PropostaComercial | null>(null)
  const [viewingProposta, setViewingProposta] = useState<PropostaComercial | null>(null)

  const [formData, setFormData] = useState<Partial<PropostaComercial>>({
    tipo_pessoa: 'juridica',
    prospect_nome: '',
    prospect_contato: '',
    prospect_email: '',
    prospect_telefone: '',
    prospect_documento: '',
    prospect_cidade: '',
    prospect_estado: 'PR',
    tipo_equipamento: 'Rastreador 4G Convencional',
    plano: 'Plano Básico',
    valor_mensal: 39.90,
    quantidade_veiculos: 1,
    instalacao_gratuita: true,
    valor_instalacao: 0,
    prazo_permanencia: 12,
    observacoes: '',
    status: 'pendente',
    data_validade: ''
  })

  useEffect(() => {
    loadPropostas()
  }, [])

  const loadPropostas = async () => {
    try {
      setLoading(true)
      const data = await propostaService.getAllPropostas()
      setPropostas(data.sort((a, b) => b.numero_proposta - a.numero_proposta))
    } catch (error) {
      console.error('Erro ao carregar propostas:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingProposta) {
        await propostaService.updateProposta(editingProposta.id, formData)
      } else {
        // Calcular data de validade (30 dias a partir de hoje)
        const dataValidade = new Date()
        dataValidade.setDate(dataValidade.getDate() + 30)

        await propostaService.createProposta({
          ...formData as Omit<PropostaComercial, 'id' | 'numero_proposta' | 'created_at' | 'updated_at'>,
          data_validade: dataValidade.toISOString().split('T')[0]
        })
      }

      await loadPropostas()
      handleCloseModal()
    } catch (error) {
      console.error('Erro ao salvar proposta:', error)
      alert('Erro ao salvar proposta')
    }
  }

  const handleEdit = (proposta: PropostaComercial) => {
    setEditingProposta(proposta)
    setFormData(proposta)
    setShowModal(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta proposta?')) return

    try {
      await propostaService.deleteProposta(id)
      await loadPropostas()
    } catch (error) {
      console.error('Erro ao excluir proposta:', error)
      alert('Erro ao excluir proposta')
    }
  }

  const handleChangeStatus = async (id: string, status: PropostaComercial['status']) => {
    try {
      await propostaService.updateStatus(id, status)
      await loadPropostas()
    } catch (error) {
      console.error('Erro ao atualizar status:', error)
    }
  }

  const handleCloseModal = () => {
    setShowModal(false)
    setEditingProposta(null)
    setFormData({
      tipo_pessoa: 'juridica',
      prospect_nome: '',
      prospect_contato: '',
      prospect_email: '',
      prospect_telefone: '',
      prospect_documento: '',
      prospect_cidade: '',
      prospect_estado: 'PR',
      tipo_equipamento: 'Rastreador 4G Convencional',
      plano: 'Plano Básico',
      valor_mensal: 39.90,
      quantidade_veiculos: 1,
      instalacao_gratuita: true,
      valor_instalacao: 0,
      prazo_permanencia: 12,
      observacoes: '',
      status: 'pendente',
      data_validade: ''
    })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pendente': return 'bg-yellow-100 text-yellow-800'
      case 'enviada': return 'bg-blue-100 text-blue-800'
      case 'aprovada': return 'bg-green-100 text-green-800'
      case 'recusada': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pendente': return 'Pendente'
      case 'enviada': return 'Enviada'
      case 'aprovada': return 'Aprovada'
      case 'recusada': return 'Recusada'
      default: return status
    }
  }

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando propostas...</p>
          </div>
        </div>
      </MainLayout>
    )
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-800">Propostas Comerciais</h1>
          <button
            onClick={() => setShowModal(true)}
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 flex items-center gap-2"
          >
            <span>+</span>
            Nova Proposta
          </button>
        </div>

        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Total de Propostas</p>
            <p className="text-2xl font-bold text-gray-800">{propostas.length}</p>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Pendentes</p>
            <p className="text-2xl font-bold text-yellow-600">
              {propostas.filter(p => p.status === 'pendente').length}
            </p>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Enviadas</p>
            <p className="text-2xl font-bold text-blue-600">
              {propostas.filter(p => p.status === 'enviada').length}
            </p>
          </div>
          <div className="bg-green-50 p-4 rounded-lg shadow-md">
            <p className="text-sm text-gray-600">Aprovadas</p>
            <p className="text-2xl font-bold text-green-600">
              {propostas.filter(p => p.status === 'aprovada').length}
            </p>
          </div>
        </div>

        {/* Lista de Propostas */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nº Proposta
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Empresa
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contato
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Veículos
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor Total
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Validade
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {propostas.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-6 py-8 text-center text-gray-500">
                      Nenhuma proposta cadastrada
                    </td>
                  </tr>
                ) : (
                  propostas.map((proposta) => (
                    <tr key={proposta.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        #{String(proposta.numero_proposta).padStart(4, '0')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{proposta.prospect_nome}</div>
                        <div className="text-sm text-gray-500">{proposta.prospect_cidade}/{proposta.prospect_estado}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{proposta.prospect_contato}</div>
                        <div className="text-sm text-gray-500">{proposta.prospect_telefone}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {proposta.quantidade_veiculos}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {formatCurrency(proposta.valor_mensal * proposta.quantidade_veiculos)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(proposta.data_validade)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={proposta.status}
                          onChange={(e) => handleChangeStatus(proposta.id, e.target.value as PropostaComercial['status'])}
                          className={`text-xs px-2 py-1 rounded-full font-semibold ${getStatusColor(proposta.status)}`}
                        >
                          <option value="pendente">Pendente</option>
                          <option value="enviada">Enviada</option>
                          <option value="aprovada">Aprovada</option>
                          <option value="recusada">Recusada</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setViewingProposta(proposta)}
                          className="text-blue-600 hover:text-blue-900 mr-3"
                          title="Visualizar/Gerar PDF"
                        >
                          📄 PDF
                        </button>
                        <button
                          onClick={() => handleEdit(proposta)}
                          className="text-indigo-600 hover:text-indigo-900 mr-3"
                        >
                          Editar
                        </button>
                        <button
                          onClick={() => handleDelete(proposta.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Excluir
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Modal de Nova/Editar Proposta */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-gray-800">
                  {editingProposta ? 'Editar Proposta' : 'Nova Proposta Comercial'}
                </h2>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 text-2xl"
                >
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Dados do Prospect */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Dados do Cliente Prospect
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Pessoa *
                      </label>
                      <select
                        required
                        value={formData.tipo_pessoa}
                        onChange={(e) => setFormData({ ...formData, tipo_pessoa: e.target.value as 'fisica' | 'juridica', prospect_documento: '' })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="juridica">Pessoa Jurídica (CNPJ)</option>
                        <option value="fisica">Pessoa Física (CPF)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo_pessoa === 'fisica' ? 'Nome Completo *' : 'Nome da Empresa *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prospect_nome}
                        onChange={(e) => setFormData({ ...formData, prospect_nome: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={formData.tipo_pessoa === 'fisica' ? 'João da Silva' : 'Empresa LTDA'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Nome do Contato *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prospect_contato}
                        onChange={(e) => setFormData({ ...formData, prospect_contato: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        required
                        value={formData.prospect_email}
                        onChange={(e) => setFormData({ ...formData, prospect_email: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Telefone *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prospect_telefone}
                        onChange={(e) => setFormData({ ...formData, prospect_telefone: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder="(00) 00000-0000"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        {formData.tipo_pessoa === 'fisica' ? 'CPF *' : 'CNPJ *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prospect_documento}
                        onChange={(e) => setFormData({ ...formData, prospect_documento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        placeholder={formData.tipo_pessoa === 'fisica' ? '000.000.000-00' : '00.000.000/0000-00'}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Cidade *
                      </label>
                      <input
                        type="text"
                        required
                        value={formData.prospect_cidade}
                        onChange={(e) => setFormData({ ...formData, prospect_cidade: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Estado *
                      </label>
                      <select
                        required
                        value={formData.prospect_estado}
                        onChange={(e) => setFormData({ ...formData, prospect_estado: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="AC">AC</option>
                        <option value="AL">AL</option>
                        <option value="AP">AP</option>
                        <option value="AM">AM</option>
                        <option value="BA">BA</option>
                        <option value="CE">CE</option>
                        <option value="DF">DF</option>
                        <option value="ES">ES</option>
                        <option value="GO">GO</option>
                        <option value="MA">MA</option>
                        <option value="MT">MT</option>
                        <option value="MS">MS</option>
                        <option value="MG">MG</option>
                        <option value="PA">PA</option>
                        <option value="PB">PB</option>
                        <option value="PR">PR</option>
                        <option value="PE">PE</option>
                        <option value="PI">PI</option>
                        <option value="RJ">RJ</option>
                        <option value="RN">RN</option>
                        <option value="RS">RS</option>
                        <option value="RO">RO</option>
                        <option value="RR">RR</option>
                        <option value="SC">SC</option>
                        <option value="SP">SP</option>
                        <option value="SE">SE</option>
                        <option value="TO">TO</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Dados da Proposta */}
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4 border-b pb-2">
                    Detalhes da Proposta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Tipo de Equipamento *
                      </label>
                      <select
                        required
                        value={formData.tipo_equipamento}
                        onChange={(e) => setFormData({ ...formData, tipo_equipamento: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Rastreador 4G Convencional">Rastreador 4G Convencional</option>
                        <option value="Rastreador 4G com Bloqueio">Rastreador 4G com Bloqueio</option>
                        <option value="Rastreador 5G Premium">Rastreador 5G Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Plano *
                      </label>
                      <select
                        required
                        value={formData.plano}
                        onChange={(e) => setFormData({ ...formData, plano: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      >
                        <option value="Plano Básico">Plano Básico</option>
                        <option value="Plano Intermediário">Plano Intermediário</option>
                        <option value="Plano Premium">Plano Premium</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Valor Mensal por Veículo *
                      </label>
                      <input
                        type="number"
                        required
                        step="0.01"
                        value={formData.valor_mensal}
                        onChange={(e) => setFormData({ ...formData, valor_mensal: parseFloat(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantidade de Veículos *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.quantidade_veiculos}
                        onChange={(e) => setFormData({ ...formData, quantidade_veiculos: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Prazo de Permanência (meses) *
                      </label>
                      <input
                        type="number"
                        required
                        min="1"
                        value={formData.prazo_permanencia}
                        onChange={(e) => setFormData({ ...formData, prazo_permanencia: parseInt(e.target.value) })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                      />
                    </div>

                    <div className="flex items-center">
                      <label className="flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={formData.instalacao_gratuita}
                          onChange={(e) => setFormData({
                            ...formData,
                            instalacao_gratuita: e.target.checked,
                            valor_instalacao: e.target.checked ? 0 : formData.valor_instalacao
                          })}
                          className="w-4 h-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">
                          Instalação Gratuita
                        </span>
                      </label>
                    </div>

                    {!formData.instalacao_gratuita && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Valor da Instalação
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          value={formData.valor_instalacao || 0}
                          onChange={(e) => setFormData({ ...formData, valor_instalacao: parseFloat(e.target.value) })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                        />
                      </div>
                    )}
                  </div>
                </div>

                {/* Resumo */}
                <div className="mb-6 bg-primary-50 p-4 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">Resumo da Proposta</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                      <span className="text-gray-600">Valor Mensal Total:</span>
                      <span className="font-bold text-primary-600 ml-2">
                        {formatCurrency((formData.valor_mensal || 0) * (formData.quantidade_veiculos || 1))}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-600">Instalação:</span>
                      <span className="font-bold text-primary-600 ml-2">
                        {formData.instalacao_gratuita ? 'GRATUITA' : formatCurrency(formData.valor_instalacao || 0)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Observações Adicionais
                  </label>
                  <textarea
                    value={formData.observacoes}
                    onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    placeholder="Informações complementares para a proposta..."
                  />
                </div>

                {/* Botões */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <button
                    type="button"
                    onClick={handleCloseModal}
                    className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
                  >
                    {editingProposta ? 'Atualizar' : 'Criar'} Proposta
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Visualização/PDF */}
        {viewingProposta && (
          <PropostaModal
            proposta={viewingProposta}
            onClose={() => setViewingProposta(null)}
          />
        )}
      </div>
    </MainLayout>
  )
}
