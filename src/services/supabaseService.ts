import { supabase } from '../lib/supabase';

// Tipos para transformação de dados
export interface DatabaseFuncionaria {
  id: string;
  nome: string;
  cargo: string;
  is_dona: boolean;
  created_at: string;
}

export interface DatabaseServico {
  id: string;
  nome: string;
  preco_base: string;
  duracao_minutos: number;
  cor_padrao: string;
  created_at: string;
}

export interface DatabaseAgendamento {
  id: string;
  cliente_nome: string;
  cliente_whatsapp: string;
  funcionaria_id: string;
  servico_id: string;
  preco: string;
  duracao_minutos: number;
  data_hora: string;
  cor: string;
  observacoes?: string;
  status: string;
  created_at: string;
}

export interface DatabaseProduto {
  id: string;
  nome: string;
  marca: string;
  quantidade_atual: number;
  unidade: string;
  estoque_minimo: number;
  custo_unitario: string;
  created_at: string;
}

export interface DatabaseRegistroCompra {
  id: string;
  produto_id: string;
  quantidade: number;
  custo_unitario: string;
  valor_total: string;
  data_compra: string;
  created_at: string;
}

// Serviços CRUD genéricos
export class SupabaseService {
  // Funcionárias
  static async getFuncionarias(): Promise<DatabaseFuncionaria[]> {
    const { data, error } = await supabase
      .from('funcionarias')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createFuncionaria(funcionaria: { nome: string; cargo: string; is_dona: boolean }): Promise<DatabaseFuncionaria> {
    const { data, error } = await supabase
      .from('funcionarias')
      .insert([funcionaria])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateFuncionaria(id: string, funcionaria: { nome: string; cargo: string; is_dona: boolean }): Promise<void> {
    const { error } = await supabase
      .from('funcionarias')
      .update(funcionaria)
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteFuncionaria(id: string): Promise<void> {
    const { error } = await supabase
      .from('funcionarias')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Serviços
  static async getServicos(): Promise<DatabaseServico[]> {
    const { data, error } = await supabase
      .from('servicos')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createServico(servico: { nome: string; preco_base: number; duracao_minutos: number; cor_padrao: string }): Promise<DatabaseServico> {
    const { data, error } = await supabase
      .from('servicos')
      .insert([servico])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateServico(id: string, servico: { nome: string; preco_base: number; duracao_minutos: number; cor_padrao: string }): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .update(servico)
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteServico(id: string): Promise<void> {
    const { error } = await supabase
      .from('servicos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Agendamentos
  static async getAgendamentos(): Promise<DatabaseAgendamento[]> {
    const { data, error } = await supabase
      .from('agendamentos')
      .select('*')
      .order('data_hora', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createAgendamento(agendamento: {
    cliente_nome: string;
    cliente_whatsapp: string;
    funcionaria_id: string;
    servico_id: string;
    preco: number;
    duracao_minutos: number;
    data_hora: string;
    cor: string;
    observacoes?: string;
    status: string;
  }): Promise<DatabaseAgendamento> {
    const { data, error } = await supabase
      .from('agendamentos')
      .insert([agendamento])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateAgendamento(id: string, agendamento: Partial<{
    cliente_nome: string;
    cliente_whatsapp: string;
    funcionaria_id: string;
    servico_id: string;
    preco: number;
    duracao_minutos: number;
    data_hora: string;
    cor: string;
    observacoes?: string;
    status: string;
  }>): Promise<void> {
    const { error } = await supabase
      .from('agendamentos')
      .update(agendamento)
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteAgendamento(id: string): Promise<void> {
    const { error } = await supabase
      .from('agendamentos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  // Produtos
  static async getProdutos(): Promise<DatabaseProduto[]> {
    const { data, error } = await supabase
      .from('produtos')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    return data || [];
  }

  static async createProduto(produto: {
    nome: string;
    marca: string;
    quantidade_atual: number;
    unidade: string;
    estoque_minimo: number;
    custo_unitario: number;
  }): Promise<DatabaseProduto> {
    const { data, error } = await supabase
      .from('produtos')
      .insert([produto])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async updateProduto(id: string, produto: {
    nome: string;
    marca: string;
    quantidade_atual: number;
    unidade: string;
    estoque_minimo: number;
    custo_unitario: number;
  }): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .update(produto)
      .eq('id', id);
    
    if (error) throw error;
  }

  static async deleteProduto(id: string): Promise<void> {
    const { error } = await supabase
      .from('produtos')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
  }

  static async updateProdutoEstoque(id: string, quantidade: number): Promise<void> {
    // Primeiro buscar a quantidade atual
    const { data: produto, error: selectError } = await supabase
      .from('produtos')
      .select('quantidade_atual')
      .eq('id', id)
      .single();

    if (selectError) throw selectError;

    // Calcular nova quantidade
    const novaQuantidade = produto.quantidade_atual + quantidade;

    // Atualizar com a nova quantidade
    const { error: updateError } = await supabase
      .from('produtos')
      .update({ quantidade_atual: novaQuantidade })
      .eq('id', id);
    
    if (updateError) throw updateError;
  }

  // Registros de Compra
  static async getRegistrosCompra(): Promise<DatabaseRegistroCompra[]> {
    const { data, error } = await supabase
      .from('registros_compra')
      .select('*')
      .order('data_compra', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  static async createRegistroCompra(compra: {
    produto_id: string;
    quantidade: number;
    custo_unitario: number;
    valor_total: number;
    data_compra: string;
  }): Promise<DatabaseRegistroCompra> {
    const { data, error } = await supabase
      .from('registros_compra')
      .insert([compra])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }
}