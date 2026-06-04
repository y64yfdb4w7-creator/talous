// dashboard-layout.js — Finance OS
// Versio: 20260529-10
// Vastuu: korttijarjestys, leveys, drag & drop
// Korjaukset: Safari auto-scroll, mobiili 1-sarake, mobiili kosketus-drag

(function() {
'use strict';

const STORAGE_KEY = 'fin_layout_state';
const GRID_ID = 'db-content';

const ALWAYS_WIDE = ['heartbeat','historia','muuttui','tapahtumat','netto'];
const DEFAULT_ORDER = ['netto','heartbeat','inv','cash','debt','historia','muuttui','tapahtumat'];

function loadState() {
try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}'); } catch(e) { return {}; }
}
function saveState(state) {
try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); } catch(e) {}
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
function getOrder() { return loadState().__order || null; }
function saveOrder(order) {
const s = loadState(); s.__order = order; saveState(s);
}

function getGrid() { return document.getElementById(GRID_ID); }
function getCards() {
const grid = getGrid(); if (!grid) return [];
return [...grid.querySelectorAll('[data-item-id]')].filter(el => el.parentElement === grid);
}

function applyAllSizes() {
getCards().forEach(el => {
const id = el.dataset.itemId;
const wide = ALWAYS_WIDE.includes(id) || getCardState(id).wide;
el.classList.toggle('card-wide', wide);
el.classList.toggle('card-normal', !wide);
const btn = el.querySelector('.size-toggle-btn');
if (btn) {
if (ALWAYS_WIDE.includes(id)) { btn.style.display = 'none'; }
else {
btn.style.display = '';
btn.textContent = wide ? '\u229f' : '\u229e';
btn.title = wide ? 'Tee pieneksi' : 'Tee leveaksi';
}
}
});
}

window.toggleItemSize = function(id) {
if (ALWAYS_WIDE.includes(id)) return;
const cur = getCardState(id);
setCardState(id, { wide: !cur.wide });
applyAllSizes();
};

function applyOrder() {
const grid = getGrid(); if (!grid) return;
const saved = getOrder(); if (!saved || !saved.length) return;
const map = {};
getCards().forEach(el => { map[el.dataset.itemId] = el; });
saved.forEach(id => { if (map[id]) grid.appendChild(map[id]); });
getCards().forEach(el => { if (!saved.includes(el.dataset.itemId)) grid.appendChild(el); });
}

function captureOrder() { return getCards().map(el => el.dataset.itemId); }

// ── DROP INDICATOR ──────────────────────────────────────────────────────
let dropIndicator = null;

function createDropIndicator() {
if (dropIndicator) return;
dropIndicator = document.createElement('div');
dropIndicator.id = 'drop-indicator';
dropIndicator.style.cssText = [
'position:fixed','pointer-events:none','z-index:999','display:none',
'border-radius:10px','background:rgba(0,200,255,0.13)',
'border:2px dashed rgba(0,200,255,0.7)',
'box-shadow:0 0 0 4px rgba(0,200,255,0.15),0 0 18px rgba(0,200,255,0.25)',
'transition:top .1s cubic-bezier(.4,0,.2,1),left .1s,width .1s,height .1s',
].join(';');
const label = document.createElement('div');
label.textContent = 'Laske tahan';
label.style.cssText = [
'position:absolute','top:50%','left:50%','transform:translate(-50%,-50%)',
'color:rgba(0,200,255,0.85)','font-size:11px','font-weight:600',
'letter-spacing:.05em','pointer-events:none','white-space:nowrap'
].join(';');
dropIndicator.appendChild(label);
document.body.appendChild(dropIndicator);
}

function showDropIndicator() {
if (!dropIndicator || !placeholder || !placeholder.parentElement) return;
const r = placeholder.getBoundingClientRect();
if (r.width < 2) return;
dropIndicator.style.display = 'block';
dropIndicator.style.left = r.left + 'px';
dropIndicator.style.top = r.top + 'px';
dropIndicator.style.width = r.width + 'px';
dropIndicator.style.height = Math.max(r.height, 60) + 'px';
}

function hideDropIndicator() {
if (dropIndicator) dropIndicator.style.display = 'none';
}

// ── SCROLL-SAILIO ────────────────────────────────────────────────────────
function getScrollContainer() {
const main = document.getElementById('os-main');
if (main) {
const cs = getComputedStyle(main);
if ((cs.overflowY === 'auto' || cs.overflowY === 'scroll') && main.scrollHeight > main.clientHeight) {
return main;
}
}
return null;
}

function doScrollBy(dy) {
const c = getScrollContainer();
if (c) { c.scrollTop += dy; }
else { window.scrollBy(0, dy); }
}

// ── AUTO-SCROLL ─────────────────────────────────────────────────────────
let scrollRAF = null;
let scrollSpeed = 0;
let _lastMoveE = null;

