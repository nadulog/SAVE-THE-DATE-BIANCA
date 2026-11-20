/* ==========================================================
   Save the Date · Bianca XV
   - Línea de tiempo de escenas
   - Brillos / bokeh / glitter en canvas
   - Música ambiental generada (o un mp3 propio)
   ========================================================== */

// Si querés usar una canción propia, poné el archivo en assets/ y escribí la ruta acá,
// por ejemplo: 'assets/musica.mp3'. Si queda vacío se usa la música generada.
const MUSICA_MP3 = 'assets/musica.mp3';

const stage = document.getElementById('stage');
const intro = document.getElementById('intro');
const flashEl = document.getElementById('flash');
const soundBtn = document.getElementById('sound-btn');

/* ---------- Separar letras ---------- */
document.querySelectorAll('[data-split]').forEach((el) => {
  const text = el.textContent.trim();
  const d = parseFloat(el.dataset.d || 0);
  const step = parseFloat(el.dataset.step || 0.12);
  el.setAttribute('aria-label', text);
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'ltr';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = ch;
    s.style.setProperty('--i', i);
    s.style.setProperty('--d', d + 's');
    s.style.setProperty('--step', step + 's');
    if (el.hasAttribute('data-drop')) {
      // cada letra entra desde una altura distinta y en un momento distinto
      const up = el.classList.contains('name') && i % 2 === 1;
      const o = (0.35 + Math.random() * 0.9) * (up ? 1 : -1);
      s.style.setProperty('--o', o.toFixed(2) + 'em');
      s.style.setProperty('--r', (Math.random() * 0.7).toFixed(2) + 's');
    }
    el.appendChild(s);
  });
});

/* ---------- Cursiva que se escribe letra por letra ---------- */
document.querySelectorAll('[data-type]').forEach((el) => {
  const text = el.textContent.trim();
  el.setAttribute('aria-label', text);
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const s = document.createElement('span');
    s.className = 'tl';
    s.setAttribute('aria-hidden', 'true');
    s.textContent = ch;
    s.style.setProperty('--i', i);
    s.style.setProperty('--d', (el.dataset.d || 0) + 's');
    el.appendChild(s);
  });
});

/* ==========================================================
   FX: canvas de partículas
   ========================================================== */
