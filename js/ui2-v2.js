// ═══════════════════════════════════════════════
// FINANCIAL HEARTBEAT CARD  (Sprint 5 v3)
// ═══════════════════════════════════════════════
function renderHeartbeatCard(sig) {
  if (!sig) return '';
  const hb = sig.heartbeat, tempo = sig.tempo, cycle = sig.cycle, runway = sig.runway, direction = sig.direction;

  const tempoBar = tempo ? (function() {
    var pct = Math.min(tempo.tempo, 200);
    var barPct = Math.round(pct / 2);
    var barColor = pct > 130 ? '#c05a5a' : pct > 105 ? '#b8956a' : '#5a9e6a';
    return '<div style="margin-top:14px;">'
      + '<div style="display:flex;justify-content:space-between;font-size:10px;color:var(--text3);letter-spacing:.06em;text-transform:uppercase;margin-bottom:4px;">'
      + '<span>Kulutustempo · pv ' + tempo.dayNum + '</span>'
      + '<span style="color:' + barColor + ';font-weight:700;">' + tempo.tempo + ' %</span></div>'
      + '<div style="position:relative;height:20px;background:rgba(0,0,0,0.25);border-radius:5px;overflow:hidden;">'
      + '<div style="position:absolute;left:50%;top:0;bottom:0;width:1px;background:rgba(255,255,255,0.1);"></div>'
      + '<div style="position:absolute;left:0;top:0;bottom:0;width:' + barPct + '%;background:' + barColor + ';opacity:0.65;border-radius:5px;transition:width .4s;"></div>'
      + '<div style="position:absolute;inset:0;display:flex;align-items:center;padding:0 8px;justify-content:space-between;">'
      + '<span style="font-family:var(--mono);font-size:11px;color:#fff;font-weight:600;">' + fmt(-tempo.curSpend) + '</span>'
      + '<span style="font-size:10px;color:rgba(255,255,255,0.35);">ka. ' + fmt(-tempo.paceAvg) + '</span>'
      + '</div></div></div>';
  })() : '';

  var cycleBlock = '';
  if (cycle) {
    var cash = cycle.cashBalance, card = cycle.cardBalance, net = cycle.net, days = cycle.daysUntilDue;
    var netClr = net >= 0 ? 'var(--green)' : 'var(--text2)';
    var daysClr = days <= 3 ? '#c05a5a' : days <= 7 ? '#b8956a' : 'var(--text3)';
    var badge = cycle.cycleOk
      ? '<span style="color:#5a9e6a;font-size:10px;">● Koroton sykli</span>'
      : '<span style="color:#b8956a;font-size:10px;">○ Seuraa eräpäivää</span>';
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
    var rColor = months < 3 ? '#c05a5a' : months < 8 ? '#b8956a' : '#5a9e6a';
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
function _loanCfg(key, endsYear, monthly) {
  try {
    const cfg = JSON.parse(localStorage.getItem('loan_cfg_' + key) || '{}');
    return { endsYear: cfg.endsYear || endsYear, monthly: cfg.monthly || monthly };
  } catch(e) { return { endsYear, monthly }; }
}
function renderSitoumusCard(sig, latest, creditDebt, ltDebt) {
  var nowYear = new Date().getFullYear();

  var loanDefs = [
    Object.assign({ key:'asuntolaina',          label:'As.laina'    }, _loanCfg('asuntolaina',          2029, 200)),
    Object.assign({ key:'autolaina',            label:'Autolaina'   }, _loanCfg('autolaina',            2027, 255)),
    Object.assign({ key:'asuntolaina_remontti', label:'As.remontti' }, _loanCfg('asuntolaina_remontti', 2026, 170)),
  ];

  // % muutos vs ed. kk
  var lainatPct = (typeof _lainatPrevPct !== 'undefined') ? _lainatPrevPct : null;
  var lainatBadge = lainatPct !== null
    ? ' <span style="font-size:10px;color:'+(lainatPct<=0?'var(--green)':'var(--text3)')+';">'
      +(lainatPct>=0?'+':'')+lainatPct.toFixed(1)+'% vs ed. kk</span>'
    : '';

  // Yksinkertaiset laina-rivit — grid estää rivinvaihdon
  var loanRows = '';
  loanDefs.forEach(function(ld) {
    var bal = latest[ld.key];
    if (!bal || Math.abs(bal) < 10) return;
    var yLeft = ld.endsYear - nowYear;
    var yearClr = yLeft <= 1 ? '#5a9e6a' : yLeft <= 3 ? '#b8956a' : 'var(--text3)';
    loanRows += '<div style="display:grid;grid-template-columns:1fr auto auto;'
      +'gap:6px;align-items:baseline;margin-bottom:7px;min-width:0;">'
      +'<span style="font-size:12px;color:var(--text2);white-space:nowrap;'
      +'overflow:hidden;text-overflow:ellipsis;">'+ld.label+'</span>'
      +'<span style="font-family:var(--mono);font-size:12px;color:var(--text2);'
      +'white-space:nowrap;text-align:right;">'+fmt(bal)+'</span>'
      +'<span style="font-size:10px;color:'+yearClr+';white-space:nowrap;">'
      +'\u2192\u00a0'+ld.endsYear+'</span>'
      +'</div>';
  });

  return '<div class="db-item card" data-item-id="debt">'
    + _cardHeader('Pitkät velat', 'debt', [
      {key:'asuntolaina', label:'As.laina'},
      {key:'autolaina',   label:'Autolaina'},
      {key:'asremontti',  label:'As.remontti'},
    ])
    + '<div style="font-family:var(--mono);font-size:26px;font-weight:700;'
    + 'color:#6b7280;margin-bottom:12px;">'+fmt(-ltDebt)+lainatBadge+'</div>'
    + (_pref('debt','expanded',true) ? loanRows
       : '<div style="font-size:11px;color:var(--text3);margin-top:2px;">'
         + loanDefs.filter(l=>latest[l.key]&&Math.abs(latest[l.key])>10)
             .map(l=>'→ '+l.endsYear).join(' · ')
         + '</div>')
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
    + '<span style="font-family:var(--mono);font-size:13px;font-weight:700;color:var(--gold);">'
    + _fK(-stDebtMobile) + '</span></div>'
    + '<div style="display:flex;justify-content:space-between;align-items:baseline;">'
    + '<span style="font-size:10px;color:var(--text3);">Lainat</span>'
    + '<span style="font-family:var(--mono);font-size:13px;font-weight:700;color:#6b7280;">'
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

    var devColor = '#5a9e6a', devLabel = 'Normaali sykli';
    if (devPct !== null) {
      if (devPct > 10)       { devColor = '#5a9e6a'; devLabel = '+'+devPct+' % parempi kuin normaali'; }
      else if (devPct < -10) { devColor = '#b8956a'; devLabel = Math.abs(devPct)+' % yli normaalin'; }
    }

    const cycLabel = cycle ? (cycle.cycleOk
      ? '<span style="color:#5a9e6a;font-size:10px;">● Koroton · eräp. '+cycle.daysUntilDue+' pv</span>'
      : '<span style="color:#b8956a;font-size:10px;">○ Eräp. '+cycle.daysUntilDue+' pv</span>') : '';

    rytmiBlock = '<div style="background:var(--surface);border:1px solid var(--border);'
      +'border-radius:10px;padding:11px 13px;margin-bottom:8px;">'
      +'<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;">'
      +'<span style="font-size:9px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">● Tulotili − käyttöluotto</span>'
      +cycLabel+'</div>'
      // Tulotili
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">'
      +'<span style="font-size:11px;color:var(--text3);">Tulotili</span>'
      +'<span style="font-family:var(--mono);font-size:13px;color:var(--text2);">'+fmt(tulotili)+'</span>'
      +'</div>'
      // OP Gold
      +'<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:4px;">'
      +'<span style="font-size:11px;color:var(--text3);">OP Gold</span>'
      +'<span style="font-family:var(--mono);font-size:13px;color:var(--gold);">'+fmt(-opGold)+'</span>'
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
    const yClr  = yLeft <= 1 ? '#5a9e6a' : yLeft <= 3 ? '#b8956a' : 'var(--text3)';
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
      +'<div style="font-size:12px;color:#5a9e6a;font-weight:600;">+'+fmt(ld.monthly)+'/kk</div>'
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
          +'<div style="font-size:11px;color:#5a9e6a;font-weight:600;">⬆ Yhteensä +'+fmt(totalFree)+'/kk vapautuu</div>'
          +'</div>' : '')
      +'</div>';
  }

  // ── 5. RESERVI ───────────────────────────────
  const rClr = runway ? (runway.months < 3 ? '#c05a5a' : runway.months < 8 ? '#b8956a' : '#5a9e6a') : 'var(--text3)';
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
  renderDashboard();
};
window.toggleCardPct = function(card) {
  _setCardPref(card, 'showPct', !_pref(card, 'showPct', true));
  renderDashboard();
};
window.toggleCardRow = function(card, row) {
  _setCardPref(card, 'row_'+row, !_pref(card, 'row_'+row, true));
  renderDashboard();
};
window.toggleCardVisible = function(card) {
  _setCardPref(card, 'visible', !_pref(card, 'visible', true));
  renderDashboard();
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

  // Näytä kortti toggle
  var visLbl = document.createElement('label');
  visLbl.style.cssText = 'display:flex;align-items:center;gap:8px;padding:4px 0;cursor:pointer;font-size:12px;color:var(--text2);';
  var visCb = document.createElement('input');
  visCb.type = 'checkbox'; visCb.checked = _pref(card, 'visible', true);
  visCb.style.cssText = 'width:14px;height:14px;accent-color:var(--cyan);';
  visCb.addEventListener('change', function() { toggleCardVisible(card); });
  visLbl.appendChild(visCb); visLbl.appendChild(document.createTextNode('Näytä dashboardissa'));
  div.appendChild(visLbl);

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
function _cardHeader(label, cardKey, settingsRows) {
  var exp = _pref(cardKey, 'expanded', true);
  var pct = _pref(cardKey, 'showPct', true);
  var rows = settingsRows || [];
  var rowsJSON = JSON.stringify(rows).replace(/"/g, '&quot;');
  return '<div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:10px;">'
    + '<div class="card-label" style="margin-bottom:0;">' + label + '</div>'
    + '<div style="display:flex;gap:3px;align-items:center;">'
    // % toggle
    + '<button onclick="event.stopPropagation();toggleCardPct(\'' + cardKey + '\')" '
    + 'title="Muutosprosentit" style="font-size:10px;padding:2px 7px;border-radius:4px;'
    + 'border:1px solid var(--border);cursor:pointer;'
    + 'background:'+(pct?'rgba(0,200,255,0.1)':'transparent')+';'
    + 'color:'+(pct?'var(--cyan)':'var(--text3)')+';transition:all .12s;">%</button>'
    // Asetukset-ikoni
    + (rows.length > 0
      ? '<button onclick="event.stopPropagation();openCardSettings(\'' + cardKey + '\',\'' + label + '\',' + rowsJSON + ')" '
        + 'title="Asetukset" style="font-size:11px;padding:2px 7px;border-radius:4px;'
        + 'border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;">⋯</button>'
      : '')
    // Expand/collapse
    + '<button onclick="event.stopPropagation();toggleCardDetail(\'' + cardKey + '\')" '
    + 'title="Laajenna/tiivistä" style="font-size:12px;padding:2px 7px;border-radius:4px;'
    + 'border:1px solid var(--border);background:transparent;color:var(--text3);cursor:pointer;'
    + 'transition:all .12s;">'+(exp?'●':'○')+'</button>'
    + '</div></div>';
}

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
  const sig = (typeof computeAllSignals === 'function')
    ? computeAllSignals(snaps, latest, calc)
    : null;

  if (window.innerWidth < 580) {
    try {
      c.innerHTML = renderMobileDashboard(snaps, latest, calc, sig, cnt);
    } catch(e) {
      c.innerHTML = '<div style="padding:20px;color:#c05a5a;font-family:monospace;font-size:12px;line-height:1.8;">'
        + '⚠ Virhe: ' + e.message + '<br><br>'
        + '<button onclick="location.reload()" style="padding:10px 20px;background:#1a3a2a;border:1px solid #3a7a4a;color:#5a9e6a;border-radius:8px;font-size:14px;cursor:pointer;">↻ Lataa uudelleen</button>'
        + '</div>';
    }
    return;
  }

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
      <span style="display:flex;gap:8px;align-items:center;">
        ${backupStatusBadge()}
        ${syncStatusBadge()}
        <button onclick="rollbackLatestSnapshot()" style="font-size:10px;padding:3px 8px;
          background:rgba(255,100,100,0.06);border:1px solid rgba(255,100,100,0.15);
          border-radius:5px;color:#a07070;cursor:pointer;font-family:var(--mono);"
          title="Palauta edellinen snapshot">↩ rollback</button>
      </span>
    </div>
    <div id="freeze-status" style="display:none;margin:8px 0 12px;padding:8px 12px;
      border-radius:7px;font-family:'IBM Plex Mono',monospace;font-size:11px;
      background:rgba(90,158,106,.08);border:1px solid rgba(90,158,106,.25);color:#5a9e6a;">
    </div>

    <div id="layout-toolbar" style="display:flex;align-items:center;gap:8px;margin-bottom:10px;flex-wrap:wrap;"></div>
    <div id="all-cards-container" style="display:grid;grid-template-columns:repeat(3,1fr);gap:12px;margin-bottom:14px;align-items:start;">

      <!-- 1. SIJOITUKSET -->
      <div class="db-item card" data-item-id="inv">
        ${_cardHeader('Sijoitukset', 'inv', [
          {key:'nordnet',label:'Nordnet'},
          {key:'op',     label:'OP Osakkeet'},
          {key:'spankki',label:'S-Pankki'},
        ])}
        <div class="card-value" style="margin-top:0;">${fmt(inv)}</div>
        ${!_pref('inv','expanded',true) ? '<div style="font-size:11px;color:var(--text3);margin-top:2px;">'
          +(latest.nordnet?'Nordnet':'')+(latest.op_osakkeet?' · OP':'')+(latest.tapiola?' · S-Pankki':'')+'</div>' : ''}
        <div class="sub-rows" style="display:${_pref('inv','expanded',true)?'block':'none'}">
          ${(()=>{
            const invRows = [
              { f:'nordnet',     l:'Nordnet',  abbr:'NN'  },
              { f:'op_osakkeet', l:'OP',       abbr:'OP'  },
              { f:'tapiola',     l:'S-Pankki', abbr:'SP'  },
              { f:'s_sijoitus',  l:'S-Pankki', abbr:'SP'  },
              { f:'rahastot',    l:'Rahastot', abbr:'RAH' },
            ];
            const snap1d  = prev;
            const snap1mo = snapBefore(snaps, daysAgoISO(30));
            // Deduploi: näytä vain ensimmäinen löytyvä
            const shown = new Set();
            return invRows.filter(r => {
              if (!latest[r.f] || shown.has(r.l)) return false;
              shown.add(r.l); return true;
            }).filter(r => {
              // Per-rivi näkyvyys
              var rowKey = r.f === 'nordnet' ? 'nordnet' : r.f === 'op_osakkeet' ? 'op' : 'spankki';
              return _pref('inv', 'row_'+rowKey, true);
            }).map(r => {
              const cur  = latest[r.f];
              const v1d  = snap1d  ? snap1d[r.f]  : null;
              const v1mo = snap1mo ? snap1mo[r.f] : null;
              const p1d  = (v1d && v1d !== 0) ? ((cur-v1d)/Math.abs(v1d))*100 : null;
              const p1mo = (v1mo && v1mo !== 0) ? ((cur-v1mo)/Math.abs(v1mo))*100 : null;
              const pclr = p => p===null?'var(--text3)':Math.abs(p)<0.01?'var(--text3)':p>=0?'var(--green)':'var(--red)';
              const pfmt = p => p===null?'':((p>=0?'+':'')+p.toFixed(1)+'%');
              return '<div style="display:flex;justify-content:space-between;'
                +'align-items:baseline;margin-bottom:5px;min-width:0;">'
                +'<span style="font-size:11px;color:var(--text2);white-space:nowrap;'
                +'flex-shrink:0;margin-right:6px;">'+r.l+'</span>'
                +'<span style="display:flex;align-items:baseline;gap:5px;flex-shrink:0;">'
                +(_pref('inv','showPct',true)&&p1d!==null?'<span style="font-size:10px;color:'+pclr(p1d)+';white-space:nowrap;">'+pfmt(p1d)+'</span>':'')
                +(_pref('inv','showPct',true)&&p1mo!==null?'<span style="font-size:10px;color:'+pclr(p1mo)+';white-space:nowrap;">'+pfmt(p1mo)+'</span>':'')
                +'<span style="font-family:var(--mono);font-size:11px;white-space:nowrap;'
                +'color:var(--text);">'+fmt(cur)+'</span>'
                +'</span></div>';
            }).join('');
          })()}
        </div>
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
        return renderSitoumusCard(sig, latest, creditDebt, ltDebt);
      })()}

      <!-- 3. KÄYTTÖTILIT + OPERATIIVINEN RYTMI -->
      <div class="db-item card kpi-compact" data-item-id="cash">
        ${_cardHeader('Käyttötilit &amp; rytmi', 'cash', [
          {key:'tulotili',   label:'Tulotili'},
          {key:'spankki',    label:'S-Pankki'},
          {key:'tavoitetili',label:'Tavoitetili'},
          {key:'elatustili', label:'Elatustili'},
        ])}
        <div class="card-value" style="font-size:28px;color:var(--text2);">${fmt(cash)}</div>
        ${!_pref('cash','expanded',true) ? '<div style="font-size:11px;color:var(--text3);margin-top:2px;">Käyttövara '+(latest.tulotili&&latest.op_gold?fmt((latest.tulotili||0)-Math.abs(latest.op_gold||0)):'—')+'</div>' : ''}
        <div class="sub-rows" style="display:${_pref('cash','expanded',true)?'block':'none'}">
          ${(latest.tulotili !== undefined && _pref('cash','row_tulotili',true)) ? '<div class="sub-row"><span>Tulotili</span><span>' + fmt(latest.tulotili) + '</span></div>' : ''}
          ${(latest.s_pankki !== undefined && _pref('cash','row_spankki',true)) ? '<div class="sub-row"><span>S-Pankki</span><span>' + fmt(latest.s_pankki) + '</span></div>' : ''}
          ${(latest.tavoitetili !== undefined && _pref('cash','row_tavoitetili',true)) ? '<div class="sub-row"><span>Tavoitetili</span><span>' + fmt(latest.tavoitetili) + '</span></div>' : ''}
          ${(latest.elatustili !== undefined && _pref('cash','row_elatustili',true)) ? '<div class="sub-row"><span>Elatustili</span><span>' + fmt(latest.elatustili) + '</span></div>' : ''}
        </div>
        ${(()=>{
          if (latest.op_gold === undefined) return '';
          var opGold2    = Math.abs(latest.op_gold ?? 0);
          var tulotili2  = latest.tulotili ?? 0;
          var nettorytmi2 = tulotili2 - opGold2;
          var tempo2     = sig && sig.tempo;
          var baseline2  = tempo2 ? tempo2.paceAvg : null;
          var devEur2    = (baseline2 !== null) ? nettorytmi2 - baseline2 : null;
          var kayttovara = nettorytmi2;
          var kv2Color   = kayttovara >= 0 ? 'var(--green)' : '#b8956a';

          var html2 = '<div style="margin-top:12px;padding-top:10px;border-top:1px solid rgba(255,255,255,0.06);">'
            // Tulotili-rivi
            + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:5px;">'
            + '<span style="font-size:12px;color:var(--text3);">Tulotili</span>'
            + '<span style="font-family:var(--mono);font-size:13px;color:var(--text2);">'+fmt(tulotili2)+'</span>'
            + '</div>'
            // OP Gold -rivi
            + '<div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">'
            + '<span style="font-size:12px;color:var(--text3);">OP Gold</span>'
            + '<span style="font-family:var(--mono);font-size:13px;color:var(--gold);">'+fmt(-opGold2)+'</span>'
            + '</div>'
            // Viiva
            + '<div style="height:1px;background:rgba(255,255,255,0.06);margin-bottom:8px;"></div>'
            // Käyttövara
            + '<div style="display:flex;justify-content:space-between;align-items:baseline;">'
            + '<span style="font-size:12px;color:var(--text2);font-weight:600;">Käyttövara</span>'
            + '<div style="text-align:right;">'
            + '<span style="font-family:var(--mono);font-size:18px;font-weight:700;color:'+kv2Color+';">'+fmt(kayttovara)+'</span>'
            + (devEur2 !== null && Math.abs(devEur2) > 50
              ? '<div style="font-family:var(--mono);font-size:10px;color:var(--text3);margin-top:1px;">'
                +(devEur2>0?'+':'')+fmt(devEur2)+' vs. normaali</div>'
              : '')
            + '</div>'
            + '</div>'
            + '</div>';

          // Tulorytmi-vihje
          var tlot2 = (latest.tulot_kk||0) + (latest.muut_tulot||0);
          if (tlot2 > 0) {
            html2 += '<div style="margin-top:8px;font-size:10px;color:var(--text3);">'
              +'tulorytmi ~'+Math.round(tlot2).toLocaleString('fi-FI')+' €/kk</div>';
          }
          return html2;
        })()}
      </div>

      <!-- 4. NETTOVARALLISUUS — viimeisenä, koko leveys -->
      <div class="db-item card kpi-wide" data-item-id="netto" style="grid-column:1/-1;" style="background:var(--surface2);">
        <div class="card-label">Nettovarallisuus</div>
        <div class="card-value tip" style="font-size:38px;"
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

    </div>

      <div class="db-item" data-item-id="heartbeat" style="grid-column:1/-1;">${renderHeartbeatCard(sig)}</div>

    <div class="db-item db-section" data-item-id="historia" style="grid-column:1/-1;">
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
    <div class="db-item db-section" data-item-id="muuttui" style="grid-column:1/-1;">
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
    <div class="db-item db-section" data-item-id="tapahtumat" style="grid-column:1/-1;">
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
  // Päivitä oikea paneeli datan latauksen jälkeen
  setTimeout(() => { if (typeof updateRightPanel === 'function') updateRightPanel(); }, 200);
  setTimeout(() => { initCardDrag(); initLayoutToolbar(); }, 100);
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
    nordnet_cash:         latest?.nordnet_cash,
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
    renderDashboard();
    window.scrollTo({ top: 0, behavior: 'instant' });
  });
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
  if (name === 'syota')        requestAnimationFrame(() => renderEntryView());
  requestAnimationFrame(() => updateRightPanel());
  if (name === 'historia')      requestAnimationFrame(() => renderHistoria());
  if (name === 'salkku')        requestAnimationFrame(() => renderSalkku());
  if (name === 'likviditeetti') requestAnimationFrame(() => renderLikviditeetti());
  if (name === 'ledger')        requestAnimationFrame(() => renderLedger());
  if (name === 'myynnit')      requestAnimationFrame(() => renderMyynnit());
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
      <div class="empty-icon">📉</div>
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
              <div class="card-value" style="font-size:20px;">${fmt(sum.proceeds)}</div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Voitto (suos. menet.)</div>
              <div class="card-value ${sum.profit >= 0 ? 'pos' : 'neg'}" style="font-size:20px;">
                ${fmtDelta(sum.profit)}
              </div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Veroarvio 30/34 %</div>
              <div class="card-value neg" style="font-size:20px;">${fmt(sum.tax)}</div>
            </div>
            <div class="card" style="padding:14px 16px;">
              <div class="card-label">Netto käteen</div>
              <div class="card-value pos" style="font-size:20px;">${fmt(sum.proceeds - sum.tax)}</div>
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
          💡 Suositellulla menetelmällä vapautuu toimintavaraan
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

