// Exportação
btnExportar.onclick = () => {
  if (!areaFinalFeature) {
    alert('Conclua a demarcação antes de exportar.');
    return;
  }

  const features = [];

  features.push({
    type: 'Feature',
    geometry: areaFinalFeature.geometry,
    properties: {
      tipo: 'area_nebulizacao',
      hectares: (turf.area(areaFinalFeature) / 10000).toFixed(2),
      velocidade_kmh: +velocidade.value,
      vazao_ml_min: +vazao.value
    }
  });

  quarteiroesSelecionados.forEach(layer => {
    const f = layer.toGeoJSON();
    f.properties = {
      ...f.properties,
      tipo: 'quarteirao_base'
    };
    features.push(f);
  });

  const exportGeoJSON = {
    type: 'FeatureCollection',
    properties: {
      sistema: 'Nebulização Veicular – ACE',
      data: new Date().toISOString(),
      metodo: 'UBV veicular'
    },
    features
  };

  const blob = new Blob(
    [JSON.stringify(exportGeoJSON, null, 2)],
    { type: 'application/json' }
  );

  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'area_nebulizacao.geojson';
  a.click();
};

// Importação(Load)
btnLoad.onclick = () => {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.geojson,.json';

  input.onchange = e => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = ev => {
      const data = JSON.parse(ev.target.result);

      quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
      quarteiroesSelecionados.clear();

      if (poligonoArea) {
        map.removeLayer(poligonoArea);
        poligonoArea = null;
        areaFinalFeature = null;
      }

      const idsImportados = new Set();

      data.features.forEach(f => {
        if (f.properties?.tipo === 'quarteirao_base') {
          idsImportados.add(f.properties.id);
        }
      });

      camadaQuarteiroes.eachLayer(layer => {
        const id = layer.feature?.properties?.id;
        if (!id) return;

        if (idsImportados.has(id)) {
          layer.setStyle(estiloSelecionado);
          quarteiroesSelecionados.add(layer);
        } else {
          layer.setStyle(estiloNormal);
        }
      });

      const areaFeature = data.features.find(
        f => f.properties?.tipo === 'area_nebulizacao'
      );

      if (areaFeature) {
        areaFinalFeature = areaFeature;

        poligonoArea = L.geoJSON(areaFeature, {
          style: {
            color: '#ff0000',
            weight: 4,
            fill: false
          }
        }).addTo(map);

        map.fitBounds(poligonoArea.getBounds(), {
          padding: [20, 20],
          maxZoom: 18
        });
      }

      modoSelecao = false;
      btnNovo.textContent = 'Nova demarcação';

      atualizarCalculos();
    };

    reader.readAsText(file);
  };

  input.click();
};
