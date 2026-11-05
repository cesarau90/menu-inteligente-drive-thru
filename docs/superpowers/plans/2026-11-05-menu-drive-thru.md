# Menú Digital Drive-Thru Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menú digital de drive-thru que destaca 3–4 productos según clima, fila y hora, con un panel de control para demostrarlo en vivo.

**Architecture:** React + TS (Vite). Toda la lógica de recomendación vive en funciones puras (`src/lib/recommendation.ts`, probadas con Vitest vía TDD). Los hooks envuelven I/O (Supabase, OpenWeatherMap, reloj, estado compartido) y un hook orquestador `useDriveThru` es llamado una sola vez en `App.tsx`; los componentes solo reciben props. El estado del panel se persiste en `localStorage` y se sincroniza entre pestañas (evento `storage`) para que el panel (ruta `/panel`) controle la pantalla (ruta `/`) abierta en otra pestaña.

**Tech Stack:** Vite, React 18+, TypeScript, react-router-dom, @supabase/supabase-js, Vitest, CSS plano con variables (sin Tailwind).

**Spec:** Mensaje del usuario del 2026-11-05 (no hay documento de diseño separado; el usuario omitió el brainstorming).

## Global Constraints

- Patrón obligatorio: hooks con toda la lógica; componentes solo reciben props; `App.tsx` llama al hook orquestador **una sola vez**; carpetas `src/types`, `src/hooks`, `src/components` cada una con barrel `index.ts`.
- Temp > 28 °C → bebidas frías; < 20 °C → calientes; 20–28 inclusive → mixto.
- Fila > 5 → prioriza premium/más caros; fila ≤ 5 → aleatorio dentro de la categoría del clima.
- Hora: mañana 6–12 → café y desayuno; tarde 12–19 → frappés y postres; noche (resto) → mixto.
- Pantalla: indicador de contexto arriba (temperatura, # carros, hora, modo activo p. ej. "☀️ Día caluroso → Bebidas frías"), 3–4 destacados al centro (imagen, nombre, precio) con transición al cambiar contexto, resto del menú abajo.
- Panel en otra ruta: slider fila 0–15, toggle clima real/simulado, input temperatura manual, selector de hora.
- Clima: OpenWeatherMap, Tampico MX (lat 22.2331, lon -97.8611, `units=metric`); sin API key → modo simulado.
- Supabase para el catálogo; seed ≈20 productos genéricos de cafetería. Sin credenciales/error → catálogo local de respaldo (el proyecto corre con `npm run dev` sin configuración).
- Legible a distancia: texto grande, contraste alto (WCAG AA mínimo, objetivo AAA en texto principal).
- Entregables: `npm run dev` funcionando, `supabase/schema.sql` + `supabase/seed.sql`, tests Vitest de la lógica, README en español.
- Skills por usar (en orden): TDD (Task 2), frontend-design + diseno-distintivo (antes de Task 6), design-critique y accessibility-review (Task 8), systematic-debugging si algo falla, verification-before-completion (Task 9).

## Review Focus

- Catálogo con menos de 4 productos aptos (o vacío) → devuelve los que haya, sin duplicados ni crash.
- Fronteras exactas: 28 °C y 20 °C → mixto; horas 6, 12, 19 y 0–5 asignadas a la franja correcta; fila 5 → aleatorio, fila 6 → premium.
- Los destacados no se re-barajan en cada render ni por el tick del reloj: solo cuando cambia la banda (clima|fila|franja).
- Supabase sin variables, tabla vacía o error de red → catálogo de respaldo, sin pantalla en blanco.
- OpenWeatherMap con 401/red caída/sin key → cae a temperatura simulada y lo indica, sin romper.
- `localStorage` con JSON corrupto o valores fuera de rango (fila 99, hora 30) → se normalizan a valores válidos.
- Imagen que no carga → tarjeta con respaldo visual, no ícono roto.

---

### Task 1: Scaffold del proyecto

**Files:**
- Create: proyecto Vite en la raíz (`package.json`, `vite.config.ts`, `tsconfig*.json`, `index.html`, `src/main.tsx`), `.env.example`, `src/{types,hooks,components,lib,data}/`
- Modify: `vite.config.ts` (config de Vitest, `environment: 'node'`), `package.json` (scripts `test`, `test:run`)

**Interfaces:**
- Produces: `npm run dev`, `npm run build`, `npm run test:run` operativos; `.env.example` con `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_OPENWEATHER_API_KEY`.

- [ ] **Step 1:** Scaffold con `npm create vite@latest . -- --template react-ts` (directorio no vacío por `docs/`: aceptar continuar). Instalar `react-router-dom @supabase/supabase-js` y dev `vitest`.
- [ ] **Step 2:** Añadir bloque `test` a la config de Vite y scripts `"test": "vitest"`, `"test:run": "vitest run"`.
- [ ] **Step 3:** Crear `.env.example` y carpetas vacías con sus `index.ts` barrel (`types`, `hooks`, `components`).
- [ ] **Step 4:** Run `npm run build` → Expected: build exitoso. Run `npm run test:run` → Expected: "No test files found" (aceptable en este punto).

### Task 2: Tipos y lógica de recomendación (TDD)

**Files:**
- Create: `src/types/product.ts`, `src/types/context.ts`, `src/types/index.ts`, `src/lib/recommendation.ts`, `src/lib/recommendation.test.ts`

**Interfaces:**
- Produces (`src/types`):
  - `type Category = 'bebida_fria' | 'bebida_caliente' | 'cafe' | 'frappe' | 'desayuno' | 'postre' | 'snack'`
  - `interface Product { id: string; name: string; price: number; imageUrl: string | null; category: Category; temperature: 'fria' | 'caliente' | null; tags: string[]; emoji: string }`
  - `type WeatherBand = 'calor' | 'frio' | 'templado'`; `type DayPart = 'manana' | 'tarde' | 'noche'`; `type QueueBand = 'corta' | 'larga'`
  - `interface DriveThruContext { temperature: number; queue: number; hour: number }`
- Produces (`src/lib/recommendation.ts`):
  - `getWeatherBand(temp: number): WeatherBand` (>28 calor, <20 frio, resto templado)
  - `getDayPart(hour: number): DayPart` (6 ≤ h < 12 manana; 12 ≤ h < 19 tarde; resto noche)
  - `getQueueBand(queue: number): QueueBand` (>5 larga)
  - `getContextKey(ctx: DriveThruContext): string` → `` `${weatherBand}|${queueBand}|${dayPart}` ``
  - `describeMode(ctx: DriveThruContext): { emoji: string; label: string }` (p. ej. `{ emoji: '☀️', label: 'Día caluroso → Bebidas frías' }`; incluir franja y fila larga en el label cuando aplique)
  - `recommend(products: Product[], ctx: DriveThruContext, rng?: () => number, count?: number): Product[]` — `count` por defecto 4. Algoritmo: pool = productos con `temperature` acorde a la banda (templado = todos); los que coinciden con la franja (mañana: tags `cafe`/`desayuno`; tarde: `frappe`/`postre`; noche: ninguno) van primero; si la fila es larga ordena cada grupo por precio descendente, si no baraja cada grupo con `rng` (Fisher–Yates, `rng` por defecto `Math.random`); completa con el resto del pool hasta `count`; sin duplicados.

- [ ] **Step 1: Write the failing tests** en `recommendation.test.ts` (describe por función), con estos casos exactos:
  - `getWeatherBand`: `28→templado`, `28.1→calor`, `20→templado`, `19.9→frio`
  - `getDayPart`: `5→noche`, `6→manana`, `11→manana`, `12→tarde`, `18→tarde`, `19→noche`, `0→noche`, `23→noche`
  - `getQueueBand`: `5→corta`, `6→larga`, `0→corta`, `15→larga`
  - `getContextKey` iguala para `temp 30/fila 2/hora 13` y `temp 35/fila 0/hora 15`; difiere si cambia la fila de 5 a 6
  - `recommend` con catálogo fixture de 12 productos (fríos, calientes, premium variados): calor → todos `temperature==='fria'`; frío → todos `'caliente'`; fila 8 + calor → precios en orden descendente dentro de cada grupo y el primero es el más caro de su grupo; fila 2 con `rng` determinista (`() => 0`) devuelve resultado estable y distinto de `rng` `() => 0.99`; mañana + templado antepone productos con tag `cafe`/`desayuno`; catálogo con 2 aptos → devuelve 2; catálogo vacío → `[]`; nunca ids repetidos
  - `describeMode`: calor → label contiene "Bebidas frías"; frío → "Bebidas calientes"; templado → "Mixto"
- [ ] **Step 2:** Run `npx vitest run src/lib` → Expected: FAIL (módulo no existe).
- [ ] **Step 3:** Implementar los tipos y `recommendation.ts` según la sección Interfaces.
- [ ] **Step 4:** Run `npx vitest run src/lib` → Expected: todos PASS.

### Task 3: Catálogo (Supabase + respaldo + SQL) y `useMenu`

**Files:**
- Create: `supabase/schema.sql`, `supabase/seed.sql`, `src/data/fallbackProducts.ts`, `src/lib/supabaseClient.ts`, `src/lib/mapProduct.ts`, `src/lib/mapProduct.test.ts`, `src/hooks/useMenu.ts`

**Interfaces:**
- Consumes: `Product`, `Category` de `src/types`.
- Produces:
  - `mapProduct(row: Record<string, unknown>): Product | null` — traduce fila SQL (`image_url`→`imageUrl`, `price` numérico o string → number) y devuelve `null` si faltan `id/name/price/category`.
  - `FALLBACK_PRODUCTS: Product[]` (los mismos ~20 del seed).
  - `useMenu(): { products: Product[]; source: 'supabase' | 'fallback'; loading: boolean }`.
- SQL: tabla `products(id uuid pk default gen_random_uuid(), name text, price numeric(8,2), image_url text, category text check(...), temperature text check in ('fria','caliente') null, tags text[] default '{}', emoji text, available boolean default true)`; RLS activado con policy `select` pública para `anon` solo de `available = true`. Seed ≈20 productos: cafés (espresso, americano, capuchino, latte, moka caliente; cold brew y latte helado), tés/chocolate, frappés (moka, caramelo, oreo), limonada/té helado, desayunos (croissant, sándwich, hotcakes), postres (cheesecake, brownie, rol de canela), snack (galleta); precios 25–120 MXN con varios premium (>85).

- [ ] **Step 1: Write the failing test** `mapProduct.test.ts`: fila válida con `price: "45.50"` → `price === 45.5`, `imageUrl` mapeado; fila sin `name` → `null`; `temperature: null` → `null` en el producto; `tags: null` → `[]`.
- [ ] **Step 2:** Run `npx vitest run src/lib/mapProduct` → Expected: FAIL.
- [ ] **Step 3:** Implementar `mapProduct`; crear `supabaseClient.ts` (exporta `supabase | null` según existan las variables `VITE_*`), `fallbackProducts.ts`, ambos `.sql`.
- [ ] **Step 4:** Implementar `useMenu`: arranca con respaldo, intenta Supabase si hay cliente, filtra filas con `mapProduct`, y si hay error o 0 filas válidas conserva el respaldo (`source: 'fallback'`).
- [ ] **Step 5:** Run `npx vitest run` → Expected: PASS. Exportar el hook en `src/hooks/index.ts`.

### Task 4: Clima — `useWeather`

**Files:**
- Create: `src/lib/weather.ts`, `src/lib/weather.test.ts`, `src/hooks/useWeather.ts`

**Interfaces:**
- Produces:
  - `buildWeatherUrl(apiKey: string): string` → `https://api.openweathermap.org/data/2.5/weather?lat=22.2331&lon=-97.8611&units=metric&appid=<key>`
  - `parseWeatherResponse(json: unknown): number | null` (devuelve `main.temp` si es número finito, si no `null`)
  - `useWeather(enabled: boolean): { realTemp: number | null; status: 'idle' | 'loading' | 'ok' | 'error' | 'no-key' }` — sin `VITE_OPENWEATHER_API_KEY` → `'no-key'`; refresca cada 10 min; cancela en unmount.

- [ ] **Step 1: Write the failing test:** `buildWeatherUrl('abc')` contiene `lat=22.2331`, `lon=-97.8611`, `units=metric`, `appid=abc`; `parseWeatherResponse({main:{temp:31.2}})→31.2`; `{}`, `null`, `{main:{temp:'x'}}` → `null`.
- [ ] **Step 2:** Run `npx vitest run src/lib/weather` → Expected: FAIL.
- [ ] **Step 3:** Implementar `weather.ts` y el hook (fetch con `AbortController`).
- [ ] **Step 4:** Run `npx vitest run` → Expected: PASS.

### Task 5: Estado compartido, reloj y `useDriveThru`

**Files:**
- Create: `src/lib/controlState.ts`, `src/lib/controlState.test.ts`, `src/hooks/useControlState.ts`, `src/hooks/useClock.ts`, `src/hooks/useDriveThru.ts`
- Modify: `src/types/context.ts` (añadir `ControlState`), `src/hooks/index.ts`

**Interfaces:**
- Produces:
  - `interface ControlState { queue: number; weatherMode: 'real' | 'simulated'; manualTemp: number; hourMode: 'real' | 'manual'; manualHour: number }`; `DEFAULT_CONTROL_STATE = { queue: 3, weatherMode: 'simulated', manualTemp: 30, hourMode: 'real', manualHour: 9 }`
  - `parseControlState(raw: string | null): ControlState` — JSON inválido/null → default; clamp `queue` 0–15 (entero), `manualTemp` −10–50, `manualHour` 0–23 (entero); campos enum inválidos → default.
  - `useControlState(): { state: ControlState; update: (patch: Partial<ControlState>) => void; reset: () => void }` — clave `localStorage` `drivethru-control`; escucha el evento `storage`.
  - `useClock(): Date` (tick cada 30 s).
  - `useDriveThru()` retorna `{ context: DriveThruContext; contextKey: string; mode: { emoji: string; label: string }; featured: Product[]; menu: Product[]; control: ControlState; update; reset; weatherStatus; menuSource; now: Date }`. `featured` se recalcula con `useMemo` dependiente solo de `contextKey` y `products` (no del reloj). `menu` = todos los productos no destacados. Temperatura efectiva: `real` y `realTemp != null` → `realTemp`; si no → `manualTemp`.

- [ ] **Step 1: Write the failing test** `controlState.test.ts`: `null`→default; `'{bad'`→default; `{"queue":99}`→queue 15; `{"queue":-4}`→0; `{"manualHour":30}`→23; `{"weatherMode":"x"}`→`'simulated'`; objeto válido completo sin cambios.
- [ ] **Step 2:** Run `npx vitest run src/lib/controlState` → Expected: FAIL.
- [ ] **Step 3:** Implementar `controlState.ts` y los tres hooks.
- [ ] **Step 4:** Run `npx vitest run` → Expected: PASS; `npx tsc -b` sin errores.

### Task 6: UI de la pantalla (cliente)

> Antes de escribir cualquier componente: invocar **frontend-design** y **anthropic-skills:diseno-distintivo** (y, si aporta, **design-taste-frontend**/**impeccable**); fijar dirección visual (paleta, tipografía, composición) y tokens CSS en `src/styles/tokens.css`. Prohibida la estética genérica de IA.

**Files:**
- Create: `src/components/{ContextBar,FeaturedGrid,ProductCard,MenuList,DisplayScreen}.tsx`, `src/components/index.ts`, `src/styles/{tokens,display}.css`
- Modify: `src/main.tsx` (importar estilos)

**Interfaces:**
- Consumes: retorno de `useDriveThru`.
- Produces (todas con solo props): `ContextBar({ temperature, queue, now, mode, weatherSource }: …)`; `ProductCard({ product, rank, premiumBadge }: …)` con respaldo visual (emoji sobre bloque de color) si `imageUrl` es null o dispara `onError`; `FeaturedGrid({ products, contextKey })` — la `key` por `contextKey` dispara la animación de entrada/transición; respeta `prefers-reduced-motion`; `MenuList({ products })` agrupado por categoría; `DisplayScreen(props)` compone los tres.

- [ ] **Step 1:** Fijar dirección visual y tokens (invocando las skills indicadas arriba).
- [ ] **Step 2:** Implementar los componentes como funciones puras de props, sin hooks de datos. Tamaño de texto mínimo ≈ 28px en cuerpo, nombres/precios destacados ≥ 48px, layout 16:9 de pantalla completa sin scroll en la zona de destacados.
- [ ] **Step 3:** Run `npx tsc -b` → Expected: sin errores.

### Task 7: Panel de control y rutas

**Files:**
- Create: `src/components/{ControlPanel,QueueSlider,TempControl,HourSelect,WeatherToggle}.tsx`, `src/styles/panel.css`
- Modify: `src/App.tsx`, `src/components/index.ts`

**Interfaces:**
- Consumes: `ControlState`, `update`, `reset`, `weatherStatus`.
- Produces: `ControlPanel({ control, update, reset, weatherStatus, mode, featured }: …)` (props-only); subcomponentes controlados. `App.tsx`: `const app = useDriveThru()` **una sola vez**; `BrowserRouter` con `/` → `DisplayScreen` y `/panel` → `ControlPanel`, pasando props. El input de temperatura se deshabilita en modo `real` con key válida; si `weatherStatus` es `no-key`/`error`, mostrar aviso "usando temperatura simulada" y bloquear el toggle en `real`. El selector de hora ofrece "Hora real" + 0–23. El panel muestra vista previa de los destacados actuales.

- [ ] **Step 1:** Implementar subcomponentes y `ControlPanel` (inputs accesibles con `<label>`, controles grandes para proyector).
- [ ] **Step 2:** Implementar `App.tsx` con rutas.
- [ ] **Step 3:** Run `npx tsc -b && npm run build` → Expected: éxito.
- [ ] **Step 4:** Verificar en navegador (Playwright o `npm run dev`): en `/panel` mover fila de 3 a 9 y cambiar temperatura 35→15; en `/` los destacados cambian (calor/frío, premium) y se ve la transición. Si algo falla: **superpowers:systematic-debugging**.

### Task 8: Crítica de diseño y accesibilidad

**Files:**
- Modify: `src/styles/*.css`, componentes según hallazgos

- [ ] **Step 1:** Invocar **design:design-critique** sobre capturas de `/` (calor+fila larga, frío+fila corta, noche) y `/panel`; corregir lo que salga.
- [ ] **Step 2:** Invocar **design:accessibility-review**: contraste (AA mínimo; texto principal ≥ 7:1 si es viable), tamaños de lectura a distancia, foco visible en el panel, `aria-live="polite"` en el modo activo, `prefers-reduced-motion`.
- [ ] **Step 3:** Aplicar correcciones; run `npm run build` → Expected: éxito.

### Task 9: README y verificación final

**Files:**
- Create: `README.md` (español)

- [ ] **Step 1:** README: qué es, requisitos, `npm install`, variables `.env`, ejecución de `supabase/schema.sql` y `seed.sql` en el SQL Editor, rutas `/` y `/panel`, reglas de recomendación, guion de demo para clase (3–4 pasos), `npm run test:run`, estructura de carpetas y patrón de hooks.
- [ ] **Step 2:** Invocar **superpowers:verification-before-completion**: ejecutar `npm run test:run`, `npx tsc -b`, `npm run build`, y comprobar `npm run dev` levantando; mostrar la salida real.
- [ ] **Step 3:** Reportar al usuario resultados, qué quedó sin verificar (p. ej. Supabase/OpenWeatherMap reales sin credenciales) y suposiciones tomadas.
