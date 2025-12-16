import { supabase } from '@/lib/supabase'
import { Fatura } from '@/types'

export const faturaService = {
  // Buscar todas as faturas
  async getAll(): Promise<Fatura[]> {
    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .order('data_vencimento', { ascending: false })

    if (error) {
      console.error('Erro ao buscar faturas:', error)
      throw error
    }

    return data || []
  },

  // Buscar faturas por cliente
  async getByClienteId(clienteId: string): Promise<Fatura[]> {
    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('data_vencimento', { ascending: false })

    if (error) {
      console.error('Erro ao buscar faturas do cliente:', error)
      throw error
    }

    return data || []
  },

  // Buscar faturas por mês
  async getByMonth(year: number, month: number): Promise<Fatura[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('faturas')
      .select('*')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
      .order('data_vencimento', { ascending: true })

    if (error) {
      console.error('Erro ao buscar faturas do mês:', error)
      throw error
    }

    return data || []
  },

  // Criar nova fatura
  async create(fatura: Omit<Fatura, 'id' | 'numero_fatura' | 'created_at' | 'updated_at'>): Promise<Fatura> {
    const { data, error } = await supabase
      .from('faturas')
      .insert([fatura])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar fatura:', error)
      throw error
    }

    return data
  },

  // Criar múltiplas faturas
  async createMany(faturas: Omit<Fatura, 'id' | 'numero_fatura' | 'created_at' | 'updated_at'>[]): Promise<Fatura[]> {
    const { data, error } = await supabase
      .from('faturas')
      .insert(faturas)
      .select()

    if (error) {
      console.error('Erro ao criar faturas:', error)
      throw error
    }

    return data || []
  },

  // Atualizar fatura
  async update(id: string, fatura: Partial<Fatura>): Promise<Fatura> {
    const { data, error } = await supabase
      .from('faturas')
      .update(fatura)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar fatura:', error)
      throw error
    }

    return data
  },

  // Excluir fatura
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('faturas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir fatura:', error)
      throw error
    }
  },

  // Toggle status pago/pendente
  async toggleStatus(id: string): Promise<Fatura> {
    // Primeiro busca a fatura
    const { data: fatura, error: fetchError } = await supabase
      .from('faturas')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar fatura:', fetchError)
      throw fetchError
    }

    // Atualiza o status
    const newStatus = fatura.status === 'pago' ? 'pendente' : 'pago'
    const { data, error } = await supabase
      .from('faturas')
      .update({ status: newStatus })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }

    return data
  },

  // Marcar como enviado no WhatsApp
  async markWhatsappSent(id: string): Promise<Fatura> {
    const { data, error } = await supabase
      .from('faturas')
      .update({ enviado_whatsapp: true })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao marcar WhatsApp:', error)
      throw error
    }

    return data
  },

  // Verificar se fatura já existe
  async checkExists(clienteId: string, dataVencimento: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('faturas')
      .select('id')
      .eq('cliente_id', clienteId)
      .eq('data_vencimento', dataVencimento)
      .single()

    if (error && error.code !== 'PGRST116') { // PGRST116 = not found
      console.error('Erro ao verificar fatura:', error)
      throw error
    }

    return !!data
  }
}
