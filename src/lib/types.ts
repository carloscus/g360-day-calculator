export interface Feriado {
  dia: number
  mes: number
  nombre: string
  anio?: number
}

export interface CalculationRow {
  id: string
  fecha: string
  dias: string
  resultado: string
  status?: string
  mode?: string
  errorFecha?: string
  errorDias?: string
  fechaLimpia?: string
  ajuste?: string
}