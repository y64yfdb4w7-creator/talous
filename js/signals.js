// Finance OS — signals.js  (Sprint 5 v3)
// Intelligence Layer: rauhallinen, monikerroksinen tilannetulkinta.
//
// Latausjärjestys: db.js → calculations.js → signals.js → ui.js

'use strict';

// Luottokortin eräpäivä — muuta tarvittaessa
const CREDIT_CARD_DUE_DAY = 25;

function _daysUntilDue(isoDate) {
  const today = new Date(isoDate || new Date().toISOString().slice(0, 10));
  const day   = today.getDate();
  let due     = new Date(today.getFullYear(), today.getMonth(), CREDIT_CARD_DUE_DAY);
  if (day >= CREDIT_CARD_DUE_DAY)
    due = new Date(today.getFullYear(), today.getMonth() + 1, CREDIT_CARD_DUE_DAY);
  return Math.round((due - today) / 86400000);
}

// ═══════════════════════════════════════════════
// KULUTUSTEMPO
// ═══════════════════════════════════════════════
function computeConsumptionTempo(snaps, latest) {
  if (!latest || !latest.op_gold) return null;
  const today    = latest.date || new Date().toISOString().slice(0, 10);
  const dayNum   = parseInt(today.slice(8, 10));
  const yr       = parseInt(today.slice(0, 4));
  const mo       = parseInt(today.slice(5, 7));
  const curSpend = Math.abs(latest.op_gold ?? 0);
  const paceVals = [];
  for (let i = 1; i <= 5; i++) {
    let m = mo - i, y = yr;
    if (m <= 0) { m += 12; y -= 1; }
    const mStr   = `${y}-${String(m).padStart(2,'0')}`;
    const mSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    let best = null, bestDiff = 999;
    for (const s of mSnaps) {
      const d = Math.abs(parseInt(s.date.slice(8,10)) - dayNum);
      if (d < bestDiff) { bestDiff = d; best = s; }
    }
    if (best && bestDiff <= 3) paceVals.push(Math.abs(best.op_gold));
  }
  if (paceVals.length < 2) return null;
  const paceAvg = paceVals.reduce((a,b)=>a+b,0) / paceVals.length;
  if (paceAvg <= 0) return null;
  return {
    tempo:    Math.round((curSpend / paceAvg) * 100),
    paceAvg, curSpend,
    diffEur:  curSpend - paceAvg,
    dayNum,
  };
}

// ═══════════════════════════════════════════════
// KUUKAUSITTAINEN PALAMINEN
// ═══════════════════════════════════════════════
function computeMonthlyBurn(snaps, latest) {
  if (!latest) return null;
  const today = latest.date || new Date().toISOString().slice(0,10);
  const yr = parseInt(today.slice(0,4)), mo = parseInt(today.slice(5,7));
  const peaks = [];
  for (let i = 1; i <= 6; i++) {
    let m = mo - i, y = yr;
    if (m <= 0) { m += 12; y -= 1; }
    const mStr   = `${y}-${String(m).padStart(2,'0')}`;
    const mSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    if (!mSnaps.length) continue;
    const peak = Math.max(...mSnaps.map(s => Math.abs(s.op_gold)));
    if (peak > 0) peaks.push(peak);
  }
  if (peaks.length < 2) return null;
  return peaks.reduce((a,b)=>a+b,0) / peaks.length;
}

// ═══════════════════════════════════════════════
// KASSASYKLI
// ═══════════════════════════════════════════════
function computeCycleState(snaps, latest, tempo) {
  if (!latest) return null;
  const daysUntilDue = _daysUntilDue(latest.date);
  const cardBalance  = Math.abs(latest.op_gold ?? 0);
  const cashBalance  = latest.tulotili ?? 0;
  const tempoOk      = !tempo || tempo.tempo <= 110;
  const timeOk       = daysUntilDue > 5;
  const tempoLow     = tempo && tempo.tempo < 85;
  return {
    daysUntilDue,
    cardBalance,
    cashBalance,
    net:      cashBalance - cardBalance,
    cycleOk:  (tempoOk && timeOk) || tempoLow,
  };
}

// ═══════════════════════════════════════════════
// STRATEGINEN RESERVI
// ═══════════════════════════════════════════════
function computeRunway(snaps, latest, calc) {
  if (!latest || !calc) return null;
  const burn = computeMonthlyBurn(snaps, latest);
  if (!burn || burn <= 0) return null;
  const cash          = Math.max(calc.cash - calc.shortTermDebt, 0);
  const protectedInv  = (calc.investments ?? 0) * 0.65;
  const totalCapacity = cash + protectedInv;
  if (totalCapacity <= 0) return null;
  return {
    months:        Math.min(Math.round(totalCapacity / burn), 999),
    monthlyBurn:   Math.round(burn),
    cashContrib:   Math.round(cash),
    investContrib: Math.round(protectedInv),
    totalCapacity: Math.round(totalCapacity),
  };
}

