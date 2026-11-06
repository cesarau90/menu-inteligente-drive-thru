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

**Fotos de los productos.** Las 21 fotos viven en `public/products/<slug>.webp` (600×450, menos de 80 KB cada una) y la columna `image_url` apunta a ellas (por ejemplo `/products/frappe-caramelo.webp`). Si ya tenías el catálogo cargado en Supabase, corre [supabase/update-images.sql](supabase/update-images.sql) en el SQL Editor para asignarlas; si empiezas de cero, `seed.sql` ya las incluye. Del mismo modo, [supabase/update-categories.sql](supabase/update-categories.sql) mueve "Cold brew" y "Latte helado" de Café a Bebidas frías en un catálogo ya cargado. Si `image_url` está vacío o la foto falla al cargar, la tarjeta muestra un emoji sobre un bloque de color. Los créditos están en [Créditos de imágenes](#créditos-de-imágenes).

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

## Créditos de imágenes

Todas las fotos de productos provienen de [Pexels](https://www.pexels.com) y se usan bajo la [Licencia de Pexels](https://www.pexels.com/license/), que permite su uso gratuito, comercial y sin atribución obligatoria; se acreditan aquí como cortesía a sus autores. Se redimensionaron y recortaron a 600×450 px en formato WebP. Elegí fotos sin logos ni marcas visibles; la descripción de cada producto es mía, no el título original de la foto.

| Producto | Archivo | Autor | Foto original |
|---|---|---|---|
| Espresso | `espresso.webp` | [Cup of Couple](https://www.pexels.com/@cup-of-couple/) | [Ver foto](https://www.pexels.com/photo/close-up-shot-of-a-cup-of-coffee-7657863/) |
| Americano | `americano.webp` | [Emrah](https://www.pexels.com/@emrah-398670870/) | [Ver foto](https://www.pexels.com/photo/morning-sunlight-on-coffee-cup-on-wooden-table-38316318/) |
| Capuchino | `capuchino.webp` | [Pixabay](https://www.pexels.com/@pixabay/) | [Ver foto](https://www.pexels.com/photo/ceramic-cup-with-coffee-late-art-414605/) |
| Latte de vainilla | `latte.webp` | [Shameel mukkath](https://www.pexels.com/@shameel-mukkath-3421394/) | [Ver foto](https://www.pexels.com/photo/close-up-shot-of-a-glass-of-cappuccino-5112649/) |
| Moka caliente | `moka.webp` | [Angela Khebou](https://www.pexels.com/@angela-khebou-259135285/) | [Ver foto](https://www.pexels.com/photo/photo-of-a-chocolate-dessert-in-a-glass-15455285/) |
| Chocolate caliente | `chocolate.webp` | [Caleb Oquendo](https://www.pexels.com/@caleboquendo/) | [Ver foto](https://www.pexels.com/photo/red-mug-with-hot-cocoa-text-on-white-background-40254957/) |
| Té chai latte | `te-chai.webp` | [eat kubba](https://www.pexels.com/@eat-kubba-15863701/) | [Ver foto](https://www.pexels.com/photo/white-cup-with-brown-liquid-11833310/) |
| Cold brew | `cold-brew.webp` | [Esra Nur Kalay](https://www.pexels.com/@esranurkalay/) | [Ver foto](https://www.pexels.com/photo/clear-glass-pitcher-with-iced-coffee-13302014/) |
| Latte helado | `latte-helado.webp` | [mackling](https://www.pexels.com/@mackling-2161618291/) | [Ver foto](https://www.pexels.com/photo/minimalist-iced-coffee-on-white-background-38519285/) |
| Frappé de moka | `frappe-moka.webp` | [Luis Espinoza](https://www.pexels.com/@luis-espinoza-1873776/) | [Ver foto](https://www.pexels.com/photo/clear-glass-with-iced-mocha-11512983/) |
| Frappé de caramelo | `frappe-caramelo.webp` | [Jordan Benton](https://www.pexels.com/@bokehmo/) | [Ver foto](https://www.pexels.com/photo/coffee-with-cream-in-a-plastic-cup-15086185/) |
| Frappé de galleta | `frappe-oreo.webp` | [Farhad Ibrahimzade](https://www.pexels.com/@farhad/) | [Ver foto](https://www.pexels.com/photo/chocolate-frappuccino-with-oreo-toppings-8743859/) |
| Limonada mineral | `limonada.webp` | [çiğdem çelenk](https://www.pexels.com/@cigdem-celenk-689599686/) | [Ver foto](https://www.pexels.com/photo/glass-of-lemonade-18187120/) |
| Té helado de durazno | `te-helado.webp` | [Alina Vilchenko](https://www.pexels.com/@monstera/) | [Ver foto](https://www.pexels.com/photo/a-glass-of-water-with-ice-and-bits-of-mushroom-13383488/) |
| Croissant de mantequilla | `croissant.webp` | [James Collington](https://www.pexels.com/@james-collington-2147687246/) | [Ver foto](https://www.pexels.com/photo/close-up-of-freshly-baked-croissants-in-bakery-display-30403209/) |
| Sándwich de jamón y queso | `sandwich.webp` | [MikeGz](https://www.pexels.com/@mikegz-400576129/) | [Ver foto](https://www.pexels.com/photo/ham-and-cheese-toasts-15110224/) |
| Hotcakes con miel | `hotcakes.webp` | [yasemin](https://www.pexels.com/@yasemin-58133527/) | [Ver foto](https://www.pexels.com/photo/pancakes-served-with-maple-syrup-and-strawberries-21820995/) |
| Cheesecake de fresa | `cheesecake.webp` | [Helin Gezer](https://www.pexels.com/@helin-gezer-903013644/) | [Ver foto](https://www.pexels.com/photo/piece-of-cake-in-fruit-sauce-and-a-glass-of-infused-water-25810621/) |
| Brownie con nuez | `brownie.webp` | [Kaboompics (kaboompics.com)](https://www.pexels.com/@karola-g/) | [Ver foto](https://www.pexels.com/photo/piece-of-cake-5386673/) |
| Rol de canela | `rol-canela.webp` | [Bethany Hicks](https://www.pexels.com/@bethany-hicks-368308603/) | [Ver foto](https://www.pexels.com/photo/close-up-photo-of-cinnamon-rolls-with-cream-14576632/) |
| Galleta de avena | `galleta.webp` | [Angela Khebou](https://www.pexels.com/@angela-khebou-259135285/) | [Ver foto](https://www.pexels.com/photo/cookies-on-tray-13184916/) |
