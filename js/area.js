import { estado } from './estado.js';
import { map } from './map.js';
import { atualizarCalculos } from './calculos.js';

function removerBuracos(feature) {
  if (!feature || !feature.geometry) return feature;

  if (feature.geometry.type === 'Polygon') {
    return {
      ...feature,
      geometry: { type: 'Polygon', coordinates: [feature.geometry.coordinates[0]] }
    };
  }

  if (feature.geometry.type === 'MultiPolygon') {
    return {
      ...feature,
      geometry: {
        type: 'MultiPolygon',
        coordinates: feature.geometry.coordinates.map(p => [p[0]])
      }
    };
  }

  return feature;
}

export function criarPoligonoArea() {
  if (estado.quarteiroesSelecionados.size === 0) return null;

  let unido = null;

  estado.quarteiroesSelecionados.forEach(layer => {
    const f = layer.toGeoJSON();
    unido = unido ? turf.union(unido, f) : f;
  });

  if (!unido) return null;

  const TOLERANCIA_METROS = 20;
  const AFASTAMENTO_VISUAL_METROS = 10;

  const expandido = turf.buffer(unido, TOLERANCIA_METROS, { units: 'meters' });
  const semBuracos = removerBuracos(expandido);
  const recontraido = turf.buffer(semBuracos, -TOLERANCIA_METROS, { units: 'meters' });
  const final = turf.buffer(recontraido, AFASTAMENTO_VISUAL_METROS, { units: 'meters' });

  if (estado.poligonoArea) map.removeLayer(estado.poligonoArea);

  estado.poligonoArea = L.geoJSON(final, {
    style: { color: '#ff0000', weight: 4, fill: false }
  }).addTo(map);

  estado.areaFinalFeature = final;

  const areaHa = document.getElementById('areaHa');
  if (areaHa) {
    const hectares = turf.area(final) / 10000;
    areaHa.textContent = hectares.toFixed(2);
  }

  return final;
}
