import { supabase } from '@/lib/supabase'
import { Despesa } from '@/types'

export const despesaService = {
  // Buscar todas as despesas
  async getAll(): Promise<Despesa[]> {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .order('data_vencimento', { ascending: false })

    if (error) {
      console.error('Erro ao buscar despesas:', error)
      throw error
    }

    return data || []
  },

  // Buscar despesas por mês
  async getByMonth(year: number, month: number): Promise<Despesa[]> {
    const startDate = `${year}-${month.toString().padStart(2, '0')}-01`
    const endDate = `${year}-${month.toString().padStart(2, '0')}-31`

    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .gte('data_vencimento', startDate)
      .lte('data_vencimento', endDate)
      .order('data_vencimento', { ascending: true })

    if (error) {
      console.error('Erro ao buscar despesas do mês:', error)
      throw error
    }

    return data || []
  },

  // Buscar despesas por categoria
  async getByCategoria(categoria: string): Promise<Despesa[]> {
    const { data, error } = await supabase
      .from('despesas')
      .select('*')
      .eq('categoria', categoria)
      .order('data_vencimento', { ascending: false })

    if (error) {
      console.error('Erro ao buscar despesas por categoria:', error)
      throw error
    }

    return data || []
  },

  // Criar nova despesa
  async create(despesa: Omit<Despesa, 'id' | 'created_at' | 'updated_at'>): Promise<Despesa> {
    const { data, error } = await supabase
      .from('despesas')
      .insert([despesa])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar despesa:', error)
      throw error
    }

    return data
  },

  // Atualizar despesa
  async update(id: string, despesa: Partial<Despesa>): Promise<Despesa> {
    const { data, error } = await supabase
      .from('despesas')
      .update(despesa)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar despesa:', error)
      throw error
    }

    return data
  },

  // Excluir despesa
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('despesas')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir despesa:', error)
      throw error
    }
  },

  // Toggle status pago/pendente
  async toggleStatus(id: string): Promise<Despesa> {
    // Primeiro busca a despesa
    const { data: despesa, error: fetchError } = await supabase
      .from('despesas')
      .select('status')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar despesa:', fetchError)
      throw fetchError
    }

    // Atualiza o status
    const newStatus = despesa.status === 'pago' ? 'pendente' : 'pago'
    const updateData: Partial<Despesa> = { status: newStatus }

    // Se está marcando como pago, adiciona data de pagamento
    if (newStatus === 'pago') {
      updateData.data_pagamento = new Date().toISOString().split('T')[0]
    } else {
      updateData.data_pagamento = undefined
    }

    const { data, error } = await supabase
      .from('despesas')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar status:', error)
      throw error
    }

    return data
  }
}
