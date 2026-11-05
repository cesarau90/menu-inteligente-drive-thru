# Menú Digital Drive-Thru

Pantalla de menú para el cliente que espera en la fila del drive-thru. Destaca 3–4 productos que **cambian solos** según el **clima**, la **fila** y la **hora**, y trae un **panel de control** para demostrarlo en vivo en clase.

**Stack:** React + TypeScript (Vite), Supabase (catálogo), OpenWeatherMap (clima de Tampico, MX), Vitest.

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

## Guion de demo para clase

1. Abre `/` en el monitor grande y `/panel` en otra pestaña (se sincronizan por `localStorage`).
2. En el panel, sube la temperatura a **33 °C** → la barra pasa a "Día caluroso → Bebidas frías".
3. Baja a **15 °C** → "Día fresco → Bebidas calientes".
4. Mueve la fila de **3 a 9 carros** → aparece "Fila larga: selección premium" y los más caros pasan primero.
5. Cambia la hora a **08:00** y luego a **15:00** → café/desayuno vs. frappés/postres.

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
