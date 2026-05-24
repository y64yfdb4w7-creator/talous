// Finance OS — signals.js  (Sprint 5 v2)
// Intelligence Layer: tulkitsee datan viesteiksi.
// Kolme kerrosta: operatiivinen tila, kassasykli, strateginen reservi.
//
// Latausjärjestys: db.js → calculations.js → signals.js → ui.js

'use strict';

// ── Luottokortin eräpäivä ──────────────────────────────────────────────
// Oletuksena kuukauden 25. päivä. Muuta tätä jos eräpäivä on eri.
const CREDIT_CARD_DUE_DAY = 25;

// ── Apufunktiot ────────────────────────────────────────────────────────
function _daysUntilDue(isoDate) {
  const today   = new Date(isoDate || new Date().toISOString().slice(0, 10));
  const day     = today.getDate();
  let dueDate   = new Date(today.getFullYear(), today.getMonth(), CREDIT_CARD_DUE_DAY);
  if (day >= CREDIT_CARD_DUE_DAY) {
    // Eräpäivä ensi kuussa
    dueDate = new Date(today.getFullYear(), today.getMonth() + 1, CREDIT_CARD_DUE_DAY);
  }
  return Math.round((dueDate - today) / 86400000);
}

// ═══════════════════════════════════════════════
// KULUTUSTEMPO
// Vertaa nykyistä OP Gold -saldoa historialliseen
// normaaliin samalle päivänumerolle (5 kk taaksepäin).
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
    const mStr      = `${y}-${String(m).padStart(2, '0')}`;
    const mSnaps    = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    let best = null, bestDiff = 999;
    for (const s of mSnaps) {
      const d = Math.abs(parseInt(s.date.slice(8, 10)) - dayNum);
      if (d < bestDiff) { bestDiff = d; best = s; }
    }
    if (best && bestDiff <= 3) paceVals.push(Math.abs(best.op_gold));
  }

  if (paceVals.length < 2) return null;

  const paceAvg = paceVals.reduce((a, b) => a + b, 0) / paceVals.length;
  if (paceAvg <= 0) return null;

  const tempo   = Math.round((curSpend / paceAvg) * 100);
  const diffEur = curSpend - paceAvg;

  return { tempo, paceAvg, curSpend, diffEur, dayNum };
}

// ═══════════════════════════════════════════════
// KUUKAUSITTAINEN PALAMINEN
// Historiallinen kuukausikulutus OP Gold huippuarvoista.
// ═══════════════════════════════════════════════
function computeMonthlyBurn(snaps, latest) {
  if (!latest) return null;

  const today = latest.date || new Date().toISOString().slice(0, 10);
  const yr    = parseInt(today.slice(0, 4));
  const mo    = parseInt(today.slice(5, 7));

  const peaks = [];
  for (let i = 1; i <= 6; i++) {
    let m = mo - i, y = yr;
    if (m <= 0) { m += 12; y -= 1; }
    const mStr   = `${y}-${String(m).padStart(2, '0')}`;
    const mSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    if (!mSnaps.length) continue;
    const peak = Math.max(...mSnaps.map(s => Math.abs(s.op_gold)));
    if (peak > 0) peaks.push(peak);
  }

  if (peaks.length < 2) return null;
  return peaks.reduce((a, b) => a + b, 0) / peaks.length;
}

// ═══════════════════════════════════════════════
// KASSASYKLI
// Luottokorttitieto ei ole "velka" vaan kassavirran rytmi.
// Palauttaa syklin tilan ja päivät eräpäivään.
// ═══════════════════════════════════════════════
function computeCycleState(snaps, latest, tempo) {
  if (!latest) return null;

  const daysUntilDue  = _daysUntilDue(latest.date);
  const cardBalance   = Math.abs(latest.op_gold ?? 0);
  const cashBalance   = latest.tulotili ?? 0;
  const net           = cashBalance - cardBalance;

  // Sykli hallinnassa jos:
  // - tempo alle 110 % JA aikaa eräpäivään yli 5 pv
  // - tai tempo alle 85 % (selvästi alle normaalin)
  const tempoOk    = !tempo || tempo.tempo <= 110;
  const timeOk     = daysUntilDue > 5;
  const tempoLow   = tempo && tempo.tempo < 85;

  const cycleOk    = (tempoOk && timeOk) || tempoLow;

  return {
    daysUntilDue,
    cardBalance,
    cashBalance,
    net,
    cycleOk,
    isNormal: cycleOk,  // alias
  };
}

// ═══════════════════════════════════════════════
// STRATEGINEN RESERVI (Runway)
// Sijoitusten kautta käytettävissä oleva puskuri.
// EI ole käteistä — on "tarvittaessa käytettävissä".
//
// Kaava: (käteinen + sijoitukset × 0.65) / kuukausikulutus
// 0.65 = suojamarginaali + verovaraus
// ═══════════════════════════════════════════════
function computeRunway(snaps, latest, calc) {
  if (!latest || !calc) return null;

  const burn = computeMonthlyBurn(snaps, latest);
  if (!burn || burn <= 0) return null;

  const cash            = Math.max(calc.cash - calc.shortTermDebt, 0);
  const protectedInvest = (calc.investments ?? 0) * 0.65;
  const totalCapacity   = cash + protectedInvest;

  if (totalCapacity <= 0) return null;

  const months = Math.round(totalCapacity / burn);

  return {
    months:          Math.min(months, 999),
    monthlyBurn:     Math.round(burn),
    cashContrib:     Math.round(cash),
    investContrib:   Math.round(protectedInvest),
    totalCapacity:   Math.round(totalCapacity),
  };
}

