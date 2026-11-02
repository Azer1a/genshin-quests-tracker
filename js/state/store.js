import { saveToDrive } from '../services/googleDrive.js';

export const state = {
  page: 'home',
  category: null,
  region: null,
  tom: null,
  hero: null,
  completed: new Set(),
  
  driveConnected: false,
  driveEmail: null,
  driveLastSync: null,
  driveSyncing: false,
};

const STORAGE_KEY = 'genshin_quest_progress';
let syncTimeout = null;

export function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.completed = new Set(data.completed ?? []);
    state.driveLastSync = data.lastModified ?? null; // Восстанавливаем время
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
  state.driveLastSync = data.lastModified;
  return data;
}

export function toggleQuest(id) {
  if (state.completed.has(id)) {
    state.completed.delete(id);
  } else {
    state.completed.add(id);
  }
  
  // 1. Всегда сохраняем локально
  const data = saveProgress();

  // 2. Если подключен Google Drive — автосинхронизация с задержкой
  if (state.driveConnected) {
    if (syncTimeout) clearTimeout(syncTimeout);
    
    // Меняем статус на "Синхронизация..."
    state.driveSyncing = true; 
    window.dispatchEvent(new CustomEvent('force_render')); // Чтобы UI обновился
    
    syncTimeout = setTimeout(async () => {
      try {
        await saveToDrive(data);
        state.driveSyncing = false;
        state.driveLastSync = data.lastModified;
      } catch (e) {
        console.error('Ошибка автосинхронизации:', e);
        state.driveSyncing = false;
      } finally {
        // Обновляем UI после завершения
        window.dispatchEvent(new CustomEvent('force_render'));
      }
    }, 2000);
  }
}