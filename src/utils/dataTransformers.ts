import { Funcionaria, Servico, Agendamento, Produto, RegistroCompra } from '@/types';
import { 
  DatabaseFuncionaria, 
  DatabaseServico, 
  DatabaseAgendamento, 
  DatabaseProduto, 
  DatabaseRegistroCompra 
} from '@/services/supabaseService';

export class DataTransformers {
  // Funcionárias
  static dbToFuncionaria(db: DatabaseFuncionaria): Funcionaria {
    return {
      id: db.id,
      nome: db.nome,
      cargo: db.cargo,
      isDona: db.is_dona
    };
  }

  static funcionariaToDb(funcionaria: Omit<Funcionaria, 'id'>) {
    return {
      nome: funcionaria.nome,
      cargo: funcionaria.cargo,
      is_dona: funcionaria.isDona
    };
  }

  // Serviços
  static dbToServico(db: DatabaseServico): Servico {
    return {
      id: db.id,
      nome: db.nome,
      precoBase: parseFloat(db.preco_base),
      duracaoMinutos: db.duracao_minutos,
      corPadrao: db.cor_padrao
    };
  }

  static servicoToDb(servico: Omit<Servico, 'id'>) {
    return {
      nome: servico.nome,
      preco_base: servico.precoBase,
      duracao_minutos: servico.duracaoMinutos,
      cor_padrao: servico.corPadrao
    };
  }

  // Agendamentos
  static dbToAgendamento(db: DatabaseAgendamento): Agendamento {
    return {
      id: db.id,
      clienteNome: db.cliente_nome,
      clienteWhatsapp: db.cliente_whatsapp,
      funcionariaId: db.funcionaria_id,
      servicoId: db.servico_id,
      preco: parseFloat(db.preco),
      duracaoMinutos: db.duracao_minutos,
      dataHora: new Date(db.data_hora),
      cor: db.cor,
      observacoes: db.observacoes,
      status: db.status as 'agendado' | 'concluido' | 'nao_compareceu'
    };
  }

  static agendamentoToDb(agendamento: Omit<Agendamento, 'id'>) {
    return {
      cliente_nome: agendamento.clienteNome,
      cliente_whatsapp: agendamento.clienteWhatsapp,
      funcionaria_id: agendamento.funcionariaId,
      servico_id: agendamento.servicoId,
      preco: agendamento.preco,
      duracao_minutos: agendamento.duracaoMinutos,
      data_hora: agendamento.dataHora.toISOString(),
      cor: agendamento.cor,
      observacoes: agendamento.observacoes,
      status: agendamento.status
    };
  }

  static agendamentoPartialToDb(agendamento: Partial<Omit<Agendamento, 'id'>>) {
    const updateData: any = {};
    
    if (agendamento.clienteNome !== undefined) updateData.cliente_nome = agendamento.clienteNome;
    if (agendamento.clienteWhatsapp !== undefined) updateData.cliente_whatsapp = agendamento.clienteWhatsapp;
    if (agendamento.funcionariaId !== undefined) updateData.funcionaria_id = agendamento.funcionariaId;
    if (agendamento.servicoId !== undefined) updateData.servico_id = agendamento.servicoId;
    if (agendamento.preco !== undefined) updateData.preco = agendamento.preco;
    if (agendamento.duracaoMinutos !== undefined) updateData.duracao_minutos = agendamento.duracaoMinutos;
    if (agendamento.dataHora !== undefined) updateData.data_hora = agendamento.dataHora.toISOString();
    if (agendamento.cor !== undefined) updateData.cor = agendamento.cor;
    if (agendamento.observacoes !== undefined) updateData.observacoes = agendamento.observacoes;
    if (agendamento.status !== undefined) updateData.status = agendamento.status;

    return updateData;
  }

  // Produtos
  static dbToProduto(db: DatabaseProduto): Produto {
    return {
      id: db.id,
      nome: db.nome,
      marca: db.marca,
      quantidadeAtual: db.quantidade_atual,
      unidade: db.unidade,
      estoqueMinimo: db.estoque_minimo,
      custoUnitario: parseFloat(db.custo_unitario)
    };
  }

  static produtoToDb(produto: Omit<Produto, 'id'>) {
    return {
      nome: produto.nome,
      marca: produto.marca,
      quantidade_atual: produto.quantidadeAtual,
      unidade: produto.unidade,
      estoque_minimo: produto.estoqueMinimo,
      custo_unitario: produto.custoUnitario
    };
  }

  // Registros de Compra
  static dbToRegistroCompra(db: DatabaseRegistroCompra): RegistroCompra {
    return {
      id: db.id,
      produtoId: db.produto_id,
      quantidade: db.quantidade,
      custoUnitario: parseFloat(db.custo_unitario),
      valorTotal: parseFloat(db.valor_total),
      dataCompra: new Date(db.data_compra)
    };
  }

  static registroCompraToDb(compra: Omit<RegistroCompra, 'id'>) {
    return {
      produto_id: compra.produtoId,
      quantidade: compra.quantidade,
      custo_unitario: compra.custoUnitario,
      valor_total: compra.valorTotal,
      data_compra: compra.dataCompra.toISOString()
    };
  }
}