"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters } from '@/types';
import { isSameDay, isAfter, isBefore, isEqual } from '@/lib/dateUtils';
import { Scissors } from 'lucide-react';

interface GraficoServicosProps {
  filters: DashboardFilters;
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#00ff00', '#ff00ff'];

export function GraficoServicos({ filters }: GraficoServicosProps) {
  const { agendamentos, servicos } = useAppData();

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

    // Contar agendamentos por serviço
    const servicosCount = agendamentosFiltrados.reduce((acc, agendamento) => {
      // Buscar o nome do serviço pelo ID
      const servico = servicos.find(s => s.id === agendamento.servicoId);
      const servicoNome = servico ? servico.nome : 'Não especificado';
      
      acc[servicoNome] = (acc[servicoNome] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Converter para formato do gráfico
    return Object.entries(servicosCount).map(([nome, quantidade]) => ({
      nome,
      quantidade,
      porcentagem: agendamentosFiltrados.length > 0 
        ? ((quantidade / agendamentosFiltrados.length) * 100).toFixed(1)
        : '0'
    }));
  }, [agendamentos, servicos, filters]);

  const totalAgendamentos = dadosGrafico.reduce((total, item) => total + item.quantidade, 0);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Scissors className="h-5 w-5" />
          <span>Distribuição por Serviços</span>
        </CardTitle>
        <p className="text-sm text-gray-600">
          Total de agendamentos: <strong>{totalAgendamentos}</strong>
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={dadosGrafico}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ nome, porcentagem }) => `${nome}: ${porcentagem}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="quantidade"
              >
                {dadosGrafico.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
                        <p className="font-medium">{data.nome}</p>
                        <p className="text-blue-600">
                          Quantidade: <strong>{data.quantidade}</strong>
                        </p>
                        <p className="text-green-600">
                          Porcentagem: <strong>{data.porcentagem}%</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}