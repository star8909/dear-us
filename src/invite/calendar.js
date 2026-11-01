// Month calendar of the wedding with the day marked. The date is read from the
// local part of the ISO string ("2027-05-15T13:00:00+09:00"), so the calendar
// shows the venue's date wherever the guest is.

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function setupCalendar(container, isoDate) {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  // Date.UTC keeps the weekday arithmetic independent of the viewer's zone.
  const firstWeekday = new Date(Date.UTC(year, month - 1, 1)).getUTCDay();
  const daysInMonth = new Date(Date.UTC(year, month, 0)).getUTCDate();

  const table = document.createElement('table');
  table.className = 'calendar__table';
  table.createCaption().textContent = `${year}년 ${month}월`;

  const head = table.createTHead().insertRow();
  WEEKDAYS.forEach((name) => {
    const cell = document.createElement('th');
    cell.scope = 'col';
    cell.textContent = name;
    head.append(cell);
  });

  const body = table.createTBody();
  let row = body.insertRow();
  for (let blank = 0; blank < firstWeekday; blank++) row.insertCell();
  for (let date = 1; date <= daysInMonth; date++) {
    if (row.cells.length === 7) row = body.insertRow();
    const cell = row.insertCell();
    cell.textContent = String(date);
    if (date === day) {
      cell.className = 'calendar__day--wedding';
      cell.setAttribute('aria-label', `${month}월 ${date}일 결혼식`);
    }
  }
  while (row.cells.length < 7) row.insertCell();

  container.replaceChildren(table);
}
