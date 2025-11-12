export interface User {
  id: string;
  username: string;
  isAuthenticated: boolean;
}

export interface Funcionaria {
  id: string;
  nome: string;
  cargo: string;
  isDona: boolean;
}

export interface Servico {
  id: string;
  nome: string;
  precoBase: number;
  duracaoMinutos: number;
  corPadrao: string;
}

export interface Agendamento {
  id: string;
  clienteNome: string;
  clienteWhatsapp: string;
  funcionariaId: string;
  servicoId: string;
  preco: number;
  duracaoMinutos: number;
  dataHora: Date;
  cor: string;
  observacoes?: string;
  status: 'agendado' | 'concluido' | 'nao_compareceu';
}

export interface Produto {
  id: string;
  nome: string;
  marca: string;
  quantidadeAtual: number;
  unidade: string;
  estoqueMinimo: number;
  custoUnitario: number;
}

export interface RegistroCompra {
  id: string;
  produtoId: string;
  quantidade: number;
  custoUnitario: number;
  valorTotal: number;
  dataCompra: Date;
}

export interface DashboardFilters {
  periodo: 'hoje' | 'semana' | 'mes' | 'personalizado';
  status?: 'todos' | 'agendado' | 'concluido' | 'nao_compareceu';
  dataInicio?: Date;
  dataFim?: Date;
}

export interface KPIs {
  faturamentoTotal: number;
  agendamentosConcluidos: number;
  ticketMedio: number;
  taxaComparecimento: number;
}