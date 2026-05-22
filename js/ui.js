async function renderDashboard() {
  const c = document.getElementById('db-content');
  const cnt = await DB.count('snapshots');

  if (cnt === 0) {
    c.innerHTML = `
      <div class="empty">
        <div class="empty-icon">📊</div>
        <div class="empty-title">Ei dataa vielä</div>
        <p style="margin-bottom:20px">Tuo Numbers-historia aloittaaksesi</p>
        <button class="btn-p" onclick="showView('import')">Tuo data →</button>
      </div>`;
    return;
  }

  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const latest = snaps[snaps.length - 1];
  const prev   = snaps.length > 1 ? snaps[snaps.length - 2] : null;

  // ── CALCULATION ENGINE ──
  const calc     = calculateNetWorth(latest);
  const calcPrev = prev ? calculateNetWorth(prev) : null;

  const nw       = calc.netWorth;
  const prevNw   = calcPrev ? calcPrev.netWorth : null;
  const delta    = prevNw !== null ? nw - prevNw : null;

  // Aliases for template clarity
  const inv        = calc.investments;
  const cash       = calc.cash;
  const creditDebt = calc.shortTermDebt;
  const ltDebt     = calc.longTermDebt;
  const trueLiquid = cash - creditDebt;

  // 5kk OP Gold: kaksi vertailua
  const opGoldStats = (() => {
    const d = latest.date || new Date().toISOString().slice(0,10);
    const yr = parseInt(d.slice(0,4)), mo = parseInt(d.slice(5,7));
    const dayNum = parseInt(d.slice(8,10));

    const peakVals = [];   // kuukauden huiput (max per kk)
    const paceVals = [];   // saman päivänumeron arvot

    for (let i = 1; i <= 5; i++) {
      let m = mo - i, y = yr;
      if (m <= 0) { m += 12; y -= 1; }
      const mStr = y + '-' + String(m).padStart(2,'0');
      const monthSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
      if (!monthSnaps.length) continue;

      // Peak: kuukauden maksimisaldo
      const peak = Math.max(...monthSnaps.map(s => Math.abs(s.op_gold)));
      if (peak > 0) peakVals.push(peak);

      // Pace: lähin snapshot samalle päivänumerolle (±3 pv)
      let best = null, bestDiff = 999;
      for (const s of monthSnaps) {
        const sDay = parseInt(s.date.slice(8,10));
        const diff = Math.abs(sDay - dayNum);
        if (diff < bestDiff) { bestDiff = diff; best = s; }
      }
      if (best && bestDiff <= 3) paceVals.push(Math.abs(best.op_gold));
    }

    return {
      peakAvg: peakVals.length ? peakVals.reduce((a,b)=>a+b,0)/peakVals.length : null,
      paceAvg: paceVals.length ? paceVals.reduce((a,b)=>a+b,0)/paceVals.length : null,
      dayNum,
    };
  })();

  // ── COMPOSITION BAR ──
  const totalAssets = (inv || 0) + cash;
  const compMax = Math.max(totalAssets, creditDebt + ltDebt, 1);
  const invPct    = Math.round(((inv || 0)  / compMax) * 100);
  const cashPct   = Math.round((cash        / compMax) * 100);
  const creditPct = Math.round((creditDebt  / compMax) * 100);
  const ltPct     = Math.round((ltDebt      / compMax) * 100);

  // ── MULTI-PERIOD CHANGES ──
  const periods = [
    { label: 'tänään', snap: prev },
    { label: '30 pv',  snap: snapBefore(snaps, daysAgoISO(30)) },
    { label: '6 kk',   snap: snapBefore(snaps, daysAgoISO(180)) },
    { label: '1 v',    snap: snapBefore(snaps, daysAgoISO(365)) },
    { label: '3 v',    snap: snapBefore(snaps, daysAgoISO(365*3)) },
  ];

  const periodChips = periods.map(p => {
    if (!p.snap || p.snap.date === latest.date) return null;
    const refCalc = calculateNetWorth(p.snap);
    const ref = refCalc.netWorth;
    const d = nw - ref;
    const pct = fmtPct(ref, nw);
    return {
      label: p.label,
      d, pct,
      date: p.snap.date,
      // Erittely osa-alueittain
      dInv:   calc.investments - refCalc.investments,
      dCash:  calc.cash        - refCalc.cash,
      dST:    -(calc.shortTermDebt - refCalc.shortTermDebt),
      dLT:    -(calc.longTermDebt  - refCalc.longTermDebt),
      // Per-rivi muutokset
      rows: [
        { l: 'Nordnet',             d: (latest.nordnet||0)              - (p.snap.nordnet||0) },
        { l: 'OP Osakkeet',         d: (latest.op_osakkeet||0)          - (p.snap.op_osakkeet||0) },
        { l: 'Tapiola',             d: (latest.tapiola||0)              - (p.snap.tapiola||0) },
        { l: 'S-Sijoitus',          d: (latest.s_sijoitus||0)           - (p.snap.s_sijoitus||0) },
        { l: 'Rahastot',            d: (latest.rahastot||0)             - (p.snap.rahastot||0) },
        { l: 'Tulotili + tilit',    d: calc.cash - refCalc.cash },
        { l: 'Luottokortit',        d: -(calc.shortTermDebt - refCalc.shortTermDebt) },
        { l: 'Asuntolaina',         d: -((latest.asuntolaina||0)        - (p.snap.asuntolaina||0)) },
        { l: 'Asuntolaina (rem.)',   d: -((latest.asuntolaina_remontti||0) - (p.snap.asuntolaina_remontti||0)) },
        { l: 'Autolaina',           d: -((latest.autolaina||0)          - (p.snap.autolaina||0)) },
      ].filter(r => Math.abs(r.d) >= 1),
    };
  }).filter(Boolean);

  // Tallenna periodData globaalisti selectPeriod-funktiota varten
  window._periodData = periodChips;

  // ── WHAT CHANGED ──
  const TRACKED = [
    { f: 'nordnet',              l: 'Nordnet' },
    { f: 'op_osakkeet',         l: 'OP Osakkeet' },
    { f: 'tapiola',             l: 'Tapiola' },
    { f: 's_sijoitus',          l: 'S-Sijoitus' },
    { f: 'rahastot',            l: 'Rahastot' },
    { f: 'lasten_sijoitus',     l: 'Lasten sijoitus' },
    { f: 'tulotili',            l: 'Tulotili' },
    { f: 'op_gold',             l: 'OP Gold' },
    { f: 'asuntolaina',         l: 'Asuntolaina' },
    { f: 'asuntolaina_remontti',l: 'Asuntolaina (rek.)' },
    { f: 'autolaina',           l: 'Autolaina' },
  ];

  const changes = prev ? TRACKED
    .map(t => {
      const a = prev[t.f] ?? null;
      const b = latest[t.f] ?? null;
      if (a === null || b === null) return null;
      const diff = b - a;
      const pct = (a !== 0) ? ((diff / Math.abs(a)) * 100) : null;
      return { l: t.l, cur: b, diff, pct };
    })
    .filter(x => x && Math.abs(x.diff) >= 0.5)
    .sort((a,b) => Math.abs(b.diff) - Math.abs(a.diff))
    .slice(0, 8)
    : [];

  // Recent events
  const evts = (await DB.getAll('events')).sort((a,b) => b.date.localeCompare(a.date)).slice(0, 5);

  c.innerHTML = `
    <div class="db-date" style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px;">
      <span>${fmtDate(latest.date)} &nbsp;·&nbsp; ${cnt.toLocaleString('fi-FI')} snapshottia &nbsp;·&nbsp; ${snaps[0].date.slice(0,4)}–${latest.date.slice(0,4)}</span>
      ${backupStatusBadge()}
      ${syncStatusBadge()}
    </div>

    <!-- ── SE SUURI NAPPI ── -->
    <button onclick="rollbackLatestSnapshot()" style="font-size:11px;padding:6px 12px;
      background:rgba(255,100,100,0.08);border:1px solid rgba(255,100,100,0.2);
      border-radius:7px;color:#c07070;cursor:pointer;font-family:var(--mono);"
      title="Palauta edellinen snapshot">↩ Rollback</button>
    <button id="btn-freeze" onclick="refreshAndFreeze()"
      style="width:100%;margin-bottom:20px;padding:14px 20px;
             background:linear-gradient(135deg,#1a2818,#1a1d1b);
             border:1px solid #3a5535;border-radius:12px;
             color:#5a9e6a;font-family:'Syne',sans-serif;
             font-weight:800;font-size:15px;letter-spacing:.04em;
             cursor:pointer;transition:all .2s;display:flex;
             align-items:center;justify-content:center;gap:10px;">
      <span id="btn-freeze-icon" style="font-size:20px;">↻</span>
      <span id="btn-freeze-label">Päivitä kurssit &amp; Jäädytä snapshot</span>
    </button>
    <div id="freeze-status" style="display:none;margin:-12px 0 16px;padding:10px 14px;
      border-radius:8px;font-family:'IBM Plex Mono',monospace;font-size:12px;
      background:rgba(90,158,106,.08);border:1px solid rgba(90,158,106,.25);color:#5a9e6a;">
    </div>

    <div class="kpi-grid">
      <!-- Net Worth + koostumus + periodit -->
      <div class="card kpi-wide" style="background:var(--surface2);">
        <div class="card-label">Nettovarallisuus</div>
        <div class="card-value" style="font-size:38px;">${fmt(nw)}</div>
        ${delta !== null ? `<div class="card-delta ${dcls(delta)}">${fmtDelta(delta)} vs. ${fmtDate(prev.date)}</div>` : ''}
        <!-- Engine breakdown -->
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);
                    display:flex;gap:20px;flex-wrap:wrap;">
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Omaisuus</div>
            <div style="font-family:var(--mono);font-size:13px;color:var(--green);">+${fmt(calc.assets)}</div>
          </div>
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Luottokortit</div>
            <div style="font-family:var(--mono);font-size:13px;color:var(--gold);">${fmt(-calc.shortTermDebt)}</div>
          </div>
          <div>
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Lainat</div>
            <div style="font-family:var(--mono);font-size:13px;color:var(--red);">${fmt(-calc.longTermDebt)}</div>
          </div>
          <div style="margin-left:auto;">
            <div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">= Netto</div>
            <div style="font-family:var(--mono);font-size:13px;font-weight:600;color:${calc.netWorth>=0?'var(--green)':'var(--red)'};">${fmt(calc.netWorth)}</div>
          </div>
        </div>

        <!-- Koostumus -->
        <div class="comp-wrap">
          <div class="comp-legend">
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--blue)"></div>Sijoitukset ${fmt(inv)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--green)"></div>Käteinen ${fmt(cash)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--gold)"></div>Luottokortit ${fmt(-creditDebt)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--red)"></div>Lainat ${fmt(-ltDebt)}</div>
          </div>
          <div class="comp-track" title="Omaisuus">
            <div class="comp-seg" style="width:${invPct}%;background:var(--blue);opacity:.75;"></div>
            <div class="comp-seg" style="width:${cashPct}%;background:var(--green);opacity:.75;"></div>
          </div>
          <div class="comp-track" title="Velat" style="margin-top:3px;">
            <div class="comp-seg" style="width:${creditPct}%;background:var(--gold);opacity:.65;"></div>
            <div class="comp-seg" style="width:${ltPct}%;background:var(--red);opacity:.65;"></div>
          </div>
          <div class="comp-labels">
            <span>Omaisuus ${fmt(totalAssets)}</span>
            <span>Velat yht. ${fmt(-(creditDebt + ltDebt))}</span>
          </div>
        </div>

        <!-- Moniaikajaksoiset muutokset -->
        ${periodChips.length > 0 ? `
        <div class="period-row" style="margin-top:14px;" id="period-chips-row">
          ${periodChips.map((p,i) => `
            <div class="period-chip" onclick="selectPeriod(${i})" id="pchip-${i}"
              style="cursor:pointer;transition:all .12s;">
              <span class="period-label">${p.label.toUpperCase()}</span>
              <span class="period-val ${dcls(p.d)}">${fmtDelta(p.d)}</span>
              ${p.pct ? `<span style="font-size:9px;color:var(--text3);">${p.pct}</span>` : ''}
            </div>`).join('')}
        </div>

        <!-- Muutoksen erittely -->
        <div id="period-breakdown" style="margin-top:12px;padding:12px 14px;
          border-radius:9px;background:rgba(0,200,255,0.03);border:1px solid var(--border);">
          <div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;
            color:var(--text3);margin-bottom:10px;" id="breakdown-title">
            Napauta ajanjaksoa nähdäksesi erittely
          </div>
          <div id="breakdown-rows"></div>
        </div>` : ''}
      </div>

      <!-- Sijoitukset -->
      <div class="card">
        <div class="card-label">Sijoitukset</div>
        <div class="card-value">${fmt(inv)}</div>
        <div class="sub-rows">
          ${(()=>{
            const invRows = [
              { f:'nordnet',     l:'Nordnet' },
              { f:'op_osakkeet', l:'OP Osakkeet' },
              { f:'tapiola',     l:'Tapiola' },
              { f:'s_sijoitus',  l:'S-Sijoitus' },
              { f:'rahastot',    l:'Rahastot' },
            ];
            const snap1d  = prev;
            const snap1mo = snapBefore(snaps, daysAgoISO(30));
            return invRows.filter(r => latest[r.f]).map(r => {
              const cur  = latest[r.f];
              const v1d  = snap1d  ? snap1d[r.f]  : null;
              const v1mo = snap1mo ? snap1mo[r.f] : null;
              const p1d  = (v1d  && v1d  !== 0) ? ((cur - v1d)  / Math.abs(v1d))  * 100 : null;
              const p1mo = (v1mo && v1mo !== 0) ? ((cur - v1mo) / Math.abs(v1mo)) * 100 : null;
              const pctSpan = (p, label) => p !== null
                ? `<span style="font-size:10px;color:${Math.abs(p)<0.01?'var(--text3)':p>=0?'var(--green)':'var(--red)'};">${label} ${p>=0?'+':''}${p.toFixed(1)}%</span>`
                : '';
              return `<div class="sub-row">
                <span>${r.l}</span>
                <span style="display:flex;gap:8px;align-items:center;">
                  ${pctSpan(p1d,'1pv')} ${pctSpan(p1mo,'1kk')}
                  <span style="font-family:var(--mono);">${fmt(cur)}</span>
                </span>
              </div>`;
            }).join('');
          })()}

        </div>
      </div>

      <!-- Käyttötilit + todellinen likviditeetti -->
      <div class="card">
        <div class="card-label">Käyttötilit</div>
        <div class="card-value">${fmt(cash)}</div>
        <div class="sub-rows">
          ${latest.tulotili !== undefined ? `<div class="sub-row"><span>Tulotili</span><span>${fmt(latest.tulotili)}</span></div>` : ''}
          ${latest.s_pankki !== undefined ? `<div class="sub-row"><span>S-Pankki</span><span>${fmt(latest.s_pankki)}</span></div>` : ''}
          ${latest.tavoitetili !== undefined ? `<div class="sub-row"><span>Tavoitetili</span><span>${fmt(latest.tavoitetili)}</span></div>` : ''}
          ${latest.elatustili !== undefined ? `<div class="sub-row"><span>Elatustili</span><span>${fmt(latest.elatustili)}</span></div>` : ''}
        </div>
        <div style="margin-top:12px; padding-top:10px; border-top:1px solid var(--border);">
          <div class="sub-row" style="font-size:11px;">
            <span style="color:var(--text2);">Todellinen likviditeetti</span>
            <span style="font-family:var(--mono); color:${trueLiquid >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(trueLiquid)}</span>
          </div>
          <div style="font-size:10px; color:var(--text3); margin-top:2px;">käteinen − luottokortit</div>
        </div>
      </div>

      <!-- Short-term liabilities: luottokortit -->
      <div class="card">
        <div class="card-label" style="color:var(--gold-dim);">Luottokortit</div>
        <div class="card-value" style="color:var(--gold);">${fmt(-creditDebt)}</div>
        <div class="sub-rows">
          ${latest.op_gold !== undefined ? `<div class="sub-row"><span>OP Gold</span><span style="color:var(--gold);">${fmt(-Math.abs(latest.op_gold))}</span></div>` : ''}
          ${latest.visa !== undefined ? `<div class="sub-row"><span>Visa</span><span style="color:var(--gold);">${fmt(-Math.abs(latest.visa))}</span></div>` : ''}
          ${latest.luottotili !== undefined ? `<div class="sub-row"><span>Luottotili</span><span style="color:var(--gold);">${fmt(-Math.abs(latest.luottotili))}</span></div>` : ''}
          <div style="height:1px;background:var(--border);margin:8px 0;"></div>
          <div class="sub-row">
            <span style="color:var(--text2);font-weight:600;">Tulotili − luottokortit</span>
            <span style="font-family:var(--mono);font-weight:700;color:${trueLiquid >= 0 ? 'var(--green)' : 'var(--red)'};">${fmt(trueLiquid)}</span>
          </div>
        </div>
        ${(opGoldStats.paceAvg !== null || opGoldStats.peakAvg !== null) ? (() => {
          const cur = Math.abs(latest.op_gold ?? 0);
          const pace = opGoldStats.paceAvg;
          const peak = opGoldStats.peakAvg;
          const diff = pace !== null ? cur - pace : null;
          const tempo = (pace && pace > 0) ? Math.round((cur / pace) * 100) : null;
          const cls = diff === null || Math.abs(diff) < 10 ? "var(--text3)"
                    : diff > 0 ? "var(--red)" : "var(--green)";
          const tempoCls = tempo === null ? "var(--text3)"
                         : tempo > 115 ? "var(--red)"
                         : tempo < 85  ? "var(--green)"
                         : "var(--text2)";
          let html = "<div style=\"margin-top:10px;padding-top:8px;border-top:1px solid var(--border);\">";
          html += "<div style=\"font-size:9px;text-transform:uppercase;letter-spacing:.07em;color:var(--text3);margin-bottom:6px;\">Kulutustempo · pv " + opGoldStats.dayNum + "</div>";
          if (pace !== null) {
            html += "<div style=\"display:flex;justify-content:space-between;font-size:11px;margin-bottom:2px;\">" +
              "<span style=\"color:var(--text2)\">5kk ka. sama pv</span>" +
              "<span style=\"font-family:var(--mono);color:var(--text2)\">" + fmt(-pace) + "</span></div>";
          }
          if (peak !== null) {
            html += "<div style=\"display:flex;justify-content:space-between;font-size:11px;margin-bottom:6px;\">" +
              "<span style=\"color:var(--text3)\">5kk ka. huippu</span>" +
              "<span style=\"font-family:var(--mono);color:var(--text3)\">" + fmt(-peak) + "</span></div>";
          }
          if (diff !== null) {
            const diffTxt = diff > 10 ? "+" + fmt(diff) + " normaalia enemmän"
                          : diff < -10 ? fmt(diff) + " normaalia vähemmän"
                          : "normaali tahti";
            html += "<div style=\"font-size:11px;color:" + cls + ";font-weight:600;\">" + diffTxt + "</div>";
          }
          // ── Graafinen palkki ──
          if (pace !== null && cur !== null) {
            const barMax  = Math.max(cur, pace, peak || 0) * 1.1 || 1;
            const curPct  = Math.round((cur  / barMax) * 100);
            const pacePct = Math.round((pace / barMax) * 100);
            const peakPct = peak ? Math.round((peak / barMax) * 100) : 0;
            const barColor = tempo === null ? "var(--gold)"
                           : tempo > 115   ? "var(--red)"
                           : tempo < 85    ? "var(--green)"
                           : "var(--gold)";
            html += '<div style="margin-top:10px;">';
            html += '<div style="position:relative;height:28px;background:var(--surface2);border-radius:6px;overflow:hidden;">';
            if (peakPct) html += '<div style="position:absolute;left:0;top:0;bottom:0;width:' + peakPct + '%;background:rgba(192,90,90,0.15);"></div>';
            html += '<div style="position:absolute;left:0;top:0;bottom:0;width:' + pacePct + '%;background:rgba(184,149,106,0.20);"></div>';
            html += '<div style="position:absolute;left:0;top:0;bottom:0;width:' + curPct + '%;background:' + barColor + ';opacity:0.75;border-radius:6px;transition:width .4s;"></div>';
            html += '<div style="position:absolute;left:' + pacePct + '%;top:0;bottom:0;width:2px;background:rgba(184,149,106,0.6);"></div>';
            html += '<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 8px;justify-content:space-between;">';
            html += '<span style="font-family:IBM Plex Mono,monospace;font-size:11px;font-weight:600;color:#fff;">' + fmt(-cur) + '</span>';
            html += '<span style="font-size:10px;color:rgba(255,255,255,0.5);">' + (tempo !== null ? tempo + ' %' : '') + '</span></div></div>';
            html += '<div style="display:flex;justify-content:space-between;margin-top:4px;font-size:9px;color:var(--text3);">';
            html += '<span>0</span>';
            if (peakPct) html += '<span style="color:rgba(192,90,90,0.6);">huippu ' + fmt(-peak) + '</span>';
            html += '<span style="color:rgba(184,149,106,0.6);">ka. ' + fmt(-pace) + '</span></div></div>';
          }
          if (tempo !== null) {
            html += "<div style=\"font-size:10px;color:" + tempoCls + ";margin-top:4px;font-weight:600;\">" + tempo + " % normaalista</div>";
          }
          html += "</div>";
          return html;
        })() : ""}
        <div style="font-size:10px; color:var(--text3); margin-top:6px;">lyhytaikainen · kk-sykli · ei korkoa</div>
      </div>

      <!-- Long-term debt: lainat -->
      <div class="card">
        <div class="card-label">Pitkäaikaiset lainat</div>
        <div class="card-value" style="color:var(--red);">${fmt(-ltDebt)}</div>
        <div class="sub-rows">
          ${latest.asuntolaina !== undefined ? `<div class="sub-row"><span>Asuntolaina</span><span>${fmt(latest.asuntolaina)}</span></div>` : ''}
          ${latest.asuntolaina_remontti !== undefined ? `<div class="sub-row"><span>+ Remontti</span><span>${fmt(latest.asuntolaina_remontti)}</span></div>` : ''}
          ${latest.autolaina !== undefined ? `<div class="sub-row"><span>Autolaina</span><span>${fmt(latest.autolaina)}</span></div>` : ''}
        </div>
      </div>
    </div>

    <!-- Historia -->
    <div class="sec">Historia</div>
    <div class="chart-card">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
        <span class="chart-label">Nettovarallisuus</span>
        <div style="display:flex;gap:4px;" id="range-btns">
          ${['1v','3v','5v','Kaikki'].map((r,i) => `
            <button onclick="setChartRange('${r}', this)" class="range-btn ${i===3?'range-active':''}">${r}</button>
          `).join('')}
        </div>
      </div>
      <div style="display:flex;justify-content:space-between;font-family:var(--mono);font-size:11px;color:var(--text2);margin-bottom:8px;" id="chart-vals"></div>
      <svg id="hist-svg" viewBox="0 0 820 170" preserveAspectRatio="none" style="display:block;width:100%;height:170px;overflow:visible;"></svg>
    </div>

    <!-- What Changed -->
    ${changes.length > 0 ? `
    <div class="sec">Mitä muuttui?</div>
    <div class="change-list">
      ${changes.map(ch => `
        <div class="change-row">
          <div class="change-name">${ch.l}</div>
          <div class="change-right">
            <span class="change-cur">${fmt(ch.cur)}</span>
            <span class="change-delta ${dcls(ch.diff)}">${fmtDelta(ch.diff)}${ch.pct !== null ? ' <span style=\'font-size:10px;opacity:.6;\'>('+ch.pct.toFixed(1)+' %)</span>' : ''}</span>
          </div>
        </div>`).join('')}
    </div>` : prev ? `<p style="color:var(--text2);font-size:13px;margin-bottom:24px;">Ei muutoksia edelliseen merkintään.</p>` : ''}

    <!-- Viimeisimmät tapahtumat -->
    ${evts.length > 0 ? `
    <div class="sec">Viimeisimmät tapahtumat</div>
    <div class="ev-list">
      ${evts.map(ev => `
        <div class="ev-item ${ev.type}">
          <div class="ev-meta">
            <div class="ev-date">${fmtDate(ev.date)}</div>
            <div class="ev-src">${ev.source || ''}</div>
          </div>
          <div class="ev-body">
            ${ev.note
              ? `<div class="ev-note-text">${ev.note}</div>`
              : `<div class="ev-title">${ev.title}</div>`}
            ${ev.amount !== null ? `<div class="ev-amt">${fmt(ev.amount)}</div>` : ''}
          </div>
        </div>`).join('')}
    </div>` : ''}
  `;

  drawStackedChart(snaps);
}

