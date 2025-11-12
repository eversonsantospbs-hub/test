"use client";

import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { useAppData } from '@/contexts/AppDataContext';
import { Agendamento } from '@/types';
import { formatDate, addMinutesToDate, checkTimeConflict } from '@/lib/dateUtils';
import { toast } from 'sonner';

const agendamentoSchema = z.object({
  clienteNome: z.string().min(1, 'Nome do cliente é obrigatório'),
  clienteWhatsapp: z.string().min(1, 'WhatsApp é obrigatório'),
  funcionariaId: z.string().min(1, 'Selecione uma funcionária'),
  servicoId: z.string().min(1, 'Selecione um serviço'),
  preco: z.number().min(0, 'Preço deve ser maior que zero'),
  duracaoMinutos: z.number().min(15, 'Duração mínima de 15 minutos'),
  data: z.string().min(1, 'Data é obrigatória'),
  hora: z.string().min(1, 'Hora é obrigatória'),
  cor: z.string().min(1, 'Selecione uma cor'),
  observacoes: z.string().optional(),
  recorrente: z.boolean().optional(),
  semanasRecorrencia: z.number().min(1).max(52).optional()
});

type AgendamentoFormData = z.infer<typeof agendamentoSchema>;

interface FormularioAgendamentoProps {
  isOpen: boolean;
  onClose: () => void;
  agendamento?: Agendamento;
  dataInicial?: Date;
  horaInicial?: Date;
}

const coresPadrao = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6',
  '#EC4899', '#06B6D4', '#84CC16', '#F97316', '#6366F1'
];

