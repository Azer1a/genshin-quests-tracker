export function renderHome(root) {
  root.innerHTML = `
    <h1 class="page-title">Добро пожаловать!</h1>
    <p class="page-lead">
      Этот трекер поможет тебе отмечать пройденные квесты Genshin Impact
      и сохранять прогресс прямо в браузере.
    </p>
    <div class="home-cards">
      <div class="home-card">
        <h3>4 категории квестов</h3>
        <p>Архонта, Легенды, Мировые и Встречи - всё в одном месте.</p>
      </div>
      <div class="home-card">
        <h3>Локальное сохранение</h3>
        <p>Прогресс хранится в твоём браузере. Добавлена синхронизация с Google Drive, которая пока находится в тестировании</p>
      </div>
    </div>
  `;
}