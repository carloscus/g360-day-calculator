export const Legend = () => {
  return (
    <div className="leyenda d-flex align-items-center gap-3 mb-4">
      <span className="leyenda-item">
        <span className="color-box bg-danger me-1"></span> Feriado/Dom
      </span>
      <span className="leyenda-item">
        <span className="color-box bg-info me-1"></span> Sábado
      </span>
      <span className="leyenda-item">
        <span className="color-box bg-secondary me-1"></span> Día hábil
      </span>
    </div>
  )
}
