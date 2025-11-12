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
import { Servico } from '@/types';
import { toast } from 'sonner';

const servicoSchema = z.object({
  nome: z.string().min(1, 'Nome do serviço é obrigatório'),
  precoBase: z.number().min(0, 'Preço deve ser maior ou igual a zero'),
  duracaoMinutos: z.number().min(15, 'Duração mínima de 15 minutos'),
  corPadrao: z.string().min(1, 'Cor é obrigatória')
});

type ServicoFormData = z.infer<typeof servicoSchema>;

interface FormularioServicoProps {
  isOpen: boolean;
  onClose: () => void;
  servico?: Servico;
}

const coresPadrao = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1',
  '#14B8A6', '#F43F5E', '#8B5A2B', '#6B7280', '#1F2937'
];

export function FormularioServico({
  isOpen,
  onClose,
  servico
}: FormularioServicoProps) {
  const { adicionarServico, editarServico } = useAppData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<ServicoFormData>({
    resolver: zodResolver(servicoSchema)
  });

  const corSelecionada = watch('corPadrao');

  // Preencher formulário quando serviço for passado
  useEffect(() => {
    if (servico) {
      reset({
        nome: servico.nome,
        precoBase: servico.precoBase,
        duracaoMinutos: servico.duracaoMinutos,
        corPadrao: servico.corPadrao
      });
    } else {
      reset({
        nome: '',
        precoBase: 0,
        duracaoMinutos: 60,
        corPadrao: coresPadrao[0]
      });
    }
  }, [servico, reset]);

  const onSubmit = async (data: ServicoFormData) => {
    try {
      const novoServico: Omit<Servico, 'id'> = {
        nome: data.nome,
        precoBase: data.precoBase,
        duracaoMinutos: data.duracaoMinutos,
        corPadrao: data.corPadrao
      };

      if (servico) {
        // Editar serviço existente
        editarServico(servico.id, novoServico);
        toast.success('Serviço atualizado com sucesso!');
      } else {
        // Criar novo serviço
        adicionarServico(novoServico);
        toast.success('Serviço criado com sucesso!');
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao salvar serviço. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>
            {servico ? 'Editar Serviço' : 'Novo Serviço'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do Serviço</Label>
            <Input
              id="nome"
              {...register('nome')}
              className={errors.nome ? 'border-red-500' : ''}
              placeholder="Ex: Corte Feminino"
            />
            {errors.nome && (
              <p className="text-sm text-red-500">{errors.nome.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="precoBase">Preço Padrão (R$)</Label>
              <Input
                id="precoBase"
                type="number"
                step="0.01"
                {...register('precoBase', { valueAsNumber: true })}
                className={errors.precoBase ? 'border-red-500' : ''}
                placeholder="50.00"
              />
              {errors.precoBase && (
                <p className="text-sm text-red-500">{errors.precoBase.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracaoMinutos">Duração (min)</Label>
              <Input
                id="duracaoMinutos"
                type="number"
                {...register('duracaoMinutos', { valueAsNumber: true })}
                className={errors.duracaoMinutos ? 'border-red-500' : ''}
                placeholder="60"
              />
              {errors.duracaoMinutos && (
                <p className="text-sm text-red-500">{errors.duracaoMinutos.message}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Cor Padrão</Label>
            <div className="grid grid-cols-5 gap-2">
              {coresPadrao.map((cor) => (
                <button
                  key={cor}
                  type="button"
                  onClick={() => setValue('corPadrao', cor)}
                  className={`w-10 h-10 rounded-lg border-2 transition-all ${
                    corSelecionada === cor 
                      ? 'border-gray-900 scale-110' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  style={{ backgroundColor: cor }}
                  title={cor}
                />
              ))}
            </div>
            {corSelecionada && (
              <div className="flex items-center space-x-2 mt-2">
                <div
                  className="w-6 h-6 rounded border border-gray-300"
                  style={{ backgroundColor: corSelecionada }}
                />
                <span className="text-sm font-mono text-gray-600">{corSelecionada}</span>
              </div>
            )}
            {errors.corPadrao && (
              <p className="text-sm text-red-500">{errors.corPadrao.message}</p>
            )}
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
              {isSubmitting ? 'Salvando...' : (servico ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}