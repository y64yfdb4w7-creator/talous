# Finance OS — Arkkitehtuuridokumentti

> Versio: 2026-07-30  
> Tila: Vakaa tuotantokäytössä  
> Tarkoitus: Turvallisten muutosten mahdollistaminen dokumentoimalla järjestelmän rakenne

---

## Yleiskuva

Finance OS on selainpohjainen henkilökohtaisen talouden seurantasovellus. Se toimii GitHub Pagesissa staattisena sivustona ilman palvelinpuolen logiikkaa. Kaikki laskenta tapahtuu käyttäjän selaimessa.

**Ei ole:**
- kirjanpitojärjestelmä
- transaktioseuranta
- budjettisovellus

**On:**
- snapshot-pohjainen nettovarallisuuden seuranta
- orientaatiotyökalu ("missä mennään tänään?")
- päivittäinen rituaali: syötä → päivitä kurssit → tallenna päivä

---

## Tiedostorakenne

```
talous/
├── index.html              ← Shell, CSS, navigaatio, asetukset
├── manifest.json           ← PWA-manifest
├── sw.js                   ← Service Worker (v62 reset-logiikka)
├── js/
│   ├── db.js               ← IndexedDB-abstraktio (FinanceOS_3 v14)
│   ├── calculations.js     ← Laskentamoottori (calculateNetWorth ym.)
│   ├── signals.js          ← Signaalit/hälytykset (käyttämätön/minimaalinen)
│   ├── import.js           ← CSV-tuonti Numbers-historiasta
│   ├── demo-data.js        ← Demo-siemenet (ei tuotannossa aktiivinen)
│   ├── app.js              ← Käynnistyslogiikka + SEED_HOLDINGS + TICKER_CURRENCY
│   ├── ui2-v2.js           ← PÄÄLOGIIKKA: kaikki näkymät + syöttö + snapshot
│   ├── sync2.js            ← Markkinadata + Supabase-synkronointi + varmuuskopio
│   ├── dashboard-layout.js ← Desktop 3-kolumni drag-and-drop layout
│   └── swipe-nav.js        ← Mobiili pyyhkäisynavigointi
└── docs/
    ├── FINANCE_OS_ARCHITECTURE.md  ← tämä tiedosto
        ├── FINANCE_OS_DATA_MODEL.md
            ├── FINANCE_OS_STATUS.md
                └── FINANCE_OS_AUDIT.md
                ```

                ---

                ## Legacy-tiedostot (tarkistettu 15.7.2026, HEAD `41ade7c`)

                Repossa on `js/`-kansiossa kolme git-trackattua tiedostoa, joita **index.html ei lataa** (ei `<script>`-viittausta):

                | Tiedosto | Koko | Tila |
                |---|---|---|
                | `js/ui.js` | ~187 KB | Ei ladattu, edeltäjä nykyiselle ui2-v2.js:lle |
                | `js/ui2.js` | ~202 KB | Ei ladattu, edeltäjä nykyiselle ui2-v2.js:lle |
                | `js/sync.js` | ~23 KB | Ei ladattu, edeltäjä nykyiselle sync2.js:lle |

                Index.html:n aktiivinen script-lista (rivit 1301–1310) on: `db.js`, `calculations.js`, `signals.js`, `import.js`, `demo-data.js`, `ui2-v2.js`, `dashboard-layout.js`, `swipe-nav.js`, `sync2.js`, `app.js`.

                **Ei vielä päätetty:** ovatko `ui.js`/`ui2.js`/`sync.js` turvallisesti poistettavissa vai säilytetäänkö ne tarkoituksella historiallisena viitteenä. Vaatii erillisen suunnittelupäätöksen ennen poistoa.

                ---

                ## Tiedostojen vastuut

                ### index.html
                **Tekee:**
                - HTML-runko: kaikki `<div id="view-*">` näkymäkontainerit
                - Kaikki CSS (inline `<style>`-lohkossa)
                - Viewport-asetus: `width=device-width, initial-scale=1.0, viewport-fit=cover`
                - Mobiili- ja desktop-navigaatio (nav + sidebar)
                - Asetuspaneeli (Supabase URL/key, Finnhub key) → localStorage
                - Service Worker -rekisteröinti
                - Privacy mode -alustus (`hide-amounts`-luokka)
                - Skriptien latausjärjestys

                **Ei tee:**
                - Laskentaa
                - Datanhallintaa
                - Näkymälogiikkaa

                **Tärkeimmät elementit:**
                - `#view-syota` — Syötä-sivun kontaineri
                - `#view-dashboard` / `#db-content` — Etusivu
                - `#os-sidebar` — Desktop vasen sivupalkki (piilossa mobiilissa)
                - `#os-panel` — Desktop oikea paneeli
                - `#btn-freeze-nav` / `#btn-freeze-float` — Päivitä-napit

                ---

                ### js/db.js
                **Tekee:**
                - IndexedDB-abstraktio nimellä `FinanceOS_3` (versio 14)
                - Storeset: `snapshots`, `holdings`, `events`, `pins`, `backups`, `sales`
                - CRUD-operaatiot: `getAll`, `putHolding`, `bulkPutSnapshots`, `count`, `putBackup`, `getAll('backups')`, `clearOldBackups`

                **Ei tee:**
                - Validointia
                - Laskentaa
                - UI:ta

                **Kriittinen sääntö:** `bulkPutSnapshots` käyttää `put`-operaatiota (upsert by date). Sama päivämäärä ylikirjoitetaan aina.

                ---

                ### js/calculations.js
                **Tekee:**
                - `calculateNetWorth(snap)` — Pääfunktio, laskee nettovarallisuuden snapshotista
                - `fmt(n)` / `fmtDelta(n)` / `fmtDate(iso)` / `fmtDateWd(iso)` / `dcls(n)` / `fmtPct(a,b)` — Formatointiaputilit
                - `snapBefore(snaps, isoDate)` — Etsi viimeisin snapshot ennen päivämäärää
                - `daysAgoISO(days)` — ISO-päivämäärä n päivää sitten
                - `calcCapitalGainsTax(profit)` — Pääomaverolaskenta (30%/34%)
                - `calcSaleMethods(kpl, salePrice, purchasePrice)` — FIFO/HMO20/HMO40 -vertailu
                - `calcYearlySalesSummary(salesForYear)` — Vuosiyhteenveto myynneistä

                **Ei tee:**
                - UI:ta
                - Tallennusta
                - Synkronointia

                **calculateNetWorth(snap) — rakenne:**
                ```
                investments = nordnet + nordnet_cash + op_osakkeet + tapiola + s_sijoitus + rahastot
                cash = tulotili + s_pankki + tavoitetili + elatustili
                assets = investments + cash
                shortTermDebt = |op_gold + visa + luottotili|
                longTermDebt = |asuntolaina + asuntolaina_remontti + autolaina|
                netWorth = assets - shortTermDebt - longTermDebt
                ```

                ---

                ### js/app.js
                **Tekee:**
                - `SEED_HOLDINGS` — Vakio-omistukset (seeded jos holdings-store tyhjä)
                - `TICKER_CURRENCY` — Ticker → valuutta -kartta (USD/EUR)
                - `init()` — Sovelluksen käynnistys:
                  1. Avaa IndexedDB (8s timeout)
                    2. Seed holdings jos tyhjä
                      3. Päivitä navigaatiolaskuri
                        4. Jos snapshoteja = 0: yritä ladata Supabasesta → jos epäonnistuu → Import-näkymä
                          5. Jos snapshoteja > 0: renderoi dashboard, taustasynkka 2s viiveellä
                          - iOS PWA "Lisää kotinäytölle" -banneri

                          **Ei tee:**
                          - UI-renderöintiä
                          - Datanhallintaa suoraan

                          ---

                          ### js/sync2.js
                          **Tekee:**
                          - `refreshAndFreeze()` — **Päärituaalin käynnistys** (Päivitä-nappi)
                          - `refreshAllMarketData()` — Kurssihaku Supabase Edge Function → Finnhub fallback
                          - `syncFromSupabase(showStatus?)` — Lataa data Supabasesta (timestamp-optimoitu)
                          - `syncToSupabase(snap)` — Tallentaa koko tilan Supabaseen
                          - `autoBackup()` — Rolling varmuuskopio IndexedDB:hen (7 daily + 4 weekly + 12 monthly)
                          - `restoreFromBackup(id)` — Palauttaa varmuuskopion
                          - `backupStatusText()` — Tilaviesti varmuuskopiosta
                          - `seedHoldingsIfEmpty()` — Kutsuu SEED_HOLDINGS jos holdings tyhjä
                          - `fetchFinnhubQuote(ticker, key)` / `fetchUsdEur(key)` — Yksittäiset API-kutsut
                          - `getFinnhubKey()` / `setFinnhubKey(k)` — localStorage-avainten hallinta

                          **Ei tee:**
                          - UI-renderöintiä
                          - Snapshot-kentien validointia

                          ---

                          ### js/ui2-v2.js
                          **Tekee: KAIKEN UI:N**

                          Tämä on järjestelmän suurin tiedosto (~314k merkkiä / 5842 riv.). Se sisältää kaikki näkymät ja niiden logiikan.

                          **Näkymäfunktiot:**
                          - `renderDashboard()` — Etusivu (kassa, sijoitukset, velat, historia, nettovarallisuus)
                          - `renderEntry()` / `renderEntryView()` — Syötä-sivu (päivittäinen tietojen syöttö)
                          - `renderSalkku()` — Salkku-näkymä (holdingit, kurssihistoria)
                          - `renderLikviditeetti()` / `renderKassavirta()` — Kassavirta-näkymä
                          - `renderHistoria()` — Historia-näkymä (aikajanakuvaajat)
                          - `renderLedger()` — Ledger-näkymä (snapshottihistoria taulukossa)
                          - `renderEvents()` — Tapahtumat-näkymä (dividendit, ostot, myynnit)
                          - `renderMyynnit()` — Myyntilaskelmat-näkymä
                          - `renderPaivakirja()` — Päiväkirja-näkymä

                          **Snapshot-tallennusfunktiot:**
                          - `saveEntrySnapshot()` — Tallentaa Syötä-sivun tiedot snapshotiksi
                          - `saveDayFromHoldings()` — Tallentaa päivän holdingien pohjalta (= refreshAndFreeze:n kutsuma)

                          **Apufunktiot Syötä-sivulle:**
                          - `renderTulotItems()` — Renderöi toistuvat tulot -rivit
                          - `renderRytmiItems()` — Renderöi toistuvat menot -rivit
                          - `addTulotItem()` / `addRytmiItem()` — Lisää uusi tulo/meno-rivi
                          - `entryRow(loan)` — Renderöi yksittäinen lainan syöttörivi
                          - `entryLoan(loan)` — Lainan display/edit toggle

                          **Navigaatio:**
                          - `showView(viewId, btn?)` — Vaihta näkymä, renderöi tarvittaessa
                          - `updateNavCount()` — Päivitä snapshot-laskuri navigaatiossa
                          - `updateRightPanel()` — Päivitä desktop oikea paneeli

                          **Ei tee:**
                          - IndexedDB-operaatioita suoraan (käyttää DB-objektia)
                          - Kurssihakuja (sync2.js hoitaa)
                          - Laskentaa (calculations.js hoitaa)

                          ---

                          ### js/dashboard-layout.js
                          **Tekee:**
                          - Desktop 3-kolumni grid layout
                          - Korttien drag-and-drop järjestely
                          - Layout-tilan tallennus localStorage:iin

                          ---

                          ### js/swipe-nav.js
                          **Tekee:**
                          - Mobiili touch-swipe navigaatio näkymien välillä

                          ---

                          ## Datan kulku — Päivittäinen rituaali

                          ### Polku 1: Käyttäjä syöttää tietoja manuaalisesti (Syötä-sivu)

                          ```
                          Käyttäjä napauttaa kenttää (tulotili, lainat, tilit)
                              ↓
                              renderEntry() renderöi lomakkeen
                                  ↓
                                  Käyttäjä muokkaa arvoja
                                      ↓
                                      "Tallenna päivä" → saveEntrySnapshot()
                                          ↓
                                          Kerää kaikki lomakkeen kentät (tulotili, op_gold, lainat, tulot_items, rytmi_items...)
                                              ↓
                                              Carry-forward: hae viimeisin snapshot → kopioi kentät joita EI syötetty
                                                  ↓
                                                  DB.bulkPutSnapshots([snap]) — tallentaa IndexedDB:hen
                                                      ↓
                                                      syncToSupabase(snap) — taustasynkka (setTimeout 500ms)
                                                          ↓
                                                          autoBackup() — varmuuskopio (setTimeout 1000ms + 2000ms)
                                                              ↓
                                                              renderDashboard() — päivittää UI
                                                              ```

                                                              ### Polku 2: Päivitä-nappi (refreshAndFreeze)

                                                              ```
                                                              Käyttäjä painaa "Päivitä" -nappia
                                                                  ↓
                                                                  refreshAndFreeze() [sync2.js]
                                                                      ↓
                                                                      refreshAllMarketData() — hae kurssit Supabase EF → Finnhub
                                                                          ↓
                                                                          Päivitä holdings IndexedDB:hen (last_price, last_price_date, last_price_src)
                                                                              ↓
                                                                              syncFromSupabase() — hae mahdolliset muutokset muilta laitteilta
                                                                                  ↓
                                                                                  Laske acctTotals holdingseista (per tili: nordnet, op_osakkeet, s_sijoitus...)
                                                                                      ↓
                                                                                      Hae viimeisin snapshot (allSnaps[allSnaps.length-1]) baseline-arvoksi
                                                                                          ↓
                                                                                          Muodosta uusi snap = {
                                                                                              date: today,
                                                                                                  ...acctTotals,           ← kurssidatan perusteella lasketut
                                                                                                      tulotili: latest?.tulotili,   ← carry-forward käyttäjän syöttämistä
                                                                                                          op_gold: latest?.op_gold,     ← carry-forward
                                                                                                              asuntolaina: latest?.asuntolaina, ← carry-forward
                                                                                                                  ... (kaikki tilit ja lainat carry-forwardina)
                                                                                                                      tulot_items: latest?.tulot_items, ← carry-forward
                                                                                                                          rytmi_items: latest?.rytmi_items, ← carry-forward
                                                                                                                              nordnet_cash: latest?.nordnet_cash, ← carry-forward
                                                                                                                              }
                                                                                                                                  ↓
                                                                                                                                  DB.bulkPutSnapshots([snap])
                                                                                                                                      ↓
                                                                                                                                      syncToSupabase(snap) — taustasynkka
                                                                                                                                          ↓
                                                                                                                                          autoBackup() — varmuuskopio
                                                                                                                                              ↓
                                                                                                                                              renderDashboard() — päivittää UI (2.5s viive)
                                                                                                                                              ```
                                                                                                                                              
                                                                                                                                              ### Polku 3: Synkronointi käynnistyksessä
                                                                                                                                              
                                                                                                                                              ```
                                                                                                                                              init() [app.js]
                                                                                                                                                  ↓
                                                                                                                                                  DB.init() — avaa IndexedDB
                                                                                                                                                      ↓
                                                                                                                                                      seedHoldingsIfEmpty() — lisää SEED_HOLDINGS jos tyhjä
                                                                                                                                                          ↓
                                                                                                                                                          DB.count('snapshots')
                                                                                                                                                              ↓
                                                                                                                                                              Jos 0: syncFromSupabase() → renderDashboard() tai showView('import')
                                                                                                                                                              Jos >0: renderDashboard() + syncFromSupabase() taustasynkkana (2s viive)
                                                                                                                                                              ```
                                                                                                                                                              
                                                                                                                                                              ---
                                                                                                                                                              
                                                                                                                                                              ## Arkkitehtuurin kriittiset kohdat
                                                                                                                                                              
                                                                                                                                                              ### 1. Snapshot = koko tila kerrallaan
                                                                                                                                                              Jokainen snapshot tallentaa KOKO taloudellisen tilanteen tältä päivältä. Ei delta-päivityksiä. Sama päivä ylikirjoittaa aina.
                                                                                                                                                              
                                                                                                                                                              ### 2. Carry-forward -periaate
                                                                                                                                                              Kun uusi snapshot muodostetaan (joko saveEntrySnapshot tai refreshAndFreeze), kentät joita ei erikseen aseta kopioidaan edellisestä snapshotista. Tämä varmistaa ettei data katoa.
                                                                                                                                                              
                                                                                                                                                              ### 3. Kaksoiskirjoitus sama päivä
                                                                                                                                                              Käyttäjä voi tallentaa useita kertoja samana päivänä. Viimeisin tallennusoperaatio voittaa (upsert by date-key).
                                                                                                                                                              
                                                                                                                                                              ### 4. Holdings ≠ Snapshot
                                                                                                                                                              - `holdings`-store: kappalemäärät + hintatiedot + ticker-tunnukset
                                                                                                                                                              - `snapshots`-store: euromääräiset summat per tili/kategoria
                                                                                                                                                              - `refreshAndFreeze()` muuntaa holdingsit → snapshot-summiksi laskemalla kpl × hinta per tili
                                                                                                                                                              
                                                                                                                                                              ### 5. nordnet vs nordnet_cash
                                                                                                                                                              - `snap.nordnet` = Nordnetin sijoitusten markkina-arvo (holdings-summasta laskettu)
                                                                                                                                                              - `snap.nordnet_cash` = Nordnetin käteistili (käyttäjä syöttää manuaalisesti)
                                                                                                                                                              - Nämä EIVÄT saa sekoittua — calculateNetWorth laskee ne erikseen
                                                                                                                                                              
                                                                                                                                                              ### 6. Supabase-synkronointi
                                                                                                                                                              - Supabase tallentaa datan VANHASSA formaatissa (`totals.tulotili`, `totals.opvisa` jne.)
                                                                                                                                                              - `convertOldSnap()` muuntaa vanhan → Finance OS -formaatin
                                                                                                                                                              - `syncToSupabase()` muuntaa Finance OS → vanhan formaatin
                                                                                                                                                              - Tämä yhteensopivuuskerros on kriittinen — älä muuta ilman molempia suuntia
                                                                                                                                                              
                                                                                                                                                              ### 7. Mobiili vs Desktop
                                                                                                                                                              - Mobiilissa (`max-width: 899px`): mobiilinavigaatio, kelluva Päivitä-nappi
                                                                                                                                                              - Desktopissa (`min-width: 900px`): 3-kolumni layout, sidebar, oikea paneeli
                                                                                                                                                              - iOS-korjaukset: font-size ≥ 16px kaikissa inputeissa (estää auto-zoom)

