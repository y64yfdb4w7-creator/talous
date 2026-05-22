// ── Valmiiksi ladatut omistukset ──────────────────────────────────────────
// Lisätty automaattisesti kuvakaappauksista — ei tarvitse näpytellä
const SEED_HOLDINGS = [
  { ticker: 'AMZN',      display_name: 'Amazon',                        quantity: 15,    last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'AAPL',      display_name: 'Apple',                         quantity: 2,     last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'LLY',       display_name: 'Eli Lilly',                     quantity: 2,     last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'FORTUM.HE', display_name: 'Fortum',                        quantity: 0,     last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'SXR8.DE',   display_name: 'iShares Core S&P 500 ETF',      quantity: 5,     last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'MANTA.HE',  display_name: 'Mandatum',                      quantity: 50,    last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'NDA-FI.HE', display_name: 'Nordea (Nordnet arvo-osuus)',   quantity: 220,   last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'NDA-FI.HE', display_name: 'Nordea (Nordnet osakesäästö)',  quantity: 163,   last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'NDA-FI.HE', display_name: 'Nordea (OP)',                   quantity: 457,   last_price: null, purchase_price: null, account: 'op_osakkeet'},
  { ticker: 'NVO',       display_name: 'Novo Nordisk',                  quantity: 9,     last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'OUT1V.HE',  display_name: 'Outokumpu',                     quantity: 200,   last_price: null, purchase_price: null, account: 'nordnet'    },
  { ticker: 'SPANKKI-ESG', display_name: 'S-Pankki Passiivinen USA ESG', quantity: 64.06, last_price: null, purchase_price: null, account: 's_sijoitus' },
];

// ═══════════════════════════════════════════════
// KURSSIHAKU — Finnhub
// ═══════════════════════════════════════════════

// Valuuttakartta: ticker → valuutta
const TICKER_CURRENCY = {
  'AMZN': 'USD', 'AAPL': 'USD', 'LLY': 'USD', 'NVO': 'USD',
  'FORTUM.HE': 'EUR', 'SXR8.DE': 'EUR', 'MANTA.HE': 'EUR',
  'NDA-FI.HE': 'EUR', 'OUT1V.HE': 'EUR',
};

function getFinnhubKey() {
  return localStorage.getItem('finos_finnhub_key') || '';
}
function setFinnhubKey(k) {
  localStorage.setItem('finos_finnhub_key', k.trim());
}

async function fetchFinnhubQuote(ticker, apiKey) {
  try {
    const r = await fetch(
      `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(ticker)}&token=${apiKey}`,
      { signal: abortSignalWithTimeout(8000) }
    );
    if (!r.ok) return null;
    const d = await r.json();
    return (d && d.c && d.c !== 0) ? d.c : null;
  } catch { return null; }
}

async function fetchUsdEur(apiKey) {
  // Frankfurter (vapaa, ei API-avainta)
  try {
    const r = await fetch('https://api.frankfurter.dev/v1/latest?base=USD&symbols=EUR',
      { signal: abortSignalWithTimeout(6000) });
    if (r.ok) { const d = await r.json(); if (d?.rates?.EUR) return d.rates.EUR; }
  } catch {}
  // Finnhub fallback
  try {
    const r = await fetch(`https://finnhub.io/api/v1/forex/rates?base=USD&token=${apiKey}`,
      { signal: abortSignalWithTimeout(6000) });
    if (r.ok) { const d = await r.json(); if (d?.quote?.EUR) return d.quote.EUR; }
  } catch {}
  return null;
}

async function fetchAndUpdatePrices() {
  // Ohjataan Se Suuri Nappi -toimintoon dashboardilla
  // Varmista ensin että avaimet on asetettu
  const apiKey = getFinnhubKey();
  const supaKey = getSupaKey();
  if (!apiKey && !supaKey) {
    const ok = confirm('Avaimia ei ole asetettu.\n\nPaina OK avataksesi Asetukset (⚙) ja syötä Supabase- tai Finnhub-avain.');
    if (ok) toggleSettings();
    return;
  }
  // Siirry dashboardille ja käynnistä
  showView('dashboard');
  setTimeout(() => refreshAndFreeze(), 100);
}


// ═══════════════════════════════════════════════
// PÄIVITÄ & JÄÄDYTÄ — Päivärituaali
// ═══════════════════════════════════════════════

