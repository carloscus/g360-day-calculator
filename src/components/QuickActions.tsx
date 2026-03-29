interface QuickActionsProps {
  diasGracia: boolean
  onToggleDiasGracia: () => void
}

export const QuickActions = ({ diasGracia, onToggleDiasGracia }: QuickActionsProps) => {
  return (
    <div className="card">
      <div className="card-header">
        Acciones Rápidas
      </div>
      <div className="card-body">
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px' }}>
          <label className="form-switch">
            <input 
              type="checkbox"
              id="diasGracia"
              checked={diasGracia}
              onChange={onToggleDiasGracia}
            />
            <span>+2 días por proceso</span>
          </label>
          <div className="quick-actions">
            <div className="btn-group">
              <button className="btn btn-secondary btn-sm">45d</button>
              <button className="btn btn-secondary btn-sm">60d</button>
              <button className="btn btn-secondary btn-sm">75d</button>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary btn-sm">45/60</button>
              <button className="btn btn-secondary btn-sm">60/75</button>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary btn-sm">40/50/60</button>
              <button className="btn btn-secondary btn-sm">45/60/75</button>
            </div>
            <div className="btn-group">
              <button className="btn btn-secondary btn-sm">45/55/65/75</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
