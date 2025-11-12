import {
  format,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  eachHourOfInterval,
  isSameDay,
  isSameMonth,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  isToday,
  parseISO,
  setHours,
  setMinutes,
  addMinutes,
  isBefore,
  isAfter,
  isEqual
} from 'date-fns';
import { ptBR } from 'date-fns/locale';

export const formatDate = (date: Date, pattern: string) => {
  return format(date, pattern, { locale: ptBR });
};

export const getWeekDays = (date: Date) => {
  const start = startOfWeek(date, { weekStartsOn: 0 }); // Domingo
  const end = endOfWeek(date, { weekStartsOn: 0 });
  return eachDayOfInterval({ start, end });
};

export const getMonthDays = (date: Date) => {
  const start = startOfMonth(date);
  const end = endOfMonth(date);
  return eachDayOfInterval({ start, end });
};

export const getCalendarDays = (date: Date) => {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  
  return eachDayOfInterval({ start: calendarStart, end: calendarEnd });
};

export const getWorkingHours = () => {
  const baseDate = new Date();
  const startHour = setMinutes(setHours(baseDate, 7), 0); // 7:00
  const endHour = setMinutes(setHours(baseDate, 20), 0);  // 20:00
  
  return eachHourOfInterval({ start: startHour, end: endHour });
};

export const formatTime = (date: Date) => {
  return format(date, 'HH:mm');
};

export const formatDateTime = (date: Date) => {
  return format(date, "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
};

export const createTimeSlots = (intervalMinutes: number = 30) => {
  const slots = [];
  const baseDate = new Date();
  
  for (let hour = 7; hour <= 20; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const time = setMinutes(setHours(baseDate, hour), minute);
      if (hour === 20 && minute > 0) break; // Para às 20:00
      slots.push(time);
    }
  }
  
  return slots;
};

export const checkTimeConflict = (
  newStart: Date,
  newEnd: Date,
  existingStart: Date,
  existingEnd: Date
) => {
  return (
    (isBefore(newStart, existingEnd) && isAfter(newEnd, existingStart)) ||
    isEqual(newStart, existingStart) ||
    isEqual(newEnd, existingEnd)
  );
};

export const addMinutesToDate = (date: Date, minutes: number) => {
  return addMinutes(date, minutes);
};

export {
  isSameDay,
  isSameMonth,
  isToday,
  addDays,
  addWeeks,
  addMonths,
  subDays,
  subWeeks,
  subMonths,
  parseISO,
  isBefore,
  isAfter,
  isEqual
};