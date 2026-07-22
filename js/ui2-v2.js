// ══════════════════════════════════════════════
// VERTAILU CARD  (korvaa Tilanne normaali)
// ══════════════════════════════════════════════
function renderVertailuCard(snaps, latest){
  function nettoOf(s){ try{ return calcuateNetWorth(s).netWorth; }catch(e){ return null; } }
  function kvOf(s){ return (s.tulotili||0) - Math.abs(s.op_gold||0); }
  function nearest(targetMs){ var best=null,bd=Infinity; for(var i=0;i<snaps.length;i++){ var d=Math.abs(new Date(snaps[i].date).getTime()-targetMs); if(d<bd){bd=d;best=snaps[i];} } return best; }
  function shift(iso,y,m){ var d=new Date(iso); d.setFullYear(d.getFullYear()+y); d.setMonth(d.getMonth()+m); return d.getTime(); }
  var yAgo=nearest(shift(latest.date,-1,0)), mAgo=nearest(shift(latest.date,0,-1));
  function deltaSpan(now,then){ if(now==null||then==null) return ''; var d=now-then; var c=d>=0?'var(--green)':'#b8956a'; var sign=d>=0?'+':''; return '<span style="font-family:var(--mono);font-size:12px;color:'+c+';">'+sign+fmt(d)+'</span>'; }
  function rowCmp(label,nowV,thenV){ return '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;"><span style="font-size:12px;color:var(--text3);">'+label+'</span><span style="display:flex;gap:10px;align-items:baseline;"><span style="font-family:var(--mono);font-size:12px;color:var(--text);">'+fmt(thenV)+'</span>'+deltaSpan(nowV,thenV)+'</span></div>'; }
  function block(label,valFn){ var now=valFn(latest); var rows='<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;"><span style="font-size:12px;color:var(--text3);">Nyt</span><span style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--text2);">'+fmt(now)+'</span></div>'; if(yAgo) rows+=rowCmp('Vuosi sitten',now,valFn(yAgo)); if(mAgo) rows+=rowCmp('Viime kuussa',now,valFn(mAgo)); return '<div style="margin-bottom:14px;"><div style="font-size:12px;color:var(--text2);font-weight:600;margin-bottom:6px;">'+label+'</div>'+rows+'</div>'; }
  var inner = block('Nettovarallisuus',nettoOf) + block('Käyttövara',kvOf);
  return _cardHeader('Vertailu','heartbeat',[]) + inner;
}

// ═══════════════════════════════════════════════
// FINANCIAL HEARTBEAT CARD  (Sprint 5 v3)
// ═══════════════════════════════════════════════
function renderHeartbeatCard(sig) {
  if (!sig) return '';
  const hb = sig.heartbeat, tempo = sig.tempo, cycle = sig.cycle, runway = sig.runway, direction = sig.direction;

  const tempoBar = tempo ? (function() {
    var pct = Math.min(tempo.tempo, 200);
    var barPct = Math.round(pct / 2);
    var barColor = pct > 130 ? 'var(--red)' : pct > 105 ? 'var(--amber)' : 'var(--green)';
    return '<div style="margin-top:14px;">'
      + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;">'
      + '<span>Kulutustempo · pv ' + tempo.dayNum + '</span>'
      + '<span style="color:' + barColor + ';font-weight:700;">' + tempo.tempo + ' %</span></div>'
      + '<div style="position:relative;height:20px;background:rgba(0,0,0,0.25);border-radius:5px;overflow:hidden;">'
      + '<div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.1);"></div>'
      + '<div style="position:absolute;left:0;top:0;bottom:0;width:' + barPct + '%;background:' + barColor + ';opacity:0.65;border-radius:5px;transition:width .4s;"></div>'
      + '<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 8px;justify-content:space-between;">'
      + '<span style="font-family:var(--mono);font-size:11px;color:#fff;font-weight:600;">' + fmt(-tempo.curSpend) + '</span>'
      + '<span style="font-family:var(--mono);font-size:10px;color:rgba(255,255,255,0.68);">ka. ' + fmt(-tempo.paceAvg) + '</span>'
      + '</div></div></div>';
  })() : '';

  var cycleBlock = '';
  if (cycle) {
    var cash = cycle.cashBalance, card = cycle.cardBalance, net = cycle.net, days = cycle.daysUntilDue;
    var netClr = net >= 0 ? 'var(--green)' : 'var(--text2)';
    var daysClr = days <= 3 ? 'var(--red)' : days <= 7 ? 'var(--amber)' : 'var(--text3)';
    var badge = cycle.cycleOk
      ? '<span style="color:var(--green);font-size:10px;">● Koroton sykli</span>'
      : '<span style="color:var(--amber);font-size:10px;">○ Seuraa eräpäivää</span>';
    cycleBlock = '<div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border);">'
      + '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:7px;">'
      + '<span style="font-size:10px;letter-spacing:.06em;color:var(--text3);text-transform:uppercase;">Kassasykli</span>' + badge + '</div>'
      + '<div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:5px;">'
      + '<div style="background:rgba(0,0,0,0.2);border-radius:6px;padding:7px 9px;"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px;">Tilit</div><div style="font-family:var(--mono);font-size:12px;font-weight:600;color:var(--green);">' + fmt(cash) + '</div></div>'
      + '<div style="background:rgba(0,0,0,0.2);border-radius:6px;padding:7px 9px;"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px;">Luottokortti</div><div style="font-family:var(--mono);font-size:12px;font-weight:600;color:var(--gold);">' + fmt(-card) + '</div></div>'
      + '<div style="background:rgba(0,0,0,0.2);border-radius:6px;padding:7px 9px;"><div style="font-size:9px;color:var(--text3);text-transform:uppercase;margin-bottom:2px;">Netto</div><div style="font-family:var(--mono);font-size:12px;font-weight:600;color:' + netClr + ';">' + fmt(net) + '</div></div>'
      + '</div>'
      + '<div style="text-align:right;margin-top:4px;font-size:10px;color:' + daysClr + ';">Eräpäivään ' + days + ' pv</div>'
      + '</div>';
  }

  var reserviBlock = '';
  if (runway) {
    var months = runway.months;
    var rColor = months < 3 ? 'var(--red)' : months < 8 ? 'var(--amber)' : 'var(--green)';
    var rBar = Math.min(Math.round((months / 36) * 100), 100);
    reserviBlock = '<div style="margin-top:12px;padding-top:11px;border-top:1px solid var(--border);">'
      + '<div style="display:flex;justify-content:space-between;align-items:baseline;">'
      + '<div><div style="font-size:10px;letter-spacing:.06em;color:var(--text3);text-transform:uppercase;">Strateginen reservi</div>'
      + '<div style="font-size:10px;color:var(--text3);margin-top:1px;">sijoituksia hyödyntämällä</div></div>'
      + '<span style="font-family:var(--mono);font-size:19px;font-weight:700;color:' + rColor + ';">' + months + ' kk</span></div>'
      + '<div style="position:relative;height:5px;background:rgba(0,0,0,0.2);border-radius:3px;overflow:hidden;margin-top:6px;">'
      + '<div style="position:absolute;left:0;top:0;bottom:0;width:' + rBar + '%;background:' + rColor + ';opacity:0.5;border-radius:3px;"></div></div>'
      + '<div style="font-size:10px;color:var(--text3);margin-top:3px;">Kuukausikulutus ka. ' + fmt(-runway.monthlyBurn) + '</div>'
      + '</div>';
  }

  var dirBlock = direction
    ? '<div style="font-size:10px;color:' + direction.color + ';text-align:right;max-width:140px;line-height:1.4;margin-top:2px;">' + direction.label + '</div>'
    : '';

  return '<div data-section-id="heartbeat" style="background:var(--surface2);border:1px solid var(--border);border-radius:14px;padding:16px 16px 14px;margin-bottom:14px;position:relative;overflow:hidden;">'
    + '<div style="position:absolute;top:0;left:0;right:0;height:2px;background:linear-gradient(90deg,transparent,' + hb.color + '50,transparent);"></div>'
    + '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:8px;">'
    + '<div style="display:flex;align-items:center;gap:8px;">'
    + '<span style="font-size:15px;color:' + hb.color + ';">' + hb.dot + '</span>'
    + '<div><div style="font-size:14px;font-weight:700;color:var(--text1);">' + hb.label + '</div>'
    + (hb.sub ? '<div style="font-size:11px;color:var(--text3);margin-top:1px;">' + hb.sub + '</div>' : '')
    + '</div></div>' + dirBlock + '</div>'
    + tempoBar + cycleBlock + reserviBlock + '</div>';
}

// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// SITOUMUKSET CARD — kaksi kerrosta
// Kerros 1: Operatiivinen sykli (OP Gold, elävä)
// Kerros 2: Rakenteellinen kuorma (lainat, aikahorisontti)
// ═══════════════════════════════════════════════

// Lue lainan konfiguraatio localStoragesta (tai käytä oletuksia)
// Laske lainan korkein historiassa havaittu saldo (peakBalance, ei välttämättä alkuperäinen)
// Laske lainasta maksettu määrä yhden kalenterivuoden aikana (alku-saldo − loppu-saldo)
function _yearPaid(snaps, key, year) {
  function snapNear(target) {
    var f = snaps.filter(function(s){ return s.date <= target; });
    return f.length ? f[f.length-1] : null;
  }
  var s0 = snapNear((year-1)+'-12-31');
  var s1 = snapNear(year+'-12-31');
  var b0 = Math.abs(s0 ? (s0[key]||0) : 0);
  var b1 = Math.abs(s1 ? (s1[key]||0) : 0);
  return b0 - b1; // positive = paid down
}

function _peakBal(snaps, key) {
  return Math.max(0, ...snaps.map(function(s){ return Math.abs(s[key] || 0); }));
}

function _loanCfg(key, endsYear, endsMonth, monthly) {
  try {
    const cfg = JSON.parse(localStorage.getItem('loan_cfg_' + key) || '{}');
    return {
      endsYear:  cfg.endsYear  || endsYear,
      endsMonth: cfg.endsMonth || endsMonth,
      monthly:   cfg.monthly   || monthly,
    };
  } catch(e) { return { endsYear, endsMonth, monthly }; }
}
window.saveLoanDate = function(key, btnEl) {
  var mo = parseInt(document.getElementById('ld-mo-'+key).value, 10);
  var yr = parseInt(document.getElementById('ld-yr-'+key).value, 10);
  if (isNaN(mo) || mo < 1 || mo > 12 || isNaN(yr) || yr < 2024 || yr > 2040) return;
  var stored = {};
  try { stored = JSON.parse(localStorage.getItem('loan_cfg_'+key)||'{}')||{}; } catch(e){}
  stored.endsMonth = mo; stored.endsYear = yr;
  localStorage.setItem('loan_cfg_'+key, JSON.stringify(stored));
  // DOM: update date span in header row
  var dateEl = document.getElementById('ld-date-'+key);
  if (dateEl) dateEl.textContent = String(mo).padStart(2,'0')+'/'+yr;
  // Feedback: show ✓ on button
  if (btnEl) { var prev = btnEl.textContent; btnEl.textContent = '\u2713'; setTimeout(function(){ btnEl.textContent = prev; }, 1500); }
};
function renderSitoumusCard(sig, latest, creditDebt, ltDebt, snaps) {
  var now = new Date();
  var nowYear  = now.getFullYear();
  var nowMonth = now.getMonth() + 1;

  var loanDefs = [
    Object.assign({ key:'asuntolaina',          label:'Asuntolaina',   icon:'🏠', peakBalance: _peakBal(snaps,'asuntolaina')          }, _loanCfg('asuntolaina',          2029, 3,  200)),
    Object.assign({ key:'autolaina',            label:'Autolaina',     icon:'🚗', peakBalance: _peakBal(snaps,'autolaina')            }, _loanCfg('autolaina',            2027, 9,  255)),
    Object.assign({ key:'asuntolaina_remontti', label:'Remonttilaina', icon:'🔨', peakBalance: _peakBal(snaps,'asuntolaina_remontti') }, _loanCfg('asuntolaina_remontti', 2026, 6,  170)),
  ];

  // % muutos vs ed. kk
  var lainatPct = (typeof _lainatPrevPct !== 'undefined') ? _lainatPrevPct : null;
  var lainatBadge = lainatPct !== null
    ? ' <span style="font-family:var(--mono);font-size:12px;color:'+(lainatPct<=0?'var(--green)':'var(--text3)')+';">'
      +(lainatPct>=0?'+':'')+lainatPct.toFixed(1)+'% vs ed. kk</span>'
    : '';

  function fmtMY(m, y) { return String(m).padStart(2,'0') + '/' + y; }

  // ── Kompakti aikajana (korvaa summaryBlock) ──
  var sortedForTimeline = loanDefs
    .filter(function(ld){ return Math.abs(latest[ld.key]||0) >= 10; })
    .slice().sort(function(a,b){ return (a.endsYear*12+a.endsMonth)-(b.endsYear*12+b.endsMonth); });

  var timelineParts = sortedForTimeline.map(function(ld, i) {
    var tlMo = (ld.endsYear - nowYear) * 12 + (ld.endsMonth - nowMonth);
    var clr  = tlMo < 12 ? 'var(--card-primary-bright)' : tlMo < 30 ? 'var(--card-primary)' : 'var(--text3)';
    return '<span style="font-size:11px;color:'+clr+';">'+ld.icon+' '+fmtMY(ld.endsMonth, ld.endsYear)+'</span>';
  });
  var separator = '<span style="font-size:10px;color:rgba(255,255,255,0.2);margin:0 6px;">─●─</span>';
  var timelineBlock = '<div style="margin-bottom:10px;display:flex;align-items:center;flex-wrap:wrap;gap:2px;">'
    + '<span style="font-size:11px;color:var(--card-primary);font-weight:600;">● NOW</span>'
    + separator + timelineParts.join(separator)
    + '<span style="font-size:11px;color:rgba(255,255,255,0.25);margin-left:4px;">🏁</span>'
    + '</div>';

  // ── toggleLoanDetail global helper ──
  window.toggleLoanDetail = function(el) {
    var did = el.dataset.did;
    var detail = document.getElementById(did);
    if (detail) detail.style.display = detail.style.display === 'none' ? 'block' : 'none';
  };


  // ── Lainakohtaiset rivit ──
  var loanRows = '';
  loanDefs.forEach(function(ld) {
    var bal = latest[ld.key];
    if (!bal || Math.abs(bal) < 10) return;
    var absbal = Math.abs(bal);
    var paid   = ld.peakBalance - absbal;
    var pct    = ld.peakBalance > 0 ? Math.round(paid / ld.peakBalance * 100) : 0;
    var filled = Math.round(pct / 10);
    var empty  = 10 - filled;
    var bar    = '█'.repeat(filled) + '░'.repeat(empty);
    var mmYY   = fmtMY(ld.endsMonth, ld.endsYear);
    var yLeft  = ld.endsYear - nowYear;
    var dateClr = 'var(--card-primary-dark)';
    var monthsLeft = (ld.endsYear - nowYear) * 12 + (ld.endsMonth - nowMonth);

    var paidThisYear = _yearPaid(snaps, ld.key, nowYear);
    var paidLastYear = _yearPaid(snaps, ld.key, nowYear - 1);
    var paidTotal    = paid;
    var detailId     = 'ld-' + ld.key;

    loanRows += '<div style="padding:9px 0;border-bottom:1px solid rgba(255,255,255,0.05);cursor:pointer;" onclick="toggleLoanDetail(this)" data-did="' + detailId + '">'
      +'<div style="display:flex;align-items:center;gap:6px;margin-bottom:4px;">'
        +'<span style="font-size:13px;flex-shrink:0;">'+ ld.icon +'</span>'
        +'<span style="font-size:12px;color:var(--card-primary);font-weight:600;flex:1;">'+ ld.label +'</span>'
        +'<span id="ld-date-'+ld.key+'" style="font-family:var(--mono);font-size:11px;color:'+dateClr+';flex-shrink:0;">'+ mmYY +'</span>'
      +'</div>'
      +'<div style="font-family:var(--mono);font-size:11px;color:var(--card-primary);letter-spacing:.04em;margin-bottom:4px;">'+ bar +'</div>'
      +'<div style="display:flex;gap:14px;font-family:var(--mono);font-size:11px;">'
        +'<span style="color:var(--card-primary);">'+ fmt(absbal) +'\u00a0j\u00e4ljell\u00e4</span>'
        +'<span style="color:var(--card-primary-dark);">'+ fmt(paidTotal) +'\u00a0maksettu</span>'
      +'</div>'
      +'<div id="' + detailId + '" style="display:none;margin-top:7px;padding:7px 10px;'
        +'background:rgba(255,255,255,0.03);border-radius:6px;font-family:var(--mono);font-size:11px;">'
        +'<div style="display:flex;flex-direction:column;gap:3px;">'
          +(paidThisYear > 0
            ? '<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="color:var(--card-primary-dark);">'+nowYear+'</span><span style="color:var(--card-primary);">−'+fmt(paidThisYear)+'</span></div>'
            : '')
          +(paidLastYear > 0
            ? '<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="color:var(--card-primary-dark);">'+(nowYear-1)+'</span><span style="color:var(--card-primary);">−'+fmt(paidLastYear)+'</span></div>'
            : '')
          +'<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="color:var(--card-primary-dark);">Σ</span><span style="color:var(--card-primary);">−'+fmt(paidTotal)+'</span></div>'
          +'<div style="display:flex;justify-content:space-between;align-items:baseline;"><span style="color:var(--card-primary-dark);">'+ ld.monthly +' €/kk</span><span></span></div>'
          +'<div style="margin-top:8px;border-top:1px solid rgba(255,255,255,0.06);padding-top:7px;display:flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;color:var(--text3);">'
          +'P\u00e4\u00e4ttyy\u00a0'
          +'<input id="ld-mo-'+ld.key+'" type="number" min="1" max="12" value="'+ld.endsMonth+'" style="width:36px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:3px;color:var(--text2);font-family:var(--mono);font-size:11px;padding:2px 3px;text-align:center;" onclick="event.stopPropagation()">'
          +'<input id="ld-yr-'+ld.key+'" type="number" min="2024" max="2040" value="'+ld.endsYear+'" style="width:50px;background:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.15);border-radius:3px;color:var(--text2);font-family:var(--mono);font-size:11px;padding:2px 3px;text-align:center;" onclick="event.stopPropagation()">'
          +'<button data-lid="'+ld.key+'" onclick="event.stopPropagation();saveLoanDate(this.dataset.lid,this)" style="background:rgba(255,255,255,0.08);border:1px solid rgba(255,255,255,0.15);border-radius:3px;color:var(--text2);font-family:var(--mono);font-size:11px;padding:2px 8px;cursor:pointer;">Tallenna</button>'
          +'</div>'
        +'</div>'
      +'</div>'
    +'</div>';
  });

  // Collapsed quick-view: icon + MM/YYYY per loan
  var collapsedSummary = loanDefs
    .filter(function(l){ return latest[l.key] && Math.abs(latest[l.key]) > 10; })
    .map(function(l){ return l.icon+' '+fmtMY(l.endsMonth, l.endsYear); })
    .join('  ');

  return '<div class="db-item card" data-item-id="debt">'
    + _cardHeader('Pitkät velat', 'debt', [
      {key:'asuntolaina', label:'As.laina'},
      {key:'autolaina',   label:'Autolaina'},
      {key:'asremontti',  label:'As.remontti'},
    ])
    + '<div class="card-left">'
    + '<div class="card-value" style="margin-bottom:12px;">'+fmt(-ltDebt)+'</div>'+lainatBadge
    + '</div>'
    + '<div class="card-right">'
    + (_pref('debt','expanded',true)
       ? loanRows
       : '<div style="font-size:11px;color:var(--card-primary-dark);margin-top:2px;letter-spacing:.02em;">'
         + collapsedSummary
         + '</div>')
    + '</div>'
    + '</div>';
}

// ═══════════════════════════════════════════════
// MOBIILI-DASHBOARD v3 — Wealth Cockpit
// 1. Heartbeat  2. 2x2 orientaatio
// 3. Operatiivinen rytmi (OP Gold)
// 4. Aikarakenne (lainat + kapasiteetti)
// 5. Reservi
// ═══════════════════════════════════════════════
function _fK(n) { if (n == null) return '—'; return fmt(n); }
function _fK_OLD(n) {
  if (n == null) return '—';
  const a = Math.abs(n), s = n < 0 ? '−' : '';
  if (a >= 1000) return s + (a/1000).toFixed(1).replace('.',',') + 'k';
  return s + Math.round(a);
}

function renderMobileDashboard(snaps, latest, calc, sig, cnt) {
  const nw    = calc.netWorth;
  const inv   = calc.investments;
  const cash  = calc.cash;
  const debt  = calc.shortTermDebt + calc.longTermDebt;
  const hb    = sig && sig.heartbeat;
  const tempo = sig && sig.tempo;
  const cycle = sig && sig.cycle;
  const runway= sig && sig.runway;

  const snap1y = snaps.length > 1 ? snaps[Math.max(0, snaps.length-366)] : null;
  const d1y    = snap1y ? nw - calculateNetWorth(snap1y).netWorth : null;
  const liquid = cash - calc.shortTermDebt;

  // ── 1. HEARTBEAT ──────────────────────────────
  var hbRow = '';
  if (hb) {
    hbRow = '<div style="display:flex;align-items:center;justify-content:space-between;'
      +'padding:9px 13px;background:var(--surface);border:1px solid var(--border);'
      +'border-radius:10px;margin-bottom:8px;gap:8px;overflow:hidden;">'
      +'<div style="display:flex;align-items:center;gap:7px;min-width:0;">'
      +'<span style="font-size:13px;color:'+hb.color+';flex-shrink:0;">'+hb.dot+'</span>'
      +'<span style="font-size:12px;font-weight:600;color:var(--text);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+hb.label+'</span>'
      +(tempo ? '<span style="font-size:10px;color:var(--text3);flex-shrink:0;"> '+tempo.tempo+'%</span>' : '')
      +'</div>'
      +(cycle ? '<span style="font-size:10px;color:var(--text3);flex-shrink:0;white-space:nowrap;">Eräp. '+cycle.daysUntilDue+' pv</span>' : '')
      +'</div>';
  }

  // ── 2. 2x2 ORIENTAATIOKERROS ─────────────────
  // Kuorma: neutraali harmaa — pitkä velka ei ole hälytin
  function tile(label, value, sub, vc) {
    return '<div style="background:var(--surface);border:1px solid var(--border);'
      +'border-radius:10px;padding:10px 11px;min-width:0;overflow:hidden;">'
      +'<div style="font-size:8px;color:var(--text3);letter-spacing:.04em;'
      +'text-transform:uppercase;margin-bottom:4px;">' + label + '</div>'
      +'<div style="font-family:var(--mono);font-size:18px;font-weight:700;'
      +'color:'+(vc||'var(--text)')+';line-height:1.1;">' + value + '</div>'
      +(sub ? '<div style="font-size:10px;color:var(--text3);margin-top:3px;'
        +'white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">' + sub + '</div>' : '')
      +'</div>';
  }

  const nwSub = d1y !== null ? (d1y>=0?'+':'−')+_fK(Math.abs(d1y))+' / 1v' : null;

  const ltDebtMobile = calc.longTermDebt;
  const stDebtMobile = calc.shortTermDebt;

  var grid = '<div style="display:grid;grid-template-columns:1fr 1fr;gap:7px;margin-bottom:8px;">'
    + tile('Sijoitukset', _fK(inv), 'Nordnet + OP')
    + '<div style="background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:10px 11px;min-width:0;overflow:hidden;">'
    + '<div style="font-size:8px;color:var(--text3);letter-spacing:.04em;text-transform:uppercase;margin-bottom:6px;">Velat</div>'
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:3px;">'
    + '<span style="font-size:10px;color:var(--text3);">OP Gold</span>'
    + '<span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--card-green);">'
    + _fK(-stDebtMobile) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;">'
    + '<span style="font-size:10px;color:var(--text3);">Lainat</span>'
    + '<span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--text3);">'
    + _fK(-ltDebtMobile) + '</span></div>'
    + '</div>'
    + tile('Käyttötilit', _fK(cash), 'netto '+_fK(liquid), 'var(--text2)')
    + tile('Nettovarallisuus', _fK(nw), nwSub)
    +'</div>';

  // ── 3. OPERATIIVINEN RYTMI: Tulotili − OP Gold ─
  var rytmiBlock = '';
  if (latest.op_gold !== undefined) {
    const tulotili = latest.tulotili ?? 0;
    const opGold   = Math.abs(latest.op_gold ?? 0);
    const curNetto = tulotili - opGold;
    const baseline = tempo ? tempo.paceAvg : null;
    const diffEur  = baseline !== null ? curNetto - baseline : null;
    const devPct   = (baseline !== null && baseline !== 0)
                     ? Math.round(((curNetto - baseline) / Math.abs(baseline)) * 100) : null;

    var devColor = 'var(--text2)', devLabel = 'Normaali sykli';
    if (devPct !== null) {
      if (devPct > 10)       { devColor = 'var(--green)'; devLabel = '+'+devPct+' % parempi kuin normaali'; }
      else if (devPct < -10) { devColor = 'var(--red)'; devLabel = Math.abs(devPct)+' % yli normaalin'; }
    }

    const cycLabel = cycle ? (cycle.cycleOk
      ? '<span style="color:var(--green);font-size:10px;">● Koroton · eräp. '+cycle.daysUntilDue+' pv</span>'
      : '<span style="color:var(--amber);font-size:10px;">○ Eräp. '+cycle.daysUntilDue+' pv</span>') : '';

    rytmiBlock = '<div style="background:var(--surface);border:1px solid var(--border);'
      +'border-radius:10px;padding:11px 13px;margin-bottom:8px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">● Tulotili − käyttöluotto</span>'
      +cycLabel+'</div>'
      // Tulotili (inline edit)
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">'
      +'<span style="font-size:11px;color:var(--text);">Tulotili</span>'
      +'<span data-raw="'+tulotili+'" id="kassa-tulotili-val" style="font-family:var(--mono);font-size:13px;color:var(--text2);cursor:pointer;" onclick="kassaInlineEdit(\'tulotili\',this)">'+ fmt(tulotili) +'</span>'
      +'<input id="kassa-tulotili-inp" type="number" inputmode="decimal" style="display:none;width:90px;font-family:var(--mono);font-size:16px;color:var(--text2);background:var(--surface);border:1px solid var(--accent);border-radius:4px;padding:2px 4px;text-align:right;" />'
      +'</div>'
      // OP Gold (inline edit)
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">'
      +'<span style="font-size:11px;color:var(--text3);">OP Gold</span>'
      +'<span data-raw="'+opGold+'" id="kassa-op_gold-val" style="font-family:var(--mono);font-size:13px;color:var(--card-primary);cursor:pointer;" onclick="kassaInlineEdit(\'op_gold\',this)">'+ fmt(-opGold) +'</span>'
      +'<input id="kassa-op_gold-inp" type="number" inputmode="decimal" style="display:none;width:90px;font-family:var(--mono);font-size:16px;color:var(--card-primary);background:var(--surface);border:1px solid var(--accent);border-radius:4px;padding:2px 4px;text-align:right;" />'
      +'</div>'
      // Viiva
      +'<div style="height:1px;background:rgba(255,255,255,0.08);margin:5px 0;"></div>'
      // Nettorytmi
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:6px;">'
      +'<span style="font-size:12px;font-weight:600;color:var(--text);">Nettorytmi</span>'
      +'<span style="font-family:var(--mono);font-size:18px;font-weight:700;color:var(--text);">'+fmt(curNetto)+'</span>'
      +'</div>'
      // Normaali + poikkeama
      +(baseline !== null ? (
        '<div style="display:flex;justify-content:space-between;margin-bottom:3px;">'
        +'<span style="font-size:10px;color:var(--text3);">Normaali (5 kk ka.)</span>'
        +'<span style="font-family:var(--mono);font-size:10px;color:var(--text3);">'+fmt(baseline)+'</span>'
        +'</div>'
        +'<div style="font-size:12px;font-weight:600;color:'+devColor+';">'+devLabel+'</div>'
      ) : '')
      +'</div>';
  }

  // ── 4. AIKARAKENNE ───────────────────────────
  // Päättymisvuosi on päätieto, saldo toissijainen
  const nowYear = new Date().getFullYear();
  const loanDefs = [
    Object.assign({ key:'asuntolaina',          label:'Asuntolaina'  }, _loanCfg('asuntolaina',          2029, 200)),
    Object.assign({ key:'autolaina',            label:'Autolaina'    }, _loanCfg('autolaina',            2027, 255)),
    Object.assign({ key:'asuntolaina_remontti', label:'Remonttilaina'}, _loanCfg('asuntolaina_remontti', 2026, 170)),
  ];
  var loanRows = '';
  var totalFree = 0;
  loanDefs.forEach(function(ld) {
    const bal = latest[ld.key];
    if (!bal || Math.abs(bal) < 10) return;
    const yLeft = ld.endsYear - nowYear;
    const yClr  = yLeft <= 1 ? 'var(--card-primary-bright)' : yLeft <= 3 ? 'var(--card-primary)' : 'var(--text3)';
    if (ld.endsYear > nowYear) totalFree += ld.monthly;
    // Saldo näkyvästi, päättymisvuosi kontekstina
    loanRows += '<div style="display:flex;justify-content:space-between;align-items:flex-start;'
      +'padding:8px 0;border-bottom:1px solid rgba(255,255,255,0.05);">'
      +'<div>'
      +'<div style="font-size:12px;color:var(--text3);margin-bottom:2px;">'+ld.label+'</div>'
      +'<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--text2);">'+fmt(bal)+'</div>'
      +'<div style="font-size:11px;color:'+yClr+';margin-top:2px;">→ päättyy '+ld.endsYear+'</div>'
      +'</div>'
      +'<div style="text-align:right;flex-shrink:0;padding-top:14px;">'
      +'<div style="font-size:12px;color:var(--text2);font-weight:600;">+'+fmt(ld.monthly)+'/kk</div>'
      +'<div style="font-size:10px;color:var(--text3);">vapautuu</div>'
      +'</div></div>';
  });

  var aikaBlock = '';
  if (loanRows) {
    aikaBlock = '<div style="background:var(--surface);border:1px solid var(--border);'
      +'border-radius:10px;padding:11px 13px;margin-bottom:8px;">'
      +'<div style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:8px;">◼ Aikarakenne · pitkät velat</div>'
      + loanRows
      +(totalFree > 0
        ? '<div style="margin-top:8px;padding:7px 10px;border-radius:7px;'
          +'background:rgba(90,158,106,0.07);border:1px solid rgba(90,158,106,0.18);">'
          +'<div style="font-size:11px;color:var(--green);font-weight:600;">⬆ Yhteensä +'+fmt(totalFree)+'/kk vapautuu</div>'
          +'</div>' : '')
      +'</div>';
  }

  // ── 5. RESERVI ───────────────────────────────
  const rClr = runway ? (runway.months < 3 ? 'var(--red)' : runway.months < 8 ? 'var(--amber)' : 'var(--green)') : 'var(--text3)';
  var reserviRow = runway ? (
    '<div style="display:flex;justify-content:space-between;align-items:center;'
    +'padding:9px 13px;background:var(--surface);border:1px solid var(--border);border-radius:10px;">'
    +'<span style="font-size:11px;color:var(--text3);">Strateginen reservi · sijoitukset × 0,65</span>'
    +'<span style="font-family:var(--mono);font-size:15px;font-weight:700;color:'+rClr+';">'+runway.months+' kk</span>'
    +'</div>'
  ) : '';

  return '<div style="max-width:100%;overflow:hidden;">'
    +'<div style="font-size:10px;color:var(--text3);margin-bottom:8px;font-family:var(--mono);">'
    +fmtDate(latest.date)+' · '+cnt.toLocaleString('fi-FI')+' snapshotia'
    +'</div>'
    + hbRow
    + grid
    + rytmiBlock
    + aikaBlock
    + reserviRow
    +'</div>';
}


