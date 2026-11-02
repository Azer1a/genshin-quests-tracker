import { getQuestsFlat } from '../../data/catalog.js';
import { state } from '../../state/store.js';
import { renderQuestItems } from '../components/questList.js';

export function renderFlatMode(root, categoryLabel) {
  root.innerHTML = `
    <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
    <section class="quests" id="quests-list"></section>
  `;
  renderQuestListFlat();
}

// Режим «flat» - легенды
function renderQuestListFlat() {
  const container = document.getElementById('quests-list');
  if (!container) return;

  const quests = getQuestsFlat(state.category);
  renderQuestItems(container, quests, 'Пройдено', () => {
    renderQuestListFlat();
  });
}