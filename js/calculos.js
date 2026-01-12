const map = L.map('map').setView([-21.9346, -50.5136], 14);
const rotulos = [];
const ZOOM_ROTULO = 16;
const AFASTAMENTO_RUA = 1.6; // metros



L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

let modoSelecao = false;
const quarteiroesSelecionados = new Set();
let poligonoArea = null;

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

toggleSelecao.onclick = () => {

  // Se já existe área criada, pedir confirmação
  if (!modoSelecao && poligonoArea) {
    const ok = confirm('Deseja apagar a área selecionada?');
    if (!ok) return;

    // limpar tudo
    quarteiroesSelecionados.forEach(l =>
      l.setStyle(estiloNormal)
    );
    quarteiroesSelecionados.clear();
    map.removeLayer(poligonoArea);
    poligonoArea = null;

    atualizarCalculos();
  }

  modoSelecao = !modoSelecao;
  toggleSelecao.textContent = modoSelecao
    ? 'Concluir'
    : 'Selecionar Área';

  if (!modoSelecao) {
    criarPoligonoArea();
    atualizarCalculos();
  }
};


fetch('data/quarteiroes.geojson')
  .then(r => r.json())
  .then(data => {
    L.geoJSON(data, {
      style: estiloNormal,
      onEachFeature: (feature, layer) => {

        layer.setStyle(estiloNormal);
        
        // 🔹 rótulo central
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

        // adiciona apenas se o zoom permitir
        if (map.getZoom() >= ZOOM_ROTULO) {
          rotulo.addTo(map);
        }
        
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

map.fire('zoomend');  

function atualizarCalculos() {
  let area = 0;
  let percurso = 0;

  quarteiroesSelecionados.forEach(layer => {
    const latlngs = layer.getLatLngs().flat(2);
  
    // área
    area += L.polygon(latlngs).getArea?.() || 0;
  
    // perímetro
    for (let i = 0; i < latlngs.length; i++) {
      const p1 = latlngs[i];
      const p2 = latlngs[(i + 1) % latlngs.length];
      //const distancia = p1.distanceTo(p2);
      // adiciona afastamento dos dois lados da rua
      //percurso += distancia + AFASTAMENTO_RUA;
      percurso += p1.distanceTo(p2);

    }
  });

  const FATOR_RUA = 1.15;
  percurso *= FATOR_RUA;

  const ha = area / 10000;
  const mHa = ha ? percurso / ha : 0;

  const vel = +velocidade.value;
  const vaz = +vazao.value;

  const tempo = vel ? percurso / ((vel * 1000) / 60) : 0;
  const consumo = (tempo * vaz) / 1000;

  //areaHa.textContent = ha.toFixed(2);
  kmTotal.textContent = (percurso / 1000).toFixed(2);
  //mHa.textContent = mHa.toFixed(0);
  tempoMin.textContent = tempo.toFixed(1);
  consumoL.textContent = consumo.toFixed(2);
}

//Criar o polígono final (borda grossa, sem preenchimento)
function criarPoligonoArea() {
  if (quarteiroesSelecionados.size < 2) return;

  let pontos = [];

  quarteiroesSelecionados.forEach(layer => {
    layer.getLatLngs().flat(2).forEach(p => pontos.push(p));
  });

  const hull = convexHull(pontos);

  if (poligonoArea) {
    map.removeLayer(poligonoArea);
  }

  poligonoArea = L.polygon(hull, {
    color: '#ff0000',
    weight: 4,
    fill: false
  }).addTo(map);
}

function cross(o, a, b) {
  return (a.lng - o.lng) * (b.lat - o.lat) -
         (a.lat - o.lat) * (b.lng - o.lng);
}

function convexHull(points) {
  points = points
    .map(p => ({ lat: p.lat, lng: p.lng }))
    .sort((a, b) => a.lng === b.lng ? a.lat - b.lat : a.lng - b.lng);

  const lower = [];
  for (const p of points) {
    while (lower.length >= 2 &&
           cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) {
      lower.pop();
    }
    lower.push(p);
  }

  const upper = [];
  for (let i = points.length - 1; i >= 0; i--) {
    const p = points[i];
    while (upper.length >= 2 &&
           cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) {
      upper.pop();
    }
    upper.push(p);
  }

  upper.pop();
  lower.pop();
  return lower.concat(upper);
}

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

velocidade.oninput = atualizarCalculos;
vazao.oninput = atualizarCalculos;
