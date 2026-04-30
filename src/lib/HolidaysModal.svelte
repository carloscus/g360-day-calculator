<script lang="ts">
  import type { Feriado } from './types'

  interface Props {
    isOpen: boolean
    feriados: Feriado[]
  }

  let { isOpen = $bindable(false), feriados = [] }: Props = $props()

  function formatDate(dia: number, mes: number, anio: number): string {
    return `${dia.toString().padStart(2, '0')}/${mes.toString().padStart(2, '0')}/${anio}`
  }

  const currentYear = new Date().getFullYear()

  // Ya que 'feriados' en App.svelte ya incluye la Semana Santa calculada,
  // simplemente los ordenamos para la vista.
  const allHolidays = $derived(
    [...feriados]
      .sort((a, b) => {
        const yearA = a.anio || currentYear
        const yearB = b.anio || currentYear
        if (yearA !== yearB) return yearA - yearB
        if (a.mes !== b.mes) return a.mes - b.mes
        return a.dia - b.dia
      })
  )
</script>

{#if isOpen}
  <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
  <div class="modal-overlay" onclick={() => isOpen = false} onkeydown={(e) => e.key === 'Escape' && (isOpen = false)} role="dialog" aria-modal="true" tabindex="-1">
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions a11y_no_noninteractive_tabindex -->
    <div class="modal-g360" onclick={(e) => e.stopPropagation()} onkeydown={(e) => e.stopPropagation()} role="document" tabindex="0">
      <div class="modal-header">
        <h2>Feriados {currentYear} - {currentYear + 1}</h2>
        <button class="btn-close" onclick={() => isOpen = false} aria-label="Cerrar">
          <i class="bi bi-x-lg"></i>
        </button>
      </div>
      <div class="modal-body">
        <p class="modal-description">
          Días no laborables considerados en el cálculo:
        </p>
        <div class="flex flex-col gap-2">
          {#each allHolidays as f, i}
            <div class="holiday-item">
              <span class="holiday-date">
                {formatDate(f.dia, f.mes, f.anio || currentYear)}
              </span>
              <span class="holiday-name">
                {f.nombre}
              </span>
            </div>
          {/each}
        </div>
      </div>
    </div>
  </div>
{/if}

<style>
  .holiday-item {
    display: flex;
    justify-content: space-between;
    padding: 10px 12px;
    background-color: var(--g360-bg);
    border-radius: 8px;
    border: 1px solid var(--g360-border);
    margin-bottom: 8px;
  }

  .holiday-date {
    color: var(--g360-status-holiday);
    font-size: 0.85rem;
    font-weight: 600;
  }

  .holiday-name {
    color: var(--g360-text);
    font-size: 0.8rem;
  }
</style>