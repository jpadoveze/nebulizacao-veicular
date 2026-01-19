const btnNovo = document.getElementById('btnNovo');
const btnLimpar = document.getElementById('btnLimpar');
const btnInfo = document.getElementById('btnInfo');
const infoPanel = document.querySelector('.info');

btnNovo.onclick = () => {

  if (!modoSelecao) {
    modoSelecao = true;
    btnNovo.textContent = 'Concluir demarcação';
    return;
  }

  modoSelecao = false;
  btnNovo.textContent = 'Nova demarcação';

  setTimeout(() => {
    criarPoligonoArea();
    atualizarCalculos();
  }, 0);
};

btnLimpar.onclick = () => {
  quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
  quarteiroesSelecionados.clear();

  if (poligonoArea) {
    map.removeLayer(poligonoArea);
    poligonoArea = null;
    areaFinalFeature = null;
  }

  atualizarCalculos();
};

if (btnInfo && infoPanel) {
  btnInfo.onclick = () => infoPanel.classList.toggle('show');
}