// ═══════════════════════════════════════════════
// SYÖTTÖNÄKYMÄ — kolmitasoinen snapshot-syöttö
// ═══════════════════════════════════════════════

// ══════════════════════════════════════════════════════════════════════
// KASSAVIRTA — dynaamiset tulot & operatiivinen rytmi
// ══════════════════════════════════════════════════════════════════════

const TULOT_TYYPIT = [
  { value: 'palkka',    label: 'Palkka' },
  { value: 'sivutyo',   label: 'Sivutyö' },
  { value: 'elake',     label: 'Eläke' },
  { value: 'osingot',   label: 'Osingot' },
  { value: 'vuokra',    label: 'Vuokratulo' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'muu',       label: 'Muu' },
];

// State — alustetaan latauksen yhteydessä
if (!window._tulotItems) window._tulotItems = [];
if (!window._rytmiItems) window._rytmiItems = [];

function initKassavirtaState(latest) {
  // Lataa tallennettu data tai tee esimerkkidata
  window._tulotItems = (latest && latest.tulot_items && latest.tulot_items.length > 0)
    ? JSON.parse(JSON.stringify(latest.tulot_items))
    : [{ id: Date.now(), type: 'palkka', label: '', amount: '' }];
  window._rytmiItems = (latest && latest.rytmi_items && latest.rytmi_items.length > 0)
    ? JSON.parse(JSON.stringify(latest.rytmi_items))
    : [];
}

