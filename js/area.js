<<<<<<< HEAD
import { state } from './state.js';
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
  if (state.quarteiroesSelecionados.size === 0) return null;

  let unido = null;

  state.quarteiroesSelecionados.forEach(layer => {
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

  if (state.poligonoArea) map.removeLayer(state.poligonoArea);

  state.poligonoArea = L.geoJSON(final, {
    style: { color: '#ff0000', weight: 4, fill: false }
  }).addTo(map);

  state.areaFinalFeature = final;

  const areaHa = document.getElementById('areaHa');
  if (areaHa) {
    const hectares = turf.area(final) / 10000;
    areaHa.textContent = hectares.toFixed(2);
  }

  return final;
}
=======
function normalizarFeature(feature) {
  if (!feature || !feature.geometry) return null;
  return {
    type: 'Feature',
    properties: {},
    geometry: feature.geometry
  };
}

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

function criarPoligonoArea() {
  if (quarteiroesSelecionados.size === 0) return null;

  let unido = null;

  quarteiroesSelecionados.forEach(layer => {
    const f = layer.toGeoJSON();
    unido = unido ? turf.union(unido, f) : f;
  });

  if (!unido) return null;

  const TOLERANCIA_METROS = 20; //ajuste para que o permitro do polígono final acompanhe o contorno dos quarteirões periféricos
  const AFASTAMENTO_VISUAL_METROS = 10; // permite regular a expansão do polígono da área final

  const expandido = turf.buffer(unido, TOLERANCIA_METROS, { units: 'meters' }); // aplicação do TOLERANCIA_METROS em metros
  const semBuracos = removerBuracos(expandido);
  const recontraido = turf.buffer(semBuracos, -TOLERANCIA_METROS, { units: 'meters' });
  const final = turf.buffer(recontraido, AFASTAMENTO_VISUAL_METROS, { units: 'meters' }); // aplicação do AFASTAMENTO_VISUAL_METROS em metros

  if (poligonoArea) map.removeLayer(poligonoArea);

  poligonoArea = L.geoJSON(final, {
    style: { color: '#ff0000', weight: 4, fill: false }
  }).addTo(map);

  areaFinalFeature = final;

  // 🔹 ATUALIZA A ÁREA AQUI (garantido)
  const hectares = turf.area(final) / 10000;
  areaHa.textContent = hectares.toFixed(2);

  selecionarQuarteiroesInternos(final);

  return final;
}

>>>>>>> 0c37ccae45310987627a90c06cfcfdb9c1883dce