// ═══════════════════════════════════════════════
// CHART
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// SHARED CHART HELPERS
// ═══════════════════════════════════════════════
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
async function renderHistoria() {
  const c = document.getElementById('hist-view-content');
  autoBackup();
  const cnt = await DB.count('snapshots');
  if (cnt === 0) {
    c.innerHTML = `<div class="empty"><div class="empty-icon">📈</div>
      <div class="empty-title">Ei dataa</div></div>`;
    return;
  }

  const snaps = (await DB.getAll('snapshots')).sort((a,b)=>a.date.localeCompare(b.date));
  const evts  = await DB.getAll('events');

  const LAYERS = [
    { id:'ly-nw',     field:'net_worth',   label:'Nettovarallisuus', color:'#b8956a', w:1.8, def:true  },
    { id:'ly-inv',    field:'_inv',        label:'Sijoitukset',      color:'#5b8db8', w:1.2, def:true  },
    { id:'ly-cash',   field:'_cash',       label:'Käteinen',         color:'#5a9e6a', w:1.0, def:false },
    { id:'ly-loans',  field:'_loans',      label:'Lainat (neg.)',    color:'#c05a5a', w:1.0, def:false },
  ];

  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;flex-wrap:wrap;gap:8px;">
      <div class="sec" style="margin:0;">Varallisuushistoria</div>
      <div style="display:flex;gap:8px;">
        <button onclick="rollbackLatestSnapshot()" style="font-size:10px;padding:5px 11px;
          background:rgba(192,90,90,0.08);border:1px solid rgba(192,90,90,0.25);
          border-radius:7px;color:#c07070;cursor:pointer;font-family:var(--mono);">↩ Rollback</button>
        <button onclick="downloadBackupNow()" style="font-size:10px;padding:5px 11px;
          background:rgba(90,158,106,0.08);border:1px solid rgba(90,158,106,0.25);
          border-radius:7px;color:#6ab87a;cursor:pointer;font-family:var(--mono);">↓ Lataa backup</button>
        <button onclick="showBackupList()" style="font-size:10px;padding:5px 11px;
          background:none;border:1px solid var(--border);
          border-radius:7px;color:var(--text3);cursor:pointer;font-family:var(--mono);">📋 Backupit</button>
      </div>
    </div>
    <div id="backup-list-panel"></div>
    <div class="sec" style="margin-top:4px;">Varallisuushistoria</div>
    <div style="display:flex;gap:14px;flex-wrap:wrap;margin-bottom:14px;align-items:center;">
      ${LAYERS.map(l=>`
        <label style="display:flex;align-items:center;gap:5px;cursor:pointer;font-size:12px;color:var(--text2);">
          <input type="checkbox" id="${l.id}" ${l.def?'checked':''} onchange="redrawLayered()">
          <span style="color:${l.color};font-family:var(--mono);font-weight:600;">—</span>
          ${l.label}
        </label>`).join('')}
    </div>
    <div class="chart-card" style="padding:16px 12px;">
      <svg id="layered-svg" viewBox="0 0 820 200" preserveAspectRatio="none"
           style="display:block;width:100%;height:220px;overflow:visible;"></svg>
    </div>
    <div id="ev-info" style="display:none;margin-top:8px;background:var(--surface2);
         border:1px solid var(--border);border-radius:8px;padding:11px 14px;font-size:12px;
         color:var(--text);line-height:1.5;"></div>
    <div style="margin-top:6px;font-size:10px;color:var(--text3);font-family:var(--mono);">
      • = tapahtuma — klikkaa nähdäksesi tiedot
    </div>
  `;

  window._lSnaps = snaps;
  window._lEvts  = evts;
  window._lLayers = LAYERS;
  redrawLayered();
}

function redrawLayered() {
  const snaps = window._lSnaps;
  const evts  = window._lEvts;
  const LAYERS = window._lLayers;
  if (!snaps) return;

  const svg = document.getElementById('layered-svg');
  if (!svg) return;

  const data = snaps.map(s => {
    const c = calculateNetWorth(s);
    return { d: s.date, net_worth: c.netWorth, _inv: c.investments,
             _cash: c.cash, _loans: -c.longTermDebt };
  });

  const visible = LAYERS.filter(l => {
    const el = document.getElementById(l.id);
    return el && el.checked;
  });

  const allVals = [];
  visible.forEach(l => data.forEach(d => { if (d[l.field]!==null) allVals.push(d[l.field]); }));
  if (!allVals.length) { svg.innerHTML=''; return; }

  const W=820, H=200, PL=2, PR=2, PT=8, PB=22;
  const iW=W-PL-PR, iH=H-PT-PB;
  const minV = Math.min(...allVals) * 1.08;
  const maxV = Math.max(...allVals) * 1.08;
  const rng  = (maxV - minV) || 1;
  const xS   = i => PL + (i/(data.length-1))*iW;
  const yS   = v => PT + iH - ((v-minV)/rng)*iH;

  const zeroLine = (minV<0 && maxV>0)
    ? `<line x1="${PL}" y1="${yS(0).toFixed(1)}" x2="${W-PR}" y2="${yS(0).toFixed(1)}"
            stroke="#2c3130" stroke-width="1" stroke-dasharray="3,4"/>`
    : '';

  const lines = visible.map(l => {
    const pts = data
      .map((d,i) => d[l.field]!==null ? `${xS(i).toFixed(1)},${yS(d[l.field]).toFixed(1)}` : null)
      .filter(Boolean).join('L');
    return `<path d="M${pts}" fill="none" stroke="${l.color}" stroke-width="${l.w}"
                  stroke-linejoin="round" stroke-linecap="round" opacity=".9"/>`;
  }).join('');

  // Date → index map for event markers
  const dIdx = {};
  data.forEach((d,i) => { dIdx[d.d] = i; });

  // Only show significant events (amount > 50€) to avoid clutter, max 40
  const sigEvts = evts
    .filter(ev => ev.amount && Math.abs(ev.amount) >= 50 && dIdx[ev.date] !== undefined)
    .sort((a,b) => Math.abs(b.amount)-Math.abs(a.amount))
    .slice(0, 40);

  const typeColor = { dividend:'#5a9e6a', purchase:'#c05a5a', sale:'#5b8db8',
                      transfer:'#b8956a', note:'#6e7470' };

  const markers = sigEvts.map(ev => {
    const i = dIdx[ev.date];
    const nwSnap = data[i].net_worth;
    const yVal = nwSnap !== null ? nwSnap : (data[i]._inv || 0);
    const cx = xS(i).toFixed(1);
    const cy = yS(yVal).toFixed(1);
    const col = typeColor[ev.type] || '#b8956a';
    const label = JSON.stringify(
      `${fmtDate(ev.date)} — ${ev.title}${ev.source?' ('+ev.source+')':''}${ev.amount?' '+fmt(ev.amount):''}${ev.note?' — '+ev.note:''}`
    );
    return `<circle cx="${cx}" cy="${cy}" r="4" fill="${col}" stroke="#0d0f0e"
               stroke-width="1" style="cursor:pointer;"
               onclick="showEvInfo(${label})">
               <title>${fmtDate(ev.date)}: ${ev.title} ${ev.amount ? fmt(ev.amount) : (ev.note||'')}</title>
             </circle>`;
  }).join('');

  svg.innerHTML = `
    ${yearMarkersFor(data, xS, PT, iH)}
    ${zeroLine}
    ${lines}
    ${markers}
  `;
}

function showEvInfo(text) {
  const el = document.getElementById('ev-info');
  if (!el) return;
  el.style.display = 'block';
  el.innerHTML = `<span style="color:var(--gold);">◆</span> ${text}`;
}

// ═══════════════════════════════════════════════
// EVENTS VIEW
// ═══════════════════════════════════════════════
// ── Tapahtuma-tyypit ────────────────────────────────────────────────────
const EV_TYPES = [
  { id: 'dividend',      label: 'Osinko',          icon: '💰', color: 'var(--green)'  },
  { id: 'purchase',      label: 'Osto',             icon: '📈', color: 'var(--cyan)'   },
  { id: 'sale',          label: 'Myynti',           icon: '📉', color: 'var(--amber)'  },
  { id: 'transfer_in',   label: 'Siirto sisään',    icon: '⬇',  color: 'var(--cyan)'   },
  { id: 'transfer_out',  label: 'Siirto ulos',      icon: '⬆',  color: 'var(--text3)'  },
  { id: 'fee',           label: 'Kulu/välityspalkkio', icon: '💸', color: 'var(--red)' },
  { id: 'other',         label: 'Muu',              icon: '📝', color: 'var(--text2)'  },
];

let _evFormOpen = false;


async function updateBackupStatus() {
  const el = document.getElementById('backup-status-text');
  if (!el) return;
  const backups = await DB.getAll('backups').catch(() => []);
  if (backups.length === 0) { el.textContent = 'Ei varmuuskopioita vielä. Tallenna päivä niin varmuuskopio syntyy automaattisesti.'; return; }
  const latest = backups.sort((a,b) => b.id.localeCompare(a.id))[0];
  const d = new Date(latest.created_at);
  el.textContent = backups.length + ' varmuuskopiota · Viimeisin ' + d.toLocaleDateString('fi-FI') + ' ' + d.toLocaleTimeString('fi-FI',{hour:'2-digit',minute:'2-digit'});
}

async function showRestoreOptions() {
  const el = document.getElementById('restore-options');
  if (!el) return;
  const backups = (await DB.getAll('backups').catch(() => [])).sort((a,b) => b.id.localeCompare(a.id));
  if (backups.length === 0) { el.style.display='block'; el.innerHTML='<div style="color:var(--text3);font-size:11px">Ei varmuuskopioita.</div>'; return; }
  el.style.display = 'block';
  el.innerHTML = '<div style="font-size:9px;color:var(--text3);margin-bottom:6px;">Valitse palautettava varmuuskopio:</div>' +
    backups.slice(0,10).map(b => {
      const d = new Date(b.created_at);
      return '<button onclick="restoreFromBackup(\'' + b.id + '\')" style="display:block;width:100%;text-align:left;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text2);font-family:var(--mono);font-size:11px;cursor:pointer;margin-bottom:4px;">' +
        d.toLocaleDateString('fi-FI') + ' · ' + (b.snapCount || '?') + ' snapshottia</button>';
    }).join('');
}

async function renderEvents() {
  const c = document.getElementById('ev-content');
  const evts = (await DB.getAll('events')).sort((a,b) => b.date.localeCompare(a.date));

  const totalDiv  = evts.filter(e => e.type==='dividend').reduce((s,e) => s+(e.amount||0), 0);
  const totalBuy  = evts.filter(e => e.type==='purchase').reduce((s,e) => s+(e.amount||0), 0);
  const totalSell = evts.filter(e => e.type==='sale').reduce((s,e) => s+(e.amount||0), 0);

  // Group by year
  const byYear = {};
  for (const ev of evts) {
    const y = (ev.date||'????').slice(0,4);
    (byYear[y] = byYear[y] || []).push(ev);
  }

  function evTypeInfo(type) {
    return EV_TYPES.find(t => t.id === type) || EV_TYPES[EV_TYPES.length-1];
  }

  // Add event form
  const today = new Date().toISOString().slice(0,10);
  const formHtml = `
    <div id="ev-form" style="background:var(--surface);border:1px solid var(--border);border-radius:12px;
      padding:16px;margin-bottom:20px;display:${_evFormOpen ? 'block' : 'none'};">
      <div style="font-size:11px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:12px;">
        Uusi tapahtuma
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:10px;">
        <div>
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Päivämäärä</div>
          <input id="ev-date" type="text" value="${today}" placeholder="2026-05-22"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:7px;
              padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Tyyppi</div>
          <select id="ev-type"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:7px;
              padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;">
            ${EV_TYPES.map(t => `<option value="${t.id}">${t.icon} ${t.label}</option>`).join('')}
          </select>
        </div>
        <div>
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Osake / Lähde</div>
          <input id="ev-source" type="text" placeholder="esim. MANTA.HE tai Nordnet"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:7px;
              padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;">
        </div>
        <div>
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Summa €</div>
          <input id="ev-amount" type="number" step="0.01" placeholder="0.00"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:7px;
              padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;">
        </div>
        <div style="grid-column:1/-1;">
          <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Muistiinpano</div>
          <input id="ev-note" type="text" placeholder="Vapaaehtoinen lisätieto"
            style="width:100%;background:var(--surface2);border:1px solid var(--border);border-radius:7px;
              padding:8px 10px;color:var(--text);font-family:var(--mono);font-size:13px;outline:none;">
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button onclick="saveEvent()" class="btn-p" style="flex:1;">Tallenna tapahtuma</button>
        <button onclick="_evFormOpen=false;renderEvents();" class="btn-s">Peru</button>
      </div>
    </div>`;

  // Summary cards
  const summaryHtml = `
    <div style="display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-bottom:16px;">
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;">
        <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Osingot yht.</div>
        <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--green);">${fmt(totalDiv)}</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;">
        <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Ostot yht.</div>
        <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--cyan);">${fmt(totalBuy)}</div>
      </div>
      <div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:12px;">
        <div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:4px;">Myynnit yht.</div>
        <div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--amber);">${fmt(totalSell)}</div>
      </div>
    </div>`;

  // Events list
  const listHtml = evts.length === 0
    ? '<div style="text-align:center;padding:40px;color:var(--text3);font-family:var(--mono);font-size:12px;">Ei tapahtumia vielä.<br>Lisää ensimmäinen yllä olevalla lomakkeella.</div>'
    : Object.keys(byYear).sort().reverse().map(y => {
        const yEvts = byYear[y];
        const yDiv = yEvts.filter(e=>e.type==='dividend').reduce((s,e)=>s+(e.amount||0),0);
        return `
          <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--cyan);
            border-left:2px solid var(--cyan);padding-left:8px;margin:16px 0 8px;font-weight:700;">
            ${y}${yDiv>0?' &nbsp;·&nbsp; <span style="color:var(--green)">'+fmt(yDiv)+' osingot</span>':''}
          </div>
          ${yEvts.map(ev => {
            const ti = evTypeInfo(ev.type);
            return `
              <div style="display:flex;justify-content:space-between;align-items:center;
                padding:10px 12px;background:var(--surface);border:1px solid var(--border);
                border-radius:8px;margin-bottom:5px;">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:16px;">${ti.icon}</span>
                  <div>
                    <div style="font-size:12px;font-weight:600;color:var(--text);">
                      ${ti.label}${ev.source ? ' · '+ev.source : ''}
                    </div>
                    <div style="font-size:10px;color:var(--text3);font-family:var(--mono);">
                      ${fmtDate(ev.date)}${ev.note ? ' · '+ev.note : ''}
                    </div>
                  </div>
                </div>
                <div style="display:flex;align-items:center;gap:10px;">
                  <div style="font-family:var(--mono);font-size:14px;font-weight:700;color:${ti.color};">
                    ${ev.amount != null ? fmt(ev.amount) : ''}
                  </div>
                  <button onclick="deleteEvent('${ev.id}')"
                    style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;
                      padding:2px 6px;border-radius:4px;">✕</button>
                </div>
              </div>`;
          }).join('')}`;
      }).join('');

  c.innerHTML = `
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;">
      <div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);">
        ${evts.length} tapahtumaa
      </div>
      <button onclick="_evFormOpen=!_evFormOpen;renderEvents();" class="btn-s">
        ${_evFormOpen ? '✕ Sulje' : '+ Lisää tapahtuma'}
      </button>
    </div>
    ${formHtml}
    ${summaryHtml}
    ${listHtml}
  `;
}

async function saveEvent() {
  let date   = (document.getElementById('ev-date')?.value || '').trim();
  const type   = document.getElementById('ev-type')?.value;
  const source = document.getElementById('ev-source')?.value?.trim();
  const amount = parseFloat(document.getElementById('ev-amount')?.value) || null;
  const note   = document.getElementById('ev-note')?.value?.trim();

  // Jos päivämäärä on tyhjä, käytä tänään
  if (!date) date = new Date().toISOString().slice(0,10);
  // Muunna DD.MM.YYYY → YYYY-MM-DD jos tarpeen
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
    const p = date.split('.');
    date = p[2] + '-' + p[1].padStart(2,'0') + '-' + p[0].padStart(2,'0');
  }
  if (!type) { alert('Valitse tyyppi.'); return; }

  const ev = {
    id:     'ev_' + Date.now(),
    date,
    type,
    source: source || '',
    amount,
    note:   note || '',
    title:  EV_TYPES.find(t=>t.id===type)?.label || type,
    created_at: new Date().toISOString(),
  };

  try {
    await DB.putEvent(ev);
  } catch(e) {
    alert('Tallennusvirhe: ' + e.message);
    return;
  }

  _evFormOpen = false;
  await renderEvents();
  await updateNavCount();
}

async function deleteEvent(id) {
  if (!confirm('Poistetaanko tapahtuma?')) return;
  await DB.deleteEvent(id);
  await renderEvents();
  await updateNavCount();
}

// ═══════════════════════════════════════════════
// SALKKU (Holdings Registry)
// ═══════════════════════════════════════════════
const ACCOUNTS = [
  { id: 'nordnet',         label: 'Nordnet' },
  { id: 'op_osakkeet',     label: 'OP Osakkeet' },
  { id: 'tapiola',         label: 'Tapiola' },
  { id: 's_sijoitus',      label: 'S-Sijoitus' },
  { id: 'rahastot',        label: 'Rahastot' },
  // lasten_sijoitus excluded from personal accounts — tracked separately
];

let _editingId = null;

async function renderSalkku() {
  const c = document.getElementById('salkku-content');
  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false);
  holdings.sort((a, b) => (a.account > b.account ? 1 : -1));

  // Compute totals per account
  const byAccount = {};
  for (const h of holdings) {
    (byAccount[h.account] = byAccount[h.account] || []).push(h);
  }
  const grandTotal = holdings.reduce((s, h) => s + (h.quantity || 0) * (h.last_price || 0), 0);

  const acctOpts = ACCOUNTS.map(a => `<option value="${a.id}">${a.label}</option>`).join('');

  c.innerHTML = `
    <!-- Top bar -->
    <div style="display:flex;gap:10px;align-items:center;margin-bottom:24px;flex-wrap:wrap;">
      <div>
        <div class="card-label" style="margin-bottom:3px;">Salkku yhteensä</div>
        <div class="portfolio-hero-label">Salkun arvo</div>
      <div class="portfolio-hero">${fmt(grandTotal)}</div>
      </div>
      <div style="margin-left:auto;display:flex;gap:8px;flex-wrap:wrap;">
        <button class="btn-s" onclick="toggleAddForm()">+ Lisää holding</button>
        <button class="btn-p" onclick="saveDayFromHoldings()">Tallenna päivä ▶</button>
      </div>
    </div>

    <!-- Add/edit form (hidden by default) -->
    <div class="holding-form" id="holding-form" style="display:none;">
      <div style="font-weight:700;font-size:15px;margin-bottom:14px;" id="form-title">Uusi holding</div>
      <div class="form-grid">
        <div class="form-field">
          <label class="form-label">Ticker</label>
          <input class="form-input" id="f-ticker" placeholder="esim. NOKIA" style="text-transform:uppercase;">
        </div>
        <div class="form-field">
          <label class="form-label">Nimi (vapaaehtoinen)</label>
          <input class="form-input" id="f-name" placeholder="esim. Nokia Oyj">
        </div>
        <div class="form-field">
          <label class="form-label">Kappalemäärä</label>
          <input class="form-input" id="f-qty" type="number" placeholder="100">
        </div>
        <div class="form-field">
          <label class="form-label">Kurssi (€)</label>
          <input class="form-input" id="f-price" type="number" step="0.01" placeholder="3.82">
        </div>
        <div class="form-field">
          <label class="form-label">Säilytyspaikka</label>
          <select class="form-select" id="f-account">${acctOpts}</select>
        </div>
        <div class="form-field">
          <label class="form-label">Hankintahinta (€, vapaaehtoinen)</label>
          <input class="form-input" id="f-purchase" type="number" step="0.01" placeholder="3.50">
        </div>
      </div>
      <div style="display:flex;gap:8px;">
        <button class="btn-p" onclick="saveHoldingForm()">Tallenna</button>
        <button class="btn-s" onclick="cancelForm()">Peruuta</button>
      </div>
    </div>

    <!-- Holdings by account -->
    ${Object.keys(byAccount).length === 0 ? `
      <div style="text-align:center;color:var(--text2);padding:48px;">
        Ei holdingeja vielä. Lisää ensimmäinen klikkaamalla "+ Lisää holding".
      </div>` :
    ACCOUNTS.filter(a => byAccount[a.id]).map(a => {
      const rows = byAccount[a.id];
      const total = rows.reduce((s, h) => s + (h.quantity||0)*(h.last_price||0), 0);
      return `
        <div class="acct-header">
          <span class="acct-name">${a.label}</span>
          <span class="acct-total">${fmt(total)}</span>
        </div>
        <div class="holding-table">
          <div class="holding-hd">
            <div>Ticker</div><div>Nimi</div><div style="text-align:right">Kpl</div>
            <div style="text-align:right">Kurssi</div><div style="text-align:right">Arvo</div>
            <div>Hankinta</div><div></div>
          </div>
          ${rows.map(h => {
            const val = (h.quantity||0) * (h.last_price||0);
            const gain = h.purchase_price ? val - (h.quantity||0)*h.purchase_price : null;
            return `
              <div class="holding-row">
                <div class="h-ticker">${h.ticker}</div>
                <div class="h-name">${h.display_name || '—'}</div>
                <div class="h-qty">${(h.quantity||0).toLocaleString('fi-FI')}</div>
                <div class="h-price" style="display:flex;flex-direction:column;align-items:flex-end;gap:1px;">
                  <span>${h.last_price ? h.last_price.toFixed(2)+' €' : '—'}</span>
                  ${h.last_price_src && h.last_price_src !== 'Supabase' ? `<span class="h-src">${h.last_price_time||''} ${h.last_price_src}</span>` : (h.last_price_time ? `<span class="h-src">${h.last_price_time}</span>` : '')}
                </div>
                <div class="h-val">${fmt(val)}</div>
                <div class="h-acct" style="color:${gain===null?'var(--text3)':gain>=0?'var(--green)':'var(--red)'}">
                  ${gain !== null ? fmtDelta(gain) : h.purchase_price ? h.purchase_price.toFixed(2)+' €' : '—'}
                </div>
                <div class="h-actions">
                  <button class="h-btn" onclick="editHolding(${h.id})">✎</button>
                  <button class="h-btn del" onclick="deleteHolding(${h.id})">✕</button>
                </div>
              </div>`;
          }).join('')}
        </div>`;
    }).join('')}
  `;
}

function toggleAddForm() {
  _editingId = null;
  const form = document.getElementById('holding-form');
  const visible = form.style.display !== 'none';
  form.style.display = visible ? 'none' : 'block';
  if (!visible) {
    document.getElementById('form-title').textContent = 'Uusi holding';
    ['f-ticker','f-name','f-qty','f-price','f-purchase'].forEach(id => {
      document.getElementById(id).value = '';
    });
  }
}

async function editHolding(id) {
  const holdings = await DB.getAll('holdings');
  const h = holdings.find(x => x.id === id);
  if (!h) return;
  _editingId = id;
  document.getElementById('form-title').textContent = 'Muokkaa holdingia';
  document.getElementById('f-ticker').value   = h.ticker || '';
  document.getElementById('f-name').value     = h.display_name || '';
  document.getElementById('f-qty').value      = h.quantity || '';
  document.getElementById('f-price').value    = h.last_price || '';
  document.getElementById('f-purchase').value = h.purchase_price || '';
  document.getElementById('f-account').value  = h.account || 'nordnet';
  document.getElementById('holding-form').style.display = 'block';
  document.getElementById('holding-form').scrollIntoView({ behavior: 'smooth' });
}

async function saveHoldingForm() {
  const ticker = document.getElementById('f-ticker').value.trim().toUpperCase();
  if (!ticker) { alert('Ticker on pakollinen.'); return; }

  const h = {
    ticker,
    display_name:   document.getElementById('f-name').value.trim() || null,
    quantity:       parseFloat(document.getElementById('f-qty').value) || 0,
    last_price:     parseFloat(document.getElementById('f-price').value) || null,
    last_price_date: new Date().toISOString().slice(0,10),
    purchase_price: parseFloat(document.getElementById('f-purchase').value) || null,
    account:        document.getElementById('f-account').value,
    active:         true,
  };

  if (_editingId) h.id = _editingId;

  await DB.putHolding(h);
  _editingId = null;
  document.getElementById('holding-form').style.display = 'none';
  renderSalkku();
}

function cancelForm() {
  _editingId = null;
  document.getElementById('holding-form').style.display = 'none';
}

async function deleteHolding(id) {
  if (!confirm('Poistetaanko holding?')) return;
  await DB.deleteHolding(id);
  renderSalkku();
}

async function saveDayFromHoldings() {
  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.last_price);
  if (holdings.length === 0) {
    alert('Lisää holdingit ja kurssit ensin.');
    return;
  }

  // Compute per-account totals from holdings
  const acctTotals = {};
  for (const h of holdings) {
    const val = (h.quantity || 0) * (h.last_price || 0);
    acctTotals[h.account] = (acctTotals[h.account] || 0) + val;
  }

  // Get latest snapshot as baseline for tilit/lainat
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const latest = snaps[snaps.length - 1];
  const today  = new Date().toISOString().slice(0,10);

  const snap = {
    date: today,
    // Account totals from holdings
    ...acctTotals,
    // Carry forward tilit + lainat from latest snapshot
    tulotili:             latest?.tulotili,
    elatustili:           latest?.elatustili,
    tavoitetili:          latest?.tavoitetili,
    s_pankki:             latest?.s_pankki,
    op_gold:              latest?.op_gold,
    visa:                 latest?.visa,
    luottotili:           latest?.luottotili,
    asuntolaina:          latest?.asuntolaina,
    asuntolaina_remontti: latest?.asuntolaina_remontti,
    autolaina:            latest?.autolaina,
    kaikki_lainat:        latest?.kaikki_lainat,
    // Holdings frozen snapshot
    holdings_snapshot: holdings.map(h => ({
      ticker:       h.ticker,
      display_name: h.display_name,
      quantity:     h.quantity,
      price:        h.last_price,
      market_value: (h.quantity||0) * h.last_price,
      account:      h.account,
    })),
    raw_import: { source: 'manual_entry', engine: 'v1', saved_at: new Date().toISOString() },
  };

  // Compute osakkeet_yht
  snap.osakkeet_yht = Object.entries(acctTotals)
    .filter(([k]) => ['nordnet','op_osakkeet','tapiola','s_sijoitus','rahastot','lasten_sijoitus'].includes(k))
    .reduce((s, [,v]) => s + v, 0);

  await DB.putSnapshot(snap);
  await updateNavCount();
  alert(`Päivä tallennettu: ${today}`);
  showView('dashboard');
  renderDashboard();
}

// ═══════════════════════════════════════════════
// EXPORT / IMPORT / RESTORE
// ═══════════════════════════════════════════════
const APP_VERSION    = '1.0.0';
const SCHEMA_VERSION = 4;

function syncStatusBadge() {
  const meta = getSyncMeta();
  if (!meta.lastSyncedAt) return '';
  const d = new Date(meta.lastSyncedAt);
  const fi = d.toLocaleDateString('fi-FI') + ' ' + d.toLocaleTimeString('fi-FI', {hour:'2-digit',minute:'2-digit'});
  const device = meta.lastDevice || '';
  return '<div style="font-size:10px;color:var(--text3);font-family:monospace;margin-top:4px;display:flex;align-items:center;gap:5px;">' +
    '<span style="color:#5a9e6a;">●</span> Synkattu ' + (device ? device + ' · ' : '') + fi + '</div>';
}

function backupStatusBadge() {
  const last = localStorage.getItem('financeOS_last_backup');
  if (!last) return `<span class="backup-status backup-none">Ei varmuuskopiota</span>`;
  const days = Math.floor((Date.now() - new Date(last).getTime()) / 86400000);
  if (days <= 7)  return `<span class="backup-status backup-ok">✓ Varmuuskopio ${days === 0 ? 'tänään' : days + ' pv sitten'}</span>`;
  return `<span class="backup-status backup-warn">⚠ Varmuuskopio ${days} pv sitten</span>`;
}

async function exportJSON() {
  const snapshots = await DB.getAll('snapshots');
  const events    = await DB.getAll('events');
  const holdings  = await DB.getAll('holdings');

  const backup = {
    app_version:        APP_VERSION,
    schema_version:     SCHEMA_VERSION,
    calculation_engine: 'v1_assets_minus_liabilities',
    exported_at:        new Date().toISOString(),
    counts: { snapshots: snapshots.length, events: events.length, holdings: holdings.length },
    snapshots,
    events,
    holdings,
  };

  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `financeOS_backup_${new Date().toISOString().slice(0,10)}.json`;
  a.click();
  URL.revokeObjectURL(url);

  localStorage.setItem('financeOS_last_backup', new Date().toISOString());
  // Refresh badge
  const badge = document.querySelector('.backup-status');
  if (badge) badge.outerHTML = backupStatusBadge();
}

async function exportCSV() {
  // Numbers/Excel-yhteensopiva: puolipiste-erotin, suomalainen pvm, BOM
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const SEP = ';';

  function fiFmt(n) {
    if (n === null || n === undefined || n === '') return '';
    if (typeof n === 'number') return n.toFixed(2).replace('.', ',');
    return String(n);
  }
  function isoToFi(iso) {
    if (!iso || iso.length < 10) return iso || '';
    const [y,m,d] = iso.slice(0,10).split('-');
    return `${d}.${m}.${y}`;
  }

  const COLS = [
    { key: 'date',                 label: 'Päivämäärä',            fmt: isoToFi },
    { key: 'nordnet',              label: 'Nordnet',                fmt: fiFmt   },
    { key: 'op_osakkeet',          label: 'OP Osakkeet',            fmt: fiFmt   },
    { key: 'tapiola',              label: 'Tapiola',                fmt: fiFmt   },
    { key: 's_sijoitus',           label: 'S-Sijoitus',             fmt: fiFmt   },
    { key: 'rahastot',             label: 'Rahastot',               fmt: fiFmt   },
    { key: 'lasten_sijoitus',      label: 'Lasten sijoitus',        fmt: fiFmt   },
    { key: 'tulotili',             label: 'Tulotili',               fmt: fiFmt   },
    { key: 'elatustili',           label: 'Elatustili',             fmt: fiFmt   },
    { key: 'tavoitetili',          label: 'Tavoitetili',            fmt: fiFmt   },
    { key: 's_pankki',             label: 'S-Pankki',               fmt: fiFmt   },
    { key: 'op_gold',              label: 'OP Gold',                fmt: fiFmt   },
    { key: 'visa',                 label: 'VISA',                   fmt: fiFmt   },
    { key: 'luottotili',           label: 'Luottotili',             fmt: fiFmt   },
    { key: 'asuntolaina',          label: 'Asuntolaina',            fmt: fiFmt   },
    { key: 'asuntolaina_remontti', label: 'Asuntolaina (remontti)', fmt: fiFmt   },
    { key: 'autolaina',            label: 'Autolaina',              fmt: fiFmt   },
    // Laskettu lennossa calculateNetWorth()-funktiolla — yhtenäinen historia
    { key: '_inv',  label: 'Sijoitukset yht.',  fmt: fiFmt },
    { key: '_cash', label: 'Käteinen yht.',      fmt: fiFmt },
    { key: '_debt', label: 'Lainat yht.',        fmt: fiFmt },
    { key: '_nw',   label: 'Nettovarallisuus',   fmt: fiFmt },
  ];

  const header = COLS.map(c => c.label).join(SEP);
  const rows = snaps.map(s => {
    const calc = calculateNetWorth(s);
    const enriched = {
      ...s,
      _inv:  calc.investments,
      _cash: calc.cash,
      _debt: -(calc.shortTermDebt + calc.longTermDebt),
      _nw:   calc.netWorth,
    };
    return COLS.map(c => {
      const raw = enriched[c.key];
      const v   = c.fmt(raw);
      if (typeof v === 'string' && v.includes(SEP)) return `"${v}"`;
      return v;
    }).join(SEP);
  });

  const csv  = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `financeOS_numbers_${new Date().toISOString().slice(0,10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

let _restoreData = null;

function previewRestore(input) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    try {
      const data = JSON.parse(e.target.result);
      if (!data.schema_version || !data.snapshots) {
        alert('Tiedosto ei näytä Finance OS -varmuuskopiolta.');
        return;
      }
      _restoreData = data;
      document.getElementById('restore-preview').style.display = 'block';
      document.getElementById('restore-btns').style.display    = 'flex';
      document.getElementById('restore-preview').innerHTML = `
        <strong>Löydetty varmuuskopio:</strong><br>
        Viety: ${data.exported_at ? new Date(data.exported_at).toLocaleString('fi-FI') : '—'}<br>
        Schema: v${data.schema_version} &nbsp;·&nbsp; App: ${data.app_version || '—'}<br>
        Snapshots: ${data.snapshots?.length ?? 0} &nbsp;·&nbsp;
        Tapahtumat: ${data.events?.length ?? 0} &nbsp;·&nbsp;
        Holdings: ${data.holdings?.length ?? 0}<br>
        <br>
        <span style="color:var(--red);">⚠ Nykyinen data tyhjennetään ennen palautusta.</span>
      `;
      document.getElementById('btn-confirm-restore').onclick = confirmRestore;
    } catch {
      alert('Tiedoston lukeminen epäonnistui. Onko se kelvollinen JSON?');
    }
  };
  reader.readAsText(file, 'UTF-8');
}

