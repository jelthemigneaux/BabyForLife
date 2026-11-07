/* Nieuwe echo? Zet de foto naast index.html en vul bij de juiste rij `image` en `date` in; `meta` is optioneel.
   `video` speelt af bij klikken, `scratch: true` maakt er een kraskaart van en `status` verschijnt na het krassen. */
const ECHOS = [
  { date: '12 oktober 2026', meta: '8 weken en 4 dagen', image: 'echo-01.jpg' },
  { date: '6 november 2026', meta: '12 weken en 1 dag', image: 'echo-02.jpg', video: 'echo-02.mp4', scratch: true },
  { date: '± eind december 2026', meta: 'Rond 20 weken' },
  { date: '± februari 2027', meta: 'Rond 26 weken' },
  { date: '± maart 2027', meta: 'Rond 30 weken' },
  { date: '± april 2027', meta: 'Rond 36 weken' },
];

const $ = (id) => document.getElementById(id);

/* ---------- Lightbox ---------- */
const lightbox = $('lightbox');
const lightboxVideo = $('lightboxVideo');
function openLightbox(src, caption, video) {
  $('lightboxImg').hidden = !!video;
  lightboxVideo.hidden = !video;
  if (video) {
    lightboxVideo.poster = src;
    lightboxVideo.src = video;
  } else {
    $('lightboxImg').src = src;
  }
  $('lightboxCaption').textContent = caption;
  lightbox.showModal();
  if (video) lightboxVideo.play().catch(() => {});
}
lightbox.addEventListener('close', () => {
  lightboxVideo.pause();
  lightboxVideo.removeAttribute('src');
  lightboxVideo.load();
});
$('lightboxClose').addEventListener('click', () => lightbox.close());
lightbox.addEventListener('click', (e) => { if (e.target === lightbox) lightbox.close(); });
$('echo').addEventListener('click', () => openLightbox('echo-01.jpg', '12 oktober 2026'));

/* ---------- Echo-overzicht ---------- */
const rail = $('rail');
ECHOS.forEach((echo, i) => {
  const card = document.createElement('article');
  card.className = 'card' + (echo.image && !echo.scratch ? ' card--done' : '');
  const play = '<span class="card__play" aria-hidden="true"><svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M8 5.5v13l11-6.5z"/></svg></span>';
  const check = '<svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" stroke-width="3.2" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12.5l4.5 4.5L19 7.5"/></svg>';
  const label = `${echo.video ? 'Video van echo' : 'Echo'} ${i + 1} openen`;
  const media = echo.image
    ? `<div class="card__media">
        <button class="card__open" type="button" aria-label="${label}"${echo.scratch ? ' tabindex="-1"' : ''}><img src="${echo.image}" alt="Echo ${i + 1}, ${echo.date}" loading="lazy">${echo.video ? play : ''}</button>
        ${echo.status ? `<span class="card__badge"><span class="card__check">${check}</span>${echo.status}</span>` : ''}
        ${echo.scratch ? `<canvas class="card__scratch" tabindex="0" role="button" aria-label="Kras echo ${i + 1} open"></canvas>` : ''}
      </div>`
    : `<div class="card__media"><div class="card__foil" aria-hidden="true">?</div></div>`;
  const tag = (open) => `Echo ${i + 1}${!echo.image ? ' · nog te krassen' : open ? '' : ' · kras om te openen'}`;
  card.innerHTML = `${media}
    <div class="card__body">
      <p class="card__tag">${tag(!echo.scratch)}</p>
      <p class="card__date">${echo.date}</p>
      <p class="card__meta">${echo.meta || ''}</p>
    </div>`;
  if (echo.image) {
    const caption = echo.status ? `${echo.date} · ${echo.status.toLowerCase()}` : echo.date;
    card.querySelector('.card__open').addEventListener('click', () => openLightbox(echo.image, caption, echo.video));
  }
  if (echo.scratch) {
    makeScratch(card.querySelector('.card__scratch'), () => {
      card.classList.add('card--done');
      card.querySelector('.card__tag').textContent = tag(true);
      card.querySelector('.card__open').removeAttribute('tabindex');
      const r = card.querySelector('.card__media').getBoundingClientRect();
      confetti.at(r.left + r.width / 2, r.top + r.height / 2);
    });
  }
  rail.appendChild(card);
});
function updateCount() {
  const card = rail.firstElementChild;
  const step = card.offsetWidth + 14;
  const atEnd = rail.scrollLeft + rail.clientWidth >= rail.scrollWidth - 4;
  const current = atEnd ? ECHOS.length : Math.min(ECHOS.length, Math.round(rail.scrollLeft / step) + 1);
  $('railCount').textContent = `${current} / ${ECHOS.length}`;
}
rail.addEventListener('scroll', updateCount, { passive: true });
updateCount();

