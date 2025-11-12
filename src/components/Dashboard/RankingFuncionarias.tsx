"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters } from '@/types';
import { isSameDay, isAfter, isBefore, isEqual } from '@/lib/dateUtils';
import { Trophy, Medal, Award, Users } from 'lucide-react';

interface RankingFuncionariasProps {
  filters: DashboardFilters;
}

export function RankingFuncionarias({ filters }: RankingFuncionariasProps) {
  const { agendamentos, funcionarias } = useAppData();

  const rankingData = useMemo(() => {
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

    // Calcular performance por funcionária
    const performanceFuncionarias: { [key: string]: {
      nome: string;
      cargo: string;
      agendamentos: number;
      faturamento: number;
      ticketMedio: number;
      taxaComparecimento: number;
    }} = {};

    agendamentosFiltrados.forEach(agendamento => {
      const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
      if (!funcionaria) return;

      if (!performanceFuncionarias[agendamento.funcionariaId]) {
        performanceFuncionarias[agendamento.funcionariaId] = {
          nome: funcionaria.nome,
          cargo: funcionaria.cargo,
          agendamentos: 0,
          faturamento: 0,
          ticketMedio: 0,
          taxaComparecimento: 0
        };
      }

      const perf = performanceFuncionarias[agendamento.funcionariaId];
      perf.agendamentos += 1;
      
      if (agendamento.status === 'concluido') {
        perf.faturamento += agendamento.preco;
      }
    });

    // Calcular métricas finais
    Object.values(performanceFuncionarias).forEach(perf => {
      const agendamentosConcluidos = agendamentosFiltrados.filter(a => 
        funcionarias.find(f => f.nome === perf.nome)?.id === 
        funcionarias.find(f => agendamentos.find(ag => ag.funcionariaId === f.id && ag.status === 'concluido'))?.id
      ).filter(a => a.status === 'concluido').length;

      perf.ticketMedio = agendamentosConcluidos > 0 ? perf.faturamento / agendamentosConcluidos : 0;
      perf.taxaComparecimento = perf.agendamentos > 0 ? (agendamentosConcluidos / perf.agendamentos) * 100 : 0;
    });

    // Ordenar por faturamento
    return Object.values(performanceFuncionarias)
      .sort((a, b) => b.faturamento - a.faturamento);
  }, [agendamentos, funcionarias, filters]);

  const getRankingIcon = (posicao: number) => {
    switch (posicao) {
      
      case 0: return <Trophy className="h-5 w-5 text-yellow-500" />;
      case 1: return <Medal className="h-5 w-5 text-gray-400" />;
      case 2: return <Award className="h-5 w-5 text-amber-600" />;
      default: return <span className="w-5 h-5 flex items-center justify-center text-sm font-bold text-gray-500">{posicao + 1}</span>;
    }
  };

  const getRankingBadge = (posicao: number) => {
    switch (posicao) {
      case 0: return <Badge className="bg-yellow-500 hover:bg-yellow-600">1º Lugar</Badge>;
      case 1: return <Badge className="bg-gray-400 hover:bg-gray-500">2º Lugar</Badge>;
      case 2: return <Badge className="bg-amber-600 hover:bg-amber-700">3º Lugar</Badge>;
      default: return <Badge variant="outline">{posicao + 1}º Lugar</Badge>;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Ranking de Performance</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Baseado no faturamento do período selecionado
        </p>
      </CardHeader>
      <CardContent>
        {rankingData.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p>Nenhum dado disponível para o período selecionado</p>
          </div>
        ) : (
          <div className="space-y-4">
            {rankingData.map((funcionaria, index) => (
              <div 
                key={index}
                className={`p-4 rounded-lg border ${
                  index === 0 ? 'bg-yellow-50 border-yellow-200' :
                  index === 1 ? 'bg-gray-50 border-gray-200' :
                  index === 2 ? 'bg-amber-50 border-amber-200' :
                  'bg-white border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    {getRankingIcon(index)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{funcionaria.nome}</h3>
                      <p className="text-sm text-gray-600">{funcionaria.cargo}</p>
                    </div>
                  </div>
                  {getRankingBadge(index)}
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Faturamento</p>
                    <p className="font-semibold text-green-600">
                      R$ {funcionaria.faturamento.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Agendamentos</p>
                    <p className="font-semibold text-blue-600">
                      {funcionaria.agendamentos}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Ticket Médio</p>
                    <p className="font-semibold text-purple-600">
                      R$ {funcionaria.ticketMedio.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Taxa Comparecimento</p>
                    <p className="font-semibold text-orange-600">
                      {funcionaria.taxaComparecimento.toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}