# Pendientes y punto en que quedó el trabajo

Última actualización: tarea "responsive + sincronización Realtime" (interrumpida a petición del usuario).

## Estado del código (commiteado)

Todo lo siguiente está implementado, probado en local y con `tsc`, `vitest` (148 tests), `build` y `lint` en verde.

**Sincronización panel → pantalla con Supabase Realtime**
- Canal Broadcast `drive-thru` (`src/lib/realtimeChannel.ts`, un solo canal por página).
- Lógica pura y con tests en `src/lib/controlSync.ts`: eventos `control` (cambio en vivo), `request` (un cliente nuevo pide el estado) y `state` (respuesta; solo se adopta la primera). No se comparan relojes entre dispositivos.
- `useControlState` usa Realtime y mantiene `localStorage` + evento `storage` como respaldo.
- El panel muestra "Sincronización: …" (en vivo / conectando / solo este navegador).
- Probado con **dos contextos de navegador separados** contra el servidor local: el cambio llega en 116–301 ms, una pantalla nueva recibe el estado al abrirse, el panel recargado lo recupera y, con el WebSocket bloqueado, el respaldo de `localStorage` sigue funcionando. 0 errores de consola.

**Responsive**
- `/` en vertical (`@media (orientation: portrait)`): una columna, barra de contexto compacta, destacados apilados (foto arriba), menú en 1 columna por categoría (2 en tablet). Todo dentro de esa media query.
- `/panel` (`@media (max-width: 900px)`): controles a ancho completo, áreas táctiles ≥ 44 px, slider con pulgar de 44 px, vista previa debajo de los controles.
- Base móvil en `tokens.css` (tap highlight, `touch-action`, escala de `rem` por ancho en vertical).
- **Layout de TV sin cambios:** comparado píxel por píxel entre el código anterior y el nuevo en los 4 tamaños de escritorio × 4 estados (16 combinaciones idénticas; las diferencias de la primera pasada eran ruido de renderizado de las fotos, también presente entre dos corridas del código viejo).
- Auditor ampliado (`.playwright-mcp/audit-responsive.js`, local, no versionado): 375×667, 390×844, 768×1024 y los 4 de escritorio × 4 estados, `/` y `/panel`, más prueba de estrés → **63 de 63 sin problemas** (sin scroll horizontal, sin texto cortado ni encimado, áreas táctiles ≥ 44 px, campos ≥ 16 px).

## Dónde me quedé

Terminada la auditoría de layout y revisadas dos capturas móviles (pantalla 375 y panel 390). Se interrumpió justo antes de **verificar en producción** y de cerrar la revisión de accesibilidad.

## Falta por hacer

1. **Verificar Realtime en producción** (pedido explícito, NO hecho). Tras el deploy de Vercel de este commit, repetir con dos contextos de navegador separados contra `https://menu-inteligente-drive-thru.vercel.app`:
   - Script listo: `.playwright-mcp/realtime-test.js` (cambiar `BASE` a la URL de producción; usa `routeWebSocket`, que ya funcionó en local).
   - Confirmar: "Sincronización: en vivo", el cambio llega de un contexto al otro, una pantalla nueva recibe el estado, 0 errores de consola.
   - No ejecutar esta prueba a la vez que pruebas locales: comparten el canal `drive-thru` (ver riesgos).
2. **Revisión de accesibilidad (`design:accessibility-review`) incompleta.** La skill se invocó y se midieron tamaños de fuente (mínimo 12.2 px en móvil), áreas táctiles y campos ≥ 16 px, pero falta el informe formal y revisar el **contraste de los textos pequeños en móvil** (etiquetas mono de 12 px sobre fondos de acento y sobre tinta). Falta también probar foco con teclado y lector de pantalla en el panel móvil.
3. **Capturas sin revisar a ojo.** Pasaron el auditor, pero solo abrí 2 de ~60 (pantalla 375 y panel 390). Faltan al menos: tablet 768×1024 (`display-768x1024-*`, 2 columnas), pantalla 390×844, panel 375×667 y la prueba de estrés móvil. Están en `.playwright-mcp/resp/` (ignorada por git).
4. **README:** agregar una nota breve sobre la sincronización entre dispositivos (canal `drive-thru`, respaldo local) y sobre el uso desde el celular (abrir `/panel` en el teléfono y `/` en la pantalla).
5. Opcional: revisar en un **celular real** (el emulador no reproduce teclado, barra del navegador ni zoom de iOS).

## Riesgos y decisiones a tener presentes

- **El canal `drive-thru` es público y compartido.** Cualquiera con la URL y la clave pública de Supabase puede enviar mensajes (los valores se limitan a su rango, así que no pueden romper la pantalla, pero sí cambiar el estado). Además, un panel abierto en **local** controla la pantalla de **producción** si ambos están abiertos a la vez, porque usan el mismo proyecto y el mismo canal. Si molesta, namespacear el canal por entorno (p. ej. `drive-thru-dev`) o por sala.
- **Celular acostado:** la pantalla `/` conserva el layout de TV (así se pidió), con texto muy pequeño en pantallas bajas. El panel en horizontal usa tamaño fijo legible.
- **Tablet vertical (768×1024):** usa el layout móvil en 2 columnas (decisión mía; no estaba especificado).
- **Realtime:** si la conexión se cae, el cliente reintenta solo; los cambios hechos sin conexión se envían al reconectar. Un cliente que reconecta pide el estado y adopta la primera respuesta.

## Pendientes anteriores que siguen abiertos

- Verificar en la URL pública, tras cada push, que el deploy de Vercel terminó bien (los últimos pushes no se verificaron en producción).
- La key de OpenWeatherMap ya funciona (verificado antes en producción).
