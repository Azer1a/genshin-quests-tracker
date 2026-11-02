import { state } from '../../state/store.js';
import {
  signIn,
  signOut,
  getUserInfo,
  saveToDrive,
  loadFromDrive,
} from '../../services/googleDrive.js';
import { render } from '../render.js';

export function renderSettings(root) {
  const isConnected = state.driveConnected ?? false;
  const userEmail = state.driveEmail ?? 'user@gmail.com';
  const lastSync = state.driveLastSync ?? null;

  root.innerHTML = `
    <h1 class="page-title">Настройки</h1>

    <section class="settings-section">
      <h2 class="settings-section__title">Синхронизация</h2>
      <p class="settings-section__lead">
        Подключите Google Drive, чтобы сохранять прогресс в облаке
        и открывать его с любого устройства.
      </p>

      ${isConnected
      ? renderDriveConnected(userEmail, lastSync)
      : renderDriveDisconnected()}
    </section>
  `;

  initSettingsHandlers();
}

function renderDriveDisconnected() {
  return `
    <div class="drive-card">
      <div class="drive-card__row">
        <p class="drive-card__text">
          Прогресс хранится только в этом браузере. Подключите Google Drive,
          чтобы не потерять его при очистке данных или переходе на другое устройство.
        </p>
      </div>
      <button class="btn btn--primary" id="drive-connect">
        <span class="btn__icon">☁</span>
        Подключить Google Drive
      </button>
    </div>
  `;
}

function renderDriveConnected(email, lastSync) {
  const dateText = lastSync
    ? formatDate(lastSync)
    : 'ещё не синхронизировалось';

  return `
    <div class="drive-card">
      <p class="drive-card__text">
        Quest Tracker использует данные приложения на вашем Google Диске
        для сохранения и синхронизации прогресса.
      </p>
      <p class="drive-card__text">
        Приложение может читать и записывать только те файлы, которые создало само.
      </p>

      <button class="btn btn--ghost" id="drive-disconnect">
        <span class="btn__icon">▲</span>
        Выйти из Google Диска
      </button>

      <div class="drive-field">
        <span class="drive-field__label">Адрес электронной почты:</span>
        <span class="drive-field__value" title="${email}">${email}</span>
      </div>

      <div class="drive-field">
        <span class="drive-field__label">Статус синхронизации:</span>
        ${state.driveSyncing 
          ? `<span class="drive-status">Синхронизация... ⏳</span>` 
          : `<span class="drive-status drive-status--ok">
               ${lastSync ? 'Синхронизировано' : 'Ожидает синхронизации'}
               <span>✓</span>
             </span>`
        }
      </div>

      <div class="drive-field">
        <span class="drive-field__label">Последняя синхронизация:</span>
        <span class="drive-field__value">${dateText}</span>
      </div>

      <button class="btn btn--primary" id="drive-sync-now">
        Синхронизировать сейчас
      </button>
    </div>
  `;
}

function initSettingsHandlers() {
  document.getElementById('drive-connect')?.addEventListener('click', () => {
    signIn();
  });

  document.getElementById('drive-disconnect')?.addEventListener('click', () => {
    signOut();
  });

  document.getElementById('drive-sync-now')?.addEventListener('click', async () => {
    await handleSync();
  });
}

// Обработчик успешного входа
window.addEventListener('gdrive_login_success', async () => {
  state.driveConnected = true;
  state.driveEmail = null;
  render();

  try {
    const email = await getUserInfo();
    if (email) state.driveEmail = email;
    render(); // Обновляем UI с реальной почтой

    const cloudData = await loadFromDrive();

    if (cloudData && cloudData.lastModified) {
      // Получаем локальные данные
      const localRaw = localStorage.getItem('genshin_quest_progress');
      const localData = localRaw ? JSON.parse(localRaw) : { lastModified: 0 };
      
      // Если в облаке данные свежее - спрашиваем пользователя
      if (cloudData.lastModified > (localData.lastModified || 0)) {
        if (confirm('На Google Диске найдены более свежие данные. Загрузить их?')) {
          localStorage.setItem('genshin_quest_progress', JSON.stringify(cloudData));
          state.completed = new Set(cloudData.completed);
          state.driveLastSync = cloudData.lastModified;
          render();
        }
      }
    }
  } catch (e) {
    console.error('Ошибка синхронизации при входе:', e);
  }
});

// Обработчик выхода
window.addEventListener('gdrive_logout', () => {
  state.driveConnected = false;
  state.driveEmail = null;
  render();
});

// Функция ручной синхронизации
async function handleSync() {
  state.driveSyncing = true;
  render();

  try {
    const localData = JSON.parse(localStorage.getItem('genshin_quest_progress') || '{}');
    localData.lastModified = Date.now();

    await saveToDrive(localData);

    // Обновляем локальное время
    localStorage.setItem('genshin_quest_progress', JSON.stringify(localData));
    state.driveLastSync = localData.lastModified;
  } catch (e) {
    alert('Ошибка синхронизации: ' + e.message);
  } finally {
    state.driveSyncing = false;
    render();
  }
}

function formatDate(ts) {
  const d = new Date(ts);
  return d.toLocaleString('ru-RU', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}