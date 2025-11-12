"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Produto } from '@/types';
import { toast } from 'sonner';

const compraSchema = z.object({
  quantidade: z.number().min(0.01, 'Quantidade deve ser maior que zero'),
  custoUnitario: z.number().min(0, 'Custo unitário deve ser maior ou igual a zero')
});

type CompraFormData = z.infer<typeof compraSchema>;

interface FormularioCompraProps {
  isOpen: boolean;
  onClose: () => void;
  produto?: Produto;
}

export function FormularioCompra({
  isOpen,
  onClose,
  produto
}: FormularioCompraProps) {
  const { adicionarCompra } = useAppData();

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<CompraFormData>({
    resolver: zodResolver(compraSchema)
  });

  const quantidade = watch('quantidade') || 0;
  const custoUnitario = watch('custoUnitario') || 0;
  const valorTotal = quantidade * custoUnitario;

  // Preencher formulário quando produto for passado
  useEffect(() => {
    if (produto) {
      reset({
        quantidade: 1,
        custoUnitario: produto.custoUnitario
      });
    }
  }, [produto, reset]);

  const onSubmit = async (data: CompraFormData) => {
    if (!produto) return;

    try {
      const novaCompra = {
        produtoId: produto.id,
        quantidade: data.quantidade,
        custoUnitario: data.custoUnitario,
        valorTotal: data.quantidade * data.custoUnitario,
        dataCompra: new Date()
      };

      adicionarCompra(novaCompra);
      toast.success(`Estoque de ${produto.nome} atualizado com sucesso!`);
      onClose();
    } catch (error) {
      toast.error('Erro ao registrar compra. Tente novamente.');
    }
  };

  if (!produto) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Estoque</DialogTitle>
        </DialogHeader>

        <div className="mb-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-gray-900">{produto.nome}</h3>
          <p className="text-sm text-gray-600">{produto.marca}</p>
          <p className="text-sm text-gray-600">
            Estoque atual: <span className="font-medium">{produto.quantidadeAtual} {produto.unidade}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade Comprada</Label>
            <Input
              id="quantidade"
              type="number"
              step="0.01"
              {...register('quantidade', { valueAsNumber: true })}
              className={errors.quantidade ? 'border-red-500' : ''}
              placeholder="Ex: 10"
            />
            {errors.quantidade && (
              <p className="text-sm text-red-500">{errors.quantidade.message}</p>
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
              placeholder="Ex: 15.50"
            />
            {errors.custoUnitario && (
              <p className="text-sm text-red-500">{errors.custoUnitario.message}</p>
            )}
          </div>

          {/* Resumo da compra */}
          <div className="p-4 bg-blue-50 rounded-lg space-y-2">
            <h4 className="font-medium text-blue-900">Resumo da Compra</h4>
            <div className="text-sm space-y-1">
              <div className="flex justify-between">
                <span>Quantidade:</span>
                <span>{quantidade} {produto.unidade}</span>
              </div>
              <div className="flex justify-between">
                <span>Custo unitário:</span>
                <span>R$ {custoUnitario.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-medium border-t border-blue-200 pt-1">
                <span>Valor total:</span>
                <span>R$ {valorTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-700 font-medium">
                <span>Novo estoque:</span>
                <span>{produto.quantidadeAtual + quantidade} {produto.unidade}</span>
              </div>
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
              {isSubmitting ? 'Registrando...' : 'Registrar Compra'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}