---

## Hero / Kassajakso / Rahavirta — vastuurajat (LUKITTU, 19.7.2026)

Kassa-kortin "Seuraava rahatilanne" -osio (`renderKassaSeuraavaRahatilanne`,
js/ui2-v2.js) rakentuu kolmesta vastuukerroksesta. Täydet lukitut tuotepäätökset ja
niiden perustelut: `docs/CURRENT_STATUS.md` § "Hero-tuotemäärittelyn
regressiokorjaus — Kassajakso-sprintti (19.7.2026)".

### Rahavirta
Yksittäinen kirjattu tulo tai meno (`tulot_items`, `rytmi_items`, `tulevat_items`).
Tuntee vain oman datansa. Kokoaminen yhtenäiseen muotoon: `collectRahavirrat`.

### Kassajakso
Rajaa rahavirtajoukon viimeisimmästä snapshotista päättymispisteeseen
(`periodEnd`) asti (`buildKassajakso`, palauttaa `{lahtokassa, items,
excludedItems, periodEnd, snapshotDate, opGoldExtended}`). Aikareferenssinä
yksinomaan `latest.date` — ei laitteen kellonaikaa. Laskee lähtökassan
(`lahtokassaOf` — tulotili − |op_gold|) ja muodostaa Herolle annettavan
rajatun joukon; ylijäävät rahavirrat palautuvat `excludedItems`-kentässä.

