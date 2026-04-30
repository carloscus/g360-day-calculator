<script lang="ts">
  import { onMount } from 'svelte'
  // Componentes UI
  import LogoG360 from './lib/LogoG360.svelte'
  import HolidaysModal from './lib/HolidaysModal.svelte'
  // Tipos de datos
  import type { Feriado, CalculationRow } from './lib/types'
  // Utilidades de cálculo y formato
  import { formatDate, getSemanaSanta, isHoliday, getFinalDate, dayNames, getDayStatus } from './lib/utils'

  /**
   * ==========================================
   * ESTADOS PRINCIPALES DE LA APLICACIÓN
   * ==========================================
   */

  // Variables de entrada para cálculo único
  let globalBaseDate = $derived(formatDate(new Date()))

  // Control de visibilidad de modales y secciones
  let showHolidays = $state(false) // Controla la visibilidad del modal de feriados

  // Lista de feriados cargados desde el servidor
  let feriados = $state<Feriado[]>([])

  // Filas de cálculo en la tabla
  // Cada fila representa un cálculo independiente
  let rows = $state<CalculationRow[]>([
    { id: crypto.randomUUID(), fecha: '', dias: '', resultado: '' }
  ])

  // Asegurar que siempre haya al menos una fila vacía
  function ensureEmptyRow() {
    const hasEmpty = rows.some(r => !r.fecha && !r.dias)
    if (!hasEmpty) {
      rows = [...rows, { id: crypto.randomUUID(), fecha: '', dias: '', resultado: '' }]
    }
  }

  // Configuración de UI
  let toast = $state<{ show: boolean; message: string }>({ // Estado para mostrar mensajes temporales
    show: false,
    message: ''
  })
  let darkMode = $state(false) // Controla el modo oscuro de la interfaz
  let diasGracia = $state(false) // Flag para activar/desactivar los +2 días de proceso
  let quickActionsCollapsed = $state(true) // Estado para colapsar accciones rápidas en móvil (inicia colapsado)

  // Timers para el debounce de cálculos por fila
  let calculationTimers = new Map<string, ReturnType<typeof setTimeout>>();

  /**
   * ==========================================
   * Inicializa la aplicación al cargar el componente.
   * Carga preferencias guardadas y feriados del servidor.
   */
  onMount(() => {
    // Cargar modo oscuro desde localStorage o preferencia del sistema
    const storedDark = localStorage.getItem('g360_dark_mode')
    darkMode =
      storedDark === 'true' ||
      (!storedDark && window.matchMedia('(prefers-color-scheme: dark)').matches)
    applyDarkMode()

    // Cargar feriados desde el archivo JSON público
    fetch('/feriados.json')
      .then(res => res.json())
      .then(data => {
        const fijos = data.feriados || []
        const currentYear = new Date().getFullYear()
        // Inyectar Semana Santa del año actual y del siguiente
        const movilesHoy = getSemanaSanta(currentYear)
        const movilesProx = getSemanaSanta(currentYear + 1)
        feriados = [...fijos, ...movilesHoy, ...movilesProx]
      })
      .catch(() => {
        feriados = []
      })

    // Configurar atajos de teclado globales
    const handleKeydown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + tecla para acciones rápidas
      if (e.ctrlKey || e.metaKey) {
        switch (e.key.toLowerCase()) {
          case 'd':
            e.preventDefault()
            toggleDarkMode()
            break
          case 'n':
            e.preventDefault()
            addRow()
            break
          case 'e':
            e.preventDefault()
            descargarXLSX()
            break
          case 's':
            e.preventDefault()
            copiarResultados()
            break
          case 'l':
            e.preventDefault()
            limpiar()
            break
        }
      }
      // Escape cierra modales
      if (e.key === 'Escape') {
        showHolidays = false // Cierra el modal de feriados
      }
    }

    // Agregar y remover listener de teclado
    window.addEventListener('keydown', handleKeydown)
    return () => window.removeEventListener('keydown', handleKeydown)
  })

  /**
   * ==========================================
   * FUNCIONES DE MANEJO DE UI
   * ==========================================
   */

  /**
   * Aplica el modo oscuro cambiando la clase en el elemento html
   * y guarda la preferencia en localStorage.
   */
  function applyDarkMode() {
    document.documentElement.classList.toggle('dark', darkMode)
    localStorage.setItem('g360_dark_mode', String(darkMode))
  }

  /**
   * Muestra un mensaje toast temporal durante 3 segundos.
   * @param message - Mensaje a mostrar
   */
  function showToast(message: string) {
    toast = { show: true, message } // Activa el toast con el mensaje
    setTimeout(() => {
      toast = { show: false, message: '' }
    }, 3000)
  }

  // Track de botones activos: derivado automáticamente de las filas existentes
  let activeButtons = $derived(new Set(
    rows.filter(r => !r.fecha && !isNaN(parseInt(r.dias)))
        .map(r => parseInt(r.dias))
  ));

  function toggleRapido(dias: number) {
    const diasStr = String(dias);
    // Buscamos si ya existe una fila con ese número de días que no tenga una fecha manual
    const existingRowIndex = rows.findIndex(r => r.dias === diasStr && !r.fecha);

    if (existingRowIndex !== -1) {
      // Si existe, la eliminamos (comportamiento de toggle)
      rows = rows.filter((_, i) => i !== existingRowIndex);
    } else {
      // Añadimos la nueva fila al principio de las filas no vacías
      const newRow = { id: crypto.randomUUID(), fecha: '', dias: diasStr, resultado: '' };
      const currentNonEmptyRows = rows.filter(r => r.fecha || r.dias);
      rows = [newRow, ...currentNonEmptyRows];
      calculateForRow(newRow, 'dias', true);
    }
    ensureEmptyRow();
  }

  function toggleMultiples(combos: number[]) {
    const allCombosCurrentlyActive = combos.every(d => activeButtons.has(d));
    let currentNonEmptyRows = rows.filter(r => r.fecha || r.dias);

    if (allCombosCurrentlyActive) {
      // Si todos los combos ya están activos, los eliminamos
      currentNonEmptyRows = currentNonEmptyRows.filter(r => !combos.includes(parseInt(r.dias)) || r.fecha !== '');
    } else {
      // Si no todos están activos, añadimos los que falten
      combos.forEach(diasNum => {
        const diasStr = String(diasNum);
        if (!currentNonEmptyRows.some(r => r.dias === diasStr && !r.fecha)) {
          const newRow = { id: crypto.randomUUID(), fecha: '', dias: diasStr, resultado: '' };
          currentNonEmptyRows = [newRow, ...currentNonEmptyRows]; // Añadir al principio
          calculateForRow(newRow, 'dias', true);
        }
      });
    }
    rows = currentNonEmptyRows; // Reasignar rows para disparar reactividad
    ensureEmptyRow(); // Asegurar que siempre haya una fila vacía
  }

  /**
   * Limpia los campos de una fila para permitir cambiar el modo de cálculo.
   */
  function clearRow(row: CalculationRow) {
    row.fecha = '';
    row.dias = '';
    row.resultado = '';
    row.status = '';
    calculateForRow(row, undefined, true);
  }

  /**
   * Valida el input de días para permitir solo números y comas.
   * @param input - Elemento input del DOM
   * @param row - Objeto de la fila
   */
  function validarDiasInput(input: HTMLInputElement, row: CalculationRow) {
    // Reemplazar cualquier caracter que no sea número o coma
    let value = input.value.replace(/[^0-9,]/g, '')
    // No permitir comas al inicio
    if (value.startsWith(',')) value = value.slice(1) // Elimina la coma inicial
    
    // No permitir comas consecutivas
    value = value.replace(/,+/g, ',') // Reemplaza múltiples comas por una sola

    row.dias = value // Actualiza la propiedad 'dias' de la fila
    calculateForRow(row, 'dias') // Recalcula la fila (debounced)
  }

  /**
   * Obtiene el estado visual (holiday, saturday, working) para un número de días
   * desde hoy, considerando los feriados cargados y los días de gracia.
   */
  function getQuickStatus(days: number): string {
    const base = new Date(); // Siempre usa la fecha actual del sistema
    base.setHours(0, 0, 0, 0);
    const { final } = getFinalDate(base, days, diasGracia, feriados);
    const dayNum = final.getDay();
    const isH = isHoliday(final, feriados);
    if (dayNum === 0 || isH) return 'holiday';
    if (dayNum === 6) return 'saturday';
    return 'working';
  }

  /**
   * ==========================================
   * FUNCIONES DE FORMATEO Y PARSEO
   * ==========================================
   */

  /**
   * Da formato de fecha al input mientras el usuario escribe.
   * Convierte 28042026 -> 28/04/2026
   * @param input - Elemento input del DOM
   * @param row - Objeto de la fila para actualizar el estado
   */
  function formatearFechaInput(input: HTMLInputElement, row: CalculationRow) {
    let digits = input.value.replace(/\D/g, '')

    // Validar día (01-31)
    if (digits.length >= 2) {
      let d = parseInt(digits.slice(0, 2))
      if (d > 31) digits = '31' + digits.slice(2)
      if (d === 0 && digits.length >= 2) digits = '01' + digits.slice(2)
    }

    // Validar mes (01-12)
    if (digits.length >= 4) {
      let m = parseInt(digits.slice(2, 4))
      if (m > 12) digits = digits.slice(0, 2) + '12' + digits.slice(4)
      if (m === 0) digits = digits.slice(0, 2) + '01' + digits.slice(4)
    }

    // Reconstruir el formato dd/mm/yyyy basado en los dígitos procesados
    let formatted = ''
    if (digits.length >= 2) formatted = digits.slice(0, 2)
    if (digits.length >= 4) formatted += '/' + digits.slice(2, 4)
    if (digits.length >= 6) formatted += '/' + digits.slice(4, 8)
    
    row.fecha = formatted // Actualiza la propiedad 'fecha' de la fila
  }

  /**
   * Convierte una cadena de fecha a objeto Date.
   * Admite formatos: dd/mm/yyyy y yyyy/mm/dd (ISO)
   * @param fecha - Cadena de fecha con formato dd/mm/yyyy o yyyy/mm/dd
   * @returns Objeto Date o null si es inválida
   */
  function parseFecha(fecha: string): Date | null {
    const partes = fecha.split('/')

    // Detectar formato ISO (yyyy/mm/dd)
    if (partes[0].length === 4 && partes.length === 3) {
      const year = parseInt(partes[0])
      const month = parseInt(partes[1]) - 1
      const day = parseInt(partes[2])
      return new Date(year, month, day)
    }

    // Formato tradicional dd/mm/yyyy (requiere 3 partes)
    if (partes.length === 3) {
      const day = parseInt(partes[0])
      const month = parseInt(partes[1]) - 1
      const year = parseInt(partes[2])
      return new Date(year, month, day)
    }

    return null
  }

  function getDayName(date: Date): string {
    return dayNames[date.getDay()]
  }

  /**
   * ==========================================
   * FUNCIONES DE CÁLCULO
   * ==========================================
   */

  /**
   * Calcula el resultado para una fila específica.
   */
  function calculateForRow(row: CalculationRow, mode?: 'fecha' | 'dias', immediate = false) {
    if (calculationTimers.has(row.id)) {
      clearTimeout(calculationTimers.get(row.id));
    }

    const execute = () => {
      row.errorFecha = ''
      row.errorDias = ''
      const hasFecha = row.fecha && row.fecha.length === 10
      const hasDias = row.dias && String(row.dias).replace(/[^0-9]/g, '').length > 0

      if ((hasFecha && !hasDias) || mode === 'fecha') {
        calculateFromDate(row)
      } else if ((hasDias && !hasFecha) || mode === 'dias') {
        calculateFromDays(row)
      } else if (!hasFecha && !hasDias) {
        row.resultado = ''
        row.status = ''
      }
      calculationTimers.delete(row.id);
    };

    if (immediate) execute();
    else calculationTimers.set(row.id, setTimeout(execute, 250));
  }

  /**
   * Helper: Calcula diferencia de días desde una fecha ingresada
   */
  function calculateFromDate(row: CalculationRow) {
    const from = parseFecha(row.fecha)
    if (!from || isNaN(from.getTime())) {
      row.errorFecha = 'Fecha inválida'
      row.resultado = ''
      return
    }

    const base = new Date()
    base.setHours(0, 0, 0, 0)
    const diffTime = from.getTime() - base.getTime()
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    const dayName = getDayName(from)

    const suffix = diffDays === 0 ? ' (Hoy)' : (diffDays < 0 ? ' pasado' : '')
    row.resultado = diffDays === 0 ? `Hoy (${dayName})` : `${Math.abs(diffDays)} día(s)${suffix} (${dayName})`
    row.status = getDayStatus(from, feriados)
    row.mode = 'fecha'
  }

  /**
   * Helper: Calcula fecha resultante desde un número de días
   */
  function calculateFromDays(row: CalculationRow) {
    const diasArray = String(row.dias)
      .split(',')
      .map(d => parseInt(d.trim()))
      .filter(d => !isNaN(d))

    if (diasArray.length === 0) {
      row.resultado = ''
      row.status = ''
      return
    }

    const base = new Date()
    base.setHours(0, 0, 0, 0)
    const inputDays = diasArray[0]
    const { final, extraDiff } = getFinalDate(base, inputDays, diasGracia, feriados)
    const dayName = getDayName(final)
    
    row.resultado = diasGracia 
      ? `${formatDate(final)} (${dayName}) (+${extraDiff} proceso)` 
      : `${formatDate(final)} (${dayName})`
    
    row.status = getDayStatus(final, feriados)
    row.mode = 'dias'
  }

  /**
   * ==========================================
   * FUNCIONES DE GESTIÓN DE FILAS
   * ==========================================
   */

  function removeRow(id: string) {
    rows = rows.filter(r => r.id !== id)
    ensureEmptyRow()
  }

  function toggleDarkMode() {
    darkMode = !darkMode
    applyDarkMode()
  }

  function limpiar() {
    rows = [{ id: crypto.randomUUID(), fecha: '', dias: '', resultado: '' }]
    showToast('Campos limpiados')
  }

  function copiarResultados() {
    const texto = rows
      .filter(r => r.resultado)
      .map((r, i) => `${i + 1}. ${r.fecha || r.dias + ' días'} -> ${r.resultado}`)
      .join('\n')
    
    if (!texto) {
      showToast('No hay resultados para copiar')
      return
    }

    navigator.clipboard.writeText(texto)
    showToast('Resultados copiados al portapapeles')
  }

  function descargarXLSX() {
    // Implementación básica de exportación CSV (compatible con Excel)
    const headers = 'N°,Entrada,Resultado\n'
    const content = rows
      .filter(r => r.resultado)
      .map((r, i) => `${i + 1},${r.fecha || r.dias},${r.resultado}`)
      .join('\n')
    
    const blob = new Blob([headers + content], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    link.setAttribute('href', URL.createObjectURL(blob))
    link.setAttribute('download', `calculo_fechas_${new Date().toISOString().slice(0, 10)}.csv`)
    link.click()
  }

  function addRow() {
    rows = [...rows, { id: crypto.randomUUID(), fecha: '', dias: '', resultado: '' }]
  }
</script>

<div class="app-container">
  <div class="container py-4">
      <header class="pb-4 mb-5 border-b" role="banner">
        <div class="d-flex align-items-center justify-content-between">
          <div class="d-flex align-items-center gap-3">
            <LogoG360 variant={darkMode ? 'dark' : 'light'} class="logo-sm" aria-hidden="true" />
            <h1 class="app-title mb-0">CALCULADORA DE DÍAS</h1>
          </div>
          <div class="d-flex align-items-center">
            <button 
              class="btn-theme" 
              onclick={() => toggleDarkMode()} 
              title="Alternar modo oscuro (Ctrl+D)"
              aria-label={darkMode ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              aria-live="polite"
            >
              {#if darkMode}
                <i class="bi bi-sun" aria-hidden="true"></i>
              {:else}
                <i class="bi bi-moon-stars" aria-hidden="true"></i>
              {/if}
            </button>
          </div>
        </div>
      </header>

    <main>

      <!--
        Sección de "Acciones Rápidas". Permite realizar cálculos predefinidos
        y activar/desactivar el modo de "+2 días por proceso".
      -->
<!-- Acciones rápidas -->
      <div class="g360-card mb-4">
        <div class="card-header d-flex align-items-center justify-content-between">
          <h2>Acciones Rápidas</h2>
          <button class="btn-collapse" onclick={() => quickActionsCollapsed = !quickActionsCollapsed} aria-label={quickActionsCollapsed ? 'Expandir' : 'Colapsar'}>
            <i class="bi {quickActionsCollapsed ? 'bi-chevron-down' : 'bi-chevron-up'}"></i>
          </button>
        </div>
        <div class="card-body" class:collapse={quickActionsCollapsed}>
          <div class="quick-actions-container">
            <div class="quick-actions-group">
              <span class="quick-actions-label">Individuales</span>
              <div class="quick-actions-buttons">
                {#each [45, 60, 75, 90, 108, 120] as d}
                  <button 
                    class="g360-btn-quick" 
                    class:active={activeButtons.has(d)}
                    class:status-holiday={activeButtons.has(d) && getQuickStatus(d) === 'holiday'}
                    class:status-saturday={activeButtons.has(d) && getQuickStatus(d) === 'saturday'}
                    class:status-working={activeButtons.has(d) && getQuickStatus(d) === 'working'}
                    onmousedown={() => toggleRapido(d)}
                  >
                    {d}d
                  </button>
                {/each}
              </div>
            </div>
            <div class="quick-actions-group">
              <span class="quick-actions-label">Grupos</span>
              <div class="quick-actions-buttons">
                {#each [
                  {l: '45/60', v: [45, 60]}, 
                  {l: '45/60/75', v: [45, 60, 75]}, 
                  {l: '60/75', v: [60, 75]}, 
                  {l: '75/90', v: [75, 90]}, 
                  {l: '40/50/60', v: [40, 50, 60]}, 
                  {l: '45/55/65/75', v: [45, 55, 65, 75]}] as group}
                  <button class="g360-btn-quick" class:active={group.v.every(d => activeButtons.has(d))} onmousedown={() => toggleMultiples(group.v)}>{group.l}</button>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
      <!--
        Sección de "Opciones de Exportación". Contiene botones para exportar
        los resultados a XLSX, copiarlos al portapapeles o limpiar todos los campos.
      -->
      <div class="g360-card g360-card-thin mb-3">
        <div class="card-body-thin">
          <div class="form-check form-switch mb-0 d-flex align-items-center gap-2">
            <input class="form-check-input" type="checkbox" role="switch" id="diasGracia" bind:checked={diasGracia} onchange={() => { rows.forEach(r => calculateForRow(r)); }}>
            <label class="form-check-label" for="diasGracia">+2 días despacho</label>
            <div class="info-tooltip-wrapper">
              <span class="info-emoji">💡</span>
              <div class="g360-custom-tooltip">
                Suma 2 días + ajuste hábil.
              </div>
            </div>
          </div>
        </div>
      </div>

      <div class="g360-card mb-4">
        <div class="card-header">
          <div class="d-flex align-items-center justify-content-between w-100">
            <h2>Cálculo de Fechas <small class="fecha-base-indicator">(Hoy: {globalBaseDate})</small></h2>
            <div class="base-date-selector d-flex align-items-center gap-2">
              <!-- La fecha base es siempre "hoy" y no es editable.
                   Los cálculos se realizan a partir de la fecha actual del sistema. -->
            </div>
          </div>
        </div>
        <div class="card-body p-0">
      {#each rows as row, i (row.id)}
      <!--
        Cada 'calc-row' representa una fila de cálculo individual.
        Contiene el índice, los inputs de fecha y días, el resultado y los botones de acción.
      -->
      <div class="calc-row">
        <div class="calc-cell index-cell">
          <span class="index-badge">{i + 1}</span>
        </div>
        <div class="calc-cell date-cell">
          <input 
type="text" 
            class="g360-input" 
            bind:value={row.fecha}
            placeholder="dd/mm/yyyy" 
            maxlength={10}
            autocomplete="off"
            disabled={row.dias !== '' && row.dias !== undefined} 
            oninput={() => calculateForRow(row, 'fecha')}
            onfocus={(e) => e.currentTarget.select()}
            onblur={(e) => { formatearFechaInput(e.currentTarget, row); calculateForRow(row, 'fecha', true) }}
           >
          <button class="btn-input-action" onclick={() => clearRow(row)} title="Limpiar campos">
            <i class="bi bi-eraser"></i>
          </button>
          <label class="input-label">Fecha</label>
        </div>
        <div class="calc-cell days-cell">
          <input 
            type="text" 
            class="g360-input" 
            bind:value={row.dias}
            placeholder="Días"
            autocomplete="off"
            disabled={row.fecha !== '' && row.fecha !== undefined && row.fecha.length >= 6} 
            oninput={(e) => validarDiasInput(e.currentTarget, row)}
            onfocus={(e) => e.currentTarget.select()}
          >
          <label class="input-label">Días</label>
        </div>
        <div class="calc-cell result-cell" class:has-tooltip={row.status === 'holiday'}>
          <input 
            type="text" 
            class="g360-input result-input status-{row.status}" 
            bind:value={row.resultado} 
            placeholder="Resultado"
            readonly
            title={row.status === 'holiday' ? 'Fecha feriado' : ''}
          >
          <!-- svelte-ignore a11y_label_has_associated_control -->
          <label class="input-label">Resultado</label>
        </div>
        <div class="calc-cell btn-cell">
          {#if i === rows.length - 1}
            <button class="btn-add" onclick={() => addRow()} title="Añadir fila (Ctrl+N)"> 
              <i class="bi bi-plus-circle"></i>
            </button>
          {:else}
            <button class="btn-remove" onclick={() => removeRow(row.id)} title="Eliminar"> 
              <i class="bi bi-dash-circle"></i>
            </button>
          {/if}
        </div>
      </div>
      {/each}
        </div>
      </div>

      <!--
        Sección de "Opciones de Exportación". Contiene botones para exportar
        los resultados a XLSX, copiarlos al portapapeles o limpiar todos los campos.
      -->
      <!-- Acciones -->
      <div class="g360-card mb-4">
        <div class="card-header">
          <h2>Opciones de Exportación</h2>
        </div>
        <div class="card-body">
          <div class="actions-row">
      <button class="btn-primary" onclick={() => descargarXLSX()}>
        <i class="bi bi-file-earmark-excel me-1"></i> XLSX
      </button>
      <button class="btn-secondary" onclick={() => copiarResultados()}>
        <i class="bi bi-clipboard me-1"></i> Copiar
      </button>
      <button class="btn-theme" onclick={() => showHolidays = true}>
        <i class="bi bi-calendar3 me-1"></i> Feriados
      </button>
      <button class="btn-danger" onclick={() => limpiar()}>
        <i class="bi bi-trash me-1"></i> Limpiar
      </button>
          </div>

      <!--
        Leyenda de colores para los resultados.
        Explica el significado de los colores rojo, azul y verde.
      -->
      <!-- Leyenda -->
      <div class="leyenda d-flex align-items-center gap-3 mt-4">
        <span class="leyenda-item"><span class="color-box status-holiday-legend"></span> Feriado / Domingo</span>
        <span class="leyenda-item"><span class="color-box status-saturday-legend"></span> Sábado</span>
        <span class="leyenda-item"><span class="color-box status-working-legend"></span> Día hábil</span>
      </div>

      {#if diasGracia}
      <!-- Alerta que indica que el modo de +2 días por proceso está activo -->
      <div class="alert alert-info mb-4" role="alert">
        Modo: +2 días activado
      </div>
      {/if}

<!--
        Pie de página de la aplicación. Contiene la versión y el componente
        de firma de G360.
    -->
      <footer class="mt-4 pt-3 border-t d-flex justify-content-end align-items-center">
        <g360-signature mode="own" class="signature-g360"></g360-signature>
      </footer>
    </main>
  </div>

  <HolidaysModal bind:isOpen={showHolidays} {feriados} />
  <!--
    Componente modal para mostrar la lista de feriados.
  -->

  <!-- Toast -->
  {#if toast.show}
    <div class="toast-container position-fixed bottom-0 end-0 p-3" style="z-index: 1100;">
      <div class="toast show" role="alert">
        <div class="toast-body">{toast.message}</div>
      </div>
    </div>
  {/if}
</div>

<!--
  ==========================================
  ESTILOS GLOBALES Y DE COMPONENTES
  ==========================================
-->
<style>
  :root {
    --g360-bg: #0b1220;
    --g360-surface: #151e2e;
    --g360-text: #f0f4f8;
    --g360-muted: #94a3b8;
    --g360-border: #1e293b;
    --g360-status-holiday: #ef4444; /* Rojo */
    --g360-status-saturday: #3b82f6; /* Azul */
    --g360-status-working: #22c55e; /* Verde */
    --g360-status-bg-opacity: 85%;
    --g360-accent: #00d084;
    --g360-font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    --g360-font-h1: 1.5rem;
    --g360-font-h2: 0.875rem;
    --g360-font-body: 0.875rem;
    --g360-font-sm: 0.75rem;
    --g360-font-micro: 0.625rem;
    --g360-blur: 16px;
  }

  :global(html.dark) {
    --g360-bg: #0b1220;
    --g360-surface: #151e2e;
    --g360-text: #f0f4f8;
    --g360-muted: #94a3b8;
    --g360-border: #1e293b;
    --g360-status-holiday: #ef4444;
    --g360-status-saturday: #3b82f6;
    --g360-status-working: #22c55e;
    --g360-status-bg-opacity: 80%;
    --g360-accent: #00d084;
    --g360-glass: rgba(21, 30, 46, 0.75);
  }

  :global(html:not(.dark)) {
    --g360-bg: #ffffff;
    --g360-surface: #f8fafc;
    --g360-text: #09090b;
    --g360-muted: #71717a;
    --g360-border: #d4d4d8;
    --g360-status-holiday: #ef4444;
    --g360-status-saturday: #3b82f6;
    --g360-status-working: #22c55e;
    --g360-status-bg-opacity: 85%;
    --g360-accent: #00d084;
    --g360-glass: rgba(255, 255, 255, 0.7);
  }

  .table-responsive {
    overflow-x: auto;
  }

  .btn-theme {
    width: 48px;
    height: 48px;
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    border: 1px solid var(--g360-border);
    background: transparent;
    color: var(--g360-text);
    font-size: 1.25rem;
    cursor: pointer;
    transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .btn-theme:hover {
    border-color: var(--g360-accent);
    color: var(--g360-accent);
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 208, 132, 0.15);
  }

  .btn-theme:active {
    transform: scale(0.95);
  }

  .btn-agregar {
    padding: 0.5rem;
  }

  .btn-outline-secondary {
    border-width: 1px;
    font-size: 0.85rem;
  }

  /* Botones de acciones rápidas estandarizados */
  .g360-btn-quick {
    padding: 0.4rem 0.6rem;
    min-width: 54px;
    height: 34px;
    text-align: center;
    background: transparent;
    border: 1px solid var(--g360-border);
    border-radius: 8px;
    color: var(--g360-text);
    font-size: 0.8rem;
    font-family: var(--g360-font-family);
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .g360-btn-quick:hover {
    border-color: var(--g360-accent);
  }

  /* Efecto Glow para botones activos según estado */
  .g360-btn-quick.active.status-holiday {
    box-shadow: 0 0 12px color-mix(in srgb, var(--g360-status-holiday), transparent 60%);
  }
  .g360-btn-quick.active.status-saturday {
    box-shadow: 0 0 12px color-mix(in srgb, var(--g360-status-saturday), transparent 60%);
  }
  .g360-btn-quick.active.status-working {
    box-shadow: 0 0 12px color-mix(in srgb, var(--g360-status-working), transparent 60%);
  }
  /* Glow estándar para grupos */
  .g360-btn-quick.active:not([class*='status-']) {
    box-shadow: 0 0 12px color-mix(in srgb, var(--g360-accent), transparent 60%);
  }

  /* Fallback para grupos o botones sin estado definido */
  .g360-btn-quick.active:not([class*='status-']) {
    background: var(--g360-accent);
    border-color: var(--g360-accent);
    color: var(--g360-bg);
  }

  .app-container {
    min-height: 100vh;
    background: var(--g360-bg);
    color: var(--g360-text);
    transition: background 0.3s, color 0.3s;
  }

  /* Header Glass Effect */
  header {
    backdrop-filter: blur(var(--g360-blur, 16px));
    -webkit-backdrop-filter: blur(var(--g360-blur, 16px));
    background: var(--g360-glass, rgba(21, 30, 46, 0.75));
    border-bottom:1px solid var(--g360-border);
    padding: var(--g360-space-md, 16px) 0;
  }

  .app-title {
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--g360-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
  }

  :global(.logo-sm) {
    transform: scale(1.1);
    transform-origin: center center;
    display: block;
    margin: 0 auto;
  }

  @media (max-width: 480px) {
    .header-container {
      gap: 0.5rem;
    }
    .header-brand {
      flex: 1;
      gap: 0.25rem !important;
    }
    :global(.logo-sm) {
      transform: scale(0.85);
      transform-origin: left center;
    }
  }

  @media (max-width: 420px) {
    .header-container {
      gap: 0.25rem;
    }
    .header-brand {
      flex: 0 0 auto;
      gap: 0.25rem !important;
    }
    :global(.logo-sm) {
      transform: scale(0.6);
    }
    .app-title {
      line-height: 1.2 !important;
      padding: 0 !important;
      font-size: clamp(0.95rem, 4vw, 1.2rem) !important;
    }
  }

  .app-title {
    font-size: clamp(1.1rem, 3vw, 1.5rem);
    font-weight: 700;
    color: var(--g360-text);
    text-transform: uppercase;
    letter-spacing: 0.05em;
    line-height: 1;
    margin: 0;
    padding: 4px 0;
  }

  /* Estados de colores para resultados */
  .status-holiday {
    background-color: color-mix(in srgb, var(--g360-status-holiday), transparent var(--g360-status-bg-opacity)) !important;
    border-color: var(--g360-status-holiday) !important;
    color: var(--g360-status-holiday) !important;
  }
  
  .status-saturday {
    background-color: color-mix(in srgb, var(--g360-status-saturday), transparent var(--g360-status-bg-opacity)) !important;
    border-color: var(--g360-status-saturday) !important;
    color: var(--g360-status-saturday) !important;
  }

  .status-working {
    background-color: color-mix(in srgb, var(--g360-status-working), transparent var(--g360-status-bg-opacity)) !important;
    border-color: var(--g360-status-working) !important;
    color: var(--g360-status-working) !important;
  }

  /* Estilos para los color-box de la leyenda */
  .color-box {
    display: inline-block;
    width: 12px;
    height: 12px;
    border-radius: 3px;
    margin-right: 5px;
    vertical-align: middle;
  }

  .container {
    max-width: 800px;
    margin: 0 auto;
    padding: 1rem;
  }

  .border-b {
    border-bottom: 1px solid var(--g360-border);
  }

  .g360-card {
    background: var(--g360-surface);
    border: 1px solid var(--g360-border);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    transition: transform 0.2s ease, box-shadow 0.2s ease;
  }

  .g360-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
  }

  /*
    Estilos para el encabezado principal de la aplicación.
    Define el borde inferior para separación visual.
  */
  header {
    border-color: var(--g360-border);
  }

  /*
    Estilos para cada fila de cálculo en la tabla.
    Define el layout flexbox para la distribución horizontal de los elementos.
  */
  .calc-row {
    display: flex;
    flex-wrap: nowrap;
    align-items: center;
    gap: 0.5rem;
    padding: 0.75rem;
    border-bottom: 1px solid var(--g360-border);
    overflow-x: auto;
    min-width: 600px;
  }

  .calc-row::-webkit-scrollbar {
    height: 4px;
  }

  .calc-row::-webkit-scrollbar-thumb {
    background: var(--g360-border);
    border-radius: 2px;
  }

  .calc-row:last-child {
    border-bottom: none;
  }

  /*
    Quick actions responsive
  */
  .quick-actions-container {
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
    width:100%;
  }

  .quick-actions-group {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .quick-actions-label {
    font-size:0.7rem;
    color: var(--g360-muted);
    font-weight:500;
    text-transform: uppercase;
    letter-spacing:0.5px;
    min-width: 90px;
  }

  .quick-actions-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    width: 100%;
  }

  /* Layout Móvil: Grid 3 columnas, total 4 filas (2 por grupo) */
  @media (max-width: 767px) {
    .quick-actions-buttons {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
    }
    .g360-btn-quick {
      min-width: 0;
      width: 100%;
    }
  }

  /* Layout Escritorio: 2 líneas horizontales con etiquetas al lado */
  @media (min-width: 768px) {
    .quick-actions-group {
      flex-direction: row;
      align-items: center;
    }
  }

  /*
    Estilos base para cada celda dentro de una fila de cálculo.
    Usa flex-direction column para apilar el input y el label.
  */
  .calc-cell {
    display: flex;
    flex-direction: column;
    position: relative;
    padding-top: 1.25rem;
  }

  /*
    Estilos específicos para la celda del índice.
    Define el ancho y el tamaño mínimo/máximo.
  */
  .index-cell {
    width: 10%;
    flex: 0 0 10%;
    min-width: 40px;
    max-width: 50px;
  }

  /*
    Estilos específicos para la celda de la fecha.
    Define el ancho y el tamaño mínimo.
  */
  .date-cell {
    width: 25%;
    flex: 0 0 25%;
    min-width: 120px;
  }

  /*
    Estilos específicos para la celda de los días.
    Define el ancho y el tamaño mínimo.
  */
  .days-cell {
    width: 15%;
    flex: 0 0 15%;
    min-width: 80px;
  }

  /*
    Estilos específicos para la celda del resultado.
    Define el ancho y el tamaño mínimo.
  */
  .result-cell {
    width: 40%;
    flex: 0 0 40%;
    min-width: 180px;
  }

  /*
    Estilos específicos para la celda de los botones de acción (añadir/eliminar).
    Define el ancho y el tamaño mínimo/máximo.
  */
  .btn-cell {
    width: 10%;
    flex: 0 0 10%;
    min-width: 40px;
    max-width: 50px;
  }

  /*
    Estilos base para los botones de añadir y eliminar fila.
    Define el tamaño, forma y centrado del icono.
  */
  .btn-add,
  .btn-remove {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.25rem;
  }

  /* Estilos específicos para el botón de añadir fila (verde G360) */
  .btn-add {
    background: var(--g360-accent);
    color: var(--g360-bg);
  }

  /* Estilos específicos para el botón de eliminar fila (rojo) */
  .btn-remove {
    background: #ef4444;
    color: #fff;
  }

  /*
    Estilos para el badge numérico del índice de cada fila.
    Define la forma circular, el fondo y el borde.
  */
  .index-badge {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 28px;
    height: 28px;
    background-color: var(--g360-surface);
    border: 1px solid var(--g360-border);
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: 600;
    color: var(--g360-muted);
  }

  /* Efecto hover para el badge del índice cuando se pasa el mouse sobre la fila */
  .calc-row:hover .index-badge {
    border-color: var(--g360-accent);
    color: var(--g360-accent);
  }

  /*
    Estilos base para los inputs de la tabla de cálculo.
    Define el fondo, color de texto, borde y radio.
  */
  .g360-input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    background: var(--g360-bg);
    color: var(--g360-text);
    border: 1px solid var(--g360-border);
    border-radius: 8px;
    height: 38px;
    font-size: var(--g360-font-body);
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .btn-input-action {
    position: absolute;
    right: 8px;
    top: 1.4rem;
    background: transparent;
    border: none;
    color: var(--g360-muted);
    cursor: pointer;
    padding: 2px 6px;
    font-size: 1.1rem;
    transition: color 0.2s;
    z-index: 5;
  }

  .btn-input-action:hover {
    color: var(--g360-accent);
  }

  /* Estilos para el input cuando está en foco */
  .g360-input:focus {
    outline: none;
    border-color: var(--g360-accent);
  }

  /* Estilos para el input cuando está deshabilitado */
  .g360-input:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  /* Estilos para el placeholder del input */
  .g360-input::placeholder {
    color: var(--g360-muted);
    opacity: 0.5;
  }

  /* Estilos para el input de solo lectura (resultado) */
  .g360-input[readonly] {
    background: var(--g360-surface);
    cursor: default;
  }

  /*
    Sistema de Floating Labels G360.
    Posicionamiento absoluto y transición para el efecto flotante.
  */
  .input-label {
    position: absolute;
    top: 1.85rem;
    left: 0.75rem;
    font-size: var(--g360-font-body);
    color: var(--g360-muted);
    pointer-events: none;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Estilos cuando el label flota (input enfocado o con texto) */
  .g360-input:focus + .input-label,
  .g360-input:not(:placeholder-shown) ~ .input-label {
    top: 0.15rem;
    left: 0.5rem;
    font-size: var(--g360-font-micro);
    color: var(--g360-accent);
    font-weight: 600;
    text-transform: uppercase;
  }

  /*
    Estilos para el encabezado de las tarjetas (g360-card).
    Define el fondo, borde inferior y padding.
  */
  .card-header {
    background: transparent;
    border-bottom: 1px solid var(--g360-border);
    padding: 0.75rem 1rem;
  }

  @media (max-width: 420px) {
    .card-header {
      padding: 0.5rem 0.75rem;
    }
  }

  /* Estilos para el título h2 dentro del card-header */
  .card-header h2 {
    font-size: 0.95rem;
    font-weight: 600;
    margin: 0;
    color: var(--g360-text);
    text-transform: uppercase;
    letter-spacing: 0.025em;
  }

  /* Estilos para el cuerpo de las tarjetas (g360-card) */
  .card-body {
    background: transparent;
    color: var(--g360-text);
    padding: 1rem;
    overflow-x: auto;
  }

  .card-body.p-0 {
    overflow-x: auto;
    min-width: 100%;
  }

  .g360-card-thin {
    background: var(--g360-surface);
    border: 1px solid var(--g360-border);
    border-radius: 8px;
  }

  .card-body-thin {
    padding: 0.5rem 1rem;
  }

  @media (max-width: 420px) {
    .card-body-thin {
      padding: 0.4rem 0.75rem;
    }
  }

  /*
    Estilos generales para los controles de formulario de Bootstrap.
    Asegura la consistencia con el tema G360.
  */
  .form-control {
    background: var(--g360-bg);
    color: var(--g360-text);
    border: 1px solid var(--g360-border);
    border-radius: 8px;
    padding: 0.5rem 0.75rem;
  }

  /* Estilos para el control de formulario cuando está en foco */
  .form-control:focus {
    border-color: var(--g360-accent);
    box-shadow: 0 0 0 2px rgba(0, 208, 132, 0.2);
  }

  /* Estilos para el placeholder del control de formulario */
  .form-control::placeholder {
    color: var(--g360-muted);
    opacity: 0.6;
  }

  /* Estilos para el input de checkbox/switch */
  .form-check-input {
    background-color: var(--g360-bg);
    border-color: var(--g360-border);
  }

  /* Estilos para el input de checkbox/switch cuando está marcado */
  .form-check-input:checked {
    background-color: var(--g360-accent);
    border-color: var(--g360-accent);
  }

  /* Estilos específicos para el switch */
  .form-switch .form-check-input {
    background-color: var(--g360-bg);
  }

  /* Estilos base para todos los botones */
  .btn {
    border-radius: 8px;
    font-weight: 600;
    padding: 0.6rem 1.25rem;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  /* Estilos para botones con borde secundario */
  .btn-outline-secondary {
    background: transparent;
    border-color: var(--g360-border);
    color: var(--g360-text);
  }

  /* Efecto hover para botones con borde secundario */
  .btn-outline-secondary:hover {
    background: var(--g360-surface);
    border-color: var(--g360-accent);
    color: var(--g360-accent);
  }

  /* Estilos para botones de éxito (verde G360) */
  .btn-success {
    background: var(--g360-accent);
    border-color: var(--g360-accent);
    color: var(--g360-bg);
  }

  /* Estilos para botones secundarios (gris atenuado) */
  .btn-secondary {
    background: var(--g360-muted);
    border-color: var(--g360-muted);
    color: var(--g360-bg);
  }

  /* Estilos para botones de peligro (rojo) */
  .btn-danger {
    background: #ef4444;
    border-color: #ef4444;
  }

  /*
    Estilos para la cuadrícula de resultados en el panel de resumen.
    Divide el espacio en 3 columnas iguales.
  */
  /* Result grid */
  .result-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 1rem;
    text-align: center;
  }

  /* Estilos para cada elemento dentro de la cuadrícula de resultados */
  .result-item {
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
  }

  /* Estilos para la fila de botones de acción */
  /* Actions row */
  .actions-row {
    display: flex;
    gap: 0.75rem;
    flex-wrap: wrap;
    width: 100%;
    animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1) forwards;
  }

  @keyframes slideUp {
    0% {
      opacity: 0;
      transform: translateY(20px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .actions-row button {
    flex: 1 1 140px;
    min-width: 140px;
    white-space: nowrap;
  }

  @media (max-width: 640px) {
    .actions-row button {
      flex: 1 1 calc(50% - 0.75rem);
    }
  }

  @media (max-width: 380px) {
    .actions-row button {
      flex: 1 1 100%;
    }
  }

  /*
    Estilos para la tabla de resultados múltiples.
    Define el colapso de bordes y el tamaño de fuente.
  */
  /* Buttons */
  .btn-primary {
    background: var(--g360-accent);
    color: var(--g360-bg);
    border: none;
    cursor: pointer;
  }

  /* Estilos para botones secundarios */
  .btn-secondary {
    background: transparent;
    border: 1px solid var(--g360-border);
    color: var(--g360-text);
    cursor: pointer;
  }

  .btn-secondary:hover {
    background: var(--g360-surface);
    border-color: var(--g360-muted);
  }

  /* Estilos para botones de peligro */
  .btn-danger {
    background: color-mix(in srgb, #ef4444, transparent 10%);
    color: white;
    border: none;
    cursor: pointer;
  }

  /* Estilos para el botón de alternar tema/ver feriados */
  .btn-theme {
    background: transparent;
    border: 1px solid var(--g360-border);
    color: var(--g360-text);
    cursor: pointer;
  }

  .btn-collapse {
    background: transparent;
    border: none;
    color: var(--g360-muted);
    padding: 0.25rem 0.5rem;
    cursor: pointer;
    font-size: 1.25rem;
  }

  .card-body.collapse {
    display: none;
  }

  @media (max-width: 499px) {
    .card-body.collapse {
      display: none;
    }
    .quick-actions-container.collapse-mobile {
      display: none;
    }
    .quick-actions-container.collapse-mobile.show {
      display: flex;
    }
  }

  .leyenda {
    padding-top: 10px;
  }

  /* Colores específicos para los color-box de la leyenda */
  .status-holiday-legend {
    background-color: var(--g360-status-holiday);
  }

  .status-saturday-legend {
    background-color: var(--g360-status-saturday);
  }

  .status-working-legend {
    background-color: var(--g360-status-working);
  }
  /* Alinea el signature a la derecha en el footer */
  .signature-g360 {
    margin-left: auto;
  }
</style>