const FX = (() => {
  const cv = document.getElementById('fx');
  const ctx = cv.getContext('2d');
  let W = 0, H = 0, DPR = 1;
  const bokeh = [], glitter = [], stars = [], sparks = [];

  function sprite(size, draw) {
    const c = document.createElement('canvas');
    c.width = c.height = size;
    draw(c.getContext('2d'), size);
    return c;
  }
  const bokehSprite = sprite(128, (g, s) => {
    const r = s / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(235,236,242,.55)');
    grd.addColorStop(.72, 'rgba(225,227,235,.7)');
    grd.addColorStop(.86, 'rgba(255,255,255,.9)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd;
    g.beginPath(); g.arc(r, r, r, 0, Math.PI * 2); g.fill();
  });
  const dotSprite = sprite(32, (g, s) => {
    const r = s / 2;
    const grd = g.createRadialGradient(r, r, 0, r, r, r);
    grd.addColorStop(0, 'rgba(255,255,255,1)');
    grd.addColorStop(.25, 'rgba(255,255,255,.8)');
    grd.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = grd; g.fillRect(0, 0, s, s);
  });
  const starSprite = sprite(256, (g, s) => {
    const c = s / 2;
    const glow = g.createRadialGradient(c, c, 0, c, c, c * .55);
    glow.addColorStop(0, 'rgba(255,255,255,.95)');
    glow.addColorStop(.12, 'rgba(255,255,255,.45)');
    glow.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = glow; g.fillRect(0, 0, s, s);
    const ray = (L, w, a) => {
      g.save(); g.translate(c, c); g.rotate(a);
      g.beginPath();
      g.moveTo(0, -L);
      g.quadraticCurveTo(w, -w, L, 0);
      g.quadraticCurveTo(w, w, 0, L);
      g.quadraticCurveTo(-w, w, -L, 0);
      g.quadraticCurveTo(-w, -w, 0, -L);
      g.fillStyle = '#fff'; g.fill(); g.restore();
    };
    ray(c * .98, c * .05, 0);
    g.globalAlpha = .55;
    ray(c * .45, c * .04, Math.PI / 4);
  });

  const rnd = (a, b) => a + Math.random() * (b - a);

  function resize() {
    const r = stage.getBoundingClientRect();
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    W = r.width; H = r.height;
    cv.width = Math.round(W * DPR); cv.height = Math.round(H * DPR);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
  }

  function seed() {
    bokeh.length = 0; glitter.length = 0;
    for (let i = 0; i < 20; i++) {
      bokeh.push({
        x: rnd(0, W), y: rnd(0, H), r: rnd(.03, .13) * W,
        vy: -rnd(4, 14), ph: rnd(0, 6.28), sp: rnd(.2, .6), a: rnd(.025, .09)
      });
    }
    const n = Math.round(W * H / 4200);
    for (let i = 0; i < n; i++) glitter.push(newGlitter(true));
  }
  function newGlitter(anywhere) {
    return {
      x: rnd(0, W), y: anywhere ? rnd(0, H) : -10,
      s: Math.random() < .12 ? rnd(2.2, 3.6) : rnd(.6, 1.8),
      vy: rnd(8, 30), sw: rnd(5, 18), ph: rnd(0, 6.28), tw: rnd(1.5, 5), a: rnd(.35, 1)
    };
  }

  function star(x, y, size, life = rnd(.9, 1.6)) {
    stars.push({ x, y, size, life, t: 0, rot: rnd(-.3, .3), vr: rnd(-.6, .6) });
  }
  function burst(x, y, n = 22, spread = .35) {
    for (let i = 0; i < n; i++) {
      const ang = rnd(0, Math.PI * 2), sp = rnd(120, 520) * (W / 400);
      sparks.push({ x, y, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp - 20,
        life: rnd(.9, 2), t: 0, s: rnd(.8, 2.4) });
    }
  }

  // zona donde no deben aparecer estrellas (el logo)
  let avoid = null;
  function inAvoid(x, y) {
    if (!avoid) return false;
    const sr = stage.getBoundingClientRect(), r = avoid.getBoundingClientRect();
    const pad = r.width * .08;
    return x > r.left - sr.left - pad && x < r.right - sr.left + pad &&
           y > r.top - sr.top - pad && y < r.bottom - sr.top + pad;
  }

  let last = performance.now(), ambient = 0;
  function frame(now) {
    const dt = Math.min((now - last) / 1000, .05); last = now;
    ctx.clearRect(0, 0, W, H);
    ctx.globalCompositeOperation = 'lighter';

    for (const b of bokeh) {
      b.y += b.vy * dt; b.ph += b.sp * dt;
      const x = b.x + Math.sin(b.ph) * 18;
      if (b.y < -b.r) { b.y = H + b.r; b.x = rnd(0, W); }
      ctx.globalAlpha = b.a * (.7 + .3 * Math.sin(b.ph * 1.7));
      ctx.drawImage(bokehSprite, x - b.r, b.y - b.r, b.r * 2, b.r * 2);
    }

    for (let i = 0; i < glitter.length; i++) {
      const p = glitter[i];
      p.y += p.vy * dt; p.ph += p.tw * dt;
      const x = p.x + Math.sin(p.ph * .5) * p.sw;
      if (p.y > H + 10) { glitter[i] = newGlitter(false); continue; }
      const tw = Math.pow(Math.abs(Math.sin(p.ph)), 3);
      ctx.globalAlpha = p.a * (.15 + .85 * tw);
      const s = p.s * (1 + tw * 2.2);
      ctx.drawImage(dotSprite, x - s * 2, p.y - s * 2, s * 4, s * 4);
      if (p.s > 2 && tw > .85 && !inAvoid(x, p.y)) {
        ctx.globalAlpha = (tw - .85) * 5;
        const L = p.s * 7;
        ctx.drawImage(starSprite, x - L, p.y - L, L * 2, L * 2);
      }
    }

    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.t += dt;
      if (p.t > p.life) { sparks.splice(i, 1); continue; }
      const k = Math.pow(.25, dt);
      p.vx *= k; p.vy = p.vy * k + 25 * dt;
      p.x += p.vx * dt; p.y += p.vy * dt;
      const f = 1 - p.t / p.life;
      ctx.globalAlpha = f * (.5 + .5 * Math.abs(Math.sin(p.t * 14)));
      const s = p.s * 3;
      ctx.drawImage(dotSprite, p.x - s, p.y - s, s * 2, s * 2);
    }

    for (let i = stars.length - 1; i >= 0; i--) {
      const s = stars[i];
      s.t += dt;
      if (s.t > s.life) { stars.splice(i, 1); continue; }
      const k = Math.sin(Math.PI * s.t / s.life);
      const L = s.size * k;
      ctx.save();
      ctx.globalAlpha = k;
      ctx.translate(s.x, s.y); ctx.rotate(s.rot + s.vr * s.t);
      ctx.drawImage(starSprite, -L, -L, L * 2, L * 2);
      ctx.restore();
    }

    // destellos ambientales
    ambient -= dt;
    if (ambient <= 0) {
      ambient = rnd(.3, .8);
      const ax = rnd(.05, .95) * W, ay = rnd(.05, .95) * H;
      if (!inAvoid(ax, ay)) star(ax, ay, rnd(6, 16) * (W / 400));
    }
    ctx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }

  resize(); seed();
  window.addEventListener('resize', () => { resize(); seed(); });
  requestAnimationFrame(frame);

  // posición de un elemento relativa al escenario
  function at(el, fx, fy) {
    const sr = stage.getBoundingClientRect(), r = el.getBoundingClientRect();
    return [r.left - sr.left + r.width * fx, r.top - sr.top + r.height * fy];
  }
  return { star, burst, at, setAvoid(el) { avoid = el; }, get W() { return W; }, get H() { return H; } };
})();

