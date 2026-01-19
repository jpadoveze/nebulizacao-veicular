const areaHa = document.getElementById('areaHa');
const kmTotal = document.getElementById('kmTotal');
const tempoMin = document.getElementById('tempoMin');
const consumoL = document.getElementById('consumoL');
const velocidade = document.getElementById('velocidade');
const vazao = document.getElementById('vazao');

const spanExpandida = document.getElementById('spanExpandida');
const spanSemBuracos = document.getElementById('spanSemBuracos');
const spanRecontraida = document.getElementById('spanRecontraida');
const spanFinal = document.getElementById('spanFinal');

function atualizarCalculos() {

  let percurso = 0;

  quarteiroesSelecionados.forEach(layer => {
    const latlngs = layer.getLatLngs().flat(2);
    for (let i = 0; i < latlngs.length; i++) {
      percurso += latlngs[i].distanceTo(latlngs[(i + 1) % latlngs.length]);
    }
  });

  percurso *= 1.15;

  if (!areaFinalFeature) {
    areaHa.textContent = '—';
  }

  const vel = +velocidade.value || 0;
  const vaz = +vazao.value || 0;

  const tempo = vel ? percurso / ((vel * 1000) / 60) : 0;
  const consumo = (tempo * vaz) / 1000;

  kmTotal.textContent = (percurso / 1000).toFixed(2);
  tempoMin.textContent = tempo.toFixed(1);
  consumoL.textContent = consumo.toFixed(2);
}
