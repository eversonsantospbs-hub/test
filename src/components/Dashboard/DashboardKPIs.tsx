"use client";

import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters, KPIs } from '@/types';
import { isSameDay, isAfter, isBefore, isEqual } from '@/lib/dateUtils';
import { 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  Users,
  ArrowUpIcon,
  ArrowDownIcon,
  MinusIcon
} from 'lucide-react';

interface DashboardKPIsProps {
  filters: DashboardFilters;
}

export function DashboardKPIs({ filters }: DashboardKPIsProps) {
  const { agendamentos } = useAppData();

  // Filtrar agendamentos baseado nos filtros
  const agendamentosFiltrados = agendamentos.filter(agendamento => {
    const dataAgendamento = new Date(agendamento.dataHora);
    
    // Filtro de status
    if (filters.status && filters.status !== 'todos' && agendamento.status !== filters.status) {
      return false;
    }

    // Filtro de período
    const hoje = new Date();
    let dataInicio: Date;
    let dataFim: Date = hoje;

    switch (filters.periodo) {
      case 'hoje':
        return isSameDay(dataAgendamento, hoje);
      case 'semana':
        dataInicio = new Date(hoje);
        dataInicio.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        dataInicio = new Date(hoje);
        dataInicio.setMonth(hoje.getMonth() - 1);
        break;
      case 'personalizado':
        if (filters.dataInicio && filters.dataFim) {
          dataInicio = filters.dataInicio;
          dataFim = filters.dataFim;
        } else {
          return true;
        }
        break;
      default:
        return true;
    }

    return (isAfter(dataAgendamento, dataInicio) || isEqual(dataAgendamento, dataInicio)) &&
           (isBefore(dataAgendamento, dataFim) || isEqual(dataAgendamento, dataFim));
  });

  // Calcular KPIs
  const agendamentosConcluidos = agendamentosFiltrados.filter(a => a.status === 'concluido');
  const faturamentoTotal = agendamentosConcluidos.reduce((total, a) => total + a.preco, 0);
  const ticketMedio = agendamentosConcluidos.length > 0 ? faturamentoTotal / agendamentosConcluidos.length : 0;
  const taxaComparecimento = agendamentosFiltrados.length > 0 
    ? (agendamentosConcluidos.length / agendamentosFiltrados.length) * 100 
    : 0;

  // Calcular período anterior para comparação
  const getPeriodoAnterior = () => {
    const hoje = new Date();
    let dataInicioAnterior: Date;
    let dataFimAnterior: Date;

    switch (filters.periodo) {
      case 'hoje':
        dataInicioAnterior = new Date(hoje);
        dataInicioAnterior.setDate(hoje.getDate() - 1);
        dataFimAnterior = new Date(hoje);
        dataFimAnterior.setDate(hoje.getDate() - 1);
        break;
      case 'semana':
        dataInicioAnterior = new Date(hoje);
        dataInicioAnterior.setDate(hoje.getDate() - 14);
        dataFimAnterior = new Date(hoje);
        dataFimAnterior.setDate(hoje.getDate() - 7);
        break;
      case 'mes':
        dataInicioAnterior = new Date(hoje);
        dataInicioAnterior.setMonth(hoje.getMonth() - 2);
        dataFimAnterior = new Date(hoje);
        dataFimAnterior.setMonth(hoje.getMonth() - 1);
        break;
      default:
        return null;
    }

    return { dataInicioAnterior, dataFimAnterior };
  };

  const periodoAnterior = getPeriodoAnterior();
  let faturamentoAnterior = 0;
  let agendamentosAnterior = 0;

  if (periodoAnterior) {
    const agendamentosAnteriores = agendamentos.filter(agendamento => {
      const dataAgendamento = new Date(agendamento.dataHora);
      return agendamento.status === 'concluido' &&
             (isAfter(dataAgendamento, periodoAnterior.dataInicioAnterior) || isEqual(dataAgendamento, periodoAnterior.dataInicioAnterior)) &&
             (isBefore(dataAgendamento, periodoAnterior.dataFimAnterior) || isEqual(dataAgendamento, periodoAnterior.dataFimAnterior));
    });

    faturamentoAnterior = agendamentosAnteriores.reduce((total, a) => total + a.preco, 0);
    agendamentosAnterior = agendamentosAnteriores.length;
  }

  // Calcular variações percentuais
  const variacaoFaturamento = faturamentoAnterior > 0 
    ? ((faturamentoTotal - faturamentoAnterior) / faturamentoAnterior) * 100 
    : 0;

  const variacaoAgendamentos = agendamentosAnterior > 0
    ? ((agendamentosConcluidos.length - agendamentosAnterior) / agendamentosAnterior) * 100
    : 0;

  const getVariacaoIcon = (variacao: number) => {
    if (variacao > 0) return <ArrowUpIcon className="h-4 w-4 text-green-600" />;
    if (variacao < 0) return <ArrowDownIcon className="h-4 w-4 text-red-600" />;
    return <MinusIcon className="h-4 w-4 text-gray-400" />;
  };

  const getVariacaoColor = (variacao: number) => {
    if (variacao > 0) return 'text-green-600';
    if (variacao < 0) return 'text-red-600';
    return 'text-gray-400';
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Faturamento Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Faturamento Total</CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            R$ {faturamentoTotal.toFixed(2)}
          </div>
          {periodoAnterior && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getVariacaoIcon(variacaoFaturamento)}
              <span className={getVariacaoColor(variacaoFaturamento)}>
                {Math.abs(variacaoFaturamento).toFixed(1)}%
              </span>
              <span>vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Agendamentos Concluídos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Agendamentos Concluídos</CardTitle>
          <Calendar className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {agendamentosConcluidos.length}
          </div>
          {periodoAnterior && (
            <div className="flex items-center space-x-1 text-xs text-muted-foreground">
              {getVariacaoIcon(variacaoAgendamentos)}
              <span className={getVariacaoColor(variacaoAgendamentos)}>
                {Math.abs(variacaoAgendamentos).toFixed(1)}%
              </span>
              <span>vs período anterior</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Ticket Médio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Ticket Médio</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-purple-600">
            R$ {ticketMedio.toFixed(2)}
          </div>
          <p className="text-xs text-muted-foreground">
            Por agendamento concluído
          </p>
        </CardContent>
      </Card>

      {/* Taxa de Comparecimento */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Taxa de Comparecimento</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-orange-600">
            {taxaComparecimento.toFixed(1)}%
          </div>
          <p className="text-xs text-muted-foreground">
            {agendamentosConcluidos.length} de {agendamentosFiltrados.length} agendamentos
          </p>
        </CardContent>
      </Card>
    </div>
  );
}