async function confirmRestore() {
  if (!_restoreData) return;
  if (!confirm('Vahvista: tyhjennä kaikki nykyinen data ja palauta varmuuskopiosta?')) return;

  await DB.clear();
  if (_restoreData.snapshots?.length) await DB.bulkPutSnapshots(_restoreData.snapshots);
  if (_restoreData.events?.length)    await DB.bulkAddEvents(_restoreData.events);
  if (_restoreData.holdings?.length) {
    for (const h of _restoreData.holdings) await DB.putHolding(h);
  }

  await updateNavCount();
  cancelRestore();
  alert(`Palautettu: ${_restoreData.snapshots?.length ?? 0} snapshottia.`);
  showView('dashboard');
  renderDashboard();
}

function cancelRestore() {
  _restoreData = null;
  document.getElementById('restore-preview').style.display = 'none';
  document.getElementById('restore-btns').style.display    = 'none';
  document.getElementById('restore-input').value = '';
}

// ═══════════════════════════════════════════════
// VIEW MANAGEMENT
// ═══════════════════════════════════════════════

// ═══════════════════════════════════════════════
// KASSAVIRTA & LIKVIDITEETTI
// ═══════════════════════════════════════════════
async function renderLikviditeetti() {
  const el = document.getElementById('likviditeetti-content');
  if (!el) return;

  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  if (snaps.length === 0) {
    el.innerHTML = '<div class="empty"><div class="empty-icon">💧</div><div class="empty-title">Ei dataa vielä</div><div class="empty-sub">Tallenna ensin päivän tiedot Dashboardilta.</div></div>';
    return;
  }

  const s       = snaps[snaps.length - 1];
  const tulotili = parseFloat(s.tulotili)  || 0;
  const opGold   = Math.abs(parseFloat(s.op_gold)    || 0);
  const visa     = Math.abs(parseFloat(s.visa)        || 0);
  const luottotili = Math.abs(parseFloat(s.luottotili)|| 0);
  const totalLuotot = opGold + visa + luottotili;
  const nettoLikvi  = tulotili - totalLuotot;
  const isNegative  = nettoLikvi < 0;

  // 5kk kulutustempo OP Goldille
  const dayNum = new Date().getDate();
  const fiveMonthSnaps = snaps.filter(s2 => {
    const d = new Date(s2.date);
    const now = new Date();
    const diffMonths = (now.getFullYear()-d.getFullYear())*12 + now.getMonth()-d.getMonth();
    return diffMonths >= 1 && diffMonths <= 5;
  });
  let paceAvg = null;
  if (fiveMonthSnaps.length > 0) {
    const sameDay = fiveMonthSnaps.filter(s2 => new Date(s2.date).getDate() <= dayNum+2 && new Date(s2.date).getDate() >= dayNum-2);
    if (sameDay.length > 0) {
      paceAvg = sameDay.reduce((sum,s2) => sum + Math.abs(parseFloat(s2.op_gold)||0), 0) / sameDay.length;
    }
  }
  const tempo = (paceAvg && paceAvg > 0) ? Math.round((opGold / paceAvg) * 100) : null;
  const diff  = paceAvg !== null ? opGold - paceAvg : null;

  // Palkki: vapaa vs varattu
  const total   = tulotili || 1;
  const freePct = Math.max(0, Math.min(100, Math.round((nettoLikvi / total) * 100)));
  const usedPct = 100 - freePct;

  // Värit
  const heroColor  = isNegative ? 'var(--red)' : nettoLikvi < 500 ? '#e6b84a' : 'var(--green)';
  const tempoColor = tempo === null ? 'var(--text3)'
                   : tempo > 115   ? 'var(--red)'
                   : tempo < 85    ? 'var(--green)'
                   : 'var(--text2)';

  // Behavioral insight
  let insight = '';
  if (tempo !== null) {
    if (tempo <= 70)
      insight = 'OP Goldin kulutustaso on poikkeuksellisen matala tähän kohtaan kuuta. Kassavirta on erinomaisessa hallinnassa.';
    else if (tempo <= 85)
      insight = 'OP Goldin kulutustaso on ' + tempo + ' % normaalista — selvästi alle tavanomaisen. Hyvä kuukausi.';
    else if (tempo <= 115)
      insight = 'OP Goldin kulutustaso on normaali (' + tempo + ' % historiakeskiarvosta). Ei toimenpiteitä.';
    else
      insight = 'OP Goldin kulutustaso on ' + tempo + ' % normaalista — hieman tavanomaista korkeampi. Tarkkaile loppukuuta.';
  }

  function fmt(n) {
    return new Intl.NumberFormat('fi-FI', {style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n);
  }

  el.innerHTML = '<div style="max-width:580px;margin:0 auto;padding:24px 0 80px;">' +

  // ── KERROS 1: Net Cash Hero ──
  '<div style="text-align:center;padding:32px 20px 24px;margin-bottom:4px;">' +
    '<div style="font-size:10px;letter-spacing:.16em;text-transform:uppercase;color:var(--text3);margin-bottom:10px;">Netto-likviditeetti</div>' +
    '<div style="font-size:36px;font-family:var(--mono);font-weight:700;letter-spacing:-.01em;color:' + (nettoLikvi < 0 ? 'var(--red,#c05a5a)' : 'var(--text)') + ';line-height:1;margin-bottom:8px;">' + fmt(nettoLikvi) + '</div>' +
    '<div style="font-size:11px;color:var(--text3);font-family:var(--mono);">' +
      'Tulotili <span style="color:var(--text2);">' + fmt(tulotili) + '</span>' +
      ' &nbsp;−&nbsp; Luottokortit <span style="color:var(--text2);">' + fmt(totalLuotot) + '</span>' +
    '</div>' +
    '<div style="font-size:12px;color:var(--text3);margin-top:6px;">' +
      (isNegative ? '⚠ Luottokorttivelat ylittävät tulotilin saldon' : 'Vapaa arjen puskuri ennen luottolaskua') +
    '</div>' +
  '</div>' +

  // ── KERROS 2: Tasapainopalkki ──
  '<div style="padding:0 20px 20px;">' +
    '<div style="height:36px;border-radius:10px;overflow:hidden;display:flex;margin-bottom:8px;position:relative;">' +
      '<div style="width:' + freePct + '%;background:linear-gradient(90deg,#2a5c3a,#3a7a4a);transition:width .5s;display:flex;align-items:center;padding-left:10px;">' +
        (freePct > 15 ? '<span style="font-size:11px;font-weight:700;color:#7fff9d;font-family:var(--mono);">' + fmt(Math.max(0,nettoLikvi)) + '</span>' : '') +
      '</div>' +
      '<div style="flex:1;background:rgba(184,149,106,0.2);border-left:2px solid rgba(184,149,106,0.4);display:flex;align-items:center;justify-content:flex-end;padding-right:10px;">' +
        (usedPct > 10 ? '<span style="font-size:11px;font-weight:600;color:var(--gold);font-family:var(--mono);">−' + fmt(totalLuotot) + '</span>' : '') +
      '</div>' +
    '</div>' +
    '<div style="display:flex;justify-content:space-between;font-size:9px;color:var(--text3);">' +
      '<div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;border-radius:2px;background:#3a7a4a;"></div>Vapaa (' + freePct + ' %)</div>' +
      '<div style="display:flex;align-items:center;gap:5px;"><div style="width:8px;height:8px;border-radius:2px;background:rgba(184,149,106,0.5);"></div>Varattu luottolaskuun (' + usedPct + ' %)</div>' +
    '</div>' +
  '</div>' +

  // ── KERROS 3: Tilirivit ──
  '<div style="margin:0 20px;border:1px solid var(--border);border-radius:12px;overflow:hidden;">' +

    // Tulotili
    '<div style="padding:14px 16px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center;">' +
      '<div>' +
        '<div style="font-weight:600;font-size:14px;">🏦 Tulotili</div>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Käytettävissä</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--green);">' + fmt(tulotili) + '</div>' +
      '</div>' +
    '</div>' +

    // OP Gold
    '<div style="padding:14px 16px;' + (visa || luottotili ? 'border-bottom:1px solid var(--border);' : '') + 'display:flex;justify-content:space-between;align-items:flex-start;">' +
      '<div>' +
        '<div style="font-weight:600;font-size:14px;">💳 OP Gold</div>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Maksuvelvoite kuun lopussa</div>' +
        (diff !== null ? '<div style="font-size:10px;margin-top:4px;color:' + (diff > 50 ? 'var(--red)' : diff < -50 ? 'var(--green)' : 'var(--text3)') + ';">' +
          (diff > 50 ? '↑ ' + fmt(diff) + ' normaalia enemmän' : diff < -50 ? '↓ ' + fmt(Math.abs(diff)) + ' normaalia vähemmän' : '→ normaali tahti') + '</div>' : '') +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:' + (isNegative ? 'var(--red)' : 'var(--gold)') + ';"> −' + fmt(opGold) + '</div>' +
        (tempo !== null ? '<div style="font-size:10px;color:' + tempoColor + ';margin-top:2px;">' + tempo + ' % normaalista</div>' : '') +
      '</div>' +
    '</div>' +

    // Visa (jos olemassa)
    (visa ? '<div style="padding:14px 16px;' + (luottotili ? 'border-bottom:1px solid var(--border);' : '') + 'display:flex;justify-content:space-between;align-items:center;">' +
      '<div><div style="font-weight:600;font-size:14px;">💳 Visa</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Maksuvelvoite kuun lopussa</div></div>' +
      '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--gold);">−' + fmt(visa) + '</div></div>' : '') +

    // Luottotili (jos olemassa)
    (luottotili ? '<div style="padding:14px 16px;display:flex;justify-content:space-between;align-items:center;">' +
      '<div><div style="font-weight:600;font-size:14px;">💳 Luottotili</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Maksuvelvoite</div></div>' +
      '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--gold);">−' + fmt(luottotili) + '</div></div>' : '') +

  '</div>' +

  // ── KERROS 4: Behavioral Insight ──
  (insight ? '<div style="margin:16px 20px 0;padding:14px 16px;border-radius:10px;background:rgba(0,200,255,0.04);border:1px solid var(--border);">' +
    '<div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:6px;">Kassavirtasignaali · pv ' + dayNum + '</div>' +
    '<div style="font-size:12px;color:var(--text2);line-height:1.7;font-family:var(--mono);">' + insight + '</div>' +
  '</div>' : '') +

  '</div>'; // max-width wrapper
}


// ── Muutoksen erittely ─────────────────────────────────────────────────
function selectPeriod(i) {
  const data = window._periodData;
  if (!data || !data[i]) return;
  const p = data[i];

  // Highlight valittu chip
  document.querySelectorAll('[id^="pchip-"]').forEach((el, j) => {
    el.style.borderColor = j === i ? 'var(--cyan, #00d4ff)' : '';
    el.style.background  = j === i ? 'rgba(0,200,255,0.08)' : '';
  });

  function fmt(n) {
    return new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.abs(n));
  }
  function row(label, val, indent) {
    if (Math.abs(val) < 1) return '';
    const pos = val > 0;
    const color = pos ? 'var(--green, #00ff9d)' : 'var(--red, #ff4d6a)';
    const sign  = pos ? '+' : '−';
    return '<div style="display:flex;justify-content:space-between;align-items:center;' +
      'padding:5px 0;border-bottom:1px solid rgba(0,200,255,0.05);">' +
      '<span style="font-size:11px;color:var(--text2,#cce8f4);' + (indent?'padding-left:12px;':'') + '">' + label + '</span>' +
      '<span style="font-family:monospace;font-size:12px;font-weight:700;color:' + color + ';">' + sign + fmt(val) + '</span>' +
      '</div>';
  }

  const title = document.getElementById('breakdown-title');
  const rows  = document.getElementById('breakdown-rows');
  if (!title || !rows) return;

  // ISO date to Finnish
  const dp = p.date.split('-');
  const dateFi = dp[2]+'.'+dp[1]+'.'+dp[0];

  title.textContent = 'Muutoksen erittely: ' + p.label.toUpperCase() + ' (' + dateFi + ' → tänään)';

  // Ryhmittely
  const invRows = p.rows.filter(r =>
    ['Nordnet','OP Osakkeet','Tapiola','S-Sijoitus','Rahastot'].includes(r.l));
  const cashRows  = p.rows.filter(r => r.l === 'Tulotili + tilit');
  const debtRows  = p.rows.filter(r =>
    ['Luottokortit','Asuntolaina','Asuntolaina (rem.)','Autolaina'].includes(r.l));

  let html = '';

  if (invRows.length > 0 || p.dInv) {
    html += '<div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;' +
      'color:rgba(100,160,255,0.7);padding:6px 0 2px;">Sijoitukset ' +
      (p.dInv > 0 ? '+' : '') + new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(p.dInv) + '</div>';
    invRows.forEach(r => { html += row(r.l, r.d, true); });
  }
  if (cashRows.length > 0 || p.dCash) {
    html += '<div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;' +
      'color:rgba(0,200,100,0.7);padding:8px 0 2px;">Käteinen ' +
      (p.dCash > 0 ? '+' : '') + new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(p.dCash) + '</div>';
    cashRows.forEach(r => { html += row(r.l, r.d, true); });
  }
  if (debtRows.length > 0) {
    html += '<div style="font-size:9px;letter-spacing:.1em;text-transform:uppercase;' +
      'color:rgba(255,150,100,0.7);padding:8px 0 2px;">Velat</div>';
    debtRows.forEach(r => { html += row(r.l, r.d, true); });
  }

  // Yhteenveto
  html += '<div style="display:flex;justify-content:space-between;padding:8px 0 2px;' +
    'margin-top:4px;border-top:1px solid rgba(0,200,255,0.15);">' +
    '<span style="font-size:11px;font-weight:700;color:var(--text,#fff);">Netto yhteensä</span>' +
    '<span style="font-family:monospace;font-size:13px;font-weight:800;color:' +
    (p.d >= 0 ? 'var(--green,#00ff9d)' : 'var(--red,#ff4d6a)') + ';">' +
    (p.d >= 0 ? '+' : '−') +
    new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(Math.abs(p.d)) +
    '</span></div>';

  rows.innerHTML = html;
}