/* ---------- Confetti ---------- */
const confetti = (() => {
  const canvas = $('confetti');
  const ctx = canvas.getContext('2d');
  const colors = ['#ff6fb5', '#ffc2e0', '#4fb3ff', '#bde6ff', '#ffffff', '#b79cff', '#e3d8ff'];
  let parts = [];
  let running = false;
  let dpr = 1;
  function size() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = innerWidth * dpr;
    canvas.height = innerHeight * dpr;
  }
  addEventListener('resize', size);
  size();
  function burst(x, y, count, angle, spread, speed) {
    for (let i = 0; i < count; i++) {
      const a = angle + (Math.random() - 0.5) * spread;
      const v = speed * (0.45 + Math.random() * 0.75);
      parts.push({
        x, y,
        vx: Math.cos(a) * v, vy: Math.sin(a) * v,
        w: 5 + Math.random() * 7, h: 4 + Math.random() * 9,
        round: Math.random() < 0.25,
        color: colors[(Math.random() * colors.length) | 0],
        rot: Math.random() * 6.28, spin: (Math.random() - 0.5) * 0.3,
        flip: Math.random() * 6.28, flipSpeed: 0.08 + Math.random() * 0.2,
        life: 1,
      });
    }
    if (!running) { running = true; requestAnimationFrame(tick); }
  }
  function tick() {
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, innerWidth, innerHeight);
    parts = parts.filter((p) => p.y < innerHeight + 30 && p.life > 0);
    for (const p of parts) {
      p.vx *= 0.985; p.vy = p.vy * 0.985 + 0.2;
      p.x += p.vx + Math.sin(p.flip) * 0.7; p.y += p.vy;
      p.rot += p.spin; p.flip += p.flipSpeed; p.life -= 0.0035;
      ctx.save();
      ctx.globalAlpha = Math.min(1, p.life * 3);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.scale(1, Math.cos(p.flip));
      ctx.fillStyle = p.color;
      if (p.round) { ctx.beginPath(); ctx.arc(0, 0, p.w / 2, 0, 6.29); ctx.fill(); }
      else ctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx.restore();
    }
    if (parts.length) requestAnimationFrame(tick);
    else { running = false; ctx.clearRect(0, 0, innerWidth, innerHeight); }
  }
  return {
    fire() {
      const W = innerWidth, H = innerHeight, power = Math.max(15, H / 42);
      burst(0, H * 0.82, 110, -1.05, 0.75, power);
      burst(W, H * 0.82, 110, -2.09, 0.75, power);
      burst(W / 2, H * 0.42, 130, -1.57, 6.28, power * 0.62);
    },
    rain() {
      const W = innerWidth;
      for (let i = 0; i < 7; i++) burst(Math.random() * W, -20, 12, 1.57, 0.8, 4);
    },
    at(x, y) {
      burst(x, y, 70, -1.57, 6.28, 9);
    },
  };
})();

/* ---------- Scroll-scène ---------- */
const canAnimate = window.gsap && window.ScrollTrigger && !matchMedia('(prefers-reduced-motion: reduce)').matches;
if (canAnimate) initScene();

/* Laadscherm weg zodra de letters, echo en lettertypes klaar zijn, of na maximaal 2,5 seconden. */
const ready = [...document.querySelectorAll('#baby img, #mig img, #echo img')].map((img) => img.decode().catch(() => {}));
if (document.fonts) ready.push(document.fonts.ready);
Promise.race([Promise.all(ready), new Promise((done) => setTimeout(done, 2500))])
  .then(() => document.documentElement.classList.remove('is-loading'));

