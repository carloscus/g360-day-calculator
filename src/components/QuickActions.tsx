interface QuickActionsProps {
  diasGracia: boolean
  onToggleDiasGracia: () => void
}

export const QuickActions = ({ diasGracia, onToggleDiasGracia }: QuickActionsProps) => {
  return (
    <div className="card shadow-sm mb-4">
      <div className="card-header">
        <h5 className="my-0 fw-normal">Acciones Rápidas</h5>
      </div>
      <div className="card-body">
        <div className="row align-items-center">
          <div className="col-md-auto">
            <div className="form-check form-switch mb-2 mb-md-0">
              <input 
                className="form-check-input" 
                type="checkbox" 
                role="switch" 
                id="diasGracia"
                checked={diasGracia}
                onChange={onToggleDiasGracia}
              />
              <label className="form-check-label" htmlFor="diasGracia">
                +2 días por proceso
              </label>
            </div>
          </div>
          <div className="col">
            <div className="btn-toolbar" role="toolbar">
              <div className="btn-group btn-group-sm me-2 mb-2">
                <button className="btn btn-outline-secondary">45d</button>
                <button className="btn btn-outline-secondary">60d</button>
                <button className="btn btn-outline-secondary">75d</button>
              </div>
              <div className="btn-group btn-group-sm me-2 mb-2">
                <button className="btn btn-outline-secondary">45/60</button>
                <button className="btn btn-outline-secondary">60/75</button>
              </div>
              <div className="btn-group btn-group-sm me-2 mb-2">
                <button className="btn btn-outline-secondary">40/50/60</button>
                <button className="btn btn-outline-secondary">45/60/75</button>
              </div>
              <div className="btn-group btn-group-sm mb-2">
                <button className="btn btn-outline-secondary">45/55/65/75</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
