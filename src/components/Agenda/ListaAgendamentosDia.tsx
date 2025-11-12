"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useAppData } from '@/contexts/AppDataContext';
import { Agendamento } from '@/types';
import { formatDate, isSameDay } from '@/lib/dateUtils';
import { Edit, Trash2, Phone, Clock, User, Briefcase, DollarSign } from 'lucide-react';
import { toast } from 'sonner';

interface ListaAgendamentosDiaProps {
  selectedDate: Date;
  onEditAgendamento: (agendamento: Agendamento) => void;
}

export function ListaAgendamentosDia({ 
  selectedDate, 
  onEditAgendamento 
}: ListaAgendamentosDiaProps) {
  const { 
    agendamentos, 
    funcionarias, 
    servicos, 
    editarAgendamento, 
    excluirAgendamento 
  } = useAppData();

  const agendamentosDia = agendamentos
    .filter(agendamento => isSameDay(new Date(agendamento.dataHora), selectedDate))
    .sort((a, b) => new Date(a.dataHora).getTime() - new Date(b.dataHora).getTime());

  const handleStatusChange = (agendamentoId: string, novoStatus: Agendamento['status']) => {
    editarAgendamento(agendamentoId, { status: novoStatus });
    toast.success('Status do agendamento atualizado!');
  };

  const handleExcluirAgendamento = (agendamentoId: string) => {
    excluirAgendamento(agendamentoId);
    toast.success('Agendamento excluído com sucesso!');
  };

  const getStatusColor = (status: Agendamento['status']) => {
    switch (status) {
      case 'agendado':
        return 'bg-blue-100 text-blue-800';
      case 'concluido':
        return 'bg-green-100 text-green-800';
      case 'nao_compareceu':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: Agendamento['status']) => {
    switch (status) {
      case 'agendado':
        return 'Agendado';
      case 'concluido':
        return 'Concluído';
      case 'nao_compareceu':
        return 'Não compareceu';
      default:
        return status;
    }
  };

  if (agendamentosDia.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Agendamentos de {formatDate(selectedDate, 'dd/MM/yyyy')}</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Clock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500">Nenhum agendamento para este dia</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Clock className="h-5 w-5" />
          <span>Agendamentos de {formatDate(selectedDate, 'dd/MM/yyyy')}</span>
          <Badge variant="secondary">{agendamentosDia.length}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {agendamentosDia.map((agendamento) => {
            const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
            const servico = servicos.find(s => s.id === agendamento.servicoId);

            return (
              <Card key={agendamento.id} className="border-l-4" style={{ borderLeftColor: agendamento.cor }}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      {/* Linha 1: Cliente e Horário */}
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-lg text-gray-900">
                          {agendamento.clienteNome}
                        </h3>
                        <div className="flex items-center space-x-2">
                          <Clock className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">
                            {formatDate(new Date(agendamento.dataHora), 'HH:mm')}
                          </span>
                        </div>
                      </div>

                      {/* Linha 2: Informações do serviço */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-gray-500" />
                          <span>{agendamento.clienteWhatsapp}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Briefcase className="h-4 w-4 text-gray-500" />
                          <span>{servico?.nome}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-gray-500" />
                          <span>{funcionaria?.nome}</span>
                        </div>
                      </div>

                      {/* Linha 3: Preço, duração e status */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4 text-sm">
                          <div className="flex items-center space-x-1">
                            <DollarSign className="h-4 w-4 text-gray-500" />
                            <span className="font-medium">R$ {agendamento.preco.toFixed(2)}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Clock className="h-4 w-4 text-gray-500" />
                            <span>{agendamento.duracaoMinutos} min</span>
                          </div>
                        </div>
                        
                        <Badge className={getStatusColor(agendamento.status)}>
                          {getStatusLabel(agendamento.status)}
                        </Badge>
                      </div>

                      {/* Observações */}
                      {agendamento.observacoes && (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          <strong>Obs:</strong> {agendamento.observacoes}
                        </div>
                      )}
                    </div>

                    {/* Ações */}
                    <div className="flex flex-col space-y-2 ml-4">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => onEditAgendamento(agendamento)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o agendamento de {agendamento.clienteNome}?
                              Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleExcluirAgendamento(agendamento.id)}
                              className="bg-red-600 hover:bg-red-700"
                            >
                              Excluir
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </div>

                  {/* Seletor de Status */}
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-700">Status:</span>
                      <Select
                        value={agendamento.status}
                        onValueChange={(value: Agendamento['status']) => 
                          handleStatusChange(agendamento.id, value)
                        }
                      >
                        <SelectTrigger className="w-40">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="agendado">Agendado</SelectItem>
                          <SelectItem value="concluido">Concluído</SelectItem>
                          <SelectItem value="nao_compareceu">Não compareceu</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}