function _typeOpts(sel) {
  return TULOT_TYYPIT.map(t =>
    '<option value="'+t.value+'"'+(t.value===sel?' selected':'')+'>'+t.label+'</option>'
  ).join('');
}

function renderTulotItems() {
  if (!window._tulotItems || !window._tulotItems.length) {
    window._tulotItems = [{ id: Date.now(), type: 'palkka', label: '', amount: '' }];
  }
  return window._tulotItems.map(function(item, i) {
    return '<div style="display:grid;grid-template-columns:auto 1fr auto auto;gap:6px;'
      +'align-items:center;margin-bottom:7px;">'
      +'<select id="tulot-type-'+i+'" '
      +'style="font-size:12px;padding:5px 7px;background:var(--surface2);'
      +'border:1px solid var(--border);border-radius:6px;color:var(--text2);">'
      +_typeOpts(item.type)+'</select>'
      +'<input type="text" id="tulot-lbl-'+i+'" value="'+(item.label||'')+'" placeholder="Nimi (vapaaehtoinen)"'
      +' style="padding:5px 9px;background:rgba(0,200,255,0.04);border:1px solid var(--border);'
      +'border-radius:6px;color:var(--text);font-size:14px;">'
      +'<input type="number" id="tulot-amt-'+i+'" value="'+(item.amount&&item.amount!==''?item.amount:'')+'" placeholder="€"'
      +' onchange="refreshRytmiYhteenveto()" oninput="refreshRytmiYhteenveto()"'
      +' style="width:90px;padding:5px 8px;background:rgba(0,200,255,0.04);'
      +'border:1px solid var(--border);border-radius:6px;color:var(--text);'
      +'font-family:var(--mono);font-size:16px;text-align:right;">'
      +'<span style="font-size:11px;color:var(--text3);">€</span>'
      +(window._tulotItems.length > 1
        ? '<button onclick="removeTulotItem('+i+')" style="background:transparent;border:none;'
          +'color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;">×</button>'
        : '<span style="width:18px;"></span>')
      +'</div>';
  }).join('');
}

