// Finance OS — signals.js
// Intelligence Layer: tulkitsee datan viesteiksi
// Kaikki signaalit ovat rauhallisia, läpinäkyviä, ei-aggressiivisia.
//
// Latausjärjestys: db.js → calculations.js → signals.js → ui.js

'use strict';

// ═══════════════════════════════════════════════
// KULUTUSTEMPO
// Vertaa nykyistä OP Gold -saldoa historialliseen
// normaaliin samalle päivänumerolle.
// ═══════════════════════════════════════════════
function computeConsumptionTempo(snaps, latest) {
  if (!latest || !latest.op_gold) return null;

  const today      = latest.date || new Date().toISOString().slice(0, 10);
  const dayNum     = parseInt(today.slice(8, 10));
  const yr         = parseInt(today.slice(0, 4));
  const mo         = parseInt(today.slice(5, 7));
  const curSpend   = Math.abs(latest.op_gold ?? 0);

  // 5 kuukautta taaksepäin — sama päivänumero ±3 päivää
  const paceVals = [];
  for (let i = 1; i <= 5; i++) {
    let m = mo - i, y = yr;
    if (m <= 0) { m += 12; y -= 1; }
    const mStr = `${y}-${String(m).padStart(2, '0')}`;
    const monthSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    let best = null, bestDiff = 999;
    for (const s of monthSnaps) {
      const d = Math.abs(parseInt(s.date.slice(8, 10)) - dayNum);
      if (d < bestDiff) { bestDiff = d; best = s; }
    }
    if (best && bestDiff <= 3) paceVals.push(Math.abs(best.op_gold));
  }

  if (paceVals.length < 2) return null;

  const paceAvg = paceVals.reduce((a, b) => a + b, 0) / paceVals.length;
  if (paceAvg <= 0) return null;

  const tempo    = Math.round((curSpend / paceAvg) * 100);
  const diffEur  = curSpend - paceAvg;

  return {
    tempo,          // prosentti (100 = normaali)
    paceAvg,        // 5kk keskiarvo euroina
    curSpend,       // nykyinen kulutus euroina
    diffEur,        // poikkeama euroina (+/- normaali)
    dayNum,
  };
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
    const mStr = `${y}-${String(m).padStart(2, '0')}`;
    const monthSnaps = snaps.filter(s => s.date.startsWith(mStr) && s.op_gold);
    if (!monthSnaps.length) continue;
    const peak = Math.max(...monthSnaps.map(s => Math.abs(s.op_gold)));
    if (peak > 0) peaks.push(peak);
  }

  if (peaks.length < 2) return null;
  return peaks.reduce((a, b) => a + b, 0) / peaks.length;
}

// ═══════════════════════════════════════════════
// TOIMINTAVARA (Financial Runway)
// Kuinka monta kuukautta nykyinen rakenne kestää
// ilman pakkomyyntejä tai elämäntapamuutoksia.
//
// Kaava:
//   (likviditeetti + sijoitukset × 0.65) / kuukausikulutus
//
// 0.65 = suojamarginaali: ei oleteta täyttä likvidaatiota
// ═══════════════════════════════════════════════
function computeRunway(snaps, latest, calc) {
  if (!latest || !calc) return null;

  const burn = computeMonthlyBurn(snaps, latest);
  if (!burn || burn <= 0) return null;

  const liquidity         = calc.cash - calc.shortTermDebt;
  const protectedInvest   = (calc.investments ?? 0) * 0.65;
  const totalCapacity     = Math.max(liquidity, 0) + protectedInvest;

  if (totalCapacity <= 0) return null;

  const months = Math.round(totalCapacity / burn);

  return {
    months:           Math.min(months, 999),   // cap
    monthlyBurn:      Math.round(burn),
    liquidity:        Math.round(liquidity),
    protectedInvest:  Math.round(protectedInvest),
    totalCapacity:    Math.round(totalCapacity),
  };
}

