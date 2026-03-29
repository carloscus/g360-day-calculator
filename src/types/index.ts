export interface Calculation {
  id: number
  fecha: string
  dias: number
  resultado: string
  diasGracia: boolean
}

export interface HistoryItem {
  fecha: string
  dias: number
  resultado: string
  fechaRegistro: string
}
