// dashboard-layout.js — Finance OS
// Versio: 20260527-1
// Vastuu: korttijarjestys, leveys, drag & drop
// Ei closureja, ei timeouteja, ei inline-tyylejä.

(function() {
  'use strict';

  const STORAGE_KEY = 'fin_layout_state';
  const GRID_ID     = 'db-content';

  // Kortit jotka ovat aina leveitä — nappi piilotetaan
  const ALWAYS_WIDE = ['heartbeat','historia','muuttui','tapahtumat','netto'];

  // Oletusjarjestys jos localStoragessa ei ole mitaan
  const DEFAULT_ORDER = ['netto','heartbeat','inv','cash','debt','historia','muuttui','tapahtumat'];

  // ── STATE ──────────────────────────────────────────────────────────────

  function loadState() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    } catch(e) {
      return {};
    }
  }

  function saveState(state) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch(e) {}
  }

  function getCardState(id) {
    const s = loadState();
    return s[id] || { wide: ALWAYS_WIDE.includes(id), visible: true };
  }

  function setCardState(id, patch) {
    const s = loadState();
    s[id] = Object.assign(getCardState(id), patch);
    saveState(s);
  }

  function getOrder() {
    const s = loadState();
    return s.__order || null;
  }

  function saveOrder(order) {
    const s = loadState();
    s.__order = order;
    saveState(s);
  }

  // ── GRID SETUP ─────────────────────────────────────────────────────────
  // Siirtää kortit suoraan #os-layout:n alle jotta grid-column toimii

  function getGrid() {
    return document.getElementById(GRID_ID);
  }

  function getCards() {
    const grid = getGrid();
    if (!grid) return [];
    return [...grid.querySelectorAll('[data-item-id]')].filter(
      el => el.parentElement === grid
    );
  }

  function moveCardsToGrid() {
    const grid = getGrid();
    if (!grid) return;

    // Etsi kaikki [data-item-id] elementit joita ei vielä ole gridin suorina lapsina
    const allCards = document.querySelectorAll('[data-item-id]');
    allCards.forEach(card => {
      if (card.parentElement !== grid) {
        grid.appendChild(card);
      }
    });
  }

  // ── SIZES ──────────────────────────────────────────────────────────────

  function applyAllSizes() {
    getCards().forEach(el => {
      const id   = el.dataset.itemId;
      const wide = ALWAYS_WIDE.includes(id) || getCardState(id).wide;
      el.classList.toggle('card-wide',   wide);
      el.classList.toggle('card-normal', !wide);
      // Päivitä nappi
      const btn = el.querySelector('.size-toggle-btn');
      if (btn) {
        if (ALWAYS_WIDE.includes(id)) {
          btn.style.display = 'none';
        } else {
          btn.style.display = '';
          btn.textContent = wide ? '⊡' : '⊞';
          btn.title = wide ? 'Tee pieneksi' : 'Tee leveäksi';
        }
      }
    });
  }

  // Julkinen: kortin leveysnappi kutsuu tätä
  window.toggleItemSize = function(id) {
    if (ALWAYS_WIDE.includes(id)) return;
    const cur  = getCardState(id);
    setCardState(id, { wide: !cur.wide });
    applyAllSizes();
  };

  // ── ORDER ──────────────────────────────────────────────────────────────

  function applyOrder() {
    const grid  = getGrid();
    if (!grid) return;
    const saved = getOrder();
    if (!saved || !saved.length) return;

    // Rakenna id→elementti kartta
    const map = {};
    getCards().forEach(el => { map[el.dataset.itemId] = el; });

    // Lisää järjestyksessä
    saved.forEach(id => {
      if (map[id]) grid.appendChild(map[id]);
    });

    // Kortit joita ei ole tallennetussa järjestyksessä → perään
    getCards().forEach(el => {
      if (!saved.includes(el.dataset.itemId)) grid.appendChild(el);
    });
  }

  function captureOrder() {
    return getCards().map(el => el.dataset.itemId);
  }

  // ── DRAG & DROP ────────────────────────────────────────────────────────

  let dragging   = null;   // kortti-elementti jota raahataan
  let placeholder = null;  // kevyt placeholder gridin sisällä
  let offsetX    = 0;
  let offsetY    = 0;
  let dragMoved  = false;

  function initDragging() {
    const grid = getGrid();
    if (!grid) return;

    // Lisää drag-handle jokaiseen korttiin jos ei vielä ole
    getCards().forEach(card => {
      if (card.querySelector('.drag-handle')) return;
      const handle = document.createElement('div');
      handle.className    = 'drag-handle';
      handle.innerHTML    = '⠿';
      handle.title        = 'Raahaa';
      handle.style.cssText = [
        'position:absolute',
        'top:8px',
        'left:8px',
        'cursor:grab',
        'color:var(--text3,#8abdd4)',
        'font-size:14px',
        'line-height:1',
        'padding:4px',
        'border-radius:4px',
        'user-select:none',
        'touch-action:none',
        'z-index:10',
        'opacity:0.5',
        'transition:opacity .15s',
      ].join(';');
      handle.addEventListener('pointerover',  () => { handle.style.opacity = '1'; });
      handle.addEventListener('pointerout',   () => { handle.style.opacity = '0.5'; });
      card.style.position = card.style.position || 'relative';
      card.prepend(handle);
    });

    grid.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('pointermove', onPointerMove);
    document.addEventListener('pointerup',   onPointerUp);
  }

  function onPointerDown(e) {
    const handle = e.target.closest('.drag-handle');
    if (!handle) return;

    const card = handle.closest('[data-item-id]');
    if (!card) return;

    e.preventDefault();
    handle.setPointerCapture(e.pointerId);
    dragMoved = false;

    const rect = card.getBoundingClientRect();
    offsetX = e.clientX - rect.left;
    offsetY = e.clientY - rect.top;

    // Luo placeholder samoilla mitoilla
    placeholder = document.createElement('div');
    placeholder.className   = 'drag-placeholder';
    placeholder.style.cssText = [
      'background:rgba(0,200,255,0.08)',
      'border:2px dashed rgba(0,200,255,0.35)',
      'border-radius:12px',
      'pointer-events:none',
      `height:${rect.height}px`,
      `grid-column:${getComputedStyle(card).gridColumn}`,
    ].join(';');

    // Aseta kortti kelluvaksi
    card.style.cssText += [
      ';position:fixed',
      `left:${rect.left}px`,
      `top:${rect.top}px`,
      `width:${rect.width}px`,
      `height:${rect.height}px`,
      'z-index:1000',
      'opacity:0.92',
      'pointer-events:none',
      'transition:none',
      'box-shadow:0 16px 48px rgba(0,0,0,0.5)',
    ].join(';');

    card.after(placeholder);
    dragging = card;
  }

  function onPointerMove(e) {
    if (!dragging) return;
    dragMoved = true;

    // Siirrä kortti
    dragging.style.left = (e.clientX - offsetX) + 'px';
    dragging.style.top  = (e.clientY - offsetY) + 'px';

    // Etsi lähin kohde-elementti
    const grid = getGrid();
    if (!grid) return;

    const midX = e.clientX;
    const midY = e.clientY;

    let best = null, bestDist = Infinity;
    getCards().forEach(card => {
      if (card === dragging) return;
      const r   = card.getBoundingClientRect();
      const cx  = r.left + r.width / 2;
      const cy  = r.top  + r.height / 2;
      const dist = Math.hypot(midX - cx, midY - cy);
      if (dist < bestDist) { bestDist = dist; best = card; }
    });

    if (best) {
      const r   = best.getBoundingClientRect();
      const mid = r.top + r.height / 2;
      if (e.clientY < mid) {
        grid.insertBefore(placeholder, best);
      } else {
        best.after(placeholder);
      }
    }

    // Auto-scroll
    const margin = 80;
    if (e.clientY < margin)               window.scrollBy(0, -8);
    if (e.clientY > window.innerHeight - margin) window.scrollBy(0, 8);
  }

  function onPointerUp(e) {
    if (!dragging) return;

    // Palauta kortti normaaliksi
    dragging.style.position   = '';
    dragging.style.left       = '';
    dragging.style.top        = '';
    dragging.style.width      = '';
    dragging.style.height     = '';
    dragging.style.zIndex     = '';
    dragging.style.opacity    = '';
    dragging.style.pointerEvents = '';
    dragging.style.boxShadow  = '';

    // Aseta oikeaan paikkaan
    if (placeholder && placeholder.parentElement) {
      placeholder.replaceWith(dragging);
    }

    placeholder = null;
    dragging    = null;

    // Tallenna uusi järjestys
    saveOrder(captureOrder());
    applyAllSizes(); // varmista luokat järjestyksen jälkeen
  }

  // ── CSS ────────────────────────────────────────────────────────────────

  function injectCSS() {
    if (document.getElementById('layout-module-css')) return;
    const style = document.createElement('style');
    style.id = 'layout-module-css';
    style.textContent = `
      #${GRID_ID} {
        display: grid;
        grid-template-columns: repeat(3, 1fr);
        grid-auto-flow: row;
        gap: 12px;
      }
      .card-wide   { grid-column: 1 / -1; }
      .card-normal { grid-column: auto;   }
      .drag-placeholder {
        transition: height .15s;
      }
      [data-item-id] { position: relative; }
    `;
    document.head.appendChild(style);
  }

  // ── INIT ───────────────────────────────────────────────────────────────

  function initLayout() {
    const grid = getGrid();
    if (!grid) return;

    injectCSS();
    // kortit jo db-contentissa, ei siirtoa tarvita   // kortit suoraan gridin alle
    applyOrder();        // palauta tallennettu järjestys
    applyAllSizes();     // palauta leveydet
    initDragging();      // lisää drag-handleit ja eventit
  }

  // Julkinen API
  window.initLayout    = initLayout;
  window.applyDashboardLayout = applyAllSizes;

  // Kuuntele renderDashboard-signaalia
  // ui2-v2.js kutsuu window.onDashboardRendered() jos se on määritelty
  window.applyDashboardLayout = function() { applyOrder(); applyAllSizes(); initDragging(); };

})();