function renderRytmiItems() {
  if (!window._rytmiItems || !window._rytmiItems.length) return '';
  return window._rytmiItems.map(function(item, i) {
    return '<div style="display:grid;grid-template-columns:1fr auto auto;gap:6px;'
      +'align-items:center;margin-bottom:7px;">'
      +'<input type="text" id="rytmi-lbl-'+i+'" value="'+(item.label||'')+'" placeholder="OP Gold, puhelin…"'
      +' style="padding:5px 9px;background:rgba(0,200,255,0.04);border:1px solid var(--border);'
      +'border-radius:6px;color:var(--text);font-size:14px;">'
      +'<input type="number" id="rytmi-amt-'+i+'" value="'+(item.amount&&item.amount!==''?item.amount:'')+'" placeholder="€"'
      +' onchange="refreshRytmiYhteenveto()" oninput="refreshRytmiYhteenveto()"'
      +' style="width:90px;padding:5px 8px;background:rgba(0,200,255,0.04);'
      +'border:1px solid var(--border);border-radius:6px;color:var(--text);'
      +'font-family:var(--mono);font-size:16px;text-align:right;">'
      +'<span style="font-size:11px;color:var(--text3);">€</span>'
      +'<button onclick="removeRytmiItem('+i+')" style="background:transparent;border:none;'
      +'color:var(--text3);font-size:16px;cursor:pointer;padding:0 2px;">×</button>'
      +'</div>';
  }).join('');
}

function renderRytmiYhteenveto() {
  // Lue suoraan DOM:sta — luotettavin tapa
  var tulot = 0; var ri = 0;
  while(true) { var e=document.getElementById('tulot-amt-'+ri); if(!e)break; tulot+=parseFloat(e.value)||0; ri++; }
  if (!tulot) tulot = (window._tulotItems||[]).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
  var rytmi = 0; ri = 0;
  while(true) { var e=document.getElementById('rytmi-amt-'+ri); if(!e)break; rytmi+=parseFloat(e.value)||0; ri++; }
  if (!rytmi) rytmi = (window._rytmiItems||[]).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
  var netto  = tulot - rytmi;
  if (!tulot && !rytmi) return '<div style="font-size:11px;color:var(--text3);">Lisää tuloja ja rakennerivejä nähdäksesi yhteenveto.</div>';
  var parts = [];
  if (tulot > 0) parts.push('<span style="color:var(--green);font-family:var(--mono);">+'
    +tulot.toLocaleString("fi-FI")+'€</span> tulot');
  if (rytmi > 0) parts.push('<span style="color:var(--red);font-family:var(--mono);">−'
    +rytmi.toLocaleString("fi-FI")+'€</span> rakenteet');
  var netColor = netto >= 0 ? "var(--green)" : "var(--red)";
  return '<div style="font-size:12px;color:var(--text3);margin-bottom:6px;">'
    +parts.join(' &nbsp;·&nbsp; ')+'</div>'
    +'<div style="display:flex;justify-content:space-between;background:rgba(0,0,0,0.1);'
    +'border-radius:7px;padding:7px 10px;">'
    +'<span style="font-size:12px;font-weight:600;">Kassavirta-rytmi</span>'
    +'<span style="font-family:var(--mono);font-size:15px;font-weight:700;color:'+netColor+';">'
    +(netto>=0?"+":"")+netto.toLocaleString("fi-FI")+'€</span></div>';
}

function refreshRytmiYhteenveto() {
  var el = document.getElementById("rytmi-yhteenveto");
  if (el) el.innerHTML = renderRytmiYhteenveto();
}

function refreshTulotList() {
  var el = document.getElementById("tulot-items-list");
  if (el) el.innerHTML = renderTulotItems();
  refreshRytmiYhteenveto();
}

function refreshRytmiList() {
  var el = document.getElementById("rytmi-items-list");
  if (el) el.innerHTML = renderRytmiItems();
  refreshRytmiYhteenveto();
}

function addTulotItem() {
  window._tulotItems.push({ id: Date.now(), type: 'palkka', label: '', amount: '' });
  refreshTulotList();
}

function removeTulotItem(i) {
  window._tulotItems.splice(i, 1);
  refreshTulotList();
}

function addRytmiItem() {
  window._rytmiItems.push({ id: Date.now(), label: '', amount: '' });
  refreshRytmiList();
}

function removeRytmiItem(i) {
  window._rytmiItems.splice(i, 1);
  refreshRytmiList();
}

// Laske yhteistulot kassavirta-paneelia varten
function getTulotYhteensa() {
  return (window._tulotItems||[]).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
}
function getRytmiYhteensa() {
  return (window._rytmiItems||[]).reduce(function(s,i){return s+(parseFloat(i.amount)||0);},0);
}