// ══════════════════════════════════════════════════════════
// FOCUS MODE — korttiasetukset, collapse, prosentit, rivit
// ══════════════════════════════════════════════════════════
function _getCardPrefs() {
  try { return JSON.parse(localStorage.getItem('fin_card_prefs') || '{}'); }
  catch { return {}; }
}
function _setCardPref(card, key, val) {
  var p = _getCardPrefs();
  if (!p[card]) p[card] = {};
  p[card][key] = val;
  localStorage.setItem('fin_card_prefs', JSON.stringify(p));
}
function _pref(card, key, def) {
  var p = _getCardPrefs();
  return (p[card] && p[card][key] !== undefined) ? p[card][key] : def;
}

window.toggleCardDetail = function(card) {
  _setCardPref(card, 'expanded', !_pref(card, 'expanded', true));
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
};
window.toggleCardPct = function(card) {
  _setCardPref(card, 'showPct', !_pref(card, 'showPct', true));
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
};
window.toggleCardRow = function(card, row) {
  _setCardPref(card, 'row_'+row, !_pref(card, 'row_'+row, true));
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
};
window.toggleCardVisible = function(card) {
  _setCardPref(card, 'visible', !_pref(card, 'visible', true));
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
};

// Settingsi-popover — DOM-manipulaatiolla, ei innerHTML-escaping-ongelmia
window.openCardSettings = function(card, title, rows, evt) {
  var el = document.getElementById('card-settings-popover');
  if (el && el.dataset.card === card) { el.remove(); return; }
  if (el) el.remove();

  var div = document.createElement('div');
  div.id = 'card-settings-popover';
  div.dataset.card = card;
  div.style.cssText = 'position:fixed;z-index:500;background:var(--surface);'
    + 'border:1px solid var(--border-bright);border-radius:10px;padding:14px 16px;'
    + 'min-width:210px;box-shadow:0 8px 32px rgba(0,0,0,0.5);top:0;left:0;';

  // Otsikko
  var h = document.createElement('div');
  h.style.cssText = 'font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.08em;margin-bottom:10px;';
  h.textContent = title;
  div.appendChild(h);

  // Rivit
  rows.forEach(function(r) {
    var lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:12px;color:var(--text2);';
    var cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = _pref(card, 'row_'+r.key, true);
    cb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);cursor:pointer;';
    cb.addEventListener('change', function() { toggleCardRow(card, r.key); });
    lbl.appendChild(cb);
    lbl.appendChild(document.createTextNode(r.label));
    div.appendChild(lbl);
  });

  if (card !== 'cash') {
    // Viiva
    var hr = document.createElement('div');
    hr.style.cssText = 'height:1px;background:var(--border);margin:8px 0;';
    div.appendChild(hr);

    // % toggle
    var pctLbl = document.createElement('label');
    pctLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:12px;color:var(--text2);';
    var pctCb = document.createElement('input');
    pctCb.type = 'checkbox'; pctCb.checked = _pref(card, 'showPct', true);
    pctCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);';
    pctCb.addEventListener('change', function() { toggleCardPct(card); });
    pctLbl.appendChild(pctCb); pctLbl.appendChild(document.createTextNode('Muutosprosentit'));
    div.appendChild(pctLbl);
  }

  // Yksityiskohdat auki/piiloon
  var detLbl = document.createElement('label');
  detLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:12px;color:var(--text2);';
  var detCb = document.createElement('input');
  detCb.type = 'checkbox'; detCb.checked = _pref(card, 'expanded', true);
  detCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);';
  detCb.addEventListener('change', function() { toggleCardDetail(card); });
  detLbl.appendChild(detCb);
  detLbl.appendChild(document.createTextNode('Yksityiskohdat'));
  div.appendChild(detLbl);

  if (card === 'cash') {
    // Kassajakson hallinta — oma modal, ei osa tätä popoveria (ks.
    // openKassajaksoHallintaModal, UX-sprintti 22.7.2026).
    var kjHr = document.createElement('div');
    kjHr.style.cssText = 'height:1px;background:var(--border);margin:8px 0;';
    div.appendChild(kjHr);

    var kjBtn = document.createElement('button');
    kjBtn.textContent = 'Kassajakson hallinta →';
    kjBtn.style.cssText = 'display:block;width:100%;text-align:left;padding:4px 0;'
      + 'background:none;border:none;color:var(--text2);font-size:12px;cursor:pointer;';
    kjBtn.addEventListener('click', function() {
      div.remove();
      openKassajaksoHallintaModal();
    });
    div.appendChild(kjBtn);
  }

  if (card !== 'cash') {
    // Näytä kortti toggle
    var visLbl = document.createElement('label');
    visLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:12px;color:var(--text2);';
    var visCb = document.createElement('input');
    visCb.type = 'checkbox'; visCb.checked = _pref(card, 'visible', true);
    visCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);';
    visCb.addEventListener('change', function() { toggleCardVisible(card); });
    visLbl.appendChild(visCb); visLbl.appendChild(document.createTextNode('Näytä dashboardissa'));
    div.appendChild(visLbl);
  }

  // Sulje-nappi
  var btn = document.createElement('button');
  btn.textContent = 'Sulje';
  btn.style.cssText = 'margin-top:10px;width:100%;padding:5px;border-radius:6px;background:transparent;'
    + 'border:1px solid var(--border);color:var(--text3);font-size:11px;cursor:pointer;';
  btn.addEventListener('click', function() { div.remove(); });
  div.appendChild(btn);

  document.body.appendChild(div);

  // Asemoi
  var clientX = evt ? evt.clientX : window.innerWidth/2;
  var clientY = evt ? evt.clientY : window.innerHeight/2;
  setTimeout(function() {
    var r2 = div.getBoundingClientRect();
    div.style.left = Math.min(window.innerWidth - r2.width - 12, Math.max(12, clientX - 10)) + 'px';
    div.style.top  = Math.min(window.innerHeight - r2.height - 12, clientY + 8) + 'px';
  }, 0);

  setTimeout(function() {
    document.addEventListener('click', function closeP(e) {
      if (!div.contains(e.target) && e.target.id !== 'card-settings-popover') {
        div.remove(); document.removeEventListener('click', closeP);
      }
    });
  }, 100);
};

// Card-otsikkorivi
var CARD_ACCENT = { cash:'var(--accent-kassa)', inv:'var(--accent-sijoitukset)', debt:'var(--accent-velat)' }; function _cardHeader(label, cardKey, settingsRows) { var accent = CARD_ACCENT[cardKey] || 'var(--accent-default)';
  var exp = _pref(cardKey, 'expanded', true);
  var pct = _pref(cardKey, 'showPct', true);
  var rows = settingsRows || [];
  var rowsJSON = JSON.stringify(rows).replace(/"/g, '&quot;');
  return '<div class="card-header-row" style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
        + '<div class="card-label" style="margin-bottom:0;cursor:pointer;color:' + accent + ';' + '" onclick="toggleCardDetail(\'' + cardKey + '\')">' + '<span class="card-dot"></span>' + label + '</div>'
    + '<div style="display:flex;gap:3px;align-items:center;">'
    + (cardKey === 'cash'
        ? '<button onclick="event.stopPropagation();openCardInfo(\'' + cardKey + '\',event)" '
          + 'title="Tietoa Kassa-kortista" style="font-size:11px;padding:2px 7px;border-radius:4px;'
          + 'border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;">ℹ</button>'
        : '')
    + '<button onclick="event.stopPropagation();openCardSettings(\'' + cardKey + '\',\'' + label + '\',' + rowsJSON + ')" '
        + 'title="Asetukset" style="font-size:11px;padding:2px 7px;border-radius:4px;'
        + 'border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;">⋯</button>'
    + '</div></div>';
}

// Kassa-kortin Info-modal: kevyt, keskitetty selitys kortin tarkoituksesta.
// Puhtaasti selittävä — ei lue eikä kirjoita mitään laskentatilaa.
window.openCardInfo = function(cardKey, evt) {
  if (evt) evt.stopPropagation();
  var existing = document.getElementById('card-info-overlay');
  if (existing) { existing.remove(); return; }

  var overlay = document.createElement('div');
  overlay.id = 'card-info-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.6);'
    + 'display:flex;align-items:center;justify-content:center;padding:16px;';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--surface);border:1px solid var(--border-bright);border-radius:12px;'
    + 'padding:18px 20px;max-width:min(380px,92vw);max-height:80vh;overflow-y:auto;'
    + 'box-shadow:0 8px 32px rgba(0,0,0,0.5);';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
  hdr.innerHTML = '<span style="font-size:13px;font-weight:700;color:var(--card-primary,var(--text));">'
    + '<span class="card-dot"></span>Kassa — mitä kortti näyttää</span>'
    + '<button title="Sulje" style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;line-height:1;">✕</button>';
  hdr.querySelector('button').addEventListener('click', function() { overlay.remove(); });
  box.appendChild(hdr);

  var sections = [
    ['Tarkoitus', 'Kassa-kortti näyttää tämänhetkisen kassatilanteesi ja sen, mihin kassasi on kehittymässä tällä hetkellä tiedossa olevien tulojen ja menojen perusteella.'],
    ['Hero-luku', 'Hero-luku näyttää kassasi kaikkien tällä hetkellä tiedossa olevien rahavirtojen jälkeen. Laskenta alkaa nykyisestä kassasta ja huomioi sekä kertaluonteiset että säännölliset rahavirrat aikajärjestyksessä.'],
    ['Nykyinen kassa', 'Nykyinen kassa muodostuu tilien saldosta, josta vähennetään OP Gold -luottokortin käytetty saldo. Tämä toimii lähtöpisteenä kaikille rahavirtalaskelmille.'],
    ['Rahavirrat', 'Rahavirrat-lista näyttää tulevat tulot ja menot aikajärjestyksessä. Jokainen tapahtuma kasvattaa tai pienentää kassaa, jolloin näet, miten kassatilanne muuttuu ajan myötä.'],
    ['"Lopputilanne"', 'Lopputilanne näyttää, mihin kassasi päätyy kaikkien listalla näkyvien rahavirtojen jälkeen. Se vastaa Hero-luvun ennustettua kassatilannetta.'],
    ['Huomio', 'Kassa-kortti perustuu Finance OS:n snapshot-ajatteluun. Se ei seuraa yksittäisiä pankkitapahtumia eikä ole kirjanpito- tai budjetointityökalu. Kortti näyttää nykyisen tilanteen sekä siitä muodostuvan kassanäkymän tällä hetkellä tiedossa olevien rahavirtojen perusteella.']
  ];
  sections.forEach(function(s) {
    var sec = document.createElement('div');
    sec.style.cssText = 'margin-bottom:12px;';
    sec.innerHTML = '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">' + s[0] + '</div>'
      + '<div style="font-size:12px;color:var(--text2);line-height:1.5;">' + s[1] + '</div>';
    box.appendChild(sec);
  });

  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

// ── Kassajakson hallinta -modal (UX-sprintti 22.7.2026) ────────────────
// Puhdas käyttöliittymä jo olemassa olevan sääntömoottorin päälle (ks.
// ensureRahavirtaIds/loadKassajaksoRules/saveKassajaksoRules/
// resolveKassajaksoCondition/resolveKassajaksoRules/buildKassajakso
// jäljempänä tässä tiedostossa) — EI muuta laskentalogiikkaa, EI
// tietomallia, EI uutta sääntömoottoria. Lukee ja kirjoittaa ainoastaan
// olemassa olevaa finos_kassajakso_rules-rakennetta samoilla
// load/saveKassajaksoRules-funktioilla kuin buildKassajakso jo käyttää.
// "Oletus"-strategia UI:ssa vastaa TYHJÄÄ tallennusta (ei localStorage-
// avainta) — resolveKassajaksoRules palauttaa tällöin null ja
// buildKassajakso käyttää tuotepäätöksen #13 mukaista "seuraava tunnettu
// tulo" -oletusta, aivan kuten ennen tätä sprinttiä.
window._kassajaksoHallintaState = null;

function _kjhFmtDate(d) {
  return d ? (d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear()) : null;
}

// Kuvaa MIKSI kassajakso päättyy periodEnd:iin. Delegoi
// computeKassajaksoTransparency:lle (ks. jäljempänä tässä tiedostossa,
// buildKassajakso-osion vieressä), joka käyttää täsmälleen samaa
// resolvointipolkua kuin buildKassajakso — mukaan lukien Osa 1:n OP Gold
// -laajennus — joten näytetty peruste täsmää aina buildKassajakso():n
// todelliseen tulokseen. Puhtaasti selittävä — ei kirjoita mitään.
function describeKassajaksoBasis(latest, snapshotDate) {
  var t = computeKassajaksoTransparency(latest, snapshotDate);
  if (!t.periodEnd) {
    return {
      periodEnd: null,
      basisLabel: t.strategy === 'open' ? 'Avoin kassajakso — ei päättymispistettä' : 'Ei tunnettua tuloa — kassajakso avoin'
    };
  }
  return { periodEnd: t.periodEnd, basisLabel: t.decidingLabels.length ? t.decidingLabels.join(' + ') : '—' };
}

function _kjhConditionLabel(latest, cond) {
  if (cond.type === 'itemRef') {
    var items = Array.isArray(latest[cond.source]) ? latest[cond.source] : [];
    var item = items.find(function(x) { return x.id === cond.id; });
    return item ? normalizeRecurringLabel(item.label, 'Tulo') : '(poistettu rahavirta)';
  }
  if (cond.type === 'monthEnd') return 'Kuukauden viimeinen päivä';
  if (cond.type === 'fixedDate') {
    var d = new Date(cond.date + 'T00:00:00');
    return 'Kiinteä päivämäärä (' + (isNaN(d.getTime()) ? cond.date : _kjhFmtDate(d)) + ')';
  }
  return '—';
}

window.openKassajaksoHallintaModal = async function(evt) {
  if (evt) evt.stopPropagation();
  var existing = document.getElementById('kassajakso-hallinta-overlay');
  if (existing) { existing.remove(); return; }

  var snaps = (await DB.getAll('snapshots')).sort(function(a, b) { return a.date.localeCompare(b.date); });
  var latest = snaps[snaps.length - 1];
  if (!latest) return;

  var storedRules = loadKassajaksoRules();
  var storedHasConditions = !!(storedRules && Array.isArray(storedRules.endConditions) && storedRules.endConditions.length);
  window._kassajaksoHallintaState = {
    strategy: !storedRules ? 'default' : (storedRules.strategy === 'open' ? 'open' : (storedHasConditions ? 'rules' : 'default')),
    endConditions: (storedRules && Array.isArray(storedRules.endConditions)) ? storedRules.endConditions.slice() : [],
    opGold: !!(storedRules && storedRules.opGoldNextMonth1to5)
  };

  var overlay = document.createElement('div');
  overlay.id = 'kassajakso-hallinta-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.6);'
    + 'display:flex;align-items:center;justify-content:center;padding:16px;';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  var box = document.createElement('div');
  box.id = 'kassajakso-hallinta-box';
  box.style.cssText = 'background:var(--surface);border:1px solid var(--border-bright);border-radius:12px;'
    + 'padding:18px 20px;max-width:min(400px,92vw);max-height:80vh;overflow-y:auto;'
    + 'box-shadow:0 8px 32px rgba(0,0,0,0.5);';

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  _renderKassajaksoHallintaBox(latest);
};

// Tallentaa nykyisen UI-tilan olemassa olevaan finos_kassajakso_rules-
// rakenteeseen (ei muuta rakennetta) ja päivittää taustan (Hero/Odote)
// reaaliaikaisesti. Modal on liitetty document.body:iin #db-content:in
// ulkopuolelle, joten renderDashboard() ei sulje sitä.
function _kjhPersist() {
  var st = window._kassajaksoHallintaState;
  if (!st) return;
  if (st.strategy === 'open') {
    saveKassajaksoRules({ version: 1, strategy: 'open', endConditions: [], opGoldNextMonth1to5: !!st.opGold });
  } else if (st.strategy === 'rules') {
    saveKassajaksoRules({ version: 1, strategy: 'rules', endConditions: st.endConditions, opGoldNextMonth1to5: !!st.opGold });
  } else if (st.opGold) {
    // 'default' + OP Gold käytössä: finos_kassajakso_rules säilytetään
    // tyhjällä endConditions-listalla (resolveKassajaksoRules palauttaa
    // tälle silti null:in, joten "seuraava tunnettu tulo" -oletus säilyy
    // muuttumattomana), jotta uusi boolean-lippu saadaan talteen strategy-
    // ja endConditions-rakennetta koskematta.
    saveKassajaksoRules({ version: 1, strategy: 'rules', endConditions: [], opGoldNextMonth1to5: true });
  } else {
    localStorage.removeItem(KASSAJAKSO_RULES_KEY);
  }
  if (typeof renderDashboard === 'function') renderDashboard();
}

function _renderKassajaksoHallintaBox(latest) {
  var box = document.getElementById('kassajakso-hallinta-box');
  if (!box) return;
  var st = window._kassajaksoHallintaState;
  box.innerHTML = '';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:4px;';
  hdr.innerHTML = '<span style="font-size:13px;font-weight:700;color:var(--card-primary,var(--text));">'
    + '<span class="card-dot"></span>Kassajakson hallinta</span>'
    + '<button title="Sulje" style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;line-height:1;">✕</button>';
  hdr.querySelector('button').addEventListener('click', function() {
    var ov = document.getElementById('kassajakso-hallinta-overlay');
    if (ov) ov.remove();
  });
  box.appendChild(hdr);

  var intro = document.createElement('div');
  intro.style.cssText = 'font-size:12px;color:var(--text3);margin-bottom:14px;';
  intro.textContent = 'Määritä milloin kassajakso päättyy.';
  box.appendChild(intro);

  // ── Strategia ──
  var stratWrap = document.createElement('div');
  stratWrap.style.cssText = 'display:flex;flex-direction:column;gap:8px;margin-bottom:14px;';

  function strategyOption(value, label, desc) {
    var lbl = document.createElement('label');
    lbl.style.cssText = 'display:flex;align-items:flex-start;gap:8px;cursor:pointer;';
    var radio = document.createElement('input');
    radio.type = 'radio';
    radio.name = 'kjh_strategy';
    radio.value = value;
    radio.checked = st.strategy === value;
    radio.style.cssText = 'margin-top:2px;accent-color:var(--cyan);cursor:pointer;';
    radio.addEventListener('change', function() {
      st.strategy = value;
      _kjhPersist();
      _renderKassajaksoHallintaBox(latest);
    });
    var textWrap = document.createElement('div');
    var title = document.createElement('div');
    title.style.cssText = 'font-size:12px;color:var(--text);font-weight:600;';
    title.textContent = label;
    var d = document.createElement('div');
    d.style.cssText = 'font-size:11px;color:var(--text3);';
    d.textContent = desc;
    textWrap.appendChild(title);
    textWrap.appendChild(d);
    lbl.appendChild(radio);
    lbl.appendChild(textWrap);
    return lbl;
  }

  stratWrap.appendChild(strategyOption('default', 'Oletus', 'Kassajakso päättyy seuraavaan tunnettuun tuloon.'));
  stratWrap.appendChild(strategyOption('rules', 'Määritä itse', 'Valitse itse päättymisehdot alta.'));
  stratWrap.appendChild(strategyOption('open', 'Avoin kassajakso', 'Kassajakso ei koskaan pääty — kaikki muut ehdot poistuvat käytöstä.'));
  box.appendChild(stratWrap);

  // ── Päättymisehdot (näkyvissä vain kun strategy === 'rules') ──
  if (st.strategy === 'rules') {
    var candWrap = document.createElement('div');
    candWrap.style.cssText = 'border-top:1px solid var(--border);padding-top:12px;margin-bottom:14px;';
    var candHdr = document.createElement('div');
    candHdr.style.cssText = 'font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;';
    candHdr.textContent = 'Päättymisehdot';
    candWrap.appendChild(candHdr);

    // Dynaaminen kandidaattilista tulopohjaisista rahavirroista — EI
    // kovakoodattuja nimiä. rytmi_items (aina meno) ei ole kandidaatti,
    // koska kassajakso päättyy tuloon, ei menoon.
    var candidates = [];
    (Array.isArray(latest.tulot_items) ? latest.tulot_items : []).forEach(function(x) {
      if (x.id != null) candidates.push({ source: 'tulot_items', id: x.id, label: normalizeRecurringLabel(x.label, 'Tulo') });
    });
    (Array.isArray(latest.tulevat_items) ? latest.tulevat_items : []).forEach(function(x) {
      if (x.id != null && Number(x.amount) > 0) candidates.push({ source: 'tulevat_items', id: x.id, label: normalizeRecurringLabel(x.label, 'Tulo') });
    });

    function isSelected(source, id) {
      return st.endConditions.some(function(c) { return c.type === 'itemRef' && c.source === source && c.id === id; });
    }
    function toggleItemRef(source, id) {
      var idx = st.endConditions.findIndex(function(c) { return c.type === 'itemRef' && c.source === source && c.id === id; });
      if (idx >= 0) st.endConditions.splice(idx, 1);
      else st.endConditions.push({ type: 'itemRef', source: source, id: id });
    }

    if (!candidates.length) {
      var noneMsg = document.createElement('div');
      noneMsg.style.cssText = 'font-size:12px;color:var(--text3);font-style:italic;margin-bottom:6px;';
      noneMsg.textContent = 'Ei tulopohjaisia rahavirtoja kirjattuna.';
      candWrap.appendChild(noneMsg);
    }

    candidates.forEach(function(c) {
      var lbl = document.createElement('label');
      lbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text2);';
      var cb = document.createElement('input');
      cb.type = 'checkbox';
      cb.checked = isSelected(c.source, c.id);
      cb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);cursor:pointer;';
      cb.addEventListener('change', function() {
        toggleItemRef(c.source, c.id);
        _kjhPersist();
        _renderKassajaksoHallintaBox(latest);
      });
      lbl.appendChild(cb);
      lbl.appendChild(document.createTextNode(c.label));
      candWrap.appendChild(lbl);
    });

    // Kuukauden viimeinen päivä
    var monthEndSelected = st.endConditions.some(function(c) { return c.type === 'monthEnd'; });
    var meLbl = document.createElement('label');
    meLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text2);';
    var meCb = document.createElement('input');
    meCb.type = 'checkbox';
    meCb.checked = monthEndSelected;
    meCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);cursor:pointer;';
    meCb.addEventListener('change', function() {
      var idx = st.endConditions.findIndex(function(c) { return c.type === 'monthEnd'; });
      if (idx >= 0) st.endConditions.splice(idx, 1);
      else st.endConditions.push({ type: 'monthEnd' });
      _kjhPersist();
      _renderKassajaksoHallintaBox(latest);
    });
    meLbl.appendChild(meCb);
    meLbl.appendChild(document.createTextNode('Kuukauden viimeinen päivä'));
    candWrap.appendChild(meLbl);

    // Kiinteä päivämäärä
    var fixedCond = st.endConditions.find(function(c) { return c.type === 'fixedDate'; });
    var fdLbl = document.createElement('label');
    fdLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:3px 0;cursor:pointer;font-size:12px;color:var(--text2);';
    var fdCb = document.createElement('input');
    fdCb.type = 'checkbox';
    fdCb.checked = !!fixedCond;
    fdCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);cursor:pointer;';
    fdCb.addEventListener('change', function() {
      var idx = st.endConditions.findIndex(function(c) { return c.type === 'fixedDate'; });
      if (idx >= 0) {
        st.endConditions.splice(idx, 1);
      } else {
        st.endConditions.push({ type: 'fixedDate', date: new Date().toISOString().slice(0, 10) });
      }
      _kjhPersist();
      _renderKassajaksoHallintaBox(latest);
    });
    fdLbl.appendChild(fdCb);
    fdLbl.appendChild(document.createTextNode('Kiinteä päivämäärä'));
    candWrap.appendChild(fdLbl);

    if (fixedCond) {
      var dateInp = document.createElement('input');
      dateInp.type = 'date';
      dateInp.value = fixedCond.date;
      dateInp.style.cssText = 'margin:4px 0 4px 22px;padding:3px 6px;font-size:12px;background:var(--surface);'
        + 'border:1px solid var(--border);border-radius:4px;color:var(--text);';
      dateInp.addEventListener('change', function() {
        fixedCond.date = dateInp.value;
        _kjhPersist();
        _renderKassajaksoHallintaBox(latest);
      });
      candWrap.appendChild(dateInp);
    }

    box.appendChild(candWrap);
  }

  // ── OP Gold -laajennus (Osa 1, aina näkyvissä riippumatta strategiasta —
  // sovelletaan buildKassajakso():ssa minkä tahansa strategian tuottaman
  // periodEnd:in päälle, ks. applyOpGoldExtension) ──
  var opGoldWrap = document.createElement('div');
  opGoldWrap.style.cssText = 'border-top:1px solid var(--border);padding-top:12px;margin-bottom:14px;';
  var opGoldHdr = document.createElement('div');
  opGoldHdr.style.cssText = 'font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;';
  opGoldHdr.textContent = 'OP Gold';
  opGoldWrap.appendChild(opGoldHdr);

  var ogLbl = document.createElement('label');
  ogLbl.style.cssText = 'display:flex;align-items:flex-start;gap:8px;cursor:pointer;';
  var ogCb = document.createElement('input');
  ogCb.type = 'checkbox';
  ogCb.checked = !!st.opGold;
  ogCb.style.cssText = 'width:14px;height:14px;margin-top:2px;accent-color:var(--cyan);cursor:pointer;';
  ogCb.addEventListener('change', function() {
    st.opGold = ogCb.checked;
    _kjhPersist();
    _renderKassajaksoHallintaBox(latest);
  });
  var ogTextWrap = document.createElement('div');
  var ogTitle = document.createElement('div');
  ogTitle.style.cssText = 'font-size:12px;color:var(--text2);';
  ogTitle.textContent = 'Huomioi seuraavan kuukauden 1.–5. päivän tulot';
  var ogDesc = document.createElement('div');
  ogDesc.style.cssText = 'font-size:11px;color:var(--text3);';
  ogDesc.textContent = 'Jos kassajakso päättyisi ennen seuraavan kuukauden 5. päivää, mukaan otetaan myös kaikki seuraavan kuukauden 1.–5. päivän tulot.';
  ogTextWrap.appendChild(ogTitle);
  ogTextWrap.appendChild(ogDesc);
  ogLbl.appendChild(ogCb);
  ogLbl.appendChild(ogTextWrap);
  opGoldWrap.appendChild(ogLbl);
  box.appendChild(opGoldWrap);

  // ── Aktiivinen päättymispiste ──
  var snapshotDate = new Date((latest.date || '') + 'T00:00:00');
  var basis = describeKassajaksoBasis(latest, snapshotDate);
  var activeWrap = document.createElement('div');
  activeWrap.style.cssText = 'border-top:1px solid var(--border);padding-top:12px;margin-top:2px;';
  var activeHdr = document.createElement('div');
  activeHdr.style.cssText = 'font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:4px;';
  activeHdr.textContent = 'Nykyinen kassajakso päättyy';
  var activeDate = document.createElement('div');
  activeDate.style.cssText = 'font-size:16px;font-weight:700;color:var(--card-primary,var(--text));margin-bottom:4px;';
  activeDate.textContent = basis.periodEnd ? _kjhFmtDate(basis.periodEnd) : 'Ei päättymispistettä';
  var activeBasis = document.createElement('div');
  activeBasis.style.cssText = 'font-size:12px;color:var(--text2);';
  activeBasis.textContent = 'Peruste: ' + basis.basisLabel;
  activeWrap.appendChild(activeHdr);
  activeWrap.appendChild(activeDate);
  activeWrap.appendChild(activeBasis);
  box.appendChild(activeWrap);
}

