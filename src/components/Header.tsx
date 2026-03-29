interface HeaderProps {
  isDark: boolean
  toggleDark: () => void
}

export const Header = ({ isDark, toggleDark }: HeaderProps) => {
  return (
    <header>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div>
          <h1>
            <i className="bi bi-calendar-range" style={{ marginRight: '8px' }}></i>
            G360 Day Calculator
          </h1>
          <p>Calcula fechas y días con feriados peruanos.</p>
        </div>
        <button 
          className="btn btn-secondary" 
          onClick={toggleDark}
          title="Alternar modo oscuro (Ctrl+D)"
          style={{ padding: '6px 10px' }}
        >
          <i className={`bi ${isDark ? 'bi-sun' : 'bi-moon-stars'}`}></i>
        </button>
      </div>
    </header>
  )
}
