"use client";

import React, { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { AppLayout } from '@/components/Layout/AppLayout';
import { CalendarioMensal } from '@/components/Agenda/CalendarioMensal';
import { CalendarioSemanal } from '@/components/Agenda/CalendarioSemanal';
import { FormularioAgendamento } from '@/components/Agenda/FormularioAgendamento';
import { ListaAgendamentosDia } from '@/components/Agenda/ListaAgendamentosDia';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Agendamento } from '@/types';
import {
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  formatDate
} from '@/lib/dateUtils';
import {
  Calendar,
  CalendarDays,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw
} from 'lucide-react';

export default function AgendaPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'mensal' | 'semanal'>('mensal');
  const [showFormulario, setShowFormulario] = useState(false);
  const [agendamentoEdit, setAgendamentoEdit] = useState<Agendamento | undefined>();
  const [dataInicialForm, setDataInicialForm] = useState<Date | undefined>();
  const [horaInicialForm, setHoraInicialForm] = useState<Date | undefined>();

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

  const handleNavigate = (direction: 'prev' | 'next') => {
    if (viewMode === 'mensal') {
      setCurrentDate(direction === 'next' ? addMonths(currentDate, 1) : subMonths(currentDate, 1));
    } else {
      setCurrentDate(direction === 'next' ? addWeeks(currentDate, 1) : subWeeks(currentDate, 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(today);
    setSelectedDate(today);
  };

  const handleNovoAgendamento = () => {
    setAgendamentoEdit(undefined);
    setDataInicialForm(selectedDate);
    setHoraInicialForm(undefined);
    setShowFormulario(true);
  };

  const handleEditAgendamento = (agendamento: Agendamento) => {
    setAgendamentoEdit(agendamento);
    setDataInicialForm(undefined);
    setHoraInicialForm(undefined);
    setShowFormulario(true);
  };

  const handleTimeSlotClick = (date: Date, time: Date) => {
    setSelectedDate(date);
    setDataInicialForm(date);
    setHoraInicialForm(time);
    setAgendamentoEdit(undefined);
    setShowFormulario(true);
  };

  const handleCloseFormulario = () => {
    setShowFormulario(false);
    setAgendamentoEdit(undefined);
    setDataInicialForm(undefined);
    setHoraInicialForm(undefined);
  };

  return (
    <AppLayout title="Agenda">
      <div className="space-y-6">
        {/* Header com controles de navegação */}
        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              <CardTitle className="flex items-center space-x-2">
                <Calendar className="h-5 w-5" />
                <span>Sistema de Agenda</span>
              </CardTitle>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNovoAgendamento}
                  className="bg-pink-600 text-white hover:bg-pink-700"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Agendamento
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0">
              {/* Navegação de data */}
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('prev')}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="text-lg font-semibold min-w-[200px] text-center">
                  {viewMode === 'mensal' 
                    ? formatDate(currentDate, 'MMMM yyyy')
                    : `${formatDate(currentDate, 'dd/MM')} - ${formatDate(addDays(currentDate, 6), 'dd/MM/yyyy')}`
                  }
                </div>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleNavigate('next')}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleToday}
                >
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Hoje
                </Button>
              </div>

              {/* Seletor de visualização */}
              <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as 'mensal' | 'semanal')}>
                <TabsList>
                  <TabsTrigger value="mensal" className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>Mensal</span>
                  </TabsTrigger>
                  <TabsTrigger value="semanal" className="flex items-center space-x-2">
                    <CalendarDays className="h-4 w-4" />
                    <span>Semanal</span>
                  </TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
          </CardContent>
        </Card>

        {/* Calendários */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            {viewMode === 'mensal' ? (
              <CalendarioMensal
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
              />
            ) : (
              <CalendarioSemanal
                currentDate={currentDate}
                selectedDate={selectedDate}
                onDateSelect={setSelectedDate}
                onTimeSlotClick={handleTimeSlotClick}
              />
            )}
          </div>

          <div className="lg:col-span-1">
            <ListaAgendamentosDia
              selectedDate={selectedDate}
              onEditAgendamento={handleEditAgendamento}
            />
          </div>
        </div>

        {/* Modal de formulário */}
        <FormularioAgendamento
          isOpen={showFormulario}
          onClose={handleCloseFormulario}
          agendamento={agendamentoEdit}
          dataInicial={dataInicialForm}
          horaInicial={horaInicialForm}
        />
      </div>
    </AppLayout>
  );
}