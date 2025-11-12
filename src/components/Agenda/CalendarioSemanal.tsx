"use client";

import React from 'react';
import { cn } from '@/lib/utils';
import { useAppData } from '@/contexts/AppDataContext';
import {
  getWeekDays,
  formatDate,
  formatTime,
  isSameDay,
  createTimeSlots,
  addMinutesToDate
} from '@/lib/dateUtils';
import { Agendamento } from '@/types';

interface CalendarioSemanalProps {
  currentDate: Date;
  selectedDate: Date;
  onDateSelect: (date: Date) => void;
  onTimeSlotClick: (date: Date, time: Date) => void;
}

export function CalendarioSemanal({ 
  currentDate, 
  selectedDate, 
  onDateSelect,
  onTimeSlotClick 
}: CalendarioSemanalProps) {
  const { agendamentos, funcionarias, servicos } = useAppData();
  const weekDays = getWeekDays(currentDate);
  const timeSlots = createTimeSlots(30); // Slots de 30 minutos

  const getAgendamentosForDayAndTime = (date: Date, time: Date): Agendamento[] => {
    return agendamentos.filter(agendamento => {
      const agendamentoDate = new Date(agendamento.dataHora);
      const agendamentoTime = new Date(agendamentoDate);
      agendamentoTime.setFullYear(time.getFullYear());
      agendamentoTime.setMonth(time.getMonth());
      agendamentoTime.setDate(time.getDate());
      
      return isSameDay(agendamentoDate, date) && 
             agendamentoTime.getHours() === time.getHours() &&
             agendamentoTime.getMinutes() === time.getMinutes();
    });
  };

  const getAgendamentoHeight = (duracao: number) => {
    // Cada slot de 30 min = 60px, então 1 min = 2px
    return Math.max(duracao * 2, 60);
  };

  const getAgendamentoColor = (agendamento: Agendamento) => {
    return agendamento.cor || '#3B82F6';
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      {/* Header com dias da semana */}
      <div className="grid grid-cols-8 border-b border-gray-200">
        <div className="p-4 bg-gray-50 border-r border-gray-200">
          <span className="text-sm font-medium text-gray-500">Horário</span>
        </div>
        {weekDays.map((day) => (
          <div
            key={day.toISOString()}
            className={cn(
              "p-4 text-center border-r border-gray-200 cursor-pointer hover:bg-gray-50",
              isSameDay(day, selectedDate) && "bg-pink-50 border-pink-200"
            )}
            onClick={() => onDateSelect(day)}
          >
            <div className="text-sm font-medium text-gray-900">
              {formatDate(day, 'EEE')}
            </div>
            <div className={cn(
              "text-lg font-semibold",
              isSameDay(day, new Date()) && "text-blue-600"
            )}>
              {formatDate(day, 'd')}
            </div>
          </div>
        ))}
      </div>

      {/* Grade de horários */}
      <div className="overflow-auto max-h-96">
        <div className="grid grid-cols-8">
          {timeSlots.map((timeSlot) => (
            <React.Fragment key={timeSlot.toISOString()}>
              {/* Coluna de horário */}
              <div className="p-2 border-r border-b border-gray-100 bg-gray-50 text-center">
                <span className="text-sm text-gray-600">
                  {formatTime(timeSlot)}
                </span>
              </div>
              
              {/* Colunas dos dias */}
              {weekDays.map((day) => {
                const agendamentosSlot = getAgendamentosForDayAndTime(day, timeSlot);
                
                return (
                  <div
                    key={`${day.toISOString()}-${timeSlot.toISOString()}`}
                    className="relative border-r border-b border-gray-100 h-16 cursor-pointer hover:bg-gray-50"
                    onClick={() => onTimeSlotClick(day, timeSlot)}
                  >
                    {agendamentosSlot.map((agendamento, index) => {
                      const funcionaria = funcionarias.find(f => f.id === agendamento.funcionariaId);
                      const servico = servicos.find(s => s.id === agendamento.servicoId);
                      const height = getAgendamentoHeight(agendamento.duracaoMinutos);
                      
                      return (
                        <div
                          key={agendamento.id}
                          className="absolute inset-x-1 top-1 rounded text-white text-xs p-1 overflow-hidden z-10"
                          style={{
                            backgroundColor: getAgendamentoColor(agendamento),
                            height: `${Math.min(height, 60)}px`,
                            left: index > 0 ? `${50 * index}%` : '4px',
                            width: agendamentosSlot.length > 1 ? '45%' : 'calc(100% - 8px)'
                          }}
                          title={`${agendamento.clienteNome} - ${servico?.nome} - ${funcionaria?.nome}`}
                        >
                          <div className="font-medium truncate">
                            {agendamento.clienteNome}
                          </div>
                          <div className="truncate opacity-90">
                            {servico?.nome}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}
            </React.Fragment>
          ))}
        </div>
      </div>
    </div>
  );
}