// ═══════════════════════════════════════════════
// LEDGER — Rivi per päivä taloushistoria
// ═══════════════════════════════════════════════

let _ledgerSelected = [];
let _showArchived = false;  // max 2 selected dates for compare

async function renderLedger() {
  const c = document.getElementById('ledger-content');
  if (!c) return;

  const snaps = (await DB.getAll('snapshots'))
    .filter(s => s.date && s.date.length === 10)
    .filter(s => _showArchived || !s._archived)
    .sort((a, b) => b.date.localeCompare(a.date));

  if (snaps.length === 0) {
    c.innerHTML = '<div class="empty"><div class="empty-icon">📒</div>' +
      '<div class="empty-title">Ei dataa</div>' +
      '<div class="empty-sub">Tallenna päivän tiedot Dashboardilta niin historia kertyy tähän.</div></div>';
    return;
  }

  function calcNetto(s) {
    const calc = calculateNetWorth(s);
    return calc.netWorth;
  }

  function fmtK(n) {
    if (n == null) return '–';
    const abs = Math.abs(n);
    if (abs >= 1000) return (n < 0 ? '−' : '') + (abs/1000).toFixed(1) + 'k';
    return fmt(n);
  }

  function deltaClass(n) {
    if (!n || n === 0) return 'ledger-neu';
    return n > 0 ? 'ledger-pos' : 'ledger-neg';
  }

  function fmtDelta(n) {
    if (n == null || n === 0) return '–';
    return (n > 0 ? '+' : '') + fmtK(n);
  }

  // Compare box
  function renderCompare() {
    if (_ledgerSelected.length < 2) {
      return '<div style="font-size:11px;color:var(--text3);font-family:var(--mono);' +
        'padding:10px;text-align:center;margin-bottom:12px;">' +
        'Valitse kaksi riviä vertaillaksesi &nbsp;·&nbsp; ' + _ledgerSelected.length + '/2 valittu</div>';
    }
    const [d1, d2] = _ledgerSelected.sort();
    const s1 = snaps.find(s => s.date === d1);
    const s2 = snaps.find(s => s.date === d2);
    if (!s1 || !s2) return '';

    const c1 = calculateNetWorth(s1), c2 = calculateNetWorth(s2);
    const rows = [
      { label: 'Netto',    v1: c1.netWorth,    v2: c2.netWorth    },
      { label: 'Salkku',   v1: c1.investments, v2: c2.investments },
      { label: 'Käteinen', v1: c1.cash,        v2: c2.cash        },
      { label: 'Velat',    v1: -c1.longTermDebt - c1.shortTermDebt,
                           v2: -c2.longTermDebt - c2.shortTermDebt },
    ];

    const fi1 = d1.split('-').reverse().join('.');
    const fi2 = d2.split('-').reverse().join('.');

    return '<div class="compare-box-spacer"></div><div class="compare-box">' +
      '<div style="display:flex;justify-content:space-between;align-items:center;">' +
      '<div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--gold);">VERTAILU</div>' +
      '<button onclick="_ledgerSelected=[];renderLedger()" style="background:none;border:none;' +
        'color:var(--text3);cursor:pointer;font-size:14px;">✕</button></div>' +
      '<div class="compare-grid">' +
      rows.map(r => {
        const delta = r.v2 - r.v1;
        const pct   = r.v1 !== 0 ? (delta / Math.abs(r.v1) * 100) : null;
        var rowHtml = '<div class="compare-col">';
        rowHtml += '<div class="compare-label">' + r.label + '</div>';
        rowHtml += '<div style="display:flex;justify-content:space-between;gap:4px;margin-bottom:3px;">';
        rowHtml += '<div style="text-align:left"><div style="font-size:9px;color:var(--text3)">' + fi1 + '</div>';
        rowHtml += '<div class="compare-val" style="font-size:13px">' + fmtK(r.v1) + '</div></div>';
        rowHtml += '<div style="text-align:right"><div style="font-size:9px;color:var(--text3)">' + fi2 + '</div>';
        rowHtml += '<div class="compare-val" style="font-size:13px">' + fmtK(r.v2) + '</div></div>';
        rowHtml += '</div>';
        rowHtml += '<div class="compare-delta ' + deltaClass(delta) + '">' + fmtDelta(delta);
        if (pct != null) rowHtml += ' (' + (pct>=0?'+':'') + pct.toFixed(1) + '%)';
        rowHtml += '</div></div>';
        return rowHtml;
      }).join('') +
      '</div></div>';
  }

  // Build table rows
  var rows = '';
  for (var ri = 0; ri < snaps.length; ri++) {
    var s     = snaps[ri];
    var calc  = calculateNetWorth(s);
    var netto = calc.netWorth;
    var prev  = snaps[ri + 1];
    var delta = prev ? netto - calculateNetWorth(prev).netWorth : null;
    var fi    = s.date.split('-').reverse().join('.');
    var isSel = _ledgerSelected.indexOf(s.date) >= 0;
    rows += '<tr class="' + (isSel ? 'selected' : '') + '" data-date="' + s.date + '" onclick="toggleLedgerRow(this.dataset.date)">';
    rows += '<td>' + fi + '</td>';
    rows += '<td style="color:var(--text);font-weight:700">' + fmtK(netto) + '</td>';
    rows += '<td class="' + deltaClass(delta) + '">' + fmtDelta(delta) + '</td>';
    rows += '<td>' + fmtK(calc.investments) + '</td>';
    rows += '<td>' + fmtK(calc.cash) + '</td>';
    rows += '<td>' + fmtK(-(calc.longTermDebt + calc.shortTermDebt)) + '</td>';
    rows += '<td>' + fmtK(calc.lapset || 0) + '</td>';
    rows += '<td style="text-align:right;white-space:nowrap">';
    if (!snaps[ri]._archived) {
      rows += '<button onclick="archiveSnap(\'' + s.date + '\',true)" title="Arkistoi" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:2px 4px">📦</button>';
      if (ri === 0) rows += '<button onclick="rollbackTo(\'' + s.date + '\')" title="Palauta tähän" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:2px 4px">↩</button>';
    } else {
      rows += '<button onclick="archiveSnap(\'' + s.date + '\',false)" title="Palauta näkyviin" style="background:none;border:none;color:var(--gold-dim);cursor:pointer;font-size:11px;padding:2px 4px">↩📦</button>';
    }
    rows += '</td>';
    rows += '</tr>';
  }

  // Add pins to combined timeline
  var pins = await DB.getAll('pins').catch(() => []);

  // Load pins
  var pins = await DB.getAll('pins').catch(function() { return []; });


  // Merge pins into rows
  var pinsByDate = {};
  pins.forEach(function(pp) {
    if (!pinsByDate[pp.date]) pinsByDate[pp.date] = [];
    pinsByDate[pp.date].push(pp);
  });
  var allRows = rows;
  Object.keys(pinsByDate).forEach(function(pd) {
    var pinsHtml = '';
    pinsByDate[pd].forEach(function(pn) {
      var delBtn = 'deletePin(\'' + pn.id + '\')';
      pinsHtml += '<tr style="background:rgba(184,149,106,0.07)">';
      pinsHtml += '<td colspan="6" style="color:var(--gold);padding:5px 10px">';
      pinsHtml += String.fromCodePoint(0x1F4CD) + ' <strong>' + pn.title + '</strong>';
      if (pn.note) pinsHtml += ' <span style="color:var(--text3);font-size:10px">&middot; ' + pn.note + '</span>';
      pinsHtml += '</td>';
      pinsHtml += '<td style="text-align:right"><button onclick="' + delBtn + '" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:12px">x</button></td>';
      pinsHtml += '</tr>';
    });
    var mpos = allRows.indexOf('data-date="' + pd + '"');
    if (mpos > -1) {
      var rowEnd = allRows.indexOf('</tr>', mpos) + 5;
      allRows = allRows.slice(0, rowEnd) + pinsHtml + allRows.slice(rowEnd);
    } else {
      allRows += pinsHtml;
    }
  });

  c.innerHTML =
    '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">' +
      '<div style="font-size:10px;letter-spacing:.14em;text-transform:uppercase;color:var(--text3);">' +
        snaps.length + ' päivää · ' + (snaps[snaps.length-1]?.date?.slice(0,4)||'') +
        '–' + (snaps[0]?.date?.slice(0,4)||'') +
      '</div>' +
      '<div style="display:flex;gap:8px;">' +
      '<button onclick="openPinForm()" style="background:none;border:1px solid var(--gold-dim);' +
        'border-radius:7px;padding:4px 10px;color:var(--gold);font-size:11px;cursor:pointer;">📍 Lisää nastamuistiinpano</button>' +
      '<button onclick="_showArchived=!_showArchived;renderLedger()" style="background:none;border:1px solid var(--border);' +
        'border-radius:7px;padding:4px 10px;color:var(--text3);font-size:11px;cursor:pointer;">' + (_showArchived ? '👁 Piilota arkisto' : '📦 Näytä arkisto') + '</button>' +
    '</div>' +
    '</div>' +
    '<div id="pin-form-wrap"></div>' +
    renderCompare() +
    '<div style="overflow-x:auto;border:1px solid var(--border);border-radius:10px;">' +
    '<table class="ledger-table"><thead><tr>' +
      '<th style="text-align:left;">Päivä</th>' +
      '<th>Netto</th>' +
      '<th>Muutos</th>' +
      '<th>Salkku</th>' +
      '<th>Käteinen</th>' +
      '<th>Velat</th>' +
      '<th>Lasten</th>' +
      '<th></th>' +
    '</tr></thead><tbody>' +
    allRows +
    '</tbody></table></div>';
}

