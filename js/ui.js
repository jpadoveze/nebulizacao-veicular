import { estado } from './estado.js';
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
      if (!estado.modoSelecao) {
        estado.modoSelecao = true;
        btnNovo.textContent = 'Concluir demarcação';
        return;
      }

      estado.modoSelecao = false;
      btnNovo.textContent = 'Nova demarcação';

      setTimeout(() => {
        criarPoligonoArea();
        atualizarCalculos();
      }, 0);
    };
  }

  if (btnLimpar) {
    btnLimpar.onclick = () => {
      estado.quarteiroesSelecionados.forEach(l => l.setStyle(estiloNormal));
      estado.quarteiroesSelecionados.clear();

      if (estado.poligonoArea) {
        map.removeLayer(estado.poligonoArea);
        estado.poligonoArea = null;
        estado.areaFinalFeature = null;
      }

      atualizarCalculos();
    };
  }

  if (btnInfo && infoPanel) {
    btnInfo.onclick = () => infoPanel.classList.toggle('show');
  }
}
