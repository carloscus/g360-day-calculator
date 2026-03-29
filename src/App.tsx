import { useState, useEffect } from 'react'
import { Header } from './components/Header'
import { QuickActions } from './components/QuickActions'
import { CalculationRow } from './components/CalculationRow'
import { ActionButtons } from './components/ActionButtons'
import { Legend } from './components/Legend'
import { Toast } from './components/Toast'
import { useHistory } from './hooks/useHistory'
import { useDarkMode } from './hooks/useDarkMode'
import { Calculation } from './types'
import { calculateDays, calculateFutureDate } from './utils/dateCalculations'

function App() {
  const [rows, setRows] = useState<Calculation[]>([
    { id: 1, fecha: '', dias: 0, resultado: '', diasGracia: false }
  ])
  const [diasGracia, setDiasGracia] = useState(false)
  const { addToHistory } = useHistory()
  const { isDark, toggleDark } = useDarkMode()
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', isDark ? 'dark' : 'light')
  }, [isDark])

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            toggleDark()
            break
          case 'l':
            e.preventDefault()
            handleClear()
            break
          case 'n':
            e.preventDefault()
            handleAddRow()
            break
        }
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggleDark])

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3000)
  }

  const handleCalculate = (id: number, fecha: string, dias: number) => {
    setRows(prev => prev.map(row => {
      if (row.id !== id) return row
      
      let resultado = ''
      if (fecha) {
        resultado = calculateDays(fecha, diasGracia)
      } else if (dias > 0) {
        resultado = calculateFutureDate(dias, diasGracia)
      }
      
      if (resultado && (fecha || dias > 0)) {
        addToHistory({ fecha, dias, resultado, fechaRegistro: new Date().toISOString() })
      }
      
      return { ...row, fecha, dias, resultado }
    }))
  }

  const handleAddRow = () => {
    if (rows.length >= 50) {
      showToast('Máximo 50 filas permitidas', 'error')
      return
    }
    const newId = Math.max(...rows.map(r => r.id)) + 1
    setRows([...rows, { id: newId, fecha: '', dias: 0, resultado: '', diasGracia: false }])
  }

  const handleRemoveRow = (id: number) => {
    if (rows.length === 1) return
    setRows(rows.filter(r => r.id !== id))
  }

  const handleClear = () => {
    setRows([{ id: 1, fecha: '', dias: 0, resultado: '', diasGracia: false }])
    showToast('Campos limpiados')
  }

  return (
    <div className="container py-4">
      <Header isDark={isDark} toggleDark={toggleDark} />
      
      <QuickActions 
        diasGracia={diasGracia} 
        onToggleDiasGracia={() => setDiasGracia(!diasGracia)}
      />

      {rows.map(row => (
        <CalculationRow
          key={row.id}
          row={row}
          diasGracia={diasGracia}
          onCalculate={(fecha, dias) => handleCalculate(row.id, fecha, dias)}
          onRemove={() => handleRemoveRow(row.id)}
          canRemove={rows.length > 1}
        />
      ))}

      <ActionButtons 
        onAddRow={handleAddRow}
        onClear={handleClear}
        rows={rows}
        onShowToast={showToast}
      />

      <Legend />

      {toast && <Toast message={toast.message} type={toast.type} />}

      <footer className="pt-3 mt-4 text-body-secondary border-top">
        <span className="version-info">G360 Day Calculator v3.0</span>
      </footer>
    </div>
  )
}

export default App
