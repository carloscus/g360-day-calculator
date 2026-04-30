# G360 Day Calculator 🚀

> Calculadora de días con feriados peruanos, modo oscuro y funcionalidad offline. Forma parte de la familia de microherramientas G360 para gestión de fechas y plazos.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Tabla de Contenidos

- [Descripción](#descripción)
- [Funcionalidades](#funcionalidades-destacadas)
- [Lógica de Cálculo](#lógica-de-cálculo)
- [Sistema Visual](#sistema-visual)
- [Atajos de Teclado](#atajos-de-teclado)
- [Tecnologías](#tecnologías)
- [Estructura](#estructura)
- [Familia G360](#familia-g360)

---

## ✨ Funcionalidades Destacadas

### Cálculo de Fechas
- **Cálculo automático:** Resultados en tiempo real mientras escribes
- **Debounce optimizado:** Retraso de 250ms para mejorar la performance al escribir.
- **Bloqueo mutuo:** Al llenar Fecha, Días se bloquea y viceversa
- **Suma de días:** Ingresa número de días y obtén la fecha resultante

### Modo +2 Días de Proceso
- Checkbox para agregar 2 días de gracia al cálculo
- Si el resultado cae en Domingo o Feriado, se ajusta automáticamente
- Muestra el total de días extras: `(+3 proceso)`
- **Cálculo detallado:** Desglosa la "Fecha Objetivo" (original) vs el "Resultado Final" (con ajuste).

### Feriados Peruanos
- Identificación automática de feriados fijos
- Cálculo automático de Semana Santa (Jueves y Viernes Santo)
- Modal con lista de feriados del año

### Exportación Avanzada
- **Excel/CSV compatible:** Exportación detallada en 6 columnas.
- **Transparencia:** Incluye Fecha de Inicio, Días, Fecha Objetivo, Ajuste y Resultado Final.
- **Codificación:** Soporte UTF-8 (BOM) para compatibilidad total con Excel.

### PWA
- Instalable en escritorio y móvil
- Funciona offline
- Service Worker para caché

---

## 📊 Lógica de Cálculo

### Sin +2 Días
```
HOY + inputDays = fecha exacta
```
Ejemplo: 28/04 + 89 = 26/07/2026

### Con +2 Días
```
1. HOY + inputDays = target1
2. target1 + 2 = target1 + 2
3. Si target1+2 cae en Domingo/Feriado → +1 hasta día hábil
4. Resultado: fecha_final (+días_extras proceso)
```
Ejemplo: 28/04 + 89 + 2 = 30/07/2026 (+4 proceso)

---

## 🎨 Sistema Visual

Basado en el lenguaje visual **G360 Technical Professional**:

- **Header:** Tipografía monoespaciada (`Roboto Mono`) de 14px y opacidad 0.7 para estética de terminal técnica.
- **Logo:** Marca G360 con dimensiones fijas (120px) y filtros de resplandor (glow) dinámicos.
- **Botones:** 
  - **XLSX:** Verde esmeralda (`#00c853`) con elevación en hover para destacar acción principal.
  - **Copiar/Feriados:** Gris antracita con bordes traslúcidos `white24`.
  - **Limpiar:** Botón de bajo énfasis en rojo pastel para acciones destructivas.

### Colores de Estado

| Estado | Color | Descripción |
|--------|-------|-------------|
| Feriado/Domingo | 🔴 Rojo | Día no laborable |
| Sábado | 🔵 Azul | Día parcialmente laborable |
| Día hábil | 🟢 Verde | Día laborable normal |

### Tema G360
```css
--g360-bg: #0b1220;
--g360-surface: #151e2e;
--g360-accent: #00d084;
--g360-text: #f0f4f8;
--g360-muted: #94a3b8;
--g360-border: #1e293b;
```

---

## ⌨️ Atajos de Teclado

| Atajo | Acción |
|-------|--------|
| `Ctrl + D` | Alternar modo oscuro |
| `Ctrl + N` | Agregar nueva fila |
| `Ctrl + E` | Exportar XLSX |
| `Ctrl + S` | Copiar resultados |
| `Ctrl + L` | Limpiar campos |
| `Escape` | Cerrar modal |

---

## 🛠️ Tecnologías

- **Svelte 5** - Framework reactivo
- **Vite** - Build tool
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Service Workers** - Offline

---

## 📂 Estructura

```
g360-day-calculator/
├── src/
│   ├── App.svelte          # Componente principal
│   ├── g360-theme.css       # Variables CSS G360
│   └── lib/
│       ├── LogoG360.svelte  # Logo
│       ├── HolidaysModal.svelte
│       ├── types.ts
│       └── utils.ts
├── public/
│   ├── feriados.json         # Feriados peruanos
│   ├── sw.js               # Service Worker
│   └── manifest.json       # PWA config
└── index.html
```

---

## 📋 Feriados de Perú

| Fecha | Feriado |
|-------|---------|
| 01/01 | Año Nuevo |
| Jueves Santo | Variable |
| Viernes Santo | Variable |
| 01/05 | Día del Trabajo |
| 29/06 | San Pedro y San Pablo |
| 23/07 | Día de la Fuerza Aérea |
| 28/07 | Fiestas Patrias |
| 29/07 | Fiestas Patrias |
| 06/08 | Batalla de Junín |
| 30/08 | Santa Rosa de Lima |
| 08/10 | Combate de Angamos |
| 01/11 | Día de Todos los Santos |
| 08/12 | Inmaculada Concepción |
| 09/12 | Batalla de Ayacucho |
| 25/12 | Navidad |

---

**Desarrollado por**: Carlos Cusi  
**Año**: 2026

---

## Familia G360

Este proyecto forma parte de la familia de microherramientas **G360** para gestión de datos en escritorio.

### Herramientas Relacionadas

- **[g360-cli](https://github.com/carloscus/g360-cli)**: Bootstrap de proyectos G360
- **[g360-signature](https://github.com/carloscus/g360-signature)**: Web component de branding
- **[g360-nc-sustentor](https://github.com/carloscus/g360-nc-sustentor)**: Generación de sustento para NC
- **[g360-return-form](https://github.com/carloscus/g360-return-form)**: Sistema de devoluciones

---

**Marca**: G360  
**Isotipo**: 3 puntos verticales (gris-verde-gris) + chevron `>`  
**Autor**: Carlos Cusi  
**Desarrollo**: Con asistencia de herramientas de código IA (Vibe Code)  
**Powered by**: [g360-signature](https://github.com/carloscus/g360-signature)