function toggleLedgerRow(date) {
  if (_ledgerSelected.includes(date)) {
    _ledgerSelected = _ledgerSelected.filter(d => d !== date);
  } else if (_ledgerSelected.length < 2) {
    _ledgerSelected.push(date);
  } else {
    // Replace oldest selection
    _ledgerSelected = [_ledgerSelected[1], date];
  }
  renderLedger();
}


// ═══════════════════════════════════════════════
// PIN-NASTAT
// ═══════════════════════════════════════════════


// ── Data Trust Layer ────────────────────────────────────────────────────

async function rollbackTo(date) {
  const all = (await DB.getAll('snapshots')).sort((a,b) => b.date.localeCompare(a.date));
  const toDelete = all.filter(s => s.date > date);
  if (toDelete.length === 0) { alert('Ei poistettavia snapshoteja.'); return; }
  const fi = date.split('-').reverse().join('.');
  if (!confirm('Palautetaanko tilanne ' + fi + ':een?\n\n' + toDelete.length + ' myöhempää snapshottia poistetaan.\n\nTätä ei voi perua.')) return;
  await DB.deleteSnapshotsAfter(date);
  _ledgerSelected = [];
  await updateNavCount();
  await renderLedger();
  alert('Palautettu. Historia palautettu ' + fi + ':een.');
}

