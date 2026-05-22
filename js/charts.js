function yearMarkersFor(data, xS, PT, iH) {
  const marks = [];
  let lastY = '';
  data.forEach((d, i) => {
    const y = d.d.slice(0,4);
    if (y !== lastY && i > 0) { marks.push({i, y}); lastY = y; }
    else if (i === 0) lastY = y;
  });
  return marks.map(m => `
    <line x1="${xS(m.i).toFixed(1)}" y1="${PT}" x2="${xS(m.i).toFixed(1)}" y2="${PT+iH}"
          stroke="#283028" stroke-width="1"/>
    <rect x="${(xS(m.i)-1).toFixed(1)}" y="${(PT+iH+2).toFixed(1)}" width="28" height="13"
          fill="#161917" rx="2"/>
    <text x="${(xS(m.i)+3).toFixed(1)}" y="${(PT+iH+12).toFixed(1)}"
          fill="#8a9490" font-family="IBM Plex Mono" font-size="10" font-weight="500">${m.y}</text>
  `).join('');
}

function bandPath(data, topFn, botFn, xS) {
  const n = data.length;
  const fwd = data.map((d,i) => `${xS(i).toFixed(1)},${topFn(d).toFixed(1)}`).join('L');
  const bwd = [...data].reverse().map((d,i) => `${xS(n-1-i).toFixed(1)},${botFn(d).toFixed(1)}`).join('L');
  return `M${fwd}L${bwd}Z`;
}

// ═══════════════════════════════════════════════
// GRAPH 1: STACKED AREA (Dashboard)
// ═══════════════════════════════════════════════
// current range stored globally
window._chartRange = 'Kaikki';
window._allSnaps   = null;

function setChartRange(range, btn) {
  window._chartRange = range;
  document.querySelectorAll('.range-btn').forEach(b => b.classList.remove('range-active'));
  if (btn) btn.classList.add('range-active');
  if (window._allSnaps) drawStackedChart(window._allSnaps);
}

function drawStackedChart(snaps) {
  window._allSnaps = snaps;
  const svg = document.getElementById('hist-svg');
  if (!svg) return;

  // Apply range filter
  const rangeMap = { '1v': 365, '3v': 365*3, '5v': 365*5, 'Kaikki': 99999 };
  const days = rangeMap[window._chartRange || 'Kaikki'] || 99999;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutISO = cutoff.toISOString().slice(0,10);

  const filtered = days >= 99999 ? snaps : snaps.filter(s => s.date >= cutISO);
  const src = filtered.length > 10 ? filtered : snaps;

  const data = src.map(s => {
    const c = calculateNetWorth(s);
    return { d: s.date, inv: c.investments, cash: c.cash,
             cred: c.shortTermDebt, loans: c.longTermDebt, nw: c.netWorth };
  });

  if (data.length < 2) return;

  const W=820, H=170, PL=2, PR=2, PT=8, PB=22;
  const iW=W-PL-PR, iH=H-PT-PB;

  const maxTop = Math.max(...data.map(d => d.inv + d.cash));
  const maxBot = Math.max(...data.map(d => d.cred + d.loans));
  const total  = (maxTop + maxBot) || 1;
  const minV   = -maxBot;
  const maxV   = maxTop;

  const xS = i  => PL + (i / (data.length-1)) * iW;
  const yS = v  => PT + iH - ((v - minV) / total) * iH;
  const z  = yS(0).toFixed(1);

  // Y-axis reference values
  const valsEl = document.getElementById('chart-vals');
  if (valsEl) {
    const first = data[0], last = data[data.length-1];
    const nwDelta = last.nw - first.nw;
    valsEl.innerHTML = `
      <span>${fmtDate(first.d)} &nbsp; <span style="color:var(--text3);">netto</span> ${fmt(first.nw)}</span>
      <span class="${dcls(nwDelta)}">${fmtDelta(nwDelta)} jakson aikana</span>
      <span>${fmtDate(last.d)} &nbsp; ${fmt(last.nw)}</span>
    `;
  }

  const invPath  = bandPath(data, d=>yS(d.inv),          d=>yS(0),         xS);
  const cashPath = bandPath(data, d=>yS(d.inv+d.cash),   d=>yS(d.inv),     xS);
  const credPath = bandPath(data, d=>yS(0),               d=>yS(-d.cred),   xS);
  const loanPath = bandPath(data, d=>yS(-d.cred),         d=>yS(-d.cred-d.loans), xS);
  const nwPts    = data.map((d,i)=>`${xS(i).toFixed(1)},${yS(d.nw).toFixed(1)}`).join('L');

  svg.innerHTML = `
    <defs>
      <linearGradient id="ig" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5b8db8" stop-opacity=".55"/>
        <stop offset="100%" stop-color="#5b8db8" stop-opacity=".15"/>
      </linearGradient>
      <linearGradient id="gg" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#5a9e6a" stop-opacity=".4"/>
        <stop offset="100%" stop-color="#5a9e6a" stop-opacity=".1"/>
      </linearGradient>
      <linearGradient id="og" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#b8956a" stop-opacity=".45"/>
        <stop offset="100%" stop-color="#b8956a" stop-opacity=".1"/>
      </linearGradient>
      <linearGradient id="rg" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0%" stop-color="#c05a5a" stop-opacity=".5"/>
        <stop offset="100%" stop-color="#c05a5a" stop-opacity=".1"/>
      </linearGradient>
    </defs>
    ${yearMarkersFor(data, xS, PT, iH)}
    <line x1="${PL}" y1="${z}" x2="${W-PR}" y2="${z}" stroke="#2c3130" stroke-width="1.5"/>
    <path d="${invPath}"  fill="url(#ig)"/>
    <path d="${cashPath}" fill="url(#gg)"/>
    <path d="${credPath}" fill="url(#og)"/>
    <path d="${loanPath}" fill="url(#rg)"/>
    <path d="M${nwPts}" fill="none" stroke="#b8956a" stroke-width="1.8"
          stroke-linejoin="round" stroke-linecap="round"/>
    <circle cx="${xS(data.length-1).toFixed(1)}" cy="${yS(data[data.length-1].nw).toFixed(1)}"
            r="3" fill="#b8956a"/>
    <!-- Crosshair (hidden by default) -->
    <line id="chart-crosshair" x1="0" y1="${PT}" x2="0" y2="${PT+iH}"
          stroke="#b8956a" stroke-width="1" stroke-dasharray="3,3" opacity="0"/>
    <!-- Hover dot on nw line -->
    <circle id="chart-hoverdot" cx="0" cy="0" r="4" fill="#b8956a"
            stroke="#0d0f0e" stroke-width="2" opacity="0"/>
    <!-- Invisible overlay for mouse events -->
    <rect id="chart-overlay" x="${PL}" y="${PT}" width="${iW}" height="${iH}"
          fill="transparent" style="cursor:crosshair;"/>
  `;

  // Store data for hover handler
  window._stackedData = data;
  window._stackedXS   = xS;
  window._stackedYS   = yS;
  window._stackedPL   = PL;
  window._stackedIW   = iW;
  window._stackedW    = W;

  // Attach hover events after innerHTML is set
  const overlay = document.getElementById('chart-overlay');
  if (overlay) {
    overlay.addEventListener('mousemove', onChartHover);
    overlay.addEventListener('mouseleave', onChartLeave);
    overlay.addEventListener('touchmove', e => {
      e.preventDefault();
      onChartHover(e.touches[0]);
    }, { passive: false });
    overlay.addEventListener('touchend', onChartLeave);
  }
}

