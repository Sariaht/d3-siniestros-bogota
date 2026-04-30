/* Storytelling — Narrativa scrolly-telling
 *
 * Cada .narrative-step tiene data-chart="<clave>" que coincide con
 * una entrada de CHART_INFO en main.js. Al hacer scroll, el gráfico
 * sticky de la izquierda se actualiza con el chart del paso activo.
 *
 * Requiere: CHART_INFO, aplicarFiltros() y STATE (definidos en main.js
 * y data.js). Se llama desde init() después de cargar los datos.
 */

function initScrolly() {
  const steps = document.querySelectorAll(".narrative-step");
  if (!steps.length) return;

  const svgEl   = document.getElementById("scrolly-chart");
  const titleEl = document.getElementById("scrolly-title");

  // ── Activa un paso: actualiza título y rerenderiza el gráfico ──
  function activateStep(step) {
    steps.forEach(s => s.classList.remove("is-active"));
    step.classList.add("is-active");

    const chartKey = step.dataset.chart;
    const info     = CHART_INFO[chartKey];
    if (!info || !info.useSvg) return;

    if (titleEl) titleEl.textContent = step.dataset.title || info.title;

    const df = aplicarFiltros();
    requestAnimationFrame(() => info.render(df, "#scrolly-chart"));
  }

  // Primer paso visible al cargar
  if (steps[0]) activateStep(steps[0]);

  // ── IntersectionObserver: activa el paso al entrar en viewport ──
  const observer = new IntersectionObserver(entries => {
    // Tomar solo los que están intersectando y ordenar por posición Y
    const visible = entries
      .filter(e => e.isIntersecting)
      .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);

    if (visible.length) activateStep(visible[0].target);
  }, {
    threshold: 0.4,
    rootMargin: "0px 0px -15% 0px",
  });

  steps.forEach(step => observer.observe(step));
}