async function archiveSnap(date, archived) {
  await DB.archiveSnapshot(date, archived);
  await renderLedger();
}

function openPinForm() {
  var wrap = document.getElementById('pin-form-wrap');
  if (!wrap) return;
  var today = new Date().toISOString().slice(0,10);
  wrap.innerHTML =
    '<div style="background:var(--surface2);border:1px solid var(--gold-dim);' +
      'border-radius:10px;padding:14px;margin-bottom:14px;">' +
    '<div style="font-size:9px;color:var(--text3);letter-spacing:.1em;text-transform:uppercase;margin-bottom:10px;">Uusi nastamuistiinpano</div>' +
    '<div style="display:grid;grid-template-columns:1fr 2fr;gap:8px;margin-bottom:8px;">' +
      '<div><div style="font-size:9px;color:var(--text3);margin-bottom:4px;">Päivämäärä</div>' +
        '<input id="pin-date" type="text" value="' + today + '" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:7px 9px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;"></div>' +
      '<div><div style="font-size:9px;color:var(--text3);margin-bottom:4px;">Otsikko</div>' +
        '<input id="pin-title" type="text" placeholder="esim. Ensimmäinen 100k" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:7px 9px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;"></div>' +
    '</div>' +
    '<div style="margin-bottom:10px;"><div style="font-size:9px;color:var(--text3);margin-bottom:4px;">Muistiinpano</div>' +
      '<input id="pin-note" type="text" placeholder="Vapaaehtoinen lisätieto" style="width:100%;background:var(--surface);border:1px solid var(--border);border-radius:6px;padding:7px 9px;color:var(--text);font-family:var(--mono);font-size:12px;outline:none;"></div>' +
    '<div style="display:flex;gap:8px;">' +
      '<button onclick="savePin()" style="flex:1;background:rgba(184,149,106,0.15);border:1px solid var(--gold-dim);border-radius:7px;padding:8px;color:var(--gold);font-weight:700;cursor:pointer;">Tallenna 📍</button>' +
      '<button onclick="document.getElementById(\'pin-form-wrap\').innerHTML=\'\'" style="background:none;border:1px solid var(--border);border-radius:7px;padding:8px 14px;color:var(--text3);cursor:pointer;">Peru</button>' +
    '</div></div>';
}

