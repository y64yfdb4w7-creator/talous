function detectSep(text) {
  const first = text.split('\n')[0] || '';
  return (first.split(';').length > first.split(',').length) ? ';' : ',';
}

function parseCSV(text) {
  const sep = detectSep(text);
  const rows = [];
  for (const line of text.split(/\r?\n/)) {
    if (!line.trim()) continue;
    const fields = [];
    let f = '', inQ = false;
    for (let i = 0; i <= line.length; i++) {
      const ch = line[i];
      if (i === line.length) {
        fields.push(f.trim());
      } else if (ch === '"') {
        if (inQ && line[i+1] === '"') { f += '"'; i++; }
        else inQ = !inQ;
      } else if (ch === sep && !inQ) {
        fields.push(f.trim());
        f = '';
      } else {
        f += ch;
      }
    }
    rows.push(fields);
  }
  return rows;
}

// ═══════════════════════════════════════════════
// FIELD DEFINITIONS
// ═══════════════════════════════════════════════
const FIELDS = {
  date:                 { label: 'Päivämäärä',          cat: 'date' },
  skip:                 { label: '— Ohita —',            cat: 'skip' },
  nordnet:              { label: 'Nordnet',              cat: 'investment' },
  op_osakkeet:          { label: 'OP Osakkeet',          cat: 'investment' },
  tapiola:              { label: 'Tapiola',              cat: 'investment' },
  s_sijoitus:           { label: 'S-Sijoitus',           cat: 'investment' },
  rahastot:             { label: 'Rahastot',             cat: 'investment' },
  lasten_sijoitus:      { label: 'Lasten sijoitus',      cat: 'investment' },
  tulotili:             { label: 'Tulotili',             cat: 'account' },
  elatustili:           { label: 'Elatustili',           cat: 'account' },
  tavoitetili:          { label: 'Tavoitetili',          cat: 'account' },
  s_pankki:             { label: 'S-Pankki',             cat: 'account' },
  op_gold:              { label: 'OP Gold',              cat: 'account' },
  visa:                 { label: 'VISA',                 cat: 'account' },
  luottotili:           { label: 'Luottotili',           cat: 'account' },
  asuntolaina:          { label: 'Asuntolaina',          cat: 'loan' },
  asuntolaina_remontti: { label: 'Asuntolaina (remontti)',cat: 'loan' },
  autolaina:            { label: 'Autolaina',            cat: 'loan' },
  osakkeet_yht:         { label: 'Osakkeet yht.',        cat: 'calculated' },
  tilit_yht:            { label: 'Tilit yht.',           cat: 'calculated' },
  tilit_osakkeet_yht:   { label: 'Tilit+Osakkeet',       cat: 'calculated' },
  asuntolaina_yht:      { label: 'Asuntolaina yht.',     cat: 'calculated' },
  kaikki_lainat:        { label: 'Kaikki lainat',        cat: 'calculated' },
  net_worth:            { label: 'Nettovarallisuus ★',   cat: 'calculated' },
  lainalyhennys_kk:     { label: 'Lainalyhennys/kk',     cat: 'info' },
  kulutus_kk:           { label: 'Kulutus/kk',           cat: 'info' },
  vuosikehitys_pct:     { label: 'Vuosikehitys %',       cat: 'info' },
  vuosikehitys_eur:     { label: 'Vuosikehitys €',       cat: 'info' },
  osinko:               { label: 'Osinko',               cat: 'event' },
  osingot_nordnet:      { label: 'Osingot Nordnet',      cat: 'event' },
  osingot_op:           { label: 'Osingot OP',           cat: 'event' },
  isot_hankinnat:       { label: 'Isot hankinnat',       cat: 'event' },
  osakeostot:           { label: 'OsakeOstot',           cat: 'event' },
  myynti:               { label: 'Myynti',               cat: 'event' },
  siirto_aot_sisaan:    { label: 'Siirto AOT:lle',       cat: 'event' },
  siirto_aot_ulos:      { label: 'Siirto AOT:lta',       cat: 'event' },
  huom:                 { label: 'Huom. (muistiinpano)', cat: 'event' },
};

