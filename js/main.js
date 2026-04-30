/* Orquestador principal — single-chart explorer */

// ── Metadatos de cada hallazgo ────────────────────────────────────
const CHART_INFO = {
  mensual: {
    title:   "La pandemia de 2020 quiebra una tendencia estable",
    insight: "Entre 2015 y 2019 los siniestros mensuales se mantuvieron estables, en promedio entre 2.600 y 2.900 eventos por mes. En marzo de 2020, las medidas de confinamiento por COVID-19 provocaron una caída abrupta de aproximadamente el 60 % en abril de ese año. La recuperación fue parcial: hacia 2021 los volúmenes no lograron recuperar los niveles previos a la pandemia, lo que sugiere un cambio estructural en los patrones de movilidad urbana.",
    render:  drawMensual,
    useSvg:  true,
  },
  localidades: {
    title:   "Kennedy registra la mayor cantidad de siniestros entre localidades",
    insight: "Kennedy concentra el mayor número de siniestros del periodo con 23.661 eventos, un 13 % más que Engativá (20.928), la segunda localidad. Las tres localidades con mayor incidencia —Kennedy, Engativá y Usaquén— acumulan cerca del 32 % del total, lo que refleja la alta densidad vehicular sobre las vías arteriales del suroccidente y el norte de la ciudad.",
    render:  drawLocalidades,
    useSvg:  true,
  },
  gravedad: {
    title:   "6 de cada 10 siniestros son solo daños materiales",
    insight: "El 64,4 % de los casos son solo daños materiales: choques menores, abolladuras. El 34,0 % dejó heridos. El 1,6 % restante corresponde a siniestros con muertos: 3.239 casos en seis años. Es el número más pequeño del gráfico y también el más importante.",
    render:  drawGravedad,
    useSvg:  true,
  },
  heatmap: {
    title:   "El pico de siniestros es a las 14:00",
    insight: "El pico de siniestros se concentra entre las 14:00 y las 18:00 horas de lunes a viernes, coincidiendo con la hora de salida de oficinas y colegios. Contrario a la percepción común, los fines de semana no registran los mayores volúmenes: el domingo es el día más seguro de la semana. Se observa un pico secundario en la franja de 7:00 a 9:00 horas, correspondiente a la hora pico de la mañana.",
    render:  drawHeatmap,
    useSvg:  true,
  },
  mapa: {
    title:   "Concentración de siniestros por localidades",
    insight: "La concentración geográfica de siniestros sigue de forma clara la red de vías arteriales de Bogotá: la Autopista Norte, la Calle 80, la NQS y la Avenida Boyacá acumulan los mayores volúmenes. Las localidades periféricas como Sumapaz, La Candelaria y Santa Fe presentan los conteos más bajos, mientras que el corredor suroccidental —Kennedy, Engativá, Fontibón— mantiene la mayor densidad de eventos a lo largo de todo el periodo.",
    render:  drawMapa,
    useSvg:  false,
  },
};

// ── Render del gráfico activo ─────────────────────────────────────
function renderActiveChart() {
  const df   = aplicarFiltros();
  const info = CHART_INFO[STATE.activeChart];

  // Actualizar título e insight
  document.getElementById("stage-title").textContent   = info.title;
  document.getElementById("stage-insight").textContent = info.insight;

  const svgEl = document.getElementById("chart");
  const mapEl = document.getElementById("leaflet-map");
  const empEl = document.getElementById("empty-state");

  // Quitar todas las clases is-active
  [svgEl, mapEl, empEl].forEach(el => el.classList.remove("is-active"));

  if (df.length === 0) {
    // Estado vacío
    empEl.classList.add("is-active");
    refreshKPIs([]);
    return;
  }

  // Toggle SVG / Leaflet
  svgEl.style.display = info.useSvg ? "block" : "none";
  mapEl.style.display = info.useSvg ? "none"  : "block";

  // Renderizar con animación entrada
  requestAnimationFrame(() => {
    info.render(df);
    requestAnimationFrame(() => {
      (info.useSvg ? svgEl : mapEl).classList.add("is-active");
    });
  });

  refreshKPIs(df);
}

// ── KPIs ──────────────────────────────────────────────────────────
function refreshKPIs(df) {
  const set = (key, val) => {
    const el = document.querySelector(`[data-kpi="${key}"]`);
    if (el) el.textContent = val;
  };

  if (!df.length) {
    ["total","loc","clase","hora"].forEach(k => set(k, "—"));
    return;
  }

  const total = df.length;
  const loc   = dominantKey(df, d => d.localidad, v => v !== "SIN DATO") ?? "—";
  const clase = dominantKey(df, d => d.clase) ?? "—";
  const hora  = dominantKey(df, d => d.hora);
  const horaFmt = hora != null ? `${String(hora).padStart(2,"0")}:00` : "—";

  set("total", CFG.fmtInt(total));
  set("loc",   loc);
  set("clase", clase);
  set("hora",  horaFmt);
}

function dominantKey(arr, accessor, filter) {
  const rollup = d3.rollups(arr, v => v.length, accessor);
  const filtered = filter ? rollup.filter(([k]) => filter(k)) : rollup;
  return d3.greatest(filtered, ([, n]) => n)?.[0] ?? null;
}

// ── Tabs ──────────────────────────────────────────────────────────
function bindTabs() {
  document.querySelectorAll(".tab").forEach(tab => {
    tab.addEventListener("click", () => {
      document.querySelectorAll(".tab").forEach(t => {
        t.classList.remove("is-active");
        t.setAttribute("aria-selected", "false");
      });
      tab.classList.add("is-active");
      tab.setAttribute("aria-selected", "true");
      STATE.activeChart = tab.dataset.chart;
      renderActiveChart();
      writeURLState();
    });
  });
}