/* ==========================================================
   Música generada con Web Audio
   ========================================================== */
const Music = (() => {
  let ctx, master, wet, dry, timer, nextT = 0, step = 0, muted = false, mp3;
  const BPM = 70, EIGHTH = 60 / BPM / 2;
  const hz = (m) => 440 * Math.pow(2, (m - 69) / 12);
  // Dmaj7 · Bm7 · Gmaj7 · Asus2
  const CHORDS = [
    [50, 57, 61, 66],
    [47, 54, 57, 62],
    [43, 55, 59, 66],
    [45, 52, 57, 59],
  ];
  const ARP = [0, 2, 1, 3, 2, 1, 3, 2];

  function impulse(sec = 3.8) {
    const len = ctx.sampleRate * sec, buf = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = buf.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    return buf;
  }

  function build() {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -18; comp.ratio.value = 3;
    master = ctx.createGain(); master.gain.value = 0;
    const rev = ctx.createConvolver(); rev.buffer = impulse();
    wet = ctx.createGain(); wet.gain.value = .5;
    dry = ctx.createGain(); dry.gain.value = .75;
    dry.connect(master); wet.connect(rev); rev.connect(master);
    master.connect(comp); comp.connect(ctx.destination);
  }
  function out(node, pan = 0) {
    let n = node;
    if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = pan; node.connect(p); n = p; }
    n.connect(dry); n.connect(wet);
  }

  function bell(m, t, vol = .11) {
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + .006);
    g.gain.exponentialRampToValueAtTime(.0001, t + 2.2);
    [[1, 1], [2, .16], [4.02, .05]].forEach(([mul, a]) => {
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'sine'; o.frequency.value = hz(m) * mul; og.gain.value = a;
      o.connect(og); og.connect(g); o.start(t); o.stop(t + 2.3);
    });
    out(g, (Math.random() * 2 - 1) * .5);
  }

  function pad(chord, t, dur) {
    const g = ctx.createGain(), lp = ctx.createBiquadFilter();
    lp.type = 'lowpass'; lp.frequency.value = 950; lp.Q.value = .3;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(.05, t + 1.4);
    g.gain.setValueAtTime(.05, t + dur - .4);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.6);
    lp.connect(g);
    chord.forEach((m) => [-7, 7].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = 'triangle'; o.frequency.value = hz(m); o.detune.value = det;
      o.connect(lp); o.start(t); o.stop(t + dur + 1.8);
    }));
    const b = ctx.createOscillator(), bg = ctx.createGain();
    b.type = 'sine'; b.frequency.value = hz(chord[0] - 12);
    bg.gain.setValueAtTime(0, t); bg.gain.linearRampToValueAtTime(.09, t + .8);
    bg.gain.linearRampToValueAtTime(0, t + dur + 1);
    b.connect(bg); bg.connect(g); b.start(t); b.stop(t + dur + 1.2);
    out(g);
  }

  function schedule() {
    while (nextT < ctx.currentTime + .35) {
      const bar = Math.floor(step / 8) % CHORDS.length, s = step % 8;
      const chord = CHORDS[bar];
      if (s === 0) pad(chord, nextT, EIGHTH * 8);
      if (s === 0 || Math.random() > .14) bell(chord[ARP[s]] + 24, nextT, s === 0 ? .12 : .085);
      nextT += EIGHTH; step++;
    }
  }

  function noise(sec) {
    const b = ctx.createBuffer(1, ctx.sampleRate * sec, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    const src = ctx.createBufferSource(); src.buffer = b; return src;
  }

  return {
    start() {
      if (!ctx) build();
      if (ctx.state === 'suspended') ctx.resume();
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(muted ? 0 : .9, t + 2.5);
      if (MUSICA_MP3) {
        mp3 = mp3 || Object.assign(new Audio(MUSICA_MP3), { loop: true, volume: .85 });
        mp3.play().catch(() => {});
        return;
      }
      if (!timer) { nextT = t + .15; timer = setInterval(schedule, 90); schedule(); }
    },
    // brillo sonoro: arpegio ascendente + aire
    shimmer(delay = 0, vol = 1) {
      if (!ctx) return;
      if (MUSICA_MP3) vol *= .45; // más sutil encima de la canción
      const t = ctx.currentTime + delay;
      [74, 78, 81, 85, 86, 90, 93].forEach((m, i) => bell(m + 12, t + i * .05, .045 * vol));
      const n = noise(1.2), hp = ctx.createBiquadFilter(), g = ctx.createGain();
      hp.type = 'highpass'; hp.frequency.value = 6500;
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.05 * vol, t + .08);
      g.gain.exponentialRampToValueAtTime(.0001, t + 1.1);
      n.connect(hp); hp.connect(g); out(g); n.start(t);
    },
    // "whoosh" que crece antes de la aparición del logo
    swell(dur = 1.1) {
      if (!ctx) return;
      const t = ctx.currentTime, n = noise(dur + .2), bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.Q.value = 1.2;
      bp.frequency.setValueAtTime(300, t); bp.frequency.exponentialRampToValueAtTime(4200, t + dur);
      g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.12, t + dur * .92);
      g.gain.linearRampToValueAtTime(0, t + dur + .1);
      n.connect(bp); bp.connect(g); out(g); n.start(t);
    },
    toggle() {
      muted = !muted;
      if (ctx) {
        const t = ctx.currentTime;
        master.gain.cancelScheduledValues(t);
        master.gain.setValueAtTime(master.gain.value, t);
        master.gain.linearRampToValueAtTime(muted ? 0 : .9, t + .4);
      }
      if (mp3) mp3.muted = muted;
      return muted;
    },
    pause() { if (ctx) ctx.suspend(); if (mp3) mp3.pause(); },
    resume() { if (ctx) ctx.resume(); if (mp3 && !muted) mp3.play().catch(() => {}); },
  };
})();

