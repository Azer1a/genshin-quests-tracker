export const state = {
  page: 'home',
  category: null,
  region: null,
  tom: null,
  hero: null,
  completed: new Set(),
  
  // Заглушки Google Drive
  driveConnected: false,
  driveEmail: 'user@gmail.com',
  driveLastSync: null,
};

const STORAGE_KEY = 'genshin_quest_progress';

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.completed = new Set(data.completed ?? []);
  } catch (e) {
    console.warn('Не удалось прочитать прогресс', e);
  }
}

export function saveProgress() {
  const data = {
    completed: [...state.completed],
    lastModified: Date.now(),
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function toggleQuest(id) {
  if (state.completed.has(id)) {
    state.completed.delete(id);
  } else {
    state.completed.add(id);
  }
  saveProgress();
}