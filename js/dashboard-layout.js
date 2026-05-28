// dashboard-layout.js — Finance OS
// Versio: 20260528-2
// Vastuu: korttijarjestys, leveys, drag & drop

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
'position:fixed',
'pointer-events:none',
'z-index:999',
'display:none',
'border-radius:10px',
'background:rgba(0,200,255,0.13)',
'border:2px dashed rgba(0,200,255,0.7)',
'box-shadow:0 0 0 4px rgba(0,200,255,0.15),0 0 18px rgba(0,200,255,0.25)',
'transition:top .1s cubic-bezier(.4,0,.2,1),left .1s,width .1s,height .1s',
].join(';');
const label = document.createElement('div');
label.textContent = 'Laske tahan';
label.style.cssText = [
'position:absolute','top:50%','left:50%',
'transform:translate(-50%,-50%)',
'color:rgba(0,200,255,0.85)','font-size:11px',
'font-weight:600','letter-spacing:.05em','pointer-events:none',
'white-space:nowrap'
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

// ── AUTO-SCROLL ─────────────────────────────────────────────────────────
let scrollRAF = null;
let scrollSpeed = 0;
let _lastMoveE = null;

function startAutoScroll(clientY) {
const margin = 100;
const maxSpeed = 18;
const vh = window.innerHeight;
if (clientY < margin) {
scrollSpeed = -Math.round(maxSpeed * (1 - clientY / margin));
} else if (clientY > vh - margin) {
scrollSpeed = Math.round(maxSpeed * (1 - (vh - clientY) / margin));
} else {
scrollSpeed = 0;
if (scrollRAF) { cancelAnimationFrame(scrollRAF); scrollRAF = null; }
return;
}
if (!scrollRAF) {
function doScroll() {
if (scrollSpeed === 0 || !dragging) { scrollRAF = null; return; }
window.scrollBy(0, scrollSpeed);
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

// ── DRAG & DROP ─────────────────────────────────────────────────────────
let dragging = null;
let placeholder = null;
let offsetX = 0;
let offsetY = 0;

function initDragging() {
const grid = getGrid(); if (!grid) return;
createDropIndicator();
getCards().forEach(card => {
if (card.querySelector('.drag-handle')) return;
const handle = document.createElement('div');
handle.className = 'drag-handle';
handle.innerHTML = '\u2823';
handle.title = 'Raahaa';
handle.style.cssText = [
'position:absolute','top:8px','left:8px','cursor:grab',
'color:var(--text3,#8abdd4)','font-size:14px','line-height:1',
'padding:4px','border-radius:4px','user-select:none',
'touch-action:none','z-index:10','opacity:0.5','transition:opacity .15s'
].join(';');
handle.addEventListener('pointerover', () => { handle.style.opacity = '1'; });
handle.addEventListener('pointerout', () => { handle.style.opacity = '0.5'; });
card.style.position = 'relative';
card.prepend(handle);
});
grid.removeEventListener('pointerdown', onPointerDown);
document.removeEventListener('pointermove', onPointerMove);
document.removeEventListener('pointerup', onPointerUp);
grid.addEventListener('pointerdown', onPointerDown);
document.addEventListener('pointermove', onPointerMove);
document.addEventListener('pointerup', onPointerUp);
}

function onPointerDown(e) {
const handle = e.target.closest('.drag-handle');
if (!handle) return;
const card = handle.closest('[data-item-id]');
if (!card) return;
e.preventDefault();
handle.setPointerCapture(e.pointerId);
_lastMoveE = null;
const rect = card.getBoundingClientRect();
offsetX = e.clientX - rect.left;
offsetY = e.clientY - rect.top;
const col = getComputedStyle(card).gridColumn;
placeholder = document.createElement('div');
placeholder.className = 'drag-placeholder';
placeholder.style.cssText = ['pointer-events:none', 'grid-column:' + col, 'height:' + rect.height + 'px'].join(';');
// Aseta dragging-tyyli lisaamalla vain tarvittavat -- ei cssText-ylikirjoitusta
card.style.position = 'fixed';
card.style.left = rect.left + 'px';
card.style.top = rect.top + 'px';
card.style.width = rect.width + 'px';
card.style.height = rect.height + 'px';
card.style.zIndex = '1000';
card.style.opacity = '0.88';
card.style.pointerEvents = 'none';
card.style.transition = 'none';
card.style.boxShadow = '0 16px 48px rgba(0,0,0,0.55)';
card.style.transform = 'scale(1.03)';
card.after(placeholder);
dragging = card;
}

function onPointerMove(e) {
if (!dragging) return;
_lastMoveE = e;
dragging.style.left = (e.clientX - offsetX) + 'px';
dragging.style.top = (e.clientY - offsetY) + 'px';
startAutoScroll(e.clientY);
const grid = getGrid(); if (!grid) return;
let best = null, bestDist = Infinity;
getCards().forEach(card => {
if (card === dragging) return;
const r = card.getBoundingClientRect();
const dist = Math.hypot(e.clientX - (r.left + r.width/2), e.clientY - (r.top + r.height/2));
if (dist < bestDist) { bestDist = dist; best = card; }
});
if (best) {
const r = best.getBoundingClientRect();
if (e.clientY < r.top + r.height / 2) { grid.insertBefore(placeholder, best); }
else { best.after(placeholder); }
requestAnimationFrame(showDropIndicator);
}
}

function onPointerUp(e) {
if (!dragging) return;
stopAutoScroll();
hideDropIndicator();
// BUGFIX: palauta position:relative -- ei '' joka antaisi static
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
saveOrder(captureOrder());
applyAllSizes();
}

// ── CSS ─────────────────────────────────────────────────────────────────
function injectCSS() {
if (document.getElementById('layout-module-css')) return;
const style = document.createElement('style');
style.id = 'layout-module-css';
// position:relative !important varmuudeksi jos inline-tyyli jostain syyst\u00e4 tyhjenee
style.textContent = '#db-content{display:grid;grid-template-columns:repeat(3,1fr);grid-auto-flow:row;gap:12px}.card-wide{grid-column:1/-1}.card-normal{grid-column:auto}.drag-placeholder{background:rgba(0,200,255,0.07);border:2px dashed rgba(0,200,255,0.35);border-radius:12px;min-height:60px;transition:height .15s}#db-content>[data-item-id]{position:relative!important}';
document.head.appendChild(style);
}

// ── INIT ─────────────────────────────────────────────────────────────────
function initLayout() {
const grid = getGrid(); if (!grid) return;
injectCSS();
applyOrder();
applyAllSizes();
initDragging();
}

window.initLayout = initLayout;
window.applyDashboardLayout = function() { applyOrder(); applyAllSizes(); initDragging(); };

})();
