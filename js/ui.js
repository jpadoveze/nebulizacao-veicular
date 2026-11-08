import { state } from './state.js';
import { map } from './map.js';
import { estiloNormal } from './selecao.js';
import { criarPoligonoArea } from './area.js';
import { atualizarCalculos } from './calculos.js';

export function inicializarUI() {
  const btnNovo = document.getElementById('btnNovo');
  const btnLimpar = document.getElementById('btnLimpar');
  const btnInfo = document.getElementById('btnInfo');
  const infoPanel = document.querySelector('.info');

  if (btnNovo) {
    btnNovo.onclick = () => {
      if (!state.modoSelecao) {
        state.modoSelecao = true;
        btnNovo.textContent = 'Concluir demarcação';
        return;
      }

      state.modoSelecao = false;
      btnNovo.textContent = 'Nova demarcação';

      setTimeout(() => {
        criarPoligonoArea();
        atualizarCalculos();
      }, 0);
    };
  }

  if (btnLimpar) {
    btnLimpar.onclick = () => {
      state.quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
      state.quarteiroesSelecionados.clear();

      if (state.poligonoArea) {
        map.removeLayer(state.poligonoArea);
        state.poligonoArea = null;
        state.areaFinalFeature = null;
      }

      atualizarCalculos();
    };
  }

  if (btnInfo && infoPanel) {
    btnInfo.onclick = () => infoPanel.classList.toggle('show');
  }
}
