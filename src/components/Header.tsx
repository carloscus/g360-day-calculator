interface HeaderProps {
  isDark: boolean
  toggleDark: () => void
}

export const Header = ({ isDark, toggleDark }: HeaderProps) => {
  return (
    <header className="pb-3 mb-4 border-bottom">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <h1 className="d-flex align-items-center text-body-emphasis text-decoration-none">
            <i className="bi bi-calendar-range me-3"></i>
            G360 Day Calculator
          </h1>
          <p className="text-muted mb-0">Calcula fechas y días con feriados peruanos.</p>
        </div>
        <button 
          className="btn btn-outline-secondary" 
          onClick={toggleDark}
          title="Alternar modo oscuro (Ctrl+D)"
        >
          <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}`}></i>
        </button>
      </div>
    </header>
  )
}
