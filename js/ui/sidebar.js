import { CATEGORIES } from '../data/constants.js';
import { state } from '../state/store.js';

// Картинки для категорий квестов
const CATEGORY_ICONS = {
  world:   'assets/images/Icon_World_Quest.png',
  archon:  'assets/images/Icon_Archon_Quest.png',
  story:   'assets/images/Icon_Story_Quest.png',
  hangout: 'assets/images/Icon_Story_Quest.png', 
};

export function initSidebar(onNavigate) {
  // Кнопки Главная / Квесты / Настройки
  document.querySelectorAll('.sidebar__item[data-page]').forEach(btn => {
    btn.addEventListener('click', () => {
      const page = btn.dataset.page;
      if (page === 'quests') return; // для «Квестов» только раскрытие подменю
      state.page = page;
      state.category = null;
      state.region = null;
      state.tom = null;
      state.hero = null;
      onNavigate();
    });
  });

  // Родительская кнопка «Квесты» — раскрывает/скрывает подменю
  const questsBtn = document.querySelector('.sidebar__item--parent');
  if (!questsBtn) return;

  questsBtn.addEventListener('click', () => {
    document.querySelector('.sidebar__group').classList.toggle('is-open');
  });

  // Подменю категорий
  const submenu = document.getElementById('category-submenu');
  if (!submenu) return;
  submenu.innerHTML = '';

  Object.entries(CATEGORIES).forEach(([key, { label }]) => {
    const btn = document.createElement('button');
    btn.className = 'sidebar__item sidebar__item--child';

    const img = document.createElement('img');
    img.className = 'sidebar__icon';
    img.src = CATEGORY_ICONS[key] ?? '';
    img.alt = '';

    const span = document.createElement('span');
    span.textContent = label;

    btn.append(img, span);

    btn.addEventListener('click', () => {
      state.page = 'quests';
      state.category = key;
      state.region = null;
      state.tom = null;
      state.hero = null;
      onNavigate();
    });

    submenu.appendChild(btn);
  });
}