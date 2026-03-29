import { FERIADOS_PERU, getMonthName } from '../utils/holidays'

interface HolidaysModalProps {
  isOpen: boolean
  onClose: () => void
}

export const HolidaysModal = ({ isOpen, onClose }: HolidaysModalProps) => {
  if (!isOpen) return null

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-g360" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Feriados Peruanos</h2>
          <button className="btn-close" onClick={onClose}>
            <i className="bi bi-x-lg"></i>
          </button>
        </div>
        <div className="modal-body">
          <p style={{ marginBottom: '16px', color: 'var(--g360-muted)' }}>
            Días no laborables considerados en el cálculo:
          </p>
          <div className="holidays-list">
            {FERIADOS_PERU.map((f, i) => (
              <div key={i} className="holiday-item">
                <span className="holiday-date">{f.dia} de {getMonthName(f.mes)}</span>
                <span className="holiday-name">{f.nombre}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
