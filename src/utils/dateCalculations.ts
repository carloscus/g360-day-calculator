import { addDays, format, isValid, parseISO, differenceInDays } from 'date-fns'
import { getHolidayName } from './holidays'

export const calculateDays = (fechaStr: string, diasGracia: boolean = false): string => {
  if (!fechaStr) return ''
  
  const parts = fechaStr.split('/')
  if (parts.length !== 3) return ''
  
  const fecha = parseISO(parts[2] + '-' + parts[1] + '-' + parts[0])
  if (!isValid(fecha)) return ''
  
  const hoy = new Date()
  const diffDays = differenceInDays(hoy, fecha)
  
  if (diffDays < 0) return 'Fecha futura'
  
  let diasHabiles = 0
  let current = new Date(fecha)
  
  while (current <= hoy) {
    const dayOfWeek = current.getDay()
    const esFeriado = getHolidayName(current) !== null
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !esFeriado) {
      diasHabiles++
    }
    
    current = addDays(current, 1)
  }
  
  if (diasGracia) {
    diasHabiles += 2
  }
  
  return `${diasHabiles} días`
}

export const calculateFutureDate = (dias: number, diasGracia: boolean = false): string => {
  if (dias <= 0) return ''
  
  const hoy = new Date()
  let diasContados = 0
  let current = new Date(hoy)
  
  while (diasContados < dias) {
    current = addDays(current, 1)
    const dayOfWeek = current.getDay()
    const esFeriado = getHolidayName(current) !== null
    
    if (dayOfWeek !== 0 && dayOfWeek !== 6 && !esFeriado) {
      diasContados++
    }
  }
  
  if (diasGracia) {
    current = addDays(current, 2)
  }
  
  return format(current, 'dd/MM/yyyy')
}
