// SYNC VERSION 20260526-2
console.log("SYNC VERSION 20260526-2");
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
    return (d && d.c && d.c !== 0) ? { price: d.c, day_change_pct: (d.dp ?? null) } : null;
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
  // Varmista ensin ettÃ¤ avaimet on asetettu
  const apiKey = getFinnhubKey();
  const supaKey = getSupaKey();
  if (!apiKey && !supaKey) {
    const ok = confirm('Avaimia ei ole asetettu.\n\nPaina OK avataksesi Asetukset (â) ja syÃ¶tÃ¤ Supabase- tai Finnhub-avain.');
    if (ok) toggleSettings();
    return;
  }
  // Siirry dashboardille ja kÃ¤ynnistÃ¤
  showView('dashboard');
  setTimeout(() => refreshAndFreeze(), 100);
}


// âââââââââââââââââââââââââââââââââââââââââââââââ
// PÃIVITÃ & JÃÃDYTÃ â PÃ¤ivÃ¤rituaali
// âââââââââââââââââââââââââââââââââââââââââââââââ

async function refreshAllMarketData() {
  const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.ticker && h.last_price_src !== 'Manuaalinen');
  const tickers  = [...new Set(holdings.map(h => h.ticker))];
  const today    = new Date().toISOString().slice(0,10);
  const timeNow  = new Date().toLocaleTimeString('fi-FI', {hour:'2-digit',minute:'2-digit'});

  const apiKey   = getFinnhubKey();
  const supaUrl  = getSupaUrl();
  const supaKey  = getSupaKey();

  let usdEur = null, results = {}, source = 'Finnhub';

  // YritÃ¤ Supabase Edge Function ensin
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
          if (q?.price) results[t] = {price: q.price, src: 'Supabase', stale: q.stale || false, day_change_pct: (q.changePct != null ? q.changePct * 100 : null)};
        }
        source = 'Supabase';
      }
    } catch(e) { console.warn('Supabase EF failed:', e.message); }
  }

  // Fallback: Finnhub suora
  if (Object.keys(results).length < tickers.length && apiKey) {
    if (!usdEur) usdEur = await fetchUsdEur(apiKey);
    for (const ticker of tickers) {
      const raw = await fetchFinnhubQuote(ticker, apiKey);
      if (raw) {
        const cur = TICKER_CURRENCY[ticker] || 'EUR';
        const priceEur = (cur === 'USD' && usdEur) ? raw.price * usdEur : raw.price;
        results[ticker] = {price: priceEur, src: 'Finnhub', stale: false, day_change_pct: raw.day_change_pct};
      }
    }
    source = 'Finnhub';
  }

  // PÃ¤ivitÃ¤ holdings IndexedDB:hen â lisÃ¤Ã¤ lÃ¤hde ja aika
  let ok = 0, fallback = 0;
  for (const h of holdings) {
    const res = results[h.ticker];
    if (res?.price) {
      await DB.putHolding({
        ...h,
        last_price:      parseFloat(res.price.toFixed(4)),
        last_price_date: today,
        last_price_src:  res.stale ? 'Fallback' : res.src,
        day_change_pct:  res.day_change_pct ?? null,
      });
      ok++;
    } else {
      // Ei saatu kurssia â merkitÃ¤Ã¤n Fallback (sÃ¤ilytetÃ¤Ã¤n vanha hinta)
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
    if (confirm('Avaimia ei ole asetettu.\n\nPaina OK â Asetukset avautuu â syÃ¶tÃ¤ Supabase anon key + URL â Tallenna â paina nappia uudelleen.')) {
      toggleSettings();
    }
    return;
  }

  const btn        = document.getElementById('btn-freeze-nav');
  const btnFloat   = document.getElementById('btn-freeze-float');
  const icon       = document.getElementById('btn-freeze-icon-nav');
  const iconFloat  = document.getElementById('btn-freeze-icon-float');
  const label      = null;
  const status     = document.getElementById('freeze-status');

try {
  if (btn) btn.classList.add('pressed');
  if (btnFloat) btnFloat.classList.add('pressed');
  setTimeout(function() {
    if (btn) btn.classList.remove('pressed');
    if (btnFloat) btnFloat.classList.remove('pressed');
  }, 120);
} catch(e) {}
  if (btn)       { btn.disabled = true; btn.style.opacity = '0.5'; }
  if (btnFloat)  { btnFloat.disabled = true; btnFloat.style.opacity = '0.7'; }
  if (icon)       icon.textContent = 'â³';
  if (iconFloat)  iconFloat.textContent = 'â³';

  try {
    // Vaihe 1: Hae kurssit
    const {ok, fallback, usdEur, source} = await refreshAllMarketData();

    if (label) label.textContent = 'JÃ¤Ã¤dytetÃ¤Ã¤n snapshot...';

    // Vaihe 2: Laske ja jÃ¤Ã¤dytÃ¤ snapshot
    const holdings = (await DB.getAll('holdings')).filter(h => h.active !== false && h.last_price);
    if (holdings.length === 0) {
      if (icon)       icon.textContent = 'â»';
      if (iconFloat)  iconFloat.textContent = 'â»';
      if (btn)       { btn.disabled = false; btn.style.opacity = ''; }
      if (btnFloat)  { btnFloat.disabled = false; btnFloat.style.opacity = ''; }
      if (status) {
        status.style.display = 'block';
        status.style.background = 'rgba(192,90,90,.08)';
        status.style.borderColor = 'rgba(192,90,90,.25)';
        status.style.color = '#c05a5a';
        status.innerHTML = 'â  Kursseja ei saatu. Tarkista avaimet: paina â â syÃ¶tÃ¤ Supabase URL + anon key â Tallenna';
      }
      return;
    }

    // Per-tili yhteissummat holdingseista
    const acctTotals = {};
    for (const h of holdings) {
      const val = (h.quantity || 0) * (h.last_price || 0);
      acctTotals[h.account] = (acctTotals[h.account] || 0) + val;
    }

    // Hae ensin Supabasesta â varmistaa ettÃ¤ carry-forward kÃ¤yttÃ¤Ã¤
    // uusinta dataa (esim. iPhonella pÃ¤ivitetty tulotili tulee mukaan)
    await syncFromSupabase().catch(() => {});

    // Hae viimeisin snapshot baseline-arvoksi (tilit, lainat)
    // Hae viimeisin snapshot baseline-arvoksi.
    // KÃ¤ytetÃ¤Ã¤n UUSINTA snapshotia (myÃ¶s tÃ¤nÃ¤Ã¤n tallennettu),
    // jotta kÃ¤yttÃ¤jÃ¤n samana pÃ¤ivÃ¤nÃ¤ syÃ¶ttÃ¤mÃ¤t tulot/lainat sÃ¤ilyvÃ¤t PÃ¤ivitÃ¤-toiminnossa.
    // Vanha filter(s.date < today) esti tÃ¤mÃ¤n ja aiheutti datan katoamisen.
    const allSnaps = (await DB.getAll('snapshots')).sort((a,b)=>a.date.localeCompare(b.date));
    const today    = new Date().toISOString().slice(0,10);
    const latest   = allSnaps[allSnaps.length - 1];

    const snap = {
      date: today,
      ...acctTotals,
      // Carry forward tilit + lainat viimeisimmÃ¤stÃ¤
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
      // Kassavirta â sÃ¤ilytetÃ¤Ã¤n kÃ¤yttÃ¤jÃ¤n syÃ¶ttÃ¤mÃ¤t tulot
      tulot_kk:             latest?.tulot_kk,
      tulot_items:          latest?.tulot_items,
      rytmi_items:          latest?.rytmi_items,
      tulot_pvm:            latest?.tulot_pvm,
      menot_kk:             latest?.menot_kk,
      nordnet_cash:         latest?.nordnet_cash,
      tulevat_items:        latest?.tulevat_items,
      _updatedAt:           new Date().toISOString(),
    };

    await DB.bulkPutSnapshots([snap]);
    await updateNavCount();
    // Taustasynkka Supabaseen
    setTimeout(() => syncToSupabase(snap), 500);
    // Automaattinen varmuuskopio
    setTimeout(() => autoBackup(), 1000);
    setTimeout(() => autoBackup(), 2000);

    // Vaihe 3: Visuaalinen kuittaus
    const calc = calculateNetWorth(snap);
    const prevCalc = latest ? calculateNetWorth(latest) : null;
    const delta = prevCalc ? calc.netWorth - prevCalc.netWorth : null;

    if (icon)  icon.textContent = 'â';
    if (btn) {
      btn.style.color = 'var(--gold)';
      btn.style.borderColor = 'var(--gold-dim)';
    }

    const deltaStr = delta !== null
      ? ` &nbsp;Â·&nbsp; <span style="color:${delta>=0?'#5a9e6a':'#c05a5a'}">${delta>=0?'+':''}${new Intl.NumberFormat('fi-FI',{style:'currency',currency:'EUR',maximumFractionDigits:0}).format(delta)}</span>`
      : '';

    if (status) {
      status.style.display = 'block';
      status.innerHTML = `â ${ok} kurssia haettu (${source})${fallback>0?' Â· '+fallback+' fallback':''}${usdEur?' Â· USD/EUR '+usdEur.toFixed(4):''}${deltaStr}`;
    }

    setTimeout(() => {
      if (icon)       icon.textContent = 'â»';
      if (iconFloat)  iconFloat.textContent = 'â»';
      if (btn)       { btn.disabled = false; btn.style.opacity = ''; btn.style.color = ''; btn.style.borderColor = ''; }
      if (btnFloat)  { btnFloat.disabled = false; btnFloat.style.opacity = ''; }
      renderDashboard();
    }, 2500);

  } catch(e) {
    if (icon)       icon.textContent = 'â»';
    if (iconFloat)  iconFloat.textContent = 'â»';
    if (btn)       { btn.disabled = false; btn.style.opacity = ''; }
    if (btnFloat)  { btnFloat.disabled = false; btnFloat.style.opacity = ''; }
    alert('Virhe: ' + e.message);
  }
}

