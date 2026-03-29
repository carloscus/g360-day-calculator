import { Calculation } from '../types'
import { useState } from 'react'

interface CalculationRowProps {
  row: Calculation
  diasGracia: boolean
  onCalculate: (fecha: string, dias: number) => void
  onRemove: () => void
  canRemove: boolean
}

export const CalculationRow = ({ row, onCalculate, onRemove, canRemove }: CalculationRowProps) => {
  const [fecha, setFecha] = useState(row.fecha)
  const [dias, setDias] = useState(row.dias)

  const handleFechaChange = (value: string) => {
    const formatted = formatFechaInput(value)
    setFecha(formatted)
    onCalculate(formatted, dias)
  }

  const handleDiasChange = (value: number) => {
    setDias(value)
    onCalculate(fecha, value)
  }

  return (
    <div className="calc-row">
      <div className="calc-input-group">
        <label className="calc-label">FECHA</label>
        <input
          type="text"
          className="calc-input"
          placeholder="dd/mm/yyyy"
          value={fecha}
          onChange={(e) => handleFechaChange(e.target.value)}
        />
      </div>
      <div className="calc-input-group calc-dias">
        <label className="calc-label">DÍAS</label>
        <input
          type="number"
          className="calc-input"
          placeholder="0"
          value={dias || ''}
          onChange={(e) => handleDiasChange(Number(e.target.value))}
        />
      </div>
      <div className="calc-input-group calc-result">
        <label className="calc-label">RESULTADO</label>
        <input
          type="text"
          className="calc-input calc-result-input"
          placeholder="--"
          value={row.resultado}
          readOnly
        />
      </div>
      {canRemove && (
        <button className="calc-remove" onClick={onRemove} title="Eliminar">
          <i className="bi bi-x-circle"></i>
        </button>
      )}
    </div>
  )
}

const formatFechaInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 4) return `${numbers.slice(0,2)}/${numbers.slice(2)}`
  return `${numbers.slice(0,2)}/${numbers.slice(2,4)}/${numbers.slice(4,8)}`
}
