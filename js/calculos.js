const map = L.map('map').setView([-21.9346, -50.5136], 14);

const rotulos = [];
const ZOOM_ROTULO = 16;

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let modoSelecao = false;
const quarteiroesSelecionados = new Set();
let poligonoArea = null;
let areaFinalFeature = null;

// =====================
// ESTILOS
// =====================
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

// =====================
// BOTÃO SELEÇÃO
// =====================
toggleSelecao.onclick = () => {

  // Apagar área existente
  if (!modoSelecao && poligonoArea) {
    const ok = confirm('Deseja apagar a área selecionada?');
    if (!ok) return;

    quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
    quarteiroesSelecionados.clear();

    map.removeLayer(poligonoArea);
    poligonoArea = null;
    areaFinalFeature = null;

    atualizarCalculos();
  }

  modoSelecao = !modoSelecao;
  toggleSelecao.textContent = modoSelecao ? 'Concluir' : 'Selecionar Área';

  // Concluir seleção
  if (!modoSelecao) {
    const areaFinal = criarPoligonoArea();

    if (areaFinal) {
      const bounds = L.geoJSON(areaFinal).getBounds();
      map.fitBounds(bounds, {
        padding: [20, 20],
        maxZoom: 18
      });
    }

    atualizarCalculos();
  }
};

// =====================
// CARREGAR QUARTEIRÕES
// =====================
fetch('data/quarteiroes.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: estiloNormal,
      onEachFeature: (feature, layer) => {

        layer.setStyle(estiloNormal);

        // Rótulo
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

        if (map.getZoom() >= ZOOM_ROTULO) {
          rotulo.addTo(map);
        }

        // Clique
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

// =====================
// ZOOM DOS RÓTULOS
// =====================
map.on('zoomend', () => {
  const zoom = map.getZoom();

  rotulos.forEach(r => {
    if (zoom >= ZOOM_ROTULO) {
      if (!map.hasLayer(r)) r.addTo(map);
    } else {
      if (map.hasLayer(r)) map.removeLayer(r);
    }
  });
});

// =====================
// CÁLCULOS
// =====================
function atualizarCalculos() {
  let percurso = 0;

  quarteiroesSelecionados.forEach(layer => {
    const latlngs = layer.getLatLngs().flat(2);

    for (let i = 0; i < latlngs.length; i++) {
      const p1 = latlngs[i];
      const p2 = latlngs[(i + 1) % latlngs.length];
      percurso += p1.distanceTo(p2);
    }
  });

  // Ajuste do percuro por ruas, adiciona uma porcentagem ajustável ao perímetro do quarteirão
  const FATOR_RUA = 1.15;
  percurso *= FATOR_RUA;

  // 🔹 Área (ha)
  let hectares = 0;
  if (areaFinalFeature) {
    hectares = turf.area(areaFinalFeature) / 10000;
  }

  //const mHaValor = hectares > 0 ? percurso / hectares : 0;

  // 🔹 Inputs (corrigido)
  const vel = parseFloat(velocidade.value) || 0;
  const vaz = parseFloat(vazao.value) || 0;

  let tempo = 0;
  let consumo = 0;

  if (vel > 0 && vaz > 0) {
    tempo = percurso / ((vel * 1000) / 60);
    consumo = (tempo * vaz) / 1000;
  }

  // 🔹 UI
  areaHa.textContent = hectares.toFixed(2);
  kmTotal.textContent = (percurso / 1000).toFixed(2);
  //mHa.textContent = mHaValor.toFixed(0);
  tempoMin.textContent = tempo.toFixed(1);
  consumoL.textContent = consumo.toFixed(2);
}


velocidade.oninput = atualizarCalculos;
vazao.oninput = atualizarCalculos;

// =====================
// REMOVER BURACOS
// =====================
function removerBuracos(feature) {
  if (!feature || !feature.geometry) return feature;

  if (feature.geometry.type === 'Polygon') {
    return {
      ...feature,
      geometry: {
        type: 'Polygon',
        coordinates: [feature.geometry.coordinates[0]]
      }
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

// =====================
// CRIAR POLÍGONO FINAL
// =====================
function criarPoligonoArea() {
  if (quarteiroesSelecionados.size === 0) return null;

  let unido = null;

  quarteiroesSelecionados.forEach(layer => {
    const feature = layer.toGeoJSON();
    unido = unido ? turf.union(unido, feature) : feature;
  });

  if (!unido) return null;

  // 1️⃣ Tolerância topológica (ignorar avenidas)
  const TOLERANCIA_METROS = 20;

  const expandido = turf.buffer(unido, TOLERANCIA_METROS, { units: 'meters' });
  const semBuracos = removerBuracos(expandido);
  const recontraido = turf.buffer(semBuracos, -TOLERANCIA_METROS, { units: 'meters' });

  // 2️⃣ Afastamento visual (não cobrir nomes de ruas)
  const AFASTAMENTO_VISUAL_METROS = 10;
  const final = turf.buffer(recontraido, AFASTAMENTO_VISUAL_METROS, { units: 'meters' });

  if (poligonoArea) {
    map.removeLayer(poligonoArea);
  }

  poligonoArea = L.geoJSON(final, {
    style: {
      color: '#ff0000',
      weight: 4,
      fill: false
    }
  }).addTo(map);

  areaFinalFeature = final;
  return final;
}
