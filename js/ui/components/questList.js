import { REGIONS } from '../../data/constants.js';
import { getArchonQuests } from '../../data/catalog.js';
import { state, toggleQuest } from '../../state/store.js';

// Общая отрисовка списка квестов
export function renderQuestItems(container, quests, title, onToggle, isMeeting = false) {
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
      mainText = [quest.tom, quest.chapter, quest.name].filter(Boolean).join(' - ');
    } else if (quest.chapter) {
      mainText = `${quest.chapter} - ${quest.name}`;
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
          metaParts.push(`Идёт после: ${prev.tom}, ${prev.chapter ?? ''} - ${prev.name}`);
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