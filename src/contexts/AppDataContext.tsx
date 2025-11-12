"use client";

import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { Funcionaria, Servico, Agendamento, Produto, RegistroCompra } from '../types';
import { useFuncionarias } from '../hooks/useFuncionarias';
import { useServicos } from '../hooks/useServicos';
import { useAgendamentos } from '../hooks/useAgendamentos';
import { useProdutos } from '../hooks/useProdutos';

interface AppDataContextType {
  // Estados de loading
  loading: boolean;
  
  // Funcionárias
  funcionarias: Funcionaria[];
  adicionarFuncionaria: (funcionaria: Omit<Funcionaria, 'id'>) => Promise<void>;
  editarFuncionaria: (id: string, funcionaria: Omit<Funcionaria, 'id'>) => Promise<void>;
  excluirFuncionaria: (id: string) => Promise<void>;

  // Serviços
  servicos: Servico[];
  adicionarServico: (servico: Omit<Servico, 'id'>) => Promise<void>;
  editarServico: (id: string, servico: Omit<Servico, 'id'>) => Promise<void>;
  excluirServico: (id: string) => Promise<void>;

  // Agendamentos
  agendamentos: Agendamento[];
  adicionarAgendamento: (agendamento: Omit<Agendamento, 'id'>) => Promise<void>;
  editarAgendamento: (id: string, agendamento: Partial<Omit<Agendamento, 'id'>>) => Promise<void>;
  excluirAgendamento: (id: string) => Promise<void>;

  // Produtos
  produtos: Produto[];
  adicionarProduto: (produto: Omit<Produto, 'id'>) => Promise<void>;
  editarProduto: (id: string, produto: Omit<Produto, 'id'>) => Promise<void>;
  excluirProduto: (id: string) => Promise<void>;

  // Compras
  registrosCompra: RegistroCompra[];
  adicionarCompra: (compra: Omit<RegistroCompra, 'id'>) => Promise<void>;
}

const AppDataContext = createContext<AppDataContextType | undefined>(undefined);

export function useAppData() {
  const context = useContext(AppDataContext);
  if (context === undefined) {
    throw new Error('useAppData must be used within an AppDataProvider');
  }
  return context;
}

interface AppDataProviderProps {
  children: ReactNode;
}

export function AppDataProvider({ children }: AppDataProviderProps) {
  // Usar hooks modulares
  const funcionariasHook = useFuncionarias();
  const servicosHook = useServicos();
  const agendamentosHook = useAgendamentos();
  const produtosHook = useProdutos();

  // Estado de loading combinado
  const loading = funcionariasHook.loading || servicosHook.loading || 
                 agendamentosHook.loading || produtosHook.loading;

  // Carregar dados iniciais
  useEffect(() => {
    const loadAllData = async () => {
      try {
        await Promise.all([
          funcionariasHook.loadFuncionarias(),
          servicosHook.loadServicos(),
          agendamentosHook.loadAgendamentos(),
          produtosHook.loadProdutos(),
          produtosHook.loadRegistrosCompra()
        ]);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      }
    };

    loadAllData();
  }, []);

  const value: AppDataContextType = {
    loading,
    
    // Funcionárias
    funcionarias: funcionariasHook.funcionarias,
    adicionarFuncionaria: funcionariasHook.adicionarFuncionaria,
    editarFuncionaria: funcionariasHook.editarFuncionaria,
    excluirFuncionaria: funcionariasHook.excluirFuncionaria,

    // Serviços
    servicos: servicosHook.servicos,
    adicionarServico: servicosHook.adicionarServico,
    editarServico: servicosHook.editarServico,
    excluirServico: servicosHook.excluirServico,

    // Agendamentos
    agendamentos: agendamentosHook.agendamentos,
    adicionarAgendamento: agendamentosHook.adicionarAgendamento,
    editarAgendamento: agendamentosHook.editarAgendamento,
    excluirAgendamento: agendamentosHook.excluirAgendamento,

    // Produtos
    produtos: produtosHook.produtos,
    adicionarProduto: produtosHook.adicionarProduto,
    editarProduto: produtosHook.editarProduto,
    excluirProduto: produtosHook.excluirProduto,

    // Compras
    registrosCompra: produtosHook.registrosCompra,
    adicionarCompra: produtosHook.adicionarCompra
  };

  return (
    <AppDataContext.Provider value={value}>
      {children}
    </AppDataContext.Provider>
  );
}