/* Estado global y carga de datos */

const STATE = {
  allRows: [],      // filas del CSV completo (columnas mínimas)
  geoJSON: null,    // GeoJSON convertido desde ESRI JSON
  filtros: {
    anios:       new Set(),
    gravedades:  new Set(),
    clases:      new Set(),
    localidades: new Set(),
  },
  activeChart: "mensual",
};

// ── Conversión ESRI JSON → GeoJSON estándar ───────────────────────
// El GeoJSON de Datos Abiertos Bogotá viene en formato ESRI:
// { features: [{ attributes: {...}, geometry: { rings: [...] } }] }
function esriToGeoJSON(esri) {
  return {
    type: "FeatureCollection",
    features: esri.features.map(f => ({
      type: "Feature",
      properties: f.attributes,
      geometry: {
        type: "Polygon",
        coordinates: f.geometry.rings,
      },
    })),
  };
}

// ── Normalizar nombre de localidad (quita tildes, mayúsculas) ─────
// Necesario para cruzar CSV (ANTONIO NARINO) con GeoJSON (ANTONIO NARIÑO)
function normalizarLoc(s) {
  return String(s || "")
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toUpperCase()
    .trim();
}

// ── Aplicar filtros al dataset completo ───────────────────────────
function aplicarFiltros() {
  const { anios, gravedades, clases, localidades } = STATE.filtros;
  return STATE.allRows.filter(d =>
    anios.has(d.anio) &&
    gravedades.has(d.gravedad) &&
    clases.has(d.clase) &&
    localidades.has(d.localidad)
  );
}

// ── Carga de datos (CSV completo + GeoJSON) ───────────────────────
async function cargarDatos() {
  const [rows, geoRaw] = await Promise.all([
    d3.csv("data/siniestros_bogota_limpio.csv", d => ({
      anio:      +d.anio,
      mes:       +d.mes,
      hora:      +d.hora,
      diaSemana: d.dia_semana,
      gravedad:  d.gravedad,
      clase:     d.clase_accidente,
      localidad: d.localidad,
    })),
    d3.json("data/localidades_bogota.geojson"),
  ]);

  STATE.allRows = rows;
  STATE.geoJSON = esriToGeoJSON(geoRaw);

  // Inicializar filtros con todos los valores únicos seleccionados
  STATE.filtros.anios       = new Set(rows.map(d => d.anio));
  STATE.filtros.gravedades  = new Set(rows.map(d => d.gravedad));
  STATE.filtros.clases      = new Set(rows.map(d => d.clase));
  STATE.filtros.localidades = new Set(rows.map(d => d.localidad));
}
