import { CATEGORIES, REGIONS } from '../data/constants.js';
import {
  getCategoryMode,
  getQuestsByRegion,
  getQuestsFlat,
  getRegionsForCategory,
  getArchonQuests,
  getTomsForArchon,
  getArchonQuestsByTom,
  getMeetingsByHero,
  getHeroesForMeetings,
} from '../data/catalog.js';
import { state, toggleQuest } from '../state/store.js';


export function render() {
  const root = document.getElementById('content');
  root.innerHTML = '';

  if (state.page === 'home')     return renderHome(root);
  if (state.page === 'settings') return renderSettings(root);
  if (state.page === 'quests')   return renderQuests(root);
}

function renderHome(root) {
  root.innerHTML = `
    <h1 class="page-title">Добро пожаловать!</h1>
    <p class="page-lead">
      Этот трекер поможет тебе отмечать пройденные квесты Genshin Impact
      и сохранять прогресс прямо в браузере.
    </p>
    <div class="home-cards">
      <div class="home-card">
        <h3>4 категории квестов</h3>
        <p>Архонта, Легенды, Мировые и Встречи — всё в одном месте.</p>
      </div>
      <div class="home-card">
        <h3>Локальное сохранение</h3>
        <p>Прогресс хранится в твоём браузере. Позже добавим синхронизацию с Google Drive.</p>
      </div>
    </div>
  `;
}

function renderSettings(root) {
  root.innerHTML = `
    <h1 class="page-title">Настройки</h1>
    <p class="page-lead">Скоро здесь появятся настройки синхронизации и внешнего вида.</p>
  `;
}

// Раздел «Квесты»
function renderQuests(root) {
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

  if (mode === 'region') {
    root.innerHTML = `
      <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
      <div class="quests-layout">
        <nav class="regions" id="regions-list"></nav>
        <section class="quests" id="quests-list"></section>
      </div>
    `;
    renderRegions();
    renderQuestListByRegion();
    return;
  }

  if (mode === 'tom') {
    root.innerHTML = `
      <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
      <div class="quests-layout">
        <nav class="regions" id="toms-list"></nav>
        <section class="quests" id="quests-list"></section>
      </div>
    `;
    renderToms();
    renderArchonList();
    return;
  }

  if (mode === 'hero') {
    root.innerHTML = `
      <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
      <div class="quests-layout">
        <nav class="regions" id="heroes-list"></nav>
        <section class="quests" id="quests-list"></section>
      </div>
    `;
    renderHeroes();
    renderMeetingsList();
    return;
  }

  if (mode === 'flat') {
    root.innerHTML = `
      <header class="content__header"><h1 class="page-title">${categoryLabel}</h1></header>
      <section class="quests" id="quests-list"></section>
    `;
    renderQuestListFlat();
  }
}

// Общий помощник для навигационной кнопки
function makeNavButton({ label, total, done, isActive, onClick }) {
  const btn = document.createElement('button');
  btn.className = 'region-btn' + (isActive ? ' is-active' : '');
  btn.innerHTML = `
    <span class="region-btn__name">${label}</span>
    <span class="region-btn__progress">${done}/${total}</span>
  `;
  btn.addEventListener('click', onClick);
  return btn;
}

// Режим «region» — мировые квесты
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
    container.innerHTML = `<p class="page-lead">Выбери регион слева.</p>`;
    return;
  }

  const quests = getQuestsByRegion(state.category, state.region);
  renderQuestItems(container, quests, REGIONS[state.region]?.label ?? state.region, () => {
    renderQuestListByRegion();
    renderRegions();
  });
}

// Режим «tom» — квесты Архонта
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

// Режим «flat» — легенды
function renderQuestListFlat() {
  const container = document.getElementById('quests-list');
  if (!container) return;

  const quests = getQuestsFlat(state.category);
  renderQuestItems(container, quests, 'Пройдено', () => {
    renderQuestListFlat();
  });
}

// Режим «hero» — встречи
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
    container.innerHTML = `<p class="page-lead">Выбери персонажа слева.</p>`;
    return;
  }

  const quests = getMeetingsByHero(state.hero);
  renderQuestItems(container, quests, state.hero, () => {
    renderMeetingsList();
    renderHeroes();
  }, /* isMeeting */ true);
}

// Общая отрисовка списка квестов
function renderQuestItems(container, quests, title, onToggle, isMeeting = false) {
  const total = quests.length;
  const done = quests.filter(q => state.completed.has(q.id)).length;

  container.innerHTML = `
    <div class="quests__header">
      <h2>${title}</h2>
      <span class="quests__progress">${done} / ${total}</span>
    </div>
    <ul class="quest-list"></ul>
  `;

  const list = container.querySelector('.quest-list');
  const allArchon = getArchonQuests();
  const isStory = state.category === 'story';

  quests.forEach(quest => {
    const li = document.createElement('li');
    li.className = 'quest' + (state.completed.has(quest.id) ? ' is-done' : '');

    // Левая часть текст
    const textWrap = document.createElement('div');
    textWrap.className = 'quest__text';

    const label = document.createElement('label');
    label.className = 'quest__label';
    label.htmlFor = `q_${quest.id}`;

    let mainText;
    if (isMeeting) {
      mainText = quest.ending;
    } else if (isStory) {
      mainText = [quest.tom, quest.chapter, quest.name].filter(Boolean).join(' — ');
    } else if (quest.chapter) {
      mainText = `${quest.chapter} — ${quest.name}`;
    } else {
      mainText = quest.name;
    }

    const mainSpan = document.createElement('span');
    mainSpan.className = 'quest__name';
    mainSpan.textContent = mainText;
    label.appendChild(mainSpan);
    textWrap.appendChild(label);

    // Подпись снизу
    const metaParts = [];

    if (isMeeting) {
      metaParts.push(`${quest.name} · ${quest.chapter}`);
    } else if (isStory) {
      if (quest.hero) metaParts.push(quest.hero);
    } else {
      if (quest.tom === 'Промежуточный том') {
        const idx = allArchon.findIndex(q => q.id === quest.id);
        const prev = idx > 0 ? allArchon[idx - 1] : null;
        if (prev) {
          metaParts.push(`Идёт после: ${prev.tom}, ${prev.chapter ?? ''} — ${prev.name}`);
        }
      }
      if (quest.region && quest.region !== 'interlude') {
        metaParts.push(REGIONS[quest.region]?.label ?? quest.region);
      }
    }

    if (metaParts.length) {
      const meta = document.createElement('div');
      meta.className = 'quest__meta';
      meta.textContent = metaParts.join(' · ');
      textWrap.appendChild(meta);
    }

    // Правая часть чекбокс 
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = `q_${quest.id}`;
    checkbox.className = 'quest__checkbox';
    checkbox.checked = state.completed.has(quest.id);
    checkbox.addEventListener('change', () => {
      toggleQuest(quest.id);
      onToggle();
    });

    li.append(textWrap, checkbox);
    list.appendChild(li);
  });
}