// ═══════════════════════════════════════════════
// CHART HOVER (Dashboard stacked)
// ═══════════════════════════════════════════════
function onChartHover(e, rect) {
  const data = window._stackedData;
  if (!data || data.length < 2) return;

  // Convert mouse pos to SVG x coordinate
  const svgEl  = document.getElementById('hist-svg');
  const bbox   = svgEl.getBoundingClientRect();
  const relX   = e.clientX - bbox.left;
  const scaleX = 820 / bbox.width;
  const svgX   = relX * scaleX;

  // Find closest data index
  const PL = window._stackedPL;
  const IW = window._stackedIW;
  const t  = Math.max(0, Math.min(1, (svgX - PL) / IW));
  const idx = Math.round(t * (data.length - 1));
  const d   = data[idx];
  if (!d) return;

  const xS = window._stackedXS;
  const yS = window._stackedYS;
  const cx = xS(idx);
  const cy = yS(d.nw);

  // Update crosshair and dot
  const ch = document.getElementById('chart-crosshair');
  const hd = document.getElementById('chart-hoverdot');
  if (ch) { ch.setAttribute('x1', cx.toFixed(1)); ch.setAttribute('x2', cx.toFixed(1)); ch.setAttribute('opacity','0.7'); }
  if (hd) { hd.setAttribute('cx', cx.toFixed(1)); hd.setAttribute('cy', cy.toFixed(1)); hd.setAttribute('opacity','1'); }

  // Build tooltip
  const tt = document.getElementById('chart-tooltip');
  if (!tt) return;
  tt.style.display = 'block';

  // Position tooltip: avoid screen edges
  const ttW = 180, ttH = 120;
  let tx = e.clientX + 14;
  let ty = e.clientY - 10;
  if (tx + ttW > window.innerWidth - 8) tx = e.clientX - ttW - 14;
  if (ty + ttH > window.innerHeight - 8) ty = window.innerHeight - ttH - 8;
  tt.style.left  = tx + 'px';
  tt.style.top   = ty + 'px';

  const nwCls = d.nw >= 0 ? 'pos' : 'neg';
  tt.innerHTML = `
    <div class="tt-date">${fmtDate(d.d)}</div>
    <div class="tt-row"><span class="tt-lbl">Netto</span>
      <span class="tt-val ${nwCls}">${fmt(d.nw)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Sijoitukset</span>
      <span class="tt-val">${fmt(d.inv)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Käteinen</span>
      <span class="tt-val">${fmt(d.cash)}</span></div>
    <div class="tt-row"><span class="tt-lbl">Lainat</span>
      <span class="tt-val neg">${fmt(-d.loans)}</span></div>
  `;
}

function onChartLeave() {
  const tt = document.getElementById('chart-tooltip');
  if (tt) tt.style.display = 'none';
  const ch = document.getElementById('chart-crosshair');
  const hd = document.getElementById('chart-hoverdot');
  if (ch) ch.setAttribute('opacity','0');
  if (hd) hd.setAttribute('opacity','0');
}

// ═══════════════════════════════════════════════
// GRAPH 2: LAYERED HISTORY + EVENTS (Historia)
// ═══════════════════════════════════════════════