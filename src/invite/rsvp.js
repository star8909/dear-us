// Attendance form. This demo has no server, so a submitted reply is only
// summarised on the page and the page says that nothing was sent.

export function setupRsvp(section) {
  const form = section.querySelector('[data-rsvp]');
  const done = section.querySelector('[data-rsvp-done]');
  const summary = section.querySelector('[data-rsvp-summary]');

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    const data = new FormData(form);
    const name = data.get('name').trim();
    summary.textContent =
      data.get('attending') === '참석'
        ? `${data.get('side')} ${name} 님, ${data.get('guests')}명 참석으로 받았어요. 그날 뵐게요!`
        : `${data.get('side')} ${name} 님, 마음만으로도 감사해요.`;
    form.hidden = true;
    done.hidden = false;
  });

  section.querySelector('[data-rsvp-edit]').addEventListener('click', () => {
    done.hidden = true;
    form.hidden = false;
  });
}