// Odotteen selitysnäkymä: Kassajaksoon (ks. buildKassajakso) rajattu erittely
// lähtökassasta ja jokaisesta mukaan lasketusta rahavirrasta ODOTE-summaan asti,
// sekä erikseen seuraavan kassajakson rahavirrat jotka EIVÄT vaikuta Odotteeseen.
// Puhtaasti selittävä — ei lue eikä kirjoita mitään laskentatilaa.
window.openOdoteModal = async function(evt) {
  if (evt) evt.stopPropagation();
  var existing = document.getElementById('odote-modal-overlay');
  if (existing) { existing.remove(); return; }

  var snaps = (await DB.getAll('snapshots')).sort(function(a, b) { return a.date.localeCompare(b.date); });
  var latest = snaps[snaps.length - 1];
  if (!latest) return;

  if (ensureRahavirtaIds(latest)) {
    latest._updatedAt = new Date().toISOString();
    DB.putSnapshot(latest);
  }

  var kassajakso = buildKassajakso(latest);
  var hero = heroSum(kassajakso);
  var incomeItems = kassajakso.items.filter(function(x) { return x.isIncome; });
  var nextIncome = incomeItems.length
    ? incomeItems.reduce(function(a, b) { return a.date <= b.date ? a : b; })
    : null;

  function fmtItemDate(d) {
    return d.getDate() + '.' + (d.getMonth() + 1) + '.' + d.getFullYear();
  }
  function itemLabel(x) {
    return normalizeRecurringLabel(x.ref.label, x.isIncome ? 'Tulo' : 'Meno');
  }

  var overlay = document.createElement('div');
  overlay.id = 'odote-modal-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:500;background:rgba(0,0,0,0.6);'
    + 'display:flex;align-items:center;justify-content:center;padding:16px;';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) overlay.remove(); });

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--surface);border:1px solid var(--border-bright);border-radius:12px;'
    + 'padding:18px 20px;max-width:min(380px,92vw);max-height:80vh;overflow-y:auto;'
    + 'box-shadow:0 8px 32px rgba(0,0,0,0.5);';

  var hdr = document.createElement('div');
  hdr.style.cssText = 'display:flex;justify-content:space-between;align-items:center;margin-bottom:12px;';
  hdr.innerHTML = '<span style="font-size:13px;font-weight:700;color:var(--card-primary,var(--text));">'
    + '<span class="card-dot"></span>Odotteen laskelma</span>'
    + '<button title="Sulje" style="background:none;border:none;color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;line-height:1;">✕</button>';
  hdr.querySelector('button').addEventListener('click', function() { overlay.remove(); });
  box.appendChild(hdr);

  var sortedItems = kassajakso.items.slice().sort(function(a, b) { return a.date - b.date; });
  var calcHtml = '<div style="font-size:12px;font-family:var(--mono);line-height:1.8;margin-bottom:14px;">'
    + '<div style="display:flex;justify-content:space-between;"><span style="color:var(--text2);">Lähtökassa</span><span>' + fmt(kassajakso.lahtokassa) + '</span></div>';
  sortedItems.forEach(function(x) {
    var sign = x.isIncome ? '+' : '−';
    var color = x.isIncome ? 'var(--green)' : 'var(--expense)';
    calcHtml += '<div style="display:flex;justify-content:space-between;">'
      + '<span style="color:var(--text2);">' + sign + ' ' + itemLabel(x) + '</span>'
      + '<span style="color:' + color + ';">' + fmt(Math.abs(x.amount)) + '</span>'
      + '</div>';
  });
  // Kassajakson päättymisraja: kaikki tähän mennessä listatut rivit kuuluvat
  // kassajaksoon (mikään items-rivi ei ylitä periodEnd:iä, ks. buildKassajakso),
  // joten hillitty erotin heti viimeisen rivin jälkeen tekee rajan näkyväksi
  // ilman selitystekstiä. Näytetään vain jos jaksolla on tunnettu loppu.
  if (kassajakso.periodEnd) {
    calcHtml += '<div style="display:flex;align-items:center;gap:8px;margin:6px 0;">'
      + '<div style="flex:1;border-top:1px dashed var(--border);"></div>'
      + '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">Kassajakso päättyy</span>'
      + '<div style="flex:1;border-top:1px dashed var(--border);"></div>'
      + '</div>';
  }
  calcHtml += '<div style="border-top:1px solid var(--border);margin-top:6px;padding-top:6px;display:flex;justify-content:space-between;font-weight:700;">'
    + '<span>ODOTE</span><span style="color:' + (hero >= 0 ? 'var(--green)' : 'var(--red)') + ';">' + fmt(hero) + '</span></div>'
    + '</div>';
  box.insertAdjacentHTML('beforeend', calcHtml);

  var periodEndLabel = kassajakso.periodEnd ? fmtItemDate(kassajakso.periodEnd) : 'ei tiedossa';
  box.insertAdjacentHTML('beforeend',
    '<div style="margin-bottom:12px;">'
    + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">Kassajakso</div>'
    + '<div style="font-size:12px;color:var(--text2);">' + fmtItemDate(kassajakso.snapshotDate) + ' → ' + periodEndLabel + '</div>'
    + '</div>');

  // Kassajakson läpinäkyvyys (Osa 2, suunnittelupäätös 22.7.2026): kertoo
  // MIKSI kassajakso päättyy juuri periodEnd:iin — sama resolvointipolku
  // kuin buildKassajakso (ks. computeKassajaksoTransparency), joten esitys
  // täsmää aina todelliseen laskentaan. Puhtaasti selittävä, ei uusia
  // värejä/komponentteja — samat tyylit kuin viereiset osiot.
  var transparency = computeKassajaksoTransparency(latest, kassajakso.snapshotDate);
  box.insertAdjacentHTML('beforeend',
    '<div style="margin-bottom:12px;">'
    + '<div style="font-size:12px;color:var(--text2);font-style:italic;">' + transparency.explanation + '</div>'
    + '</div>');

  if (transparency.activeRules.length) {
    var rulesHtml = '<div style="margin-bottom:12px;">'
      + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">Päättymissäännöt</div>';
    transparency.activeRules.forEach(function(r) {
      rulesHtml += '<div style="font-size:12px;color:var(--text2);">✓ ' + r.label + '</div>';
    });
    rulesHtml += '</div>';
    box.insertAdjacentHTML('beforeend', rulesHtml);

    if (transparency.decidingLabels.length) {
      var multiple = transparency.decidingLabels.length > 1;
      var decideHtml = '<div style="margin-bottom:12px;">'
        + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">'
        + (multiple ? 'Ratkaisevat ehdot' : 'Ratkaiseva ehto') + '</div>';
      transparency.decidingLabels.forEach(function(l) {
        decideHtml += '<div style="font-size:12px;color:var(--text2);">' + l + '</div>';
      });
      if (multiple) {
        decideHtml += '<div style="font-size:12px;color:var(--text2);">Päättymispäivä määräytyi viimeiseksi toteutuvan ehdon mukaan.</div>';
      } else if (kassajakso.periodEnd) {
        decideHtml += '<div style="font-size:12px;color:var(--text2);">' + fmtItemDate(kassajakso.periodEnd) + '</div>';
      }
      if (transparency.opGoldExtended) {
        decideHtml += '<div style="font-size:12px;color:var(--text2);margin-top:4px;">Kassajaksoa jatkettiin OP Gold -säännön perusteella seuraavan kuukauden 1.–5. päivän tuloihin asti.</div>';
      }
      decideHtml += '</div>';
      box.insertAdjacentHTML('beforeend', decideHtml);
    }
  }

  box.insertAdjacentHTML('beforeend',
    '<div style="margin-bottom:12px;">'
    + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">Seuraava tunnettu tulo</div>'
    + '<div style="font-size:12px;color:var(--text2);">' + (nextIncome ? (fmtItemDate(nextIncome.date) + ' ' + itemLabel(nextIncome)) : 'Ei tiedossa') + '</div>'
    + '</div>');

  if (kassajakso.excludedItems.length) {
    var sortedExcluded = kassajakso.excludedItems.slice().sort(function(a, b) { return a.date - b.date; });
    var exHtml = '<div>'
      + '<div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;margin-bottom:3px;">Ei mukana tässä Odotteessa</div>';
    sortedExcluded.forEach(function(x) {
      // Sama väripari kuin muualla Kassa-kortissa (ks. renderTulossaList
      // amtColor) — meno punaisena (var(--expense)), tulo vihreänä
      // (var(--green)), rivin teksti ja summa samalla värillä.
      var color = x.amount < 0 ? 'var(--expense)' : 'var(--green)';
      exHtml += '<div style="font-size:12px;display:flex;justify-content:space-between;">'
        + '<span style="color:' + color + ';">' + fmtItemDate(x.date) + ' ' + itemLabel(x) + '</span>'
        + '<span style="color:' + color + ';">' + fmt(Math.abs(x.amount)) + '</span>'
        + '</div>';
    });
    exHtml += '</div>';
    box.insertAdjacentHTML('beforeend', exHtml);
  }

  overlay.appendChild(box);
  document.body.appendChild(overlay);
};

async function renderDashboard() {
  const c = document.getElementById('db-content');
  const cnt = await DB.count('snapshots');

  if (cnt === 0) {
    c.innerHTML = `
      <div class="empty">
        <div class="empty-icon">&#x1F4CA;</div>
        <div class="empty-title">Ei dataa vielä</div>
        <p style="margin-bottom:20px">Tuo Numbers-historia aloittaaksesi</p>
        <button class="btn-p" onclick="showView('import')">Tuo data →</button>
      </div>`;
    return;
  }

  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  let dbHoldings = []; try { dbHoldings = (await DB.getAll('holdings')).filter(h => h.active !== false); } catch(e) {}
  const latest = snaps[snaps.length - 1];
  const prev   = snaps.length > 1 ? snaps[snaps.length - 2] : null;

  // Kassajakson sääntömoottorin id-migraatio (ks. ensureRahavirtaIds) —
  // täydentää puuttuvat pysyvät id:t rahavirroille, ei muuta olemassa
  // olevia arvoja. Tallennetaan taustalla, ei odoteta renderin edestä.
  if (latest && ensureRahavirtaIds(latest)) {
    latest._updatedAt = new Date().toISOString();
    DB.putSnapshot(latest).then(function() {
      try { setTimeout(function() { if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch(e) {}
    });
  }

  // ── CALCULATION ENGINE ──
  const calc     = calculateNetWorth(latest);
  const calcPrev = prev ? calculateNetWorth(prev) : null;
  const sig = (typeof computeAllSignals === 'function')
    ? computeAllSignals(snaps, latest, calc)
    : null;

  /* mobiilihaarautuma poistettu: yksi renderointipolku, responsiivisuus CSS:lla */

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
      if (best && bestDiff <= 3) paceVals.push((best.tulotili||0) + (best.op_gold||0));
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
    <div class="db-date" style="display:flex;justify-content:space-between;align-items:center;gap:8px;">
      <span>${fmtDateWd(latest.date)}</span>
      <span id="db-admin-wrap" style="display:flex;gap:5px;align-items:center;"><button id="db-privacy-btn" onclick="(function(){var h=document.body.classList.toggle('hide-amounts');localStorage.setItem('privacy_mode',h?'1':'0');var b=document.getElementById('db-privacy-btn');if(b){b.style.opacity=h?'1':'0.45';b.style.border=h?'1px solid rgba(255,255,255,0.35)':'1px solid rgba(255,255,255,0.1)';b.style.color=h?'rgba(255,255,255,0.9)':'var(--text2)';}})()" style="background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);border-radius:20px;cursor:pointer;font-size:11px;color:var(--text2);padding:3px 9px;line-height:1.4;opacity:0.45;white-space:nowrap;" title="Piilota summat">&#x1F441; Summat</button>
        <span class="db-admin-item">${backupStatusBadge()}</span>
        <span class="db-sync-dot" style="color:${fmtSyncLabel().color};font-size:14px;">${fmtSyncLabel().text}</span>
        <span class="db-admin-item"><button onclick="rollbackLatestSnapshot()" style="font-size:10px;padding:3px 8px;
          background:rgba(255,100,100,0.06);border:1px solid rgba(255,100,100,0.15);
          border-radius:5px;color:#a07070;cursor:pointer;font-family:var(--mono);"
          title="Palauta edellinen snapshot">↩ rollback</button></span>
        <button id="db-menu-btn" onclick="(function(){var p=document.getElementById('db-admin-panel');if(p)p.style.display=p.style.display==='none'?'':'none';})()" style="display:none;font-size:13px;background:none;border:none;color:var(--text2);cursor:pointer;padding:2px 6px;" title="Valikko">☰</button>
      </span>
    </div>
    <div id="db-admin-panel" style="display:none;position:absolute;top:52px;right:16px;background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 16px;z-index:200;min-width:180px;font-size:12px;font-family:var(--mono);">
      <div style="margin-bottom:8px;">${backupStatusBadge()}</div>
      <div style="margin-bottom:8px;">${syncStatusBadge()}</div>
      <button onclick="rollbackLatestSnapshot();document.getElementById('db-admin-panel').style.display='none';" style="display:block;width:100%;text-align:left;font-size:11px;padding:6px 8px;background:rgba(255,100,100,0.06);border:1px solid rgba(255,100,100,0.15);border-radius:5px;color:#a07070;cursor:pointer;font-family:var(--mono);margin-bottom:6px;" title="Palauta edellinen snapshot">↩ rollback</button>
    </div>
    <div id="freeze-status" style="display:none;margin:8px 0 12px;padding:8px 12px;
      border-radius:7px;font-family:'IBM Plex Mono',monospace;font-size:11px;
      background:rgba(90,158,106,.08);border:1px solid rgba(90,158,106,.25);color:#5a9e6a;">
    </div>

    <div id="layout-toolbar" style="display:none;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;"></div>


      <!-- 1. SIJOITUKSET -->
      <div class="db-item card" data-item-id="inv">
        ${_cardHeader('Sijoitukset', 'inv', [
          {key:'nordnet',label:'Nordnet'},
          {key:'op_osakkeet',label:'OP Osakkeet'},
          {key:'tapiola',    label:'S-Pankki'},
        ])}
<div class="card-left">        <div class="card-value" style="margin-top:0;">${fmt(inv)}</div></div>
        ${(() => {
          const invDelta    = calcPrev ? calc.investments - calcPrev.investments : null;
          const invDeltaPct = (calcPrev && calcPrev.investments)
            ? ((invDelta / calcPrev.investments) * 100).toFixed(1)
            : null;
          const invBars = [
            { label: 'Nordnet',  val: calc.brokers.nordnet.investments , key: 'nordnet', accts: ['nordnet']},
            { label: 'OP',       val: calc.brokers.op.investments , key: 'op', accts: ['op_osakkeet']},
            { label: 'S-Pankki', val: calc.brokers.spankki.investments , key: 's_pankki', accts: ['s_sijoitus']}
          ].filter(b => b.val > 0)
           .map(b => ({ ...b, pct: Math.round((b.val / calc.investments) * 100) }));

          const sign = invDelta !== null ? (invDelta >= 0 ? '+' : '') : '';
          const deltaStr = invDelta !== null
            ? sign + fmt(invDelta) + ' · ' + sign + invDeltaPct + '% vs edellinen'
            : '';
          const deltaClass = invDelta !== null ? (invDelta >= 0 ? 'pos' : 'neg') : '';

          const barsHtml = invBars.map(b => {
            const _isOpen = _invExpandedBroker === b.key;
            const _arrow = _isOpen ? '▼' : '▶';
            const _hdgs = _isOpen ? dbHoldings.filter(h => (b.accts||[]).includes(h.account)) : [];
            const _holdHtml = (() => {
              if (b.key === 'nordnet') {
                const _aot = _hdgs.filter(h => !(h.display_name && h.display_name.includes('osakesäästö')));
                const _ost = _hdgs.filter(h => h.display_name && h.display_name.includes('osakesäästö'));
                const _mkRows = arr => arr.map(h => {
                  const pct = h.day_change_pct;
                  const pctHtml = pct == null ? '' : `<span class="inv-holding-pct ${pct > 0 ? 'pos' : pct < 0 ? 'neg' : 'neu'}">${pct > 0 ? '+' : ''}${pct.toFixed(2)} %</span>`;
                  return `<div class="inv-holding-name">${getHoldingShortName(h)}${pctHtml}</div>`;
                }).join('');
                return (_aot.length ? `<div class="inv-subhdr">AOT</div>${_mkRows(_aot)}` : '')
                     + (_ost.length ? `<div class="inv-subhdr">OST</div>${_mkRows(_ost)}` : '');
              }
              return _hdgs.map(h => {
                const pct = h.day_change_pct;
                const pctHtml = pct == null ? '' : `<span class="inv-holding-pct ${pct > 0 ? 'pos' : pct < 0 ? 'neg' : 'neu'}">${pct > 0 ? '+' : ''}${pct.toFixed(2)} %</span>`;
                return `<div class="inv-holding-name">${getHoldingShortName(h)}${pctHtml}</div>`;
              }).join('');
            })();
            return `
            <div class="inv-bar">
              <div class="inv-bar-hdr" onclick="toggleInvBroker('${b.key}')" style="cursor:pointer">
                <span class="inv-bar-name">${_arrow} ${b.label}</span>
                <span class="inv-bar-pct">${b.pct}%</span>
              </div>
              <div class="loan-bar-track">
                <div class="loan-bar-fill" style="width:${b.pct}%"></div>
              </div>
              ${_isOpen ? `<div class="inv-holdings-list">${_holdHtml}</div>` : ''}
            </div>`;
          }).join('');

          return (deltaStr ? `<div class="card-delta ${deltaClass}">${deltaStr}</div>` : '')
               + '<div class="inv-bars">' + barsHtml + '</div>';
        })()}
      </div>

      <!-- 2. SITOUMUKSET -->
      ${(()=>{
        // Laske % muutos vs ed. kk
        const snap1mo = snapBefore(snaps, daysAgoISO(30));
        if (snap1mo) {
          const prev1mCalc = calculateNetWorth(snap1mo);
          window._opGoldPrevPct = snap1mo.op_gold && creditDebt
            ? ((creditDebt - prev1mCalc.shortTermDebt) / Math.abs(prev1mCalc.shortTermDebt) * 100)
            : null;
          window._lainatPrevPct = prev1mCalc.longTermDebt
            ? ((ltDebt - prev1mCalc.longTermDebt) / Math.abs(prev1mCalc.longTermDebt) * 100)
            : null;
        } else {
          window._opGoldPrevPct = null;
          window._lainatPrevPct = null;
        }
        return renderSitoumusCard(sig, latest, creditDebt, ltDebt, snaps);
      })()}

      <!-- 3. KÄYTTÖTILIT + OPERATIIVINEN RYTMI -->
      <div class="db-item card kpi-compact" data-item-id="cash">
        ${_cardHeader('Kassa', 'cash', [
          {key:'tulotili',   label:'Tulotili'},
          {key:'spankki',    label:'S-Pankki'},
          {key:'tavoitetili',label:'Tavoitetili'},
          {key:'elatustili', label:'Elatustili'},
          {key:'op_gold',    label:'OP Gold'},
        ])}
<div class="card-left">        ${(()=>{
          if (latest.op_gold===undefined) return '<div class="card-value">'+fmt(cash)+'</div>';
          var heroVal = kassaValisumma(latest);
          var lahtokassa = lahtokassaOf(latest);
          var lahtokassaColor = lahtokassa >= 0 ? 'var(--green)' : 'var(--red)';
          return '<div style="display:flex;gap:16px;padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,0.06);">'
            + '<div style="flex:1;min-width:0;cursor:pointer;" onclick="event.stopPropagation();openOdoteModal()" title="Näytä Odotteen laskelma">'
            + '<div style="font-size:11px;color:var(--card-primary);margin-bottom:2px;">ODOTE</div>'
            + '<div class="card-value">' + fmt(heroVal) + '</div>'
            + '</div>'
            + '<div style="flex:1;min-width:0;">'
            + '<div style="font-size:11px;color:var(--card-primary);margin-bottom:2px;">NYKYINEN</div>'
            + '<div class="card-value" style="color:' + lahtokassaColor + ';">' + fmt(lahtokassa) + '</div>'
            + '</div>'
            + '</div>';
        })()}</div>
        ${!_pref('cash','expanded',true) ? '<div style="font-size:11px;color:var(--card-primary-dark);margin-top:2px;">Tilit '+fmt(cash)+'</div>' : ''}
        <!-- TODO: .sub-rows on mahdollinen tulevaisuuden siivous – html2-blokki on nyt ensisijainen sisältö -->
        <div class="card-right">
                <div class="sub-rows" style="display:${_pref('cash','expanded',true)?'flex':'none'}">
          ${(latest.s_pankki !== undefined && _pref('cash','row_spankki',true)) ? '<div class="sub-row"><span>S-Pankki</span><span>' + fmt(latest.s_pankki) + '</span></div>' : ''}
          ${(latest.tavoitetili !== undefined && _pref('cash','row_tavoitetili',true)) ? '<div class="sub-row"><span>Tavoitetili</span><span>' + fmt(latest.tavoitetili) + '</span></div>' : ''}
          ${(latest.elatustili !== undefined && _pref('cash','row_elatustili',true)) ? '<div class="sub-row"><span>Elatustili</span><span>' + fmt(latest.elatustili) + '</span></div>' : ''}
        </div>
        ${(()=>{
          if (latest.op_gold === undefined) return '';
          var opGold2    = Math.abs(latest.op_gold ?? 0);
          var tulotili2  = latest.tulotili ?? 0;
          var yhteensa2  = lahtokassaOf(latest);

          var html2 = '<div style="margin-top:5px;">'
            // Tulotili-rivi — sama .sub-row-komponentti kuin S-Pankki/Tavoitetili/Elatustili
            +(_pref('cash','row_tulotili',true)
              ? '<div class="sub-row" style="margin-bottom:5px;">'
              + '<span>Tulotili</span>'
        + '<span data-raw="'+tulotili2+'" id="kassa-tulotili-val" style="font-family:var(--mono);cursor:pointer;" onclick="kassaInlineEdit(\'tulotili\',this)">'+fmt(tulotili2)+'</span>'
        + '<input id="kassa-tulotili-inp" type="number" inputmode="decimal" style="display:none;width:90px;font-family:var(--mono);font-size:16px;color:var(--text2);background:var(--surface);border:1px solid var(--accent);border-radius:4px;padding:2px 4px;text-align:right;" />'
              + '</div>'
              : '')
            // OP Gold -rivi — sama .sub-row-komponentti
            +(_pref('cash','row_op_gold',true)
              ? '<div class="sub-row" style="margin-bottom:5px;">'
              + '<span>OP Gold</span>'
        + '<span data-raw="'+opGold2+'" id="kassa-op_gold-val" style="font-family:var(--mono);cursor:pointer;" onclick="kassaInlineEdit(\'op_gold\',this)">'+fmt(-opGold2)+'</span>'
        + '<input id="kassa-op_gold-inp" type="number" inputmode="decimal" style="display:none;width:90px;font-family:var(--mono);font-size:16px;color:var(--card-primary);background:var(--surface);border:1px solid var(--accent);border-radius:4px;padding:2px 4px;text-align:right;" />'
              + '</div>'
              : '')
            // YHT.-rivi — tilien yhteenveto, sama arvo kuin "NYKYINEN"; vain summa lihavoitu, ei väriä
            // Erotusviiva OP Gold-rivin ja yhteenvedon välissä, sama tyyli kuin katkoviiva ennen "SEURAAVA RAHATILANNE"
            + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.07);margin-bottom:8px;">'
            + '<span style="font-size:12px;color:var(--text);">YHT.</span>'
            + '<span style="font-family:var(--mono);font-size:13px;font-weight:600;color:var(--text);">' + fmt(yhteensa2) + '</span>'
            + '</div>'
          // "Seuraava rahatilanne": NYT → tulevat erät → välisumma → säännölliset erät → lopputilanne
          html2 += renderKassaSeuraavaRahatilanne(latest);

          // Yhteinen "+ Lisää rahavirta" -editori (Tulossa / Säännöllinen tulo / Säännöllinen meno)
          html2 += renderRahavirtaEditor(latest);

          return html2;
                })()}
        </div>
      </div>
      </div>
      <!-- 4. NETTOVARALLISUUS — viimeisenä, koko leveys -->
      <div class="db-item card kpi-wide" data-item-id="netto" style="background:var(--surface2);">
        <div class="card-label" style="grid-column:1/-1;">Nettovarallisuus</div>
        <div class="card-value tip" style="grid-column:1/-1;font-size:38px;"
          data-tip="Omaisuus (${fmt(calc.assets)}) − Luottokortit (${fmt(-calc.shortTermDebt)}) − Lainat (${fmt(-calc.longTermDebt)})"
        >${fmt(nw)}</div>
        ${delta !== null ? '<div class="card-delta ' + dcls(delta) + '">' + fmtDelta(delta) + ' vs. ' + fmtDate(prev.date) + '</div>' : ''}
        <div style="margin-top:14px;padding-top:12px;border-top:1px solid var(--border);display:flex;gap:20px;flex-wrap:wrap;">
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Omaisuus</div><div style="font-family:var(--mono);font-size:13px;color:var(--green);">+${fmt(calc.assets)}</div></div>
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Luottokortit</div><div style="font-family:var(--mono);font-size:13px;color:var(--gold);">${fmt(-calc.shortTermDebt)}</div></div>
          <div><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">Lainat</div><div style="font-family:var(--mono);font-size:13px;color:var(--red);">${fmt(-calc.longTermDebt)}</div></div>
          <div style="margin-left:auto;"><div style="font-size:9px;text-transform:uppercase;letter-spacing:.08em;color:var(--text3);margin-bottom:3px;">= Netto</div><div style="font-family:var(--mono);font-size:13px;font-weight:600;color:${calc.netWorth>=0?'var(--green)':'var(--red)'};">${fmt(calc.netWorth)}</div></div>
        </div>
        <div class="comp-wrap">
          <div class="comp-legend">
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--blue)"></div>Sijoitukset ${fmt(inv)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--green)"></div>Käteinen ${fmt(cash)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--gold)"></div>Luottokortit ${fmt(-creditDebt)}</div>
            <div class="comp-leg-item"><div class="comp-dot" style="background:var(--red)"></div>Lainat ${fmt(-ltDebt)}</div>
          </div>
          <div class="comp-track"><div class="comp-seg" style="width:${invPct}%;background:var(--blue);opacity:.75;"></div><div class="comp-seg" style="width:${cashPct}%;background:var(--green);opacity:.75;"></div></div>
          <div class="comp-track" style="margin-top:3px;"><div class="comp-seg" style="width:${creditPct}%;background:var(--gold);opacity:.65;"></div><div class="comp-seg" style="width:${ltPct}%;background:var(--red);opacity:.65;"></div></div>
          <div class="comp-labels"><span>Omaisuus ${fmt(totalAssets)}</span><span>Velat yht. ${fmt(-(creditDebt+ltDebt))}</span></div>
        </div>
        ${periodChips.length > 0 ? '<div class="period-row" style="margin-top:14px;" id="period-chips-row">'
          + periodChips.map((p,i) => '<div class="period-chip" onclick="selectPeriod(' + i + ')" id="pchip-' + i + '" style="cursor:pointer;transition:all .12s;"><span class="period-label">' + p.label.toUpperCase() + '</span><span class="period-val ' + dcls(p.d) + '">' + fmtDelta(p.d) + '</span>' + (p.pct ? '<span style="font-size:9px;color:var(--text3);">' + p.pct + '</span>' : '') + '</div>').join('')
          + '</div><div id="period-breakdown" style="margin-top:12px;padding:12px 14px;border-radius:9px;background:rgba(0,200,255,0.03);border:1px solid var(--border);"><div style="font-size:9px;letter-spacing:.12em;text-transform:uppercase;color:var(--text3);margin-bottom:10px;" id="breakdown-title">Napauta ajanjaksoa nähdäksesi erittely</div><div id="breakdown-rows"></div></div>' : ''}
      </div>



      <div class="db-item" data-item-id="heartbeat">${renderVertailuCard(snaps, latest)}</div>

    <div class="db-item db-section" data-item-id="historia">
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

    </div>
    <div class="db-item db-section" data-item-id="muuttui">
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

    </div>
    <div class="db-item db-section" data-item-id="tapahtumat">
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
    </div>
  `;

  drawStackedChart(snaps);
  const sbMeta = document.getElementById('sb-meta');
  if (sbMeta) sbMeta.innerHTML = snaps.length + ' snapshotia<br>' + (latest.date ? fmtDate(latest.date) : '');
  setTimeout(() => { if (window.onDashboardRendered) window.onDashboardRendered(); }, 120);
  if (window.applyDashboardLayout) window.applyDashboardLayout();
  if (typeof renderTulossaList === 'function') renderTulossaList();
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
    c.innerHTML = `<div class="empty"><div class="empty-icon">&#x1F4C8;</div>
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
          border-radius:7px;color:var(--text3);cursor:pointer;font-family:var(--mono);">&#x1F4CB; Backupit</button>
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
  { id: 'dividend',      label: 'Osinko',          icon: '&#x1F4B0;', color: 'var(--green)'  },
  { id: 'purchase',      label: 'Osto',             icon: '&#x1F4C8;', color: 'var(--cyan)'   },
  { id: 'sale',          label: 'Myynti',           icon: '&#x1F4C9;', color: 'var(--amber)'  },
  { id: 'transfer_in',   label: 'Siirto sisään',    icon: '⬇',  color: 'var(--cyan)'   },
  { id: 'transfer_out',  label: 'Siirto ulos',      icon: '⬆',  color: 'var(--text3)'  },
  { id: 'fee',           label: 'Kulu/välityspalkkio', icon: '&#x1F4B8;', color: 'var(--red)' },
  { id: 'other',         label: 'Muu',              icon: '&#x1F4DD;', color: 'var(--text2)'  },
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
        <div>
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
let _invExpandedBroker = null;

async function renderSalkku() {
  const c = document.getElementById('salkku-content');
  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false)
  // Nordnet-käteinen: luetaan viimeisimmästä snapshotista
  const _snaps      = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date))
  const _latest     = _snaps[_snaps.length - 1]
  const nordnetCashVal = (_latest?.nordnet_cash) || 0;
  holdings.sort((a, b) => (a.account > b.account ? 1 : -1));

  // Compute totals per account
  const byAccount = {};
  for (const h of holdings) {
    (byAccount[h.account] = byAccount[h.account] || []).push(h);
  }
  const grandTotal = holdings.reduce((s, h) => s + (h.quantity || 0) * (h.last_price || 0), 0) + nordnetCashVal;

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
      <div style="display:flex;align-items:center;gap:8px;margin-top:6px;">
        <input type="checkbox" id="f-manual-price" style="width:14px;height:14px;cursor:pointer;">
        <label for="f-manual-price" style="font-size:12px;color:var(--text2);cursor:pointer;">Manuaalinen kurssi (ei päivitetä automaattisesti)</label>
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
          <span class="acct-total">${a.id === 's_sijoitus' ? '' : fmt(a.id==='nordnet' ? total + nordnetCashVal : total)}</span>
        </div>
        ${a.id === 'nordnet' ? `
        <div class="nordnet-cash-row">
          <span class="nordnet-cash-lbl">käteinen</span>
          <span class="nordnet-cash-val">${nordnetCashVal > 0 ? fmt(nordnetCashVal) : ''}</span>
          <input id="nordnet-cash-input" class="nordnet-cash-input" type="number"
            placeholder="0" value="${nordnetCashVal > 0 ? nordnetCashVal : ''}"
            oninput="updateNordnetCashDisplay(this.value)">
        </div>` : ''}
        ${a.id === 's_sijoitus' ? `
        <div class="nordnet-cash-row" style="gap:6px;align-items:center;flex-wrap:wrap;">
          <span class="nordnet-cash-lbl">kokonaisarvo (€)</span>
          <input id="s-sijoitus-input" class="nordnet-cash-input" type="number"
            placeholder="0" value="${_latest?.s_sijoitus > 0 ? _latest.s_sijoitus : ''}"
            onkeydown="if(event.key==='Enter'){event.preventDefault();saveSSijoitusValueBtn();}">
          <button id="s-sijoitus-save-btn" class="btn-s" onclick="saveSSijoitusValueBtn()" style="font-size:11px;padding:4px 10px;min-width:76px;">Tallenna</button>
        </div>` : ''}
        ${a.id === 's_sijoitus' ? `
        <div class="s-sijoitus-toggle" onclick="toggleSSijoitusDetails(this)" style="cursor:pointer;color:var(--text2);font-size:12px;padding:6px 0 4px;">▶ Rahaston tiedot</div>
        <div class="s-sijoitus-details" style="display:none;">
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
          </div>
        </div>` : `
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
          </div>
        `}
      `
    }).join('')}
  `;
}

