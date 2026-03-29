import { Calculation } from '../types'

interface ActionButtonsProps {
  onAddRow: () => void
  onClear: () => void
  rows: Calculation[]
  onShowToast: (message: string, type?: 'success' | 'error') => void
}

export const ActionButtons = ({ onAddRow, onClear, rows, onShowToast }: ActionButtonsProps) => {
  const handleExportXLSX = () => {
    onShowToast('Exportación XLSX pronto disponible', 'success')
  }

  const handleCopy = () => {
    const text = rows
      .filter(r => r.resultado)
      .map(r => `Fecha: ${r.fecha || '-'}, Días: ${r.dias || '-'}, Resultado: ${r.resultado}`)
      .join('\n')
    
    navigator.clipboard.writeText(text)
    onShowToast('Copiado al portapapeles', 'success')
  }

  return (
    <div className="actions-g360">
      <button className="btn-g360 btn-g360-primary" onClick={handleExportXLSX}>
        <i className="bi bi-file-earmark-excel"></i> XLSX
      </button>
      <button className="btn-g360 btn-g360-secondary" onClick={handleCopy}>
        <i className="bi bi-clipboard"></i> Copiar
      </button>
      <button className="btn-g360 btn-g360-danger" onClick={onClear}>
        <i className="bi bi-trash"></i> Limpiar
      </button>
      <button className="btn-g360 btn-g360-primary" onClick={onAddRow}>
        <i className="bi bi-plus-circle"></i> Nueva Fila
      </button>
    </div>
  )
}
