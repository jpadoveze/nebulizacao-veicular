import { estado } from './estado.js';

export const map = L.map('map').setView([-21.9346, -50.5136], 16);

L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '© OpenStreetMap'
}).addTo(map);

map.on('zoomend', () => {
  const zoom = map.getZoom();
  estado.rotulos.forEach(r => {
    if (zoom >= estado.ZOOM_ROTULO) {
      if (!map.hasLayer(r)) r.addTo(map);
    } else {
      if (map.hasLayer(r)) map.removeLayer(r);
    }
  });
});