async function renderEntryView() {
  const el = document.getElementById('syota-content');
  if (!el) return;

  // Hae viimeisin snapshot esitäyttöä varten
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => b.date.localeCompare(a.date));
  const latest = snaps[0] || {};
  const today  = new Date().toISOString().slice(0,10);
  const todayFi = new Date().toLocaleDateString('fi-FI');
  // Alusta kassavirta-state viimeisimmästä snapista
  const _allSnapsForEntry = await DB.getAll('snapshots');
  const _latestForEntry = _allSnapsForEntry.sort((a,b)=>b.date.localeCompare(a.date))[0] || {};
  initKassavirtaState(_latestForEntry);
  const alreadySaved = snaps.length > 0 && snaps[0].date === today;

  function v(key, fallback) {
    const val = latest[key];
    return (val !== undefined && val !== null && val !== 0) ? val : (fallback || 0);
  }
  // tapiola and s_sijoitus are the same field in different import formats
  if (!latest.tapiola && latest.s_sijoitus) latest.tapiola = latest.s_sijoitus;

  el.innerHTML = `
<div style="max-width:480px;margin:0 auto;padding:16px;">

  ${alreadySaved ? `<div style="padding:8px 12px;border-radius:8px;background:rgba(90,158,106,0.1);
    border:1px solid rgba(90,158,106,0.3);color:#5a9e6a;font-size:12px;margin-bottom:12px;">
    ✓ Tänään (${todayFi}) on jo tallennettu — päivittäminen korvaa vanhan snapshottia.</div>` : ''}

  <!-- ── KASSAVIRTA: TULOT (dynaamiset rivit) ── -->
  <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;
    margin-bottom:8px;">Kuukauden kassavirta</div>

  <!-- TULOT -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:11px;
    overflow:hidden;margin-bottom:10px;">
    <div style="padding:8px 14px;border-bottom:1px solid var(--border);
      display:flex;justify-content:space-between;align-items:center;">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">
        Tulot
      </div>
      <div style="display:flex;align-items:center;gap:8px;">
        <span style="font-size:10px;color:var(--text3);">Palkanmaksupäivä</span>
        <div style="display:flex;align-items:center;gap:6px;">
          <input type="date" id="inp-tulot_pvm"
            value="${v('tulot_pvm') || ''}"
            style="font-family:var(--mono);padding:4px 8px;font-size:16px;
            opacity:0;position:absolute;width:110px;cursor:pointer;"
            onchange="var fi=document.getElementById('pvm_fi_lbl');
              var d=new Date(this.value);
              if(fi)fi.textContent=isNaN(d)?'':d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();">
          <span id="pvm_fi_lbl"
            onclick="document.getElementById('inp-tulot_pvm').showPicker?document.getElementById('inp-tulot_pvm').showPicker():document.getElementById('inp-tulot_pvm').click()"
            style="font-family:var(--mono);font-size:14px;color:var(--text2);
            padding:4px 10px;background:rgba(0,200,255,0.06);border:1px solid var(--border);
            border-radius:6px;cursor:pointer;white-space:nowrap;min-width:90px;display:inline-block;">
            ${(()=>{var p=v('tulot_pvm');if(!p)return 'pp.kk.vvvv';var d=new Date(p);return isNaN(d)?'pp.kk.vvvv':d.getDate()+'.'+(d.getMonth()+1)+'.'+d.getFullYear();})()}
          </span>
        </div>
      </div>
    </div>
    <div id="tulot-items-list" style="padding:6px 14px 4px;">
      ${renderTulotItems()}
    </div>
    <div style="padding:4px 14px 10px;">
      <button onclick="addTulotItem()"
        style="font-size:11px;padding:5px 12px;border-radius:6px;
        background:transparent;border:1px dashed rgba(0,200,255,0.2);
        color:var(--text3);cursor:pointer;width:100%;text-align:left;">
        + Lisää tulolähde
      </button>
    </div>
  </div>

  <!-- OPERATIIVINEN RYTMI -->
  <div style="background:var(--card);border:1px solid var(--border);border-radius:11px;
    overflow:hidden;margin-bottom:16px;">
    <div style="padding:8px 14px;border-bottom:1px solid var(--border);">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;">
        Tulotili − käyttöluotto — jatkuvat rakenteet
      </div>
      <div style="font-size:10px;color:var(--text3);margin-top:2px;font-style:italic;">
        OP Gold, pankkimaksut, puhelin, vakuutukset — ei yksittäisiä ostoksia
      </div>
    </div>
    <div id="rytmi-items-list" style="padding:6px 14px 4px;">
      ${renderRytmiItems()}
    </div>
    <div style="padding:4px 14px 10px;">
      <button onclick="addRytmiItem()"
        style="font-size:11px;padding:5px 12px;border-radius:6px;
        background:transparent;border:1px dashed rgba(0,200,255,0.2);
        color:var(--text3);cursor:pointer;width:100%;text-align:left;">
        + Lisää rakennerivi
      </button>
    </div>
    <div style="padding:6px 14px 10px;border-top:1px solid var(--border);" id="rytmi-yhteenveto">
      ${renderRytmiYhteenveto()}
    </div>
  </div>

  <!-- ── TASO 1: PÄIVITTÄINEN ── -->
  <div style="display:flex;justify-content:space-between;align-items:baseline;margin-bottom:8px;">
    <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;">1 · Päivittäinen — käyttötilit &amp; OP Gold</div>
    <div style="font-size:10px;color:rgba(0,200,255,0.5);">napauta muuttaaksesi ✎</div>
  </div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:11px;
    overflow:hidden;margin-bottom:12px;">

    <div style="padding:8px 14px 4px;border-bottom:1px solid var(--border);">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">Käyttötilit</div>
      ${entryRow('Tulotili', 'tulotili', v('tulotili'), '€')}
      ${entryRow('S-Pankki', 's_pankki', v('s_pankki'), '€')}
      ${entryRow('Tavoitetili', 'tavoitetili', v('tavoitetili'), '€')}
    </div>

    <div style="padding:8px 14px 4px;border-bottom:1px solid var(--border);">
      <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.05em;margin-bottom:6px;">OP Gold · luottokortti</div>
      ${entryRow('Kuukauden saldo', 'op_gold', v('op_gold'), '€', 'kertynyt tähän mennessä')}
    </div>

    <div style="padding:8px 14px;" id="nettorytmi-block">
      <div style="display:flex;justify-content:space-between;align-items:baseline;
        background:rgba(0,200,255,0.04);border-radius:7px;padding:8px 10px;">
        <span style="font-size:11px;color:var(--text3);">Nettorytmi (tulotili − OP Gold)</span>
        <span style="font-family:var(--mono);font-size:15px;font-weight:700;" id="nettorytmi-val">—</span>
      </div>
    </div>
  </div>

  <!-- ── TASO 2: SIJOITUKSET ── -->
  <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;
    margin-bottom:8px;">2 · Sijoitukset — päivitä jos muuttunut</div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:11px;
    overflow:hidden;margin-bottom:12px;">
    <div style="padding:8px 14px 4px;">
      ${entryRow('Nordnet', 'nordnet', v('nordnet'), '€')}
      ${entryRow('OP Osakkeet', 'op_osakkeet', v('op_osakkeet'), '€')}
      ${entryRow('Tapiola / S-sijoitus', 'tapiola', v('tapiola'), '€')}
    </div>
  </div>

  <!-- ── TASO 3: LAINAT ── -->
  <div style="font-size:10px;color:var(--text3);text-transform:uppercase;letter-spacing:.06em;
    margin-bottom:8px;">3 · Lainat — päivitä lyhennyksen jälkeen</div>

  <div style="background:var(--card);border:1px solid var(--border);border-radius:11px;
    overflow:hidden;margin-bottom:12px;">
    <div style="padding:8px 14px 4px;">
      ${entryLoan('Asuntolaina', 'asuntolaina', v('asuntolaina'), 2029, 200)}
      ${entryLoan('Autolaina', 'autolaina', v('autolaina'), 2027, 255)}
      ${entryLoan('Remonttilaina', 'asuntolaina_remontti', v('asuntolaina_remontti'), 2026, 170)}
    </div>
    <div style="padding:6px 14px 10px;">
      <div id="laina-total" style="display:flex;justify-content:space-between;align-items:baseline;
        background:rgba(0,0,0,0.12);border-radius:7px;padding:7px 10px;font-size:12px;">
        <span style="color:var(--text3);">Yhteensä lainat</span>
        <span style="font-family:var(--mono);color:var(--text2);">—</span>
      </div>
    </div>
  </div>

  <!-- ── MERKITTÄVÄ TAPAHTUMA (kollapsoituva) ── -->
  <div style="margin-bottom:16px;">
    <button id="konteksti-toggle" onclick="toggleKonteksti()"
      style="width:100%;padding:10px 14px;border-radius:11px;
      border:1px dashed rgba(0,200,255,0.2);background:transparent;
      color:var(--text3);font-size:12px;cursor:pointer;text-align:left;
      display:flex;justify-content:space-between;align-items:center;">
      <span>+ Lisää konteksti · merkittävä tapahtuma</span>
      <span style="font-size:10px;opacity:.6;">vapaaehtoinen</span>
    </button>
    <div id="konteksti-body" style="display:none;background:var(--card);
      border:1px solid var(--border);border-radius:0 0 11px 11px;
      border-top:none;padding:12px 14px;">
      <div style="display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;">
        ${['Autohuolto','Matka','Bonus','Palkka+','Isohankinta','Laskuerä','Muu'].map(t =>
          `<button onclick="toggleTag(this)" data-tag="${t}" style="font-size:11px;padding:3px 10px;
            border-radius:20px;border:1px solid var(--border);background:transparent;
            color:var(--text3);cursor:pointer;transition:all .15s;">${t}</button>`
        ).join('')}
      </div>
      <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
        <label style="font-size:12px;color:var(--text3);white-space:nowrap;">Summa</label>
        <input id="event-amount" type="number" placeholder="0"
          style="flex:1;padding:6px 10px;border:1px solid var(--border);border-radius:7px;
          background:rgba(0,200,255,0.04);color:var(--text);font-family:var(--mono);font-size:14px;">
        <span style="font-size:12px;color:var(--text3);">€</span>
      </div>
      <textarea id="event-note" placeholder="Selitys poikkeamalle — vapaaehtoinen"
        rows="2" style="width:100%;border:1px solid var(--border);border-radius:7px;
        background:rgba(0,200,255,0.04);color:var(--text);font-size:12px;padding:7px 10px;
        font-family:var(--sans);resize:none;"></textarea>
    </div>
  </div>

  <!-- ── TALLENNA ── -->
  <button onclick="collectKassavirtaBeforeSave();saveEntrySnapshot()" id="btn-entry-save"
    style="width:100%;padding:14px;border-radius:11px;font-size:15px;font-weight:700;
    background:linear-gradient(135deg,rgba(90,158,106,0.2),rgba(0,200,255,0.1));
    border:1px solid rgba(90,158,106,0.4);color:#5a9e6a;cursor:pointer;letter-spacing:.03em;">
    Tallenna snapshot · ${todayFi}
  </button>
  <div id="entry-msg" style="margin-top:10px;font-size:12px;text-align:center;"></div>

