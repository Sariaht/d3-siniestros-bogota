/* Gráfico 6 — Chord diagram: día de la semana × clase de accidente
 * Exclusivo de D3.js: bipartite chord que muestra qué clases predominan
 * cada día. Arcos de días en paleta categórica; arcos de clase en gris.
 * Los ribbons heredan el color del día que los origina.
 */

function drawChord(rows, svgSel = "#chart") {
  const svg = d3.select(svgSel);
  svg.selectAll("*").remove();

  const W = getWidth(svg.node());
  const H = 520;
  svg.attr("viewBox", `0 0 ${W} ${H}`).attr("height", H);

  if (!rows.length) return;

  const dias   = CFG.dias;
  const clases = ["CHOQUE","ATROPELLO","VOLCAMIENTO","CAIDA OCUPANTE","OTRO","AUTOLESION","INCENDIO"];
  const labels = [...dias, ...clases];
  const N      = labels.length; // 14

  // Matriz simétrica 14×14 (bipartita: días 0-6 × clases 7-13)
  const matrix = Array.from({ length: N }, () => new Array(N).fill(0));
  const roll   = d3.rollup(rows, v => v.length, d => d.diaSemana, d => d.clase);

  dias.forEach((dia, di) => {
    clases.forEach((clase, ci) => {
      const val = roll.get(dia)?.get(clase) ?? 0;
      const cj  = dias.length + ci;
      matrix[di][cj] = val;
      matrix[cj][di] = val;
    });
  });

  // Días → paleta categórica; clases → gris slate
  const colorOf = i => i < dias.length ? CFG.cualitativa[i] : CFG.muted;

  const cx     = W / 2;
  const cy     = H / 2;
  const outerR = Math.min(cx, cy) - 88;
  const innerR = outerR - 18;

  const chordLayout = d3.chord()
    .padAngle(0.03)
    .sortSubgroups(d3.descending);

  const chords = chordLayout(matrix);
  const arc    = d3.arc().innerRadius(innerR).outerRadius(outerR);
  const ribbon = d3.ribbon().radius(innerR - 2);

  const g = svg.append("g").attr("transform", `translate(${cx},${cy})`);

  // ── Ribbons (coloreados por el grupo día) ──────────────────────
  g.append("g")
    .selectAll("path")
    .data(chords)
    .join("path")
      .attr("d", ribbon)
      // El ribbon une un día (índice < 7) con una clase (índice ≥ 7)
      .attr("fill", d => colorOf(Math.min(d.source.index, d.target.index)))
      .attr("fill-opacity", 0.52)
      .attr("stroke", "none")
      .style("cursor", "default")
      .on("mousemove", (e, d) => {
        const si = d.source.index, ti = d.target.index;
        const [diaLbl, claseLbl] = si < dias.length
          ? [labels[si], labels[ti]]
          : [labels[ti], labels[si]];
        showTip(
          `<strong>${diaLbl} — ${claseLbl}</strong><br>${CFG.fmtInt(d.source.value)} siniestros`,
          e
        );
      })
      .on("mouseleave", hideTip);

  // ── Arcos de grupo ─────────────────────────────────────────────
  const group = g.append("g")
    .selectAll("g")
    .data(chords.groups)
    .join("g");

  group.append("path")
    .attr("d", arc)
    .attr("fill", d => colorOf(d.index))
    .attr("stroke", "#fff")
    .attr("stroke-width", 0.5);

  // ── Etiquetas ──────────────────────────────────────────────────
  group.append("text")
    .each(d => { d.angle = (d.startAngle + d.endAngle) / 2; })
    .attr("dy", "0.35em")
    .attr("transform", d => {
      const rot  = d.angle * 180 / Math.PI - 90;
      const flip = d.angle > Math.PI ? "rotate(180)" : "";
      return `rotate(${rot}) translate(${outerR + 10}) ${flip}`;
    })
    .attr("text-anchor", d => d.angle > Math.PI ? "end" : "start")
    .attr("fill", d => colorOf(d.index))
    .attr("font-size", d => d.index < dias.length ? 12 : 10)
    .attr("font-family", "var(--font-sans, sans-serif)")
    .attr("font-weight", d => d.index < dias.length ? "600" : "400")
    .text(d => labels[d.index]);
}
