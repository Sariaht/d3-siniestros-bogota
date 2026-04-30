/* URL State — Permalink y Modo Embed
 *
 * Permalink: cada cambio de filtro/tab actualiza la query string.
 *   Ejemplo: ?chart=heatmap&anios=2019,2020&gravedad=CON+MUERTOS
 *
 * Embed mode: ?compact=true&chart=localidades renderiza solo el gráfico,
 *   sin header, KPIs, tabs ni footer — listo para <iframe>.
 */

// ── Leer estado desde la URL al cargar ───────────────────────────
function readURLState() {
  const p = new URLSearchParams(window.location.search);

  // Tab activo
  if (p.has("chart")) {
    const c = p.get("chart");
    if (["mensual","localidades","gravedad","heatmap","mapa","chord"].includes(c)) {
      STATE.activeChart = c;
    }
  }

  // Filtro por años
  if (p.has("anios")) {
    const años = p.get("anios").split(",").map(Number).filter(n => !isNaN(n));
    if (años.length) STATE.filtros.anios = new Set(años);
  }

  // Filtro por gravedad
  if (p.has("gravedad")) {
    const gravs = p.get("gravedad").split(",");
    if (gravs.length) STATE.filtros.gravedades = new Set(gravs);
  }

  // Filtro por clase
  if (p.has("clase")) {
    const clases = p.get("clase").split(",");
    if (clases.length) STATE.filtros.clases = new Set(clases);
  }
}

// ── Escribir estado actual en la URL (sin recargar la página) ────
let _urlWriteTimer = null;
function writeURLState() {
  clearTimeout(_urlWriteTimer);
  _urlWriteTimer = setTimeout(() => {
    const p = new URLSearchParams();

    p.set("chart", STATE.activeChart);

    // Solo serializar si no son todos los valores (evita URL largas innecesarias)
    const allAnios  = [...new Set(STATE.allRows.map(d => d.anio))];
    const allGravs  = [...new Set(STATE.allRows.map(d => d.gravedad))];
    const allClases = [...new Set(STATE.allRows.map(d => d.clase))];

    if (STATE.filtros.anios.size < allAnios.length) {
      p.set("anios", [...STATE.filtros.anios].sort().join(","));
    }
    if (STATE.filtros.gravedades.size < allGravs.length) {
      p.set("gravedad", [...STATE.filtros.gravedades].sort().join(","));
    }
    if (STATE.filtros.clases.size < allClases.length) {
      p.set("clase", [...STATE.filtros.clases].sort().join(","));
    }

    // Si compact está en la URL actual, lo conserva
    if (new URLSearchParams(window.location.search).has("compact")) {
      p.set("compact", "true");
    }

    const qs = p.toString();
    history.replaceState(null, "", qs ? "?" + qs : window.location.pathname);
  }, 200);
}

// ── Modo embed: ?compact=true ─────────────────────────────────────
// Oculta todo el chrome y renderiza solo el gráfico activo.
// Uso: <iframe src="index.html?compact=true&chart=gravedad"></iframe>
function applyEmbedMode() {
  const p = new URLSearchParams(window.location.search);
  if (!p.get("compact")) return;

  document.body.classList.add("compact");

  // Añade estilos de embed si aún no existen
  if (!document.getElementById("embed-styles")) {
    const style = document.createElement("style");
    style.id = "embed-styles";
    style.textContent = `
      body.compact .app-header,
      body.compact .kpis,
      body.compact .tabs,
      body.compact .app-footer,
      body.compact .narrative,
      body.compact #btn-theme { display: none !important; }

      body.compact .app { padding: 0.75rem; }
      body.compact .chart-stage {
        border: none;
        padding: 0.5rem 0;
        min-height: unset;
      }
      body.compact .stage-head { margin-bottom: 0.75rem; }
      body.compact .stage-body { height: 480px; }
    `;
    document.head.appendChild(style);
  }
}
