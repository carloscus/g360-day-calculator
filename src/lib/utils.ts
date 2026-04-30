import type { Feriado } from './types'

export const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

export function isHoliday(date: Date, feriados: Feriado[]): boolean {
  const day = date.getDate()
  const month = date.getMonth() + 1
  const year = date.getFullYear()
  return feriados.some(f => {
    const matches = f.dia === day && f.mes === month
    return f.anio ? (matches && f.anio === year) : matches
  })
}

function calculateEaster(year: number): { mes: number; dia: number } {
  const f = Math.floor
  const G = year % 19
  const C = f(year / 100)
  const H = (C - f(C / 4) - f((8 * C + 13) / 25) + 19 * G + 15) % 30
  const I = H - f(H / 28) * (1 - f(29 / (H + 1)) * f((21 - G) / 11))
  const J = (year + f(year / 4) + I + 2 - C + f(C / 4)) % 7
  const L = I - J
  const month = 3 + f((L + 40) / 44)
  const day = L + 28 - 31 * f(month / 4)
  return { mes: month, dia: day }
}

export function getSemanaSanta(year: number): Feriado[] {
  const easter = calculateEaster(year)
  const easterDate = new Date(year, easter.mes - 1, easter.dia)
  
  const jueves = new Date(easterDate)
  jueves.setDate(jueves.getDate() - 3)
  
  const viernes = new Date(easterDate)
  viernes.setDate(viernes.getDate() - 2)

  return [
    { dia: jueves.getDate(), mes: jueves.getMonth() + 1, nombre: 'Jueves Santo', anio: year },
    { dia: viernes.getDate(), mes: viernes.getMonth() + 1, nombre: 'Viernes Santo', anio: year },
  ]
}

/**
 * Calcula la fecha final basada en días de entrada y lógica de negocio G360
 */
export function getFinalDate(base: Date, days: number, grace: boolean, feriados: Feriado[]) {
  const start = new Date(base)
  start.setHours(0, 0, 0, 0)

  const target1 = new Date(start)
  target1.setDate(target1.getDate() + days)

  let final = new Date(target1)
  if (grace) {
    final.setDate(final.getDate() + 2)
    while (true) {
      const isSunday = final.getDay() === 0
      if (isHoliday(final, feriados) || isSunday) {
        final.setDate(final.getDate() + 1)
      } else {
        break
      }
    }
  }

  // Asegurar que el diferencial de días sea un entero absoluto
  const extraDiff = Math.abs(Math.round((final.getTime() - target1.getTime()) / (1000 * 60 * 60 * 24)))
  return { final, target1, extraDiff }
}

export function formatDate(date: Date): string {
  return `${date.getDate().toString().padStart(2, '0')}/${(date.getMonth() + 1).toString().padStart(2, '0')}/${date.getFullYear()}`
}

/**
 * Determina el estado visual de un día (feriado, sábado o hábil)
 * para la paleta de colores G360.
 */
export function getDayStatus(date: Date, feriados: Feriado[]): string {
  const dayNum = date.getDay();
  if (dayNum === 0 || isHoliday(date, feriados)) return 'holiday';
  if (dayNum === 6) return 'saturday';
  return 'working';
}