// Общий помощник для навигационной кнопки
export function makeNavButton({ label, total, done, isActive, onClick }) {
  const btn = document.createElement('button');
  btn.className = 'region-btn' + (isActive ? ' is-active' : '');
  btn.innerHTML = `
    <span class="region-btn__name">${label}</span>
    <span class="region-btn__progress">${done}/${total}</span>
  `;
  btn.addEventListener('click', onClick);
  return btn;
}