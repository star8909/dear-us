// Live countdown to the ceremony, refreshed every second. Once the ceremony
// has started the units stay at zero and the label changes.

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function setupCountdown(element, wedding) {
  const units = Object.fromEntries(
    [...element.querySelectorAll('[data-unit]')].map((unit) => [unit.dataset.unit, unit]),
  );
  const label = element.querySelector('.countdown__label');

  const render = () => {
    const left = Math.max(0, wedding.getTime() - Date.now());
    units.days.textContent = String(Math.floor(left / DAY));
    units.hours.textContent = String(Math.floor((left % DAY) / HOUR)).padStart(2, '0');
    units.minutes.textContent = String(Math.floor((left % HOUR) / MINUTE)).padStart(2, '0');
    units.seconds.textContent = String(Math.floor((left % MINUTE) / SECOND)).padStart(2, '0');
    if (left === 0) {
      label.textContent = '결혼식 날이 되었어요';
      clearInterval(timer);
    }
  };

  const timer = setInterval(render, SECOND);
  render();
}