async function refreshAllMarketData() {
  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.ticker);
  const tickers  = [...new Set(holdings.map(h => h.ticker))];
  const today    = new Date().toISOString().slice(0,10);
  const timeNow  = new Date().toLocaleTimeString('fi-FI', {hour:'2-digit',minute:'2-digit'});

  const apiKey   = getFinnhubKey();
  const supaUrl  = getSupaUrl();
  const supaKey  = getSupaKey();

  let usdEur = null, results = {}, source = 'Finnhub';

  // Yritä Supabase Edge Function ensin
  if (supaUrl && supaKey) {
    try {
      const r = await fetch(supaUrl + '/functions/v1/fetch-quotes', {
        method: 'POST',
        headers: {'Content-Type':'application/json','Authorization':'Bearer '+supaKey},
        body: JSON.stringify({symbols: tickers}),
        signal: abortSignalWithTimeout(28000),
      });
      if (r.ok) {
        const payload = await r.json();
        usdEur = payload.usdEur || null;
        for (const t of tickers) {
          const q = payload.quotes?.[t];
          if (q?.price) results[t] = {price: q.price, src: 'Supabase', stale: q.stale || false};
        }
        source = 'Supabase';
      }
    } catch(e) { console.warn('Supabase EF failed:', e.message); }
  }

  // Fallback: Finnhub suora
  if (Object.keys(results).length < tickers.length && apiKey) {
    if (!usdEur) usdEur = await fetchUsdEur(apiKey);
    for (const ticker of tickers) {
      if (results[ticker]) continue;
      const rawPrice = await fetchFinnhubQuote(ticker, apiKey);
      if (rawPrice) {
        const cur = TICKER_CURRENCY[ticker] || 'EUR';
        const priceEur = (cur === 'USD' && usdEur) ? rawPrice * usdEur : rawPrice;
        results[ticker] = {price: priceEur, src: 'Finnhub', stale: false};
      }
    }
    source = 'Finnhub';
  }

  // Päivitä holdings IndexedDB:hen — lisää lähde ja aika
  let ok = 0, fallback = 0;
  for (const h of holdings) {
    const res = results[h.ticker];
    if (res?.price) {
      await DB.putHolding({
        ...h,
        last_price:      parseFloat(res.price.toFixed(4)),
        last_price_date: today,
        last_price_time: timeNow,
        last_price_src:  res.stale ? 'Fallback' : res.src,
      });
      ok++;
    } else {
      // Ei saatu kurssia — merkitään Fallback (säilytetään vanha hinta)
      if (h.last_price) {
        await DB.putHolding({...h, last_price_src: 'Fallback'});
        fallback++;
      }
    }
  }
  return {ok, fallback, usdEur, source};
}

