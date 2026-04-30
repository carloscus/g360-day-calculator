# Lineamientos de Despliegue - Ecosistema G360

Este documento resume las soluciones técnicas aplicadas para superar los errores de despliegue (404 y bloqueos de activos) en GitHub Pages para aplicaciones basadas en Vite.

## 1. Configuración de Vite (`vite.config.ts`)

*   **Base Path Relativo:** Usar `base: './'` es la forma más segura para que la aplicación funcione tanto en la raíz de un dominio como en subdirectorios (ej. `usuario.github.io/repo/`).
*   **Renombrado de Assets:** Si la carpeta `assets` es bloqueada por Git o el servidor, se debe cambiar el nombre del directorio de salida.
    ```typescript
    build: {
      assetsDir: 'g360-assets', // Evita conflictos con nombres genéricos
    }
    ```

## 2. Manejo de la carpeta `public`

*   **Evitar subcarpetas profundas:** Para archivos críticos (favicon, manifest, service worker), es mejor mantenerlos en la raíz de `public`.
*   **Nombres Personalizados:** GitHub Pages a veces filtra archivos genéricos como `manifest.json` o `sw.js`. Usar prefijos (ej. `g360-manifest.json`) asegura su disponibilidad.
*   **Archivo `.nojekyll`:** Incluir siempre un archivo vacío llamado `.nojekyll` en la carpeta `public`. Esto indica a GitHub que no procese el sitio con Jekyll, evitando que ignore archivos que comienzan con guiones bajos o nombres específicos.

## 3. Referencias en `index.html`

*   **Origen vs Salida:** 
    *   En el código fuente, referenciar archivos de `public` con una barra inicial (ej. `href="/favicon.svg"`). 
    *   Vite detectará estas rutas y, gracias al `base: './'`, las transformará en rutas relativas correctas durante el build.
*   **Service Worker:** Registrar el SW usando la variable de entorno de Vite para asegurar que la ruta sea dinámica:
    ```javascript
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}g360-sw.js`)
    ```

## 4. Control de Versiones (`.gitignore`)

*   **Limpieza de Reglas Globales:** Revisar que el `.gitignore` no contenga reglas que bloqueen carpetas de activos de forma global (ej. `assets/` o `manifest.json`). Si son archivos legacy, eliminarlos del ignore para que no afecten a la carpeta `dist` durante el despliegue.

## 5. Automatización del Flujo (Snippet Shipit)

Para garantizar que el código fuente y el despliegue estén siempre sincronizados, usar un script unificado en `package.json`:

```json
"scripts": {
  "deploy": "gh-pages -d dist",
  "shipit": "git add . && git commit -m 'build: deploy updates' && git push origin main && npm run build && npm run deploy"
}
```

---
*Documento generado como feedback tras el despliegue exitoso de G360 Day Calculator.*
