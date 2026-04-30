/* Gráfico 3 — Composición por gravedad (donut) */

function drawGravedad(rows, svgSel = "#chart") {
  const svg = d3.select(svgSel);
  svg.selectAll("*").remove();

  const W = getWidth(svg.node());
  const H = 520;
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

  if (!rows.length) return;

  // Agregar por gravedad; orden semántico: de más leve a más grave
  const orden = ["SOLO DANOS", "CON HERIDOS", "CON MUERTOS", "SIN DATO"];

  // Etiquetas legibles (no todo mayúsculas, tilde en daños)
  const LABEL = {
    "SOLO DANOS":  "Solo daños",
    "CON HERIDOS": "Con heridos",
    "CON MUERTOS": "Con muertos",
    "SIN DATO":    "Sin dato",
  };
  const byGrav = d3.rollup(rows, v => v.length, d => d.gravedad);
  const data = orden
    .filter(g => byGrav.has(g))
    .map(g => ({ gravedad: g, n: byGrav.get(g) }));
  const total = d3.sum(data, d => d.n);

  // Dimensiones del donut centrado
  const cx = W * 0.38;
  const cy = H / 2;
  const outerR = Math.min(cx, cy) - 32;
  const innerR = outerR * 0.54;

  const pie = d3.pie().value(d => d.n).sort(null);
  const arc = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const arcHover = d3.arc().innerRadius(innerR).outerRadius(outerR + 6);

  const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

  // Arcos
  g.selectAll("path")
    .data(pie(data))
    .join("path")
      .attr("d", arc)
      .attr("fill", d => CFG.gravedad[d.data.gravedad] || CFG.muted)
      .attr("stroke", "#fff")
      .attr("stroke-width", 2)
      .style("cursor", "default")
      .on("mousemove", function(e, d) {
        d3.select(this).attr("d", arcHover(d));
        const pct = CFG.fmtPct(d.data.n / total);
        showTip(
          `<strong>${d.data.gravedad}</strong><br>${CFG.fmtInt(d.data.n)} (${pct})`,
          e
        );
      })
      .on("mouseleave", function(e, d) {
        d3.select(this).attr("d", arc(d));
        hideTip();
      });

  // Texto central: total
  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "-0.3em")
    .attr("fill", CFG.muted)
    .attr("font-size", 13)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .text("Total");

  g.append("text")
    .attr("text-anchor", "middle")
    .attr("dy", "1.1em")
    .attr("fill", CFG.text)
    .attr("font-size", 26)
    .attr("font-weight", 700)
    .attr("font-family", "var(--font-mono, monospace)")
    .attr("font-feature-settings", '"tnum" 1')
    .text(CFG.fmtInt(total));

  // Leyenda a la derecha con porcentaje y valor
  const lx = cx + outerR + 40;
  const legG = svg.append("g").attr("transform", `translate(${lx}, ${cy - (data.length * 28) / 2})`);

  data.forEach((d, i) => {
    const gy = i * 52;
    const pct = CFG.fmtPct(d.n / total);

    legG.append("rect")
      .attr("y", gy)
      .attr("width", 12)
      .attr("height", 12)
      .attr("rx", 3)
      .attr("fill", CFG.gravedad[d.gravedad] || CFG.muted);

    legG.append("text")
      .attr("x", 20)
      .attr("y", gy + 10)
      .attr("fill", CFG.subtext)
      .attr("font-size", 12)
      .attr("font-family", "var(--font-sans, sans-serif)")
      .text(LABEL[d.gravedad] || d.gravedad);

    legG.append("text")
      .attr("x", 20)
      .attr("y", gy + 28)
      .attr("fill", CFG.text)
      .attr("font-size", 14)
      .attr("font-weight", 600)
      .attr("font-family", "var(--font-mono, monospace)")
      .attr("font-feature-settings", '"tnum" 1')
      .text(`${pct}  ·  ${CFG.fmtInt(d.n)}`);
  });
}
