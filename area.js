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

