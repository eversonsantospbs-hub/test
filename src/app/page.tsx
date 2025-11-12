"use client";

import { useAuth } from '@/contexts/AuthContext';
import { LoginForm } from '@/components/LoginForm';
import { AppLayout } from '@/components/Layout/AppLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Calendar, 
  Package, 
  Users, 
  Briefcase, 
  BarChart3,
  ArrowRight,
  Sparkles
} from 'lucide-react';

export default function HomePage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

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
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <Sparkles className="h-8 w-8 text-pink-600" />
              <h1 className="text-3xl font-bold text-gray-900">Só Elas Studio</h1>
            </div>
            <p className="text-gray-600">Sistema de Gestão para Salão de Beleza</p>
          </div>
          <LoginForm />
        </div>
      </div>
    );
  }

  const menuItems = [
    {
      title: 'Dashboard',
      description: 'Relatórios e análises do salão',
      icon: BarChart3,
      href: '/dashboard',
      color: 'bg-blue-500'
    },
    {
      title: 'Agenda',
      description: 'Gerenciar agendamentos e calendário',
      icon: Calendar,
      href: '/agenda',
      color: 'bg-green-500'
    },
    {
      title: 'Estoque',
      description: 'Controle de produtos e compras',
      icon: Package,
      href: '/estoque',
      color: 'bg-orange-500'
    },
    {
      title: 'Funcionárias',
      description: 'Gestão da equipe do salão',
      icon: Users,
      href: '/funcionarias',
      color: 'bg-purple-500'
    },
    {
      title: 'Serviços',
      description: 'Catálogo de serviços oferecidos',
      icon: Briefcase,
      href: '/servicos',
      color: 'bg-pink-500'
    }
  ];

  return (
    <AppLayout title="Início">
      <div className="space-y-6">
        {/* Header de boas-vindas */}
        <Card className="bg-gradient-to-r from-pink-500 to-purple-600 text-white">
          <CardHeader>
            <CardTitle className="text-2xl flex items-center space-x-2">
              <Sparkles className="h-6 w-6" />
              <span>Bem-vinda ao Só Elas Studio!</span>
            </CardTitle>
            <p className="text-pink-100">
              Sistema completo de gestão para seu salão de beleza. 
              Gerencie agendamentos, estoque, funcionárias e muito mais.
            </p>
          </CardHeader>
        </Card>

        {/* Menu de navegação */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {menuItems.map((item) => (
            <Card 
              key={item.href}
              className="hover:shadow-lg transition-shadow cursor-pointer group"
              onClick={() => router.push(item.href)}
            >
              <CardHeader>
                <div className="flex items-center space-x-3">
                  <div className={`p-3 rounded-lg ${item.color} text-white`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg group-hover:text-pink-600 transition-colors">
                      {item.title}
                    </CardTitle>
                  </div>
                  <ArrowRight className="h-5 w-5 text-gray-400 group-hover:text-pink-600 transition-colors" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Ações rápidas */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button 
                onClick={() => router.push('/agenda')}
                className="bg-pink-600 hover:bg-pink-700"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Novo Agendamento
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/estoque')}
              >
                <Package className="h-4 w-4 mr-2" />
                Verificar Estoque
              </Button>
              <Button 
                variant="outline"
                onClick={() => router.push('/dashboard')}
              >
                <BarChart3 className="h-4 w-4 mr-2" />
                Ver Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}