async function refreshAndFreeze() {
  // Tarkista avaimet ensin
  const apiKey  = getFinnhubKey();
  const supaKey = getSupaKey();
  if (!apiKey && !supaKey) {
    if (confirm('Avaimia ei ole asetettu.\n\nPaina OK → Asetukset avautuu → syötä Supabase anon key + URL → Tallenna → paina nappia uudelleen.')) {
      toggleSettings();
    }
    return;
  }

  const btn   = document.getElementById('btn-freeze');
  const icon  = document.getElementById('btn-freeze-icon');
  const label = document.getElementById('btn-freeze-label');
  const status = document.getElementById('freeze-status');

  if (btn) { btn.disabled = true; }
  if (icon)  icon.textContent = '⟳';
  if (label) label.textContent = 'Haetaan kursseja...';

  try {
    // Vaihe 1: Hae kurssit
    const {ok, fallback, usdEur, source} = await refreshAllMarketData();

    if (label) label.textContent = 'Jäädytetään snapshot...';

    // Vaihe 2: Laske ja jäädytä snapshot
    const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.last_price);
    if (holdings.length === 0) {
      if (icon)  icon.textContent = '↻';
      if (label) label.textContent = 'Päivitä kurssit & Jäädytä snapshot';
      if (btn)   btn.disabled = false;
      if (status) {
        status.style.display = 'block';
        status.style.background = 'rgba(192,90,90,.08)';
        status.style.borderColor = 'rgba(192,90,90,.25)';
        status.style.color = '#c05a5a';
        status.innerHTML = '⚠ Kursseja ei saatu. Tarkista avaimet: paina ⚙ → syötä Supabase URL + anon key → Tallenna';
      }
      return;
    }

    // Per-tili yhteissummat holdingseista
    const acctTotals = {};
    for (const h of holdings) {
      const val = (h.quantity || 0) * (h.last_price || 0);
      acctTotals[h.account] = (acctTotals[h.account] || 0) + val;
    }

    // Hae viimeisin snapshot baseline-arvoksi (tilit, lainat)
    const allSnaps = (await DB.getAll('snapshots')).sort((a,b)=>a.date.localeCompare(b.date));
    const latest   = allSnaps[allSnaps.length - 1];
    const today    = new Date().toISOString().slice(0,10);

    const snap = {
      date: today,
      ...acctTotals,
      // Carry forward tilit + lainat viimeisimmästä
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
    };

    await DB.bulkPutSnapshots([snap]);
    await updateNavCount();
    // Taustasynkka Supabaseen
    setTimeout(() => syncToSupabase(snap), 500);

    // Vaihe 3: Visuaalinen kuittaus
    const calc = calculateNetWorth(snap);
    const prevCalc = latest ? calculateNetWorth(latest) : null;
    const delta = prevCalc ? calc.netWorth - prevCalc.netWorth : null;

    if (icon)  icon.textContent = '✓';
    if (label) label.textContent = 'Snapshot tallennettu!';
    if (btn) {
      btn.style.borderColor = '#3a5535';
      btn.style.background = 'linear-gradient(135deg,#1a3a18,#1a2518)';
    }

    const deltaStr = delta !== null
      ? ` &nbsp;·&nbsp; <span style="color:${delta>=0?'#5a9e6a':'#c05a5a'}">${delta>=0?'+':''}${new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(delta)}</span>`
      : '';

    if (status) {
      status.style.display = 'block';
      status.innerHTML = `✓ ${ok} kurssia haettu (${source})${fallback>0?' · '+fallback+' fallback':''}${usdEur?' · USD/EUR '+usdEur.toFixed(4):''}${deltaStr}`;
    }

    setTimeout(() => {
      if (icon)  icon.textContent = '↻';
      if (label) label.textContent = 'Päivitä kurssit & Jäädytä snapshot';
      if (btn) { btn.disabled = false; btn.style.borderColor=''; btn.style.background=''; }
      renderDashboard();
    }, 2500);

  } catch(e) {
    if (icon)  icon.textContent = '↻';
    if (label) label.textContent = 'Päivitä kurssit & Jäädytä snapshot';
    if (btn)   btn.disabled = false;
    alert('Virhe: ' + e.message);
  }
}

async function seedHoldingsIfEmpty() {
  const existing = await DB.count('holdings');
  if (existing > 0) return; // jo lisätty, ei tehdä mitään
  const today = new Date().toISOString().slice(0, 10);
  for (const h of SEED_HOLDINGS) {
    await DB.putHolding({
      ...h,
      last_price_date: today,
      active: true,
    });
  }
  console.log('Omistukset lisätty automaattisesti (' + SEED_HOLDINGS.length + ' kpl)');
}


// ═══════════════════════════════════════════════
// SUPABASE KAKSISUUNTAINEN SYNKRONOINTI
// ═══════════════════════════════════════════════

// Muuntaa vanhan talous-appin snapshot-formaatin Finance OS -formaattiin
function convertOldSnap(s) {
  const t = s.totals || {};
  const a = s.accounts ? Object.fromEntries(s.accounts.map(a => [a.label, a.saldo])) : {};
  return {
    date:                 s.date,
    nordnet:              t.nordnet              || 0,
    op_osakkeet:          t.op                   || 0,
    tapiola:              0,
    s_sijoitus:           t.ssij                 || 0,
    rahastot:             0,
    lasten_sijoitus:      t.lapset               || 0,
    tulotili:             t.tulotili             || a['Tulotili']             || 0,
    elatustili:           a['Elatustili']         || 0,
    tavoitetili:          a['Tavoitetili']        || 0,
    s_pankki:             a['S-Pankki']           || t.spankki               || 0,
    op_gold:              -(Math.abs(t.opvisa     || a['OP Gold Visa']        || 0)),
    visa:                 0,
    luottotili:           0,
    asuntolaina:          -(Math.abs(t.asunto     || a['Asuntolaina']         || 0)),
    asuntolaina_remontti: -(Math.abs(t.remontti   || a['Asuntolaina (remontti)'] || 0)),
    autolaina:            -(Math.abs(t.auto       || a['Autolaina']           || 0)),
    _source:              'supabase_import',
    _note:                s.note || '',
  };
}