// Normalized header → internal field
const HDR_MAP = {
  'pvm':                                        'date',
  'nordnet':                                    'nordnet',
  'op osakkeet':                                'op_osakkeet',
  'tapiola':                                    'tapiola',
  's - sijoitus':                               's_sijoitus',
  's-sijoitus':                                 's_sijoitus',
  'osak-keet yht.':                             'osakkeet_yht',
  'osakkeet yht':                               'osakkeet_yht',
  'osakkeet yht.':                              'osakkeet_yht',
  'kaikki lainat':                              'kaikki_lainat',
  'tulotili - visa ja jatkuva luotto':          'skip',
  'tulotili':                                   'tulotili',
  'elatustili':                                 'elatustili',
  'tavoitetili':                                'tavoitetili',
  's - pankki':                                 's_pankki',
  's-pankki':                                   's_pankki',
  'op gold':                                    'op_gold',
  'tilit yht':                                  'tilit_yht',
  'tilit yht.':                                 'tilit_yht',
  'tilit+ osakkeet yht':                        'tilit_osakkeet_yht',
  'tilit+osakkeet yht':                         'tilit_osakkeet_yht',
  'visa':                                       'visa',
  'jakuva luottotili':                          'luottotili',
  'jatkuva luottotili':                         'luottotili',
  'asuntolaina':                                'asuntolaina',
  'asuntolaina (peruskorjaus)':                 'asuntolaina_remontti',
  'autolaina':                                  'autolaina',
  'asuntolaina yht':                            'asuntolaina_yht',
  'asuntolaina yht.':                           'asuntolaina_yht',
  'visa + op gold + luottotili':                'skip',
  'lasten sijoitusrahastoon':                   'lasten_sijoitus',
  'lasten sijoitusrahasto':                     'lasten_sijoitus',
  'osinko':                                     'osinko',
  'omaisuus - lainat':                          'net_worth',
  'lainalyhennys+korko kk':                     'lainalyhennys_kk',
  'lainalyhennys+korko':                        'lainalyhennys_kk',
  'kulutus kuukaudessa':                        'kulutus_kk',
  'vuosikehitys %':                             'vuosikehitys_pct',
  'vuosikehitys euroissa':                      'vuosikehitys_eur',
  'isot hankinnat':                             'isot_hankinnat',
  'osingot nordnet':                            'osingot_nordnet',
  'osingot op':                                 'osingot_op',
  'rahastot':                                   'rahastot',
  'autolaina tulotilillä':                      'skip',
  'autolaina tulotililla':                      'skip',
  'omat sijoitukset ed. merk.':                 'skip',
  'kehitys 2017 asti':                          'skip',
  'tulotilin kk seu-ranta %':                   'skip',
  'tulotilin kk seuranta %':                    'skip',
  'tuohi-kortti':                               'skip',
  'asuntolaina remontti':                       'skip',
  'tulotilin kuukausi seuranta':                'skip',
  'op osakekaupankäynti raha ei vielä tilillä': 'skip',
  'osakeostot':                                 'osakeostot',
  'myynti':                                     'myynti',
  'siirrto arvo-osuustilille':                  'siirto_aot_sisaan',
  'siirto arvo-osuustilille':                   'siirto_aot_sisaan',
  'siirto arvo-osuustililtä':                   'siirto_aot_ulos',
  'siirto arvo-osuustililtä':                   'siirto_aot_ulos',
  'huom.':                                      'huom',
  'huom':                                       'huom',
};

function guessField(hdr) {
  const n = (hdr || '').toLowerCase().trim()
    .replace(/\s+/g, ' ')
    .normalize('NFC');
  return HDR_MAP[n] || 'skip';
}

