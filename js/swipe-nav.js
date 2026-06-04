// swipe-nav.js — Horizontal swipe navigation for mobile
// Swipeable views in order:
var SWIPE_VIEWS = ['dashboard', 'paivakirja', 'salkku', 'likviditeetti', 'historia'];

var _swipeStartX = 0;
var _swipeStartY = 0;
var _swipeActive = false;

document.addEventListener('touchstart', function(e) {
  if (window.innerWidth > 899) return;
  _swipeStartX = e.touches[0].clientX;
  _swipeStartY = e.touches[0].clientY;
  _swipeActive = true;
}, { passive: true });

document.addEventListener('touchmove', function(e) {
  if (!_swipeActive || window.innerWidth > 899) return;
  var dx = e.touches[0].clientX - _swipeStartX;
  var dy = e.touches[0].clientY - _swipeStartY;
  // Cancel swipe if moving mostly vertically
  if (Math.abs(dy) > Math.abs(dx)) _swipeActive = false;
}, { passive: true });

document.addEventListener('touchend', function(e) {
  if (!_swipeActive || window.innerWidth > 899) return;
  _swipeActive = false;
  var dx = e.changedTouches[0].clientX - _swipeStartX;
  var dy = e.changedTouches[0].clientY - _swipeStartY;
  // Ignore if mostly vertical or too short
  if (Math.abs(dy) > Math.abs(dx) || Math.abs(dx) < 50) return;
  // Find current view
  var activeView = document.querySelector('.view.active');
  if (!activeView) return;
  var curId = activeView.id.replace('view-', '');
  var cur = SWIPE_VIEWS.indexOf(curId);
  if (cur === -1) return;
  var next = dx < 0 ? cur + 1 : cur - 1;
  if (next >= 0 && next < SWIPE_VIEWS.length) {
    if (typeof showView === 'function') showView(SWIPE_VIEWS[next]);
  }
}, { passive: true });