// ── Sync-tila localStorage:ssa ─────────────────────────────────────────
function getSyncMeta()      { try { return JSON.parse(localStorage.getItem('finos_sync_meta') || '{}'); } catch(e) { return {}; } }
function saveSyncMeta(meta) { localStorage.setItem('finos_sync_meta', JSON.stringify(meta)); }

// Lataa data Supabasesta — timestamp-tarkistus ensin (ei lataa turhaan)
async function syncFromSupabase(showStatus) {
  const supaUrl = getSupaUrl();
  const supaKey = getSupaKey();
  if (!supaUrl || !supaKey) return { ok: false, reason: 'no_keys' };

  try {
    // 1. Hae vain updated_at ensin — kevyt kutsu
    const metaR = await fetch(
      supaUrl + '/rest/v1/talous_state?id=eq.main&select=updated_at',
      { headers: { apikey: supaKey, Authorization: 'Bearer ' + supaKey },
        signal: abortSignalWithTimeout(8000) }
    );
    if (!metaR.ok) return { ok: false, reason: 'fetch_error' };
    const metaRows = await metaR.json();
    const remoteUpdatedAt = metaRows && metaRows[0] && metaRows[0].updated_at;

    // 2. Vertaa paikalliseen — jos sama, ei tarvitse ladata mitään
    const syncMeta = getSyncMeta();
    if (remoteUpdatedAt && syncMeta.lastSyncedAt === remoteUpdatedAt) {
      console.log('Sync: ei muutoksia Supabasessa (' + remoteUpdatedAt + ')');
      return { ok: true, imported: 0, skipped: true };
    }

    // 3. Muutoksia — lataa koko data
    const r = await fetch(
      supaUrl + '/rest/v1/talous_state?id=eq.main&select=data',
      { headers: { apikey: supaKey, Authorization: 'Bearer ' + supaKey },
        signal: abortSignalWithTimeout(20000) }
    );
    if (!r.ok) return { ok: false, reason: 'fetch_error', status: r.status };

    const rows = await r.json();
    const data = rows && rows[0] && rows[0].data;
    if (!data) return { ok: false, reason: 'no_data' };

    const remoteSnaps = (data.snaps || []).filter(s => s.date && s.totals);
    if (remoteSnaps.length === 0) return { ok: false, reason: 'empty' };

    // 4. Tuo vain puuttuvat päivät
    const localSnaps = await DB.getAll('snapshots');
    const localDates = new Set(localSnaps.map(s => s.date));
    const toImport = remoteSnaps.filter(s => !localDates.has(s.date));

    if (toImport.length > 0) {
      await DB.bulkPutSnapshots(toImport.map(convertOldSnap));
      console.log('Sync: tuotu ' + toImport.length + ' uutta snapshottia');
    }

    // 5. Synkronoi holdings (kappalemäärät + hankintahinnat)
    if (data.shares || data.costBasis) {
      const holdings = await DB.getAll('holdings');
      for (const h of holdings) {
        const kpl  = data.shares    && data.shares[h.id];
        const cost = data.costBasis && data.costBasis[h.id];
        let changed = false;
        const updated = {...h};
        if (kpl  !== undefined && parseFloat(kpl)  !== h.quantity)       { updated.quantity       = parseFloat(kpl)||0;  changed = true; }
        if (cost !== undefined && parseFloat(cost) !== h.purchase_price)  { updated.purchase_price = parseFloat(cost)||0; changed = true; }
        if (changed) await DB.putHolding(updated);
      }
    }

    // 6. Tallenna sync-aikaleima — seuraava käynnistys on nopea
    saveSyncMeta({
      lastSyncedAt: remoteUpdatedAt || new Date().toISOString(),
      lastDevice:   data._financeOS ? 'Finance OS' : 'Talous-appi',
      snapCount:    remoteSnaps.length,
    });

    return { ok: true, imported: toImport.length, total: remoteSnaps.length };
  } catch(e) {
    console.warn('Supabase sync error:', e.message);
    return { ok: false, reason: e.message };
  }
}