Oletuksena `periodEnd` on seuraava tunnettu tulo
(`resolveBaseKassajaksoPeriodEnd`). Käyttäjä voi korvata tämän omalla
sääntöjoukolla (`finos_kassajakso_rules`, localStorage): ehdot `itemRef`
(viittaus tiettyyn rahavirtaan sen pysyvällä id:llä), `fixedDate` tai
`monthEnd`, tai `strategy: 'open'` jolloin jakso ei pääty lainkaan. Tähän
päälle voidaan soveltaa valinnainen OP Gold -laajennus
(`applyOpGoldExtension`): siirtää `periodEnd`:in seuraavan kuukauden 5.
päivään, jos se muuten olisi sitä aiemmin.

RAHAVIRRAT-lista (`renderTulossaList`) ei käytä tätä rajausta — se näyttää
aina `collectRahavirrat(...)`:n koko, rajaamattoman joukon.

### Hero
Puhdas laskentakomponentti (`heroSum`). Summaa vain sille Kassajaksolta annetun
joukon (lähtökassa + tulot − menot). Ei päättele, ei valitse rahavirtoja, ei tunne
niiden alkuperää eikä laske itse lähtökassaa.

**Sääntö:** kukin kerros tuntee vain sen mitä alempi kerros sille luovuttaa, ei
miten se syntyi. Uusia rahavirtalähteitä tai näyttöjä lisättäessä logiikka kuuluu
Rahavirta- tai Kassajakso-kerrokseen — ei koskaan Heroon.

