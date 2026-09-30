import { initSidebar } from './ui/sidebar.js';
import { render } from './ui/render.js';
import { state, loadProgress } from './state/store.js';

function init() {
  loadProgress();

  initSidebar(render);

  // Стартовая страница
  state.page = 'home';
  render();
}

init();