// ═══════════════════════════════════════════════
// NETTOVARALLISUUDEN TRENDI
// Onko suunta ylös vai alas viimeisten 30–90 pv:n ajalta?
// ═══════════════════════════════════════════════
function computeNetWorthTrend(snaps, latest) {
  if (!snaps || snaps.length < 3 || !latest) return null;

  const sorted = [...snaps].sort((a, b) => a.date.localeCompare(b.date));
  const now    = calculateNetWorth(latest).netWorth;

  function refNW(daysBack) {
    const refDate = new Date(latest.date);
    refDate.setDate(refDate.getDate() - daysBack);
    const refISO  = refDate.toISOString().slice(0, 10);
    let best = null;
    for (const s of sorted) {
      if (s.date <= refISO) best = s;
      else break;
    }
    if (!best || best.date === latest.date) return null;
    return calculateNetWorth(best).netWorth;
  }

  const ref30  = refNW(30);
  const ref90  = refNW(90);

  const delta30 = ref30 != null ? now - ref30  : null;
  const delta90 = ref90 != null ? now - ref90  : null;
  const pct30   = (ref30 && ref30 !== 0) ? ((now - ref30) / Math.abs(ref30)) * 100 : null;

  // Trendi: positiivinen jos molemmat positiiviset, negatiivinen jos molemmat negatiiviset
  let direction = 'neutral';
  if (delta30 != null && delta90 != null) {
    if (delta30 > 0 && delta90 > 0) direction = 'up';
    else if (delta30 < 0 && delta90 < 0) direction = 'down';
  } else if (delta30 != null) {
    direction = delta30 > 0 ? 'up' : 'down';
  }

  return { delta30, delta90, pct30, direction };
}

// ═══════════════════════════════════════════════
// FINANCIAL HEARTBEAT
// Pääsignaali: mitä taloudessa juuri nyt tapahtuu.
// Palautetaan yksi viesti, värikoodi ja selitys.
// ═══════════════════════════════════════════════
function computeHeartbeat(snaps, latest, calc) {
  if (!latest || !calc) {
    return { dot: '●', label: 'Ei dataa', color: '#8a9490', sub: null };
  }

  const tempo   = computeConsumptionTempo(snaps, latest);
  const runway  = computeRunway(snaps, latest, calc);
  const trend   = computeNetWorthTrend(snaps, latest);
  const liquid  = calc.cash - calc.shortTermDebt;

  // ── Prioriteettijärjestys: vakavimmasta lievämpään ──

  // 1. Negatiivinen likviditeetti: luottokortit > käteinen
  if (liquid < -200) {
    return {
      dot:   '○',
      label: 'Luottokortit ylittävät käteisen',
      color: '#c05a5a',
      sub:   `Netto-likviditeetti ${fmt(liquid)}`,
      priority: 5,
    };
  }

  // 2. Kulutus selvästi kiihtynyt (>130 % normaalista)
  if (tempo && tempo.tempo > 130) {
    return {
      dot:   '○',
      label: 'Kulutus kiihtynyt',
      color: '#b8956a',
      sub:   `${tempo.tempo} % normaalista · pv ${tempo.dayNum}`,
      priority: 4,
    };
  }

  // 3. Toimintavara heikko (alle 6 kk)
  if (runway && runway.months < 6) {
    return {
      dot:   '○',
      label: 'Toimintavara alle 6 kk',
      color: '#b8956a',
      sub:   `${runway.months} kk jäljellä`,
      priority: 3,
    };
  }

  // 4. Suunta alas ja kulutus normaalia nopeampi
  if (trend && trend.direction === 'down' && tempo && tempo.tempo > 105) {
    return {
      dot:   '○',
      label: 'Kulutus normaalia nopeampi',
      color: '#b8956a',
      sub:   tempo ? `${tempo.tempo} % normaalista` : null,
      priority: 2,
    };
  }

  // 5. Toimintavara kasvaa (trendi ylös + runway hyvä)
  if (trend && trend.direction === 'up' && runway && runway.months >= 18) {
    return {
      dot:   '●',
      label: 'Toimintavara kasvaa',
      color: '#5a9e6a',
      sub:   runway ? `${runway.months} kk toimintavaraa` : null,
      priority: 0,
    };
  }

  // 6. Kuukausi hallinnassa (oletustila)
  return {
    dot:   '●',
    label: 'Kuukausi hallinnassa',
    color: '#5a9e6a',
    sub:   tempo ? `Kulutus ${tempo.tempo} % normaalista` : null,
    priority: 0,
  };
}

// ═══════════════════════════════════════════════
// PÄÄFUNKTIO
// Palauttaa kaiken signaalidatan yhdessä objektissa.
// Kutsutaan renderDashboard():sta.
// ═══════════════════════════════════════════════
function computeAllSignals(snaps, latest, calc) {
  if (!snaps || !latest || !calc) return null;

  const tempo    = computeConsumptionTempo(snaps, latest);
  const runway   = computeRunway(snaps, latest, calc);
  const trend    = computeNetWorthTrend(snaps, latest);
  const hb       = computeHeartbeat(snaps, latest, calc);
  const liquid   = calc.cash - calc.shortTermDebt;
  const monthlyBurn = computeMonthlyBurn(snaps, latest);

  return {
    heartbeat:    hb,
    tempo,
    runway,
    trend,
    liquid,
    monthlyBurn:  monthlyBurn ? Math.round(monthlyBurn) : null,
  };
}
