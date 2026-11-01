import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import './style.css';
import { CanvasRenderer } from './film/canvas-renderer.js';
import { FrameLoader } from './film/frame-loader.js';
import { SceneTrack } from './film/scene-track.js';
import { setupCalendar } from './invite/calendar.js';
import { setupClipboard } from './invite/clipboard.js';
import { setupCountdown } from './invite/countdown.js';
import { setupRsvp } from './invite/rsvp.js';
import { setupScratchCards } from './invite/scratch-card.js';

gsap.registerPlugin(ScrollTrigger, SplitText);

// Frames written by `npm run generate`, resolved at build time and grouped by
// clip in file-name order: src/assets/clips/<clip>/portrait/frame_0001.webp
const frameModules = import.meta.glob('./assets/clips/*/portrait/frame_*.webp', {
  eager: true,
  query: '?url',
  import: 'default',
});
const FRAMES = Object.keys(frameModules)
  .sort()
  .reduce((frames, key) => {
    const clip = key.split('/').at(-3);
    (frames[clip] ??= []).push(frameModules[key]);
    return frames;
  }, {});

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// One track per clip, in chapter order.
function createTracks(clipIds) {
  return clipIds.map((id) => {
    if (!FRAMES[id]) console.warn(`Clip "${id}" has no frames yet. Run: npm run generate`);
    return new SceneTrack(id, FRAMES[id] ?? [], 0.5);
  });
}

function setupSmoothScroll() {
  if (prefersReducedMotion) return null;

  const lenis = new Lenis({ anchors: true });
  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);
  return lenis;
}

function scrollToPosition(lenis, top, duration) {
  if (lenis) lenis.scrollTo(top, { duration });
  else window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}

// Each chapter spans 'top top' to 'bottom top', so the chapters tile the
// scroll without gaps. The last one ends at the bottom of the page instead,
// since its 'bottom top' may never be reached. A chapter is current from its
// first pixel, so a jump to a chapter's exact start shows that chapter.
function createChapterTriggers(chapters) {
  return chapters.map((chapter, index) =>
    ScrollTrigger.create({
      trigger: chapter,
      start: 'top top',
      end: index === chapters.length - 1 ? 'max' : 'bottom top',
    }),
  );
}

const currentChapter = (triggers) =>
  Math.max(0, triggers.findLastIndex((trigger) => trigger.scroll() >= trigger.start));

// Each clip chapter scrubs its clip; chapters after the last clip hold its
// final frame.
function createFilm(tracks, triggers, renderer) {
  // Draws the frame for `chapter` and returns the index of the clip shown.
  return (chapter) => {
    if (tracks.length === 0) return 0;
    const trackIndex = Math.min(chapter, tracks.length - 1);
    const progress = chapter < tracks.length ? triggers[chapter].progress : 1;
    renderer.draw(tracks[trackIndex].frameAt(progress));
    return trackIndex;
  };
}

// Shows one chapter's copy at a time, in the same place and over the same
// scroll range as its clip. Returns the per-frame update.
function setupChapters(chapters) {
  const copies = gsap.utils.toArray('[data-copy]');
  if (copies.length !== chapters.length) {
    throw new Error(`Found ${copies.length} [data-copy] blocks for ${chapters.length} chapters`);
  }

  gsap.set(copies.slice(1), { autoAlpha: 0 });

  const reveals = copies.map((copy) => {
    const parts = copy.querySelectorAll('.eyebrow, .chapter__body');
    const split = SplitText.create(copy.querySelector('[data-lines]'), {
      type: 'lines',
      mask: 'lines',
      autoSplit: true,
    });
    return () => {
      if (prefersReducedMotion) return;
      gsap.fromTo(split.lines, { yPercent: 100 }, { yPercent: 0, duration: 1.2, stagger: 0.1, ease: 'expo.out' });
      gsap.fromTo(parts, { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 1, stagger: 0.1, delay: 0.2, ease: 'power3.out' });
    };
  });

  let active = 0;
  reveals[0]();
  return (index) => {
    if (index === active) return;
    gsap.to(copies[active], { autoAlpha: 0, duration: 0.4, ease: 'power2.out', overwrite: true });
    gsap.to(copies[index], { autoAlpha: 1, duration: 0.4, ease: 'power2.out', overwrite: true });
    reveals[index]();
    active = index;
  };
}

// Tapping the sealed envelope plays the opening by scrolling through it to the
// couple; the hint fades out once the envelope starts to open.
function setupOpening(triggers, lenis) {
  const hint = document.querySelector('[data-open-hint]');
  const target = triggers[Math.min(2, triggers.length - 1)];
  hint.addEventListener('click', () => scrollToPosition(lenis, target.start, 3.2));
  gsap.to(hint, {
    autoAlpha: 0,
    ease: 'none',
    scrollTrigger: { trigger: '[data-clip]', start: 'top top', end: '10% top', scrub: true },
  });
}

// Sections after the film rise into view as they are reached.
function revealSections() {
  if (prefersReducedMotion) return;
  for (const section of gsap.utils.toArray('.section')) {
    gsap.from(section.children, {
      autoAlpha: 0,
      y: 24,
      duration: 1,
      stagger: 0.08,
      ease: 'power3.out',
      scrollTrigger: { trigger: section, start: 'top 80%', once: true },
    });
  }
}

async function init() {
  await document.fonts.ready;

  const chapters = gsap.utils.toArray('.chapter');
  const clipIds = chapters.map((chapter) => chapter.dataset.clip).filter(Boolean);
  const loader = new FrameLoader(createTracks(clipIds));
  const triggers = createChapterTriggers(chapters);
  const renderFilm = createFilm(
    loader.tracks,
    triggers,
    new CanvasRenderer(document.querySelector('[data-film]')),
  );
  loader.start();

  const lenis = setupSmoothScroll();
  const showChapter = setupChapters(chapters);
  gsap.ticker.add(() => {
    const chapter = currentChapter(triggers);
    loader.focus(renderFilm(chapter));
    showChapter(chapter);
  });
  setupOpening(triggers, lenis);

  const when = document.querySelector('[data-wedding]');
  const wedding = new Date(when.dataset.wedding);
  setupScratchCards(when.querySelectorAll('[data-scratch]'));
  setupCalendar(when.querySelector('[data-calendar]'), when.dataset.wedding);
  setupCountdown(when.querySelector('[data-countdown]'), wedding);
  setupClipboard(document, document.querySelector('[data-toast]'));
  setupRsvp(document.querySelector('.rsvp'));
  revealSections();
}

init();
