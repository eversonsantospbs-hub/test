"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { DashboardKPIs } from '@/components/Dashboard/DashboardKPIs';
import { GraficoFaturamento } from '@/components/Dashboard/GraficoFaturamento';
import { GraficoServicos } from '@/components/Dashboard/GraficoServicos';
import { RankingFuncionarias } from '@/components/Dashboard/RankingFuncionarias';
import { FiltrosDashboard } from '@/components/Dashboard/FiltrosDashboard';
import { RelatoriosPDF } from '@/components/Dashboard/RelatoriosPDF';
import { AlertasGestao } from '@/components/Dashboard/AlertasGestao';
import { PrevisoesTendencias } from '@/components/Dashboard/PrevisoesTendencias';
import { ConfiguracoesSistema } from '@/components/Dashboard/ConfiguracoesSistema';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { DashboardFilters } from '@/types';

export default function DashboardPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [filters, setFilters] = useState<DashboardFilters>({
    periodo: 'mes',
    status: undefined
  });

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/');
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-2 text-gray-600">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <AppLayout title="Dashboard">
      <Tabs defaultValue="visao-geral" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visao-geral">Visão Geral</TabsTrigger>
          <TabsTrigger value="analises">Análises IA</TabsTrigger>
          <TabsTrigger value="relatorios">Relatórios</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="visao-geral" className="space-y-6">
          {/* Filtros */}
          <FiltrosDashboard 
            filters={filters} 
            onFiltersChange={setFilters} 
          />

          {/* KPIs */}
          <DashboardKPIs filters={filters} />

          {/* Alertas e Insights */}
          <AlertasGestao />

          {/* Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoFaturamento filters={filters} />
            <GraficoServicos filters={filters} />
          </div>

          {/* Ranking */}
          <RankingFuncionarias filters={filters} />
        </TabsContent>

        <TabsContent value="analises" className="space-y-6">
          {/* Filtros */}
          <FiltrosDashboard 
            filters={filters} 
            onFiltersChange={setFilters} 
          />

          {/* Previsões e Tendências */}
          <PrevisoesTendencias />

          {/* Gráficos Avançados */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <GraficoFaturamento filters={filters} />
            <GraficoServicos filters={filters} />
          </div>
        </TabsContent>

        <TabsContent value="relatorios" className="space-y-6">
          {/* Filtros */}
          <FiltrosDashboard 
            filters={filters} 
            onFiltersChange={setFilters} 
          />

          {/* Relatórios */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <RelatoriosPDF filters={filters} />
            <RankingFuncionarias filters={filters} />
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <ConfiguracoesSistema />
        </TabsContent>
      </Tabs>
    </AppLayout>
  );
}