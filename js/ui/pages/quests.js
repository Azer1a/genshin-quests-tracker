import { CATEGORIES } from '../../data/constants.js';
import { getCategoryMode } from '../../data/catalog.js';
import { state } from '../../state/store.js';
import { renderRegionMode } from '../quests/region.js';
import { renderTomMode } from '../quests/tom.js';
import { renderHeroMode } from '../quests/hero.js';
import { renderFlatMode } from '../quests/flat.js';

// Раздел «Квесты»
export function renderQuests(root) {
  if (!state.category) {
    root.innerHTML = `
      <h1 class="page-title">Квесты</h1>
      <p class="page-lead">Выбери категорию квестов в левом меню.</p>
    `;
    return;
  }

  const mode = getCategoryMode(state.category);
  const categoryLabel = CATEGORIES[state.category]?.label ?? state.category;

  if (mode === 'unknown') {
    root.innerHTML = `<p class="page-lead">Неизвестная категория: ${state.category}</p>`;
    return;
  }

  if (mode === 'region') return renderRegionMode(root, categoryLabel);
  if (mode === 'tom')    return renderTomMode(root, categoryLabel);
  if (mode === 'hero')   return renderHeroMode(root, categoryLabel);
  if (mode === 'flat')   return renderFlatMode(root, categoryLabel);
}