function updateNordnetCashDisplay(val) {
  const disp = document.querySelector('.nordnet-cash-val')
  if (disp) disp.textContent = val && parseFloat(val) > 0 ? fmt(parseFloat(val)) : ''
}

function toggleSSijoitusDetails(btn) {
  const details = btn.nextElementSibling;
  const open = details.style.display !== 'none';
  details.style.display = open ? 'none' : 'block';
  btn.textContent = (open ? '▶' : '▼') + ' Rahaston tiedot';
}

async function saveSSijoitusValue(val) {
  const v = parseFloat(val);
  if (!Number.isFinite(v) || v < 0) return;
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const latest = snaps[snaps.length - 1];
  if (!latest) return;
  const snap = { ...latest, s_sijoitus: v, _updatedAt: new Date().toISOString() };
  await DB.putSnapshot(snap);
  // Sync SPANKKI-ESG holding: last_price = snapshotValue / quantity
  const hs = await DB.getAll('holdings');
  const sh = hs.find(h => h.account === 's_sijoitus' && h.active !== false);
  if (sh && sh.quantity > 0) {
    await DB.putHolding({ ...sh, last_price: v / sh.quantity, last_price_src: 'Manuaalinen' });
  }
  await updateNavCount();
  try { setTimeout(() => syncToSupabase(snap), 300); } catch(e) {}
  requestAnimationFrame(() => {
    renderSalkku();
    renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
  });
}
function saveSSijoitusValueBtn() {
  const input = document.getElementById('s-sijoitus-input');
  if (!input) return;
  const val = input.value;
  // Show feedback immediately (before render replaces DOM)
  const btn0 = document.getElementById('s-sijoitus-save-btn');
  if (btn0) { btn0.textContent = '✓ Tallennettu'; btn0.disabled = true; }
  saveSSijoitusValue(val);
  // Re-query after renderSalkku replaces DOM (rAF + small margin)
  setTimeout(() => {
    const btn1 = document.getElementById('s-sijoitus-save-btn');
    if (btn1) { btn1.textContent = '✓ Tallennettu'; btn1.disabled = true; }
    setTimeout(() => {
      const btn2 = document.getElementById('s-sijoitus-save-btn');
      if (btn2) { btn2.textContent = 'Tallenna'; btn2.disabled = false; }
    }, 1500);
  }, 50);
}

// Kassa inline edit — Tulotili
async function saveTulotiliValue(val) {
  const v = parseFloat(val);
  if (!Number.isFinite(v)) return;
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const latest = snaps[snaps.length - 1];
  if (!latest) return;
  const snap = { ...latest, tulotili: v, _updatedAt: new Date().toISOString() };
  await DB.putSnapshot(snap);
  try { setTimeout(() => syncToSupabase(snap), 300); } catch(e) {}
  requestAnimationFrame(() => {
    renderSalkku();
    renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
  });
}

// Kassa inline edit — OP Gold (always saved as negative)
async function saveOpGoldValue(val) {
  const v = parseFloat(val);
  if (!Number.isFinite(v)) return;
  const saved = -Math.abs(v); // always negative
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => a.date.localeCompare(b.date));
  const latest = snaps[snaps.length - 1];
  if (!latest) return;
  const snap = { ...latest, op_gold: saved, _updatedAt: new Date().toISOString() };
  await DB.putSnapshot(snap);
  try { setTimeout(() => syncToSupabase(snap), 300); } catch(e) {}
  requestAnimationFrame(() => {
    renderSalkku();
    renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
  });
}

// Yhteinen nimen normalisointi Kuukausirytmin/Säännöllisten tulojen/menojen riveille.
// Tyhjä, puuttuva tai pelkkiä pisteitä/välilyöntejä sisältävä nimi korvataan fallbackilla —
// riviä EI jätetä pois renderöinnistä, vain nimi normalisoidaan.
function normalizeRecurringLabel(label, fallback) {
  var s = (label != null) ? String(label).trim() : '';
  return (/^[.\s]*$/.test(s)) ? fallback : s;
}

// Yhteinen päivän validointi Kuukausirytmin/Säännöllisten rivien päiväetuliitteelle.
// Palauttaa kelvollisen päivän (1–31) kokonaislukuna, tai null jos päivä puuttuu tai on virheellinen.
// Kutsuja päättää itse, ettei nulliin liitetä pistettä — pelkkää "." ei saa koskaan syntyä.
function validRecurringDay(paiva) {
  var n = Number(paiva);
  return (paiva !== undefined && paiva !== null && paiva !== '' && Number.isInteger(n) && n >= 1 && n <= 31) ? n : null;
}

// ── Rahavirta / Kassajakso / Hero ──────────────────────────────────────
// LUKITTU tuotemäärittely:
//   Rahavirta  – yksittäinen kirjattu tulo/meno.
//   Kassajakso – rajaa rahavirtajoukon viimeisimmästä snapshotista
//                seuraavaan tunnettuun tuloon; laskee lähtökassan ja
//                muodostaa Herolle annettavan joukon.
//   Hero       – puhdas laskentakomponentti: summaa vain sille annetun
//                joukon (lähtökassa + tulot − menot). Ei päättele, ei
//                valitse, ei tunne rahavirran alkuperää.

// Lähtökassa = viimeisimmän snapshotin lähtökassaan kuuluvien tilien summa.
function lahtokassaOf(snap) {
  return (snap.tulotili || 0) - Math.abs(snap.op_gold || 0);
}

// Seuraava päivämäärä (> snapshotDate), jolloin kuukauden "paiva" osuu kohdalle.
// Jos paiva ei mahdu kuukauteen (esim. 31. helmikuussa), käytetään kuukauden
// viimeistä päivää.
function nextRecurringDayDate(snapshotDate, paiva) {
  var day = validRecurringDay(paiva);
  if (day === null) return null;
  var probe = new Date(snapshotDate.getFullYear(), snapshotDate.getMonth(), 1);
  for (var i = 0; i < 24; i++) {
    var lastOfMonth = new Date(probe.getFullYear(), probe.getMonth() + 1, 0).getDate();
    var candidate = new Date(probe.getFullYear(), probe.getMonth(), Math.min(day, lastOfMonth));
    if (candidate > snapshotDate) return candidate;
    probe.setMonth(probe.getMonth() + 1);
  }
  return null;
}

// Seuraava päivämäärä kuukausinumerolle (1–12; vuotta ei tallenneta dataan).
// Kuluva kuukausi tulkitaan vielä tulevaksi, koska tarkkaa päivää ei tunneta.
function nextMonthOnlyDate(snapshotDate, month) {
  var m = parseInt(month, 10);
  if (!(m >= 1 && m <= 12)) return null;
  var year = snapshotDate.getFullYear();
  if (m < snapshotDate.getMonth() + 1) year += 1;
  return new Date(year, m - 1, 1);
}

// Rahavirta-kerros: kokoaa kaikki kirjatut rahavirrat yhtenäiseen muotoon.
// Kaikki kolme listaa (tulot_items, rytmi_items, tulevat_items) ovat jo
// luonteeltaan kassavaikutteisia — mikään niistä ei edusta tilien välistä
// siirtoa tai sijoitusta, joten erillistä suodatusta ei tarvita.
//
// Rahavirta ilman kelvollista päivää (tulot_items/rytmi_items) tai kuukautta
// (tulevat_items) ei saa keksittyä ajankohtaa, joten sille ei voida laskea
// date-kenttää. Tällaiset rivit (legacy-dataa ennen rahavirtaEditorSaven
// pakollisuusvalidointia) jätetään pois; käyttäjä täydentää puuttuvan tiedon
// Kassa-kortin legacy-ilmoituksesta, ks. findLegacyRahavirrat.
function collectRahavirrat(latest, snapshotDate) {
  var out = [];
  (Array.isArray(latest.tulot_items) ? latest.tulot_items : []).forEach(function(x) {
    var d = nextRecurringDayDate(snapshotDate, x.paiva);
    if (!d) return;
    out.push({ ref: x, source: 'tulot_items', date: d, isIncome: true, amount: Number(x.amt_kk) || 0 });
  });
  (Array.isArray(latest.rytmi_items) ? latest.rytmi_items : []).forEach(function(x) {
    var d = nextRecurringDayDate(snapshotDate, x.paiva);
    if (!d) return;
    var amt = Number(x.amt_kk != null ? x.amt_kk : x.amount) || 0;
    out.push({ ref: x, source: 'rytmi_items', date: d, isIncome: false, amount: -Math.abs(amt) });
  });
  (Array.isArray(latest.tulevat_items) ? latest.tulevat_items : []).forEach(function(x) {
    var d = nextMonthOnlyDate(snapshotDate, x.month);
    if (!d) return;
    var amt = Number(x.amount) || 0;
    out.push({ ref: x, source: 'tulevat_items', date: d, isIncome: amt > 0, amount: amt });
  });
  return out;
}

// Legacy-rahavirrat: rivit joilta puuttuu kelvollinen paiva/month, tallennettu
// ennen rahavirtaEditorSaven pakollisuusvalidointia. Sama tunnistuskriteeri
// kuin collectRahavirrat:ssa (validRecurringDay / kuukausiväli 1-12) — ei
// erillistä lippua tai versiomerkintää. Käytetään vain Kassa-kortin
// legacy-ilmoitukseen; ei vaikuta Kassajakson tai Heron laskentaan.
function findLegacyRahavirrat(latest) {
  var out = [];
  (Array.isArray(latest.tulot_items) ? latest.tulot_items : []).forEach(function(x, idx) {
    if (validRecurringDay(x.paiva) === null) out.push({ source: 'tulot_items', key: (x.id != null ? x.id : ('idx:' + idx)), ref: x });
  });
  (Array.isArray(latest.rytmi_items) ? latest.rytmi_items : []).forEach(function(x, idx) {
    if (validRecurringDay(x.paiva) === null) out.push({ source: 'rytmi_items', key: (x.id != null ? x.id : ('idx:' + idx)), ref: x });
  });
  (Array.isArray(latest.tulevat_items) ? latest.tulevat_items : []).forEach(function(x, idx) {
    var m = parseInt(x.month, 10);
    if (!(m >= 1 && m <= 12)) out.push({ source: 'tulevat_items', key: (x.id != null ? x.id : ('idx:' + idx)), ref: x });
  });
  return out;
}

// ── Kassajakson sääntömoottori: id-migraatio (suunnittelupäätös 22.7.2026) ──
// Osa 2 -sääntömoottori viittaa rahavirtoihin pysyvällä id:llä, ei
// label-tekstillä. Uudet rivit saavat id:n jo rahavirtaEditorSave:ssa,
// mutta vanhemmilla/synkronoiduilla riveillä sitä ei aina ole (ks.
// idx:-fallback findRahavirtaItem:ssa). Tämä funktio täydentää puuttuvat
// id:t paikallaan — puhtaasti lisäävä, ei koske mihinkään olemassa
// olevaan kenttään (summa, päivä, label, jne.). Palauttaa true jos
// jotain muutettiin, jolloin kutsuja tallentaa snapshotin.
function ensureRahavirtaIds(latest) {
  var changed = false;
  var prefixes = { tulot_items: 'tulo', rytmi_items: 'meno', tulevat_items: 'tulossa' };
  Object.keys(prefixes).forEach(function(source) {
    var items = Array.isArray(latest[source]) ? latest[source] : [];
    items.forEach(function(item, idx) {
      if (item.id == null) {
        item.id = prefixes[source] + '_legacy_' + Date.now() + '_' + idx;
        changed = true;
      }
    });
  });
  return changed;
}

// ── Kassajakson sääntömoottori: säännöt ja resolvointi (Osa 2, suunnittelu-
// päätös 22.7.2026 — ei vielä UI:ta, UI rakennetaan erillisessä UX-sprintissä) ──
// Sallii kassajakson päättymisen määrittämisen sääntöjoukkona label-tekstin
// sijaan pysyviin rahavirta-id:ihin viitaten. Tallennuspaikka: localStorage
// (laitekohtainen asetus, ei snapshot-dataa — ei siis Supabase-synkkaa tässä
// vaiheessa). Kun sääntöjä ei ole konfiguroitu (null), käyttäytyminen
// säilyy TÄYSIN ennallaan: buildKassajakso käyttää "seuraava tunnettu tulo"
// -oletusta (tuotepäätös #13). Tarkoituksella dormant tila — mikään ei
// muutu kenenkään nykyisen käyttäjän laskennassa ennen kuin UI rakennetaan
// ja käyttäjä itse tekee valinnan.
//
// Tietomalli:
//   { version: 1,
//     strategy: 'open' | 'rules',
//     endConditions: [
//       { type: 'itemRef', source: 'tulot_items'|'rytmi_items'|'tulevat_items', id: <rahavirran pysyvä id> },
//       { type: 'fixedDate', date: 'YYYY-MM-DD' },
//       { type: 'monthEnd' }
//     ] }
//
// strategy: 'open'  → kassajakso ei koskaan pääty (periodEnd = null);
//                      endConditions-taulukkoa ei lueta lainkaan.
// strategy: 'rules' → periodEnd = myöhäisin kaikista resolvoituvista
//                      endConditions-ehdoista. Jos yksikään ehto ei
//                      resolvoidu (tyhjä taulukko tai kaikki viitatut
//                      rivit poistettu), pudotaan takaisin "seuraava
//                      tunnettu tulo" -oletukseen — sama turvaverkko
//                      kuin tuotepäätös #12.
var KASSAJAKSO_RULES_KEY = 'finos_kassajakso_rules';

function loadKassajaksoRules() {
  try { return JSON.parse(localStorage.getItem(KASSAJAKSO_RULES_KEY) || 'null'); }
  catch (e) { return null; }
}

function saveKassajaksoRules(rules) {
  localStorage.setItem(KASSAJAKSO_RULES_KEY, JSON.stringify(rules));
}

// Resolvoi yhden endCondition-ehdon konkreettiseksi Dateksi annetulle
// snapshotille, tai null jos ehto ei resolvoidu (esim. viitattu rivi on
// poistettu). Käyttää samoja päivämääräfunktioita kuin collectRahavirrat,
// jotta tulkinta pysyy yhtenäisenä koko sovelluksessa.
function resolveKassajaksoCondition(latest, snapshotDate, cond) {
  if (!cond) return null;
  if (cond.type === 'itemRef') {
    var items = Array.isArray(latest[cond.source]) ? latest[cond.source] : [];
    var item = items.find(function(x) { return x.id === cond.id; });
    if (!item) return null;
    return cond.source === 'tulevat_items'
      ? nextMonthOnlyDate(snapshotDate, item.month)
      : nextRecurringDayDate(snapshotDate, item.paiva);
  }
  if (cond.type === 'fixedDate') {
    var d = new Date(cond.date + 'T00:00:00');
    return isNaN(d.getTime()) ? null : d;
  }
  if (cond.type === 'monthEnd') {
    return new Date(snapshotDate.getFullYear(), snapshotDate.getMonth() + 1, 0);
  }
  return null;
}

// Palauttaa { periodEnd } annetulle snapshotille tallennettujen sääntöjen
// mukaan, tai null jos sääntöjä ei ole konfiguroitu lainkaan tai ne eivät
// resolvoidu mihinkään — jolloin buildKassajakso käyttää oletuslogiikkaa.
// KOSKEMATTA (auditoitu 22.7.2026, Osa 1/Osa 2 -sprintti): tätä funktiota
// ei muutettu — OP Gold -laajennus on oma erillinen kerroksensa
// (ks. applyOpGoldExtension), ei osa tätä resolvointia.
function resolveKassajaksoRules(latest, snapshotDate) {
  var rules = loadKassajaksoRules();
  if (!rules) return null;
  if (rules.strategy === 'open') return { periodEnd: null };
  if (rules.strategy !== 'rules') return null;
  var conditions = Array.isArray(rules.endConditions) ? rules.endConditions : [];
  var resolved = conditions
    .map(function(c) { return resolveKassajaksoCondition(latest, snapshotDate, c); })
    .filter(function(d) { return d instanceof Date && !isNaN(d.getTime()); });
  if (!resolved.length) return null;
  return { periodEnd: new Date(Math.max.apply(null, resolved.map(function(d) { return d.getTime(); }))) };
}

// Peruslaskenta ILMAN OP Gold -laajennusta: sääntöjen mukainen periodEnd,
// tai puuttuessa "seuraava tunnettu tulo" -oletus (tuotepäätös #13). Sama
// logiikka kuin buildKassajakso käytti ennen Osa 1 -sprinttiä (22.7.2026) —
// eriytetty omaksi funktioksi, jotta computeKassajaksoTransparency (Odote-
// modalin läpinäkyvyysnäkymä) voi käyttää täsmälleen samaa peruspäätepistettä
// ennen OP Gold -laajennuksen soveltamista.
function resolveBaseKassajaksoPeriodEnd(latest, snapshotDate, allItems) {
  var ruleResult = resolveKassajaksoRules(latest, snapshotDate);
  if (ruleResult) return ruleResult.periodEnd;
  var incomeDates = allItems.filter(function(x) { return x.isIncome; }).map(function(x) { return x.date.getTime(); });
  return incomeDates.length ? new Date(Math.min.apply(null, incomeDates)) : null;
}

// OP Gold -laajennus (Osa 1, suunnittelupäätös 22.7.2026): valinnainen,
// finos_kassajakso_rules.opGoldNextMonth1to5-boolean (LUKITTU rakenne,
// lisätty taaksepäin yhteensopivasti — vanha tallennettu rules-objekti
// ilman kenttää tulkitaan false:ksi). Jos käytössä ja annettu periodEnd
// olisi ENNEN seuraavan kuukauden 5. päivää, jatketaan kassajaksoa
// viimeiseen seuraavan kuukauden 1.–5. päivän tuloon asti. Jos lisätuloja
// ei löydy tältä väliltä, periodEnd palautuu muuttumattomana (nykyinen
// toiminta säilyy). Ei koske rahavirtojen rakennetta eikä Heroa — pelkkä
// lisäaskel periodEnd-arvon päälle, samalla collectRahavirrat()-joukolla.
function applyOpGoldExtension(rules, allItems, snapshotDate, periodEnd) {
  if (!periodEnd || !rules || !rules.opGoldNextMonth1to5) {
    return { periodEnd: periodEnd, extended: false };
  }
  var nextMonthDay5 = new Date(snapshotDate.getFullYear(), snapshotDate.getMonth() + 1, 5);
  if (periodEnd.getTime() >= nextMonthDay5.getTime()) {
    return { periodEnd: periodEnd, extended: false };
  }
  var nextMonthStart = new Date(snapshotDate.getFullYear(), snapshotDate.getMonth() + 1, 1);
  var matchedDates = allItems
    .filter(function(x) { return x.isIncome && x.date.getTime() >= nextMonthStart.getTime() && x.date.getTime() <= nextMonthDay5.getTime(); })
    .map(function(x) { return x.date.getTime(); });
  if (!matchedDates.length) return { periodEnd: periodEnd, extended: false };
  var maxMatched = Math.max.apply(null, matchedDates);
  if (maxMatched <= periodEnd.getTime()) return { periodEnd: periodEnd, extended: false };
  return { periodEnd: new Date(maxMatched), extended: true };
}

// Kassajakso: LUKITTU tuotepäätös #13 (22.7.2026, kumoaa osittain #12) —
// rahavirtajoukko rajataan viimeisimmästä snapshotista seuraavaan tunnettuun
// tuloon asti (kyseinen tulo mukaan lukien), MIKÄLI käyttäjä ei ole
// konfiguroinut omia sääntöjä (ks. resolveKassajaksoRules yllä — sääntöjen
// puuttuessa käyttäytyminen on identtinen tuotepäätökseen #13). Tämän
// PÄÄLLE sovelletaan valinnainen OP Gold -laajennus (Osa 1, ks.
// applyOpGoldExtension) — ainoa muutos kassajakson perusalgoritmiin tässä
// sprintissä. Seuraavan kassajakson tapahtumat (kaikki mitkä osuvat
// (mahdollisesti OP Gold -laajennetun) periodEnd:in jälkeiseen aikaan)
// eivät vaikuta Odotteeseen — ne palautetaan erikseen excludedItems-
// kentässä. Jos periodEnd jää null:ksi (ei tunnettua tuloa, tai
// strategy:'open'), jakso pysyy avoimena eikä rajaudu mihinkään
// (tuotepäätös #12:n regressiokorjaus säilyy: puuttuva tulotieto ei
// tyhjennä koko rahavirtajoukkoa).
// LUKITTU tuotepäätös #14 (22.7.2026): Hero/Lopputilanne ja Odote käyttävät
// tätä rajattua joukkoa, mutta RAHAVIRRAT-lista EI enää — se näyttää aina
// collectRahavirrat():in koko joukon rajaamattomana (ks. renderTulossaList).
function buildKassajakso(latest) {
  var snapshotDate = new Date(latest.date + 'T00:00:00');
  var allItems = collectRahavirrat(latest, snapshotDate);
  var basePeriodEnd = resolveBaseKassajaksoPeriodEnd(latest, snapshotDate, allItems);
  var rules = loadKassajaksoRules();
  var opGoldResult = applyOpGoldExtension(rules, allItems, snapshotDate, basePeriodEnd);
  var periodEnd = opGoldResult.periodEnd;
  var items = periodEnd ? allItems.filter(function(x) { return x.date <= periodEnd; }) : allItems;
  var excludedItems = periodEnd ? allItems.filter(function(x) { return x.date > periodEnd; }) : [];
  return { lahtokassa: lahtokassaOf(latest), items: items, excludedItems: excludedItems, periodEnd: periodEnd, snapshotDate: snapshotDate, opGoldExtended: opGoldResult.extended };
}