function startAutoScroll(clientY) {
const margin = 110;
const maxSpeed = 20;
const vh = window.innerHeight;
if (clientY < margin) {
scrollSpeed = -Math.round(maxSpeed * (1 - clientY / margin));
} else if (clientY > vh - margin) {
scrollSpeed = Math.round(maxSpeed * (1 - (vh - clientY) / margin));
} else {
scrollSpeed = 0;
return;
}
if (!scrollRAF && scrollSpeed !== 0) {
function doScroll() {
if (scrollSpeed === 0 || !dragging) { scrollRAF = null; return; }
doScrollBy(scrollSpeed);
if (_lastMoveE) { repositionDuringScroll(); }
showDropIndicator();
scrollRAF = requestAnimationFrame(doScroll);
}
scrollRAF = requestAnimationFrame(doScroll);
}
}

function stopAutoScroll() {
scrollSpeed = 0;
if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; }
}

function repositionDuringScroll() {
if (!dragging || !_lastMoveE) return;
const e = _lastMoveE;
updatePlaceholderPosition(e.clientX, e.clientY);
}

function updatePlaceholderPosition(x, y) {
const grid = getGrid(); if (!grid) return;
let best = null, bestDist = Infinity;
getCards().forEach(card => {
if (card === dragging) return;
const r = card.getBoundingClientRect();
const dist = Math.hypot(x - (r.left + r.width/2), y - (r.top + r.height/2));
if (dist < bestDist) { bestDist = dist; best = card; }
});
if (best) {
const r = best.getBoundingClientRect();
if (y < r.top + r.height / 2) { grid.insertBefore(placeholder, best); }
else { best.after(placeholder); }
}
}

// ── DRAG & DROP ─────────────────────────────────────────────────────────
let dragging = null;
let placeholder = null;
let offsetX = 0;
let offsetY = 0;
let activePointerId = null;

function initDragging() {
const grid = getGrid(); if (!grid) return;
createDropIndicator();
getCards().forEach(card => {
if (card.querySelector('.drag-handle')) return;
const handle = document.createElement('div');
handle.className = 'drag-handle';
handle.innerHTML = '\u2630';
handle.title = 'Raahaa';
handle.style.cssText = [
'position:absolute','top:10px','right:10px','cursor:grab',
'align-items:center','justify-content:center',
'width:26px','height:26px',
'color:rgba(255,255,255,0.55)','font-size:13px','font-weight:400','line-height:1',
'background:rgba(255,255,255,0.06)','border:1px solid rgba(255,255,255,0.12)','border-radius:7px',
'user-select:none','-webkit-user-select:none','-webkit-touch-callout:none',
'touch-action:none','z-index:10',
'transition:opacity .15s,background .15s,color .15s'
].join(';');
handle.addEventListener('pointerover', () => { handle.style.background = 'rgba(255,255,255,0.14)'; handle.style.color = 'rgba(255,255,255,0.85)'; });
handle.addEventListener('pointerout', () => { handle.style.background = 'rgba(255,255,255,0.06)'; handle.style.color = 'rgba(255,255,255,0.55)'; });
card.style.position = 'relative';
card.prepend(handle);
});
grid.removeEventListener('pointerdown', onPointerDown);
document.removeEventListener('pointermove', onPointerMove);
document.removeEventListener('pointerup', onPointerUp);
document.removeEventListener('pointercancel', onPointerUp);
grid.addEventListener('pointerdown', onPointerDown);
document.addEventListener('pointermove', onPointerMove, { passive: false });
document.addEventListener('pointerup', onPointerUp);
document.addEventListener('pointercancel', onPointerUp);
}

function onPointerDown(e) {
const handle = e.target.closest('.drag-handle');
if (!handle) return;
const card = handle.closest('[data-item-id]');
if (!card) return;
e.preventDefault();
e.stopPropagation();
activePointerId = e.pointerId;
_lastMoveE = e;
// Esta sivun scroll raahauksen ajaksi (mobiili)
document.body.style.overflow = 'hidden';
document.body.style.touchAction = 'none';
const rect = card.getBoundingClientRect();
offsetX = e.clientX - rect.left;
offsetY = e.clientY - rect.top;
const col = getComputedStyle(card).gridColumn;
placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';
placeholder.style.cssText = ['pointer-events:none', 'grid-column:' + col, 'height:' + rect.height + 'px'].join(';');
card.style.position = 'fixed';
card.style.left = rect.left + 'px';
card.style.top = rect.top + 'px';
card.style.width = rect.width + 'px';
card.style.height = rect.height + 'px';
card.style.zIndex = '1000';
card.style.opacity = '0.9';
card.style.pointerEvents = 'none';
card.style.transition = 'none';
card.style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)';
card.style.transform = 'scale(1.03)';
card.after(placeholder);
dragging = card;
// Tarinapalaute mobiilissa
if (navigator.vibrate) { try { navigator.vibrate(15); } catch(e) {} }
}

function onPointerMove(e) {
if (!dragging) return;
if (activePointerId !== null && e.pointerId !== activePointerId) return;
if (e.cancelable) e.preventDefault();
_lastMoveE = e;
dragging.style.left = (e.clientX - offsetX) + 'px';
dragging.style.top = (e.clientY - offsetY) + 'px';
startAutoScroll(e.clientY);
updatePlaceholderPosition(e.clientX, e.clientY);
requestAnimationFrame(showDropIndicator);
}