</div>`;

  // Lasketaan nettorytmi reaaliajassa
  function updateDerived() {
    const tulotili = parseFloat(document.getElementById('inp-tulotili')?.value) || 0;
    const opGold   = Math.abs(parseFloat(document.getElementById('inp-op_gold')?.value) || 0);
    const netto    = tulotili - opGold;
    const el2      = document.getElementById('nettorytmi-val');
    if (el2) {
      el2.textContent = fmt(netto);
      el2.style.color = netto >= 0 ? '#5a9e6a' : 'var(--text)';
    }
    // Lainat yhteensä
    const al = Math.abs(parseFloat(document.getElementById('inp-asuntolaina')?.value) || 0);
    const au = Math.abs(parseFloat(document.getElementById('inp-autolaina')?.value) || 0);
    const re = Math.abs(parseFloat(document.getElementById('inp-asuntolaina_remontti')?.value) || 0);
    const tot = al + au + re;
    const lt = document.querySelector('#laina-total span:last-child');
    if (lt) lt.textContent = tot > 0 ? fmt(-tot) : '—';
  }

  updateEntryDerived();
}

function entryRow(label, id, val, unit, sub) {
  const display = val ? Math.abs(val) : '';
  const fmtVal  = val ? fmt(Math.abs(val)) : '—';
  return `<div class="entry-row" style="display:flex;justify-content:space-between;align-items:center;
    padding:8px 0;border-bottom:1px solid rgba(0,200,255,0.05);cursor:pointer;
    border-radius:6px;transition:background .12s;margin:0 -8px;padding-left:8px;padding-right:8px;"
    onclick="entryActivate(this,'${id}')"
    onmouseenter="this.style.background='rgba(0,200,255,0.06)'"
    onmouseleave="this.style.background='transparent'">
    <div>
      <div style="font-size:13px;color:var(--text2);">${label}</div>
      ${sub ? `<div style="font-size:10px;color:var(--text3);">${sub}</div>` : ''}
    </div>
    <div style="display:flex;align-items:center;gap:6px;">
      <span id="disp-${id}" style="font-family:var(--mono);font-size:15px;font-weight:600;
        color:var(--text);border-bottom:1px dashed rgba(0,200,255,0.35);padding-bottom:1px;">${fmtVal}</span>
      <span style="font-size:11px;color:rgba(0,200,255,0.4);">✎</span>
      <input id="inp-${id}" type="number" value="${display}" placeholder="0"
        style="width:110px;padding:5px 8px;border:1px solid var(--cyan);border-radius:6px;
        background:rgba(0,200,255,0.06);color:var(--text);font-family:var(--mono);
        font-size:16px;text-align:right;display:none;"
        onblur="entryDeactivate(this,'${id}')" oninput="updateEntryDerived()">
      <span style="font-size:12px;color:var(--text3);">${unit}</span>
    </div>
  </div>`;
}

function entryLoan(label, id, val, endsYear, monthly) {
  const display  = val ? Math.abs(val) : '';
  const fmtVal   = val ? fmt(Math.abs(val)) : '—';
  // Load saved loan config from localStorage
  const cfgKey   = 'loan_cfg_' + id;
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem(cfgKey) || '{}'); } catch(e) {}
  const ey  = cfg.endsYear || endsYear;
  const mon = cfg.monthly  || monthly;
  const yLeft = ey - new Date().getFullYear();
  const yClr  = yLeft <= 1 ? '#5a9e6a' : yLeft <= 3 ? '#b8956a' : 'var(--text3)';
  return `<div style="padding:8px 0;border-bottom:1px solid rgba(0,200,255,0.05);">
    <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;
      cursor:pointer;border-radius:6px;transition:background .12s;margin:0 -8px 6px;
      padding:4px 8px;"
      onclick="entryActivate(this.parentElement,'${id}')"
      onmouseenter="this.style.background='rgba(0,200,255,0.06)'"
      onmouseleave="this.style.background='transparent'">
      <div style="font-size:13px;color:var(--text2);">${label}</div>
      <div style="display:flex;align-items:center;gap:6px;">
        <span id="disp-${id}" style="font-family:var(--mono);font-size:15px;font-weight:600;
          color:var(--text2);border-bottom:1px dashed rgba(0,200,255,0.35);padding-bottom:1px;">${fmtVal}</span>
        <span style="font-size:11px;color:rgba(0,200,255,0.4);">✎</span>
        <input id="inp-${id}" type="number" value="${display}" placeholder="0"
          style="width:100px;padding:5px 8px;border:1px solid var(--cyan);border-radius:6px;
          background:rgba(0,200,255,0.06);color:var(--text);font-family:var(--mono);
          font-size:16px;text-align:right;display:none;"
          onblur="entryDeactivate(this,'${id}')" oninput="updateEntryDerived()">
        <span style="font-size:12px;color:var(--text3);">€</span>
      </div>
    </div>
    <div style="display:flex;gap:8px;align-items:center;flex-wrap:wrap;">
      <span style="font-size:10px;color:${yClr};white-space:nowrap;">→ päättyy</span>
      <input type="number" value="${ey}" min="2024" max="2060" step="1"
        style="width:68px;padding:3px 6px;border:1px solid var(--border);border-radius:5px;
        background:rgba(0,200,255,0.04);color:${yClr};font-family:var(--mono);font-size:16px;text-align:center;"
        onchange="saveLoanCfg('${id}','endsYear',parseInt(this.value));this.style.color='#5a9e6a'">
      <span style="font-size:10px;color:var(--text3);margin-left:4px;">lyhennys</span>
      <div style="display:flex;align-items:center;gap:3px;">
        <input type="number" value="${mon}" min="0" step="10"
          style="width:68px;padding:3px 6px;border:1px solid var(--border);border-radius:5px;
          background:rgba(0,200,255,0.04);color:#5a9e6a;font-family:var(--mono);font-size:16px;text-align:right;"
          onchange="saveLoanCfg('${id}','monthly',parseInt(this.value))">
        <span style="font-size:10px;color:var(--text3);">€/kk</span>
      </div>
    </div>
  </div>`;
}

var _entryTags = new Set();
function toggleTag(btn) {
  const tag = btn.dataset.tag;
  if (_entryTags.has(tag)) {
    _entryTags.delete(tag);
    btn.style.background = 'transparent';
    btn.style.color = 'var(--text3)';
    btn.style.borderColor = 'var(--border)';
  } else {
    _entryTags.add(tag);
    btn.style.background = 'rgba(90,158,106,0.15)';
    btn.style.color = '#5a9e6a';
    btn.style.borderColor = 'rgba(90,158,106,0.4)';
  }
}

// Tap-to-edit: klikkaus näyttää inputin, blur palauttaa arvon
function entryActivate(row, id) {
  const disp = document.getElementById('disp-' + id);
  const inp  = document.getElementById('inp-'  + id);
  if (!disp || !inp) return;
  disp.style.display = 'none';
  inp.style.display  = 'block';
  inp.focus();
  inp.select();
}
function entryDeactivate(inp, id) {
  const disp = document.getElementById('disp-' + id);
  if (!disp) return;
  const v = parseFloat(inp.value);
  disp.textContent = (!isNaN(v) && v !== 0) ? fmt(Math.abs(v)) : '—';
  inp.style.display  = 'none';
  disp.style.display = 'block';
  updateEntryDerived();
}
function updateEntryDerived() {
  function v(id) { return parseFloat(document.getElementById('inp-'+id)?.value) || 0; }
  const tulotili = v('tulotili');
  const opGold   = Math.abs(v('op_gold'));
  const netto    = tulotili - opGold;
  const el = document.getElementById('nettorytmi-val');
  if (el) { el.textContent = fmt(netto); el.style.color = netto >= 0 ? '#5a9e6a' : 'var(--text)'; }
  const tot = Math.abs(v('asuntolaina')) + Math.abs(v('autolaina')) + Math.abs(v('asuntolaina_remontti'));
  const lt  = document.querySelector('#laina-total span:last-child');
  if (lt) lt.textContent = tot > 0 ? fmt(-tot) : '—';
}

function toggleKonteksti() {
  const body = document.getElementById('konteksti-body');
  const btn  = document.getElementById('konteksti-toggle');
  if (!body) return;
  const open = body.style.display !== 'none';
  body.style.display = open ? 'none' : 'block';
  if (btn) btn.textContent = open ? '+ Lisää konteksti' : '− Sulje';
}


// Kerää kassavirta-arvot DOM:sta ennen snapshotin tallennusta
function collectKassavirtaBeforeSave() {
  var tulotItems = []; var i = 0;
  while (true) {
    var amtEl  = document.getElementById('tulot-amt-' + i);
    if (!amtEl) break;
    var typeEl = document.getElementById('tulot-type-' + i);
    var lblEl  = document.getElementById('tulot-lbl-' + i);
    var amt    = parseFloat(amtEl.value) || 0;
    if (amt > 0) tulotItems.push({
      type:   typeEl ? typeEl.value : 'palkka',
      label:  lblEl  ? lblEl.value.trim() : '',
      amount: amt
    });
    i++;
  }
  var rytmiItems = []; i = 0;
  while (true) {
    var amtEl = document.getElementById('rytmi-amt-' + i);
    if (!amtEl) break;
    var lblEl = document.getElementById('rytmi-lbl-' + i);
    var amt   = parseFloat(amtEl.value) || 0;
    if (amt > 0) rytmiItems.push({
      label:  lblEl ? lblEl.value.trim() : '',
      amount: amt
    });
    i++;
  }
  var pvmEl = document.getElementById('inp-tulot_pvm');
  window._savedTulotItems = tulotItems;
  window._savedRytmiItems = rytmiItems;
  window._savedTulotKk    = tulotItems.reduce(function(s,t){return s+t.amount;}, 0) || null;
  window._savedMenotKk    = rytmiItems.reduce(function(s,r){return s+r.amount;}, 0) || null;
  window._savedTulotPvm   = pvmEl ? pvmEl.value : null;
  console.log('Kassavirta kerätty:', JSON.stringify(window._savedTulotItems));
}

async function saveEntrySnapshot() {
  const btn = document.getElementById('btn-entry-save');
  const msg = document.getElementById('entry-msg');
  if (btn) { btn.disabled = true; btn.textContent = 'Tallennetaan...'; }

  function val(id) {
    const v = parseFloat(document.getElementById('inp-'+id)?.value);
    return isNaN(v) ? null : v;
  }

  const tulotili  = val('tulotili')   || 0;
  const s_pankki  = val('s_pankki')   || 0;
  const tavoite   = val('tavoitetili') || 0;
  const op_gold   = -(Math.abs(val('op_gold') || 0));  // aina negatiivinen
  const nordnet   = val('nordnet')    || 0;
  const op_os     = val('op_osakkeet') || 0;
  const tapiola   = val('tapiola')    || 0;
  const asunto    = -(Math.abs(val('asuntolaina') || 0));
  const auto      = -(Math.abs(val('autolaina') || 0));
  const remontti  = -(Math.abs(val('asuntolaina_remontti') || 0));

  const eventAmt  = parseFloat(document.getElementById('event-amount')?.value) || 0;
  const eventNote = document.getElementById('event-note')?.value?.trim() || '';
  const tags      = [..._entryTags];

  // Rakenna note
  let note = '';
  if (tags.length > 0) note += tags.join(', ');
  if (eventAmt) note += (note ? ' ' : '') + fmt(eventAmt) + '€';
  if (eventNote) note += (note ? ' — ' : '') + eventNote;

  const today = new Date().toISOString().slice(0,10);
  const todayFi = new Date().toLocaleDateString('fi-FI');
  // Alusta kassavirta-state viimeisimmästä snapista
  const _allSnapsForEntry = await DB.getAll('snapshots');
  const _latestForEntry = _allSnapsForEntry.sort((a,b)=>b.date.localeCompare(a.date))[0] || {};
  initKassavirtaState(_latestForEntry);

  // Hae aiempi snapshot tänään jotta saldot joita ei muutettu säilyvät
  const snaps = (await DB.getAll('snapshots')).sort((a,b) => b.date.localeCompare(a.date));
  const prev  = snaps[0] || {};

  // Yhdistä: uudet arvot ylikirjoittavat vanhat, nollat eivät ylikirjoita
  const snap = {
    date:    today,
    dateFi:  todayFi,
    // tilit
    tulotili:  tulotili  || prev.tulotili   || 0,
    s_pankki:  s_pankki  || prev.s_pankki   || 0,
    tavoitetili: tavoite || prev.tavoitetili || 0,
    elatustili: prev.elatustili || 0,
    // kortit
    op_gold:   op_gold !== 0 ? op_gold : (prev.op_gold || 0),
    // sijoitukset
    nordnet:   nordnet  || prev.nordnet  || 0,
    op_osakkeet: op_os  || prev.op_osakkeet || 0,
    tapiola:   tapiola  || prev.tapiola || prev.s_sijoitus || 0,
    s_sijoitus: 0,
    rahastot:   prev.rahastot   || 0,
    // lainat
    asuntolaina: asunto !== 0 ? asunto : (prev.asuntolaina || 0),
    autolaina:   auto   !== 0 ? auto   : (prev.autolaina   || 0),
    asuntolaina_remontti: remontti !== 0 ? remontti : (prev.asuntolaina_remontti || 0),
    // lasten
    lasten_sijoitus: prev.lasten_sijoitus || 0,
    // kassavirta — käytetään collectKassavirtaBeforeSave()-funktionkeräimiä
    tulot_items: window._savedTulotItems || prev.tulot_items || [],
    rytmi_items: window._savedRytmiItems || prev.rytmi_items || [],
    tulot_kk:    window._savedTulotKk    || prev.tulot_kk    || null,
    menot_kk:    window._savedMenotKk    || prev.menot_kk    || null,
    menot_kk:    getRytmiYhteensa() || prev.menot_kk || null,
    tulot_pvm:   window._savedTulotPvm || document.getElementById('inp-tulot_pvm')?.value || prev.tulot_pvm || null,
    nordnet_cash: val('nordnet_cash') || prev.nordnet_cash || null,
    note,
  };

  await DB.putSnapshot(snap);

  // Jos tapiola/s_sijoitus tallennettiin, päivitä implisiittinen yksikköhinta S-Pankki-omistukselle
  const tapiolaVal = snap.tapiola || snap.s_sijoitus || 0;
  if (tapiolaVal > 0) {
    try {
      const holdings = await DB.getAll('holdings');
      const sspankki = holdings.find(h =>
        h.active !== false &&
        ((h.ticker||'').toUpperCase().includes('SPANKKI') ||
         (h.ticker||'').toUpperCase().includes('ESG') ||
         (h.account||'').toLowerCase().includes('s-pankki') ||
         (h.account||'').toLowerCase().includes('spankki'))
      );
      if (sspankki && sspankki.quantity > 0) {
        const impliedPrice = tapiolaVal / sspankki.quantity;
        await DB.putHolding(Object.assign({}, sspankki, {
          last_price:      impliedPrice,
          last_price_date: today,
          last_price_src:  'Snapshot (tapiola)',
          last_price_time: todayFi,
        }));
      }
    } catch(e) { console.log('tapiola holding sync:', e); }
  }

  // Synkronoi Supabaseen
  try { await syncToSupabase([snap]); } catch(e) {}

  _entryTags.clear();

  if (msg) {
    msg.style.color = '#5a9e6a';
    msg.textContent = '✓ Tallennettu · ' + todayFi;
  }
  if (btn) { btn.disabled = false; btn.textContent = 'Tallenna snapshot · ' + todayFi; }

  // Päivitä dashboard
  await updateNavCount();
  setTimeout(() => {
    showView('dashboard');
    requestAnimationFrame(() => {
      renderDashboard();
      window.scrollTo({ top: 0, behavior: 'instant' });
      const main = document.getElementById('db-content') || document.querySelector('.main-content') || document.querySelector('.view.active');
      if (main) main.scrollTop = 0;
    });
  }, 800);
}

// Tallenna lainan konfiguraatio localStorageen
function saveLoanCfg(id, field, value) {
  const key = 'loan_cfg_' + id;
  let cfg = {};
  try { cfg = JSON.parse(localStorage.getItem(key) || '{}'); } catch(e) {}
  cfg[field] = value;
  localStorage.setItem(key, JSON.stringify(cfg));
  // Päivitä signals.js LOAN_SCHEDULE cache
  updateLoanScheduleFromStorage();
}

function updateLoanScheduleFromStorage() {
  if (typeof LOAN_SCHEDULE === 'undefined') return;
  LOAN_SCHEDULE.forEach(function(loan) {
    const key = 'loan_cfg_' + loan.key;
    try {
      const cfg = JSON.parse(localStorage.getItem(key) || '{}');
      if (cfg.endsYear) loan.endsYear = cfg.endsYear;
      if (cfg.monthly)  loan.monthlyEur = cfg.monthly;
    } catch(e) {}
  });
}

// ══════════════════════════════════════════════════════════════
// OIKEA PANEELI — kuukausikatsaus + aikarakenne
// ══════════════════════════════════════════════════════════════
function renderRightPanel(snaps, latest, calc) {
  if (!latest || !calc) {
    return '<div class="panel-section"><div class="panel-label">Ladataan...</div></div>';
  }

  const now   = new Date();
  const yr    = now.getFullYear();
  const mo    = now.getMonth();
  const KUUKAUDET = ['Tammikuu','Helmikuu','Maaliskuu','Huhtikuu','Toukokuu','Kesäkuu',
                     'Heinäkuu','Elokuu','Syyskuu','Lokakuu','Marraskuu','Joulukuu'];
  const moLabel = KUUKAUDET[mo] + ' ' + yr;

  // Kuukauden alku vs nyt
  const moStart = yr + '-' + String(mo+1).padStart(2,'0') + '-01';
  const snapsMo = snaps.filter(s => s.date >= moStart).sort((a,b) => a.date.localeCompare(b.date));
  const first   = snapsMo[0];
  const nwNow   = calc.netWorth;
  const nwFirst = first ? calculateNetWorth(first).netWorth : null;
  const moChg   = nwFirst !== null ? nwNow - nwFirst : null;
  const moPct   = (nwFirst && nwFirst !== 0) ? (moChg / Math.abs(nwFirst) * 100) : null;

  const invNow   = calc.investments;
  const invFirst = first ? calculateNetWorth(first).investments : null;
  const invChg   = invFirst !== null ? invNow - invFirst : null;

  // Nettorytmi
  const tulotili = latest.tulotili ?? 0;
  const opGold   = Math.abs(latest.op_gold ?? 0);
  const nettorytmi = tulotili - opGold;

  // Lainat aikarakenne
  function getLoanCfg(key, defYear, defMonthly) {
    try { const c = JSON.parse(localStorage.getItem('loan_cfg_'+key)||'{}'); return { year: c.year||defYear, monthly: c.monthly||defMonthly }; } catch { return { year: defYear, monthly: defMonthly }; }
  }
  const loans = [
    { label: 'Asuntolaina', key: 'asuntolaina',          val: Math.abs(latest.asuntolaina??0),          cfg: getLoanCfg('asuntolaina',2030,200) },
    { label: 'Autolaina',   key: 'autolaina',             val: Math.abs(latest.autolaina??0),            cfg: getLoanCfg('autolaina',2027,255) },
    { label: 'Remonttilaina',key:'asuntolaina_remontti',  val: Math.abs(latest.asuntolaina_remontti??0), cfg: getLoanCfg('asuntolaina_remontti',2028,170) },
  ].filter(l => l.val > 0);

  const totalMonthly = loans.reduce((s,l) => s + l.cfg.monthly, 0);
  const curYear = now.getFullYear();

  // Laske palkki: kuinka lähellä päättymistä
  function loanPct(l) {
    const yearsLeft = Math.max(0, l.cfg.year - curYear);
    const totalYears = Math.max(1, l.cfg.year - 2020); // ~alkuarvo
    return Math.max(5, Math.min(95, (1 - yearsLeft/totalYears)*100));
  }

  // ── HTML ──────────────────────────────────────────────────────────
  function fmtP(n) { if(n==null)return'—'; var a=Math.abs(n); var s=a.toLocaleString('fi-FI',{maximumFractionDigits:0}); return (n<0?'−':'')+s+' €'; }
  function signCls(n) { return n==null?'':n>0?'pos':'neg'; }
  function signPfx(n) { return n>0?'+':''; }

  // Kassavirta-ankkuri (tulot)
  var tulot_kk = latest.tulot_kk ?? null;
  var opGold_p = Math.abs(latest.op_gold ?? 0);
  var tulotili_p = latest.tulotili ?? 0;
  var nettorytmi_p = tulotili_p - opGold_p;

  var html = '';

  // Kuukausikatsaus
  html += '<div class="panel-section">';
  html += '<div class="panel-month-title">' + moLabel + '</div>';
  if (moChg !== null) {
    html += '<div class="panel-row"><span class="panel-row-lbl">Netto</span>'
      + '<span class="panel-row-val ' + signCls(moChg) + '">'
      + signPfx(moChg) + fmtP(moChg)
      + (moPct ? ' <span style="font-size:9px;opacity:.7">' + signPfx(moPct) + moPct.toFixed(1) + '%</span>' : '')
      + '</span></div>';
  }
  if (invChg !== null) {
    html += '<div class="panel-row"><span class="panel-row-lbl">Sijoitukset</span>'
      + '<span class="panel-row-val ' + signCls(invChg) + '">' + signPfx(invChg) + fmtP(invChg) + '</span></div>';
  }
  html += '<div style="height:1px;background:var(--border);margin:8px 0;"></div>';
  html += '<div class="panel-row"><span class="panel-row-lbl">Tulotili − käyttöluotto</span>'
    + '<span class="panel-row-val ' + signCls(nettorytmi) + '">' + fmtP(nettorytmi) + '</span></div>';
  html += '<div class="panel-row"><span class="panel-row-lbl">Strateginen reservi</span>'
    + '<span class="panel-row-val">' + (calc.runway ? Math.round(calc.runway) + ' kk' : '—') + '</span></div>';
  html += '</div>';

  // Aikarakenne
  if (loans.length > 0) {
    html += '<div class="panel-section">';
    html += '<div class="panel-label">Aikarakenne · pitkät velat</div>';
    loans.forEach(function(l) {
      var pct = loanPct(l);
      var near = (l.cfg.year - curYear) <= 2;
      html += '<div class="loan-bar-wrap">';
      html += '<div class="loan-bar-hdr">'
        + '<span class="loan-bar-name">' + l.label + '</span>'
        + '<span class="loan-bar-year">→ ' + l.cfg.year + ' · ' + fmtP(l.val) + '</span>'
        + '</div>';
      html += '<div class="loan-bar-track"><div class="loan-bar-fill'+(near?' near':'')+'" style="width:'+pct.toFixed(0)+'%"></div></div>';
      html += '</div>';
    });
    html += '<div class="loan-capacity">↑ Vapautuu yht. +' + totalMonthly.toLocaleString('fi-FI') + ' €/kk</div>';
    html += '</div>';
  }

  // Kuukauden kassavirta
  var menot_kk_p = Math.abs(latest.menot_kk ?? 0);
  var muut_tulot_p = latest.muut_tulot ?? 0;
  var tulot_yht = (tulot_kk || 0) + muut_tulot_p;
  var kassavirta = tulot_yht > 0 ? tulot_yht - menot_kk_p - opGold_p : null;

  html += '<div class="panel-section">';
  html += '<div class="panel-label">Kuukauden kassavirta</div>';

  // Käytä tulot_items-listaa jos saatavilla
  var tulot_items_p = latest.tulot_items || [];
  var rytmi_items_p = latest.rytmi_items || [];

  if (tulot_items_p.length > 0 || rytmi_items_p.length > 0 || tulot_kk || menot_kk_p > 0) {
    // Tulot eriteltynä
    if (tulot_items_p.length > 0) {
      tulot_items_p.forEach(function(t) {
        var amt = parseFloat(t.amount) || 0;
        if (!amt) return;
        var typeLabel = t.type === 'palkka' ? 'Palkka' : t.type === 'sivutyo' ? 'Sivutyö'
          : t.type === 'elake' ? 'Eläke' : t.type === 'osingot' ? 'Osingot'
          : t.type === 'vuokra' ? 'Vuokra' : t.type === 'freelance' ? 'Freelance' : 'Muu';
        var label = t.label ? t.label : typeLabel;
        html += '<div class="panel-row"><span class="panel-row-lbl" style="font-size:11px;">'
          +label+'</span><span class="panel-row-val pos">+'+fmtP(amt)+'</span></div>';
      });
    } else if (tulot_yht > 0) {
      html += '<div class="panel-row"><span class="panel-row-lbl">Tulot</span>'
        + '<span class="panel-row-val pos">+' + fmtP(tulot_yht) + '</span></div>';
    }
    // Rakenteet eriteltynä
    if (rytmi_items_p.length > 0) {
      html += '<div style="height:1px;background:var(--border);margin:5px 0;"></div>';
      rytmi_items_p.forEach(function(r) {
        var amt = parseFloat(r.amount) || 0;
        if (!amt) return;
        html += '<div class="panel-row"><span class="panel-row-lbl" style="font-size:11px;color:var(--text3);">'
          +(r.label||'Rakennerivi')+'</span><span class="panel-row-val neg">−'+fmtP(amt)+'</span></div>';
      });
    } else if (menot_kk_p > 0) {
      html += '<div class="panel-row"><span class="panel-row-lbl">Menot</span>'
        + '<span class="panel-row-val neg">−' + fmtP(menot_kk_p) + '</span></div>';
    }
    // Viiva
    html += '<div style="height:1px;background:var(--border);margin:6px 0;"></div>';
    // Operatiivinen rytmi (nettorytmi = tulotili - OP Gold)
    html += '<div class="panel-row"><span class="panel-row-lbl" style="font-weight:600;">Tulotili − käyttöluotto</span>'
      + '<span class="panel-row-val ' + signCls(nettorytmi_p) + '">' + fmtP(nettorytmi_p) + '</span></div>';
    // Kassavirta jos data täydellinen
    if (kassavirta !== null) {
      html += '<div class="panel-row" style="margin-top:2px;"><span class="panel-row-lbl" style="font-size:10px;color:var(--text3);">Jää / käytettävissä</span>'
        + '<span class="panel-row-val ' + signCls(kassavirta) + '" style="font-size:12px;">'
        + (kassavirta >= 0 ? '+' : '') + fmtP(kassavirta) + '</span></div>';
    }
  } else {
    // Ei dataa — näytä nettorytmi ja ohje
    html += '<div class="panel-row"><span class="panel-row-lbl">Tulotili − käyttöluotto</span>'
      + '<span class="panel-row-val ' + signCls(nettorytmi_p) + '">' + fmtP(nettorytmi_p) + '</span></div>';
    html += '<div style="font-size:10px;color:var(--text3);margin-top:6px;line-height:1.6;">'
      + 'Lisää tulot &amp; menot +Päivitä-näkymässä.</div>';
  }
  html += '</div>';

  // Broker-snapshot
  if (calc.brokers) {
    var bk = calc.brokers;
    html += '<div class="panel-section">';
    html += '<div class="panel-label">Salkku nyt</div>';
    if (bk.nordnet.total > 0) {
      html += '<div class="panel-row"><span class="panel-row-lbl">Nordnet</span>'
        + '<span class="panel-row-val">' + fmtP(bk.nordnet.total)
        + (bk.nordnet.cash > 0 ? ' <span style="font-size:9px;color:var(--text3);">+'
          + fmtP(bk.nordnet.cash) + ' kät.</span>' : '')
        + '</span></div>';
    }
    if (bk.op.total > 0) {
      html += '<div class="panel-row"><span class="panel-row-lbl">OP</span>'
        + '<span class="panel-row-val">' + fmtP(bk.op.total) + '</span></div>';
    }
    if (bk.spankki.total > 0) {
      html += '<div class="panel-row"><span class="panel-row-lbl">S-Pankki</span>'
        + '<span class="panel-row-val">' + fmtP(bk.spankki.total) + '</span></div>';
    }
    html += '</div>';
  }

  return html;
}

async function updateRightPanel() {
  const el = document.getElementById('panel-content');
  if (!el) return;
  try {
    const snaps  = (await DB.getAll('snapshots')).sort((a,b)=>a.date.localeCompare(b.date));
    if (!snaps.length) return;
    const latest = snaps[snaps.length - 1];  // nouseva järjestys → viimeinen = uusin
    const calc   = calculateNetWorth(latest);
    // runway from signals if available
    if (window._lastSig) calc.runway = window._lastSig.runway?.months ?? null;
    el.innerHTML = renderRightPanel(snaps, latest, calc);
    // Update sidebar meta
    const sbMeta = document.getElementById('sb-meta');
    if (sbMeta) sbMeta.innerHTML = snaps.length + ' snapshotia<br>' + (latest.date ? fmtDate(latest.date) : '');
  } catch(e) { console.warn('Panel update:', e); }
}
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
      el.style.gridColumn = isWide(el.dataset.itemId) ? '1 / -1' : 'auto';
      const btn = el.querySelector('.size-toggle-btn');
      if (btn) {
        const wide = isWide(el.dataset.itemId);
        btn.textContent = wide ? '⊡' : '⊞';
        btn.title = wide ? 'Tee pieneksi' : 'Tee leveäksi';
      }
    });
    // Pakota Safari redraw
    const grid = document.getElementById('all-cards-container');
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
