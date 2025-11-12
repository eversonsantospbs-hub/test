import { useState, useCallback } from 'react';
import { Agendamento } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { DataTransformers } from '../utils/dataTransformers';

export function useAgendamentos() {
  const [agendamentos, setAgendamentos] = useState<Agendamento[]>([]);
  const [loading, setLoading] = useState(false);

  const loadAgendamentos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getAgendamentos();
      const agendamentosFormatados: Agendamento[] = data.map(DataTransformers.dbToAgendamento);
      setAgendamentos(agendamentosFormatados);
    } catch (error) {
      console.error('Erro ao carregar agendamentos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarAgendamento = useCallback(async (agendamento: Omit<Agendamento, 'id'>) => {
    try {
      const dbData = DataTransformers.agendamentoToDb(agendamento);
      const data = await SupabaseService.createAgendamento(dbData);
      const novoAgendamento = DataTransformers.dbToAgendamento(data);
      setAgendamentos(prev => [...prev, novoAgendamento]);
    } catch (error) {
      console.error('Erro ao adicionar agendamento:', error);
      throw error;
    }
  }, []);

  const editarAgendamento = useCallback(async (id: string, agendamento: Partial<Omit<Agendamento, 'id'>>) => {
    try {
      const dbData = DataTransformers.agendamentoPartialToDb(agendamento);
      await SupabaseService.updateAgendamento(id, dbData);
      setAgendamentos(prev => 
        prev.map(a => a.id === id ? { ...a, ...agendamento } : a)
      );
    } catch (error) {
      console.error('Erro ao editar agendamento:', error);
      throw error;
    }
  }, []);

  const excluirAgendamento = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteAgendamento(id);
      setAgendamentos(prev => prev.filter(a => a.id !== id));
    } catch (error) {
      console.error('Erro ao excluir agendamento:', error);
      throw error;
    }
  }, []);

  return {
    agendamentos,
    loading,
    loadAgendamentos,
    adicionarAgendamento,
    editarAgendamento,
    excluirAgendamento
  };
}