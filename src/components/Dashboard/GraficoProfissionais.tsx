"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters } from '@/types';
import { isSameDay, isAfter, isBefore, isEqual } from '@/lib/dateUtils';
import { Users } from 'lucide-react';

interface GraficoProfissionaisProps {
  filters: DashboardFilters;
}

export function GraficoProfissionais({ filters }: GraficoProfissionaisProps) {
  const { agendamentos, funcionarias } = useAppData();

  const dadosGrafico = useMemo(() => {
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

    // Calcular métricas por funcionária
    const funcionariasStats = agendamentosFiltrados.reduce((acc, agendamento) => {
      // Buscar o nome da funcionária pelo ID
      const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
      const funcionariaNome = funcionaria ? funcionaria.nome : 'Não especificado';
      
      if (!acc[funcionariaNome]) {
        acc[funcionariaNome] = {
          nome: funcionariaNome,
          agendamentos: 0,
          faturamento: 0,
          concluidos: 0
        };
      }

      acc[funcionariaNome].agendamentos += 1;
      if (agendamento.status === 'concluido') {
        acc[funcionariaNome].faturamento += agendamento.preco;
        acc[funcionariaNome].concluidos += 1;
      }

      return acc;
    }, {} as Record<string, any>);

    // Converter para array e calcular ticket médio
    return Object.values(funcionariasStats).map((func: any) => ({
      ...func,
      ticketMedio: func.concluidos > 0 ? func.faturamento / func.concluidos : 0,
      taxaConclusao: func.agendamentos > 0 ? (func.concluidos / func.agendamentos) * 100 : 0
    }));
  }, [agendamentos, funcionarias, filters]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5" />
          <span>Performance por Funcionária</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={dadosGrafico} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="nome" 
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis 
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `R$ ${value}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium">{label}</p>
                        <p className="text-green-600">
                          Faturamento: <strong>R$ {data.faturamento.toFixed(2)}</strong>
                        </p>
                        <p className="text-blue-600">
                          Agendamentos: <strong>{data.agendamentos}</strong>
                        </p>
                        <p className="text-purple-600">
                          Concluídos: <strong>{data.concluidos}</strong>
                        </p>
                        <p className="text-orange-600">
                          Ticket Médio: <strong>R$ {data.ticketMedio.toFixed(2)}</strong>
                        </p>
                        <p className="text-red-600">
                          Taxa Conclusão: <strong>{data.taxaConclusao.toFixed(1)}%</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="faturamento" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}