function onPointerUp(e) {
if (!dragging) return;
stopAutoScroll();
hideDropIndicator();
// Palauta sivun scroll
document.body.style.overflow = '';
document.body.style.touchAction = '';
dragging.style.position = 'relative';
dragging.style.left = '';
dragging.style.top = '';
dragging.style.width = '';
dragging.style.height = '';
dragging.style.zIndex = '';
dragging.style.opacity = '';
dragging.style.pointerEvents = '';
dragging.style.boxShadow = '';
dragging.style.transition = '';
dragging.style.transform = '';
if (placeholder && placeholder.parentElement) { placeholder.replaceWith(dragging); }
placeholder = null;
dragging = null;
_lastMoveE = null;
activePointerId = null;
saveOrder(captureOrder());
applyAllSizes();
}

// ── CSS ─────────────────────────────────────────────────────────────────
function injectCSS() {
if (document.getElementById('layout-module-css')) return;
const style = document.createElement('style');
style.id = 'layout-module-css';
style.textContent = [
'#db-content{display:grid;grid-template-columns:minmax(0,1fr);grid-auto-flow:row;gap:12px}',
'@media (min-width:900px){#db-content{grid-template-columns:repeat(3,minmax(0,1fr))}}',
'.card-wide{grid-column:1/-1}',
'@media (max-width:899px){.card-normal{grid-column:1/-1}.card-wide{grid-column:1/-1}}',
'@media (min-width:900px){.card-normal{grid-column:auto}}',
'.drag-placeholder{background:rgba(0,200,255,0.07);border:2px dashed rgba(0,200,255,0.35);border-radius:12px;min-height:60px;transition:height .15s}',
'#db-content>[data-item-id]{position:relative!important;min-width:0}',
'.drag-handle:active{cursor:grabbing;background:rgba(255,255,255,0.18)}',
'.drag-handle{display:none!important}','#db-content.dl-edit .drag-handle{display:flex!important}',
'#db-content.dl-edit>[data-item-id]{outline:1px dashed rgba(255,255,255,0.12);outline-offset:-1px}'
].join('');
document.head.appendChild(style);
}

// ── INIT ─────────────────────────────────────────────────────────────────
function setEditMode(on) {
const grid = getGrid(); if (!grid) return;
grid.classList.toggle('dl-edit', !!on);
const btn = document.getElementById('dl-edit-toggle');
if (btn) {
btn.textContent = on ? '\u2713 Valmis' : '\u270e Muokkaa';
btn.style.background = on ? 'rgba(0,200,255,0.15)' : 'rgba(255,255,255,0.05)';
btn.style.color = on ? 'rgba(0,200,255,0.9)' : 'rgba(255,255,255,0.55)';
}
const tb2 = document.getElementById('layout-toolbar');
if (tb2) tb2.style.display = on ? 'flex' : 'none';
}
window.setEditMode = setEditMode;

function setupEditToggle() {
const tb = document.getElementById('layout-toolbar');
if (!tb || document.getElementById('dl-edit-toggle')) return;
const btn = document.createElement('button');
btn.id = 'dl-edit-toggle';
btn.className = 'db-admin-item'; // hidden on mobile, shown in panel
btn.type = 'button';
btn.textContent = '\u270e Muokkaa';
btn.style.cssText = [
'padding:5px 12px','font-size:12px','font-weight:500','cursor:pointer',
'background:rgba(255,255,255,0.05)','color:rgba(255,255,255,0.55)',
'border:1px solid rgba(255,255,255,0.12)','border-radius:7px',
'transition:background .15s,color .15s','-webkit-tap-highlight-color:transparent'
].join(';');
btn.addEventListener('click', function() {
const grid = getGrid();
setEditMode(!(grid && grid.classList.contains('dl-edit')));
});
const rollbackRow = document.querySelector('.db-date > span:nth-child(2)');
// On desktop: append to rollback row; on mobile: also add to admin panel
(rollbackRow || tb).appendChild(btn);
const adminPanel = document.getElementById('db-admin-panel');
if (adminPanel) {
  const btnClone = btn.cloneNode(true);
  btnClone.addEventListener('click', function() { _setEditMode(!document.body.classList.contains('dl-edit')); });
  adminPanel.appendChild(btnClone);
  // Show ⋯ button on mobile
  const menuBtn = document.getElementById('db-menu-btn');
  if (menuBtn) menuBtn.style.display = '';
  // Click-outside to close panel
  document.addEventListener('click', function(e) {
    if (!adminPanel.contains(e.target) && e.target.id !== 'db-menu-btn') adminPanel.style.display = 'none';
  }, {capture: false});
}
}

function initLayout() {
const grid = getGrid(); if (!grid) return;
injectCSS();
applyOrder();
applyAllSizes();
initDragging();
setupEditToggle();
}

window.initLayout = initLayout;
window.applyDashboardLayout = function() { injectCSS(); applyOrder(); applyAllSizes(); initDragging(); setupEditToggle(); };

})();
