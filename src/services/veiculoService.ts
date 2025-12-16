import { supabase } from '@/lib/supabase'
import { Veiculo } from '@/types'

export const veiculoService = {
  // Buscar veículos por cliente
  async getByClienteId(clienteId: string): Promise<Veiculo[]> {
    const { data, error } = await supabase
      .from('veiculos')
      .select('*')
      .eq('cliente_id', clienteId)
      .order('veiculo', { ascending: true })

    if (error) {
      console.error('Erro ao buscar veículos:', error)
      throw error
    }

    return data || []
  },

  // Criar novo veículo
  async create(veiculo: Omit<Veiculo, 'id' | 'created_at' | 'updated_at'>): Promise<Veiculo> {
    const { data, error } = await supabase
      .from('veiculos')
      .insert([veiculo])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar veículo:', error)
      throw error
    }

    return data
  },

  // Atualizar veículo
  async update(id: string, veiculo: Partial<Veiculo>): Promise<Veiculo> {
    const { data, error } = await supabase
      .from('veiculos')
      .update(veiculo)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar veículo:', error)
      throw error
    }

    return data
  },

  // Excluir veículo
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('veiculos')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir veículo:', error)
      throw error
    }
  }
}