// Kassajakson läpinäkyvyys (Osa 2, suunnittelupäätös 22.7.2026): laskee
// TÄSMÄLLEEN saman periodEnd:in kuin buildKassajakso (mukaan lukien Osa 1:n
// OP Gold -laajennus, samoilla resolveBaseKassajaksoPeriodEnd/
// applyOpGoldExtension-funktioilla), ja kertoo lisäksi MITKÄ ehdot ovat
// aktiivisia ja MIKÄ niistä lopulta ratkaisi päättymispisteen. Puhtaasti
// selittävä — ei kirjoita mitään. Käytetään sekä Kassajakson hallinta
// -modalin "Peruste"-rivillä (ks. describeKassajaksoBasis) että Odote-
// modalin PÄÄTTYMISSÄÄNNÖT/RATKAISEVA EHTO -osioissa.
function computeKassajaksoTransparency(latest, snapshotDate) {
  var allItems = collectRahavirrat(latest, snapshotDate);
  var rules = loadKassajaksoRules();
  var hasConditions = !!(rules && Array.isArray(rules.endConditions) && rules.endConditions.length);
  var strategy = !rules ? 'default' : (rules.strategy === 'open' ? 'open' : (hasConditions ? 'rules' : 'default'));
  var opGoldActive = !!(rules && rules.opGoldNextMonth1to5);

  var explanation = strategy === 'open'
    ? 'Kassajakso on avoin eikä sille ole päättymispistettä.'
    : strategy === 'rules'
      ? 'Kassajakso päättyy, kun kaikki valitut ehdot ovat täyttyneet.'
      : 'Kassajakso päättyy seuraavaan tunnettuun tuloon.';

  var basePeriodEnd = resolveBaseKassajaksoPeriodEnd(latest, snapshotDate, allItems);
  var activeRules = []; // { label, date }

  if (strategy === 'rules' && basePeriodEnd) {
    rules.endConditions.forEach(function(c) {
      activeRules.push({ label: _kjhConditionLabel(latest, c), date: resolveKassajaksoCondition(latest, snapshotDate, c) });
    });
    var anyMatches = activeRules.some(function(r) { return r.date instanceof Date && !isNaN(r.date.getTime()) && r.date.getTime() === basePeriodEnd.getTime(); });
    if (!anyMatches) {
      // Turvaverkko kytkeytyi (ks. resolveKassajaksoRules) — mikään valittu
      // ehto ei tosiasiassa resolvoitunut, ja perusta on "seuraava tunnettu
      // tulo". Näytetään käyttäjälle todellinen peruste sen sijaan.
      var fallbackIncome = allItems.filter(function(x) { return x.isIncome && x.date.getTime() === basePeriodEnd.getTime(); });
      fallbackIncome.forEach(function(x) { activeRules.push({ label: normalizeRecurringLabel(x.ref.label, 'Tulo'), date: x.date }); });
    }
  } else if (basePeriodEnd) {
    var matchingIncome = allItems.filter(function(x) { return x.isIncome && x.date.getTime() === basePeriodEnd.getTime(); });
    matchingIncome.forEach(function(x) { activeRules.push({ label: normalizeRecurringLabel(x.ref.label, 'Tulo'), date: x.date }); });
  }

  var opGoldResult = applyOpGoldExtension(rules, allItems, snapshotDate, basePeriodEnd);
  var periodEnd = opGoldResult.periodEnd;

  if (opGoldActive) {
    activeRules.push({ label: 'OP Gold (1.–5. päivän tulot)', date: opGoldResult.extended ? periodEnd : null });
  }

  var decidingLabels = periodEnd
    ? activeRules.filter(function(r) { return r.date instanceof Date && !isNaN(r.date.getTime()) && r.date.getTime() === periodEnd.getTime(); }).map(function(r) { return r.label; })
    : [];

  return {
    strategy: strategy,
    explanation: explanation,
    periodEnd: periodEnd,
    activeRules: activeRules,
    decidingLabels: decidingLabels,
    opGoldActive: opGoldActive,
    opGoldExtended: opGoldResult.extended
  };
}

// Hero: puhdas laskentakomponentti. Summaa vain sille annetun joukon.
function heroSum(kassajakso) {
  return kassajakso.items.reduce(function(s, x) { return s + x.amount; }, kassajakso.lahtokassa);
}

// Hero näyttää Kassajakson lopputilanteen: sama laskenta kuin heroSum(),
// eli lähtökassa + kaikki Kassajaksoon kuuluvat rahavirrat (kertaluonteiset
// ja säännölliset).
function kassaValisumma(latest) {
  return heroSum(buildKassajakso(latest));
}

// Seuraava kassajakso -yhteenveto (23.7.2026, suunnittelupäätös 22.7.2026):
// EI ennuste — näyttää vain LOPPUTILANTEEN jälkeisen, jo tiedossa olevan
// rahavirtajoukon samalla säännöllä kuin buildKassajakso laskee nykyisen
// jakson päättymisen. Hakee seuraavan jakson päättymispisteen kutsumalla
// täsmälleen samaa resolveBaseKassajaksoPeriodEnd/applyOpGoldExtension-
// paria kuin buildKassajakso, periodEnd:istä uutena lähtöpisteenä.
// Referenssipäiväksi käytetään periodEnd + 1 vrk (ei periodEnd itse),
// koska "monthEnd"-sääntö laskisi muuten saman kuukauden uudelleen jos
// periodEnd sattuu jo olemaan kuukauden viimeinen päivä — sama "seuraavan
// on oltava aidosti myöhempi" -periaate kuin nextRecurringDayDate/
// nextMonthOnlyDate jo noudattavat.
// BUGIKORJAUS (23.7.2026): candidateItems haetaan UUDELLA collectRahavirrat-
// kutsulla (nextRefDate:iin ankkuroituna), EI kassajakso.excludedItems-
// joukosta. collectRahavirrat/nextRecurringDayDate palauttaa jokaiselle
// säännölliselle rahavirralle vain YHDEN, snapshotDate:sta seuraavan
// ajankohdan — ei toistuvaa sarjaa. Kun rahavirta ITSE määrittää nykyisen
// periodEnd:in (tyypillisesti ainoa/aikaisin säännöllinen tulo), sen ainoa
// laskettu ajankohta osuu periodEnd:iin ja päätyy kassajakso.items-
// joukkoon, ei excludedItems-joukkoon — jolloin se puuttui kokonaan
// seuraavan jakson kandidaateista eikä sen seuraava (esim. ensi kuukauden)
// toistuma näkynyt "Säännölliset"-rivillä lainkaan (näkyi +0 €:na vaikka
// säännöllisiä tuloja oli). Kutsumalla collectRahavirrat uudelleen
// nextRefDate:lla saadaan jokaiselle rahavirralle sen todellinen seuraava
// ajankohta TÄSTÄ referenssipisteestä — sama funktio, ei uutta laskenta-
// logiikkaa, vain oikea ankkuripiste. kassajakso.excludedItems säilyy
// koskemattomana (Odote-modali käyttää sitä yhä, ks. openOdoteModal).
// "Harvemmin toistuvat" (repeat_every_months > 1) -erillisosiota EI
// toteutettu tässä sprintissä (käyttäjän suunnittelupäätös 22.7.2026, ks.
// CURRENT_STATUS.md) — nykyinen tietomalli ei tallenna näille ankkuria,
// joten "maksukuukautta" ei voida päätellä. Ne sisältyvät "Säännölliset"-
// riveihin täsmälleen samalla tavalla kuin muuallakin sovelluksessa
// (collectRahavirrat ei erottele niitä — repeat_every_months ei vaikuta
// mihinkään päivämäärälaskentaan tälläkään hetkellä).
function buildSeuraavaKassajakso(latest, kassajakso, hero) {
  var periodEnd = kassajakso.periodEnd;
  if (!periodEnd) return null;

  var nextRefDate = new Date(periodEnd.getTime() + 86400000);
  var candidateItems = collectRahavirrat(latest, nextRefDate);
  var rules = loadKassajaksoRules();
  var basePeriodEnd = resolveBaseKassajaksoPeriodEnd(latest, nextRefDate, candidateItems);
  var opGoldResult = applyOpGoldExtension(rules, candidateItems, nextRefDate, basePeriodEnd);
  var nextPeriodEnd = opGoldResult.periodEnd;

  var nextItems = nextPeriodEnd
    ? candidateItems.filter(function(x) { return x.date <= nextPeriodEnd; })
    : candidateItems.slice();

  var tulotSaannolliset = nextItems.filter(function(x) { return x.source === 'tulot_items'; });
  var tulotIlmoitetut = nextItems.filter(function(x) { return x.source === 'tulevat_items' && x.isIncome; });
  var menotSaannolliset = nextItems.filter(function(x) { return x.source === 'rytmi_items'; });
  var menotIlmoitetut = nextItems.filter(function(x) { return x.source === 'tulevat_items' && !x.isIncome; });

  function sum(arr) { return arr.reduce(function(s, x) { return s + x.amount; }, 0); }

  var tulotSaannollisetSum = sum(tulotSaannolliset);
  var tulotIlmoitetutSum = sum(tulotIlmoitetut);
  var menotSaannollisetSum = sum(menotSaannolliset);
  var menotIlmoitetutSum = sum(menotIlmoitetut);
  var tulotSum = tulotSaannollisetSum + tulotIlmoitetutSum;
  var menotSum = menotSaannollisetSum + menotIlmoitetutSum;

  return {
    periodEnd: nextPeriodEnd,
    tulot: { saannolliset: tulotSaannollisetSum, ilmoitetut: tulotIlmoitetutSum, ilmoitetutCount: tulotIlmoitetut.length, sum: tulotSum },
    menot: { saannolliset: menotSaannollisetSum, ilmoitetut: menotIlmoitetutSum, ilmoitetutCount: menotIlmoitetut.length, sum: menotSum },
    arvioitu: hero + tulotSum + menotSum
  };
}

// Puhdas renderöintikerros buildSeuraavaKassajakso():n tulokselle. Sama
// typografia/värit kuin Kassa-kortin muissa riveissä: .panel-row/
// .panel-row-lbl/.panel-row-val(.pos/.neg) ja .kassa-section-hdr — ei uusia
// CSS-luokkia, ei uusia värejä.
function renderSeuraavaKassajakso(summary) {
  if (!summary) return '';

  var html = '<div class="kassa-section-hdr" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">SEURAAVA KASSAJAKSO</div>';

  html += '<div class="kassa-section-hdr" style="margin-top:8px;">TULOT</div>';
  html += '<div class="panel-row"><span class="panel-row-lbl">Säännölliset</span><span class="panel-row-val pos">' + fmtDelta(summary.tulot.saannolliset) + '</span></div>';
  if (summary.tulot.ilmoitetutCount > 0) {
    html += '<div class="panel-row"><span class="panel-row-lbl">Ilmoitetut</span><span class="panel-row-val pos">' + fmtDelta(summary.tulot.ilmoitetut) + '</span></div>';
  }
  html += '<div class="panel-row" style="border-top:1px dashed var(--border);padding-top:4px;"><span class="panel-row-lbl" style="font-weight:700;">Yhteensä</span><span class="panel-row-val pos" style="font-weight:700;">' + fmtDelta(summary.tulot.sum) + '</span></div>';

  html += '<div class="kassa-section-hdr" style="margin-top:10px;">NÄKYVISSÄ OLEVAT MENOT</div>';
  html += '<div class="panel-row"><span class="panel-row-lbl">Säännölliset</span><span class="panel-row-val neg">' + fmtDelta(summary.menot.saannolliset) + '</span></div>';
  if (summary.menot.ilmoitetutCount > 0) {
    html += '<div class="panel-row"><span class="panel-row-lbl">Ilmoitetut</span><span class="panel-row-val neg">' + fmtDelta(summary.menot.ilmoitetut) + '</span></div>';
  }
  html += '<div class="panel-row" style="border-top:1px dashed var(--border);padding-top:4px;"><span class="panel-row-lbl" style="font-weight:700;">Yhteensä</span><span class="panel-row-val neg" style="font-weight:700;">' + fmtDelta(summary.menot.sum) + '</span></div>';

  var arvioituColor = summary.arvioitu >= 0 ? 'var(--green)' : 'var(--red)';
  html += '<div class="panel-row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">'
    + '<span class="panel-row-lbl" style="font-weight:700;">Arvioitu lähtökassa<br>seuraavaan kassajaksoon</span>'
    + '<span class="panel-row-val" style="color:' + arvioituColor + ';">' + fmt(summary.arvioitu) + '</span>'
    + '</div>';

  return html;
}

// Kassa: "Seuraava rahatilanne" -kortti.
// NYKYINEN KASSA → RAHAVIRRAT (yksi lista, kertaluonteiset + säännölliset,
// aikajärjestyksessä; ks. renderTulossaList) → Lopputilanne (Hero).
// RAHAVIRRAT-lista näyttää AINA kaiken (rajaamaton, ks. renderTulossaList);
// Lopputilanne (Hero) käyttää buildKassajakso():n rajattua joukkoa. Nämä
// kaksi eivät enää jaa samaa rajausta (LUKITTU tuotepäätös #14, 22.7.2026).
function renderKassaSeuraavaRahatilanne(latest) {
  var kassajakso = buildKassajakso(latest);

  (function debugHeroInput() {
    var snapshotDateDbg = new Date((latest.date || '') + 'T00:00:00');
    var kaikkiRahavirratDbg = collectRahavirrat(latest, snapshotDateDbg);
    var rows = kaikkiRahavirratDbg.map(function(x) {
      return {
        nimi: x.ref.label,
        tyyppi: x.isIncome ? 'tulo' : 'meno',
        summa: x.amount,
        ajankohta: x.date,
        kassavaikutteinen: true
      };
    });
    console.log('[HERO DEBUG] Lähtökassa:', kassajakso.lahtokassa);
    console.table(rows);
    var tulotSumDbg = kassajakso.items.filter(function(x) { return x.isIncome; }).reduce(function(s, x) { return s + x.amount; }, 0);
    var menotSumDbg = kassajakso.items.filter(function(x) { return !x.isIncome; }).reduce(function(s, x) { return s + x.amount; }, 0);
    console.log('[HERO DEBUG] Heroon menevien tulojen summa:', tulotSumDbg);
    console.log('[HERO DEBUG] Heroon menevien menojen summa:', menotSumDbg);
  })();

  var hero = heroSum(kassajakso);
  console.log('[HERO DEBUG] Hero-lopputulos:', hero);
  var heroColor = hero >= 0 ? 'var(--green)' : 'var(--red)';

  var html = '<div style="display:flex;flex-direction:column;gap:2px;margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.07);">';
  html += '<div class="kassa-section-hdr">SEURAAVA RAHATILANNE</div>';

  html += '<div class="kassa-section-hdr" style="margin-top:10px;">RAHAVIRRAT</div>';
  html += '<div class="kassa-tulossa-list" id="kassaTulossaList"></div>';

  html += '<div class="panel-row" style="margin-top:10px;padding-top:10px;border-top:1px solid var(--border);">'
    + '<span class="panel-row-lbl" style="font-weight:700;">Lopputilanne</span>'
    + '<span class="panel-row-val" style="color:' + heroColor + ';">' + fmt(hero) + '</span>'
    + '</div>';

  html += renderSeuraavaKassajakso(buildSeuraavaKassajakso(latest, kassajakso, hero));

  html += '</div>';
  return html;
}

// Kassa inline edit controller — shared for Tulotili and OP Gold
function kassaInlineEdit(field, spanEl) {
  const inp = document.getElementById('kassa-' + field + '-inp');
  if (!inp) return;
  const isMobile = navigator.maxTouchPoints > 0;
  // Pre-fill synchronously from the value already shown on screen (data-raw),
  // then show the input and focus it within this same tap's call stack so
  // iOS Safari opens the keyboard on the first tap instead of the second.
  const preRaw = spanEl.dataset.raw;
  if (preRaw !== undefined && preRaw !== '') {
    inp.value = field === 'op_gold' ? Math.abs(parseFloat(preRaw) || 0) : (parseFloat(preRaw) || 0);
  }
  spanEl.style.display = 'none';
  inp.style.display = 'inline-block';
  inp._origVal = inp.value;
  var _kassaSaved = false;
  var _kassaTouched = false;
  function kassaKeyHandler(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      _kassaSaved = true;
      inp.removeEventListener('keydown', kassaKeyHandler);
      inp.removeEventListener('blur', kassaBlurHandler);
      kassaInlineSave(field, inp);
    }
    if (e.key === 'Escape') {
      _kassaSaved = true;
      inp.removeEventListener('keydown', kassaKeyHandler);
      inp.removeEventListener('blur', kassaBlurHandler);
      kassaInlineCancel(field);
    }
  }
  function kassaBlurHandler() {
    if (_kassaSaved) return;
    inp.removeEventListener('keydown', kassaKeyHandler);
    inp.removeEventListener('blur', kassaBlurHandler);
    if (isMobile && inp.value !== inp._origVal) kassaInlineSave(field, inp);
    else kassaInlineCancel(field);
  }
  inp.addEventListener('keydown', kassaKeyHandler);
  inp.addEventListener('blur', kassaBlurHandler);
  inp.addEventListener('input', function onFirstInput() {
    _kassaTouched = true;
    inp.removeEventListener('input', onFirstInput);
  });
  inp.focus();
  if (inp.value) inp.select();
  // Confirm against the latest snapshot in the background; correct the
  // value only if the user hasn't started typing yet, so nothing the user
  // types gets overwritten.
  DB.getAll('snapshots').then(function(snaps) {
    if (_kassaTouched) return;
    snaps.sort((a,b) => a.date.localeCompare(b.date));
    const latest = snaps[snaps.length - 1];
    if (!latest) return;
    const raw = latest[field];
    const val = field === 'op_gold' ? Math.abs(parseFloat(raw) || 0) : (parseFloat(raw) || 0);
    if (String(val) !== inp.value) {
      inp.value = val;
      inp._origVal = inp.value;
    }
  });
}

function kassaInlineSave(field, inp) {
  inp.style.display = 'none';
  const span = document.getElementById('kassa-' + field + '-val');
  if (span) span.style.display = ''
  if (field === 'tulotili') saveTulotiliValue(inp.value);
  else if (field === 'op_gold') saveOpGoldValue(inp.value);
}

