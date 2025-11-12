import { useState, useCallback } from 'react';
import { Produto, RegistroCompra } from '../types';
import { SupabaseService } from '../services/supabaseService';
import { DataTransformers } from '../utils/dataTransformers';

export function useProdutos() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [registrosCompra, setRegistrosCompra] = useState<RegistroCompra[]>([]);
  const [loading, setLoading] = useState(false);

  const loadProdutos = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getProdutos();
      const produtosFormatados: Produto[] = data.map(DataTransformers.dbToProduto);
      setProdutos(produtosFormatados);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const loadRegistrosCompra = useCallback(async () => {
    try {
      setLoading(true);
      const data = await SupabaseService.getRegistrosCompra();
      const comprasFormatadas: RegistroCompra[] = data.map(DataTransformers.dbToRegistroCompra);
      setRegistrosCompra(comprasFormatadas);
    } catch (error) {
      console.error('Erro ao carregar registros de compra:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  }, []);

  const adicionarProduto = useCallback(async (produto: Omit<Produto, 'id'>) => {
    try {
      const dbData = DataTransformers.produtoToDb(produto);
      const data = await SupabaseService.createProduto(dbData);
      const novoProduto = DataTransformers.dbToProduto(data);
      setProdutos(prev => [...prev, novoProduto]);
    } catch (error) {
      console.error('Erro ao adicionar produto:', error);
      throw error;
    }
  }, []);

  const editarProduto = useCallback(async (id: string, produto: Omit<Produto, 'id'>) => {
    try {
      const dbData = DataTransformers.produtoToDb(produto);
      await SupabaseService.updateProduto(id, dbData);
      setProdutos(prev => 
        prev.map(p => p.id === id ? { ...produto, id } : p)
      );
    } catch (error) {
      console.error('Erro ao editar produto:', error);
      throw error;
    }
  }, []);

  const excluirProduto = useCallback(async (id: string) => {
    try {
      await SupabaseService.deleteProduto(id);
      setProdutos(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      throw error;
    }
  }, []);

  const adicionarCompra = useCallback(async (compra: Omit<RegistroCompra, 'id'>) => {
    try {
      const dbData = DataTransformers.registroCompraToDb(compra);
      const data = await SupabaseService.createRegistroCompra(dbData);
      const novaCompra = DataTransformers.dbToRegistroCompra(data);
      
      setRegistrosCompra(prev => [...prev, novaCompra]);

      // Atualizar estoque do produto
      await SupabaseService.updateProdutoEstoque(compra.produtoId, compra.quantidade);
      
      // Atualizar estado local do produto
      setProdutos(prev => 
        prev.map(p => 
          p.id === compra.produtoId 
            ? { ...p, quantidadeAtual: p.quantidadeAtual + compra.quantidade }
            : p
        )
      );

    } catch (error) {
      console.error('Erro ao adicionar compra:', error);
      throw error;
    }
  }, []);

  return {
    produtos,
    registrosCompra,
    loading,
    loadProdutos,
    loadRegistrosCompra,
    adicionarProduto,
    editarProduto,
    excluirProduto,
    adicionarCompra
  };
}