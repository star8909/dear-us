// Copy buttons: [data-clipboard="text"] copies its text and [data-clipboard-url]
// copies the page address. The result is announced in the toast.

const TOAST_MS = 2200;

export function setupClipboard(root, toast) {
  let hideTimer;
  const announce = (message) => {
    toast.textContent = message;
    toast.dataset.visible = 'true';
    clearTimeout(hideTimer);
    hideTimer = setTimeout(() => {
      toast.dataset.visible = 'false';
    }, TOAST_MS);
  };

  const copy = async (text, done) => {
    try {
      await navigator.clipboard.writeText(text);
      announce(done);
    } catch (error) {
      console.error('Copy failed:', error);
      announce(`복사하지 못했어요. 직접 복사해 주세요: ${text}`);
    }
  };

  for (const button of root.querySelectorAll('[data-clipboard]')) {
    button.addEventListener('click', () => copy(button.dataset.clipboard, '복사했어요'));
  }
  for (const button of root.querySelectorAll('[data-clipboard-url]')) {
    button.addEventListener('click', () => copy(window.location.href, '청첩장 링크를 복사했어요'));
  }
}
