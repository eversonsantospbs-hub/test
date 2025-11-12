"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Produto } from '@/types';
import { toast } from 'sonner';

const produtoSchema = z.object({
  nome: z.string().min(1, 'Nome do produto é obrigatório'),
  marca: z.string().min(1, 'Marca é obrigatória'),
  quantidadeAtual: z.number().min(0, 'Quantidade deve ser maior ou igual a zero'),
  unidade: z.string().min(1, 'Unidade é obrigatória'),
  estoqueMinimo: z.number().min(0, 'Estoque mínimo deve ser maior ou igual a zero'),
  custoUnitario: z.number().min(0, 'Custo unitário deve ser maior que zero')
});

type ProdutoFormData = z.infer<typeof produtoSchema>;

interface FormularioProdutoProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: Produto;
}

const unidadesPadrao = [
  'un', 'kg', 'g', 'l', 'ml', 'cx', 'pct', 'm', 'cm'
];

export function FormularioProduto({
  isOpen,
  onClose,
  produto
}: FormularioProdutoProps) {
  const { adicionarProduto, editarProduto } = useAppData();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ProdutoFormData>({
    resolver: zodResolver(produtoSchema)
  });

  // Preencher formulário quando produto for passado
  useEffect(() => {
    if (produto) {
      reset({
        nome: produto.nome,
        marca: produto.marca,
        quantidadeAtual: produto.quantidadeAtual,
        unidade: produto.unidade,
        estoqueMinimo: produto.estoqueMinimo,
        custoUnitario: produto.custoUnitario
      });
    } else {
      reset({
        nome: '',
        marca: '',
        quantidadeAtual: 0,
        unidade: 'un',
        estoqueMinimo: 1,
        custoUnitario: 0
      });
    }
  }, [produto, reset]);

  const onSubmit = async (data: ProdutoFormData) => {
    try {
      const novoProduto: Omit<Produto, 'id'> = {
        nome: data.nome,
        marca: data.marca,
        quantidadeAtual: data.quantidadeAtual,
        unidade: data.unidade,
        estoqueMinimo: data.estoqueMinimo,
        custoUnitario: data.custoUnitario
      };

      if (produto) {
        // Editar produto existente
        editarProduto(produto.id, novoProduto);
        toast.success('Produto atualizado com sucesso!');
      } else {
        // Criar novo produto
        adicionarProduto(novoProduto);
        toast.success('Produto criado com sucesso!');
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao salvar produto. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {produto ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Produto</Label>
            <Input
              id="nome"
              {...register('nome')}
              className={errors.nome ? 'border-red-500' : ''}
              placeholder="Ex: Shampoo Hidratante"
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="marca">Marca</Label>
            <Input
              id="marca"
              {...register('marca')}
              className={errors.marca ? 'border-red-500' : ''}
              placeholder="Ex: L'Oréal"
            />
            {errors.marca && (
              <p className="text-sm text-red-500">{errors.marca.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantidadeAtual">Quantidade Atual</Label>
              <Input
                id="quantidadeAtual"
                type="number"
                step="0.01"
                {...register('quantidadeAtual', { valueAsNumber: true })}
                className={errors.quantidadeAtual ? 'border-red-500' : ''}
              />
              {errors.quantidadeAtual && (
                <p className="text-sm text-red-500">{errors.quantidadeAtual.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Unidade</Label>
              <Select onValueChange={(value) => setValue('unidade', value)}>
                <SelectTrigger className={errors.unidade ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {unidadesPadrao.map((unidade) => (
                    <SelectItem key={unidade} value={unidade}>
                      {unidade}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unidade && (
                <p className="text-sm text-red-500">{errors.unidade.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estoqueMinimo">Estoque Mínimo</Label>
              <Input
                id="estoqueMinimo"
                type="number"
                step="0.01"
                {...register('estoqueMinimo', { valueAsNumber: true })}
                className={errors.estoqueMinimo ? 'border-red-500' : ''}
              />
              {errors.estoqueMinimo && (
                <p className="text-sm text-red-500">{errors.estoqueMinimo.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="custoUnitario">Custo Unitário (R$)</Label>
              <Input
                id="custoUnitario"
                type="number"
                step="0.01"
                {...register('custoUnitario', { valueAsNumber: true })}
                className={errors.custoUnitario ? 'border-red-500' : ''}
              />
              {errors.custoUnitario && (
                <p className="text-sm text-red-500">{errors.custoUnitario.message}</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-pink-600 hover:bg-pink-700"
            >
              {isSubmitting ? 'Salvando...' : (produto ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}