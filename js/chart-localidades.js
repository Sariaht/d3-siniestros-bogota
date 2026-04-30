/* Gráfico 2 — Top-10 localidades (barras horizontales) */

function drawLocalidades(rows, svgSel = "#chart") {
  const svg = d3.select(svgSel);
  svg.selectAll("*").remove();

  const W = getWidth(svg.node());
  const H = 520;
  const M = { t: 16, r: 100, b: 32, l: 148 };
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

  if (!rows.length) return;

  // Agregar por localidad, excluir SIN DATO
  // Descendente → Kennedy queda primero en el array → scaleBand lo coloca arriba
  const agg = d3.rollups(rows, v => v.length, d => d.localidad)
    .filter(([loc]) => loc !== "SIN DATO")
    .sort(([, a], [, b]) => d3.descending(a, b))
    .slice(0, 10);

  const maxVal = d3.max(agg, ([, n]) => n);

  const x = d3.scaleLinear()
    .domain([0, maxVal]).nice()
    .range([M.l, W - M.r]);

  const y = d3.scaleBand()
    .domain(agg.map(([loc]) => loc))
    .range([M.t, H - M.b])
    .padding(0.25);

  // Escala secuencial para colorear barras por magnitud
  const color = makeSeqScale([0, maxVal]);

  // Barras con animación stagger (spring: cada barra entra 55ms después que la anterior)
  svg.append("g")
    .selectAll("rect")
    .data(agg)
    .join("rect")
      .attr("x", M.l)
      .attr("y", ([loc]) => y(loc))
      .attr("width", 0)               // empieza en 0 → anima hasta el ancho real
      .attr("height", y.bandwidth())
      .attr("fill", ([, n]) => color(n))
      .attr("rx", 3)
      .style("cursor", "default")
      .on("mousemove", (e, [loc, n]) =>
        showTip(`<strong>${loc}</strong><br>${CFG.fmtInt(n)} siniestros`, e)
      )
      .on("mouseleave", hideTip)
      .transition()
        .duration(500)
        .delay((d, i) => i * 55)
        .ease(d3.easeCubicOut)
        .attr("width", ([, n]) => x(n) - M.l);

  // Etiquetas de valor (todas las barras en este gráfico)
  svg.append("g")
    .selectAll("text")
    .data(agg)
    .join("text")
      .attr("x", ([, n]) => x(n) + 6)
      .attr("y", ([loc]) => y(loc) + y.bandwidth() / 2)
      .attr("dy", "0.35em")
      .attr("font-size", 11)
      .attr("font-family", "var(--font-mono, monospace)")
      .attr("font-feature-settings", '"tnum" 1')
      .attr("fill", CFG.subtext)
      .text(([, n]) => CFG.fmtInt(n));

  // Eje Y (nombres de localidades)
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${M.l},0)`)
    .call(
      d3.axisLeft(y).tickSize(0).tickPadding(10)
    )
    .call(g => g.select(".domain").remove())
    .selectAll("text")
      .attr("fill", d => d === "KENNEDY" ? CFG.text : CFG.subtext)
      .attr("font-size", 12)
      .attr("font-weight", d => d === "KENNEDY" ? "600" : "400");

  // Línea de referencia: promedio
  const prom = d3.mean(agg, ([, n]) => n);
  svg.append("line")
    .attr("x1", x(prom)).attr("y1", M.t)
    .attr("x2", x(prom)).attr("y2", H - M.b)
    .attr("stroke", CFG.muted)
    .attr("stroke-width", 1)
    .attr("stroke-dasharray", "4,3");

  svg.append("text")
    .attr("x", x(prom) + 4)
    .attr("y", M.t + 12)
    .attr("fill", CFG.muted)
    .attr("font-size", 10)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .text("Promedio");
}