function kassaInlineCancel(field) {
  const inp = document.getElementById('kassa-' + field + '-inp');
  const span = document.getElementById('kassa-' + field + '-val');
  if (inp) inp.style.display = 'none';
  if (span) span.style.display = '';
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
  document.getElementById('f-manual-price').checked = h.last_price_src === 'Manuaalinen';
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
    last_price_src: document.getElementById('f-manual-price')?.checked ? 'Manuaalinen' : null,
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
    nordnet_cash:         (() => { const _v = parseFloat(document.getElementById('nordnet-cash-input')?.value); return Number.isFinite(_v) ? _v : (latest?.nordnet_cash ?? null); })(),
    tulot_kk:             latest?.tulot_kk,
    tulot_pvm:            latest?.tulot_pvm,
    muut_tulot:           latest?.muut_tulot,
    menot_kk:             latest?.menot_kk,
    tulot_items:          latest?.tulot_items,
    rytmi_items:          latest?.rytmi_items,
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
    _updatedAt: new Date().toISOString(),
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
  requestAnimationFrame(() => {
    renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
}

// ═══════════════════════════════════════════════
// EXPORT / IMPORT / RESTORE
// ═══════════════════════════════════════════════
const APP_VERSION    = '1.0.0';
const SCHEMA_VERSION = 4;

function fmtSyncLabel() {
  const meta = getSyncMeta();
  if (!meta) return { text: '● Ei synkronoitu', color: '#c05a5a' };
  if (meta.syncFailed) return { text: '● Synkronointi epäonnistui', color: '#c05a5a' };
  if (!meta.lastSyncedAt) return { text: '● Ei synkronoitu', color: '#c05a5a' };
  const d = new Date(meta.lastSyncedAt);
  const now = new Date();
  const sameDay = d.getFullYear() === now.getFullYear()
               && d.getMonth()    === now.getMonth()
               && d.getDate()     === now.getDate();
  let label;
  if (sameDay) {
    const hh = String(d.getHours()).padStart(2,'0');
    const mm = String(d.getMinutes()).padStart(2,'0');
    label = '● Synkattu ' + hh + ':' + mm;
  } else {
    const dd = String(d.getDate()).padStart(2,'0');
    const mo = String(d.getMonth()+1).padStart(2,'0');
    label = '● Synkattu ' + dd + '.' + mo + '.' + d.getFullYear();
  }
  return { text: label, color: '#5a9e6a' };
}

function syncStatusBadge() {
  const meta = getSyncMeta();
  if (!meta.lastSyncedAt) return '';
  const d = new Date(meta.lastSyncedAt);
  const fi = d.toLocaleDateString('fi-FI') + ' ' + d.toLocaleTimeString('fi-FI', {hour:'2-digit',minute:'2-digit'});
  const device = meta.lastDevice || '';
  return '<div style="font-size:10px;color:var(--text3);font-family:monospace;margin-top:4px;display:flex;align-items:center;gap:5px;">' +
    '<span style="color:#5a9e6a;">●</span> Sync ' + (device ? device + ' · ' : '') + fi + '</div>';
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
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
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
    el.innerHTML = '<div class="empty"><div class="empty-icon">&#x1F4A7;</div><div class="empty-title">Ei dataa vielä</div><div class="empty-sub">Tallenna ensin päivän tiedot Dashboardilta.</div></div>';
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
        '<div style="font-weight:600;font-size:14px;">&#x1F3E6; Tulotili</div>' +
        '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Käytettävissä</div>' +
      '</div>' +
      '<div style="text-align:right;">' +
        '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--green);">' + fmt(tulotili) + '</div>' +
      '</div>' +
    '</div>' +

    // OP Gold
    '<div style="padding:14px 16px;' + (visa || luottotili ? 'border-bottom:1px solid var(--border);' : '') + 'display:flex;justify-content:space-between;align-items:flex-start;">' +
      '<div>' +
        '<div style="font-weight:600;font-size:14px;">&#x1F4B3; OP Gold</div>' +
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
      '<div><div style="font-weight:600;font-size:14px;">&#x1F4B3; Visa</div>' +
      '<div style="font-size:10px;color:var(--text3);margin-top:2px;font-family:var(--mono);">Maksuvelvoite kuun lopussa</div></div>' +
      '<div style="font-family:var(--mono);font-size:16px;font-weight:700;color:var(--gold);">−' + fmt(visa) + '</div></div>' : '') +

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
    c.innerHTML = '<div class="empty"><div class="empty-icon">&#x1F4D2;</div>' +
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
      rows += '<button onclick="archiveSnap(\'' + s.date + '\',true)" title="Arkistoi" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:2px 4px">&#x1F4E6;</button>';
      if (ri === 0) rows += '<button onclick="rollbackTo(\'' + s.date + '\')" title="Palauta tähän" style="background:none;border:none;color:var(--text3);cursor:pointer;font-size:11px;padding:2px 4px">↩</button>';
    } else {
      rows += '<button onclick="archiveSnap(\'' + s.date + '\',false)" title="Palauta näkyviin" style="background:none;border:none;color:var(--gold-dim);cursor:pointer;font-size:11px;padding:2px 4px">↩&#x1F4E6;</button>';
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
        'border-radius:7px;padding:4px 10px;color:var(--gold);font-size:11px;cursor:pointer;">&#x1F4CD; Lisää nastamuistiinpano</button>' +
      '<button onclick="_showArchived=!_showArchived;renderLedger()" style="background:none;border:1px solid var(--border);' +
        'border-radius:7px;padding:4px 10px;color:var(--text3);font-size:11px;cursor:pointer;">' + (_showArchived ? '&#x1F441; Piilota arkisto' : '&#x1F4E6; Näytä arkisto') + '</button>' +
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
      '<button onclick="savePin()" style="flex:1;background:rgba(184,149,106,0.15);border:1px solid var(--gold-dim);border-radius:7px;padding:8px;color:var(--gold);font-weight:700;cursor:pointer;">Tallenna &#x1F4CD;</button>' +
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
  if (document.getElementById('view-dashboard')?.classList.contains('active')) renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
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

// ══════════════════════════════════════════════
// PAIVAKIRJA (paper diary row view)  v1
// ══════════════════════════════════════════════
async function renderPaivakirja(){
  var host = document.getElementById('paivakirja-content');
  if(!host) return;
  var snaps = (await DB.getAll('snapshots')).sort(function(a,b){ return a.date.localeCompare(b.date); });
  if(!snaps.length){ host.innerHTML = '<div class="pk-empty">Ei tilannekuvia viel\u00e4.</div>'; return; }
  var WD = ['Su','Ma','Ti','Ke','To','Pe','La'];
  function nw(s){ try{ return calculateNetWorth(s); }catch(e){ return null; } }
  function kvOf(s){ return (s.tulotili||0) - Math.abs(s.op_gold||0); }
  function fmtDate(iso){ var p=iso.split('-'); var d=new Date(iso); return p[2]+'.'+p[1]+'.'+p[0]; }
  function wd(iso){ var d=new Date(iso); return WD[d.getDay()]; }
  function col(v){ return v>=0 ? 'var(--pk-pos)' : 'var(--pk-neg)'; }
  var html = '';
  var MN = ['tammikuu','helmikuu','maaliskuu','huhtikuu','toukokuu','kesäkuu','heinäkuu','elokuu','syyskuu','lokakuu','marraskuu','joulukuu'];
  function isoWeek(dd){ var dt=new Date(Date.UTC(dd.getFullYear(),dd.getMonth(),dd.getDate())); var dn=dt.getUTCDay()||7; dt.setUTCDate(dt.getUTCDate()+4-dn); var ys=new Date(Date.UTC(dt.getUTCFullYear(),0,1)); return Math.ceil((((dt-ys)/86400000)+1)/7); }
  var _ly=null, _lm=null, _lw=null;
  for(var i=snaps.length-1; i>=0; i--){
    var s=snaps[i], prev=snaps[i-1];
    var n=nw(s); if(!n) continue;
    var _dt=new Date(s.date); var _y=_dt.getFullYear(), _mo=_dt.getMonth(), _wk=isoWeek(_dt);
    if(_y!==_ly){ html += '<div class="pk-year">'+_y+'</div>'; _ly=_y; _lm=null; _lw=null; }
    if(_mo!==_lm){ html += '<div class="pk-month">'+MN[_mo]+' '+_y+'</div>'; _lm=_mo; _lw=null; }
    if(_wk!==_lw){ html += '<div class="pk-week">Vko '+_wk+'</div>'; _lw=_wk; }
    var kv=kvOf(s), osa=n.investments, lai=n.longTermDebt, net=n.netWorth;
    var dnet = (prev && nw(prev)) ? (net - nw(prev).netWorth) : null;
    var note = (s._note||'').trim();
    var deltaStr = dnet==null ? '' : '<span class="pk-delta" style="color:'+col(dnet)+';">'+(dnet>=0?'+':'')+fmt(dnet)+'</span>';
    var tt = (s.tulotili||0), og = Math.abs(s.op_gold||0), tot = tt+og;
    var ttPct = tot>0 ? Math.round(tt/tot*100) : 50;
    var br = n.brokers||{};
    var brNn = (br.nordnet&&br.nordnet.investments)||0, brOp = (br.op&&br.op.investments)||0, brSp = (br.spankki&&br.spankki.investments)||0;
    var lAs = -Math.abs(s.asuntolaina||0), lAu = -Math.abs(s.autolaina||0), lRe = -Math.abs(s.asuntolaina_remontti||0);
    var detail = '<div class="pk-detail">'
      + '<div class="pk-dcol"><div class="pk-dh">Kassa</div>'
        + '<div class="pk-dr"><span>Tulotili</span><span>'+fmt(tt)+'</span></div>'
        + '<div class="pk-dr"><span>OP Gold</span><span>'+fmt(-og)+'</span></div>'
        + '<div class="pk-dr pk-dr-sum"><span>Netto</span><span>'+fmt(net)+'</span></div></div>'
      + '<div class="pk-dcol"><div class="pk-dh">Osakkeet</div>'
        + '<div class="pk-dr"><span>Nordnet</span><span>'+fmt(brNn)+'</span></div>'
        + '<div class="pk-dr"><span>OP</span><span>'+fmt(brOp)+'</span></div>'
        + '<div class="pk-dr"><span>S-Pankki</span><span>'+fmt(brSp)+'</span></div></div>'
      + '<div class="pk-dcol"><div class="pk-dh">Lainat</div>'
        + '<div class="pk-dr"><span>Asuntolaina</span><span>'+fmt(lAs)+' \u2192 2029</span></div>'
        + '<div class="pk-dr"><span>Autolaina</span><span>'+fmt(lAu)+' \u2192 2027</span></div>'
        + '<div class="pk-dr"><span>Remonttilaina</span><span>'+fmt(lRe)+' \u2192 2026</span></div></div>'
      + '</div>';
    html += '<div class="pk-row" data-pk="1">'
      + '<div class="pk-line">'
        + '<span class="pk-date"><span class="pk-wd">'+wd(s.date)+'</span> <span class="pk-d">'+fmtDate(s.date)+'</span></span>'
        + '<span class="pk-grid">'
          + '<span class="pk-cell"><span class="pk-lbl">Kassa</span><span class="pk-val" style="color:'+col(kv)+';">'+fmt(kv)+'</span><span class="pk-bar"><span class="pk-bar-tt" style="width:'+ttPct+'%"></span><span class="pk-bar-og" style="width:'+(100-ttPct)+'%"></span></span></span>'
          + '<span class="pk-cell"><span class="pk-lbl">Osakkeet</span><span class="pk-val">'+fmt(osa)+'</span></span>'
          + '<span class="pk-cell"><span class="pk-lbl">Lainat</span><span class="pk-val">'+fmt(-Math.abs(lai))+'</span></span>'
        + '</span>'
      + '</div>'
      + detail
      + (note ? '<div class="pk-note">\ud83d\udccc '+note.replace(/</g,'&lt;')+'</div>' : '')
      + '</div>';
  }
  host.innerHTML = html;
  host.onclick = function(ev){ var line = ev.target.closest && ev.target.closest('.pk-line'); if(!line) return; var row = line.parentElement; if(row && row.classList) row.classList.toggle('pk-open'); };
}

function showView(name) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  // Hide Refresh button on Tutki — it does not belong there
  const freezeFloat = document.getElementById('btn-freeze-float');
  if (freezeFloat) freezeFloat.style.display = (name === 'suunnittelu') ? 'none' : '';
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.sb-btn').forEach(b => b.classList.remove('active'));
  const sbEl = document.getElementById('sb-' + name);
  if (sbEl) sbEl.classList.add('active');
  // Päiväkirja-alias
  if (name === 'ledger') {
    const sbLed = document.getElementById('sb-ledger');
    if (sbLed) { sbLed.classList.add('active'); }
  }
  document.getElementById(`view-${name}`).classList.add('active');
  const btn = document.getElementById(`btn-${name}`);
  if (btn) btn.classList.add('active');
  // Scrollaa ylös aina kun vaihdetaan näkymää
  window.scrollTo({ top: 0, behavior: 'instant' });
  const viewEl = document.getElementById(`view-${name}`);
  if (viewEl) viewEl.scrollTop = 0;
  const osMain = document.getElementById('os-main');
  if (osMain) osMain.scrollTop = 0;
  if (name === 'historia')      requestAnimationFrame(() => renderHistoria());
  if (name === 'salkku')        requestAnimationFrame(() => renderSalkku());
  if (name === 'likviditeetti') requestAnimationFrame(() => renderLikviditeetti());
  if (name === 'ledger')        requestAnimationFrame(() => renderLedger());
  if (name === 'paivakirja')    requestAnimationFrame(() => renderPaivakirja());
  if (name === 'myynnit')      requestAnimationFrame(() => renderMyynnit());
  if (name === 'suunnittelu') requestAnimationFrame(() => renderSuunnittelupohta());
}





// ═══════════════════════════════════════════════
// TUTKI — Suunnitteluöytä V2.1
// ═══════════════════════════════════════════════

var _tutkiActive={nw:true,cash:true,debt:true,inv:false};
var _tutkiHorisontti=36;

async function renderSuunnittelupohta(){
  var el=document.getElementById('view-suunnittelu');
  if(!el) return;
  var snaps=(await DB.getAll('snapshots')).sort(function(a,b){return a.date<b.date?-1:1;});
  console.log('[TUTKI] snapshots',snaps.length);
  var latest=snaps.length>0?snaps[snaps.length-1]:null;
  function fmt(v){if(v===null||v===undefined||v===''||isNaN(Number(v)))return'—';return Number(v).toLocaleString('fi-FI',{maximumFractionDigits:0})+' €';}
  function fmtSign(v){if(v===null||v===undefined||isNaN(Number(v)))return'—';var n=Math.round(Number(v));return(n>=0?'+':'')+n.toLocaleString('fi-FI')+' €';}
  function snapNW(s){if(!s)return null;return(Number(s.tulotili)||0)+(Number(s.s_pankki)||0)-(Number(s.op_gold)||0)-(Number(s.asuntolaina)||0)-(Number(s.asuntolaina_remontti)||0)-(Number(s.autolaina)||0);}
  function snapCash(s){if(!s)return null;return(Number(s.tulotili)||0)+(Number(s.s_pankki)||0)-(Number(s.op_gold)||0);}
  function snapDebt(s){if(!s)return null;return(Number(s.asuntolaina)||0)+(Number(s.asuntolaina_remontti)||0)+(Number(s.autolaina)||0);}
  function snapInv(s){if(!s)return null;var v=(Number(s.salkku_arvo)||0);return v>0?v:null;}
  function margin(s){if(!s)return 0;var inc=0,exp=0;if(Array.isArray(s.tulot_items))s.tulot_items.forEach(function(x){inc+=Number(x.amt_kk)||0;});if(Array.isArray(s.rytmi_items))s.rytmi_items.forEach(function(x){exp+=Number(x.amt_kk)||0;});return inc-exp;}
  var netWorth=snapNW(latest),cash=snapCash(latest),debt=snapDebt(latest),liikkuma=margin(latest);
  var hasInv=snaps.some(function(s){return snapInv(s)!==null;});
  var html='<style>.tutki-grid{display:grid;grid-template-columns:1fr;gap:0}.tutki-left,.tutki-right{min-width:0}@media(min-width:1000px){.tutki-grid{grid-template-columns:65fr 35fr;column-gap:32px}.tutki-full{grid-column:1/-1}}</style>';
  html+='<div class="tutki-grid" style="max-width:1400px;margin:0 auto;padding:24px 16px 60px;">';
  if(!latest){html+='<div style="color:var(--text3);font-size:14px;padding:40px 0;">Ei dataa.</div></div>';el.innerHTML=html;return;}
  // KONTEKSTIRIVI
  html+='<div class="tutki-full" style="display:flex;flex-wrap:wrap;gap:20px 36px;align-items:baseline;margin-bottom:40px;padding-bottom:20px;border-bottom:1px solid var(--border);">';
  [{label:'Nettovarallisuus',val:fmt(netWorth),color:'var(--text)'},{label:'Käteinen',val:fmt(cash),color:'var(--text)'},{label:'Velat',val:fmt(debt),color:'var(--text)'},{label:'Liikkumavara',val:fmt(liikkuma),suffix:'/kk',color:liikkuma>=0?'var(--green)':'var(--red)'}].forEach(function(c){
    html+='<div><div style="font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);margin-bottom:4px;">'+c.label+'</div><div style="font-size:26px;font-weight:700;font-family:var(--mono);color:'+c.color+';">'+c.val+(c.suffix?'<span style="font-size:13px;font-weight:400;color:var(--text3);margin-left:3px;">'+c.suffix+'</span>':'')+'</div></div>';
  });
  html+='</div>';
  html+='<div class="tutki-left">';
  // TOGGLES
  var tracks=[{id:'nw',label:'Nettovarallisuus',color:'#00c8b0'},{id:'cash',label:'Käteinen',color:'#5ab88a'},{id:'debt',label:'Velat',color:'#d4a857'},{id:'inv',label:'Sijoitukset',color:'#4a90c8',hidden:!hasInv}];
  html+='<div style="display:flex;flex-wrap:wrap;gap:8px;margin-bottom:20px;">';
  tracks.forEach(function(tr){
    if(tr.hidden)return;
    var act=_tutkiActive[tr.id];
    html+='<button onclick="tutkiToggle(\''+ tr.id +'\')" style="background:'+(act?'rgba('+hexToRgb(tr.color)+',0.15)':'rgba(255,255,255,0.04)')+';border:1px solid '+(act?tr.color:'rgba(255,255,255,0.1)')+';color:'+(act?tr.color:'var(--text3)')+';border-radius:6px;padding:5px 12px;font-size:11px;font-weight:500;cursor:pointer;">'+tr.label+'</button>';
  });
  html+='</div>';
  // YHTEENVETO
  var sums=[];
  if(snaps.length>=2){
    var oldest=snaps[0],fnMap={nw:snapNW,cash:snapCash,debt:snapDebt,inv:snapInv},lmap={nw:'Nettovarallisuus',cash:'Käteinen',debt:'Velat',inv:'Sijoitukset'};
    ['nw','cash','debt','inv'].forEach(function(k){
      if(!_tutkiActive[k]||k==='inv'&&!hasInv)return;
      var fn=fnMap[k],v0=fn(oldest),v1=fn(latest);
      if(v0===null||v1===null)return;
      var delta=v1-v0,pct=v0!==0?Math.abs(delta/v0):0,txt;
      if(k==='debt'){txt=delta<-Math.abs(v0)*0.03?'Velat ovat pienentyneet.':delta>Math.abs(v0)*0.03?'Velat ovat kasvaneet.':'Velat ovat pysyneet melko vakaina.';}
      else{txt=pct<0.03||Math.abs(delta)<100?lmap[k]+' on pysynyt melko vakaana.':delta>0?lmap[k]+' on kasvanut.':lmap[k]+' on pienentynyt.';}
      sums.push(txt);
    });
  }
  var lvS=liikkuma>=0?'+':'',summaryText=(sums.length?sums.join(' ')+('  '):'')+'Nykyinen liikkumavara on '+lvS+Math.round(liikkuma).toLocaleString('fi-FI')+' €/kk.';
  // yhteenveto emitted in right col
  // UNIFIED SVG
  var W=600,H=140,pT=22,pB=32;
  var nowX=Math.round(W*0.55),trackH=H-pT-pB;
  var hMonths=[6,12,24,36],lnM=Math.log(36),horizW=W-nowX;
  var hxPos=hMonths.map(function(m){return nowX+Math.round((Math.log(m)/lnM)*(horizW*0.92));});
  var legendItems=[];
  if(_tutkiActive.nw)legendItems.push('<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#00c8b0;"><span style="display:inline-block;width:10px;height:3px;background:#00c8b0;border-radius:2px;"></span>Nettovarallisuus</span>');
  if(_tutkiActive.cash)legendItems.push('<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#5ab88a;"><span style="display:inline-block;width:10px;height:3px;background:#5ab88a;border-radius:2px;"></span>Käteinen</span>');
  if(_tutkiActive.debt)legendItems.push('<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#d4a857;"><span style="display:inline-block;width:10px;height:3px;background:#d4a857;border-radius:2px;"></span>Velat</span>');
  if(hasInv&&_tutkiActive.inv)legendItems.push('<span style="display:inline-flex;align-items:center;gap:4px;font-size:11px;color:#4a90c8;"><span style="display:inline-block;width:10px;height:3px;background:#4a90c8;border-radius:2px;"></span>Sijoitukset</span>');
  if(legendItems.length>0)html+='<div style="display:flex;flex-wrap:wrap;gap:12px;margin-bottom:10px;">'+legendItems.join('')+'</div>';
  html+='<svg viewBox="0 0 '+W+' '+H+'" style="width:100%;display:block;overflow:visible;" preserveAspectRatio="none">';
  html+='<line x1="'+nowX+'" y1="'+pT+'" x2="'+nowX+'" y2="'+( H-pB)+'" stroke="var(--border-bright)" stroke-width="1" stroke-dasharray="3,3" opacity="0.5"/>';
  // History kaaret
  var fnMap2={nw:snapNW,cash:snapCash,debt:snapDebt,inv:snapInv},cols={nw:'#00c8b0',cash:'#5ab88a',debt:'#d4a857',inv:'#4a90c8'};
  if(snaps.length>=2){
    ['nw','cash','debt','inv'].forEach(function(k){
      if(!_tutkiActive[k]||k==='inv'&&!hasInv)return;
      var fn2=fnMap2[k],vals=snaps.map(function(s){return fn2(s);}),def=vals.filter(function(v){return v!==null;});
      if(def.length<2)return;
      var mnV=Math.min.apply(null,def),mxV=Math.max.apply(null,def),rng=mxV-mnV||1,pts=[];
      snaps.forEach(function(s,i){var v=fn2(s);if(v===null)return;pts.push(Math.round((i/(snaps.length-1))*(nowX-6))+','+( pT+Math.round((1-(v-mnV)/rng)*trackH)));});
      if(pts.length<2)return;
      html+='<polyline points="'+pts.join(' ')+'" fill="none" stroke="'+cols[k]+'" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" opacity="0.8"/>';
    });
  }
  // Year labels
  var yearsSeen={};
  snaps.forEach(function(s,i){if(!s.date)return;var yr=s.date.slice(0,4);if(!yearsSeen[yr]){yearsSeen[yr]=true;html+='<text x="'+Math.round((i/(Math.max(snaps.length-1,1)))*(nowX-6))+'" y="'+( H-pB+14)+'" text-anchor="middle" font-size="9" fill="var(--text3)" font-family="var(--mono)">'+yr+'</text>';}});
  // Horizon
  var baseY=Math.round(pT+trackH*0.62),hMaxVal=Math.abs(liikkuma*36)||1;
  var hPts=hMonths.map(function(m,idx){var hval=liikkuma*m,hx=hxPos[idx],yOff=Math.round((hval/hMaxVal)*trackH*0.48),hy=baseY-yOff;return{x:hx,y:hy,val:hval,m:m};});
  var allHLine=[[nowX,baseY]].concat(hPts.map(function(p){return[p.x,p.y];})).map(function(p){return p[0]+','+p[1];}).join(' ');
  var hcol=liikkuma>=0?'#00c8b0':'#d4a857';
  html+='<polyline points="'+allHLine+'" fill="none" stroke="'+hcol+'" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.65"/>';
  html+='<line x1="'+nowX+'" y1="'+baseY+'" x2="'+( nowX+Math.round(horizW*0.95))+'" y2="'+baseY+'" stroke="var(--border-bright)" stroke-width="1"/>';
  hPts.forEach(function(p){html+='<circle cx="'+p.x+'" cy="'+p.y+'" r="3.5" fill="'+hcol+'" opacity="0.75"/>';html+='<text x="'+p.x+'" y="'+( p.y-8)+'" text-anchor="middle" font-size="10" font-weight="600" fill="'+hcol+'" font-family="var(--mono)">'+fmtSign(p.val)+'</text>';html+='<text x="'+p.x+'" y="'+( H-pB+14)+'" text-anchor="middle" font-size="9" fill="var(--text3)" font-family="var(--mono)">'+p.m+' kk</text>';});
  // NYT dot
  html+='<circle cx="'+nowX+'" cy="'+baseY+'" r="8" fill="var(--cyan)"/>';html+='<text x="'+nowX+'" y="'+( baseY-14)+'" text-anchor="middle" font-size="10" font-weight="700" fill="var(--cyan)" font-family="var(--mono)" letter-spacing=".08em">NYT</text>';
  if(latest&&latest.date)html+='<text x="'+nowX+'" y="'+( H-pB+14)+'" text-anchor="middle" font-size="9" fill="var(--cyan)" font-family="var(--mono)">'+latest.date.slice(0,7)+'</text>';
  html+='</svg>';
  html+='<div style="font-size:10px;color:var(--text3);margin-top:6px;font-style:italic;">Vasen: kehityskaaret skaalattu erikseen suuntien vertailua varten.</div>';
  html+='</div>';
  html+='</div>';
  html+='<div class="tutki-right">';
  html+='<div style="font-size:14px;color:var(--text2);line-height:1.8;margin-bottom:10px;padding:14px 16px;background:rgba(0,200,176,0.04);border:1px solid rgba(0,200,176,0.1);border-radius:8px;">'+summaryText+'</div>';
  html+='<div style="font-size:11px;color:var(--text3);margin-bottom:20px;font-style:italic;">Vasen puoli: mennyt kehitys · Oikea puoli: nykyisen rytmin mittakaava</div>';
  el.innerHTML=html;
  console.log('[TUTKI] V2.2 rendered');
}

function tutkiToggle(id){_tutkiActive[id]=!_tutkiActive[id];renderSuunnittelupohta();}
function hexToRgb(hex){var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);return r+','+g+','+b;}

function tutkiToggle(id){
  _tutkiActive[id]=!_tutkiActive[id];
  renderSuunnittelupohta();
}
function tutkiSetHorisontti(m){_tutkiHorisontti=m;renderSuunnittelupohta();}

function hexToRgb(hex){
  var r=parseInt(hex.slice(1,3),16),g=parseInt(hex.slice(3,5),16),b=parseInt(hex.slice(5,7),16);
  return r+','+g+','+b;
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
  renderDashboard().then(function(){ if(window.applyDashboardLayout) window.applyDashboardLayout(); });
});

// ═══════════════════════════════════════════════
// INIT
// ═══════════════════════════════════════════════
// ═══════════════════════════════════════════════
// MYYNNIT — osakkeiden myyntikirjaukset
// ═══════════════════════════════════════════════

async function renderMyynnit() {
  const c = document.getElementById('myynnit-content');
  if (!c) return;

  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.quantity > 0);
  const sales    = (await DB.getAll('sales')).sort((a, b) => b.date.localeCompare(a.date));

  // Koosta holdingvalinta: ticker + nimi + kpl (yksilöllinen per holding.id)
  const holdingOpts = holdings.map(h =>
    `<option value="${h.id}">${h.display_name || h.ticker} — ${(h.quantity||0).toLocaleString('fi-FI')} kpl @ ${h.last_price ? h.last_price.toFixed(2)+' €' : '?'}</option>`
  ).join('');

  // ── Lomake ──────────────────────────────────────────────
  const formHTML = `
    <div style="background:var(--surface2);border:1px solid var(--border);border-radius:12px;
                padding:20px;margin-bottom:24px;">
      <div style="font-weight:700;font-size:15px;margin-bottom:16px;color:var(--green);">+ Kirjaa myynti</div>
      <div class="form-grid" style="grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:12px;">

        <div class="form-field">
          <label class="form-label">Osake / Holding</label>
          <select class="form-select" id="ms-holding" onchange="myyntiPreviewUpdate()">
            <option value="">Valitse...</option>
            ${holdingOpts}
          </select>
        </div>

        <div class="form-field">
          <label class="form-label">Myyntipäivä</label>
          <input class="form-input" id="ms-date" type="date" value="${new Date().toISOString().slice(0,10)}">
        </div>

        <div class="form-field">
          <label class="form-label">Myyty (kpl)</label>
          <input class="form-input" id="ms-qty" type="number" min="0.001" step="0.001"
                 placeholder="esim. 10" oninput="myyntiPreviewUpdate()">
        </div>

        <div class="form-field">
          <label class="form-label">Myyntikurssi (€ / kpl)</label>
          <input class="form-input" id="ms-price" type="number" min="0.001" step="0.01"
                 placeholder="esim. 18.50" oninput="myyntiPreviewUpdate()">
        </div>

      </div>

      <!-- Live-esikatselu -->
      <div id="ms-preview" style="margin-top:16px;display:none;"></div>

      <div style="display:flex;gap:10px;margin-top:16px;">
        <button class="btn-p" onclick="myyntiSave()">Tallenna myynti</button>
        <button class="btn-s" onclick="myyntiPreviewUpdate()">↻ Laske</button>
      </div>
    </div>`;

  // ── Ryhmittely vuosittain ────────────────────────────────
  const byYear = {};
  for (const s of sales) {
    const yr = s.date.slice(0, 4);
    (byYear[yr] = byYear[yr] || []).push(s);
  }

  let salesHTML = '';
  if (sales.length === 0) {
    salesHTML = `<div class="empty" style="padding:48px;">
      <div class="empty-icon">&#x1F4C9;</div>
      <div class="empty-title">Ei myyntejä vielä</div>
      <p style="color:var(--text2);">Kirjaa ensimmäinen myynti yllä olevalla lomakkeella.</p>
    </div>`;
  } else {
    for (const yr of Object.keys(byYear).sort().reverse()) {
      const yrSales = byYear[yr];
      const sum = calcYearlySalesSummary(yrSales);

      salesHTML += `
        <div style="margin-bottom:32px;">
          <!-- Vuosiyhteenveto -->
          <div style="font-family:var(--mono);font-size:11px;text-transform:uppercase;
                      letter-spacing:.1em;color:var(--text3);margin-bottom:10px;">${yr}</div>
          <div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));
                      gap:8px;margin-bottom:16px;">
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Myyntiä yhteensä</div>
              <div class="card-value" style="font-family:var(--mono);font-size:20px;">${fmt(sum.proceeds)}</div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Voitto (suos. menet.)</div>
              <div class="card-value ${sum.profit >= 0 ? 'pos' : 'neg'}" style="font-family:var(--mono);font-size:20px;">
                ${fmtDelta(sum.profit)}
              </div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Veroarvio 30/34 %</div>
              <div class="card-value neg" style="font-family:var(--mono);font-size:20px;">${fmt(sum.tax)}</div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Netto käteen</div>
              <div class="card-value pos" style="font-family:var(--mono);font-size:20px;">${fmt(sum.proceeds - sum.tax)}</div>
            </div>
          </div>

          <!-- Verosäännöt -->
          <div style="background:rgba(90,158,106,.06);border:1px solid rgba(90,158,106,.2);
                      border-radius:8px;padding:10px 14px;margin-bottom:14px;
                      font-family:var(--mono);font-size:11px;color:var(--text2);line-height:1.8;">
            <span style="color:var(--green);font-weight:700;">Suomen verosäännöt ${yr} —</span>
            FIFO käyttää holdingille tallennettua hankintahintaa.
            HMO 20 %: vero lasketaan 80 %:sta myyntihintaa (alle 10 v omistus).
            HMO 40 %: vero lasketaan 60 %:sta (yli 10 v omistus).
            Veroaste: 30 % enintään 30 000 €, 34 % ylittävältä osalta.
          </div>

          <!-- Yksittäiset myynnit -->
          ${yrSales.map(s => renderSaleCard(s)).join('')}
        </div>`;
    }
  }

  c.innerHTML = formHTML + salesHTML;
}

function renderSaleCard(s) {
  const rec = s.calc?.recommended;

  const rows = (s.calc?.methods || []).map(m => {
    const isRec = m.key === rec;
    const profitStr = m.profit != null ? fmtDelta(m.profit) : '—';
    const taxStr    = m.tax    != null ? fmt(m.tax)          : '—';
    const netStr    = m.profit != null && m.tax != null
      ? fmt(m.profit - m.tax) : '—';
    return `
      <tr style="background:${isRec ? 'rgba(90,158,106,.08)' : 'transparent'}">
        <td style="padding:8px 10px;font-family:var(--mono);font-size:12px;
                   color:${isRec ? 'var(--green)' : 'var(--text2)'};">
          ${m.label}
          ${isRec ? '<span style="margin-left:6px;font-size:10px;background:rgba(90,158,106,.2);color:var(--green);padding:1px 6px;border-radius:4px;border:1px solid rgba(90,158,106,.3);">✓ suositus</span>' : ''}
        </td>
        <td style="padding:8px 10px;font-family:var(--mono);font-size:12px;text-align:right;
                   color:var(--text);">${fmt(s.totalEur)}</td>
        <td style="padding:8px 10px;font-family:var(--mono);font-size:12px;text-align:right;
                   color:${m.profit >= 0 ? 'var(--green)' : 'var(--red)'};">${profitStr}</td>
        <td style="padding:8px 10px;font-family:var(--mono);font-size:12px;text-align:right;
                   color:var(--red);">${taxStr}</td>
        <td style="padding:8px 10px;font-family:var(--mono);font-size:12px;text-align:right;
                   color:${m.profit - (m.tax||0) >= 0 ? 'var(--green)' : 'var(--red)'};">${netStr}</td>
      </tr>`;
  }).join('');

  // Toimintavaravaikutus
  const recMethod = s.calc?.methods?.find(m => m.key === rec);
  const netCash = recMethod ? (s.totalEur - (recMethod.tax || 0)) : null;

  return `
    <div style="border:1px solid var(--border);border-radius:10px;overflow:hidden;margin-bottom:10px;">
      <!-- Otsikkorivi -->
      <div style="display:flex;justify-content:space-between;align-items:center;
                  padding:12px 14px;background:var(--surface2);flex-wrap:wrap;gap:8px;">
        <div>
          <span style="font-weight:700;font-size:14px;color:var(--text);">${s.holdingName || s.ticker}</span>
          <span style="font-family:var(--mono);font-size:11px;color:var(--text3);margin-left:8px;">${s.ticker}</span>
        </div>
        <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;">
          <span style="font-family:var(--mono);font-size:12px;color:var(--text2);">
            ${fmtDate(s.date)} &nbsp;·&nbsp; ${(s.qty||0).toLocaleString('fi-FI')} kpl
            &nbsp;·&nbsp; ${s.pricePerShare?.toFixed(2)} €/kpl
          </span>
          <button onclick="myyntiDelete('${s.id}')"
            style="font-size:11px;padding:4px 10px;background:rgba(192,90,90,.1);
                   border:1px solid rgba(192,90,90,.3);border-radius:6px;
                   color:#c05a5a;cursor:pointer;">Poista</button>
        </div>
      </div>

      <!-- Metoditaulukko -->
      <div style="overflow-x:auto;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--surface);">
              <th style="padding:7px 10px;text-align:left;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;letter-spacing:.07em;color:var(--text3);">Menetelmä</th>
              <th style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;letter-spacing:.07em;color:var(--text3);">Myyntitulo</th>
              <th style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;letter-spacing:.07em;color:var(--text3);">Voitto/Tappio</th>
              <th style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;letter-spacing:.07em;color:var(--text3);">Veroarvio</th>
              <th style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;letter-spacing:.07em;color:var(--text3);">Netto käteen</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>

      <!-- Toimintavaravaikutus -->
      ${netCash != null ? `
        <div style="padding:10px 14px;background:rgba(90,158,106,.04);
                    border-top:1px solid rgba(90,158,106,.15);
                    font-family:var(--mono);font-size:11px;color:var(--text2);">
          &#x1F4A1; Suositellulla menetelmällä vapautuu toimintavaraan
          <span style="color:var(--green);font-weight:700;">${fmt(netCash)}</span>
          verojen jälkeen.
          ${s.purchasePrice ? `Hankintahinta oli ${s.purchasePrice.toFixed(2)} €/kpl.` : ''}
        </div>` : ''}
    </div>`;
}

// Live-esikatselu lomakkeessa
function myyntiPreviewUpdate() {
  const previewEl = document.getElementById('ms-preview');
  if (!previewEl) return;

  const holdingId = parseInt(document.getElementById('ms-holding')?.value);
  const qty       = parseFloat(document.getElementById('ms-qty')?.value);
  const price     = parseFloat(document.getElementById('ms-price')?.value);

  if (!holdingId || !qty || !price || isNaN(qty) || isNaN(price)) {
    previewEl.style.display = 'none';
    return;
  }

  DB.getAll('holdings').then(holdings => {
    const h = holdings.find(x => x.id === holdingId);
    if (!h) return;

    const purchasePrice = h.purchase_price || 0;
    const result = calcSaleMethods(qty, price, purchasePrice);

    const rows = result.methods.map(m => {
      const isRec = m.key === result.recommended;
      return `
        <tr style="background:${isRec ? 'rgba(90,158,106,.10)' : 'transparent'}">
          <td style="padding:7px 10px;font-family:var(--mono);font-size:12px;
                     color:${isRec ? 'var(--green)' : 'var(--text2)'};">
            ${m.label}${isRec ? ' <span style="font-size:10px;color:var(--green);">✓</span>' : ''}
          </td>
          <td style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:12px;">${fmt(result.totalSale)}</td>
          <td style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:12px;
                     color:${m.profit >= 0 ? 'var(--green)' : 'var(--red)'};">
            ${m.profit != null ? fmtDelta(m.profit) : '—'}
          </td>
          <td style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:12px;
                     color:var(--red);">${m.tax != null ? fmt(m.tax) : '—'}</td>
          <td style="padding:7px 10px;text-align:right;font-family:var(--mono);font-size:12px;
                     color:${m.profit - (m.tax||0) >= 0 ? 'var(--green)' : 'var(--red)'};">
            ${m.profit != null ? fmt(m.profit - (m.tax||0)) : '—'}
          </td>
        </tr>`;
    }).join('');

    previewEl.style.display = 'block';
    previewEl.innerHTML = `
      <div style="font-family:var(--mono);font-size:11px;text-transform:uppercase;
                  letter-spacing:.08em;color:var(--text3);margin-bottom:8px;">Esikatselu</div>
      <div style="overflow-x:auto;border:1px solid var(--border);border-radius:8px;">
        <table style="width:100%;border-collapse:collapse;">
          <thead>
            <tr style="background:var(--surface);">
              <th style="padding:6px 10px;text-align:left;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;color:var(--text3);">Menetelmä</th>
              <th style="padding:6px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;color:var(--text3);">Myyntitulo</th>
              <th style="padding:6px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;color:var(--text3);">Voitto</th>
              <th style="padding:6px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;color:var(--text3);">Vero</th>
              <th style="padding:6px 10px;text-align:right;font-family:var(--mono);font-size:10px;
                         text-transform:uppercase;color:var(--text3);">Netto</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>`;
  });
}

