"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAppData } from '@/contexts/AppDataContext';
import {
  getCalendarDays,
  formatDate,
  isSameDay,
  isSameMonth,
  isToday
} from '@/lib/dateUtils';
import { Agendamento } from '@/types';

interface CalendarioMensalProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
}

export function CalendarioMensal({ 
  currentDate, 
  selectedDate, 
  onDateSelect 
}: CalendarioMensalProps) {
  const { agendamentos, funcionarias, servicos } = useAppData();
  const calendarDays = getCalendarDays(currentDate);

  const getAgendamentosForDay = (date: Date): Agendamento[] => {
    return agendamentos.filter(agendamento => 
      isSameDay(new Date(agendamento.dataHora), date)
    );
  };

  const getAgendamentoColor = (agendamento: Agendamento) => {
    return agendamento.cor || '#3B82F6';
  };

  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Header do calendário */}
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">
          {formatDate(currentDate, 'MMMM yyyy')}
        </h3>
      </div>

      {/* Dias da semana */}
      <div className="grid grid-cols-7 border-b border-gray-200">
        {weekDays.map((day) => (
          <div
            key={day}
            className="p-3 text-center text-sm font-medium text-gray-500 bg-gray-50"
          >
            {day}
          </div>
        ))}
      </div>

      {/* Dias do mês */}
      <div className="grid grid-cols-7">
        {calendarDays.map((day, index) => {
          const agendamentosDay = getAgendamentosForDay(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isSelected = isSameDay(day, selectedDate);
          const isCurrentDay = isToday(day);

          return (
            <Button
              key={index}
              variant="ghost"
              onClick={() => onDateSelect(day)}
              className={cn(
                "h-auto p-2 flex flex-col items-start justify-start border-r border-b border-gray-100 rounded-none hover:bg-gray-50",
                !isCurrentMonth && "text-gray-400 bg-gray-50/50",
                isSelected && "bg-pink-50 border-pink-200",
                isCurrentDay && "bg-blue-50 text-blue-700 font-semibold"
              )}
            >
              <div className="w-full">
                <div className={cn(
                  "text-sm mb-1",
                  isCurrentDay && "font-bold"
                )}>
                  {formatDate(day, 'd')}
                </div>
                
                {/* Primeiros agendamentos do dia */}
                <div className="space-y-1 w-full">
                  {agendamentosDay.slice(0, 2).map((agendamento) => {
                    const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
                    const servico = servicos.find(s => s.id === agendamento.servicoId);
                    
                    return (
                      <div
                        key={agendamento.id}
                        className="text-xs p-1 rounded text-white truncate"
                        style={{ backgroundColor: getAgendamentoColor(agendamento) }}
                        title={`${formatDate(new Date(agendamento.dataHora), 'HH:mm')} - ${agendamento.clienteNome} - ${servico?.nome}`}
                      >
                        {formatDate(new Date(agendamento.dataHora), 'HH:mm')} {agendamento.clienteNome}
                      </div>
                    );
                  })}
                  
                  {/* Indicador de mais agendamentos */}
                  {agendamentosDay.length > 2 && (
                    <Badge variant="secondary" className="text-xs">
                      +{agendamentosDay.length - 2} mais
                    </Badge>
                  )}
                </div>
              </div>
            </Button>
          );
        })}
      </div>
    </div>
  );
}