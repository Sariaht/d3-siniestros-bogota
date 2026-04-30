/* Gráfico 4 — Heatmap hora × día de la semana */
// FIX DOCENTE: eje X horizontal (0°), formato 00h-22h cada 2h
// FIX DOCENTE: eje Y en orden Lunes → Domingo

function drawHeatmap(rows, svgSel = "#chart") {
  const svg = d3.select(svgSel);
  svg.selectAll("*").remove();

  const W = getWidth(svg.node());
  const H = 520;
  const M = { t: 16, r: 24, b: 52, l: 96 };
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

  if (!rows.length) return;

  // Agregar por dia_semana × hora
  const byDiaHora = d3.rollup(rows, v => v.length, d => d.diaSemana, d => d.hora);

  // Construir tabla plana (7 × 24)
  const horas = d3.range(0, 24);
  const cellData = [];
  for (const dia of CFG.dias) {
    for (const h of horas) {
      cellData.push({ dia, hora: h, n: byDiaHora.get(dia)?.get(h) || 0 });
    }
  }

  const maxN = d3.max(cellData, d => d.n) || 1;
  const colorScale = d3.scaleSequential()
    .domain([0, maxN])
    .interpolator(d3.interpolateBlues);

  // Escalas de posición
  const x = d3.scaleBand()
    .domain(horas)
    .range([M.l, W - M.r])
    .padding(0.06);

  const y = d3.scaleBand()
    .domain(CFG.dias)
    .range([M.t, H - M.b])
    .padding(0.06);

  // Celdas del heatmap
  svg.append("g")
    .selectAll("rect")
    .data(cellData)
    .join("rect")
      .attr("x", d => x(d.hora))
      .attr("y", d => y(d.dia))
      .attr("width",  x.bandwidth())
      .attr("height", y.bandwidth())
      .attr("rx", 2)
      .attr("fill", d => colorScale(d.n))
      .style("cursor", "default")
      .on("mousemove", (e, d) =>
        showTip(
          `<strong>${d.dia} &mdash; ${String(d.hora).padStart(2,"0")}:00</strong><br>${CFG.fmtInt(d.n)} siniestros`,
          e
        )
      )
      .on("mouseleave", hideTip);

  // FIX DOCENTE — Eje X horizontal, etiqueta cada 2 horas, formato 00h
  svg.append("g")
    .attr("class", "axis axis-mono")
    .attr("transform", `translate(0,${H - M.b})`)
    .call(
      d3.axisBottom(x)
        .tickValues(horas.filter(h => h % 2 === 0))
        .tickFormat(h => `${String(h).padStart(2, "0")}h`)
        .tickSize(4)
    )
    .call(g => g.select(".domain").attr("stroke", CFG.grid))
    .call(g => g.selectAll(".tick line").attr("stroke", CFG.grid))
    .selectAll("text")
      .attr("fill", CFG.muted)
      .attr("font-size", 11)
      .attr("transform", "rotate(0)")   // explícito: sin rotación
      .attr("text-anchor", "middle")
      .attr("dy", "1.2em");

  // FIX DOCENTE — Eje Y: Lunes → Domingo (ya definido en CFG.dias)
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(${M.l},0)`)
    .call(
      d3.axisLeft(y).tickSize(0).tickPadding(8)
    )
    .call(g => g.select(".domain").remove())
    .selectAll("text")
      .attr("fill", CFG.subtext)
      .attr("font-size", 12);

  // Etiqueta del eje X
  svg.append("text")
    .attr("x", (M.l + W - M.r) / 2)
    .attr("y", H - 4)
    .attr("text-anchor", "middle")
    .attr("fill", CFG.muted)
    .attr("font-size", 11)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .text("Hora del día");

  // Leyenda de escala de color (inline)
  const legW = 120;
  const legH = 10;
  const legX = W - M.r - legW;
  const legY = H - M.b + 30;

  const defs = svg.append("defs");
  const grad = defs.append("linearGradient").attr("id", "hm-grad");
  [0, 0.25, 0.5, 0.75, 1].forEach(t =>
    grad.append("stop")
      .attr("offset", `${t * 100}%`)
      .attr("stop-color", colorScale(t * maxN))
  );

  svg.append("rect")
    .attr("x", legX).attr("y", legY)
    .attr("width", legW).attr("height", legH)
    .attr("rx", 3)
    .attr("fill", "url(#hm-grad)");

  svg.append("text")
    .attr("x", legX).attr("y", legY - 4)
    .attr("fill", CFG.muted).attr("font-size", 10)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .text("Menos");

  svg.append("text")
    .attr("x", legX + legW).attr("y", legY - 4)
    .attr("text-anchor", "end")
    .attr("fill", CFG.muted).attr("font-size", 10)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .text("Más");
}
