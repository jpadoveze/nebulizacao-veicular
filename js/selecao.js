<<<<<<< HEAD
import { state } from './state.js';
import { map } from './map.js';
import { atualizarCalculos } from './calculos.js';

export const estiloNormal = {
  color: '#555',
  weight: 1,
  fillOpacity: 0.2,
  fillColor: '#3388ff'
};

export const estiloSelecionado = {
  color: '#ff5500',
  weight: 2,
  fillOpacity: 0.6,
  fillColor: '#ff7800'
};

export function inicializarQuarteiroes() {
  fetch('data/quarteiroes.geojson')
    .then(r => r.json())
    .then(data => {
      state.camadaQuarteiroes = L.geoJSON(data, {
        style: estiloNormal,
        onEachFeature: (feature, layer) => {
          const centro = layer.getBounds().getCenter();
          const rotulo = L.marker(centro, {
            icon: L.divIcon({
              className: 'rotulo-quarteirao',
              html: feature.properties.id,
              iconSize: null
            }),
            interactive: false
          });

          state.rotulos.push(rotulo);
          if (map.getZoom() >= state.ZOOM_ROTULO) rotulo.addTo(map);

          layer.on('click', () => {
            if (!state.modoSelecao) return;

            if (state.quarteiroesSelecionados.has(layer)) {
              state.quarteiroesSelecionados.delete(layer);
              layer.setStyle(estiloNormal);
            } else {
              state.quarteiroesSelecionados.add(layer);
              layer.setStyle(estiloSelecionado);
            }

            atualizarCalculos();
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error('Erro ao carregar os quarteirões:', err));
}
=======
const estiloNormal = {
  color: '#555',
  weight: 1,
  fillOpacity: 0.2,
  fillColor: '#3388ff'
};

const estiloSelecionado = {
  color: '#ff5500',
  weight: 2,
  fillOpacity: 0.6,
  fillColor: '#ff7800'
};

fetch('data/quarteiroes.geojson')
  .then(r => r.json())
  .then(data => {

    camadaQuarteiroes = L.geoJSON(data, {
      style: estiloNormal,
      onEachFeature: (feature, layer) => {

        // rótulo
        const centro = layer.getBounds().getCenter();
        const rotulo = L.marker(centro, {
          icon: L.divIcon({
            className: 'rotulo-quarteirao',
            html: feature.properties.id,
            iconSize: null
          }),
          interactive: false
        });

        rotulos.push(rotulo);
        if (map.getZoom() >= ZOOM_ROTULO) rotulo.addTo(map);

        // clique
        layer.on('click', () => {
          if (!modoSelecao) return;

          if (quarteiroesSelecionados.has(layer)) {
            quarteiroesSelecionados.delete(layer);
            layer.setStyle(estiloNormal);
          } else {
            quarteiroesSelecionados.add(layer);
            layer.setStyle(estiloSelecionado);
          }

          atualizarCalculos();
        });
      }
    }).addTo(map);
  });
>>>>>>> 0c37ccae45310987627a90c06cfcfdb9c1883dce
