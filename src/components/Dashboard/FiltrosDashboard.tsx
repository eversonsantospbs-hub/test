"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DashboardFilters } from '@/types';
import { Filter, Download } from 'lucide-react';
import * as XLSX from 'xlsx';
import { useAppData } from '@/contexts/AppDataContext';
import { formatDate } from '@/lib/dateUtils';
import { toast } from 'sonner';

interface FiltrosDashboardProps {
  filters: DashboardFilters;
  onFiltersChange: (filters: DashboardFilters) => void;
}

export function FiltrosDashboard({ filters, onFiltersChange }: FiltrosDashboardProps) {
  const { agendamentos, funcionarias, servicos } = useAppData();

  const handlePeriodoChange = (periodo: string) => {
    const validPeriodos = ['hoje', 'semana', 'mes', 'personalizado'] as const;
    if (validPeriodos.includes(periodo as any)) {
      onFiltersChange({ ...filters, periodo: periodo as DashboardFilters['periodo'] });
    }
  };

  const handleStatusChange = (status: string) => {
    const validStatus = ['todos', 'agendado', 'concluido', 'nao_compareceu'] as const;
    if (validStatus.includes(status as any)) {
      onFiltersChange({ 
        ...filters, 
        status: status === 'todos' ? undefined : status as DashboardFilters['status']
      });
    }
  };

  const handleDataInicioChange = (dataInicio: string) => {
    onFiltersChange({ 
      ...filters, 
      dataInicio: dataInicio ? new Date(dataInicio) : undefined 
    });
  };

  const handleDataFimChange = (dataFim: string) => {
    onFiltersChange({ 
      ...filters, 
      dataFim: dataFim ? new Date(dataFim) : undefined 
    });
  };

  const exportarExcel = () => {
    try {
      // Preparar dados dos agendamentos
      const dadosAgendamentos = agendamentos.map(agendamento => {
        const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
        const servico = servicos.find(s => s.id === agendamento.servicoId);
        
        return {
          'Data': formatDate(new Date(agendamento.dataHora), 'dd/MM/yyyy'),
          'Hora': formatDate(new Date(agendamento.dataHora), 'HH:mm'),
          'Cliente': agendamento.clienteNome,
          'WhatsApp': agendamento.clienteWhatsapp,
          'Funcionária': funcionaria?.nome || 'N/A',
          'Serviço': servico?.nome || 'N/A',
          'Preço': agendamento.preco,
          'Duração (min)': agendamento.duracaoMinutos,
          'Status': agendamento.status,
          'Observações': agendamento.observacoes || ''
        };
      });

      // Criar workbook
      const wb = XLSX.utils.book_new();
      
      // Adicionar planilha de agendamentos
      const wsAgendamentos = XLSX.utils.json_to_sheet(dadosAgendamentos);
      XLSX.utils.book_append_sheet(wb, wsAgendamentos, 'Agendamentos');

      // Adicionar planilha de funcionárias
      const dadosFuncionarias = funcionarias.map(funcionaria => ({
        'Nome': funcionaria.nome,
        'Cargo': funcionaria.cargo,
        'Proprietária': funcionaria.isDona ? 'Sim' : 'Não'
      }));
      const wsFuncionarias = XLSX.utils.json_to_sheet(dadosFuncionarias);
      XLSX.utils.book_append_sheet(wb, wsFuncionarias, 'Funcionárias');

      // Adicionar planilha de serviços
      const dadosServicos = servicos.map(servico => ({
        'Nome': servico.nome,
        'Preço Padrão': servico.precoBase,
        'Duração (min)': servico.duracaoMinutos,
        'Cor': servico.corPadrao
      }));
      const wsServicos = XLSX.utils.json_to_sheet(dadosServicos);
      XLSX.utils.book_append_sheet(wb, wsServicos, 'Serviços');

      // Salvar arquivo
      XLSX.writeFile(wb, `relatorio-salon-${formatDate(new Date(), 'dd-MM-yyyy')}.xlsx`);
      toast.success('Relatório exportado com sucesso!');
    } catch (error) {
      toast.error('Erro ao exportar relatório. Tente novamente.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Filter className="h-5 w-5" />
          <span>Filtros e Exportação</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {/* Período */}
          <div className="space-y-2">
            <Label>Período</Label>
            <Select value={filters.periodo} onValueChange={handlePeriodoChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoje">Hoje</SelectItem>
                <SelectItem value="semana">Últimos 7 dias</SelectItem>
                <SelectItem value="mes">Último mês</SelectItem>
                <SelectItem value="personalizado">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Data Início (se personalizado) */}
          {filters.periodo === 'personalizado' && (
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data Início</Label>
              <Input
                id="dataInicio"
                type="date"
                value={filters.dataInicio ? formatDate(filters.dataInicio, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDataInicioChange(e.target.value)}
              />
            </div>
          )}

          {/* Data Fim (se personalizado) */}
          {filters.periodo === 'personalizado' && (
            <div className="space-y-2">
              <Label htmlFor="dataFim">Data Fim</Label>
              <Input
                id="dataFim"
                type="date"
                value={filters.dataFim ? formatDate(filters.dataFim, 'yyyy-MM-dd') : ''}
                onChange={(e) => handleDataFimChange(e.target.value)}
              />
            </div>
          )}

          {/* Status */}
          <div className="space-y-2">
            <Label>Status</Label>
            <Select value={filters.status || 'todos'} onValueChange={handleStatusChange}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="agendado">Agendado</SelectItem>
                <SelectItem value="concluido">Concluído</SelectItem>
                <SelectItem value="nao_compareceu">Não compareceu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão de Exportação */}
          <div className="flex items-end">
            <Button 
              onClick={exportarExcel}
              className="bg-green-600 hover:bg-green-700 w-full"
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar Excel
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}