// ═══════════════════════════════════════════════
// NETTOVARALLISUUDEN TRENDI
// ═══════════════════════════════════════════════
function computeNetWorthTrend(snaps, latest) {
  if (!snaps || snaps.length < 3 || !latest) return null;

  const sorted = [...snaps].sort((a, b) => a.date.localeCompare(b.date));
  const now    = calculateNetWorth(latest).netWorth;

  function refNW(daysBack) {
    const d = new Date(latest.date);
    d.setDate(d.getDate() - daysBack);
    const iso = d.toISOString().slice(0, 10);
    let best  = null;
    for (const s of sorted) {
      if (s.date <= iso) best = s;
      else break;
    }
    if (!best || best.date === latest.date) return null;
    return calculateNetWorth(best).netWorth;
  }

  const ref30   = refNW(30);
  const ref90   = refNW(90);
  const delta30 = ref30 != null ? now - ref30 : null;
  const delta90 = ref90 != null ? now - ref90 : null;
  const pct30   = (ref30 && ref30 !== 0) ? ((now - ref30) / Math.abs(ref30)) * 100 : null;

  let direction = 'neutral';
  if (delta30 != null && delta90 != null) {
    if (delta30 > 0 && delta90 > 0)      direction = 'up';
    else if (delta30 < 0 && delta90 < 0) direction = 'down';
  } else if (delta30 != null) {
    direction = delta30 > 0 ? 'up' : 'down';
  }

  return { delta30, delta90, pct30, direction };
}

// ═══════════════════════════════════════════════
// FINANCIAL HEARTBEAT — PÄÄSIGNAALI
//
// Uusi logiikka:
// 1. Luottokortti ei ole automaattinen varoitus
// 2. Kassasykli arvioidaan tempo + aika yhteistuloksena
// 3. Operatiivinen ja strateginen taso pidetään erillään
// ═══════════════════════════════════════════════
function computeHeartbeat(snaps, latest, calc, cycle, tempo) {
  if (!latest || !calc) {
    return { dot: '●', label: 'Ei dataa', color: '#8a9490', sub: null };
  }

  const runway  = computeRunway(snaps, latest, calc);
  const trend   = computeNetWorthTrend(snaps, latest);

  // ── Prioriteettijärjestys: vakavimmasta lievämpään ──

  // 1. Kassasykli ei hallinnassa: tempo korkea JA eräpäivä lähellä
  if (cycle && !cycle.cycleOk && tempo && tempo.tempo > 115) {
    return {
      dot:   '○',
      label: 'Kassasykli kiristynyt',
      color: '#c05a5a',
      sub:   `Kulutus ${tempo.tempo} % normaalista · eräpäivään ${cycle.daysUntilDue} pv`,
    };
  }

  // 2. Kulutus selvästi kiihtynyt (>140 % historiallisesta)
  if (tempo && tempo.tempo > 140) {
    return {
      dot:   '○',
      label: 'Kulutus kiihtynyt selvästi',
      color: '#b8956a',
      sub:   `${tempo.tempo} % normaalista · pv ${tempo.dayNum}`,
    };
  }

  // 3. Strateginen reservi matala (< 3 kk) — vasta kolmas prioriteetti
  if (runway && runway.months < 3) {
    return {
      dot:   '○',
      label: 'Reservi matala',
      color: '#b8956a',
      sub:   `Sijoitusreservi ${runway.months} kk`,
    };
  }

  // 4. Sykli hallinnassa, kulutus alle normaalin → paras tila
  if (cycle && cycle.cycleOk && tempo && tempo.tempo < 90) {
    return {
      dot:   '●',
      label: 'Kulutus alle normaalin',
      color: '#5a9e6a',
      sub:   `${tempo.tempo} % · eräpäivään ${cycle.daysUntilDue} pv`,
    };
  }

  // 5. Toimintavara kasvaa (trendi ylös)
  if (trend && trend.direction === 'up' && runway && runway.months >= 12) {
    return {
      dot:   '●',
      label: 'Toimintavara kasvaa',
      color: '#5a9e6a',
      sub:   runway ? `Reservi ${runway.months} kk` : null,
    };
  }

  // 6. Perustila: sykli hallinnassa
  return {
    dot:   '●',
    label: 'Maksusykli hallinnassa',
    color: '#5a9e6a',
    sub:   tempo ? `Kulutus ${tempo.tempo} % normaalista` : null,
  };
}

// ═══════════════════════════════════════════════
// PÄÄFUNKTIO
// ═══════════════════════════════════════════════
function computeAllSignals(snaps, latest, calc) {
  if (!snaps || !latest || !calc) return null;

  const tempo    = computeConsumptionTempo(snaps, latest);
  const cycle    = computeCycleState(snaps, latest, tempo);
  const runway   = computeRunway(snaps, latest, calc);
  const trend    = computeNetWorthTrend(snaps, latest);
  const hb       = computeHeartbeat(snaps, latest, calc, cycle, tempo);
  const monthlyBurn = computeMonthlyBurn(snaps, latest);

  return {
    heartbeat:  hb,
    tempo,
    cycle,
    runway,
    trend,
    liquid:     calc.cash - calc.shortTermDebt,
    monthlyBurn: monthlyBurn ? Math.round(monthlyBurn) : null,
  };
}
