export const FERIADOS_PERU = [
  { mes: 1, dia: 1, nombre: 'Año Nuevo' },
  { mes: 5, dia: 1, nombre: 'Día del Trabajo' },
  { mes: 7, dia: 28, nombre: 'Fiestas Patrias' },
  { mes: 7, dia: 29, nombre: 'Fiestas Patrias' },
  { mes: 8, dia: 30, nombre: 'Santa Rosa de Lima' },
  { mes: 10, dia: 8, nombre: 'Batalla de Angamos' },
  { mes: 11, dia: 1, nombre: 'Todos los Santos' },
  { mes: 12, dia: 8, nombre: 'Inmaculada Concepción' },
  { mes: 12, dia: 25, nombre: 'Navidad' },
]

export const getMonthName = (mes: number): string => {
  const meses = ['', 'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Setiembre', 'Octubre', 'Noviembre', 'Diciembre']
  return meses[mes] || ''
}

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
  const day = date.getDay()
  return day === 0 || day === 6 || isHoliday(date)
}
