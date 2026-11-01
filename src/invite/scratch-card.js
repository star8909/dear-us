// Gold foil over each date card that is scratched away with a finger or the
// mouse. Once most of the foil is gone the rest fades out by itself.

const BRUSH_RADIUS = 18;
const CLEARED_ENOUGH = 0.5;
// Every n-th pixel is sampled when measuring how much foil is left.
const SAMPLE_STEP = 8;

function paintFoil(canvas, context) {
  const { width, height } = canvas;
  const gradient = context.createLinearGradient(0, 0, width, height);
  gradient.addColorStop(0, '#d9c08a');
  gradient.addColorStop(0.45, '#f4e6c1');
  gradient.addColorStop(0.55, '#e8d29d');
  gradient.addColorStop(1, '#c5a565');
  context.globalCompositeOperation = 'source-over';
  context.fillStyle = gradient;
  context.fillRect(0, 0, width, height);
  context.fillStyle = 'rgba(90, 66, 24, 0.55)';
  context.font = `${Math.round(height * 0.12)}px Pretendard Variable, sans-serif`;
  context.textAlign = 'center';
  context.textBaseline = 'middle';
  context.fillText('긁어 보세요', width / 2, height / 2);
}

function clearedShare(canvas, context) {
  const { data } = context.getImageData(0, 0, canvas.width, canvas.height);
  let samples = 0;
  let clear = 0;
  for (let alpha = 3; alpha < data.length; alpha += 4 * SAMPLE_STEP) {
    samples += 1;
    if (data[alpha] === 0) clear += 1;
  }
  return clear / samples;
}

function setupCard(canvas) {
  const context = canvas.getContext('2d', { willReadFrequently: true });
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = Math.round(canvas.clientWidth * ratio);
  canvas.height = Math.round(canvas.clientHeight * ratio);
  paintFoil(canvas, context);

  let last = null;
  const scratchTo = (event) => {
    const box = canvas.getBoundingClientRect();
    const point = { x: (event.clientX - box.left) * ratio, y: (event.clientY - box.top) * ratio };
    context.globalCompositeOperation = 'destination-out';
    context.lineCap = 'round';
    context.lineWidth = BRUSH_RADIUS * 2 * ratio;
    context.beginPath();
    context.moveTo((last ?? point).x, (last ?? point).y);
    context.lineTo(point.x, point.y);
    context.stroke();
    last = point;
  };

  // A cleared foil leaves the tab order and the accessibility tree; inert also
  // drops focus if the foil still has it.
  const clear = () => {
    canvas.dataset.cleared = 'true';
    canvas.inert = true;
  };

  const finish = () => {
    last = null;
    if (clearedShare(canvas, context) >= CLEARED_ENOUGH) clear();
  };

  canvas.addEventListener('pointerdown', (event) => {
    canvas.setPointerCapture(event.pointerId);
    scratchTo(event);
  });
  canvas.addEventListener('pointermove', (event) => {
    if (canvas.hasPointerCapture(event.pointerId)) scratchTo(event);
  });
  canvas.addEventListener('pointerup', finish);
  canvas.addEventListener('pointercancel', finish);
  // Keyboard users reveal the card at once.
  canvas.tabIndex = 0;
  canvas.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    event.preventDefault();
    clear();
  });
}

export function setupScratchCards(canvases) {
  canvases.forEach(setupCard);
}
