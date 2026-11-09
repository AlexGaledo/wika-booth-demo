/**
 * Wika PH booth demo — plain JS, no build step, no network calls anywhere in
 * this file. Open index.html directly in a browser on the booth laptop/tablet.
 * Logic mirrors the React Native version drafted (then dropped) for MOB-086:
 * same phrase data, same "guess the language" grid mechanic, same no-fail UX.
 */
(function () {
  'use strict';

  const DIALECTS = [
    { id: 'tagalog', label: 'Tagalog', icon: 'tagalog-icon.png' },
    { id: 'cebuano', label: 'Cebuano', icon: 'cebuano-icon.png' },
    { id: 'ilocano', label: 'Ilocano', icon: 'ilocano-icon.png' },
  ];
  const GAME_DIALECTS = DIALECTS.map((d) => d.id);
  const GRID_SIZE = 8;
  const POOL_SIZE = 25;

  // ── helpers ──────────────────────────────────────────────────────────────
  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  /** Any dialect sharing the exact same target text (e.g. "Salamat po." is a
   *  genuine Tagalog/Cebuano shared loanword) counts as correct too, so a
   *  shared word can't unfairly fail an otherwise-right guess. */
  function correctDialectsFor(item) {
    const set = new Set([item.dialect]);
    for (const p of BOOTH_PHRASES) if (p.target === item.target) set.add(p.dialect);
    return set;
  }

  function labelFor(id) {
    const d = DIALECTS.find((x) => x.id === id);
    return d ? d.label : id;
  }

  /** Plays a phrase's real recorded clip, if it has one. Silent/no-op otherwise —
   *  same "missing clip just means no audio" philosophy as the real app. */
  function playClip(filename) {
    if (!filename) return;
    try {
      const a = new Audio('audio/' + filename);
      a.play().catch(() => {}); // autoplay can be blocked before any user gesture; fine, silent
    } catch (e) {}
  }

  /** A small 🔊 button that replays `item.audio`, or null if there's no clip. */
  function speakerButton(item) {
    if (!item.audio) return null;
    const btn = document.createElement('button');
    btn.className = 'speaker-btn';
    btn.type = 'button';
    btn.setAttribute('aria-label', 'Play pronunciation');
    btn.textContent = '🔊';
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      playClip(item.audio);
    });
    return btn;
  }

  // ── navigation ───────────────────────────────────────────────────────────
  const screens = ['home', 'translator', 'speak', 'game'];
  let current = 'home';
  let backTarget = 'home';

  function showScreen(id, opts) {
    opts = opts || {};
    current = id;
    backTarget = opts.back || 'home';
    screens.forEach((s) => {
      document.getElementById('screen-' + s).classList.toggle('active', s === id);
    });
    document.getElementById('btn-back').style.visibility = id === 'home' ? 'hidden' : 'visible';
    document.getElementById('title-text').textContent =
      id === 'home' ? 'Wika PH' :
      id === 'translator' ? 'Say it in...' :
      id === 'speak' ? 'Dialecto Demo' :
      'Guess the Language';
  }

  document.getElementById('btn-back').addEventListener('click', () => showScreen(backTarget));
  document.getElementById('btn-translator').addEventListener('click', () => {
    renderDialectTabs();
    renderPhraseList('tagalog');
    showScreen('translator');
  });
  document.getElementById('btn-game').addEventListener('click', () => {
    startGame();
    showScreen('game');
  });

  // ── Translator ───────────────────────────────────────────────────────────
  let activeDialect = 'tagalog';

  function renderDialectTabs() {
    const el = document.getElementById('dialect-tabs');
    el.innerHTML = '';
    DIALECTS.forEach((d) => {
      const btn = document.createElement('button');
      btn.className = 'dialect-tab' + (d.id === activeDialect ? ' active' : '');
      btn.innerHTML = '<img src="' + d.icon + '" alt="" />' + d.label;
      btn.addEventListener('click', () => {
        activeDialect = d.id;
        renderDialectTabs();
        renderPhraseList(d.id);
      });
      el.appendChild(btn);
    });
  }

  function renderPhraseList(dialect) {
    activeDialect = dialect;
    const el = document.getElementById('phrase-list');
    el.innerHTML = '';
    BOOTH_PHRASES.filter((p) => p.dialect === dialect).forEach((p) => {
      const btn = document.createElement('button');
      btn.className = 'phrase-item';
      btn.textContent = p.english;
      btn.addEventListener('click', () => speak(p));
      el.appendChild(btn);
    });
  }

  function speak(phrase) {
    const targetEl = document.getElementById('speak-target');
    targetEl.textContent = phrase.target;
    document.getElementById('speak-gloss').textContent = phrase.english;
    const existing = targetEl.parentElement.querySelector('.speaker-btn');
    if (existing) existing.remove();
    const btn = speakerButton(phrase);
    if (btn) targetEl.parentElement.appendChild(btn);
    showScreen('speak', { back: 'translator' });
    if (phrase.audio) playClip(phrase.audio); // mascot "speaks" the real recording
  }
  document.getElementById('btn-speak-back').addEventListener('click', () => showScreen('translator'));

  // ── Guess the Language ───────────────────────────────────────────────────
  let pool = [];
  let grid = []; // [{slot, item}]
  let queue = [];
  let solved = 0;
  let activeSlot = null;

  /** Draw POOL_SIZE items with the three dialects evenly represented, so how OFTEN a
   *  dialect turns up can't be read off deck sizes (Tagalog now has 35 entries to the
   *  others' 25). Round-robins shuffled per-dialect decks, then shuffles the result so
   *  the order itself gives nothing away either. */
  function drawPool() {
    const decks = GAME_DIALECTS.map((d) => shuffle(BOOTH_PHRASES.filter((p) => p.dialect === d)));
    const picked = [];
    for (let i = 0; picked.length < POOL_SIZE; i++) {
      let tookAny = false;
      for (const deck of decks) {
        if (i < deck.length && picked.length < POOL_SIZE) {
          picked.push(deck[i]);
          tookAny = true;
        }
      }
      if (!tookAny) break; // every deck exhausted
    }
    return shuffle(picked);
  }

  function startGame() {
    pool = drawPool();
    grid = pool.slice(0, GRID_SIZE).map((item, i) => ({ slot: i, item }));
    queue = pool.slice(GRID_SIZE);
    solved = 0;
    activeSlot = null;
    document.getElementById('game-done').style.display = 'none';
    document.getElementById('answer-panel').style.display = 'none';
    document.getElementById('game-grid').style.display = 'grid';
    renderGame();
  }

  function renderGame() {
    document.getElementById('game-progress').textContent = solved + '/' + pool.length;
    const gridEl = document.getElementById('game-grid');
    gridEl.innerHTML = '';
    for (let slot = 0; slot < GRID_SIZE; slot++) {
      const tile = grid.find((t) => t.slot === slot);
      const div = document.createElement('div');
      if (!tile) {
        div.className = 'tile empty';
      } else {
        div.className = 'tile' + (slot === activeSlot ? ' open' : '');
        div.textContent = String(slot + 1);
        div.addEventListener('click', () => openTile(slot));
      }
      gridEl.appendChild(div);
    }
  }

  function openTile(slot) {
    const panel = document.getElementById('answer-panel');
    if (panel.dataset.locked === '1') return; // mid-feedback on another tile
    activeSlot = activeSlot === slot ? null : slot;
    renderGame();
    renderAnswerPanel();
  }

  function renderAnswerPanel() {
    const panel = document.getElementById('answer-panel');
    const tile = grid.find((t) => t.slot === activeSlot);
    if (!tile) { panel.style.display = 'none'; return; }

    panel.style.display = 'flex';
    const targetEl = document.getElementById('answer-target');
    targetEl.textContent = tile.item.target;
    document.getElementById('answer-gloss').style.display = 'none';
    document.getElementById('answer-gloss').textContent = tile.item.english;
    const existing = targetEl.parentElement.querySelector('.speaker-btn');
    if (existing) existing.remove();
    const btn = speakerButton(tile.item);
    if (btn) targetEl.parentElement.appendChild(btn);

    const choicesEl = document.getElementById('answer-choices');
    choicesEl.innerHTML = '';
    shuffle(GAME_DIALECTS).forEach((d) => {
      const btn = document.createElement('button');
      btn.className = 'choice-btn';
      btn.textContent = labelFor(d);
      btn.addEventListener('click', () => guess(tile, d, btn));
      choicesEl.appendChild(btn);
    });
  }

  function guess(tile, dialect, btnEl) {
    const panel = document.getElementById('answer-panel');
    if (panel.dataset.locked === '1') return;
    panel.dataset.locked = '1';

    const correctSet = correctDialectsFor(tile.item);
    const isCorrect = correctSet.has(dialect);
    document.getElementById('answer-gloss').style.display = 'block';

    Array.from(document.getElementById('answer-choices').children).forEach((btn) => {
      btn.disabled = true;
      const btnDialect = GAME_DIALECTS.find((d) => labelFor(d) === btn.textContent);
      if (correctSet.has(btnDialect)) btn.classList.add('correct');
      else if (btn === btnEl) btn.classList.add('wrong');
    });

    setTimeout(() => {
      panel.dataset.locked = '0';
      activeSlot = null;
      if (isCorrect) {
        solved += 1;
        const next = queue.shift();
        grid = grid.filter((t) => t.slot !== tile.slot).concat(next ? [{ slot: tile.slot, item: next }] : []);
        if (solved >= pool.length) {
          document.getElementById('answer-panel').style.display = 'none';
          document.getElementById('game-grid').style.display = 'none';
          document.getElementById('game-done').style.display = 'flex';
          return;
        }
      }
      renderGame();
      renderAnswerPanel();
    }, 900);
  }

  document.getElementById('btn-restart').addEventListener('click', startGame);

  // Initialize the header (hides the back chevron on the home screen) — without
  // this, the button sits at its HTML default (visible) until the first navigation.
  showScreen('home');
})();
