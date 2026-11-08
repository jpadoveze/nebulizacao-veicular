import './map.js';
import { inicializarQuarteiroes } from './selecao.js';
import { inicializarUI } from './ui.js';
import { inicializarIO } from './exportacao.js';

document.addEventListener('DOMContentLoaded', () => {
  inicializarQuarteiroes();
  inicializarUI();
  inicializarIO();
});