// ═══════════════════════════════════════════════
// NETTOVARALLISUUDEN TRENDI
// ═══════════════════════════════════════════════
function computeNetWorthTrend(snaps, latest) {
  if (!snaps || snaps.length < 3 || !latest) return null;
  const sorted = [...snaps].sort((a,b) => a.date.localeCompare(b.date));
  const now    = calculateNetWorth(latest).netWorth;
  function refNW(days) {
    const d = new Date(latest.date);
    d.setDate(d.getDate() - days);
    const iso = d.toISOString().slice(0,10);
    let best = null;
    for (const s of sorted) { if (s.date <= iso) best = s; else break; }
    if (!best || best.date === latest.date) return null;
    return calculateNetWorth(best).netWorth;
  }
  const ref30   = refNW(30), ref90 = refNW(90);
  const delta30 = ref30 != null ? now - ref30 : null;
  const delta90 = ref90 != null ? now - ref90 : null;
  let direction = 'neutral';
  if (delta30 != null && delta90 != null) {
    if (delta30 > 0 && delta90 > 0)      direction = 'up';
    else if (delta30 < 0 && delta90 < 0) direction = 'down';
  } else if (delta30 != null) {
    direction = delta30 > 0 ? 'up' : 'down';
  }
  return { delta30, delta90, direction };
}

// ═══════════════════════════════════════════════
// SUUNTA — mihin järjestelmä on menossa
// Pehmeä, ei absoluuttinen arvio.
// ═══════════════════════════════════════════════
function computeDirection(cycle, tempo, runway, trend) {
  // 1. Sykli palautuu eräpäivänä
  if (cycle && !cycle.cycleOk === false && cycle.net < 0 && cycle.daysUntilDue <= 10
      && tempo && tempo.tempo < 95) {
    return { label: `Palautuu normaaliksi ${cycle.daysUntilDue} pv:n kuluttua`, color: 'var(--text3)' };
  }
  // 2. Kulutus hidastumassa (tempo selvästi alle normaalin)
  if (tempo && tempo.tempo < 80) {
    return { label: 'Kulutus normaalia hitaampaa · reservi kasvaa', color: 'var(--green)' };
  }
  // 3. Trendi ylös, tilanne hyvä
  if (trend && trend.direction === 'up' && runway && runway.months >= 10) {
    return { label: 'Nettovarallisuus kasvussa', color: 'var(--green)' };
  }
  // 4. Kulutus kiihtynyt
  if (tempo && tempo.tempo > 130) {
    return { label: 'Kulutus normaalia nopeampaa · seuraa kehitystä', color: '#b8956a' };
  }
  // 5. Trendi alas
  if (trend && trend.direction === 'down') {
    return { label: 'Nettovarallisuus laskussa · tarkista sykli', color: '#b8956a' };
  }
  // 6. Normaali tila
  return { label: 'Rytmi vakaa', color: 'var(--text3)' };
}

// ═══════════════════════════════════════════════
// PÄÄSIGNAALI — yksinkertainen ja rauhallinen
// ═══════════════════════════════════════════════
function computeHeartbeat(snaps, latest, calc, cycle, tempo) {
  if (!latest || !calc)
    return { dot: '●', label: 'Ei dataa', color: '#8a9490', sub: null };

  const runway = computeRunway(snaps, latest, calc);
  const trend  = computeNetWorthTrend(snaps, latest);

  // Kassasykli kiristynyt: korkea kulutus + eräpäivä lähellä
  if (cycle && !cycle.cycleOk && tempo && tempo.tempo > 120) {
    return { dot: '○', label: 'Kassasykli kiristynyt', color: '#c05a5a',
             sub: `${tempo.tempo} % normaalista · eräpäivään ${cycle.daysUntilDue} pv` };
  }
  // Kulutus selvästi kiihtynyt
  if (tempo && tempo.tempo > 140) {
    return { dot: '○', label: 'Kulutus kiihtynyt', color: '#b8956a',
             sub: `${tempo.tempo} % normaalista` };
  }
  // Reservi erittäin matala
  if (runway && runway.months < 3) {
    return { dot: '○', label: 'Reservi matala', color: '#b8956a',
             sub: `Sijoitusreservi ${runway.months} kk` };
  }
  // Kulutus alle normaalin → paras tila
  if (tempo && tempo.tempo < 85) {
    return { dot: '●', label: 'Tilanne normaali', color: '#5a9e6a',
             sub: `Kulutus ${tempo.tempo} % normaalista` };
  }
  // Trendi ylös + hyvä reservi
  if (trend && trend.direction === 'up' && runway && runway.months >= 12) {
    return { dot: '●', label: 'Tilanne normaali', color: '#5a9e6a',
             sub: `Reservi ${runway.months} kk` };
  }
  // Perustila
  return { dot: '●', label: 'Maksusykli hallinnassa', color: '#5a9e6a',
           sub: tempo ? `Kulutus ${tempo.tempo} % normaalista` : null };
}

// ═══════════════════════════════════════════════
// PÄÄFUNKTIO
// ═══════════════════════════════════════════════
function computeAllSignals(snaps, latest, calc) {
  if (!snaps || !latest || !calc) return null;
  const tempo       = computeConsumptionTempo(snaps, latest);
  const cycle       = computeCycleState(snaps, latest, tempo);
  const runway      = computeRunway(snaps, latest, calc);
  const trend       = computeNetWorthTrend(snaps, latest);
  const hb          = computeHeartbeat(snaps, latest, calc, cycle, tempo);
  const direction   = computeDirection(cycle, tempo, runway, trend);
  const monthlyBurn = computeMonthlyBurn(snaps, latest);
  return {
    heartbeat:   hb,
    tempo, cycle, runway, trend, direction,
    liquid:      calc.cash - calc.shortTermDebt,
    monthlyBurn: monthlyBurn ? Math.round(monthlyBurn) : null,
  };
}
