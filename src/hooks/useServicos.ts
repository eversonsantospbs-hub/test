import { useState, useCallback } from 'react';
import { Servico } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { DataTransformers } from '../utils/dataTransformers';

export function useServicos() {
  const [servicos, setServicos] = useState<Servico[]>([]);
  const [loading, setLoading] = useState(false);

  const loadServicos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getServicos();
      const servicosFormatados: Servico[] = data.map(DataTransformers.dbToServico);
      setServicos(servicosFormatados);
    } catch (error) {
      console.error('Erro ao carregar serviços:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarServico = useCallback(async (servico: Omit<Servico, 'id'>) => {
    try {
      const dbData = DataTransformers.servicoToDb(servico);
      const data = await SupabaseService.createServico(dbData);
      const novoServico = DataTransformers.dbToServico(data);
      setServicos(prev => [...prev, novoServico]);
    } catch (error) {
      console.error('Erro ao adicionar serviço:', error);
      throw error;
    }
  }, []);

  const editarServico = useCallback(async (id: string, servico: Omit<Servico, 'id'>) => {
    try {
      const dbData = DataTransformers.servicoToDb(servico);
      await SupabaseService.updateServico(id, dbData);
      setServicos(prev => 
        prev.map(s => s.id === id ? { ...servico, id } : s)
      );
    } catch (error) {
      console.error('Erro ao editar serviço:', error);
      throw error;
    }
  }, []);

  const excluirServico = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteServico(id);
      setServicos(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error('Erro ao excluir serviço:', error);
      throw error;
    }
  }, []);

  return {
    servicos,
    loading,
    loadServicos,
    adicionarServico,
    editarServico,
    excluirServico
  };
}