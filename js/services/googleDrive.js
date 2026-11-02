// Вставь сюда свой Client ID
const CLIENT_ID = '677081725169-r7mgp2n4ogs1ur3nk9lh9h8t270rotcq.apps.googleusercontent.com';
const SCOPES = 'openid email profile https://www.googleapis.com/auth/drive.appdata';
const FILE_NAME = 'quest-progress.json';

let tokenClient;
let accessToken = null;

// Инициализация Google Identity Services
export function initGoogleDrive() {
    tokenClient = google.accounts.oauth2.initTokenClient({
        client_id: CLIENT_ID,
        scope: SCOPES,
        callback: (tokenResponse) => {
            if (tokenResponse && tokenResponse.access_token) {
                accessToken = tokenResponse.access_token;
                // Сохраняем токен, чтобы не логиниться при каждой перезагрузке
                localStorage.setItem('gdrive_token', accessToken);
                localStorage.setItem('gdrive_token_expiry', Date.now() + (tokenResponse.expires_in * 1000));

                // Сообщаем приложению, что вход выполнен
                window.dispatchEvent(new CustomEvent('gdrive_login_success'));
            }
        },
    });
}

// Проверка, есть ли валидный токен
export function isAuthenticated() {
  const savedToken = localStorage.getItem('gdrive_token');
  const expiry = localStorage.getItem('gdrive_token_expiry');

  // Если токен есть и время его жизни еще не вышло
  if (savedToken && expiry && Date.now() < parseInt(expiry)) {
    accessToken = savedToken;
    return true;
  }
  
  // Если токен истек - очищаем мусор
  localStorage.removeItem('gdrive_token');
  localStorage.removeItem('gdrive_token_expiry');
  return false;
}

// Вход
export function signIn() {
  if (!tokenClient) initGoogleDrive();
  
  // Если токен уже есть и он валидный - ничего не делаем
  if (isAuthenticated()) return;

  // prompt: '' позволяет Google не спрашивать разрешения повторно, если они уже даны
  tokenClient.requestAccessToken({ prompt: '' });
}

// Выход
export function signOut() {
  accessToken = null;
  localStorage.removeItem('gdrive_token');
  localStorage.removeItem('gdrive_token_expiry');
  window.dispatchEvent(new CustomEvent('gdrive_logout'));
}

function getValidToken() {
    if (accessToken) return accessToken;
    const saved = localStorage.getItem('gdrive_token');
    const expiry = localStorage.getItem('gdrive_token_expiry');
    if (saved && expiry && Date.now() < parseInt(expiry)) {
        accessToken = saved;
        return accessToken;
    }
    return null;
}

// Получение информации о пользователе (email)
export async function getUserInfo() {
  // Всегда берем токен из хранилища, игнорируя переменную accessToken
  const token = localStorage.getItem('gdrive_token');
  
  if (!token) {
    console.warn('Токен не найден в localStorage');
    return null;
  }

  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (res.status === 401) {
      console.error('Google отклонил токен (401). Возможно, он истек.');
      signOut(); // Очищаем мусор
      return null;
    }
    
    if (!res.ok) throw new Error('Ошибка получения данных пользователя');
    
    const data = await res.json();
    return data.email;
  } catch (error) {
    console.error('Ошибка в getUserInfo:', error);
    return null;
  }
}

// Поиск файла на Диске
async function findFile(token) {
    const res = await fetch(`https://www.googleapis.com/drive/v3/files?spaces=appDataFolder&q=name='${FILE_NAME}'`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    const data = await res.json();
    return data.files && data.files.length > 0 ? data.files[0].id : null;
}

// Сохранение данных на Диск
export async function saveToDrive(progressData) {
    const token = getValidToken();
    if (!token) throw new Error('Нет авторизации');

    const fileId = await findFile(token);
    const fileContent = JSON.stringify(progressData);

    if (fileId) {
        // Файл существует - обновляем (PATCH)
        const res = await fetch(`https://www.googleapis.com/upload/drive/v3/files/${fileId}?uploadType=media`, {
            method: 'PATCH',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: fileContent
        });
        if (res.status === 401) { signOut(); throw new Error('Токен истек'); }
        if (!res.ok) throw new Error('Ошибка обновления файла');
        return await res.json();
    } else {
        // Файла нет - создаем новый (POST)
        // Для создания в скрытой папке (appDataFolder) нужен multipart/related запрос
        const boundary = '-------314159265358979323846';
        const delimiter = "\r\n--" + boundary + "\r\n";
        const close_delim = "\r\n--" + boundary + "--";
        const metadata = { name: FILE_NAME, mimeType: 'application/json', parents: ['appDataFolder'] };

        const multipartRequestBody =
            delimiter + 'Content-Type: application/json\r\n\r\n' + JSON.stringify(metadata) +
            delimiter + 'Content-Type: application/json\r\n\r\n' + fileContent + close_delim;

        const res = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': `multipart/related; boundary="${boundary}"`
            },
            body: multipartRequestBody
        });
        if (res.status === 401) { signOut(); throw new Error('Токен истек'); }
        if (!res.ok) throw new Error('Ошибка создания файла');
        return await res.json();
    }
}

// Загрузка данных с Диска
export async function loadFromDrive() {
    const token = getValidToken();
    if (!token) throw new Error('Нет авторизации');

    const fileId = await findFile(token);
    if (!fileId) return null;

    const res = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`, {
        headers: { Authorization: `Bearer ${token}` }
    });
    if (res.status === 401) { signOut(); throw new Error('Токен истек'); }
    if (!res.ok) throw new Error('Ошибка чтения файла');
    return await res.json();
}