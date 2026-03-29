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
    <div className="card mb-3">
      <div className="card-body p-3">
        <div className="d-flex align-items-center gap-2">
          <div style={{ width: 170 }}>
            <div className="form-floating">
              <input
                type="text"
                className="form-control"
                placeholder="dd/mm/yyyy"
                value={fecha}
                onChange={(e) => handleFechaChange(e.target.value)}
              />
              <label>Fecha</label>
            </div>
          </div>
          <div style={{ width: 80 }}>
            <div className="form-floating">
              <input
                type="number"
                className="form-control"
                placeholder="Días"
                value={dias || ''}
                onChange={(e) => handleDiasChange(Number(e.target.value))}
              />
              <label>Días</label>
            </div>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="form-floating">
              <input
                type="text"
                className="form-control resultado"
                placeholder="Resultado"
                value={row.resultado}
                readOnly
              />
              <label>Resultado</label>
            </div>
          </div>
          <div style={{ width: 50 }}>
            <button
              className="btn btn-success w-100"
              onClick={onRemove}
              disabled={!canRemove}
              title="Eliminar fila"
            >
              <i className="bi bi-dash-circle"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const formatFechaInput = (value: string): string => {
  const numbers = value.replace(/\D/g, '')
  if (numbers.length <= 2) return numbers
  if (numbers.length <= 4) return `${numbers.slice(0,2)}/${numbers.slice(2)}`
  return `${numbers.slice(0,2)}/${numbers.slice(2,4)}/${numbers.slice(4,8)}`
}