// Tallentaa uuden snapshotin Supabaseen (upload)
async function syncToSupabase(newSnap) {
  const supaUrl = getSupaUrl();
  const supaKey = getSupaKey();
  if (!supaUrl || !supaKey) return;

  try {
    // Lue kaikki snapshotit ja tallenna koko state
    const allSnaps = (await DB.getAll('snapshots'))
      .sort((a,b) => b.date.localeCompare(a.date));
    const holdings = await DB.getAll('holdings');

    // Muunna Finance OS -snapshotit vanhaan formaattiin yhteensopivuuden vuoksi
    const convertedSnaps = allSnaps.map(s => ({
      date: s.date,
      dateFi: (s.date||'').split('-').reverse().join('.'),
      note: s._note || '',
      totals: {
        tilit:    (s.tulotili||0)+(s.elatustili||0)+(s.tavoitetili||0)+(s.s_pankki||0),
        stocks:   (s.nordnet||0)+(s.op_osakkeet||0)+(s.tapiola||0)+(s.s_sijoitus||0)+(s.rahastot||0),
        lainat:   Math.abs(s.asuntolaina||0)+Math.abs(s.asuntolaina_remontti||0)+Math.abs(s.autolaina||0),
        luotot:   Math.abs(s.op_gold||0)+Math.abs(s.visa||0)+Math.abs(s.luottotili||0),
        lapset:   s.lasten_sijoitus||0,
        netto:    0, // lasketaan alla
        tulotili: s.tulotili||0,
        opvisa:   Math.abs(s.op_gold||0),
        nordnet:  s.nordnet||0,
        op:       s.op_osakkeet||0,
        ssij:     s.s_sijoitus||0,
        spankki:  s.s_pankki||0,
        asunto:   Math.abs(s.asuntolaina||0),
        remontti: Math.abs(s.asuntolaina_remontti||0),
        auto:     Math.abs(s.autolaina||0),
      },
    }));
    convertedSnaps.forEach(s => {
      s.totals.netto = s.totals.tilit + s.totals.stocks - s.totals.lainat - s.totals.luotot;
    });

    const shares = {};
    const costBasis = {};
    holdings.forEach(h => { if (h.quantity) shares[h.id] = h.quantity; if (h.purchase_price) costBasis[h.id] = h.purchase_price; });

    const state = {
      snaps: convertedSnaps,
      shares, costBasis,
      accs: {}, customStocks: [], stockBrokers: {}, sales: [],
      _financeOS: true,
      updated_at: new Date().toISOString(),
    };

    const nowISO = new Date().toISOString();
    await fetch(supaUrl + '/rest/v1/talous_state?id=eq.main', {
      method: 'PATCH',
      headers: {
        apikey: supaKey,
        Authorization: 'Bearer ' + supaKey,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      body: JSON.stringify({ data: state, updated_at: nowISO }),
      signal: abortSignalWithTimeout(15000),
    });
    // Päivitä paikallinen sync-meta — tämä laite on ajan tasalla
    saveSyncMeta({
      lastSyncedAt: nowISO,
      lastDevice:   navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Mac',
      snapCount:    convertedSnaps.length,
    });
    console.log('Supabase upload OK — ' + convertedSnaps.length + ' snapshottia');
  } catch(e) {
    console.warn('Supabase upload error:', e.message);
  }
}

async function init() {
  try {
    // Timeout: jos DB ei avaudu 8s kuluessa, näytetään virhe
    const dbTimeout = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Tietokanta ei avautunut (timeout). Yritä ladata sivu uudelleen.')), 8000)
    );
    await Promise.race([DB.init(), dbTimeout]);
  } catch(e) {
    document.body.innerHTML = '<div style="display:flex;flex-direction:column;align-items:center;' +
      'justify-content:center;min-height:100vh;padding:32px;text-align:center;font-family:system-ui;">' +
      '<div style="font-size:32px;margin-bottom:16px;">⚠️</div>' +
      '<div style="font-size:18px;font-weight:700;margin-bottom:12px;color:#c05a5a;">Latausvirhe</div>' +
      '<div style="font-size:14px;color:#666;max-width:320px;line-height:1.6;margin-bottom:24px;">' + e.message + '</div>' +
      '<button onclick="location.reload()" style="background:#1a3a2a;border:1px solid #3a7a4a;' +
      'color:#5a9e6a;padding:12px 24px;border-radius:8px;font-size:14px;font-weight:700;cursor:pointer;">' +
      '↻ Yritä uudelleen</button>' +
      '<div style="font-size:12px;color:#999;margin-top:16px;">Jos ongelma jatkuu, tarkista että Safari ei ole yksityistilassa.</div>' +
      '</div>';
    return;
  }

  try { await seedHoldingsIfEmpty(); } catch(e) { console.warn('Seed failed:', e); }
  try { await updateNavCount(); } catch(e) { console.warn('NavCount failed:', e); }

  let cnt = 0;
  try { cnt = await DB.count('snapshots'); } catch(e) { console.warn('Count failed:', e); }

  if (cnt === 0) {
    // Tyhjä paikallinen DB — yritä ladata Supabasesta ensin
    const el = document.getElementById('db-content');
    showView('dashboard');
    if (el) el.innerHTML = '<div style="padding:40px;text-align:center;color:#5a9e6a;font-family:monospace;">' +
      '<div style="font-size:24px;margin-bottom:12px;">⟳</div>' +
      '<div>Ladataan dataa Supabasesta...</div></div>';

    const result = await syncFromSupabase(true);
    const newCnt = await DB.count('snapshots').catch(() => 0);

    if (newCnt > 0) {
      await updateNavCount();
      requestAnimationFrame(() => renderDashboard());
    } else {
      showView('import');
      if (result.reason === 'no_keys') {
        const imp = document.querySelector('#view-import');
        if (imp) {
          const note = document.createElement('div');
          note.style.cssText = 'margin:16px;padding:12px;background:rgba(184,149,106,.1);border:1px solid rgba(184,149,106,.3);border-radius:8px;font-size:12px;color:#b8956a;font-family:monospace;';
          note.textContent = '💡 Syötä Supabase-avaimet ⚙-asetuksista niin historia latautuu automaattisesti.';
          imp.prepend(note);
        }
      }
    }
  } else {
    showView('dashboard');
    try { requestAnimationFrame(() => renderDashboard()); } catch(e) {
      console.error('Dashboard render error:', e);
      const c = document.getElementById('db-content');
      if (c) c.innerHTML = '<div style="padding:20px;color:#c05a5a;font-family:monospace;font-size:12px;">' +
        '⚠ Dashboard-virhe: ' + e.message + '<br><br>' +
        '<button onclick="location.reload()" style="padding:8px 16px;border:1px solid #3a7a4a;' +
        'background:#1a3a2a;color:#5a9e6a;border-radius:6px;cursor:pointer;">↻ Lataa uudelleen</button></div>';
    }
    // Taustasynkka — tarkista onko Supabasessa uudempaa dataa
    setTimeout(async () => {
      const result = await syncFromSupabase(false);
      if (result.ok && result.imported > 0) {
        await updateNavCount();
        renderDashboard();
        console.log('Taustasynkka: ' + result.imported + ' uutta snapshottia ladattu');
      }
    }, 2000);
  }
}