// ═══════════════════════════════════════════════
// PARSERS
// ═══════════════════════════════════════════════
function parseDate(v) {
  if (!v) return null;
  const s = String(v).trim();
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{2,4})$/);
  if (m) {
    let [,d,mo,y] = m;
    if (y.length === 2) y = parseInt(y) >= 50 ? '19'+y : '20'+y;
    return `${y}-${mo.padStart(2,'0')}-${d.padStart(2,'0')}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(s)) return s.slice(0,10);
  return null;
}

function parseNum(v) {
  if (v === null || v === undefined || v === '') return null;
  let s = String(v).trim().replace(/\u00a0/g,'').replace(/\s/g,'');
  // Finnish: "1.234,56"
  if (/^\-?\d{1,3}(\.\d{3})+(,\d+)?$/.test(s)) {
    s = s.replace(/\./g,'').replace(',','.');
  }
  // "1234,56"
  else if (/^\-?\d+,\d+$/.test(s)) {
    s = s.replace(',','.');
  }
  // "1,234.56"
  else {
    s = s.replace(/,/g,'');
  }
  const n = parseFloat(s);
  return isNaN(n) ? null : n;
}

function isYearRow(row) {
  const v = (row[0] || '').trim();
  return /^\d{4}(\.0)?$/.test(v) || v === '';
}

// ═══════════════════════════════════════════════
// STATE
// ═══════════════════════════════════════════════
let csvRows = [];
let csvHeaders = [];
let colMap = [];   // index → field name

// ═══════════════════════════════════════════════
// MAPPING UI
// ═══════════════════════════════════════════════
function buildMapping(headers) {
  return headers.map(h => guessField(h));
}

function showMappingUI(rows) {
  csvRows = rows;
  csvHeaders = rows[0] || [];
  colMap = buildMapping(csvHeaders);

  const dataRows = rows.slice(1).filter(r => !isYearRow(r));
  const validRows = dataRows.filter(r => {
    for (let c = 0; c < colMap.length; c++) {
      if (colMap[c] === 'date' && parseDate(r[c])) return true;
    }
    return false;
  });

  document.getElementById('map-count').textContent =
    `${validRows.length} päivää tunnistettu`;

  const fieldOpts = Object.entries(FIELDS)
    .map(([k, v]) => `<option value="${k}">${v.label}</option>`)
    .join('');

  const rowsHtml = csvHeaders.map((h, i) => {
    const hasData = rows.slice(1).some(r => r[i] && r[i].trim());
    if (!h.trim() && !hasData) return '';
    const mapped = colMap[i] || 'skip';
    const fi = FIELDS[mapped] || FIELDS.skip;
    return `
      <div class="map-row">
        <div class="ci">${i}</div>
        <div class="ch">${h || '<span style="color:var(--text3)">—</span>'}</div>
        <div class="ar">→</div>
        <select class="msel" data-col="${i}" onchange="onMapChange(${i},this.value)">
          ${fieldOpts}
        </select>
        <span class="badge b-${fi.cat}" id="bdg-${i}">${fi.cat}</span>
      </div>`;
  }).join('');

  document.getElementById('map-rows').innerHTML = rowsHtml;

  // Set select values after DOM insert
  csvHeaders.forEach((_, i) => {
    const sel = document.querySelector(`select[data-col="${i}"]`);
    if (sel) sel.value = colMap[i] || 'skip';
  });

  document.getElementById('import-upload').style.display = 'none';
  document.getElementById('import-mapping').style.display = 'block';
}

function onMapChange(i, val) {
  colMap[i] = val;
  const bdg = document.getElementById(`bdg-${i}`);
  if (!bdg) return;
  const fi = FIELDS[val] || FIELDS.skip;
  bdg.className = `badge b-${fi.cat}`;
  bdg.textContent = fi.cat;
}

// ═══════════════════════════════════════════════
// IMPORT
// ═══════════════════════════════════════════════
const EV_FIELDS = {
  osinko:         { type: 'dividend', title: 'Osinko',       source: 'Yleinen' },
  osingot_nordnet:{ type: 'dividend', title: 'Osinko',       source: 'Nordnet' },
  osingot_op:     { type: 'dividend', title: 'Osinko',       source: 'OP' },
  isot_hankinnat:    { type: 'purchase',  title: 'Iso hankinta',        source: '' },
  osakeostot:        { type: 'purchase',  title: 'Osakeosto',            source: '' },
  myynti:            { type: 'sale',      title: 'Myynti',               source: '' },
  siirto_aot_sisaan: { type: 'transfer',  title: 'Siirto AOT:lle',       source: '' },
  siirto_aot_ulos:   { type: 'transfer',  title: 'Siirto AOT:lta',       source: '' },
  huom:              { type: 'note',      title: 'Huom.',                source: '' },
};

async function runImport() {
  const btn    = document.getElementById('btn-do-import');
  const progW  = document.getElementById('prog-wrap');
  const fill   = document.getElementById('prog-fill');
  const txt    = document.getElementById('prog-txt');

  btn.disabled = true;
  progW.style.display = 'block';
  txt.textContent = 'Analysoidaan rivejä...';
  fill.style.width = '30%';

  // --- Parse phase (synchronous, fast) ---
  const snaps = [];
  const evts  = [];
  let skipCount = 0;

  const dataRows = csvRows.slice(1);

  for (const row of dataRows) {
    if (isYearRow(row)) { skipCount++; continue; }

    // Find date
    let date = null;
    for (let c = 0; c < colMap.length; c++) {
      if (colMap[c] === 'date') {
        const d = parseDate(row[c]);
        if (d) { date = d; break; }
      }
    }
    if (!date) { skipCount++; continue; }

    const snap = { date, raw_import: {} };

    for (let c = 0; c < colMap.length; c++) {
      const field = colMap[c];
      const hdr   = csvHeaders[c] || '';
      const raw   = row[c] || '';

      // Always store raw
      if (hdr.trim()) snap.raw_import[hdr] = raw;

      if (!field || field === 'skip' || field === 'date') continue;
      if (EV_FIELDS[field]) {
        // Extract as event — handle both numbers and text
        if (raw && raw.trim()) {
          const ef = EV_FIELDS[field];
          const n = parseNum(raw);
          const hasNum = n !== null && Math.abs(n) > 0;
          evts.push({
            date,
            type: ef.type,
            title: ef.title,
            source: ef.source,
            amount: hasNum ? n : null,
            note: !hasNum ? raw.trim() : null,
          });
        }
        continue;
      }

      const n = parseNum(raw);
      if (n !== null) snap[field] = n;
    }

    snaps.push(snap);
  }

  // --- Store phase ---
  txt.textContent = `Tallennetaan ${snaps.length} snapshottia...`;
  fill.style.width = '65%';
  await new Promise(r => setTimeout(r, 30)); // yield

  // --- Merge phase: inherit structural fields from nearest previous snapshot ---
  txt.textContent = 'Yhdistet\u00e4\u00e4n rakenteet...';
  const existingSnaps = (await DB.getAll('snapshots'))
    .filter(s => !s._archived)
    .sort((a, b) => a.date < b.date ? -1 : 1);
  for (let i = 0; i < snaps.length; i++) {
    const csvSnap = snaps[i];
    let base = null;
    for (let j = existingSnaps.length - 1; j >= 0; j--) {
      if (existingSnaps[j].date <= csvSnap.date) { base = existingSnaps[j]; break; }
    }
    if (base) {
      snaps[i] = { ...base, ...csvSnap, _source: 'csv_import' };
      delete snaps[i]._archived;
      delete snaps[i]._archivedAt;
    } else {
      snaps[i]._source = 'csv_import';
    }
  }

  await DB.bulkPutSnapshots(snaps);

  if (evts.length > 0) {
    txt.textContent = `Tallennetaan ${evts.length} tapahtumaa...`;
    fill.style.width = '85%';
    await new Promise(r => setTimeout(r, 20));
    await DB.bulkAddEvents(evts);
  }

  fill.style.width = '100%';
  txt.textContent = `✓ Valmis — ${snaps.length} snapshottia, ${evts.length} tapahtumaa, ${skipCount} rivi ohitettu.`;

  await updateNavCount();
  setTimeout(() => { showView('dashboard'); renderDashboard(); }, 1400);
}

// ═══════════════════════════════════════════════
// FORMATTING
// ═══════════════════════════════════════════════