async function seedHoldingsIfEmpty() {
  const existing = await DB.count('holdings');
  if (existing > 0) return; // jo lisÃ¤tty, ei tehdÃ¤ mitÃ¤Ã¤n
  const today = new Date().toISOString().slice(0, 10);
  for (const h of SEED_HOLDINGS) {
    await DB.putHolding({
      ...h,
      last_price_date: today,
      active: true,
    });
  }
  console.log('Omistukset lisÃ¤tty automaattisesti (' + SEED_HOLDINGS.length + ' kpl)');
}


// âââââââââââââââââââââââââââââââââââââââââââââââ
// SUPABASE KAKSISUUNTAINEN SYNKRONOINTI
// âââââââââââââââââââââââââââââââââââââââââââââââ

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

// ââ Sync-tila localStorage:ssa âââââââââââââââââââââââââââââââââââââââââ
function getSyncMeta()      { try { return JSON.parse(localStorage.getItem('finos_sync_meta') || '{}'); } catch(e) { return {}; } }
function saveSyncMeta(meta) { localStorage.setItem('finos_sync_meta', JSON.stringify(meta)); }

// Lataa data Supabasesta â timestamp-tarkistus ensin (ei lataa turhaan)
async function syncFromSupabase(showStatus) {
  const supaUrl = getSupaUrl();
  const supaKey = getSupaKey();
  if (!supaUrl || !supaKey) return { ok: false, reason: 'no_keys' };

  try {
    // 1. Hae vain updated_at ensin â kevyt kutsu
    const metaR = await fetch(
      supaUrl + '/rest/v1/talous_state?id=eq.main&select=updated_at',
      { headers: { apikey: supaKey, Authorization: 'Bearer ' + supaKey },
        signal: abortSignalWithTimeout(8000) }
    );
    if (!metaR.ok) return { ok: false, reason: 'fetch_error' };
    const metaRows = await metaR.json();
    const remoteUpdatedAt = metaRows && metaRows[0] && metaRows[0].updated_at;

    // 2. Vertaa paikalliseen â jos sama, ei tarvitse ladata mitÃ¤Ã¤n
    const syncMeta = getSyncMeta();
    if (remoteUpdatedAt && syncMeta.lastSyncedAt === remoteUpdatedAt) {
      console.log('Sync: ei muutoksia Supabasessa (' + remoteUpdatedAt + ')');
      return { ok: true, imported: 0, skipped: true };
    }

    // 3. Muutoksia â lataa koko data
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

    // 4. Tuo puuttuvat pÃ¤ivÃ¤t JA pÃ¤ivitÃ¤ tilitiedot olemassa oleviin
    //    KORJAUS: aiemmin sama pÃ¤ivÃ¤mÃ¤Ã¤rÃ¤ ohitettiin kokonaan â iPhonen
    //    tilitiedot eivÃ¤t pÃ¤ivittyneet Macille. Nyt sama pÃ¤ivÃ¤ mergataan.
    const localSnaps = await DB.getAll('snapshots');
    const localByDate = {};
    localSnaps.forEach(s => { localByDate[s.date] = s; });

    const toImport  = [];
    const toMerge   = [];

    for (const remote of remoteSnaps) {
      const local = localByDate[remote.date];
      if (!local) {
        // Uusi pÃ¤ivÃ¤ â tuo suoraan
        const imported = convertOldSnap(remote);
        if (remote.finos) {
          if (Array.isArray(remote.finos.tulot_items))   imported.tulot_items       = remote.finos.tulot_items;
          if (Array.isArray(remote.finos.rytmi_items))    imported.rytmi_items       = remote.finos.rytmi_items;
          if (Array.isArray(remote.finos.tulevat_items))  imported.tulevat_items     = remote.finos.tulevat_items;
          if (remote.finos.tulot_kk          != null)    imported.tulot_kk          = remote.finos.tulot_kk;
          if (remote.finos.menot_kk          != null)    imported.menot_kk          = remote.finos.menot_kk;
          if (remote.finos.muut_tulot        != null)    imported.muut_tulot        = remote.finos.muut_tulot;
          if (remote.finos.tulot_pvm         != null)    imported.tulot_pvm         = remote.finos.tulot_pvm;
          if (remote.finos.holdings_snapshot != null)    imported.holdings_snapshot = remote.finos.holdings_snapshot;
          if (remote.finos.nordnet_cash      != null)    imported.nordnet_cash      = remote.finos.nordnet_cash;
          if (remote.finos._updatedAt)                   imported._updatedAt        = remote.finos._updatedAt;
        }
        toImport.push(imported);
        continue;
      }
      // Sama pÃ¤ivÃ¤ â vertaa tilitietoja
      // remote.totals on vanha formaatti: { tulotili, opvisa, asunto, remontti, auto, ... }
      const rt = remote.totals || {};
      const remTulotili = typeof rt.tulotili === 'number' ? rt.tulotili : null;
      const remOpGold   = typeof rt.opvisa   === 'number' ? rt.opvisa   : null;

      // PÃ¤ivitÃ¤ jos remote:lla on kÃ¤yttÃ¤jÃ¤n syÃ¶ttÃ¤miÃ¤ arvoja jotka poikkeavat paikallisesta
      const tuloChanged = remTulotili !== null && remTulotili !== (local.tulotili ?? null);
      const goldChanged = remOpGold   !== null &&
        Math.abs(remOpGold) !== Math.abs(local.op_gold ?? 0);
      // snapChanged: remote has a newer _updatedAt than local
      const snapChanged = !!(remote.finos?._updatedAt &&
        (!local._updatedAt || remote.finos._updatedAt > local._updatedAt));
      // finosMissing: bootstrap â local has never had finos fields, take remote's
      const finosMissing = !!(remote.finos && !('tulot_items' in local));

      if (tuloChanged || goldChanged || snapChanged || finosMissing) {
        // Merge: sÃ¤ilytÃ¤ paikalliset kurssitiedot, pÃ¤ivitÃ¤ tilitiedot remotesta
        const merged = {
          ...local,
          tulotili:             remTulotili    ?? local.tulotili,
          op_gold:              remOpGold != null ? -Math.abs(remOpGold) : local.op_gold,
          asuntolaina:          rt.asunto  != null ? -Math.abs(rt.asunto)   : local.asuntolaina,
          asuntolaina_remontti: rt.remontti != null ? -Math.abs(rt.remontti) : local.asuntolaina_remontti,
          autolaina:            rt.auto     != null ? -Math.abs(rt.auto)     : local.autolaina,
          s_pankki:             rt.spankki  != null ? rt.spankki             : local.s_pankki,
          _mergedFromRemote:    true,
        };
        // Apply finos fields when remote is newer or local is missing them
        if (remote.finos && (snapChanged || finosMissing)) {
          if (Array.isArray(remote.finos.tulot_items))   merged.tulot_items       = remote.finos.tulot_items;
          if (Array.isArray(remote.finos.rytmi_items))    merged.rytmi_items       = remote.finos.rytmi_items;
          if (remote.finos.tulot_kk          != null)    merged.tulot_kk          = remote.finos.tulot_kk;
          if (remote.finos.menot_kk          != null)    merged.menot_kk          = remote.finos.menot_kk;
          if (remote.finos.muut_tulot        != null)    merged.muut_tulot        = remote.finos.muut_tulot;
          if (remote.finos.tulot_pvm         != null)    merged.tulot_pvm         = remote.finos.tulot_pvm;
          if (remote.finos.holdings_snapshot != null)    merged.holdings_snapshot = remote.finos.holdings_snapshot;
          if (remote.finos.nordnet_cash      != null)    merged.nordnet_cash      = remote.finos.nordnet_cash;
          if (remote.finos._updatedAt)                   merged._updatedAt        = remote.finos._updatedAt;
          if (Array.isArray(remote.finos.tulevat_items))  merged.tulevat_items     = remote.finos.tulevat_items;
        }
        toMerge.push(merged);
      }
    }

    if (toImport.length > 0) {
      await DB.bulkPutSnapshots(toImport);  // jo konvertoitu ylempÃ¤nÃ¤
    }
    if (toMerge.length > 0) {
      await DB.bulkPutSnapshots(toMerge);
    }
    const totalChanged = toImport.length + toMerge.length;
    if (totalChanged > 0) {
      console.log('Sync: tuotu ' + toImport.length + ' uutta, pÃ¤ivitetty ' + toMerge.length + ' olemassa olevaa');
    }

    // 5. Synkronoi holdings (kentÃ¤t _key-matchauksella)
    if (data.holdingsFull && data.holdingsFull.length > 0) {
      const localHoldings = await DB.getAll('holdings');
      const byKey = {};
      localHoldings.forEach(h => {
        const k = (h.ticker||'')+'|'+(h.display_name||'')+'|'+(h.account||'');
        byKey[k] = h;
      });
      for (const r of data.holdingsFull) {
        const existing = byKey[r._key];
        if (!existing) continue;
        const useRemote = r.last_price !== null && r.last_price !== undefined &&
          (!existing.last_price || (r.last_price_date||'') >= (existing.last_price_date||''));
        const qChanged  = r.quantity       !== undefined && r.quantity       !== existing.quantity;
        const cpChanged = r.purchase_price !== undefined && r.purchase_price !== existing.purchase_price;
        const dnChanged = r.display_name   !== undefined && r.display_name   !== existing.display_name;
        if (!useRemote && !qChanged && !cpChanged && !dnChanged) continue;
        await DB.putHolding({
          ...existing,
          quantity:        qChanged  ? (r.quantity       ?? existing.quantity)       : existing.quantity,
          purchase_price:  cpChanged ? (r.purchase_price ?? existing.purchase_price) : existing.purchase_price,
          display_name:    dnChanged ? (r.display_name   ?? existing.display_name)   : existing.display_name,
          last_price:      useRemote ? r.last_price      : existing.last_price,
          last_price_date: useRemote ? r.last_price_date : existing.last_price_date,
          last_price_src:  useRemote ? r.last_price_src  : existing.last_price_src,
        });
      }
    } else if (data.shares || data.costBasis) {
      // Fallback: vanha logiikka (iOS/vanha versio ilman holdingsFull)
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

    // 6. Tallenna sync-aikaleima â seuraava kÃ¤ynnistys on nopea
    saveSyncMeta({
      lastSyncedAt: remoteUpdatedAt || new Date().toISOString(),
      lastDevice:   data._financeOS ? 'Finance OS' : 'Talous-appi',
      snapCount:    remoteSnaps.length,
      syncFailed:   false,
    });

    return { ok: true, imported: toImport.length, total: remoteSnaps.length };
  } catch(e) {
    console.warn('Supabase sync error:', e.message);
    saveSyncMeta({...getSyncMeta(), syncFailed: true, lastSyncedAt: getSyncMeta().lastSyncedAt});
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
      finos: {
        tulot_items:       s.tulot_items       || [],
        rytmi_items:       s.rytmi_items       || [],
        tulot_kk:          s.tulot_kk          ?? null,
        menot_kk:          s.menot_kk          ?? null,
        muut_tulot:        s.muut_tulot        ?? null,
        tulot_pvm:         s.tulot_pvm         ?? null,
        holdings_snapshot: s.holdings_snapshot || null,
        nordnet_cash:      s.nordnet_cash      ?? null,
        tulevat_items: s.tulevat_items || [],
        _updatedAt:        s._updatedAt        || null,
      },
    }));
    convertedSnaps.forEach(s => {
      s.totals.netto = s.totals.tilit + s.totals.stocks - s.totals.lainat - s.totals.luotot;
    });

    const shares = {};
    const costBasis = {};
    holdings.forEach(h => { if (h.quantity) shares[h.id] = h.quantity; if (h.purchase_price) costBasis[h.id] = h.purchase_price; });

    const holdingsFull = holdings.map(h => ({
      _key:            (h.ticker||'')+'|'+(h.display_name||'')+'|'+(h.account||''),
      quantity:        h.quantity        ?? 0,
      purchase_price:  h.purchase_price  ?? null,
      last_price:      h.last_price      ?? null,
      last_price_date: h.last_price_date || null,
      last_price_src:  h.last_price_src  || null,
      display_name:    h.display_name    || null,
    }));
    const state = {
      snaps: convertedSnaps,
      shares, costBasis, holdingsFull,
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
    // PÃ¤ivitÃ¤ paikallinen sync-meta â tÃ¤mÃ¤ laite on ajan tasalla
    saveSyncMeta({
      lastSyncedAt: nowISO,
      lastDevice:   navigator.userAgent.includes('iPhone') ? 'iPhone' : 'Mac',
      snapCount:    convertedSnaps.length,
      syncFailed:   false,
    });
    console.log('Supabase upload OK â ' + convertedSnaps.length + ' snapshottia');
  } catch(e) {
    console.warn('Supabase upload error:', e.message);
    saveSyncMeta({...getSyncMeta(), syncFailed: true, lastSyncedAt: getSyncMeta().lastSyncedAt});
  }
}