/* ==========================================================
   Línea de tiempo
   ========================================================== */
const $ = (id) => document.getElementById(id);
const SCENES = [
  { el: $('s-logo'),  at: 300,   end: 5200,  enter: logoEnter },
  { el: $('s-std'),   at: 6000,  end: 12000, enter: () => Music.shimmer(1.3, .7) },
  { el: $('s-date'),  at: 12900, end: 18200, enter: () => Music.shimmer(1.5, .7) },
  { el: $('s-name'),  at: 19100, end: 24600, enter: () => Music.shimmer(1.5, .8) },
  { el: $('s-final'), at: 25600, end: null,  enter: finalEnter },
];
let timers = [];

function later(fn, ms) { timers.push(setTimeout(fn, ms)); }
function flash() { flashEl.classList.remove('on'); void flashEl.offsetWidth; flashEl.classList.add('on'); }
function midBurst(fx, fy, n) { FX.burst(FX.W * fx, FX.H * fy, n); }

function logoEnter() {
  FX.setAvoid($('s-logo').querySelector('.logo-wrap'));
  later(() => { flash(); Music.shimmer(0, 1); }, 900);
}
function finalEnter() {
  FX.setAvoid($('s-final').querySelector('.logo-wrap'));
  Music.shimmer(.3, 1);
}