export function FormularioAgendamento({
  isOpen,
  onClose,
  agendamento,
  dataInicial,
  horaInicial
}: FormularioAgendamentoProps) {
  const { 
    funcionarias, 
    servicos, 
    agendamentos,
    adicionarAgendamento, 
    editarAgendamento 
  } = useAppData();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AgendamentoFormData>({
    resolver: zodResolver(agendamentoSchema)
  });

  const servicoSelecionado = watch('servicoId');
  const funcionariaSelecionada = watch('funcionariaId');
  const recorrente = watch('recorrente');

  // Preencher formulário quando agendamento for passado
  useEffect(() => {
    if (agendamento) {
      const dataHora = new Date(agendamento.dataHora);
      reset({
        clienteNome: agendamento.clienteNome,
        clienteWhatsapp: agendamento.clienteWhatsapp,
        funcionariaId: agendamento.funcionariaId,
        servicoId: agendamento.servicoId,
        preco: agendamento.preco,
        duracaoMinutos: agendamento.duracaoMinutos,
        data: formatDate(dataHora, 'yyyy-MM-dd'),
        hora: formatDate(dataHora, 'HH:mm'),
        cor: agendamento.cor,
        observacoes: agendamento.observacoes || '',
        recorrente: false,
        semanasRecorrencia: 1
      });
    } else if (dataInicial) {
      const hora = horaInicial ? formatDate(horaInicial, 'HH:mm') : '09:00';
      reset({
        data: formatDate(dataInicial, 'yyyy-MM-dd'),
        hora,
        cor: coresPadrao[0],
        preco: 0,
        duracaoMinutos: 60,
        recorrente: false,
        semanasRecorrencia: 1
      });
    }
  }, [agendamento, dataInicial, horaInicial, reset]);

  // Atualizar preço e duração quando serviço for selecionado
  useEffect(() => {
    if (servicoSelecionado) {
      const servico = servicos.find(s => s.id === servicoSelecionado);
      if (servico) {
        setValue('preco', servico.precoBase);
        setValue('duracaoMinutos', servico.duracaoMinutos);
        setValue('cor', servico.corPadrao);
      }
    }
  }, [servicoSelecionado, servicos, setValue]);

  const verificarConflito = (data: string, hora: string, duracaoMinutos: number, funcionariaId: string, agendamentoId?: string) => {
    const dataHora = new Date(`${data}T${hora}`);
    const dataFim = addMinutesToDate(dataHora, duracaoMinutos);

    const conflitos = agendamentos.filter(a => {
      if (agendamentoId && a.id === agendamentoId) return false; // Ignorar o próprio agendamento na edição
      if (a.funcionariaId !== funcionariaId) return false;

      const aDataHora = new Date(a.dataHora);
      const aDataFim = addMinutesToDate(aDataHora, a.duracaoMinutos);

      return checkTimeConflict(dataHora, dataFim, aDataHora, aDataFim);
    });

    return conflitos;
  };

  const onSubmit = async (data: AgendamentoFormData) => {
    try {
      const dataHora = new Date(`${data.data}T${data.hora}`);
      
      // Verificar conflitos
      const conflitos = verificarConflito(
        data.data, 
        data.hora, 
        data.duracaoMinutos, 
        data.funcionariaId,
        agendamento?.id
      );

      if (conflitos.length > 0) {
        toast.error('Conflito de horário detectado! Já existe um agendamento neste horário para esta funcionária.');
        return;
      }

      const novoAgendamento: Omit<Agendamento, 'id'> = {
        clienteNome: data.clienteNome,
        clienteWhatsapp: data.clienteWhatsapp,
        funcionariaId: data.funcionariaId,
        servicoId: data.servicoId,
        preco: data.preco,
        duracaoMinutos: data.duracaoMinutos,
        dataHora,
        cor: data.cor,
        observacoes: data.observacoes,
        status: 'agendado'
      };

      if (agendamento) {
        // Editar agendamento existente
        editarAgendamento(agendamento.id, novoAgendamento);
        toast.success('Agendamento atualizado com sucesso!');
      } else {
        // Criar novo agendamento
        adicionarAgendamento(novoAgendamento);
        
        // Criar agendamentos recorrentes se solicitado
        if (data.recorrente && data.semanasRecorrencia && data.semanasRecorrencia > 1) {
          for (let i = 1; i < data.semanasRecorrencia; i++) {
            const dataRecorrente = new Date(dataHora);
            dataRecorrente.setDate(dataRecorrente.getDate() + (7 * i));
            
            // Verificar se não há conflito para cada recorrência
            const conflitosRecorrencia = verificarConflito(
              formatDate(dataRecorrente, 'yyyy-MM-dd'),
              data.hora,
              data.duracaoMinutos,
              data.funcionariaId
            );

            if (conflitosRecorrencia.length === 0) {
              adicionarAgendamento({
                ...novoAgendamento,
                dataHora: dataRecorrente
              });
            }
          }
          toast.success(`Agendamento criado com ${data.semanasRecorrencia} recorrências!`);
        } else {
          toast.success('Agendamento criado com sucesso!');
        }
      }

      onClose();
    } catch (error) {
      toast.error('Erro ao salvar agendamento. Tente novamente.');
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {agendamento ? 'Editar Agendamento' : 'Novo Agendamento'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="clienteNome">Nome do Cliente</Label>
              <Input
                id="clienteNome"
                {...register('clienteNome')}
                className={errors.clienteNome ? 'border-red-500' : ''}
              />
              {errors.clienteNome && (
                <p className="text-sm text-red-500">{errors.clienteNome.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="clienteWhatsapp">WhatsApp</Label>
              <Input
                id="clienteWhatsapp"
                {...register('clienteWhatsapp')}
                placeholder="(11) 99999-9999"
                className={errors.clienteWhatsapp ? 'border-red-500' : ''}
              />
              {errors.clienteWhatsapp && (
                <p className="text-sm text-red-500">{errors.clienteWhatsapp.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Funcionária</Label>
              <Select onValueChange={(value) => setValue('funcionariaId', value)}>
                <SelectTrigger className={errors.funcionariaId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione uma funcionária" />
                </SelectTrigger>
                <SelectContent>
                  {funcionarias.map((funcionaria) => (
                    <SelectItem key={funcionaria.id} value={funcionaria.id}>
                      {funcionaria.nome} - {funcionaria.cargo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.funcionariaId && (
                <p className="text-sm text-red-500">{errors.funcionariaId.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Serviço</Label>
              <Select onValueChange={(value) => setValue('servicoId', value)}>
                <SelectTrigger className={errors.servicoId ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Selecione um serviço" />
                </SelectTrigger>
                <SelectContent>
                  {servicos.map((servico) => (
                    <SelectItem key={servico.id} value={servico.id}>
                      {servico.nome} - R$ {servico.precoBase.toFixed(2)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.servicoId && (
                <p className="text-sm text-red-500">{errors.servicoId.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="preco">Preço (R$)</Label>
              <Input
                id="preco"
                type="number"
                step="0.01"
                {...register('preco', { valueAsNumber: true })}
                className={errors.preco ? 'border-red-500' : ''}
              />
              {errors.preco && (
                <p className="text-sm text-red-500">{errors.preco.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="duracaoMinutos">Duração (min)</Label>
              <Input
                id="duracaoMinutos"
                type="number"
                {...register('duracaoMinutos', { valueAsNumber: true })}
                className={errors.duracaoMinutos ? 'border-red-500' : ''}
              />
              {errors.duracaoMinutos && (
                <p className="text-sm text-red-500">{errors.duracaoMinutos.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label>Cor</Label>
              <div className="flex flex-wrap gap-2">
                {coresPadrao.map((cor) => (
                  <button
                    key={cor}
                    type="button"
                    onClick={() => setValue('cor', cor)}
                    className="w-8 h-8 rounded-full border-2 border-gray-300 hover:border-gray-400"
                    style={{ backgroundColor: cor }}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="data">Data</Label>
              <Input
                id="data"
                type="date"
                {...register('data')}
                className={errors.data ? 'border-red-500' : ''}
              />
              {errors.data && (
                <p className="text-sm text-red-500">{errors.data.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="hora">Hora</Label>
              <Input
                id="hora"
                type="time"
                {...register('hora')}
                className={errors.hora ? 'border-red-500' : ''}
              />
              {errors.hora && (
                <p className="text-sm text-red-500">{errors.hora.message}</p>
              )}
            </div>
          </div>

          {!agendamento && (
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recorrente"
                  onCheckedChange={(checked) => setValue('recorrente', !!checked)}
                />
                <Label htmlFor="recorrente">Agendamento recorrente (semanal)</Label>
              </div>

              {recorrente && (
                <div className="space-y-2">
                  <Label htmlFor="semanasRecorrencia">Número de semanas</Label>
                  <Input
                    id="semanasRecorrencia"
                    type="number"
                    min="1"
                    max="52"
                    {...register('semanasRecorrencia', { valueAsNumber: true })}
                  />
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações</Label>
            <Textarea
              id="observacoes"
              {...register('observacoes')}
              placeholder="Observações adicionais..."
              rows={3}
            />
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
              {isSubmitting ? 'Salvando...' : (agendamento ? 'Atualizar' : 'Criar')}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}