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
    document.getElementById('speak-target').textContent = phrase.target;
    document.getElementById('speak-gloss').textContent = phrase.english;
    showScreen('speak', { back: 'translator' });
  }
  document.getElementById('btn-speak-back').addEventListener('click', () => showScreen('translator'));

  // ── Guess the Language ───────────────────────────────────────────────────
  let pool = [];
  let grid = []; // [{slot, item}]
  let queue = [];
  let solved = 0;
  let activeSlot = null;

  function drawPool() {
    return shuffle(BOOTH_PHRASES.filter((p) => GAME_DIALECTS.includes(p.dialect))).slice(0, POOL_SIZE);
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
    document.getElementById('answer-target').textContent = tile.item.target;
    document.getElementById('answer-gloss').style.display = 'none';
    document.getElementById('answer-gloss').textContent = tile.item.english;

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
