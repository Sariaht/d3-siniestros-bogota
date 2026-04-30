/* Paleta, formatos y helpers globales */

const CFG = {
  // ── Colores ───────────────────────────────────────────────────
  accent:    "#0EA5E9",
  accentDeep:"#0369A1",
  text:      "#0F172A",
  subtext:   "#475569",
  muted:     "#94A3B8",
  grid:      "#E2E8F0",

  // Gravedad (semántica, fija)
  gravedad: {
    "SOLO DANOS":  "#4C78A8",
    "CON HERIDOS": "#F58518",
    "CON MUERTOS": "#C9332B",
    "SIN DATO":    "#94A3B8"
  },

  // Cualitativa base (7 colores, accesible)
  cualitativa: ["#4C78A8","#F58518","#54A24B","#B279A2","#E45756","#72B7B2","#EECA3B"],

  // Secuencial sky-based (alineada con design-taste-frontend)
  seqColors: ["#F0F9FF","#BAE6FD","#7DD3FC","#38BDF8","#0EA5E9","#0369A1","#0C4A6E"],

  // ── Orden canónico de días ────────────────────────────────────
  dias: ["Lunes","Martes","Miercoles","Jueves","Viernes","Sabado","Domingo"],

  // ── Formatos ──────────────────────────────────────────────────
  fmtInt:  d3.format(",d"),
  fmtPct:  d3.format(".1%"),
  fmtDate: d3.timeFormat("%b %Y"),
};

// ── Tooltip global ────────────────────────────────────────────────
const _tipEl = document.getElementById("tooltip");

function showTip(html, event) {
  _tipEl.innerHTML = html;
  _tipEl.setAttribute("aria-hidden", "false");
  _tipEl.classList.add("is-visible");
  _moveTip(event);
}

function moveTip(event) { _moveTip(event); }

function _moveTip(event) {
  // position:fixed usa coordenadas del viewport → clientX/Y, NO pageX/Y
  const h     = _tipEl.offsetHeight || 50;
  const w     = _tipEl.offsetWidth  || 180;
  const viewW = document.documentElement.clientWidth;
  const viewH = document.documentElement.clientHeight;

  let x = event.clientX + 14;
  let y = event.clientY - h - 12;   // encima del cursor

  if (x + w > viewW - 10) x = event.clientX - w - 14; // voltear izquierda
  if (y < 4)               y = event.clientY + 16;      // voltear abajo si toca el borde superior

  _tipEl.style.left = x + "px";
  _tipEl.style.top  = y + "px";
}

function hideTip() {
  _tipEl.classList.remove("is-visible");
  _tipEl.setAttribute("aria-hidden", "true");
}

// ── Helper: ancho real de un contenedor DOM ───────────────────────
function getWidth(el) {
  return el.getBoundingClientRect().width || el.parentElement.getBoundingClientRect().width;
}

// ── Helper: escala secuencial sky-based ──────────────────────────
function makeSeqScale(domain) {
  return d3.scaleQuantize()
    .domain(domain)
    .range(CFG.seqColors);
}
