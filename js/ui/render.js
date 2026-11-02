import { state } from '../state/store.js';
import { renderHome } from './pages/home.js';
import { renderSettings } from './pages/settings.js';
import { renderQuests } from './pages/quests.js';

export function render() {
  const root = document.getElementById('content');
  root.innerHTML = '';

  if (state.page === 'home') return renderHome(root);
  if (state.page === 'settings') return renderSettings(root);
  if (state.page === 'quests') return renderQuests(root);
}