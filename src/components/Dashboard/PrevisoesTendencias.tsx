"use client";

import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAppData } from '@/contexts/AppDataContext';
import { 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  DollarSign,
  Users,
  Target,
  Zap,
  Brain
} from 'lucide-react';
import { formatDate } from '@/lib/dateUtils';

export function PrevisoesTendencias() {
  const { agendamentos, funcionarias, servicos } = useAppData();

  const analises = useMemo(() => {
    const hoje = new Date();
    const ultimoMes = new Date(hoje);
    ultimoMes.setMonth(hoje.getMonth() - 1);
    const penultimoMes = new Date(hoje);
    penultimoMes.setMonth(hoje.getMonth() - 2);

    // Agendamentos do último mês
    const agendamentosUltimoMes = agendamentos.filter(a => {
      const data = new Date(a.dataHora);
      return data >= ultimoMes && data <= hoje && a.status === 'concluido';
    });

    // Agendamentos do penúltimo mês
    const agendamentosPenultimoMes = agendamentos.filter(a => {
      const data = new Date(a.dataHora);
      return data >= penultimoMes && data < ultimoMes && a.status === 'concluido';
    });

    // Análise de crescimento
    const faturamentoUltimoMes = agendamentosUltimoMes.reduce((total, a) => total + a.preco, 0);
    const faturamentoPenultimoMes = agendamentosPenultimoMes.reduce((total, a) => total + a.preco, 0);
    const crescimentoFaturamento = faturamentoPenultimoMes > 0 
      ? ((faturamentoUltimoMes - faturamentoPenultimoMes) / faturamentoPenultimoMes) * 100 
      : 0;

    // Análise de clientes
    const clientesUltimoMes = new Set(agendamentosUltimoMes.map(a => a.clienteNome)).size;
    const clientesPenultimoMes = new Set(agendamentosPenultimoMes.map(a => a.clienteNome)).size;
    const crescimentoClientes = clientesPenultimoMes > 0 
      ? ((clientesUltimoMes - clientesPenultimoMes) / clientesPenultimoMes) * 100 
      : 0;

    // Análise de serviços em tendência
    const servicosUltimoMes = agendamentosUltimoMes.reduce((acc, a) => {
      acc[a.servicoId] = (acc[a.servicoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const servicosPenultimoMes = agendamentosPenultimoMes.reduce((acc, a) => {
      acc[a.servicoId] = (acc[a.servicoId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    // Encontrar serviços em alta
    const servicosEmAlta = Object.entries(servicosUltimoMes)
      .map(([servicoId, quantidade]) => {
        const quantidadeAnterior = servicosPenultimoMes[servicoId] || 0;
        const crescimento = quantidadeAnterior > 0 
          ? ((quantidade - quantidadeAnterior) / quantidadeAnterior) * 100 
          : 100;
        const servico = servicos.find(s => s.id === servicoId);
        return { servico, quantidade, crescimento };
      })
      .filter(item => item.servico && item.crescimento > 20)
      .sort((a, b) => b.crescimento - a.crescimento)
      .slice(0, 3);

    // Previsão para próximo mês
    const mediaAgendamentosDiarios = agendamentosUltimoMes.length / 30;
    const previsaoAgendamentosProximoMes = Math.round(mediaAgendamentosDiarios * 30);
    const previsaoFaturamentoProximoMes = faturamentoUltimoMes * (1 + (crescimentoFaturamento / 100));

    // Análise de dias da semana
    const agendamentosPorDiaSemana = agendamentosUltimoMes.reduce((acc, a) => {
      const diaSemana = new Date(a.dataHora).getDay();
      acc[diaSemana] = (acc[diaSemana] || 0) + 1;
      return acc;
    }, {} as Record<number, number>);

    const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
    const melhorDia = Object.entries(agendamentosPorDiaSemana)
      .sort(([,a], [,b]) => b - a)[0];

    return {
      crescimentoFaturamento,
      crescimentoClientes,
      servicosEmAlta,
      previsaoAgendamentosProximoMes,
      previsaoFaturamentoProximoMes,
      melhorDia: melhorDia ? {
        nome: diasSemana[parseInt(melhorDia[0])],
        quantidade: melhorDia[1]
      } : null,
      faturamentoUltimoMes,
      clientesUltimoMes
    };
  }, [agendamentos, servicos]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Brain className="h-5 w-5" />
          <span>Análises Inteligentes & Previsões</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métricas de Crescimento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <DollarSign className="h-4 w-4 text-green-600" />
                  <span className="text-sm font-medium">Crescimento Faturamento</span>
                </div>
                <Badge variant={analises.crescimentoFaturamento >= 0 ? "default" : "destructive"}>
                  {analises.crescimentoFaturamento >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(analises.crescimentoFaturamento).toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {analises.crescimentoFaturamento >= 0 ? 'Crescimento' : 'Redução'} em relação ao mês anterior
              </p>
            </div>

            <div className="p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <Users className="h-4 w-4 text-blue-600" />
                  <span className="text-sm font-medium">Crescimento Clientes</span>
                </div>
                <Badge variant={analises.crescimentoClientes >= 0 ? "default" : "destructive"}>
                  {analises.crescimentoClientes >= 0 ? (
                    <TrendingUp className="h-3 w-3 mr-1" />
                  ) : (
                    <TrendingDown className="h-3 w-3 mr-1" />
                  )}
                  {Math.abs(analises.crescimentoClientes).toFixed(1)}%
                </Badge>
              </div>
              <p className="text-xs text-gray-600">
                {analises.clientesUltimoMes} clientes únicos este mês
              </p>
            </div>
          </div>

          {/* Serviços em Alta */}
          {analises.servicosEmAlta.length > 0 && (
            <div>
              <h4 className="font-medium mb-3 flex items-center space-x-2">
                <Zap className="h-4 w-4 text-yellow-600" />
                <span>Serviços em Alta</span>
              </h4>
              <div className="space-y-2">
                {analises.servicosEmAlta.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 rounded-lg bg-yellow-50 border border-yellow-200">
                    <div>
                      <span className="font-medium text-yellow-800">{item.servico?.nome}</span>
                      <p className="text-xs text-yellow-600">{item.quantidade} agendamentos este mês</p>
                    </div>
                    <Badge className="bg-yellow-600">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +{item.crescimento.toFixed(0)}%
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Previsões */}
          <div>
            <h4 className="font-medium mb-3 flex items-center space-x-2">
              <Target className="h-4 w-4 text-purple-600" />
              <span>Previsões para Próximo Mês</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <Calendar className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Agendamentos Previstos</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">{analises.previsaoAgendamentosProximoMes}</p>
                <p className="text-xs text-purple-600">Baseado na média atual</p>
              </div>

              <div className="p-4 rounded-lg bg-purple-50 border border-purple-200">
                <div className="flex items-center space-x-2 mb-2">
                  <DollarSign className="h-4 w-4 text-purple-600" />
                  <span className="text-sm font-medium text-purple-800">Faturamento Previsto</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  R$ {analises.previsaoFaturamentoProximoMes.toFixed(0)}
                </p>
                <p className="text-xs text-purple-600">Projeção com base na tendência</p>
              </div>
            </div>
          </div>

          {/* Insights */}
          {analises.melhorDia && (
            <div className="p-4 rounded-lg bg-blue-50 border border-blue-200">
              <h4 className="font-medium mb-2 flex items-center space-x-2 text-blue-800">
                <Calendar className="h-4 w-4" />
                <span>Insight: Melhor Dia da Semana</span>
              </h4>
              <p className="text-sm text-blue-700">
                <strong>{analises.melhorDia.nome}</strong> é seu dia mais movimentado com{' '}
                <strong>{analises.melhorDia.quantidade} agendamentos</strong> este mês.
                Considere ofertas especiais nos dias mais fracos!
              </p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}