// âââââââââââââââââââââââââââââââââââââââââââââââ
// AUTOMAATTINEN VARMUUSKOPIO â Rolling backups
// âââââââââââââââââââââââââââââââââââââââââââââââ

async function autoBackup() {
  try {
    const snaps    = await DB.getAll('snapshots');
    const holdings = await DB.getAll('holdings');
    const events   = await DB.getAll('events').catch(() => []);
    const pins     = await DB.getAll('pins').catch(() => []);

    const now     = new Date();
    const dateStr = now.toISOString().slice(0,10);
    const tsStr   = now.toISOString();

    const backup = {
      id:        'backup_' + dateStr,
      created_at: tsStr,
      snapCount: snaps.length,
      data: { snaps, holdings, events, pins }
    };

    await DB.putBackup(backup);

    // Rolling cleanup: keep last 7 daily + last 4 weekly + last 12 monthly
    const allBackups = (await DB.getAll('backups')).sort((a,b) => b.id.localeCompare(a.id));
    
    // Build keep set
    const keepIds = new Set();
    let weekCount = 0, monthCount = 0;
    
    allBackups.forEach((b, i) => {
      if (i < 7) { keepIds.add(b.id); return; }  // 7 daily
      const d = new Date(b.created_at);
      const dow = d.getDay();
      if (dow === 0 && weekCount < 4)  { keepIds.add(b.id); weekCount++;  return; }
      if (d.getDate() === 1 && monthCount < 12) { keepIds.add(b.id); monthCount++; }
    });

    await DB.clearOldBackups([...keepIds]);
    
    // Update status
    localStorage.setItem('finos_last_backup', tsStr);
    localStorage.setItem('finos_backup_count', (await DB.getAll('backups').catch(() => [])).length);
    
    console.log('Automaattinen varmuuskopio tallennettu: ' + dateStr);
  } catch(e) {
    console.warn('Backup error:', e.message);
  }
}

async function restoreFromBackup(backupId) {
  const backups = await DB.getAll('backups');
  const backup  = backups.find(b => b.id === backupId);
  if (!backup) { alert('Varmuuskopiota ei lÃ¶ydy.'); return; }
  
  if (!confirm('Palautetaanko varmuuskopio ' + backup.id.replace('backup_','') + '?\n\nTÃ¤mÃ¤ KORVAA nykyisen datan varmuuskopiolla.')) return;
  
  await DB.bulkPutSnapshots(backup.data.snaps || []);
  for (const h of (backup.data.holdings || [])) await DB.putHolding(h);
  
  alert('Varmuuskopio palautettu! ' + (backup.data.snaps?.length || 0) + ' snapshottia.');
  location.reload();
}

function backupStatusText() {
  const last = localStorage.getItem('finos_last_backup');
  const count = localStorage.getItem('finos_backup_count') || '?';
  if (!last) return 'Ei varmuuskopioita';
  const d = new Date(last);
  return count + ' varmuuskopiota Â· viimeisin ' + d.toLocaleDateString('fi-FI');
}
