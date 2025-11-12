"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useAppData } from '@/contexts/AppDataContext';
import { DashboardFilters } from '@/types';
import { formatDate, isSameDay } from '@/lib/dateUtils';
import { TrendingUp } from 'lucide-react';

interface GraficoFaturamentoProps {
  filters: DashboardFilters;
}

export function GraficoFaturamento({ filters }: GraficoFaturamentoProps) {
  const { agendamentos } = useAppData();

  const dadosGrafico = useMemo(() => {
    // Filtrar agendamentos concluídos
    const agendamentosConcluidos = agendamentos.filter(a => a.status === 'concluido');

    // Determinar período baseado no filtro
    const hoje = new Date();
    let dias: Date[] = [];

    switch (filters.periodo) {
      case 'hoje':
        dias = [hoje];
        break;
      case 'semana':
        for (let i = 6; i >= 0; i--) {
          const dia = new Date(hoje);
          dia.setDate(hoje.getDate() - i);
          dias.push(dia);
        }
        break;
      case 'mes':
        for (let i = 29; i >= 0; i--) {
          const dia = new Date(hoje);
          dia.setDate(hoje.getDate() - i);
          dias.push(dia);
        }
        break;
      case 'personalizado':
        if (filters.dataInicio && filters.dataFim) {
          const inicio = new Date(filters.dataInicio);
          const fim = new Date(filters.dataFim);
          const diffTime = Math.abs(fim.getTime() - inicio.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          for (let i = 0; i <= diffDays; i++) {
            const dia = new Date(inicio);
            dia.setDate(inicio.getDate() + i);
            dias.push(dia);
          }
        }
        break;
    }

    // Calcular faturamento por dia
    return dias.map(dia => {
      const faturamentoDia = agendamentosConcluidos
        .filter(agendamento => isSameDay(new Date(agendamento.dataHora), dia))
        .reduce((total, agendamento) => total + agendamento.preco, 0);

      return {
        data: formatDate(dia, filters.periodo === 'mes' ? 'dd/MM' : 'dd/MM'),
        faturamento: faturamentoDia,
        dataCompleta: formatDate(dia, 'dd/MM/yyyy')
      };
    });
  }, [agendamentos, filters]);

  const faturamentoTotal = dadosGrafico.reduce((total, item) => total + item.faturamento, 0);
  const mediaDiaria = dadosGrafico.length > 0 ? faturamentoTotal / dadosGrafico.length : 0;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="h-5 w-5" />
          <span>Evolução do Faturamento</span>
        </CardTitle>
        <div className="flex items-center space-x-4 text-sm text-gray-600">
          <span>Total: <strong className="text-green-600">R$ {faturamentoTotal.toFixed(2)}</strong></span>
          <span>Média diária: <strong className="text-blue-600">R$ {mediaDiaria.toFixed(2)}</strong></span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dadosGrafico}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="data" 
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
                        <p className="font-medium">{data.dataCompleta}</p>
                        <p className="text-green-600">
                          Faturamento: <strong>R$ {data.faturamento.toFixed(2)}</strong>
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="faturamento" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#10B981', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}