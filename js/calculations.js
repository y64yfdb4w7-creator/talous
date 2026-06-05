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

function fmtDateWd(iso) {
  if (!iso) return '—';
  var WD = ['Su','Ma','Ti','Ke','To','Pe','La'];
  var [y,m,d] = iso.split('-');
  var day = new Date(iso).getDay();
  return WD[day]+' '+d+'.'+m+'.'+y;
}

function dcls(n) {
  if (!n || Math.abs(n) < 0.5) return 'neu';
  return n > 0 ? 'pos' : 'neg';
}

// ═══════════════════════════════════════════════
// CALCULATION ENGINE  v1  (assets − liabilities)
// ═══════════════════════════════════════════════
function calculateNetWorth(snap) {
  // ── Broker-tason rakenne ─────────────────────────────────
  // Nordnet: sijoitukset + erillinen käteinen (nordnet_cash)
  const nordnetInv   = snap.nordnet       ?? 0;
  const nordnetCash  = snap.nordnet_cash  ?? 0;   // uusi kenttä
  const nordnetTotal = nordnetInv + nordnetCash;

  // OP: sijoitukset (ei erillistä käteistä toistaiseksi)
  const opInv        = snap.op_osakkeet   ?? 0;

  // S-Pankki / Tapiola: sijoitukset
  const spankki_inv  = (snap.tapiola ?? 0) + (snap.s_sijoitus ?? 0) + (snap.rahastot ?? 0);

  // ── Aggregaatit ──────────────────────────────────────────
  const investments = nordnetInv + opInv + spankki_inv;
  const brokerCash  = nordnetCash;   // laajennettavissa myöhemmin

  const cash =
    (snap.tulotili    ?? 0) +
    (snap.s_pankki    ?? 0) +
    (snap.tavoitetili ?? 0) +
    (snap.elatustili  ?? 0);

  const assets = investments + brokerCash + cash;

  // Short-term liabilities
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
    // Aggregaatit (taaksepäin yhteensopivat)
    investments,
    cash,
    assets,
    shortTermDebt,
    longTermDebt,
    liabilities,
    netWorth: assets - liabilities,
    // Semanttiset aliakset — psykologisesti eri asioita
    operationalDebt: shortTermDebt,   // OP Gold, luottokortit — kassavirran osa
    structuralDebt:  longTermDebt,    // Asuntolaina, autolaina — pitkä infrastruktuuri
    // Broker-taso (uusi — UI käyttää tarvittaessa)
    brokers: {
      nordnet: { investments: nordnetInv, cash: nordnetCash, total: nordnetTotal },
      op:      { investments: opInv,      cash: 0,           total: opInv },
      spankki: { investments: spankki_inv,cash: 0,           total: spankki_inv },
    },
    brokerCash,
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
// ═══════════════════════════════════════════════
// MYYNTILASKELMAT  (Finnish capital gains)
// ═══════════════════════════════════════════════

// Pääomavero: 30 % ≤ 30 000 €, 34 % > 30 000 €
function calcCapitalGainsTax(taxableProfit) {
  if (taxableProfit <= 0) return 0;
  if (taxableProfit <= 30000) return taxableProfit * 0.30;
  return 30000 * 0.30 + (taxableProfit - 30000) * 0.34;
}

// Kolme menetelmää yhden myynnin laskentaan
// kpl          = myyty kappalemäärä
// salePriceEur = myyntikurssi euroina / kpl
// purchaseEur  = hankintahinta euroina / kpl (0 = tuntematon)
function calcSaleMethods(kpl, salePriceEur, purchaseEur) {
  const totalSale = kpl * salePriceEur;

  // 1. FIFO / keskihinta — edellyttää hankintahinnan
  const fifoProfit = purchaseEur > 0 ? totalSale - kpl * purchaseEur : null;
  const fifoTax    = fifoProfit != null ? calcCapitalGainsTax(fifoProfit) : null;

  // 2. HMO 20 % — alle 10 v omistus: verotettava = 80 % myyntihinnasta
  const hmo20Taxable = totalSale * 0.80;
  const hmo20Tax     = calcCapitalGainsTax(hmo20Taxable);

  // 3. HMO 40 % — yli 10 v omistus: verotettava = 60 % myyntihinnasta
  const hmo40Taxable = totalSale * 0.60;
  const hmo40Tax     = calcCapitalGainsTax(hmo40Taxable);

  const methods = [
    { key: 'fifo',  label: 'FIFO / keskihinta', profit: fifoProfit,    tax: fifoTax,    taxable: fifoProfit },
    { key: 'hmo20', label: 'HMO 20 %',          profit: hmo20Taxable,  tax: hmo20Tax,   taxable: hmo20Taxable },
    { key: 'hmo40', label: 'HMO 40 %',          profit: hmo40Taxable,  tax: hmo40Tax,   taxable: hmo40Taxable },
  ];

  // Suositus = pienin vero niistä, joilla tax ei ole null
  const valid = methods.filter(m => m.tax != null);
  const recommended = valid.reduce((best, m) => m.tax < best.tax ? m : best, valid[0]);

  return { totalSale, methods, recommended: recommended?.key ?? null };
}

// Vuosiyhteenveto: lasketaan suositeltu vero per myynti ja summataan
function calcYearlySalesSummary(salesForYear) {
  return salesForYear.reduce((acc, s) => {
    const rec = s.calc?.methods?.find(m => m.key === s.calc?.recommended);
    const tax    = rec?.tax    ?? 0;
    const profit = rec?.profit ?? 0;
    return {
      proceeds: acc.proceeds + (s.totalEur ?? 0),
      profit:   acc.profit   + profit,
      tax:      acc.tax      + tax,
    };
  }, { proceeds: 0, profit: 0, tax: 0 });
}
