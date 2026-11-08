import { state } from './state.js';
import { map } from './map.js';
import { estiloNormal, estiloSelecionado } from './selecao.js';
import { atualizarCalculos } from './calculos.js';

export function inicializarIO() {
  const btnExportar = document.getElementById('btnExportar');
  const btnLoad = document.getElementById('btnLoad');
  const velocidade = document.getElementById('velocidade');
  const vazao = document.getElementById('vazao');
  const btnNovo = document.getElementById('btnNovo');

  if (btnExportar) {
    btnExportar.onclick = () => {
      if (!state.areaFinalFeature) {
        alert('Conclua a demarcação antes de exportar.');
        return;
      }

      const features = [];

      features.push({
        type: 'Feature',
        geometry: state.areaFinalFeature.geometry,
        properties: {
          tipo: 'area_nebulizacao',
          hectares: (turf.area(state.areaFinalFeature) / 10000).toFixed(2),
          velocidade_kmh: +velocidade.value,
          vazao_ml_min: +vazao.value
        }
      });

      state.quarteiroesSelecionados.forEach(layer => {
        const f = layer.toGeoJSON();
        f.properties = { ...f.properties, tipo: 'quarteirao_base' };
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

      const blob = new Blob([JSON.stringify(exportGeoJSON, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'area_nebulizacao.geojson';
      a.click();
    };
  }

  if (btnLoad) {
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

          state.quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
          state.quarteiroesSelecionados.clear();

          if (state.poligonoArea) {
            map.removeLayer(state.poligonoArea);
            state.poligonoArea = null;
            state.areaFinalFeature = null;
          }

          const idsImportados = new Set();
          data.features.forEach(f => {
            if (f.properties?.tipo === 'quarteirao_base') {
              idsImportados.add(f.properties.id);
            }
          });

          state.camadaQuarteiroes.eachLayer(layer => {
            const id = layer.feature?.properties?.id;
            if (!id) return;

            if (idsImportados.has(id)) {
              layer.setStyle(estiloSelecionado);
              state.quarteiroesSelecionados.add(layer);
            } else {
              layer.setStyle(estiloNormal);
            }
          });

          const areaFeature = data.features.find(f => f.properties?.tipo === 'area_nebulizacao');

          if (areaFeature) {
            state.areaFinalFeature = areaFeature;
            state.poligonoArea = L.geoJSON(areaFeature, {
              style: { color: '#ff0000', weight: 4, fill: false }
            }).addTo(map);

            map.fitBounds(state.poligonoArea.getBounds(), { padding: [20, 20], maxZoom: 18 });
          }

          state.modoSelecao = false;
          if (btnNovo) btnNovo.textContent = 'Nova demarcação';

          atualizarCalculos();
        };

        reader.readAsText(file);
      };

      input.click();
    };
  }
}
