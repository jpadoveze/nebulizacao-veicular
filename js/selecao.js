import { estado } from './estado.js';
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
      estado.camadaQuarteiroes = L.geoJSON(data, {
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

          estado.rotulos.push(rotulo);
          if (map.getZoom() >= estado.ZOOM_ROTULO) rotulo.addTo(map);

          layer.on('click', () => {
            if (!estado.modoSelecao) return;

            if (estado.quarteiroesSelecionados.has(layer)) {
              estado.quarteiroesSelecionados.delete(layer);
              layer.setStyle(estiloNormal);
            } else {
              estado.quarteiroesSelecionados.add(layer);
              layer.setStyle(estiloSelecionado);
            }

            atualizarCalculos();
          });
        }
      }).addTo(map);
    })
    .catch(err => console.error('Erro ao carregar os quarteirões:', err));
}
