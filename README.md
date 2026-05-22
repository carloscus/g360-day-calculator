# G360 Day Calculator

Calculadora de fechas con feriados peruanos. Permite calcular días hábiles considerando feriados fijos y móviles (Semana Santa).

## Características

- **Cálculo bidireccional**: ingresa una fecha y obtén los días de diferencia, o ingresa días y obtén la fecha resultante
- **Feriados peruanos**: carga automática con feriados fijos y Semana Santa
- **Acciones rápidas**: botones predefinidos para 45, 60, 75, 90, 108 y 120 días
- **+2 días despacho**: suma 2 días hábiles adicionales al resultado
- **Exportación XLSX**: descarga el reporte con 5 columnas y estilo zebra
- **Modo oscuro**: toggle con persistencia en localStorage
- **PWA**: instalable como aplicación con service worker
- **Atajos de teclado**: Ctrl+N (nueva fila), Ctrl+E (exportar), Ctrl+S (copiar), Ctrl+L (limpiar), Ctrl+D (modo oscuro)

## Stack

- Svelte 5 + Vite 6
- TypeScript
- ExcelJS (exportación XLSX con estilos)
- Bootstrap Icons
- PWA (service worker + manifest)

## Desarrollo

```bash
npm install
npm run dev     # servidor en http://localhost:3000
npm run build   # genera dist/
npm run preview # previsualiza build
```

## Despliegue

```bash
npm run deploy  # publica en GitHub Pages via gh-pages
```

El proyecto se despliega automáticamente en la rama `gh-pages` del repositorio.
