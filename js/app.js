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