async function savePin() {
  var date  = (document.getElementById('pin-date')?.value || '').trim();
  var title = (document.getElementById('pin-title')?.value || '').trim();
  var note  = (document.getElementById('pin-note')?.value || '').trim();
  if (!date) date = new Date().toISOString().slice(0,10);
  if (/^\d{1,2}\.\d{1,2}\.\d{4}$/.test(date)) {
    var p = date.split('.'); date = p[2]+'-'+p[1].padStart(2,'0')+'-'+p[0].padStart(2,'0');
  }
  if (!title) { alert('Anna otsikko'); return; }
  var pin = { id: 'pin_'+Date.now(), date: date, title: title, note: note, created_at: new Date().toISOString() };
  await DB.putPin(pin);
  var wrap = document.getElementById('pin-form-wrap');
  if (wrap) wrap.innerHTML = '';
  await renderLedger();
}

async function deletePin(id) {
  if (!confirm('Poistetaanko nastamuistiinpano?')) return;
  await DB.deletePin(id);
  await renderLedger();
}


// ═══════════════════════════════════════════════
// DATA TRUST LAYER
// ═══════════════════════════════════════════════

// ── 1. ROLLBACK ─────────────────────────────────
async function rollbackLatestSnapshot() {
  var snaps = (await DB.getAll('snapshots')).sort(function(a,b){ return b.date.localeCompare(a.date); });
  if (snaps.length < 2) {
    alert('Tarvitaan vähintään 2 snapshottia rollbackiin. Ei tehdä mitään.');
    return;
  }
  var latest = snaps[0];
  var prev   = snaps[1];
  var latestFi = latest.date.split('-').reverse().join('.');
  var prevFi   = prev.date.split('-').reverse().join('.');

  var calc1 = calculateNetWorth(latest);
  var calc2 = calculateNetWorth(prev);
  var fmt2 = function(n) { return new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(n); };

  var ok = confirm(
    'ROLLBACK — Palautetaan tila:\n\n' +
    'Poistetaan:  ' + latestFi + '  Netto: ' + fmt2(calc1.netWorth) + '\n' +
    'Palautetaan: ' + prevFi   + '  Netto: ' + fmt2(calc2.netWorth) + '\n\n' +
    'Haluatko jatkaa?'
  );
  if (!ok) return;

  // Archive instead of delete
  var archived = Object.assign({}, latest, { _archived: true, _archivedAt: new Date().toISOString() });
  await DB.putSnapshot(archived);
  alert('Rollback valmis. Tila palautettu ' + prevFi + '.');

  // Refresh views
  if (document.getElementById('view-dashboard')?.classList.contains('active')) renderDashboard();
  if (document.getElementById('view-historia')?.classList.contains('active')) renderHistoria();
  if (document.getElementById('view-ledger')?.classList.contains('active')) renderLedger();
}

