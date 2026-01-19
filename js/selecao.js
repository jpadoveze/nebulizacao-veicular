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
