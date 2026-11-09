import { REGIONS } from '../../data/constants.js';
import { getQuestsByRegion, getRegionsForCategory } from '../../data/catalog.js';
import { state } from '../../state/store.js';
import { makeNavButton } from '../components/navButton.js';
import { renderQuestItems } from '../components/questList.js';
import { render } from '../render.js';

export function renderRegionMode(root, categoryLabel) {
  root.innerHTML = `
    <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
    <div class="quests-layout">
      <nav class="regions" id="regions-list"></nav>
      <section class="quests" id="quests-list"></section>
    </div>
  `;
  renderRegions();
  renderQuestListByRegion();
}

// Режим «region» - мировые квесты
function renderRegions() {
  const container = document.getElementById('regions-list');
  if (!container) return;

  const regionKeys = getRegionsForCategory(state.category);
  regionKeys.sort((a, b) => (REGIONS[a]?.order ?? 999) - (REGIONS[b]?.order ?? 999));

  container.innerHTML = '';
  regionKeys.forEach(key => {
    const quests = getQuestsByRegion(state.category, key);
    const total = quests.length;
    const done = quests.filter(q => state.completed.has(q.id)).length;

    container.appendChild(makeNavButton({
      label: REGIONS[key]?.label ?? key,
      total,
      done,
      isActive: state.region === key,
      onClick: () => { state.region = key; render(); },
    }));
  });
}

function renderQuestListByRegion() {
  const container = document.getElementById('quests-list');
  if (!container) return;

  if (!state.region) {
    container.innerHTML = `<p class="page-lead">Выбери регион.</p>`;
    return;
  }

  const quests = getQuestsByRegion(state.category, state.region);
  renderQuestItems(container, quests, REGIONS[state.region]?.label ?? state.region, () => {
    renderQuestListByRegion();
    renderRegions();
  });
}