function initScene() {
  document.documentElement.classList.add('anim');
  gsap.registerPlugin(ScrollTrigger);
  ScrollTrigger.config({ ignoreMobileResize: true });
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  scrollTo(0, 0);

  /* Datum per teken, voor het gokkast-effect. */
  const dateValue = $('dateValue');
  const text = dateValue.textContent;
  dateValue.setAttribute('aria-label', text);
  dateValue.innerHTML = [...text].map((c) => `<span class="ch" aria-hidden="true">${c}</span>`).join('');

  const foil = makeFoil($('foil'));

  const stage = $('stage'), logos = $('logos');
  const logosOffset = () => stage.offsetHeight / 2 - (logos.offsetTop + logos.offsetHeight / 2);

  gsap.set(['#word2', '#word3'], { xPercent: -50, yPercent: -50, autoAlpha: 0 });
  gsap.set(['#ribbon', '#dateLabel', '#dateNote'], { autoAlpha: 0 });

  const tl = gsap.timeline({ paused: true, defaults: { ease: 'none' } });

  /* 1. Krassen: de eerste drie schermen scrollen */
  tl.to(foil, { progress: 1, duration: 3, onUpdate: foil.draw }, 0);
  tl.addLabel('words', 3);
  tl.to('#foil', { autoAlpha: 0, duration: 0.25 }, 2.85);
  tl.to(['#prompt', '.intro .eyebrow'], { autoAlpha: 0, y: -24, duration: 0.4, ease: 'power2.in' }, 3);
  tl.to('#ticket', { backgroundColor: 'rgba(0,0,0,0)', boxShadow: '0 0 0 0 rgba(240,203,116,0)', background: 'none', duration: 0.4 }, 3);
  tl.to('#word1', { scale: 1.35, duration: 0.5, ease: 'power2.out' }, 3);

  /* 2. U... hebt... gewonnen... */
  tl.to('#word1', { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' }, 4);
  tl.fromTo('#word2', { y: 70, filter: 'blur(10px)', scale: 0.85 }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.4, ease: 'power3.out' }, 4.3);
  tl.to('#word2', { autoAlpha: 0, y: -60, filter: 'blur(10px)', duration: 0.35, ease: 'power2.in' }, 5);
  tl.fromTo('#word3', { y: 70, filter: 'blur(10px)', scale: 0.8 }, { autoAlpha: 1, y: 0, filter: 'blur(0px)', scale: 1, duration: 0.45, ease: 'power3.out' }, 5.3);
  tl.to('#word3', { scale: 1.08, duration: 0.7 }, 5.75);
  tl.to('#word3', { autoAlpha: 0, scale: 1.5, filter: 'blur(14px)', duration: 0.4, ease: 'power2.in' }, 6.45);

  /* 3. Baby vliegt links binnen */
  const tBaby = 7;
  gsap.set(logos, { y: logosOffset(), scale: 1.08 });
  tl.fromTo('#baby', { x: '-130vw', rotation: -26, scale: 0.55 }, { x: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'back.out(1.5)' }, tBaby);
  tl.to('#glowBlue', { opacity: 1, duration: 1.1 }, tBaby);

  /* 4. Migneaux vliegt rechts binnen, met extra scrollafstand ervoor */
  const tMig = 9.1;
  tl.fromTo('#mig', { x: '130vw', rotation: 20, scale: 0.55 }, { x: 0, rotation: 0, scale: 1, duration: 1.1, ease: 'back.out(1.5)' }, tMig);
  tl.to('#glowPink', { opacity: 1, duration: 1.1 }, tMig);

  /* 5. De echo komt van onder, de datum er meteen achteraan */
  const tEcho = 10.25;
  tl.fromTo('#echo', { y: '105vh', rotation: -8, rotationX: 38, scale: 0.82, transformPerspective: 900 }, { y: 0, rotation: 0, rotationX: 0, scale: 1, duration: 1.2, ease: 'expo.out' }, tEcho);
  tl.to(logos, { y: 0, scale: 1, duration: 0.9, ease: 'power3.inOut' }, tEcho);
  tl.to('#glowViolet', { opacity: 0.75, duration: 1.2 }, tEcho);
  const tDate = tEcho + 1.2;
  tl.to('#dateLabel', { autoAlpha: 1, duration: 0.15 }, tDate);
  tl.fromTo('#dateValue .ch', { yPercent: 115, rotationX: -85, opacity: 0 }, { yPercent: 0, rotationX: 0, opacity: 1, duration: 0.3, stagger: 0.03, ease: 'back.out(2)' }, tDate);

  /* 6. Prijsmoment */
  const tWin = tDate + 0.65;
  tl.to('#hint', { autoAlpha: 0, duration: 0.2 }, tWin - 0.2);
  tl.to({}, { duration: 0.2 }, tWin);

  let won = false;
  tl.eventCallback('onUpdate', () => {
    const t = tl.time();
    if (t >= tWin && !won) { won = true; win(); }
    else if (t < tWin - 0.25 && won) { won = false; unwin(); }
  });

  /* Stops: drie keer krassen, U, hebt, gewonnen, Baby en het prijsmoment. Migneaux, echo en datum spelen vanzelf na de veeg vanaf Baby.
     Elke stop ligt precies een scherm verder, zodat een korte veeg altijd de volgende haalt. */
  const stops = [0, 1, 2, 3.7, 4.7, 6, tBaby + 1.15, tWin + 0.1];
  const unit = CSS.supports('height', '1svh') ? 'svh' : 'vh';
  $('track').style.height = stops.length * 100 + unit;
  stops.forEach((_, i) => {
    const stop = document.createElement('div');
    stop.className = 'snap';
    stop.style.top = i * 100 + unit;
    $('track').appendChild(stop);
  });
  const babyStop = stops.length - 2;
  let held = false, target = 0;
  const timeAt = (s) => {
    const i = Math.min(Math.floor(s), stops.length - 2);
    return stops[i] + (stops[i + 1] - stops[i]) * (s - i);
  };
  ScrollTrigger.create({
    trigger: '#track',
    start: 'top top',
    end: 'bottom bottom',
    onUpdate(self) {
      const s = self.progress * (stops.length - 1);
      /* Pas blokkeren als de veeg na Baby bijna is aangekomen: eerder zou de vinger de veeg zelf tegenhouden. */
      if (s <= babyStop + 0.01) held = false;
      else if (!held && self.direction > 0 && s >= babyStop + 0.9) { held = true; holdScroll(3400); }
      /* De veeg na Baby start de hele reeks: Migneaux, echo en datum wachten niet op verder scrollen. */
      const leavingBaby = self.direction > 0 && s > babyStop + 0.06;
      const t = leavingBaby ? stops[stops.length - 1] : timeAt(s);
      if (t === target) return;
      target = t;
      /* Grotere stappen krijgen meer tijd, zodat Migneaux, echo en datum na elkaar te zien zijn. */
      const distance = Math.abs(t - tl.time());
      const duration = gsap.utils.clamp(0.5, 3, distance * 0.42);
      gsap.to(tl, { time: t, duration, ease: distance > 2 ? 'none' : 'sine.out', overwrite: true });
    },
  });
  /* Pas aan zodra alle stops bestaan, anders springt de browser naar de enige stop die er al is. */
  scrollTo(0, 0);
  document.documentElement.classList.add('snapping');

  /* Gebeurt op tijd, niet op scroll: dit moet altijd helemaal afspelen. */
  let winTl;
  function win() {
    confetti.fire();
    $('echo').classList.add('is-shining');
    winTl = gsap.timeline()
      .fromTo('#flash', { opacity: 0.95 }, { opacity: 0, duration: 1.1, ease: 'power2.out' }, 0)
      .to('#rays', { opacity: 1, duration: 1.2, ease: 'power2.out' }, 0)
      .fromTo('#ribbon', { autoAlpha: 0, scale: 0.5, y: 20 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.7, ease: 'back.out(2.4)' }, 0.1)
      .to('#dateNote', { autoAlpha: 1, duration: 0.5 }, 0.5)
      .fromTo('.pop', { scale: 1 }, { scale: 1.12, duration: 0.24, ease: 'sine.out', yoyo: true, repeat: 3, stagger: 0.09 }, 0)
      .fromTo('#echo', { boxShadow: '0 0 0 1px rgba(255,255,255,.34), 0 0 0 rgba(255,127,191,0)' }, { boxShadow: '0 0 0 2px rgba(255,255,255,1), 0 0 44px rgba(255,127,191,.7)', duration: 0.6, yoyo: true, repeat: 1 }, 0.1)
      .fromTo('#dateValue .ch', { backgroundPosition: '0% 0' }, { backgroundPosition: '100% 0', duration: 1.8, ease: 'sine.inOut', stagger: 0.03 }, 0.2)
      .call(() => confetti.fire(), null, 0.9)
      .call(() => confetti.rain(), null, 1.7)
      .call(() => confetti.rain(), null, 2.5);
  }
  function unwin() {
    if (winTl) winTl.kill();
    $('echo').classList.remove('is-shining');
    gsap.to('#rays', { opacity: 0, duration: 0.4 });
    gsap.to(['#ribbon', '#dateNote'], { autoAlpha: 0, duration: 0.3 });
    gsap.set('.pop', { scale: 1 });
  }

  addEventListener('resize', () => { foil.resize(); foil.draw(); });
}

/* Houdt het scrollen even tegen, zodat het prijsmoment helemaal gezien wordt. */
function holdScroll(ms) {
  const block = (e) => { if (e.cancelable) e.preventDefault(); };
  const keys = (e) => { if ([' ', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', 'End', 'Home'].includes(e.key)) e.preventDefault(); };
  addEventListener('wheel', block, { passive: false });
  addEventListener('touchmove', block, { passive: false });
  addEventListener('keydown', keys);
  setTimeout(() => {
    removeEventListener('wheel', block);
    removeEventListener('touchmove', block);
    removeEventListener('keydown', keys);
  }, ms);
}

/* Zilverfolie die langs een zigzag wordt weggekrast, gestuurd door `progress`. */
function makeFoil(canvas) {
  const ctx = canvas.getContext('2d');
  const sheet = document.createElement('canvas');
  const state = { progress: 0, draw, resize };
  let W = 0, H = 0, points = [], total = 0;

  function resize() {
    const r = canvas.getBoundingClientRect();
    if (!r.width) return;
    const dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = sheet.width = W * dpr;
    canvas.height = sheet.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const s = sheet.getContext('2d');
    s.setTransform(dpr, 0, 0, dpr, 0, 0);
    const g = s.createLinearGradient(0, 0, W, H);
    [['#8e8fa8', 0], ['#e4e5ee', 0.2], ['#a2a3ba', 0.38], ['#f4f4f9', 0.55], ['#9c9db4', 0.74], ['#dadbe6', 1]].forEach(([c, o]) => g.addColorStop(o, c));
    s.fillStyle = g;
    s.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 26; i++) {
      s.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(40,35,90,.08)';
      s.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
    }
    s.fillStyle = 'rgba(35,30,75,.5)';
    s.font = `800 ${Math.round(H * 0.13)}px Manrope, system-ui, sans-serif`;
    s.textAlign = 'center';
    s.textBaseline = 'middle';
    const row = '★  KRAS HIER  ★  KRAS HIER  ★';
    s.fillText(row, W / 2, H * 0.28);
    s.fillText(row, W / 2, H * 0.72);

    points = [];
    const n = 8;
    for (let i = 0; i <= n; i++) {
      const x = W * (0.02 + 0.96 * (i / n));
      points.push([x, i % 2 ? H * 1.05 : -H * 0.05]);
    }
    total = 0;
    for (let i = 1; i < points.length; i++) total += Math.hypot(points[i][0] - points[i - 1][0], points[i][1] - points[i - 1][1]);
    draw();
  }

  function draw() {
    if (!W) return;
    ctx.globalCompositeOperation = 'source-over';
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(sheet, 0, 0, W, H);
    if (state.progress <= 0) return;

    let remaining = total * state.progress, tip = points[0];
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = W / 7.2;
    ctx.beginPath();
    ctx.moveTo(points[0][0], points[0][1]);
    for (let i = 1; i < points.length && remaining > 0; i++) {
      const [ax, ay] = points[i - 1], [bx, by] = points[i];
      const len = Math.hypot(bx - ax, by - ay), f = Math.min(1, remaining / len);
      tip = [ax + (bx - ax) * f, ay + (by - ay) * f];
      ctx.lineTo(tip[0], tip[1]);
      remaining -= len;
    }
    ctx.stroke();
    ctx.globalCompositeOperation = 'source-over';

    /* Het muntje dat krast */
    if (state.progress < 0.98) {
      const R = H * 0.15, x = Math.min(W - R, Math.max(R, tip[0])), y = Math.min(H - R, Math.max(R, tip[1]));
      const coin = ctx.createRadialGradient(x - R * 0.35, y - R * 0.4, R * 0.1, x, y, R);
      coin.addColorStop(0, '#fff4cf'); coin.addColorStop(0.55, '#f0cb74'); coin.addColorStop(1, '#b5852e');
      ctx.fillStyle = coin;
      ctx.beginPath(); ctx.arc(x, y, R, 0, 6.29); ctx.fill();
      ctx.fillStyle = 'rgba(90,60,10,.75)';
      ctx.font = `800 ${Math.round(R * 1.15)}px Manrope, system-ui, sans-serif`;
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.fillText('€', x, y + R * 0.06);
    }
  }

  resize();
  if (document.fonts) document.fonts.ready.then(() => { resize(); });
  return state;
}

/* Kraskaart voor een echo: met vinger of muis wegkrassen; vanaf de helft gaat de rest vanzelf weg. */
function makeScratch(canvas, onDone) {
  const ctx = canvas.getContext('2d');
  let W = 0, H = 0, dpr = 1, last = null, moves = 0, started = false, done = false;

  function paint() {
    const r = canvas.getBoundingClientRect();
    if (!r.width || started) return;
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.globalCompositeOperation = 'source-over';
    const g = ctx.createLinearGradient(0, 0, W, H);
    [['#8d8ea6', 0], ['#d9dae6', 0.22], ['#9fa0b6', 0.4], ['#f0f0f6', 0.55], ['#9a9bb2', 0.72], ['#cfd0de', 1]].forEach(([c, o]) => g.addColorStop(o, c));
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < W * H / 26; i++) {
      ctx.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(40,35,90,.08)';
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.3, 1.3);
    }
    ctx.fillStyle = 'rgba(35,30,75,.72)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `800 ${Math.round(H * 0.36)}px "Bricolage Grotesque", Manrope, system-ui, sans-serif`;
    ctx.fillText('?', W / 2, H * 0.44);
    ctx.fillStyle = 'rgba(35,30,75,.5)';
    ctx.font = `800 ${Math.round(H * 0.075)}px Manrope, system-ui, sans-serif`;
    ctx.fillText('★  KRAS HIER  ★', W / 2, H * 0.8);
  }

  function point(e) {
    const r = canvas.getBoundingClientRect();
    return [e.clientX - r.left, e.clientY - r.top];
  }
  function scratch(to) {
    ctx.globalCompositeOperation = 'destination-out';
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = Math.max(28, W * 0.14);
    ctx.beginPath();
    ctx.moveTo(...(last || to));
    ctx.lineTo(...to);
    ctx.stroke();
    last = to;
    if (++moves % 6 === 0 && cleared() > 0.5) finish();
  }
  function cleared() {
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    let clear = 0, total = 0;
    for (let i = 3; i < data.length; i += 4 * 8) { total++; if (data[i] < 20) clear++; }
    return clear / total;
  }
  function finish() {
    if (done) return;
    done = true;
    canvas.classList.add('is-gone');
    setTimeout(() => canvas.remove(), 600);
    onDone();
  }

  canvas.addEventListener('pointerdown', (e) => {
    if (done) return;
    started = true;
    canvas.setPointerCapture(e.pointerId);
    last = null;
    scratch(point(e));
  });
  canvas.addEventListener('pointermove', (e) => { if (last && !done) scratch(point(e)); });
  canvas.addEventListener('pointerup', () => { last = null; });
  canvas.addEventListener('pointercancel', () => { last = null; });
  canvas.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); finish(); } });

  requestAnimationFrame(paint);
  addEventListener('resize', paint);
  if (document.fonts) document.fonts.ready.then(paint);
}
