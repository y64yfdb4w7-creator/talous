function fmt(n, plain = false) {
  if (n === null || n === undefined) return '—';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  const sign = n < 0 ? '−' : '';
  return plain ? `${sign}${s} €` : `${sign}${s} €`;
}

function fmtDelta(n) {
  if (!n && n !== 0) return '—';
  const abs = Math.abs(n);
  const s = abs.toLocaleString('fi-FI', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
  return (n >= 0 ? '+' : '−') + s + ' €';
}

function fmtDate(iso) {
  if (!iso) return '—';
  const [y,m,d] = iso.split('-');
  return `${d}.${m}.${y}`;
}

function dcls(n) {
  if (!n || Math.abs(n) < 0.5) return 'neu';
  return n > 0 ? 'pos' : 'neg';
}

// ═══════════════════════════════════════════════
// CALCULATION ENGINE  v1  (assets − liabilities)
// ═══════════════════════════════════════════════
function calculateNetWorth(snap) {
  // Assets
  const investments =
    (snap.nordnet          ?? 0) +
    (snap.op_osakkeet      ?? 0) +
    (snap.tapiola          ?? 0) +
    (snap.s_sijoitus       ?? 0) +
    (snap.rahastot         ?? 0) +
    0; // lasten_sijoitus excluded — tracked separately

  const cash =
    (snap.tulotili   ?? 0) +
    (snap.s_pankki   ?? 0) +
    (snap.tavoitetili ?? 0) +
    (snap.elatustili  ?? 0);

  const assets = investments + cash;

  // Short-term liabilities (credit cards, monthly cycle)
  const shortTermDebt = Math.abs(
    (snap.op_gold    ?? 0) +
    (snap.visa       ?? 0) +
    (snap.luottotili ?? 0)
  );

  // Long-term debt
  const longTermDebt = Math.abs(
    snap.kaikki_lainat ?? snap.asuntolaina_yht ??
    ((snap.asuntolaina          ?? 0) +
     (snap.asuntolaina_remontti ?? 0) +
     (snap.autolaina            ?? 0))
  );

  const liabilities = shortTermDebt + longTermDebt;

  return {
    investments,
    cash,
    assets,
    shortTermDebt,
    longTermDebt,
    liabilities,
    netWorth: assets - liabilities,
  };
}

// ═══════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════
function snapBefore(snaps, isoDate) {
  // Find latest snapshot at or before given date (snaps sorted asc)
  let result = null;
  for (const s of snaps) {
    if (s.date <= isoDate) result = s;
    else break;
  }
  return result;
}

function daysAgoISO(days) {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().slice(0, 10);
}

function fmtPct(a, b) {
  if (!a || a === 0) return null;
  const pct = ((b - a) / Math.abs(a)) * 100;
  if (!isFinite(pct)) return null;
  return (pct >= 0 ? '+' : '') + pct.toFixed(1) + ' %';
}

// ═══════════════════════════════════════════════
// DASHBOARD
// ═══════════════════════════════════════════════