import { initSidebar } from './ui/sidebar.js';
import { render } from './ui/render.js';
import { state, loadProgress } from './state/store.js';
import { isAuthenticated, getUserInfo, initGoogleDrive, loadFromDrive } from './services/googleDrive.js';

async function init() {
  loadProgress();
  initSidebar(render);
  initGoogleDrive();

  // Слушаем событие для перерисовки (например, при автосинхронизации)
  window.addEventListener('force_render', () => render());

  // 1. Проверяем, есть ли живой access_token
  if (isAuthenticated()) {
    state.driveConnected = true;
    const email = await getUserInfo();
    
    if (email) {
      state.driveEmail = email;
    } else {
      // Если email не получили (токен битый) - сбрасываем подключение
      state.driveConnected = false;
    }
    
    // Проверяем, есть ли данные на Диске, которые свежее локальных
    try {
      const cloudData = await loadFromDrive();
      if (cloudData && cloudData.lastModified) {
         const localRaw = localStorage.getItem('genshin_quest_progress');
         const localData = localRaw ? JSON.parse(localRaw) : { lastModified: 0 };
         
         if (cloudData.lastModified > (localData.lastModified || 0)) {
            const load = confirm('На Google Диске найдены более свежие данные. Загрузить их?');
            if (load) {
              localStorage.setItem('genshin_quest_progress', JSON.stringify(cloudData));
              state.completed = new Set(cloudData.completed);
              state.driveLastSync = cloudData.lastModified;
            }
         }
      }
    } catch (e) {
      console.warn('Не удалось проверить облако', e);
    }
  } 

  state.page = 'home';
  render();
}

init();