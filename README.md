# Menú Digital Drive-Thru

Pantalla de menú para el cliente que espera en la fila del drive-thru. Destaca 3–4 productos que **cambian solos** según el **clima**, la **fila** y la **hora**, y trae un **panel de control** para demostrarlo en vivo en clase.

**Stack:** React + TypeScript (Vite), Supabase (catálogo), OpenWeatherMap (clima de Tampico, MX), Vitest.

## Demo en vivo

| Qué | URL |
|---|---|
| Pantalla del cliente | <https://menu-inteligente-drive-thru.vercel.app/> |
| Panel de control | <https://menu-inteligente-drive-thru.vercel.app/panel> |

Ver los pasos para la presentación en [Demo en clase](#demo-en-clase).

## Inicio rápido

```bash
npm install
npm run dev
```

- Pantalla del cliente: <http://localhost:5173/>
- Panel de control (demo): <http://localhost:5173/panel>

El proyecto **funciona sin configurar nada**: sin Supabase usa un catálogo local de respaldo (21 productos) y sin API key de OpenWeatherMap usa temperatura simulada.

## Configuración opcional

Copia `.env.example` a `.env` y llena lo que quieras usar:

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_OPENWEATHER_API_KEY=
```

### Supabase

1. Crea un proyecto en Supabase.
2. En **SQL Editor** ejecuta, en este orden, [supabase/schema.sql](supabase/schema.sql) y [supabase/seed.sql](supabase/seed.sql).
3. Pon la URL y la *anon key* del proyecto en `.env`.

La tabla `products` tiene RLS activado con lectura pública solo de productos con `available = true`. Si Supabase falla o la tabla está vacía, la app usa el catálogo de respaldo (el panel indica cuál está activo).

Para agregar fotos, llena la columna `image_url`; si está vacía o falla al cargar, la tarjeta muestra un emoji sobre un bloque de color.

### OpenWeatherMap

Crea una API key gratuita y ponla en `VITE_OPENWEATHER_API_KEY`. Consulta Tampico (22.2331, −97.8611) en °C y refresca cada 10 minutos. Si falla la consulta, cae a la temperatura manual.

## Reglas de recomendación

| Variable | Regla |
|---|---|
| Temperatura | `> 28 °C` bebidas frías · `< 20 °C` bebidas calientes · de 20 a 28 °C mixto |
| Fila | `> 5` carros → prioriza los productos más caros (premium) · `≤ 5` → aleatorio dentro de la categoría del clima |
| Hora | `6–12` café y desayuno · `12–19` frappés y postres · resto (noche) mixto |

Los productos que coinciden con la franja horaria van primero; el resto de la categoría del clima completa hasta 4. Los destacados solo se recalculan cuando **cambia de banda** (clima, fila corta/larga o franja), no con cada movimiento del slider ni con el reloj.

## Demo en clase

1. **Abre las dos pantallas en pestañas del mismo navegador y la misma computadora:**
   la pantalla del cliente (`/`) en una pestaña y el panel (`/panel`) en otra. Se comunican por `localStorage`, así que deben estar en el **mismo navegador**; no funciona entre dos dispositivos distintos. Pon la pestaña de `/` en pantalla completa (F11) para que se vea como el menú del drive-thru.
2. **Deja el clima en "Simulado"** en el panel, para controlar la temperatura a mano.
3. **Mueve la temperatura** y mira la barra de arriba en la pestaña de `/`:
   - **33 °C** → "Día caluroso → Bebidas frías".
   - **15 °C** → "Día fresco → Bebidas calientes".
   - **24 °C** → "Clima templado → Mixto".
4. **Mueve el slider de fila** de **3 a 9 carros** → aparece "Fila larga: selección premium" y los productos más caros pasan primero. Con 6 carros o más se activa el modo premium; de 0 a 5 las recomendaciones son aleatorias dentro de la categoría del clima.
5. **Cambia la hora** a **08:00** y luego a **15:00** → café y desayuno por la mañana, frappés y postres por la tarde.
6. **Observa cómo cambian las recomendaciones**: al cruzar de banda, los cuatro destacados se reemplazan con una transición. El contador de carros y la temperatura se actualizan al instante, pero los productos solo cambian cuando se cruza un umbral (28 °C, 20 °C, fila 5/6 o un cambio de franja horaria). Es intencional, para que el menú no parpadee con cada movimiento del slider.
7. Con **"Restablecer valores"** vuelves al estado inicial entre una demostración y otra.

> Si activas "Real (Tampico)" y la key de OpenWeatherMap aún no está activa, el panel avisa y sigue usando la temperatura simulada.

## Estructura y patrón

```
src/
  types/        Tipos (Product, DriveThruContext, ControlState…)   + index.ts
  hooks/        Toda la lógica (useDriveThru, useMenu, useWeather,
                useControlState, useClock)                          + index.ts
  components/   Solo reciben props, sin lógica de negocio           + index.ts
  lib/          Funciones puras y probadas (recommendation, format,
                controlState, weather, mapProduct)
  data/         Catálogo de respaldo
  styles/       Tokens y estilos (display, panel)
supabase/       schema.sql y seed.sql
```

`App.tsx` llama a `useDriveThru()` **una sola vez** y reparte el resultado por props a las dos rutas.

## Pruebas

```bash
npm run test:run   # una pasada
npm test           # modo watch
```

La lógica de recomendación (bandas de clima/fila/hora, fronteras 28/20 °C y 6/12/19 h, premium vs. aleatorio, catálogos pequeños o vacíos) está cubierta en `src/lib/recommendation.test.ts`.

## Scripts

`npm run dev` · `npm run build` · `npm run test:run` · `npm run lint`
