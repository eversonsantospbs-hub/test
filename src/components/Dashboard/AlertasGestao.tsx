"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppData } from '@/contexts/AppDataContext';
import { 
  AlertTriangle, 
  TrendingUp, 
  TrendingDown, 
  Info,
  CheckCircle,
  Clock,
  DollarSign
} from 'lucide-react';

export function AlertasGestao() {
  const { agendamentos, funcionarias, servicos, produtos } = useAppData();

  const alertas = useMemo(() => {
    const alerts = [];
    const hoje = new Date();
    const inicioSemana = new Date(hoje);
    inicioSemana.setDate(hoje.getDate() - 7);

    // Alertas de estoque baixo
    const produtosBaixoEstoque = produtos.filter(p => p.quantidadeAtual <= p.estoqueMinimo);
    if (produtosBaixoEstoque.length > 0) {
      alerts.push({
        tipo: 'warning',
        titulo: 'Estoque Baixo',
        descricao: `${produtosBaixoEstoque.length} produto(s) com estoque baixo`,
        detalhes: produtosBaixoEstoque.map(p => p.nome).join(', '),
        icon: AlertTriangle,
        cor: 'text-orange-600'
      });
    }

    // Agendamentos de hoje
    const agendamentosHoje = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataHora);
      return dataAgendamento.toDateString() === hoje.toDateString();
    });

    if (agendamentosHoje.length > 0) {
      alerts.push({
        tipo: 'info',
        titulo: 'Agendamentos Hoje',
        descricao: `${agendamentosHoje.length} agendamento(s) para hoje`,
        detalhes: `${agendamentosHoje.filter(a => a.status === 'agendado').length} pendentes`,
        icon: Clock,
        cor: 'text-blue-600'
      });
    }

    // Análise de performance semanal
    const agendamentosSemana = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataHora);
      return dataAgendamento >= inicioSemana && dataAgendamento <= hoje;
    });

    const faturamentoSemana = agendamentosSemana
      .filter(a => a.status === 'concluido')
      .reduce((total, a) => total + a.preco, 0);

    if (faturamentoSemana > 1000) {
      alerts.push({
        tipo: 'success',
        titulo: 'Ótima Semana!',
        descricao: `Faturamento de R$ ${faturamentoSemana.toFixed(2)} esta semana`,
        detalhes: 'Performance acima da média',
        icon: TrendingUp,
        cor: 'text-green-600'
      });
    } else if (faturamentoSemana < 300) {
      alerts.push({
        tipo: 'warning',
        titulo: 'Faturamento Baixo',
        descricao: `Apenas R$ ${faturamentoSemana.toFixed(2)} esta semana`,
        detalhes: 'Considere estratégias de marketing',
        icon: TrendingDown,
        cor: 'text-red-600'
      });
    }

    // Taxa de não comparecimento alta
    const agendamentosUltimos30Dias = agendamentos.filter(a => {
      const dataAgendamento = new Date(a.dataHora);
      const inicio30Dias = new Date(hoje);
      inicio30Dias.setDate(hoje.getDate() - 30);
      return dataAgendamento >= inicio30Dias && dataAgendamento <= hoje;
    });

    const naoCompareceram = agendamentosUltimos30Dias.filter(a => a.status === 'nao_compareceu').length;
    const taxaNaoComparecimento = agendamentosUltimos30Dias.length > 0 
      ? (naoCompareceram / agendamentosUltimos30Dias.length) * 100 
      : 0;

    if (taxaNaoComparecimento > 20) {
      alerts.push({
        tipo: 'warning',
        titulo: 'Alta Taxa de Faltas',
        descricao: `${taxaNaoComparecimento.toFixed(1)}% de não comparecimento`,
        detalhes: 'Considere implementar confirmação de agendamentos',
        icon: AlertTriangle,
        cor: 'text-orange-600'
      });
    }

    // Serviço mais popular
    const servicosCount = agendamentosSemana.reduce((acc, a) => {
      acc[a.servicoId] = (acc[a.servicoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const servicoMaisPopular = Object.entries(servicosCount)
      .sort(([,a], [,b]) => b - a)[0];

    if (servicoMaisPopular) {
      const servico = servicos.find(s => s.id === servicoMaisPopular[0]);
      if (servico) {
        alerts.push({
          tipo: 'info',
          titulo: 'Serviço em Alta',
          descricao: `${servico.nome} foi o mais procurado`,
          detalhes: `${servicoMaisPopular[1]} agendamentos esta semana`,
          icon: TrendingUp,
          cor: 'text-purple-600'
        });
      }
    }

    return alerts;
  }, [agendamentos, funcionarias, servicos, produtos]);

  const getIconColor = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'text-green-600';
      case 'warning': return 'text-orange-600';
      case 'error': return 'text-red-600';
      default: return 'text-blue-600';
    }
  };

  const getBadgeVariant = (tipo: string) => {
    switch (tipo) {
      case 'success': return 'default';
      case 'warning': return 'secondary';
      case 'error': return 'destructive';
      default: return 'outline';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Info className="h-5 w-5" />
          <span>Alertas e Insights</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {alertas.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
            <p>Tudo funcionando perfeitamente!</p>
            <p className="text-sm">Nenhum alerta no momento.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {alertas.map((alerta, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors"
              >
                <alerta.icon className={`h-5 w-5 mt-0.5 ${alerta.cor}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className="font-medium text-gray-900">{alerta.titulo}</h4>
                    <Badge variant={getBadgeVariant(alerta.tipo)}>
                      {alerta.tipo === 'success' ? 'Positivo' :
                       alerta.tipo === 'warning' ? 'Atenção' :
                       alerta.tipo === 'error' ? 'Crítico' : 'Info'}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600">{alerta.descricao}</p>
                  {alerta.detalhes && (
                    <p className="text-xs text-gray-500 mt-1">{alerta.detalhes}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}