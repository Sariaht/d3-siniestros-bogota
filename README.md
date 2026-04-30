# Siniestros Viales en Bogotá D.C. — Visualización con D3.js

Aplicación web interactiva construida con **D3.js v7** y **Leaflet.js** que visualiza el histórico de siniestros viales de Bogotá D.C. entre enero de 2015 y septiembre de 2021. Carga y procesa 199.146 registros directamente en el navegador, sin backend ni servidor de aplicaciones.

> Proyecto 2 — Herramientas y Visualización de Datos  
> Maestría en Analítica de Datos — Universidad de los Andes

---

## Tabla de contenidos

1. [Demo en vivo](#demo-en-vivo)
2. [Capturas de pantalla](#capturas-de-pantalla)
3. [Dataset](#dataset)
4. [Hallazgos principales](#hallazgos-principales)
5. [Funcionalidades](#funcionalidades)
6. [Tecnologías](#tecnologías)
7. [Estructura del proyecto](#estructura-del-proyecto)
8. [Ejecución local](#ejecución-local)
9. [Despliegue en GitHub Pages](#despliegue-en-github-pages)
10. [Fragmentos de código clave](#fragmentos-de-código-clave)
11. [Fuente de datos](#fuente-de-datos)

---

## Demo en vivo

La aplicación está desplegada en GitHub Pages:

```
https://<usuario>.github.io/d3-siniestros-bogota/
```

> Reemplaza `<usuario>` con el nombre de tu cuenta de GitHub una vez realizado el despliegue.

### Modo embed (para iframes)

La aplicación soporta un modo compacto que oculta el chrome (header, KPIs, tabs, footer) para incrustarla en otras páginas:

```
https://<usuario>.github.io/d3-siniestros-bogota/?compact=true&chart=mapa
```

Parámetros disponibles:

| Parámetro  | Valores posibles                                      | Ejemplo                        |
|------------|-------------------------------------------------------|--------------------------------|
| `chart`    | `mensual`, `localidades`, `gravedad`, `heatmap`, `mapa` | `?chart=heatmap`               |
| `anios`    | Lista separada por comas                              | `?anios=2019,2020`             |
| `gravedad` | `CON+HERIDOS`, `CON+MUERTOS`, `SOLO+DANOS`, `SIN+DATO` | `?gravedad=CON+HERIDOS`        |
| `clase`    | `CHOQUE`, `ATROPELLO`, `VOLCAMIENTO`, etc.            | `?clase=CHOQUE,ATROPELLO`      |
| `compact`  | `true`                                                | `?compact=true`                |

---

## Capturas de pantalla

> Agrega tus capturas en la carpeta `/screenshots` y actualiza estas rutas.

| Tendencia temporal | Mapa coroplético |
|--------------------|-----------------|
| ![Tendencia](screenshots/mensual.png) | ![Mapa](screenshots/mapa.png) |

| Heatmap hora × día | Top localidades |
|---------------------|-----------------|
| ![Heatmap](screenshots/heatmap.png) | ![Localidades](screenshots/localidades.png) |

---

## Dataset

- **Fuente:** [Histórico Siniestros Bogotá D.C. — datos.gov.co](https://www.datos.gov.co/dataset/Historico-Siniestros-Bogot-D-C/3v2w-chcq/about_data)
- **Publicado por:** Secretaría Distrital de Movilidad de Bogotá
- **Archivo limpio:** `data/siniestros_bogota_limpio.csv`
- **Registros:** 199.146 filas
- **Período:** 2015-01-01 a 2021-09-10
- **Tamaño:** ~27 MB

### Esquema de columnas

| Columna            | Tipo      | Descripción                                              |
|--------------------|-----------|----------------------------------------------------------|
| `CODIGO_ACCIDENTE` | entero    | Identificador único del siniestro                        |
| `fecha`            | fecha     | `YYYY-MM-DD`                                             |
| `fecha_hora`       | datetime  | Fecha y hora exacta de ocurrencia                        |
| `anio`             | entero    | Año (2015–2021)                                          |
| `mes`              | entero    | Mes (1–12)                                               |
| `hora`             | entero    | Hora del día (0–23)                                      |
| `dia_semana`       | texto     | `Lunes`, `Martes`, …, `Domingo`                          |
| `gravedad`         | categórica | `SOLO DANOS`, `CON HERIDOS`, `CON MUERTOS`, `SIN DATO` |
| `clase_accidente`  | categórica | `CHOQUE`, `ATROPELLO`, `VOLCAMIENTO`, `CAIDA OCUPANTE`, `OTRO`, `AUTOLESION`, `INCENDIO` |
| `localidad`        | categórica | 20 localidades de Bogotá + `SIN DATO`                   |
| `latitud`          | float     | Coordenada WGS84                                         |
| `longitud`         | float     | Coordenada WGS84                                         |

### Archivos agregados pre-calculados

Para optimizar la carga inicial, el proyecto incluye CSVs agregados más livianos:

```
data/
├── siniestros_por_anio.csv
├── siniestros_por_mes.csv
├── siniestros_por_hora.csv
├── siniestros_por_dia_semana.csv
├── siniestros_por_gravedad.csv
├── siniestros_por_clase.csv
├── siniestros_por_localidad.csv
└── siniestros_localidad_gravedad.csv
```

---

## Hallazgos principales

Los cinco hallazgos que estructuran la narrativa visual de la aplicación:

| # | Hallazgo | Visualización |
|---|----------|---------------|
| 1 | **Kennedy lidera** con 23.661 siniestros — el 13 % más que Engativá | Barras horizontales |
| 2 | **El choque es dominante**: ~170.000 casos (~85 % del total) | Barras por clase |
| 3 | **64,4 % son solo daños** materiales; apenas el 1,6 % dejó muertos | Donut de gravedad |
| 4 | **Pico a las 14:00 h** de lunes a viernes, no en el fin de semana | Heatmap hora × día |
| 5 | **Caída por COVID-19** en abril 2020: reducción de ~60 % en siniestros | Línea temporal |

---

## Funcionalidades

### Visualizaciones (5 gráficos)

| Tab | Tipo | Librería | Descripción |
|-----|------|----------|-------------|
| Tendencia temporal | Línea con anotaciones | D3.js | Evolución mensual 2015–2021, franja 2020 sombreada |
| Localidades | Barras horizontales | D3.js | Top-10 localidades con animación stagger |
| Gravedad | Donut interactivo | D3.js | Composición por nivel de gravedad |
| Heatmap hora-día | Heatmap 7 × 24 | D3.js | Intensidad por hora y día de la semana |
| Mapa | Coroplético | Leaflet.js | 20 localidades coloreadas por volumen |

### Funcionalidades exclusivas de D3.js

- **Permalink con estado en URL** — cada cambio de filtro o tab actualiza la query string sin recargar la página:
  ```
  ?chart=heatmap&anios=2019,2020&gravedad=CON+HERIDOS
  ```
- **Modo embed** — `?compact=true` oculta todo el chrome para uso en `<iframe>`.
- **Animación stagger** en barras: cada barra entra 55 ms después de la anterior.
- **Modo oscuro / claro** — toggle en el header; persiste en `localStorage`; sincroniza la paleta D3 con las CSS variables.
- **Filtros dinámicos** — panel drawer con checkboxes de año, gravedad, clase y localidad; afectan todos los gráficos en tiempo real.

---

## Tecnologías

| Tecnología | Versión | Uso |
|------------|---------|-----|
| [D3.js](https://d3js.org/) | v7 (CDN) | Todos los gráficos SVG |
| [Leaflet.js](https://leafletjs.com/) | 1.9.4 (CDN) | Mapa coroplético |
| [Geist / Geist Mono](https://vercel.com/font) | Google Fonts | Tipografía |
| HTML5 / CSS3 / JavaScript | ES2020 | Sin framework, sin bundler |
| CartoDB Basemaps | — | Tiles del mapa base |

> La aplicación es **100 % estática**: no requiere Node.js, Python ni ningún servidor de aplicaciones para ejecutarse en producción. Solo necesita que los archivos se sirvan por HTTP.

---

## Estructura del proyecto

```
d3-siniestros-bogota/
│
├── index.html                  # Documento principal (única página)
│
├── css/
│   └── styles.css              # Sistema de diseño completo (variables, dark mode, layout)
│
├── js/
│   ├── config.js               # Paleta CFG, helpers tooltip, escala secuencial
│   ├── data.js                 # STATE global, carga CSV + GeoJSON, filtros
│   ├── main.js                 # Orquestador: CHART_INFO, tabs, drawer, KPIs, init()
│   ├── url-state.js            # Permalink (readURLState / writeURLState) y modo embed
│   ├── chart-mensual.js        # Gráfico 1 — Línea temporal mensual
│   ├── chart-localidades.js    # Gráfico 2 — Barras horizontales Top-10
│   ├── chart-gravedad.js       # Gráfico 3 — Donut de gravedad
│   ├── chart-heatmap.js        # Gráfico 4 — Heatmap hora × día
│   └── chart-mapa.js           # Gráfico 5 — Mapa coroplético Leaflet
│
└── data/
    ├── siniestros_bogota_limpio.csv       # Dataset completo (199.146 filas, ~27 MB)
    ├── localidades_bogota.geojson         # GeoJSON formato ESRI de las 20 localidades
    ├── siniestros_por_anio.csv
    ├── siniestros_por_mes.csv
    ├── siniestros_por_hora.csv
    ├── siniestros_por_dia_semana.csv
    ├── siniestros_por_gravedad.csv
    ├── siniestros_por_clase.csv
    ├── siniestros_por_localidad.csv
    └── siniestros_localidad_gravedad.csv
```

---

## Ejecución local

La aplicación es un sitio estático. No requiere instalación de dependencias. Solo necesita un servidor HTTP local (los navegadores bloquean `fetch()` sobre `file://`).

### Opción 1 — Python (recomendado, sin instalar nada adicional)

```bash
# Python 3
cd d3-siniestros-bogota
python -m http.server 8000
```

Luego abre: [http://localhost:8000](http://localhost:8000)

### Opción 2 — Node.js con `serve`

```bash
# Instalar serve una sola vez
npm install -g serve

# Ejecutar en la carpeta del proyecto
cd d3-siniestros-bogota
serve .
```

### Opción 3 — Extensión Live Server (VS Code)

1. Instala la extensión **Live Server** de Ritwick Dey en VS Code.
2. Abre la carpeta `d3-siniestros-bogota` en VS Code.
3. Haz clic derecho sobre `index.html` → **Open with Live Server**.

> El servidor se inicia en `http://127.0.0.1:5500` por defecto.

---

## Despliegue en GitHub Pages

GitHub Pages sirve archivos estáticos directamente desde un repositorio público. No requiere configuración adicional.

### Paso 1 — Crear el repositorio en GitHub

```bash
# Inicializar git en la carpeta del proyecto (si no existe aún)
git init
git add .
git commit -m "Initial commit: D3.js siniestros viales Bogotá"
```

### Paso 2 — Publicar en GitHub

```bash
# Conectar con el repositorio remoto (reemplaza <usuario> y <repo>)
git remote add origin https://github.com/<usuario>/d3-siniestros-bogota.git
git branch -M main
git push -u origin main
```

### Paso 3 — Activar GitHub Pages

1. En GitHub, ve a tu repositorio → **Settings** → **Pages**.
2. En **Source**, selecciona **Deploy from a branch**.
3. Elige la rama **`main`** y la carpeta **`/ (root)`**.
4. Haz clic en **Save**.

Tras 1–2 minutos, la aplicación estará disponible en:

```
https://<usuario>.github.io/d3-siniestros-bogota/
```

### Consideraciones sobre el tamaño del dataset

El archivo `siniestros_bogota_limpio.csv` pesa ~27 MB. GitHub tiene un límite de 100 MB por archivo, por lo que se puede subir directamente. Sin embargo, para repositorios públicos con archivos grandes se recomienda usar **Git LFS**:

```bash
# Instalar Git LFS (una sola vez)
git lfs install

# Rastrear archivos CSV grandes
git lfs track "data/*.csv"
git add .gitattributes
git commit -m "Track large CSV files with Git LFS"
```

### Alternativas de despliegue

| Plataforma | Pasos | URL resultante |
|------------|-------|----------------|
| **GitHub Pages** | Settings → Pages → branch main | `https://<usuario>.github.io/<repo>/` |
| **Vercel** | Conectar repo GitHub, framework: Other | `https://<repo>.vercel.app` |
| **Netlify** | Drag & drop de la carpeta en netlify.com/drop | `https://<id>.netlify.app` |

---

## Fragmentos de código clave

### Carga eficiente del CSV de 27 MB

El CSV se carga completo en el cliente, pero solo se parsean 7 de las 14 columnas originales, reduciendo el uso de memoria:

```javascript
// js/data.js
const rows = await d3.csv("data/siniestros_bogota_limpio.csv", d => ({
  anio:      +d.anio,
  mes:       +d.mes,
  hora:      +d.hora,
  diaSemana: d.dia_semana,
  gravedad:  d.gravedad,
  clase:     d.clase_accidente,
  localidad: d.localidad,
}));
```

### Conversión ESRI JSON → GeoJSON estándar

El GeoJSON de los datos abiertos de Bogotá viene en formato ESRI (no estándar). Se convierte en el cliente:

```javascript
// js/data.js
function esriToGeoJSON(esri) {
  return {
    type: "FeatureCollection",
    features: esri.features.map(f => ({
      type: "Feature",
      properties: f.attributes,
      geometry: { type: "Polygon", coordinates: f.geometry.rings },
    })),
  };
}
```

### Normalización de nombres de localidades

El CSV usa `ANTONIO NARINO` (sin tilde) mientras el GeoJSON usa `ANTONIO NARIÑO`. Se normalizan ambos antes de cruzarlos:

```javascript
// js/data.js
function normalizarLoc(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")  // elimina marcas diacríticas
    .toUpperCase()
    .trim();
}
```

### Tooltip con `position: fixed` (coordenadas de viewport)

El tooltip usa `position: fixed`, por lo que requiere `clientX/Y` (no `pageX/Y`):

```javascript
// js/config.js
function _moveTip(event) {
  const h     = _tipEl.offsetHeight || 50;
  const w     = _tipEl.offsetWidth  || 180;
  const viewW = document.documentElement.clientWidth;

  let x = event.clientX + 14;
  let y = event.clientY - h - 12;   // aparece encima del cursor

  if (x + w > viewW - 10) x = event.clientX - w - 14; // voltear a la izquierda
  if (y < 4)               y = event.clientY + 16;     // voltear hacia abajo

  _tipEl.style.left = x + "px";
  _tipEl.style.top  = y + "px";
}
```

### Animación stagger en barras de localidades

Cada barra entra con un retraso de 55 ms respecto a la anterior, creando un efecto de cascada:

```javascript
// js/chart-localidades.js
svg.append("g")
  .selectAll("rect")
  .data(agg)
  .join("rect")
    .attr("x", M.l)
    .attr("width", 0)               // empieza en 0
    .transition()
      .duration(500)
      .delay((d, i) => i * 55)      // stagger de 55 ms por barra
      .ease(d3.easeCubicOut)
      .attr("width", ([, n]) => x(n) - M.l);
```

### Permalink con estado en la URL

Cada cambio de filtro o tab actualiza la query string sin recargar la página:

```javascript
// js/url-state.js
let _urlWriteTimer = null;
function writeURLState() {
  clearTimeout(_urlWriteTimer);
  _urlWriteTimer = setTimeout(() => {
    const p = new URLSearchParams();
    p.set("chart", STATE.activeChart);

    const allAnios = [...new Set(STATE.allRows.map(d => d.anio))];
    if (STATE.filtros.anios.size < allAnios.length) {
      p.set("anios", [...STATE.filtros.anios].sort().join(","));
    }
    // ...
    history.replaceState(null, "", "?" + p.toString());
  }, 200);
}
```

### Modo oscuro: sincronización de colores entre CSS y D3

Al cambiar el tema, los colores D3 se sincronizan con las CSS variables actualizadas:

```javascript
// js/main.js
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("d3-theme", theme);

  const root = getComputedStyle(document.documentElement);
  const get  = v => root.getPropertyValue(v).trim();

  // Actualizar el objeto CFG que usan todas las funciones D3
  CFG.text    = get("--text");
  CFG.subtext = get("--subtext");
  CFG.muted   = get("--muted");
  CFG.grid    = get("--grid");

  renderActiveChart(); // rerenderizar con nuevos colores
}
```

### Variables CSS del sistema de diseño

```css
/* css/styles.css */
:root {
  --font-sans: 'Geist', system-ui, sans-serif;
  --font-mono: 'Geist Mono', 'JetBrains Mono', monospace;

  --accent:    #0EA5E9;   /* Electric Blue — único color acento */
  --text:      #0F172A;   /* Off-black (nunca negro puro) */
  --subtext:   #475569;
  --muted:     #94A3B8;
  --grid:      #E2E8F0;
  --bg:        #FFFFFF;
}

/* Modo oscuro — se activa con html[data-theme="dark"] */
html[data-theme="dark"] {
  --text:    #F1F5F9;
  --subtext: #94A3B8;
  --muted:   #64748B;
  --grid:    #1E293B;
  --bg:      #0F172A;
}
```

---

## Fuente de datos

| Campo | Detalle |
|-------|---------|
| **Nombre** | Histórico de Siniestros Viales Bogotá D.C. |
| **Publicador** | Secretaría Distrital de Movilidad — Alcaldía Mayor de Bogotá |
| **URL** | https://www.datos.gov.co/dataset/Historico-Siniestros-Bogot-D-C/3v2w-chcq/about_data |
| **Licencia** | Datos abiertos del Estado colombiano |
| **Período** | enero 2015 – septiembre 2021 |
| **Última actualización del dataset** | septiembre 2021 |

> Los datos fueron procesados y limpiados con Python (`scripts/prepare_data.py`) antes de ser incorporados a la aplicación. El archivo limpio resultante es `data/siniestros_bogota_limpio.csv`.
