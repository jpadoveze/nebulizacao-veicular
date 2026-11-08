import { state } from './state.js';

export function atualizarCalculos() {
  const areaHa = document.getElementById('areaHa');
  const kmTotal = document.getElementById('kmTotal');
  const tempoMin = document.getElementById('tempoMin');
  const consumoL = document.getElementById('consumoL');
  const velocidade = document.getElementById('velocidade');
  const vazao = document.getElementById('vazao');

  let percurso = 0;

  state.quarteiroesSelecionados.forEach(layer => {
    const latlngs = layer.getLatLngs().flat(2);
    for (let i = 0; i < latlngs.length; i++) {
      percurso += latlngs[i].distanceTo(latlngs[(i + 1) % latlngs.length]);
    }
  });

  percurso *= 1.15; // Fator de correção de percurso

  if (!state.areaFinalFeature) {
    if (areaHa) areaHa.textContent = '—';
  }

  const vel = +velocidade.value || 0;
  const vaz = +vazao.value || 0;

  const tempo = vel ? percurso / ((vel * 1000) / 60) : 0;
  const consumo = (tempo * vaz) / 1000;

  if (kmTotal) kmTotal.textContent = (percurso / 1000).toFixed(2);
  if (tempoMin) tempoMin.textContent = `${Math.ceil(tempo)} min`;
  if (consumoL) consumoL.textContent = consumo.toFixed(2);
}
