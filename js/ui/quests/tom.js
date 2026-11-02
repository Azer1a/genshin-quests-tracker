import { getTomsForArchon, getArchonQuestsByTom } from '../../data/catalog.js';
import { state } from '../../state/store.js';
import { makeNavButton } from '../components/navButton.js';
import { renderQuestItems } from '../components/questList.js';
import { render } from '../render.js';

export function renderTomMode(root, categoryLabel) {
  root.innerHTML = `
    <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
    <div class="quests-layout">
      <nav class="regions" id="toms-list"></nav>
      <section class="quests" id="quests-list"></section>
    </div>
  `;
  renderToms();
  renderArchonList();
}

// Режим «tom» - квесты Архонта
function renderToms() {
  const container = document.getElementById('toms-list');
  if (!container) return;

  const toms = getTomsForArchon();
  container.innerHTML = '';
  toms.forEach(tom => {
    const quests = getArchonQuestsByTom(tom);
    const total = quests.length;
    const done = quests.filter(q => state.completed.has(q.id)).length;

    container.appendChild(makeNavButton({
      label: tom === 'Промежуточный том' ? 'Промежуточные главы' : tom,
      total,
      done,
      isActive: state.tom === tom,
      onClick: () => { state.tom = tom; render(); },
    }));
  });
}

function renderArchonList() {
  const container = document.getElementById('quests-list');
  if (!container) return;

  if (!state.tom) {
    container.innerHTML = `<p class="page-lead">Выбери том слева.</p>`;
    return;
  }

  const quests = getArchonQuestsByTom(state.tom);
  renderQuestItems(container, quests, state.tom, () => {
    renderArchonList();
    renderToms();
  });
}