import { getMeetingsByHero, getHeroesForMeetings } from '../../data/catalog.js';
import { state } from '../../state/store.js';
import { makeNavButton } from '../components/navButton.js';
import { renderQuestItems } from '../components/questList.js';
import { render } from '../render.js';

export function renderHeroMode(root, categoryLabel) {
  root.innerHTML = `
    <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
    <div class="quests-layout">
      <nav class="regions" id="heroes-list"></nav>
      <section class="quests" id="quests-list"></section>
    </div>
  `;
  renderHeroes();
  renderMeetingsList();
}

// Режим «hero» - встречи
function renderHeroes() {
  const container = document.getElementById('heroes-list');
  if (!container) return;

  const heroes = getHeroesForMeetings();
  container.innerHTML = '';
  heroes.forEach(hero => {
    const quests = getMeetingsByHero(hero);
    const total = quests.length;
    const done = quests.filter(q => state.completed.has(q.id)).length;

    container.appendChild(makeNavButton({
      label: hero,
      total,
      done,
      isActive: state.hero === hero,
      onClick: () => { state.hero = hero; render(); },
    }));
  });
}

function renderMeetingsList() {
  const container = document.getElementById('quests-list');
  if (!container) return;

  if (!state.hero) {
    container.innerHTML = `<p class="page-lead">Выбери персонажа.</p>`;
    return;
  }

  const quests = getMeetingsByHero(state.hero);
  renderQuestItems(container, quests, state.hero, () => {
    renderMeetingsList();
    renderHeroes();
  }, /* isMeeting */ true);
}