import { PropostaComercial } from '@/types'
import { supabase } from '@/lib/supabase'

const STORAGE_KEY = 'lince-track-propostas'

class PropostaService {
  private async useSupabase(): Promise<boolean> {
    try {
      const { data, error } = await supabase.from('propostas_comerciais').select('id').limit(1)
      return !error
    } catch {
      return false
    }
  }

  private getAll(): PropostaComercial[] {
    if (typeof window === 'undefined') return []
    const data = localStorage.getItem(STORAGE_KEY)
    return data ? JSON.parse(data) : []
  }

  private save(propostas: PropostaComercial[]): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(propostas))
  }

  async getAllPropostas(): Promise<PropostaComercial[]> {
    const useDb = await this.useSupabase()

    if (useDb) {
      const { data, error } = await supabase
        .from('propostas_comerciais')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Erro ao buscar propostas:', error)
        return this.getAll()
      }

      return data || []
    }

    return this.getAll()
  }

  async getPropostaById(id: string): Promise<PropostaComercial | null> {
    const useDb = await this.useSupabase()

    if (useDb) {
      const { data, error } = await supabase
        .from('propostas_comerciais')
        .select('*')
        .eq('id', id)
        .single()

      if (error) {
        console.error('Erro ao buscar proposta:', error)
        return null
      }

      return data
    }

    const propostas = this.getAll()
    return propostas.find(p => p.id === id) || null
  }

  async createProposta(proposta: Omit<PropostaComercial, 'id' | 'numero_proposta' | 'created_at' | 'updated_at'>): Promise<PropostaComercial> {
    const useDb = await this.useSupabase()

    if (useDb) {
      const { data, error } = await supabase
        .from('propostas_comerciais')
        .insert([proposta])
        .select()
        .single()

      if (error) {
        console.error('Erro ao criar proposta:', error)
        throw new Error('Erro ao criar proposta no banco de dados')
      }

      return data
    }

    // Fallback para localStorage
    const propostas = this.getAll()
    const maxNumero = propostas.length > 0
      ? Math.max(...propostas.map(p => p.numero_proposta))
      : 0

    const novaProposta: PropostaComercial = {
      ...proposta,
      id: Date.now().toString(),
      numero_proposta: maxNumero + 1,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    propostas.push(novaProposta)
    this.save(propostas)
    return novaProposta
  }

  async updateProposta(id: string, data: Partial<PropostaComercial>): Promise<PropostaComercial | null> {
    const useDb = await this.useSupabase()

    if (useDb) {
      const { data: updated, error } = await supabase
        .from('propostas_comerciais')
        .update(data)
        .eq('id', id)
        .select()
        .single()

      if (error) {
        console.error('Erro ao atualizar proposta:', error)
        return null
      }

      return updated
    }

    // Fallback para localStorage
    const propostas = this.getAll()
    const index = propostas.findIndex(p => p.id === id)

    if (index === -1) return null

    propostas[index] = {
      ...propostas[index],
      ...data,
      updated_at: new Date().toISOString()
    }

    this.save(propostas)
    return propostas[index]
  }

  async deleteProposta(id: string): Promise<boolean> {
    const useDb = await this.useSupabase()

    if (useDb) {
      const { error } = await supabase
        .from('propostas_comerciais')
        .delete()
        .eq('id', id)

      if (error) {
        console.error('Erro ao deletar proposta:', error)
        return false
      }

      return true
    }

    // Fallback para localStorage
    const propostas = this.getAll()
    const filtered = propostas.filter(p => p.id !== id)

    if (filtered.length === propostas.length) return false

    this.save(filtered)
    return true
  }

  async updateStatus(id: string, status: PropostaComercial['status']): Promise<PropostaComercial | null> {
    return this.updateProposta(id, { status })
  }
}

export const propostaService = new PropostaService()
