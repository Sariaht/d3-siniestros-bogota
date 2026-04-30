/* Gráfico 1 — Evolución mensual 2015–2021 (línea) */

function drawMensual(rows, svgSel = "#chart") {
  const svg = d3.select(svgSel);
  svg.selectAll("*").remove();

  const W = getWidth(svg.node());
  const H = 520;
  const M = { t: 24, r: 24, b: 44, l: 68 };
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

  if (!rows.length) return;

  // Agregar por año × mes
  const byMes = d3.rollup(rows, v => v.length, d => d.anio * 100 + d.mes);
  const data = Array.from(byMes, ([k, n]) => ({
    fecha: new Date(Math.floor(k / 100), (k % 100) - 1, 1),
    siniestros: n,
  }))
    .filter(d => !(d.fecha.getFullYear() === 2021 && d.fecha.getMonth() === 8)) // excluir sep-2021 (mes parcial: corte 10/09)
    .sort((a, b) => a.fecha - b.fecha);

  const x = d3.scaleTime()
    .domain(d3.extent(data, d => d.fecha))
    .range([M.l, W - M.r]);

  const y = d3.scaleLinear()
    .domain([0, d3.max(data, d => d.siniestros)]).nice()
    .range([H - M.b, M.t]);

  // Grid horizontal suave
  svg.append("g")
    .attr("transform", `translate(${M.l},0)`)
    .call(
      d3.axisLeft(y).ticks(5).tickSize(-(W - M.l - M.r)).tickFormat("")
    )
    .call(g => g.select(".domain").remove())
    .selectAll("line")
      .attr("stroke", CFG.grid)
      .attr("stroke-dasharray", "2,3");

  // Eje X
  svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${H - M.b})`)
    .call(
      d3.axisBottom(x)
        .ticks(d3.timeYear.every(1))
        .tickFormat(d3.timeFormat("%Y"))
    )
    .call(g => g.select(".domain").attr("stroke", CFG.grid))
    .call(g => g.selectAll(".tick line").attr("stroke", CFG.grid))
    .selectAll("text")
      .attr("fill", CFG.muted)
      .attr("font-size", 12);

  // Eje Y
  svg.append("g")
    .attr("class", "axis axis-mono")
    .attr("transform", `translate(${M.l},0)`)
    .call(
      d3.axisLeft(y).ticks(5).tickFormat(CFG.fmtInt)
    )
    .call(g => g.select(".domain").remove())
    .call(g => g.selectAll(".tick line").remove())
    .selectAll("text")
      .attr("fill", CFG.muted)
      .attr("font-size", 11);

  // Línea
  const line = d3.line()
    .x(d => x(d.fecha))
    .y(d => y(d.siniestros))
    .curve(d3.curveMonotoneX);

  svg.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", CFG.accent)
    .attr("stroke-width", 2.5)
    .attr("stroke-linejoin", "round")
    .attr("stroke-linecap", "round")
    .attr("d", line);

  // Puntos interactivos
  svg.append("g")
    .selectAll("circle")
    .data(data)
    .join("circle")
      .attr("cx", d => x(d.fecha))
      .attr("cy", d => y(d.siniestros))
      .attr("r", 3.5)
      .attr("fill", CFG.accent)
      .attr("stroke", "#fff")
      .attr("stroke-width", 1.5)
      .style("cursor", "default")
      .on("mousemove", (e, d) =>
        showTip(
          `<strong>${CFG.fmtDate(d.fecha)}</strong><br>${CFG.fmtInt(d.siniestros)} siniestros`,
          e
        )
      )
      .on("mouseleave", hideTip);

  // Anotación pandemia 2020
  const pandemia = data.find(d => d.fecha.getFullYear() === 2020 && d.fecha.getMonth() === 3);
  if (pandemia) {
    const px = x(pandemia.fecha);
    const py = y(pandemia.siniestros);

    svg.append("line")
      .attr("x1", px).attr("y1", py - 8)
      .attr("x2", px).attr("y2", py - 36)
      .attr("stroke", CFG.muted)
      .attr("stroke-width", 1)
      .attr("stroke-dasharray", "2,2");

    svg.append("text")
      .attr("x", px)
      .attr("y", py - 42)
      .attr("text-anchor", px < W * 0.7 ? "start" : "end")
      .attr("fill", CFG.subtext)
      .attr("font-size", 11)
      .attr("font-family", "var(--font-sans, sans-serif)")
      .text("Caída por pandemia (abr. 2020)");
  }

  // Franja sombreada 2020 para resaltar el año
  const ini2020 = x(new Date(2020, 0, 1));
  const fin2020 = x(new Date(2021, 0, 1));
  svg.insert("rect", ":first-child")
    .attr("x", ini2020)
    .attr("y", M.t)
    .attr("width", fin2020 - ini2020)
    .attr("height", H - M.t - M.b)
    .attr("fill", "#F0F9FF")
    .attr("opacity", 0.5);
}