async function myyntiSave() {
  const holdingId = parseInt(document.getElementById('ms-holding')?.value);
  const dateVal   = document.getElementById('ms-date')?.value;
  const qty       = parseFloat(document.getElementById('ms-qty')?.value);
  const price     = parseFloat(document.getElementById('ms-price')?.value);

  if (!holdingId || !dateVal || !qty || !price || isNaN(qty) || isNaN(price)) {
    alert('Täytä kaikki kentät oikein.'); return;
  }

  const holdings = await DB.getAll('holdings');
  const h = holdings.find(x => x.id === holdingId);
  if (!h) { alert('Holdingia ei löydy.'); return; }

  const purchasePrice = h.purchase_price || 0;
  const calc = calcSaleMethods(qty, price, purchasePrice);

  const sale = {
    id:            'sale_' + Date.now(),
    holdingId,
    holdingName:   h.display_name || h.ticker,
    ticker:        h.ticker,
    account:       h.account,
    date:          dateVal,
    qty,
    pricePerShare: price,
    totalEur:      calc.totalSale,
    purchasePrice: purchasePrice || null,
    calc,
  };

  await DB.putSale(sale);

  // Vähennä kappalemäärä holdingista
  const newQty = Math.max(0, (h.quantity || 0) - qty);
  await DB.putHolding({ ...h, quantity: newQty });

  // Nollaa lomake
  ['ms-holding','ms-qty','ms-price'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  const prev = document.getElementById('ms-preview');
  if (prev) prev.style.display = 'none';

  await renderMyynnit();
  // Päivitä myös Salkku-näkymä jos auki
  if (document.getElementById('view-salkku')?.classList.contains('active')) {
    renderSalkku();
  }
}

async function myyntiDelete(id) {
  if (!confirm('Poistetaanko myyntimerkintä? Kappalemäärää ei palauteta automaattisesti.')) return;
  await DB.deleteSale(id);
  await renderMyynnit();
}


window.panelMenoDelete = async function(id) {
  if (!confirm('Poistetaanko meno?')) return;
  var snaps = (await DB.getAll('snapshots')).sort(function(a,b){ return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = Object.assign({}, snaps[snaps.length - 1]);
  var items = Array.isArray(latest.rytmi_items) ? latest.rytmi_items : [];
  if (typeof id === 'string' && id.indexOf('idx:') === 0) {
    var idx = parseInt(id.slice(4), 10);
    latest.rytmi_items = items.filter(function(x, i){ return i !== idx; });
  } else {
    latest.rytmi_items = items.filter(function(x){ return x.id !== id; });
  }
  latest._updatedAt = new Date().toISOString();
  await DB.putSnapshot(latest);
  try { setTimeout(function(){ if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch(e) {}
  await renderDashboard();
};

window.panelTuloDelete = async function(id) {
  if (!confirm('Poistetaanko tulo?')) return;
  var snaps = (await DB.getAll('snapshots')).sort(function(a,b){ return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = Object.assign({}, snaps[snaps.length - 1]);
  var items = Array.isArray(latest.tulot_items) ? latest.tulot_items : [];
  if (typeof id === 'string' && id.indexOf('idx:') === 0) {
    var idx = parseInt(id.slice(4), 10);
    latest.tulot_items = items.filter(function(x, i){ return i !== idx; });
  } else {
    latest.tulot_items = items.filter(function(x){ return x.id !== id; });
  }
  latest.tulot_kk = latest.tulot_items.reduce(function(s,x){ return s + (Number(x.amt_kk) || 0); }, 0);
  latest._updatedAt = new Date().toISOString();
  await DB.putSnapshot(latest);
  try { setTimeout(function(){ if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch(e) {}
  await renderDashboard();
};
// ══════════════════════════════════════════════════════════════

// ── KORTTIEN JA OSIOIDEN DRAG & DROP ────────────────────────────────────
// ── KORTTIEN JA OSIOIDEN JÄRJESTELY (mouse-pohjainen) ───────────────────
// ── KORTTIEN JA OSIOIDEN JÄRJESTELY ─────────────────────────────────────
// ── YHTEINEN DRAG & DROP ─────────────────────────────────────────────────
function initCardDrag() {
  const STORAGE_KEY = 'fin_item_order';
  const SIZE_KEY    = 'fin_item_sizes';
  const container = document.getElementById('db-content');
  if (!container) return;

  const DEFAULT = ['inv','debt','cash','netto','heartbeat','historia','muuttui','tapahtumat'];
  const ALWAYS_WIDE = ['netto','heartbeat','historia','muuttui','tapahtumat'];

  function getSizes() {
    try { return JSON.parse(localStorage.getItem(SIZE_KEY) || '{}'); } catch(e) { return {}; }
  }
  function isWide(id) {
    if (ALWAYS_WIDE.includes(id)) return true;
    return getSizes()[id] === 'wide';
  }
  window.applyAllSizes = function applyAllSizes() {
    document.getElementById('db-content')?.querySelectorAll('[data-item-id]').forEach(el => {
      el.classList.toggle('card-wide', isWide(el.dataset.itemId)); el.classList.toggle('card-normal', !isWide(el.dataset.itemId));
      const btn = el.querySelector('.size-toggle-btn');
      if (btn) {
        const wide = isWide(el.dataset.itemId);
        btn.textContent = wide ? '⊡' : '⊞';
        btn.title = wide ? 'Tee pieneksi' : 'Tee leveäksi';
      }
    });
    // Pakota Safari redraw
    const grid = document.getElementById('db-content');
    if (grid) { grid.style.display='none'; void grid.offsetHeight; grid.style.display=''; }
  }

  window.toggleItemSize = function(id) {
    if (ALWAYS_WIDE.includes(id)) return;
    const sizes = getSizes();
    sizes[id] = isWide(id) ? 'small' : 'wide';
    localStorage.setItem(SIZE_KEY, JSON.stringify(sizes));
    window.applyAllSizes();
  };

  // Palauta tallennettu järjestys
  const wideIds = ALWAYS_WIDE;
  try {
    const order = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (order && order.length > 0) {
      const map = {};
      document.getElementById('db-content')?.querySelectorAll('[data-item-id]').forEach(el => map[el.dataset.itemId] = el);
      order.forEach(id => { if (map[id]) container.appendChild(map[id]); });
    }
  } catch(e) {}
  applyAllSizes();

  // Drop-indikaattori
  const indicator = document.createElement('div');
  indicator.style.cssText = 'position:fixed;height:3px;background:#00c8ff;border-radius:2px;' +
    'z-index:10000;pointer-events:none;display:none;box-shadow:0 0 10px #00c8ff;';
  document.body.appendChild(indicator);

  function showIndicator(el, before) {
    const r = el.getBoundingClientRect();
    indicator.style.display = 'block';
    indicator.style.top  = (before ? r.top - 2 : r.bottom - 1) + 'px';
    indicator.style.left = r.left + 'px';
    indicator.style.width = r.width + 'px';
  }
  function hideIndicator() { indicator.style.display = 'none'; }

  function addHandle(el) {
    if (el.querySelector('.drag-handle')) return el.querySelector('.drag-handle');
    const label = el.querySelector('.sec,.card-label');
    const h = document.createElement(label ? 'span' : 'div');
    h.className = 'drag-handle';
    h.innerHTML = '⠿';
    h.title = 'Vedä siirtääksesi';
    if (label) {
      h.style.cssText = 'cursor:grab;color:rgba(255,255,255,0.4);font-size:15px;margin-left:10px;user-select:none;vertical-align:middle;';
      label.appendChild(h);
    } else {
      h.style.cssText = 'position:absolute;top:8px;right:10px;cursor:grab;font-size:18px;color:rgba(255,255,255,0.3);z-index:20;user-select:none;padding:4px 8px;border-radius:6px;background:rgba(255,255,255,0.05);';
      el.style.position = 'relative';
      el.appendChild(h);
    }
    return h;
  }

  let scrollTimer = null, _my = 0;
  document.addEventListener('mousemove', e => { _my = e.clientY; });
  function startScroll() {
    if (scrollTimer) return;
    const sc = document.getElementById('os-main') || document.documentElement;
    scrollTimer = setInterval(() => {
      const h = window.innerHeight;
      if (_my < 120) sc.scrollTop -= 12 * (1 - _my/120);
      else if (_my > h-120) sc.scrollTop += 12 * (1 - (h-_my)/120);
    }, 20);
  }
  function stopScroll() { if (scrollTimer) { clearInterval(scrollTimer); scrollTimer = null; } }

  document.getElementById('db-content')?.querySelectorAll('[data-item-id]').forEach(el => {
    const handle = addHandle(el);
    // Lisää koko-nappi pieniin kortteihin
    const ALWAYS_WIDE = ['netto','heartbeat','historia','muuttui','tapahtumat'];
    if (!ALWAYS_WIDE.includes(el.dataset.itemId) && !el.querySelector('.size-toggle-btn')) {
      const sBtn = document.createElement('div');
      sBtn.className = 'size-toggle-btn';
      sBtn.textContent = isWide(el.dataset.itemId) ? '⊡' : '⊞';
      sBtn.title = isWide(el.dataset.itemId) ? 'Tee pieneksi' : 'Tee leveäksi';
      sBtn.style.cssText = 'position:absolute;top:6px;right:38px;cursor:pointer;font-size:15px;' +
        'color:rgba(255,255,255,0.55);z-index:20;user-select:none;padding:4px 8px;border-radius:6px;' +
        'background:rgba(255,255,255,0.06);border:1px solid rgba(255,255,255,0.1);transition:all .15s;';
      sBtn.addEventListener('mouseenter', () => { sBtn.style.color='#fff'; sBtn.style.background='rgba(255,255,255,0.12)'; });
      sBtn.addEventListener('mouseleave', () => { sBtn.style.color='rgba(255,255,255,0.55)'; sBtn.style.background='rgba(255,255,255,0.06)'; });
      const _itemId = el.dataset.itemId;
      sBtn.addEventListener('click', e => {
        e.stopPropagation();
        e.preventDefault();
        window.toggleItemSize(_itemId);
      });
      el.style.position = 'relative';
      el.appendChild(sBtn);
    }
    let clone = null, startX = 0, startY = 0;
    let dropTarget = null, dropBefore = true;

    function getItems() {
      return [...document.getElementById('db-content')?.querySelectorAll('[data-item-id]')].filter(t => t !== el);
    }

    function findDrop(cx, cy) {
      let best = null, bestBefore = true, bestDist = Infinity;
      getItems().forEach(t => {
        const r = t.getBoundingClientRect();
        if (r.height === 0) return;
        const midY = r.top + r.height / 2;
        const dist = Math.abs(cy - midY);
        if (dist < bestDist) {
          bestDist = dist;
          best = t;
          bestBefore = cy < midY;
        }
      });
      return best ? { target: best, before: bestBefore } : null;
    }

    function onMove(e) {
      const cx = e.clientX, cy = e.clientY;
      if (!clone) {
        if (Math.abs(cx-startX) < 5 && Math.abs(cy-startY) < 5) return;
        clone = document.createElement('div');
        const title = el.querySelector('.sec,.card-label')?.textContent?.trim() || '⠿';
        clone.innerHTML = '<div style="padding:12px 16px;font-size:13px;font-weight:700;color:#e2ddd4;">' + title + '</div>';
        clone.style.cssText = 'position:fixed;z-index:9999;opacity:0.75;pointer-events:none;' +
          'box-shadow:0 12px 40px rgba(0,0,0,0.6);border-radius:12px;overflow:hidden;' +
          'width:' + Math.min(el.offsetWidth, 300) + 'px;' +
          'background:#1a2420;border:2px solid #00c8ff;';
        document.body.appendChild(clone);
        el.style.opacity = '0.2';
        handle.style.cursor = 'grabbing';
        startScroll();
      }
      clone.style.left = (cx - parseInt(clone.style.width)/2) + 'px';
      clone.style.top  = (cy - 20) + 'px';

      const drop = findDrop(cx, cy);
      if (drop) { dropTarget = drop.target; dropBefore = drop.before; showIndicator(drop.target, drop.before); }
      else { dropTarget = null; hideIndicator(); }
    }

    function onEnd() {
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseup', onEnd);
      stopScroll(); hideIndicator();
      el.style.opacity = '1';
      handle.style.cursor = 'grab';
      if (clone) { clone.remove(); clone = null; }
      if (dropTarget) {
        dropBefore ? container.insertBefore(el, dropTarget) : container.insertBefore(el, dropTarget.nextSibling);
        // Palauta koot drag-siirron jälkeen
        window.applyAllSizes();
        const newOrder = [...document.getElementById('db-content')?.querySelectorAll('[data-item-id]')].map(c => c.dataset.itemId);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(newOrder));
      }
      dropTarget = null;
    }

    handle.addEventListener('mousedown', e => {
      e.preventDefault(); e.stopPropagation();
      startX = e.clientX; startY = e.clientY;
      document.addEventListener('mousemove', onMove);
      document.addEventListener('mouseup', onEnd);
    });
  });
}
// ── END DRAG ─────────────────────────────────────────────────────────────


// ── LAYOUT TALLENNIN ─────────────────────────────────────────────────────
function initLayoutToolbar() {
  const toolbar = document.getElementById('layout-toolbar');
  const container = document.getElementById('db-content');
  if (!toolbar || !container) return;

  const LAYOUTS_KEY = 'fin_layouts';
  const CURRENT_KEY = 'fin_item_order';

  function getLayouts() {
    try { return JSON.parse(localStorage.getItem(LAYOUTS_KEY) || '{}'); } catch(e) { return {}; }
  }
  function saveLayouts(layouts) {
    localStorage.setItem(LAYOUTS_KEY, JSON.stringify(layouts));
  }
  function getCurrentOrder() {
    return [...document.getElementById('db-content')?.querySelectorAll('[data-item-id]')].map(el => el.dataset.itemId);
  }
  function applyLayout(order) {
    const map = {};
    document.getElementById('db-content')?.querySelectorAll('[data-item-id]').forEach(el => map[el.dataset.itemId] = el);
    order.forEach(id => { if (map[id]) container.appendChild(map[id]); });
    if (window.applyAllSizes) window.applyAllSizes();
    else document.getElementById('db-content')?.querySelectorAll('[data-item-id]').forEach(item => {
      item.style.gridColumn = ['netto','heartbeat','historia','muuttui','tapahtumat'].includes(item.dataset.itemId) ? '1/-1' : 'auto';
    });
    localStorage.setItem(CURRENT_KEY, JSON.stringify(order));
  }

  function render() {
    const layouts = getLayouts();
    const names = Object.keys(layouts);
    toolbar.innerHTML = '';

    // Otsikko
    const lbl = document.createElement('span');
    lbl.style.cssText = 'font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--text3);font-family:var(--mono);white-space:nowrap;';
    lbl.textContent = 'Näkymät:';
    toolbar.appendChild(lbl);

    // Tallennetut näkymät
    names.forEach(name => {
      const btn = document.createElement('button');
      btn.style.cssText = 'font-size:11px;padding:3px 10px;border-radius:20px;border:1px solid var(--border);' +
        'background:rgba(0,200,255,0.06);color:var(--text2);cursor:pointer;font-family:var(--mono);' +
        'display:flex;align-items:center;gap:6px;white-space:nowrap;';
      btn.innerHTML = name + '<span style="color:var(--text3);font-size:10px;" title="Poista">✕</span>';
      // Sovella näkymä
      btn.addEventListener('click', e => {
        if (e.target.tagName === 'SPAN') {
          // Poista
          if (confirm('Poistetaanko näkymä "' + name + '"?')) {
            const layouts = getLayouts();
            delete layouts[name];
            saveLayouts(layouts);
            render();
          }
        } else {
          applyLayout(layouts[name]);
          render();
        }
      });
      toolbar.appendChild(btn);
    });

    // + Tallenna -nappi
    const saveBtn = document.createElement('button');
    saveBtn.style.cssText = 'font-size:11px;padding:3px 10px;border-radius:20px;border:1px solid rgba(0,255,157,0.3);' +
      'background:rgba(0,255,157,0.06);color:var(--green);cursor:pointer;font-family:var(--mono);white-space:nowrap;';
    saveBtn.textContent = '+ Tallenna näkymä';
    saveBtn.addEventListener('click', () => {
      const name = prompt('Anna näkymälle nimi (esim. "Päivittäinen", "Analyysi"):');
      if (!name || !name.trim()) return;
      const layouts = getLayouts();
      layouts[name.trim()] = getCurrentOrder();
      saveLayouts(layouts);
      render();
    });
    toolbar.appendChild(saveBtn);

    // Nollaa järjestys
    const resetBtn = document.createElement('button');
    resetBtn.style.cssText = 'font-size:11px;padding:3px 10px;border-radius:20px;border:1px solid var(--border);' +
      'background:transparent;color:var(--text3);cursor:pointer;font-family:var(--mono);white-space:nowrap;';
    resetBtn.textContent = '↺ Oletus';
    resetBtn.addEventListener('click', () => {
      applyLayout(['inv','debt','cash','netto','heartbeat','historia','muuttui','tapahtumat']);
      render();
    });
    toolbar.appendChild(resetBtn);
  }

  render();
}
// ── END LAYOUT TALLENNIN ─────────────────────────────────────────────────


// ---- INV CARD SHORT NAMES ----
function getHoldingShortName(h) {
  const dn = h.display_name || '';
  const shortNames = {
    'Amazon': 'Amazon',
    'Apple': 'Apple',
    'Eli Lilly': 'Lilly',
    'Fortum': 'Fortum',
    'Mandatum': 'Manda',
    'Novo Nordisk': 'Novo',
    'Outokumpu': 'Outok',
    'iShares Core S&P 500 ETF': 'SP500',
    'S-Pankki Passiivinen USA ESG': 'USAESG',
  };
  if (shortNames[dn]) return shortNames[dn];
  if (dn.includes('Nordea')) return 'Nordea';
  return dn || h.ticker || '—';
}

// ---- INV CARD BROKER TOGGLE ----
function toggleInvBroker(key) {
  _invExpandedBroker = (_invExpandedBroker === key) ? null : key;
  renderDashboard();
}
window.toggleInvBroker = toggleInvBroker;

// ── Kassa: Rahavirrat CRUD ────────────────────────────────────────────
// Yksi lista KAIKILLE tuleville rahavirroille (kertaluonteiset +
// säännölliset), aikajärjestyksessä — LUKITTU tuotepäätös #14 (22.7.2026):
// Rahavirrat-lista ja Odote/Kassajakso ovat kaksi eri asiaa eivätkä enää
// jaa samaa rajausta. Rahavirrat-lista käyttää collectRahavirrat():ia
// suoraan (rajaamaton), Odote/Hero käyttävät yhä buildKassajakso():n
// periodEnd-rajattua joukkoa — ks. buildKassajakso-kommentti.
function renderTulossaList() {
  var el = document.getElementById('kassaTulossaList');
  if (!el) return;
  var snap = window._allSnaps?.[window._allSnaps.length - 1];
  var allItems = snap ? collectRahavirrat(snap, new Date(snap.date + 'T00:00:00')) : [];
  var filter = window._rahavirtaFilter || 'all';
  var items = allItems.filter(function(x) {
    if (filter === 'recurring') return x.source !== 'tulevat_items';
    if (filter === 'once') return x.source === 'tulevat_items';
    return true;
  }).slice().sort(function(a, b) { return a.date - b.date; });

  // Kassajakson päättymisviiva: sama periodEnd kuin Odote/Hero käyttävät
  // (buildKassajakso, ei uutta laskentaa) — sisältää jo OP Gold -laajennuksen,
  // joten viiva siirtyy automaattisesti oikeaan kohtaan ilman erillistä
  // koodia. Näytetään riippumatta suodattimesta, heti viimeisen kassajaksoon
  // kuuluvan rivin jälkeen (ensimmäisen sen jälkeisen rivin edellä) — jos
  // jakso on avoin (periodEnd null) tai mikään näkyvä rivi ei ylitä sitä,
  // viivaa ei näytetä. Sama visuaalinen tyyli kuin openOdoteModal:in
  // "Kassajakso päättyy" -erotin.
  var kassajaksoPeriodEnd = snap ? buildKassajakso(snap).periodEnd : null;
  var dividerShown = false;
  var dividerHtml = '<div style="display:flex;align-items:center;gap:8px;margin:6px 0;">'
    + '<div style="flex:1;border-top:1px dashed var(--border);"></div>'
    + '<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;white-space:nowrap;">Kassajakso päättyy</span>'
    + '<div style="flex:1;border-top:1px dashed var(--border);"></div>'
    + '</div>';

  var monthNames = ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu','Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'];
  var groups = {};
  var order = [];
  items.forEach(function(x) {
    var m = String(x.date.getMonth() + 1);
    if (!groups[m]) { groups[m] = []; order.push(m); }
    groups[m].push(x);
  });
  order.sort(function(a, b) { return Number(a) - Number(b); });
  var html = '';
  order.forEach(function(m) {
    var mNum = parseInt(m, 10);
    var mName = (mNum >= 1 && mNum <= 12) ? monthNames[mNum - 1] : (m || '—');
    html += '<div class="kassa-month-hdr">' + mName + '</div>';
    groups[m].forEach(function(x) {
      if (kassajaksoPeriodEnd && !dividerShown && x.date.getTime() > kassajaksoPeriodEnd.getTime()) {
        html += dividerHtml;
        dividerShown = true;
      }
      if (x.source === 'tulevat_items') {
        var item = x.ref;
        // Sama taaksepäin yhteensopiva tunniste kuin säännöllisten rivien poistossa
        // (ks. delKey alla): vanhemmilla/synkronoiduilla riveillä ei aina ole
        // id-kenttää, jolloin käytetään indeksipohjaista idx:-fallbackia. Ilman
        // tätä onclick muodostuisi merkkijonoksi "...('undefined')", joka ei
        // koskaan täsmää mihinkään riviin.
        var itemKey = item.id != null ? item.id : ('idx:' + snap.tulevat_items.indexOf(item));
        var sign = (item.amount > 0) ? '+' : '';
        var amtColor = (item.amount > 0) ? 'var(--green)' : (item.amount < 0 ? 'var(--expense)' : 'var(--text3)');
        // Kuittausruutu vain kertaluonteisilla (tulevat_items) riveillä —
        // säännöllisiin ei kosketa (ks. else-haara alla). Ruutu ei itsessään
        // tallenna tilaa: onchange avaa vahvistusmodalin, joka joko poistaa
        // rivin tulevat_items-taulukosta (kuitattu) tai palauttaa ruudun
        // rastittomaksi (peruttu) — ks. rahavirtaKuittausConfirm.
        html += '<div class="kassa-view-row" onclick="rahavirtaEditorOpenEdit(\'tulevat_items\',\'' + itemKey + '\')">' +
          '<span style="display:flex;align-items:baseline;gap:8px;min-width:0;">' +
          '<input type="checkbox" class="rv-once-check" title="Merkitse hoidetuksi" onclick="event.stopPropagation();" onchange="rahavirtaKuittausConfirm(this,\'' + itemKey + '\')" style="width:14px;height:14px;flex-shrink:0;accent-color:var(--cyan);cursor:pointer;">' +
          '<span class="kassa-vr-label" style="color:' + amtColor + '">' + (item.label==='auto'?'🚗 ':'') + normalizeRecurringLabel(item.label, '—') + '</span>' +
          '</span>' +
          '<span class="kassa-vr-amount" style="color:' + amtColor + '">' + sign + item.amount + ' €</span>' +
          '</div>';
      } else {
        var isIncome = x.source === 'tulot_items';
        var ritem = x.ref;
        var amt = isIncome ? (parseFloat(ritem.amt_kk) || 0) : (parseFloat(ritem.amt_kk != null ? ritem.amt_kk : ritem.amount) || 0);
        var label = normalizeRecurringLabel(ritem.label, isIncome ? 'Tulo' : 'Meno').replace(/</g, '&lt;');
        var day = validRecurringDay(ritem.paiva);
        var dayCell = '<span style="display:inline-block;width:20px;flex-shrink:0;text-align:right;font-family:var(--mono);color:var(--text3);white-space:nowrap;">' + (day !== null ? day + '.' : '') + '</span>';
        var srcArr = isIncome ? snap.tulot_items : snap.rytmi_items;
        var delKey = ritem.id != null ? ritem.id : ('idx:' + srcArr.indexOf(ritem));
        var rSource = isIncome ? 'tulot_items' : 'rytmi_items';
        var deleteFn = isIncome ? 'panelTuloDelete' : 'panelMenoDelete';
        var rAmtColor = isIncome ? 'var(--green)' : 'var(--expense)';
        // cursor:pointer on tämä yksittäinen rivi, ei jaettu .panel-row-luokka
        // (jota käytetään muillakin sivuilla ei-klikattavana) — poistopainikkeen
        // klikkaus pysäyttää tapahtuman leviämisen, jottei se avaisi editoria
        // samalla kun rivi poistetaan.
        html += '<div class="panel-row" style="cursor:pointer;" onclick="rahavirtaEditorOpenEdit(\'' + rSource + '\',\'' + delKey + '\')"><span style="display:flex;align-items:baseline;gap:8px;min-width:0;">' + dayCell + '<span style="color:var(--text3);" title="Säännöllinen">⟳</span><span class="panel-row-lbl" style="color:' + rAmtColor + ';">' + label + '</span></span>'
          + '<span style="display:flex;align-items:center;gap:8px;">'
          + '<span class="panel-row-val" style="color:' + rAmtColor + ';">' + amt.toLocaleString('fi-FI',{maximumFractionDigits:0}) + ' €/kk</span>'
          + '<button onclick="event.stopPropagation(); ' + deleteFn + '(\'' + delKey + '\')" title="Poista" style="background:none;border:none;color:var(--text3);font-size:13px;cursor:pointer;padding:0 2px;line-height:1;">✕</button>'
          + '</span></div>';
      }
    });
  });

  if (!items.length) html = '<div class="panel-row"><span class="panel-row-lbl">Ei rahavirtoja.</span></div>';

  var filterRow = '<div class="kassa-filter-row">' + ['all','recurring','once'].map(function(f) {
    var flabel = f === 'all' ? 'Kaikki' : (f === 'recurring' ? 'Säännölliset' : 'Kertaluonteiset');
    return '<button class="kassa-filter-btn' + (filter === f ? ' active' : '') + '" onclick="rahavirtaFilterSet(\'' + f + '\')">' + flabel + '</button>';
  }).join('') + '</div>';

  el.innerHTML = filterRow + html;
}
window.rahavirtaFilterSet = function(mode) {
  window._rahavirtaFilter = mode;
  renderTulossaList();
};

// ── Kertaluonteisen rahavirran kuittaus (sprint 22.7.2026) ──────────────
// Käyttäjän näkökulmasta rahavirta "merkitään hoidetuksi" — toteutuksessa
// tämä on rivin poisto tulevat_items-taulukosta, koska kaikki näkymät
// (Rahavirrat-lista, Kassajakso, Odote, Hero) lukevat saman taulukon joko
// suoraan tai collectRahavirrat()/buildKassajakso():n kautta. Yhden rivin
// poisto pitää datan siis automaattisesti yhtenäisenä kaikkialla — ei uutta
// "hoidettu"-kenttää, ei arkistoa. Koskee vain kertaluonteisia; säännöllisiin
// rahavirtoihin ei kosketa.
function _tulevatItemIsActiveEndCondition(itemId) {
  if (itemId == null) return false;
  var rules = loadKassajaksoRules();
  if (!rules || rules.strategy !== 'rules') return false;
  var conditions = Array.isArray(rules.endConditions) ? rules.endConditions : [];
  return conditions.some(function(c) { return c.type === 'itemRef' && c.source === 'tulevat_items' && c.id === itemId; });
}

window.rahavirtaKuittausConfirm = function(checkboxEl, itemKey) {
  var existing = document.getElementById('rahavirta-kuittaus-overlay');
  if (existing) existing.remove();

  // itemKey on idx:-fallback vain riveillä joilla ei ole id:tä lainkaan —
  // tällaiseen riviin ei voi viitata itemRef-päättymisehdolla, joten
  // varoitus tarkistetaan vain kun itemKey on todellinen id.
  var isEndCondition = (typeof itemKey === 'string' && itemKey.indexOf('idx:') !== 0)
    && _tulevatItemIsActiveEndCondition(itemKey);

  function cancel() {
    checkboxEl.checked = false;
    overlay.remove();
  }

  var overlay = document.createElement('div');
  overlay.id = 'rahavirta-kuittaus-overlay';
  overlay.style.cssText = 'position:fixed;inset:0;z-index:600;background:rgba(0,0,0,0.6);'
    + 'display:flex;align-items:center;justify-content:center;padding:16px;';
  overlay.addEventListener('click', function(e) { if (e.target === overlay) cancel(); });

  var box = document.createElement('div');
  box.style.cssText = 'background:var(--surface);border:1px solid var(--border-bright);border-radius:12px;'
    + 'padding:18px 20px;max-width:min(320px,92vw);box-shadow:0 8px 32px rgba(0,0,0,0.5);';

  var warningHtml = isEndCondition
    ? '<div style="font-size:12px;color:var(--text2);background:rgba(255,255,255,0.04);border:1px solid var(--border);border-radius:6px;padding:8px 10px;margin-bottom:12px;">'
      + '<div style="font-weight:700;color:var(--card-primary,var(--text));margin-bottom:4px;">Huomio</div>'
      + 'Tämä rahavirta on tällä hetkellä yksi kassajakson päättymisehdoista. Jos merkitset sen hoidetuksi, kassajakso lasketaan uudelleen.'
      + '</div>'
    : '';

  box.innerHTML = warningHtml
    + '<div style="font-size:13px;color:var(--text);margin-bottom:6px;">Merkitäänkö tämä rahavirta hoidetuksi?</div>'
    + '<div style="font-size:12px;color:var(--text2);margin-bottom:16px;">Hoidettu rahavirta poistuu tulevista rahavirroista ja kassajakso lasketaan uudelleen.</div>'
    + '<div style="display:flex;gap:8px;justify-content:flex-end;">'
    + '<button id="rv-kuittaus-cancel" class="kassa-cancel-btn">Peruuta</button>'
    + '<button id="rv-kuittaus-confirm" class="kassa-save-btn">Merkitse hoidetuksi</button>'
    + '</div>';

  overlay.appendChild(box);
  document.body.appendChild(overlay);
  box.querySelector('#rv-kuittaus-cancel').addEventListener('click', cancel);
  box.querySelector('#rv-kuittaus-confirm').addEventListener('click', function() {
    overlay.remove();
    rahavirtaKuittausApply(itemKey);
  });
};

// Poistaa kuitatun kertaluonteisen rivin tulevat_items-taulukosta — sama
// idx:/id-fallback-kaava kuin rahavirtaEditorDelete/panelTuloDelete/
// panelMenoDelete.
window.rahavirtaKuittausApply = async function(itemKey) {
  var snaps = (await DB.getAll('snapshots')).sort(function(a, b) { return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = Object.assign({}, snaps[snaps.length - 1]);
  var items = Array.isArray(latest.tulevat_items) ? latest.tulevat_items.slice() : [];
  var idx = (typeof itemKey === 'string' && itemKey.indexOf('idx:') === 0)
    ? parseInt(itemKey.slice(4), 10)
    : items.findIndex(function(x) { return x.id === itemKey; });
  if (idx >= 0 && idx < items.length) items.splice(idx, 1);
  latest.tulevat_items = items;
  latest._updatedAt = new Date().toISOString();
  await DB.putSnapshot(latest);
  try { setTimeout(function() { if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch (e) {}
  await renderDashboard();
};

// ── RAHAVIRTA: yhteinen "+ Lisää rahavirta" -editori (Tulossa / Säännöllinen tulo / Säännöllinen meno) ──

// Legacy-ilmoitus: näkyy vain jos snapshotilla on rahavirtoja ilman kelvollista
// paiva/month-kenttää. Painike avaa saman rahavirtaeditorin täydennystilassa
// ensimmäiselle löytyneelle riville — ilmoitus poistuu automaattisesti, kun
// findLegacyRahavirrat ei enää löydä yhtään riviä (renderDashboard laskee sen
// uudelleen jokaisella renderillä).
function renderLegacyNotice(latest) {
  var legacy = findLegacyRahavirrat(latest);
  if (!legacy.length) return '';
  var first = legacy[0];
  var kentta = first.source === 'tulevat_items' ? 'kuukausi' : 'päivä';
  return '<div class="panel-row" style="flex-direction:column;align-items:flex-start;gap:6px;margin-bottom:8px;padding:8px 10px;background:rgba(255,255,255,0.03);border:1px solid var(--border);border-radius:6px;">'
    + '<span style="font-size:12px;color:var(--text2);">' + legacy.length + ' rahavirralta puuttuu päivä tai kuukausi. Ne eivät vielä osallistu kassalaskentaan.</span>'
    + '<button class="kassa-add-btn" onclick="rahavirtaEditorOpenLegacy(\'' + first.source + '\',\'' + escAttr(first.key) + '\')">Täydennä tiedot</button>'
    + '</div>';
}

function escAttr(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/'/g, '&#39;');
}

function findRahavirtaItem(latest, source, key) {
  var items = Array.isArray(latest[source]) ? latest[source] : [];
  if (typeof key === 'string' && key.indexOf('idx:') === 0) {
    return items[parseInt(key.slice(4), 10)] || null;
  }
  for (var i = 0; i < items.length; i++) {
    if (items[i].id === key) return items[i];
  }
  return null;
}

// Päivittää olemassa olevan rahavirran paikallaan (säilyttää id:n ja muut
// kentät) sen sijaan että lisäisi uuden rivin — käytössä legacy-täydennyksessä.
function applyRahavirtaEdit(items, key, fields) {
  var idx;
  if (typeof key === 'string' && key.indexOf('idx:') === 0) {
    idx = parseInt(key.slice(4), 10);
  } else {
    idx = items.findIndex(function(x) { return x.id === key; });
  }
  if (idx < 0 || idx >= items.length) return false;
  items[idx] = Object.assign({}, items[idx], fields);
  return true;
}

// Poistaa rivin annetusta listasta paikallaan latest-objektissa — käytössä kun
// rahavirran tyyppi tai suunta muuttuu muokkauksessa niin, että rivi siirtyy
// toiseen tauluun (ks. rahavirtaEditorSave). Sama idx:-fallback kuin
// applyRahavirtaEdit/rahavirtaEditorDelete.
function removeRahavirtaItem(latest, source, key) {
  var items = Array.isArray(latest[source]) ? latest[source].slice() : [];
  var idx = (typeof key === 'string' && key.indexOf('idx:') === 0)
    ? parseInt(key.slice(4), 10)
    : items.findIndex(function(x) { return x.id === key; });
  if (idx >= 0 && idx < items.length) items.splice(idx, 1);
  latest[source] = items;
  if (source === 'tulot_items') {
    latest.tulot_kk = items.reduce(function(s, x) { return s + (Number(x.amt_kk) || 0); }, 0);
  }
}

function renderRahavirtaEditor(latest) {
  if (!window._rahavirtaEditorOpen) {
    return '<div style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.07);">'
      + renderLegacyNotice(latest)
      + '<button class="kassa-add-btn" onclick="rahavirtaEditorOpen()">+ Lisää rahavirta</button>'
      + '</div>';
  }
  var editTarget = window._rahavirtaEditTarget || null;
  var prefill = null;
  if (editTarget) {
    var item = findRahavirtaItem(latest, editTarget.source, editTarget.key);
    if (item) {
      var isFullEdit = editTarget.mode === 'edit';
      var isOnceType = editTarget.source === 'tulevat_items';
      // Täydessä muokkaustilassa sekä Tulo/Meno-suunta että Säännöllinen-tyyppi
      // ovat muokattavissa kaikilla riveillä (ks. rahavirtaEditorSave, joka
      // siirtää rivin tarvittaessa oikeaan tauluun). Legacy-täydennyksessä
      // molemmat pysyvät lukittuina rivin alkuperäiseen listaan, kuten ennenkin.
      prefill = {
        readonly: !isFullEdit,
        lockSign: !isFullEdit,
        label: item.label,
        amount: (isFullEdit && isOnceType && item.amount != null) ? Math.abs(item.amount) : item.amount,
        amt_kk: item.amt_kk,
        repeatEveryMonths: isOnceType ? null : (item.repeat_every_months || 1)
      };
      if (isFullEdit) {
        var refDate = new Date((latest.date || '') + 'T00:00:00');
        if (isNaN(refDate.getTime())) refDate = new Date();
        if (isOnceType && item.month) {
          prefill.date = refDate.getFullYear() + '-' + String(item.month).padStart(2, '0') + '-01';
        } else if (!isOnceType) {
          var prefillDay = validRecurringDay(item.paiva);
          if (prefillDay !== null) {
            var py = refDate.getFullYear(), pm = refDate.getMonth();
            var lastOfPm = new Date(py, pm + 1, 0).getDate();
            prefill.date = py + '-' + String(pm + 1).padStart(2, '0') + '-' + String(Math.min(prefillDay, lastOfPm)).padStart(2, '0');
          }
        }
      }
    }
  }
  var html = '<div class="kassa-tulossa-form" id="kassaRahavirtaSection" style="margin-top:8px;padding-top:8px;border-top:1px dashed rgba(255,255,255,0.07);">';
  html += '<div class="kassa-section-hdr">' + (editTarget ? (editTarget.mode === 'edit' ? 'MUOKKAA RAHAVIRTAA' : 'TÄYDENNÄ TIEDOT') : 'LISÄÄ RAHAVIRTA') + '</div>';
  html += renderRahavirtaFields(prefill);
  html += '<div class="kassa-action-row">'
    + '<button class="kassa-save-btn" onclick="rahavirtaEditorSave()">✓ Tallenna</button>'
    + '<button class="kassa-cancel-btn" onclick="rahavirtaEditorCancel()">✕ Peru</button>'
    + (editTarget && editTarget.mode === 'edit' ? '<button class="kassa-delete-btn" onclick="rahavirtaEditorDelete()">🗑 Poista</button>' : '')
    + '</div>';
  html += '</div>';
  return html;
}

// Yksi yhtenäinen lomake kaikille rahavirroille: käyttäjä ei valitse etukäteen
// "Tulossa / Säännöllinen tulo / Säännöllinen meno" -tyyppiä, vaan täyttää
// Nimi + Summa + Tyyppi (+/-) + Päivämäärä + Säännöllinen ✓. "Säännöllinen"
// on pelkkää metadataa: se ratkaisee mihin kolmesta olemassa olevasta
// listasta (tulot_items / rytmi_items / tulevat_items) rivi tallentuu, mutta
// ei muuta kassalaskentaa — samat kolme listaa ja sama collectRahavirrat-
// logiikka kuin ennenkin.
function renderRahavirtaFields(prefill) {
  var ro = (prefill && prefill.readonly) ? ' readonly' : '';
  // "Säännöllinen"-valinta lukitaan vain legacy-täydennyksessä (prefill.readonly),
  // jossa tyyppi pysyy rivin alkuperäisen listan mukaisena. Täydessä muokkaustilassa
  // (mode:'edit') ja uutta rahavirtaa lisättäessä se on muokattavissa — rahavirtaEditorSave
  // siirtää rivin tarvittaessa oikeaan tauluun, jos tyyppi tai suunta vaihtuu.
  var regularLockAttr = (prefill && prefill.readonly) ? ' disabled' : '';
  var signLockAttr = (prefill && prefill.lockSign) ? ' disabled' : '';
  var regular = !!window._rahavirtaRegular;
  var sign = window._rahavirtaSign || '+';
  var labelVal = (prefill && prefill.label != null) ? escAttr(prefill.label) : '';
  var amountRaw = prefill ? (prefill.amt_kk != null ? prefill.amt_kk : prefill.amount) : null;
  var amountVal = (amountRaw != null) ? escAttr(amountRaw) : '';
  var dateVal = (prefill && prefill.date) ? escAttr(prefill.date) : '';
  var repeatVal = (prefill && prefill.repeatEveryMonths) ? prefill.repeatEveryMonths : 1;

  function signRadio(val, label) {
    return '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2);cursor:pointer;">'
      + '<input type="radio" name="rv_sign" value="' + val + '"' + (sign === val ? ' checked' : '') + signLockAttr + ' onchange="rahavirtaSignChange(this.value)"> ' + label
      + '</label>';
  }

  var html = '<div class="kassa-field-group"><label class="kassa-field-label">Nimi</label>'
    + '<input class="kassa-edit-input" id="rv_label" placeholder="esim. Palkka" value="' + labelVal + '"' + ro + '></div>';
  html += '<div class="kassa-field-group"><label class="kassa-field-label">Summa (€)</label>'
    + '<input class="kassa-edit-input" id="rv_amount" type="number" inputmode="decimal" placeholder="esim. 450" value="' + amountVal + '"' + ro + '></div>';
  html += '<div class="kassa-field-group"><label class="kassa-field-label">Tyyppi</label>'
    + '<div style="display:flex;gap:16px;">' + signRadio('+', '(+) Tulo') + signRadio('-', '(−) Meno') + '</div></div>';
  // UI käyttää yhtä date-kenttää sekä kertaluonteisille että säännöllisille
  // rahavirroille. Nykyinen tietomalli tallentaa kuitenkin:
  // - tulevat_items -> vain kuukauden
  // - tulot_items / rytmi_items -> vain kuukauden päivän
  // Hero- ja Kassajakso-logiikka säilytetään ennallaan.
  html += '<div class="kassa-field-group"><label class="kassa-field-label">Päivämäärä</label>'
    + '<input class="kassa-edit-input" id="rv_date" type="date"' + (dateVal ? ' value="' + dateVal + '"' : '') + '></div>';
  html += '<label style="display:flex;align-items:center;gap:6px;font-size:12px;color:var(--text2);cursor:pointer;margin-top:2px;">'
    + '<input type="checkbox" id="rv_regular"' + (regular ? ' checked' : '') + regularLockAttr + ' onchange="rahavirtaRegularChange(this.checked)"> Säännöllinen'
    + '</label>';
  // Toistuvuus koskee vain säännöllisiä rahavirtoja (tulot_items/rytmi_items) —
  // kertaluonteisilla (tulevat_items) kenttä pysyy piilossa. Näkyvyys ohjataan
  // suoraan DOM:sta (ks. rahavirtaRegularChange) ilman koko lomakkeen
  // uudelleenrenderöintiä, jotta jo kirjoitetut kentät eivät katoa.
  var repeatOptions = [[1, 'Joka kuukausi'], [2, 'Joka 2. kuukausi'], [3, 'Joka 3. kuukausi'], [4, 'Joka 4. kuukausi'], [6, 'Puolivuosittain'], [12, 'Vuosittain']];
  var repeatOptsHtml = repeatOptions.map(function(o) {
    return '<option value="' + o[0] + '"' + (Number(repeatVal) === o[0] ? ' selected' : '') + '>' + o[1] + '</option>';
  }).join('');
  html += '<div class="kassa-field-group" id="rv_repeat_group" style="' + (regular ? '' : 'display:none;') + '">'
    + '<label class="kassa-field-label">Toistuvuus</label>'
    + '<select class="kassa-edit-select" id="rv_repeat">' + repeatOptsHtml + '</select></div>';
  return html;
}

window.rahavirtaSignChange = function(val) {
  window._rahavirtaSign = val;
};

window.rahavirtaRegularChange = function(checked) {
  window._rahavirtaRegular = checked;
  var repeatGroup = document.getElementById('rv_repeat_group');
  if (repeatGroup) repeatGroup.style.display = checked ? '' : 'none';
};

window.rahavirtaEditorOpen = async function() {
  window._rahavirtaEditorOpen = true;
  window._rahavirtaEditTarget = null;
  if (window._rahavirtaRegular == null) window._rahavirtaRegular = false;
  if (!window._rahavirtaSign) window._rahavirtaSign = '+';
  await renderDashboard();
  _rahavirtaFocusAndScroll('rv_label');
};

// Avaa rahavirtaeditorin täydennystilassa yhdelle legacy-riville: nimi/summa
// esitäytetään ja lukitaan, käyttäjä täyttää vain puuttuvan päivämäärän.
// Tyyppi ja Säännöllinen lukitaan rivin alkuperäisen listan mukaan eikä niitä
// voi muuttaa täydennyksen yhteydessä. Tallennus kulkee tavallisen
// rahavirtaEditorSaven kautta.
window.rahavirtaEditorOpenLegacy = async function(source, key) {
  var cfgMap = {
    tulot_items:   { regular: true,  sign: '+' },
    rytmi_items:   { regular: true,  sign: '-' },
    tulevat_items: { regular: false, sign: '+' }
  };
  var cfg = cfgMap[source] || { regular: false, sign: '+' };
  window._rahavirtaEditorOpen = true;
  window._rahavirtaRegular = cfg.regular;
  window._rahavirtaSign = cfg.sign;
  window._rahavirtaEditTarget = { source: source, key: key };
  await renderDashboard();
  _rahavirtaFocusAndScroll('rv_date');
};

// Avaa rahavirtaeditorin täydessä muokkaustilassa olemassa olevalle rahavirralle,
// oli se kertaluonteinen (tulevat_items) tai säännöllinen (tulot_items/rytmi_items).
// Nimi, summa, tulo/meno (vain tulevat_items) ja päivä/kuukausi ovat muokattavissa
// samalla lomakkeella ja samalla tallennuslogiikalla kuin uutta rahavirtaa
// lisättäessä (rahavirtaEditorSave). "Säännöllinen"-valinta pysyy aina lukittuna,
// koska rivin lista (=tyyppi) ei vaihdu muokkauksen yhteydessä.
window.rahavirtaEditorOpenEdit = async function(source, key) {
  var snaps = (await DB.getAll('snapshots')).sort(function(a, b) { return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = snaps[snaps.length - 1];
  var item = findRahavirtaItem(latest, source, key);
  if (!item) return;
  var signMap = { tulot_items: '+', rytmi_items: '-' };
  window._rahavirtaEditorOpen = true;
  window._rahavirtaRegular = (source !== 'tulevat_items');
  window._rahavirtaSign = signMap[source] || ((Number(item.amount) < 0) ? '-' : '+');
  window._rahavirtaEditTarget = { source: source, key: key, mode: 'edit' };
  await renderDashboard();
  _rahavirtaFocusAndScroll('rv_label');
};

window.rahavirtaEditorCancel = async function() {
  window._rahavirtaEditorOpen = false;
  window._rahavirtaEditTarget = null;
  await renderDashboard();
};

// Poistaa editorissa parhaillaan auki olevan rahavirran. Toimii vain täydessä
// muokkaustilassa (mode:'edit') — legacy-täydennyksellä tai uuden rahavirran
// lisäyksellä ei ole poistettavaa riviä.
window.rahavirtaEditorDelete = async function() {
  var editTarget = window._rahavirtaEditTarget;
  if (!editTarget || editTarget.mode !== 'edit') return;
  var snaps = (await DB.getAll('snapshots')).sort(function(a, b) { return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = Object.assign({}, snaps[snaps.length - 1]);
  var items = Array.isArray(latest[editTarget.source]) ? latest[editTarget.source].slice() : [];
  // Sama idx:-fallback kuin findRahavirtaItem/applyRahavirtaEdit — id:ttömät
  // rivit tunnistetaan alkuperäisellä taulukkoindeksillä.
  var idx = (typeof editTarget.key === 'string' && editTarget.key.indexOf('idx:') === 0)
    ? parseInt(editTarget.key.slice(4), 10)
    : items.findIndex(function(i) { return i.id === editTarget.key; });
  if (idx >= 0 && idx < items.length) items.splice(idx, 1);
  latest[editTarget.source] = items;
  latest._updatedAt = new Date().toISOString();
  await DB.putSnapshot(latest);
  window._rahavirtaEditorOpen = false;
  window._rahavirtaEditTarget = null;
  try { setTimeout(function(){ if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch(e) {}
  await renderDashboard();
};

function _rahavirtaFocusAndScroll(focusId) {
  var section = document.getElementById('kassaRahavirtaSection');
  var inp = document.getElementById(focusId || 'rv_label');
  if (!inp) return;
  if (!section || window.innerWidth >= 900) {
    inp.focus();
    return;
  }
  // iOS Safari: natiivi fokus-scroll kilpailee oman scroll-korjauksemme kanssa ja
  // aiheuttaa näkymän hyppäämisen. preventScroll poistaa natiivin scrollin, jonka
  // jälkeen omamme rAF:ssä laskettu korjaus on ainoa scroll joka tapahtuu.
  inp.focus({ preventScroll: true });
  requestAnimationFrame(function() {
    var r = section.getBoundingClientRect();
    var navEl = document.getElementById('nav');
    var topLimit = navEl ? navEl.getBoundingClientRect().bottom : 0;
    var dy = r.top - topLimit;
    if (dy) window.scrollBy(0, dy);
  });
}

window.rahavirtaEditorSave = async function() {
  var editTarget = window._rahavirtaEditTarget || null;
  var labelEl = document.getElementById('rv_label');
  var label = ((labelEl && labelEl.value) || '').trim();
  if (!label) { if (labelEl) labelEl.focus(); return; }

  var amountEl = document.getElementById('rv_amount');
  var amountRaw = parseFloat(((amountEl && amountEl.value) || '').replace(',', '.'));
  if (isNaN(amountRaw)) { if (amountEl) amountEl.focus(); return; }

  // Yhdestä Päivämäärä-kentästä poimitaan kuukausi (tulossa) tai kuukauden
  // päivä (tulo/meno) — ks. perustelu renderRahavirtaFieldsin kommentissa.
  var dateEl = document.getElementById('rv_date');
  var dateMatch = /^(\d{4})-(\d{2})-(\d{2})$/.exec((dateEl && dateEl.value) || '');
  if (!dateMatch) { if (dateEl) dateEl.focus(); return; }
  var monthNum = parseInt(dateMatch[2], 10);
  var dayNum = parseInt(dateMatch[3], 10);

  // Legacy-täydennystilassa (editTarget ilman mode:'edit') tyyppi tulee aina
  // rivin alkuperäisestä listasta, koska lomakkeen Tyyppi/Säännöllinen-kontrollit
  // ovat siellä lukittuja. Täydessä muokkaustilassa (mode:'edit') ja uutta
  // rahavirtaa lisättäessä tyyppi tulee lomakkeen valinnoista — käyttäjä voi
  // siis vaihtaa sekä rahavirran tyypin (kertaluonteinen/säännöllinen) että
  // suunnan (tulo/meno) muokkauksen yhteydessä.
  var typeMap = { tulot_items: 'tulo', rytmi_items: 'meno', tulevat_items: 'tulossa' };
  var sourceMap = { tulo: 'tulot_items', meno: 'rytmi_items', tulossa: 'tulevat_items' };
  var sign = window._rahavirtaSign || '+';
  var regular = !!window._rahavirtaRegular;
  var isLegacyComplete = !!(editTarget && editTarget.mode !== 'edit');
  var type = isLegacyComplete ? (typeMap[editTarget.source] || 'tulossa') : (regular ? (sign === '-' ? 'meno' : 'tulo') : 'tulossa');
  var targetSource = sourceMap[type];
  // Jos käyttäjä vaihtoi tyypin tai suunnan niin ettei rivi enää kuulu
  // alkuperäiseen listaan, se siirretään: uusi rivi lisätään oikeaan tauluun
  // ja vanha poistetaan alkuperäisestä vasta sen jälkeen, ettei duplikaatteja synny.
  var movedFrom = (editTarget && editTarget.source !== targetSource) ? editTarget.source : null;
  var sameListEdit = editTarget && !movedFrom;

  var snaps = (await DB.getAll('snapshots')).sort(function(a,b){ return a.date.localeCompare(b.date); });
  if (!snaps.length) return;
  var latest = Object.assign({}, snaps[snaps.length - 1]);

  // Siirrettävän rivin alkuperäinen id säilytetään mahdollisuuksien mukaan,
  // jotta muokkaus ei hävitä tietoa vaikka rivi vaihtaa taulukkoa.
  var movedItem = movedFrom ? findRahavirtaItem(latest, movedFrom, editTarget.key) : null;
  var preservedId = (movedItem && movedItem.id != null) ? movedItem.id : null;

  if (type === 'tulossa') {
    // Legacy-täydennystilassa (editTarget ilman mode:'edit') säilytetään rivin
    // alkuperäinen, mahdollisesti negatiivinen summa sellaisenaan — kenttä on
    // siellä lukittu eikä käyttäjä muokkaa sitä. Uudella rivillä ja täydessä
    // muokkaustilassa (mode:'edit') summa normalisoidaan aina itseisarvona,
    // suunta tulee yksinomaan Tyyppi-valinnasta — sama periaate molemmissa.
    var amount = isLegacyComplete ? amountRaw : (sign === '-' ? -Math.abs(amountRaw) : Math.abs(amountRaw));
    var tulossaItems = Array.isArray(latest.tulevat_items) ? latest.tulevat_items.slice() : [];
    if (sameListEdit) {
      applyRahavirtaEdit(tulossaItems, editTarget.key, { label: label, month: monthNum, amount: amount });
    } else {
      tulossaItems.push({ id: preservedId || ('tulossa_' + Date.now()), month: monthNum, label: label, amount: amount });
    }
    latest.tulevat_items = tulossaItems;
  } else {
    // Sama normalisointi kuin tulossa-haarassa: summa tulkitaan aina itseisarvona,
    // suunta tulee yksinomaan Tulo/Meno-radiovalinnasta. Käyttäjä voi siis kirjoittaa
    // Summa-kenttään 900 tai -900 — molemmat tallentuvat samana rahamääränä.
    var amtKk = Math.abs(amountRaw);
    var paiva = dayNum;
    var repeatEl = document.getElementById('rv_repeat');
    var repeatEveryMonths = parseInt((repeatEl && repeatEl.value) || '1', 10) || 1;
    if (type === 'tulo') {
      var tulotItems = Array.isArray(latest.tulot_items) ? latest.tulot_items.slice() : [];
      if (sameListEdit) {
        applyRahavirtaEdit(tulotItems, editTarget.key, { label: label, amt_kk: amtKk, paiva: paiva, repeat_every_months: repeatEveryMonths });
      } else {
        tulotItems.push({ id: preservedId || ('tulo_' + Date.now()), label: label, amt_kk: amtKk, paiva: paiva, repeat_every_months: repeatEveryMonths });
      }
      latest.tulot_items = tulotItems;
      latest.tulot_kk = tulotItems.reduce(function(s,x){ return s + (Number(x.amt_kk) || 0); }, 0);
    } else {
      var menotItems = Array.isArray(latest.rytmi_items) ? latest.rytmi_items.slice() : [];
      if (sameListEdit) {
        applyRahavirtaEdit(menotItems, editTarget.key, { label: label, amt_kk: amtKk, paiva: paiva, repeat_every_months: repeatEveryMonths });
      } else {
        menotItems.push({ id: preservedId || ('meno_' + Date.now()), label: label, amt_kk: amtKk, paiva: paiva, repeat_every_months: repeatEveryMonths });
      }
      latest.rytmi_items = menotItems;
    }
  }

  if (movedFrom) {
    removeRahavirtaItem(latest, movedFrom, editTarget.key);
  }

  latest._updatedAt = new Date().toISOString();
  await DB.putSnapshot(latest);
  window._rahavirtaEditorOpen = false;
  window._rahavirtaEditTarget = null;
  try { setTimeout(function(){ if (typeof syncToSupabase === 'function') syncToSupabase([latest]); }, 500); } catch(e) {}
  await renderDashboard();
};