function play() {
  timers.forEach(clearTimeout); timers = [];
  FX.setAvoid(null);
  SCENES.forEach(({ el }) => el.classList.remove('active', 'out'));
  SCENES.forEach((s, i) => {
    later(() => {
      stage.dataset.scene = i + 1;
      s.el.classList.add('active');
      s.enter && s.enter();
    }, s.at);
    if (s.end) {
      later(() => { s.el.classList.add('out'); if (i === 0) FX.setAvoid(null); }, s.end);
      later(() => s.el.classList.remove('active', 'out'), s.end + 1450);
    }
  });
}

/* ---------- Interacción ---------- */
intro.addEventListener('click', () => {
  Music.start();
  Music.swell(1);
  intro.classList.add('gone');
  soundBtn.hidden = false;
  later(() => midBurst(.5, .42, 20), 150);
  play();
}, { once: true });

soundBtn.addEventListener('click', () => {
  const m = Music.toggle();
  soundBtn.classList.toggle('muted', m);
  soundBtn.setAttribute('aria-label', m ? 'Activar música' : 'Silenciar música');
});

$('btn-replay').addEventListener('click', () => {
  const fin = $('s-final');
  fin.classList.add('out');
  setTimeout(() => { fin.classList.remove('active', 'out'); Music.swell(.9); play(); }, 900);
});

// ?escena=1..5 → muestra una sola escena fija (para revisar diseño)
const qs = new URLSearchParams(location.search);
if (qs.has('escena')) {
  intro.classList.add('gone');
  const s = SCENES[Math.min(Math.max(+qs.get('escena') || 1, 1), SCENES.length) - 1];
  stage.dataset.scene = SCENES.indexOf(s) + 1; s.el.classList.add('active'); s.enter();
}
// ?auto → arranca solo (sin tocar). Útil para previsualizar o grabar la pantalla.
else if (qs.has('auto')) {
  intro.classList.add('gone');
  soundBtn.hidden = false;
  play();
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) Music.pause(); else if (intro.classList.contains('gone')) Music.resume();
});
