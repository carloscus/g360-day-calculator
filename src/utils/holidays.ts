import { isSunday, isSaturday } from 'date-fns'

const FERIADOS_FIJOS: Record<string, string> = {
  '1-1': 'Año Nuevo',
  '5-1': 'Día del Trabajo',
  '7-28': 'Fiestas Patrias',
  '7-29': 'Fiestas Patrias',
  '8-30': 'Santa Rosa de Lima',
  '10-8': 'Batalla de Angamos',
  '11-1': 'Todos los Santos',
  '12-8': 'Inmaculada Concepción',
  '12-25': 'Navidad',
}

export const isHoliday = (date: Date): boolean => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const key = `${month}-${day}`
  
  return key in FERIADOS_FIJOS
}

export const getHolidayName = (date: Date): string | null => {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const key = `${month}-${day}`
  
  return FERIADOS_FIJOS[key] || null
}

export const isNonWorkingDay = (date: Date): boolean => {
  return isSunday(date) || isSaturday(date) || isHoliday(date)
}
