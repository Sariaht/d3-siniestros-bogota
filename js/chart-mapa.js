/* Gráfico 5 — Mapa coroplético por localidades (Leaflet + GeoJSON) */
// FIX DOCENTE: coroplético sobre polígonos, no scatter de puntos.
// El GeoJSON de Datos Abiertos Bogotá viene en formato ESRI (la conversión
// está en data.js: STATE.geoJSON ya es GeoJSON estándar).

let _mapaInstance = null;
let _layerCoropleta = null;
let _leyendaControl = null;

function drawMapa(rows) {
  const mapEl = document.getElementById("leaflet-map");

  // 1. Inicialización idempotente del mapa Leaflet
  if (!_mapaInstance) {
    _mapaInstance = L.map(mapEl, {
      center: [4.65, -74.10],
      zoom: 10,
      zoomSnap: 0.5,
      attributionControl: false,
    });

    L.tileLayer(
      "https://{s}.basemaps.cartocdn.com/light_nolabels/{z}/{x}/{y}{r}.png",
      { maxZoom: 19, subdomains: "abcd" }
    ).addTo(_mapaInstance);

    L.control.attribution({ prefix: false })
      .addAttribution('&copy; <a href="https://carto.com/">CARTO</a>')
      .addTo(_mapaInstance);
  }

  // Forzar resize tras la transición CSS del stage
  setTimeout(() => _mapaInstance.invalidateSize(), 320);

  const geo = STATE.geoJSON;
  if (!geo) return;

  // 2. Agregar conteos, clase dominante y gravedad dominante por localidad
  const counts  = d3.rollup(rows, v => v.length, d => normalizarLoc(d.localidad));
  const claseD  = d3.rollup(
    rows,
    v => dominante(v, d => d.clase),
    d => normalizarLoc(d.localidad)
  );
  const gravD   = d3.rollup(
    rows,
    v => dominante(v, d => d.gravedad),
    d => normalizarLoc(d.localidad)
  );

  const maxCount = d3.max([...counts.values()]) || 1;
  const colorScale = d3.scaleQuantize()
    .domain([0, maxCount])
    .range(CFG.seqColors);

  // 3. Reemplazar capa anterior
  if (_layerCoropleta) {
    _mapaInstance.removeLayer(_layerCoropleta);
    _layerCoropleta = null;
  }

  _layerCoropleta = L.geoJSON(geo, {
    style: feature => {
      const nombre = normalizarLoc(feature.properties.LocNombre);
      const n = counts.get(nombre) || 0;
      return {
        fillColor:   colorScale(n),
        fillOpacity: n > 0 ? 0.80 : 0.15,
        color:       "#FFFFFF",
        weight:      1.5,
      };
    },
    onEachFeature: (feature, layer) => {
      const nombre   = normalizarLoc(feature.properties.LocNombre);
      const nomMost  = feature.properties.LocNombre;
      const n        = counts.get(nombre) || 0;
      const clase    = claseD.get(nombre)  || "—";
      const grav     = gravD.get(nombre)   || "—";

      const html = `
        <div style="font-family:'Geist',sans-serif;min-width:160px;padding:2px 4px">
          <div style="font-weight:700;color:#0F172A;font-size:13px;margin-bottom:4px">
            ${nomMost}
          </div>
          <div style="color:#475569;font-size:12px;line-height:1.6">
            <strong>${CFG.fmtInt(n)}</strong> siniestros<br>
            Clase dominante: <strong>${clase}</strong><br>
            Gravedad dominante: <strong>${grav}</strong>
          </div>
        </div>`;

      layer.bindTooltip(html, { sticky: true, direction: "auto", opacity: 0.97 });

      layer.on({
        mouseover: e => {
          e.target.setStyle({
            weight: 2.5,
            color: CFG.accentDeep,
            fillOpacity: 0.92,
          });
          e.target.bringToFront();
        },
        mouseout: () => _layerCoropleta?.resetStyle(layer),
      });
    },
  }).addTo(_mapaInstance);

  // 4. Leyenda
  if (_leyendaControl) {
    _mapaInstance.removeControl(_leyendaControl);
    _leyendaControl = null;
  }

  _leyendaControl = L.control({ position: "bottomright" });
  _leyendaControl.onAdd = () => {
    const div = L.DomUtil.create("div", "map-legend");
    const breaks = colorScale.thresholds();
    const labels = CFG.seqColors.map((c, i) => {
      const lo = i === 0 ? 0 : Math.round(breaks[i - 1]);
      return { color: c, label: `${CFG.fmtInt(lo)}+` };
    });
    div.innerHTML = `
      <div class="map-legend-title">Siniestros por localidad</div>
      ${labels.map(l => `
        <div class="map-legend-row">
          <span class="map-legend-swatch" style="background:${l.color}"></span>
          <span>${l.label}</span>
        </div>`).join("")}`;
    return div;
  };
  _leyendaControl.addTo(_mapaInstance);
}

// Valor modal (más frecuente) de una lista de objetos por clave accessor
function dominante(arr, accessor) {
  const m = d3.greatest(
    d3.rollups(arr, v => v.length, accessor),
    ([, n]) => n
  );
  return m ? m[0] : "—";
}
