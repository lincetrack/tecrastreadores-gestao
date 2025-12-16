import { supabase } from '@/lib/supabase'
import { Cliente } from '@/types'

export const clienteService = {
  // Buscar todos os clientes
  async getAll(): Promise<Cliente[]> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        veiculos (*)
      `)
      .order('nome', { ascending: true })

    if (error) {
      console.error('Erro ao buscar clientes:', error)
      throw error
    }

    return data || []
  },

  // Buscar cliente por ID
  async getById(id: string): Promise<Cliente | null> {
    const { data, error } = await supabase
      .from('clientes')
      .select(`
        *,
        veiculos (*)
      `)
      .eq('id', id)
      .single()

    if (error) {
      console.error('Erro ao buscar cliente:', error)
      throw error
    }

    return data
  },

  // Criar novo cliente
  async create(cliente: Omit<Cliente, 'id' | 'created_at' | 'updated_at'>): Promise<Cliente> {
    const { veiculos, ...clienteData } = cliente

    const { data, error } = await supabase
      .from('clientes')
      .insert([clienteData])
      .select()
      .single()

    if (error) {
      console.error('Erro ao criar cliente:', error)
      throw error
    }

    return data
  },

  // Atualizar cliente
  async update(id: string, cliente: Partial<Cliente>): Promise<Cliente> {
    const { veiculos, ...clienteData } = cliente

    const { data, error } = await supabase
      .from('clientes')
      .update(clienteData)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Erro ao atualizar cliente:', error)
      throw error
    }

    return data
  },

  // Excluir cliente
  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('clientes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Erro ao excluir cliente:', error)
      throw error
    }
  },

  // Toggle status ativo/inativo
  async toggleAtivo(id: string): Promise<Cliente> {
    // Primeiro busca o cliente
    const { data: cliente, error: fetchError } = await supabase
      .from('clientes')
      .select('ativo')
      .eq('id', id)
      .single()

    if (fetchError) {
      console.error('Erro ao buscar cliente:', fetchError)
      throw fetchError
    }

    // Atualiza o status
    const { data, error } = await supabase
      .from('clientes')
      .update({ ativo: !cliente.ativo })
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