// iOS "Add to Home Screen" nudge
(function() {
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.navigator.standalone;
  const dismissed = localStorage.getItem('pwa_nudge_dismissed');
  if (isIOS && !isStandalone && !dismissed) {
    const banner = document.createElement('div');
    banner.id = 'pwa-banner';
    banner.innerHTML = `
      <div style="position:fixed;bottom:0;left:0;right:0;
                  background:#1a1d1b;border-top:1px solid #2c3130;
                  padding:14px 20px calc(14px + env(safe-area-inset-bottom));
                  display:flex;align-items:center;gap:12px;z-index:9999;">
        <div style="font-size:28px;">📲</div>
        <div style="flex:1;">
          <div style="font-size:13px;font-weight:700;color:#e2ddd4;margin-bottom:2px;">Lisää kotinäytölle</div>
          <div style="font-size:11px;color:#6e7470;">Paina <strong style="color:#b8956a;">⬆ Jaa</strong> → "Lisää kotivalikkoon"</div>
        </div>
        <button onclick="document.getElementById('pwa-banner').remove();localStorage.setItem('pwa_nudge_dismissed','1')"
                style="background:none;border:none;color:#6e7470;font-size:20px;cursor:pointer;padding:4px;">✕</button>
      </div>`;
    document.body.appendChild(banner);
  }
})();

init().catch(err => {
  console.error('Init error:', err);
  const c = document.getElementById('db-content');
  if (c) c.innerHTML = `<div class="empty">
    <div class="empty-icon">⚠️</div>
    <div class="empty-title">Latausvirhe</div>
    <p style="color:var(--text2);margin-bottom:16px;">${err.message || err}</p>
    <button class="btn-p" onclick="location.reload()">Yritä uudelleen</button>
  </div>`;
});