// ── Drawer de filtros ─────────────────────────────────────────────
function bindDrawer() {
  const drawer   = document.getElementById("drawer");
  const backdrop = document.getElementById("drawer-backdrop");
  const openBtn  = document.getElementById("open-filters");
  const closeBtn = document.getElementById("close-filters");

  function open() {
    drawer.classList.add("is-open");
    backdrop.classList.add("is-open");
    drawer.setAttribute("aria-hidden", "false");
    openBtn.setAttribute("aria-expanded", "true");
  }
  function close() {
    drawer.classList.remove("is-open");
    backdrop.classList.remove("is-open");
    drawer.setAttribute("aria-hidden", "true");
    openBtn.setAttribute("aria-expanded", "false");
    renderActiveChart();
    writeURLState();
  }

  openBtn.addEventListener("click", open);
  closeBtn.addEventListener("click", close);
  backdrop.addEventListener("click", close);
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && drawer.classList.contains("is-open")) close();
  });
}

// ── Construcción de checkboxes de filtros ─────────────────────────
function buildFilters() {
  const allRows = STATE.allRows;

  const uniq = accessor =>
    [...new Set(allRows.map(accessor))].sort((a, b) =>
      typeof a === "number" ? a - b : String(a).localeCompare(String(b), "es")
    );

  buildCheckboxes("filtro-anio",      uniq(d => d.anio),      STATE.filtros.anios,       false);
  buildCheckboxes("filtro-gravedad",  uniq(d => d.gravedad),  STATE.filtros.gravedades,  false);
  buildCheckboxes("filtro-clase",     uniq(d => d.clase),     STATE.filtros.clases,      false);
  buildCheckboxes("filtro-localidad", uniq(d => d.localidad), STATE.filtros.localidades, false);

  // Botón restablecer
  document.getElementById("btn-reset").addEventListener("click", resetFilters);
  document.getElementById("btn-reset-inline").addEventListener("click", resetFilters);
}

function buildCheckboxes(containerId, values, stateSet, triggerRender) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  values.forEach(v => {
    const label = document.createElement("label");
    label.className = "check-item";

    const cb = document.createElement("input");
    cb.type = "checkbox";
    cb.value = v;
    cb.checked = stateSet.has(v);

    cb.addEventListener("change", () => {
      cb.checked ? stateSet.add(v) : stateSet.delete(v);
      if (triggerRender) renderActiveChart();
    });

    label.appendChild(cb);
    const txt = document.createTextNode(` ${v}`);
    label.appendChild(txt);
    container.appendChild(label);
  });
}

function resetFilters() {
  const allRows = STATE.allRows;
  STATE.filtros.anios       = new Set(allRows.map(d => d.anio));
  STATE.filtros.gravedades  = new Set(allRows.map(d => d.gravedad));
  STATE.filtros.clases      = new Set(allRows.map(d => d.clase));
  STATE.filtros.localidades = new Set(allRows.map(d => d.localidad));

  // Re-marcar todos los checkboxes
  document.querySelectorAll(".check-item input[type='checkbox']").forEach(cb => {
    cb.checked = true;
  });

  renderActiveChart();
}

// ── Modo oscuro / claro ───────────────────────────────────────────
function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem("d3-theme", theme);

  const btn = document.getElementById("btn-theme");
  if (btn) btn.setAttribute("aria-label",
    theme === "dark" ? "Cambiar a modo claro" : "Cambiar a modo oscuro"
  );

  // Sincronizar CFG con los valores CSS actualizados
  const root = getComputedStyle(document.documentElement);
  const get  = v => root.getPropertyValue(v).trim();
  CFG.text    = get("--text")    || CFG.text;
  CFG.subtext = get("--subtext") || CFG.subtext;
  CFG.muted   = get("--muted")   || CFG.muted;
  CFG.grid    = get("--grid")    || CFG.grid;
  CFG.accent  = get("--accent")  || CFG.accent;

  // Rerenderizar el gráfico activo con nuevos colores
  if (STATE.allRows.length) renderActiveChart();
}

function bindThemeToggle() {
  const saved = localStorage.getItem("d3-theme");
  if (saved === "dark") applyTheme("dark");

  const btn = document.getElementById("btn-theme");
  if (!btn) return;
  btn.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
    applyTheme(next);
  });
}

// ── Resize responsivo (debounced) ─────────────────────────────────
let _resizeTimer = null;
function bindResize() {
  window.addEventListener("resize", () => {
    clearTimeout(_resizeTimer);
    _resizeTimer = setTimeout(() => {
      const info = CHART_INFO[STATE.activeChart];
      if (info.useSvg) renderActiveChart();
    }, 200);
  });
}

// ── Init ──────────────────────────────────────────────────────────
async function init() {
  try {
    await cargarDatos();
  } catch (err) {
    console.error("Error cargando datos:", err);
    document.querySelector(".loading-text").textContent = "Error al cargar datos";
    document.querySelector(".loading-sub").textContent  = "Revise la consola del navegador";
    return;
  }

  // Leer estado de la URL (sobreescribe STATE antes de construir UI)
  readURLState();

  // Ocultar overlay de carga
  const overlay = document.getElementById("loading-overlay");
  overlay.classList.add("is-hidden");
  setTimeout(() => overlay.remove(), 400);

  // Aplicar modo embed si ?compact=true
  applyEmbedMode();

  buildFilters();
  bindTabs();
  bindDrawer();
  bindResize();
  bindThemeToggle();

  // Sincronizar tab activo con el estado leído de la URL
  document.querySelectorAll(".tab").forEach(t => {
    const active = t.dataset.chart === STATE.activeChart;
    t.classList.toggle("is-active", active);
    t.setAttribute("aria-selected", active ? "true" : "false");
  });

  renderActiveChart();
}

init();
