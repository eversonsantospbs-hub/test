import { useState, useCallback } from 'react';
import { Funcionaria } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { DataTransformers } from '../utils/dataTransformers';

export function useFuncionarias() {
  const [funcionarias, setFuncionarias] = useState<Funcionaria[]>([]);
  const [loading, setLoading] = useState(false);

  const loadFuncionarias = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getFuncionarias();
      const funcionariasFormatadas: Funcionaria[] = data.map(DataTransformers.dbToFuncionaria);
      setFuncionarias(funcionariasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar funcionárias:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarFuncionaria = useCallback(async (funcionaria: Omit<Funcionaria, 'id'>) => {
    try {
      const dbData = DataTransformers.funcionariaToDb(funcionaria);
      const data = await SupabaseService.createFuncionaria(dbData);
      const novaFuncionaria = DataTransformers.dbToFuncionaria(data);
      setFuncionarias(prev => [...prev, novaFuncionaria]);
    } catch (error) {
      console.error('Erro ao adicionar funcionária:', error);
      throw error;
    }
  }, []);

  const editarFuncionaria = useCallback(async (id: string, funcionaria: Omit<Funcionaria, 'id'>) => {
    try {
      const dbData = DataTransformers.funcionariaToDb(funcionaria);
      await SupabaseService.updateFuncionaria(id, dbData);
      setFuncionarias(prev => 
        prev.map(f => f.id === id ? { ...funcionaria, id } : f)
      );
    } catch (error) {
      console.error('Erro ao editar funcionária:', error);
      throw error;
    }
  }, []);

  const excluirFuncionaria = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteFuncionaria(id);
      setFuncionarias(prev => prev.filter(f => f.id !== id));
    } catch (error) {
      console.error('Erro ao excluir funcionária:', error);
      throw error;
    }
  }, []);

  return {
    funcionarias,
    loading,
    loadFuncionarias,
    adicionarFuncionaria,
    editarFuncionaria,
    excluirFuncionaria
  };
}