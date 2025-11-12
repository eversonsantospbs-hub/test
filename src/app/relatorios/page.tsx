"use client";

import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardFiltersComponent } from '@/components/Dashboard/DashboardFilters';
import { DashboardKPIs } from '@/components/Dashboard/DashboardKPIs';
import { GraficoFaturamento } from '@/components/Dashboard/GraficoFaturamento';
import { GraficoServicos } from '@/components/Dashboard/GraficoServicos';
import { GraficoProfissionais } from '@/components/Dashboard/GraficoProfissionais';
import { DashboardFilters } from '@/types';

export default function RelatoriosPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'semana',
    status: 'todos'
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading || !user) {
    return null;
  }

  return (
    <AppLayout title="Relatórios e Dashboard">
      <div className="space-y-6">
        {/* Filtros */}
        <DashboardFiltersComponent 
          filters={filters} 
          onFiltersChange={setFilters} 
        />

        {/* KPIs */}
        <DashboardKPIs filters={filters} />

        {/* Gráficos */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Faturamento */}
          <div className="lg:col-span-2">
            <GraficoFaturamento filters={filters} />
          </div>

          {/* Gráfico de Serviços */}
          <GraficoServicos filters={filters} />

          {/* Gráfico de Profissionais */}
          <GraficoProfissionais filters={filters} />
        </div>

        {/* Resumo Executivo */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Resumo Executivo
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900 mb-2">📊 Análise de Performance</h3>
              <p className="text-blue-700">
                Acompanhe o desempenho do seu salão através dos KPIs principais: 
                faturamento, agendamentos concluídos, ticket médio e taxa de comparecimento.
              </p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg">
              <h3 className="font-medium text-green-900 mb-2">💰 Evolução Financeira</h3>
              <p className="text-green-700">
                O gráfico de faturamento mostra a evolução diária das receitas, 
                permitindo identificar tendências e padrões de crescimento.
              </p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg">
              <h3 className="font-medium text-purple-900 mb-2">🎯 Insights Estratégicos</h3>
              <p className="text-purple-700">
                Analise a distribuição por serviços e performance dos profissionais 
                para otimizar a operação e maximizar resultados.
              </p>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}