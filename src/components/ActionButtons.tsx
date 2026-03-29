import { Calculation } from '../types'

interface ActionButtonsProps {
  onAddRow: () => void
  onClear: () => void
  rows: Calculation[]
  onShowToast: (message: string, type?: 'success' | 'error') => void
}

export const ActionButtons = ({ onAddRow, onClear, rows, onShowToast }: ActionButtonsProps) => {
  const handleExportXLSX = () => {
    onShowToast('Exportación XLSXcoming soon', 'success')
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
    <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
      <div className="d-flex gap-2">
        <button className="btn btn-primary" onClick={handleExportXLSX}>
          <i className="bi bi-file-earmark-excel me-1"></i> XLSX
        </button>
        <button className="btn btn-secondary" onClick={handleCopy}>
          <i className="bi bi-clipboard me-1"></i> Copiar
        </button>
        <button className="btn btn-danger" onClick={onClear}>
          <i className="bi bi-trash me-1"></i> Limpiar
        </button>
        <button className="btn btn-success" onClick={onAddRow}>
          <i className="bi bi-plus-circle me-1"></i> Nueva Fila
        </button>
      </div>
    </div>
  )
}