// ── 2. ARCHIVE SNAPSHOT ─────────────────────────
async function archiveSnapshot(date) {
  var snaps = await DB.getAll('snapshots');
  var snap = snaps.find(function(s){ return s.date === date; });
  if (!snap) return;
  var fi = date.split('-').reverse().join('.');
  if (!confirm('Arkistoidaanko snapshot ' + fi + '? Se piilotetaan mutta ei poisteta.')) return;
  await DB.putSnapshot(Object.assign({}, snap, { _archived: true, _archivedAt: new Date().toISOString() }));
  await renderHistoria();
  await renderLedger();
}

// ── 3. AUTO BACKUP (Time Machine -tyylinen) ─────
var _lastBackupDate = null;

async function autoBackup() {
  var today = new Date().toISOString().slice(0, 10);
  var lastKey = 'finos_last_backup_' + today;
  if (localStorage.getItem(lastKey)) return; // Jo tehty tänään

  try {
    var snaps    = await DB.getAll('snapshots');
    var holdings = await DB.getAll('holdings');
    var events   = await DB.getAll('events');
    var pins     = await DB.getAll('pins').catch(function(){ return []; });

    var backup = {
      version:   '1.0',
      createdAt: new Date().toISOString(),
      snaps:     snaps,
      holdings:  holdings,
      events:    events,
      pins:      pins,
    };

    // Tallenna localStorage:iin rolling backup
    // Rakenne: finos_backup_YYYY-MM-DD
    localStorage.setItem('finos_backup_' + today, JSON.stringify(backup));
    localStorage.setItem(lastKey, '1');

    // Siivoa vanhat — pidä vain 7 viimeistä päivää
    var backupKeys = Object.keys(localStorage).filter(function(k){ return k.startsWith('finos_backup_'); });
    backupKeys.sort().reverse();
    backupKeys.slice(7).forEach(function(k){ localStorage.removeItem(k); });

    console.log('Auto-backup OK: ' + today + ' (' + snaps.length + ' snapshottia)');
  } catch(e) {
    console.warn('Auto-backup failed:', e.message);
  }
}

function listBackups() {
  var keys = Object.keys(localStorage).filter(function(k){ return k.startsWith('finos_backup_'); });
  keys.sort().reverse();
  return keys.map(function(k) {
    try {
      var data = JSON.parse(localStorage.getItem(k));
      return {
        key:  k,
        date: k.replace('finos_backup_', ''),
        snaps: (data.snaps || []).length,
        size:  (localStorage.getItem(k).length / 1024).toFixed(0) + ' KB',
      };
    } catch(e) { return { key: k, date: k, snaps: 0, size: '?' }; }
  });
}

async function restoreFromBackup(key) {
  var raw = localStorage.getItem(key);
  if (!raw) { alert('Varmuuskopiota ei löydy.'); return; }
  var date = key.replace('finos_backup_', '').split('-').reverse().join('.');
  if (!confirm('Palautetaanko varmuuskopio ' + date + '? Nykyinen data korvataan.')) return;
  try {
    var data = JSON.parse(raw);
    if (data.snaps && data.snaps.length > 0) {
      await DB.bulkPutSnapshots(data.snaps);
    }
    alert('Palautus valmis — ' + (data.snaps||[]).length + ' snapshottia palautettu.');
    location.reload();
  } catch(e) {
    alert('Palautusvirhe: ' + e.message);
  }
}

async function downloadBackupNow() {
  var snaps    = await DB.getAll('snapshots');
  var holdings = await DB.getAll('holdings');
  var events   = await DB.getAll('events');
  var pins     = await DB.getAll('pins').catch(function(){ return []; });
  var backup   = { version: '1.0', createdAt: new Date().toISOString(), snaps: snaps, holdings: holdings, events: events, pins: pins };
  var blob     = new Blob([JSON.stringify(backup, null, 2)], { type: 'application/json' });
  var url      = URL.createObjectURL(blob);
  var a        = document.createElement('a');
  a.href       = url;
  a.download   = 'financeOS_backup_' + new Date().toISOString().slice(0,10) + '.json';
  a.click();
  URL.revokeObjectURL(url);
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.getElementById(`view-${name}`).classList.add('active');
  const btn = document.getElementById(`btn-${name}`);
  if (btn) btn.classList.add('active');
  if (name === 'events')        requestAnimationFrame(() => renderEvents());
  if (name === 'historia')      requestAnimationFrame(() => renderHistoria());
  if (name === 'salkku')        requestAnimationFrame(() => renderSalkku());
  if (name === 'likviditeetti') requestAnimationFrame(() => renderLikviditeetti());
  if (name === 'ledger')        requestAnimationFrame(() => renderLedger());
}

async function updateNavCount() {
  const n = await DB.count('snapshots');
  const el = document.getElementById('nav-count');
  if (n > 0) el.textContent = n.toLocaleString('fi-FI') + ' snapshottia';
  else el.textContent = '';
}

// ═══════════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════════
const dropZone = document.getElementById('drop-zone');
const fileInput = document.getElementById('file-input');

dropZone.addEventListener('click', () => fileInput.click());
dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('over'); });
dropZone.addEventListener('dragleave', () => dropZone.classList.remove('over'));
dropZone.addEventListener('drop', e => {
  e.preventDefault();
  dropZone.classList.remove('over');
  const f = e.dataTransfer.files[0];
  if (f) loadFile(f);
});
fileInput.addEventListener('change', e => {
  if (e.target.files[0]) loadFile(e.target.files[0]);
});

function loadFile(file) {
  // Reject .numbers files — they are ZIP/binary, not CSV
  if (file.name.endsWith('.numbers')) {
    alert('⚠️ .numbers-tiedostoa ei voi ladata suoraan.\n\nVie ensin CSV-muotoon:\nNumbers → Tiedosto → Vie → CSV...\n\nLataa sitten .csv-tiedosto tähän.');
    fileInput.value = '';
    return;
  }
  const r = new FileReader();
  r.onload = e => {
    const text = e.target.result;
    // Sanity check: ZIP magic bytes = binary file
    if (text.startsWith('PK') || text.charCodeAt(0) < 9) {
      alert('⚠️ Tiedosto ei näytä CSV-tiedostolta.\n\nMuista viedä Numbers → CSV ensin:\nTiedosto → Vie → CSV...');
      fileInput.value = '';
      return;
    }
    showMappingUI(parseCSV(text));
  };
  r.readAsText(file, 'UTF-8');
}

document.getElementById('btn-do-import').addEventListener('click', runImport);

document.getElementById('btn-back').addEventListener('click', () => {
  document.getElementById('import-upload').style.display = 'block';
  document.getElementById('import-mapping').style.display = 'none';
  document.getElementById('prog-wrap').style.display = 'none';
  document.getElementById('prog-fill').style.width = '0%';
  document.getElementById('btn-do-import').disabled = false;
  fileInput.value = '';
});

document.getElementById('btn-clear').addEventListener('click', async () => {
  if (!confirm('Tyhjennä kaikki snaphotit ja tapahtumat? Tätä ei voi peruuttaa.')) return;
  await DB.clear();
  await updateNavCount();
  document.getElementById('import-upload').style.display = 'block';
  document.getElementById('import-mapping').style.display = 'none';
  alert('Data tyhjennetty.');
  showView('dashboard');
  renderDashboard();
});

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════