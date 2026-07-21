# CURRENT_STATUS.md
# Finance OS — Current Status

**Päivitetty:** 2026-07-21
**Viimeisin commit:** (tuleva) `style: neutralize Kassa account rows and remove Tulotili/OP Gold divider lines`
**Branch:** main
**Tiedostot:** js/ui2-v2.js (4329 riv. — **15.7.2026: 5002 riv. — 20.7.2026: 4551 riv. — 20.7.2026 (Info-modal): 4600 riv. — 20.7.2026 (Info-sisältö): 4602 riv. — 21.7.2026 (terminologia+YHTEENSÄ): 4617 riv. — 21.7.2026 (visuaalinen viimeistely): 4612 riv.**), index.html (1252 riv. — **15.7.2026: 1421 riv. — 20.7.2026: 1428 riv. — 20.7.2026 (mobiili-UX): 1463 riv. — 20.7.2026 (desktop-layout-fix): 1464 riv. — 21.7.2026 (.sub-row neutraali): 1463 riv.**)

**Kassa-kortin visuaalinen viimeistely — tilit neutraaleiksi (21.7.2026) — valmis:**
Puhdas UI-viimeistelysprintti (`js/ui2-v2.js`, `index.html`), ei laskentamuutoksia.
Neljä osaa: (1) Poistettu Tulotili/OP Gold-lohkoa ympäröineet ohuet
vaakaviivat (`border-top` html2-containerista ja "Viiva"-divin bottom-line
Tulotili/OP Gold-rivien ja YHTEENSÄ-rivin väliltä) — ryhmitys säilyy
edelleen rivien vasemman reunan pystyviivalla. (2)–(3) Kaikkien tilien
(S-Pankki, Tavoitetili, Elatustili — `.sub-row`/`.sub-row span:last-child`,
`index.html`; Tulotili, OP Gold — inline-tyylit, `js/ui2-v2.js`) nimet ja
saldot muutettu `var(--card-primary)`:sta (kortin teemavärille, aiemmin
aina vihreä) neutraaliksi `var(--text)`:ksi riippumatta summan etumerkistä.
(4) YHTEENSÄ-rivi muutettu täysin neutraaliksi (`var(--text)` otsikolle ja
summalle), aiempi positiivinen/negatiivinen-väritys (`yhteensa2Color`)
poistettu kokonaan. Väriperiaate sprintin jälkeen: ODOTE pysyy vihreänä,
NYKYINEN säilyttää positiivinen/negatiivinen-värityksensä, RAHAVIRRAT-listan
tulo/meno-väritys ennallaan — vain tilit ja YHTEENSÄ ovat nyt neutraaleja.
`lahtokassaOf`, `kassaValisumma`, `heroSum`, `buildKassajakso`, rahavirtojen
laskenta ja tilien järjestys koskematta. `.sub-row`-CSS-luokka vahvistettu
käytössä vain Kassa-kortilla (`js/ui.js`/`js/ui2.js` eivät ole ladattuja
tiedostoja, ks. `index.html`:n `<script>`-listaus) — muutos ei vaikuta
muihin kortteihin.
**Testattu:** paikallinen staattinen palvelin, sama synteettinen IndexedDB-
snapshotti kuin edellisessä sprintissä. Desktop ja 390px mobiiliviewport
(iframe-tekniikka, cache-busting varmistettu): kaikki tilit ja YHTEENSÄ
näyttivät neutraalin vaalean tekstin, ei viivoja Tulotili/OP Gold-lohkon
ympärillä, ODOTE/NYKYINEN-väritys ja Lopputilanne-rivin väritys ennallaan.
Info-modal, Asetukset-popover vahvistettu koskemattomiksi. Ei
konsolivirheitä (poislukien testiharjoituksen oma artefakti toisessa
välilehdessä, jonka DOM tyhjennettiin manuaalisesti mobiilitestiä varten —
ei liity tuotantokoodiin).

**Kassa-kortin terminologian ja tililistan yhteenvedon viimeistely (21.7.2026) — valmis:**
Puhdas käyttöliittymäsprintti (`js/ui2-v2.js`), ei laskentamuutoksia. Kaksi
osaa: (1) Kortin kärjessä olevat otsikot "KASSA HERO" → "ODOTE" ja "NYKYINEN
KASSA" → "NYKYINEN" (vain tekstit, ks. rivit ~958/962) — kortin oma otsikko on
jo "KASSA", "Hero" on sisäinen kehittäjätermi, ja "Odote" kuvaa paremmin
tunnetuista rahavirroista laskettua odotettua kassatilannetta. (2) Uusi
"YHTEENSÄ"-rivi lisätty tililistan loppuun (html2-blokin olemassa olevan
Tulotili/OP Gold-viivan jälkeen, ennen "Seuraava rahatilanne" -osiota) —
näyttää saman arvon kuin "NYKYINEN" (`lahtokassaOf(latest)`, ei uutta
laskentaa, uusi `var`-nimi `yhteensa2` samassa IIFE-scopessa kuin `opGold2`/
`tulotili2`), sama positiivinen/negatiivinen-väritys (`var(--green)`/
`var(--red)`). `lahtokassaOf`, `kassaValisumma`, `heroSum`, `buildKassajakso`
ja tilien järjestys koskematta. Info-modalin oma sisältöteksti (eri
funktio, `openCardInfo`) jätettiin tietoisesti koskematta — rajattu tämän
sprintin ulkopuolelle.
**Testattu:** paikallinen staattinen palvelin, synteettinen IndexedDB-
snapshotti (S-Pankki 10 €, Tulotili 127 €, OP Gold −1552 €, Tavoitetili
500 €, Elatustili 0 €). Desktop ja 390px mobiiliviewport (iframe-tekniikka):
ODOTE/NYKYINEN-otsikot ja YHTEENSÄ-rivi (−1425 €) näyttivät saman arvon
keskenään ja Lopputilanne-rivin kanssa, ei vaakaylivuotoa. Info-modal,
Asetukset-popover ja "Yksityiskohdat"-toggle vahvistettu koskemattomiksi
(YHTEENSÄ-rivi näkyy/piiloutuu samalla ehdolla kuin Tulotili/OP Gold, ei
oma uusi piilotusehto). Ei konsolivirheitä.

**Kassa Hero + Nykyinen kassa kaksipalstaiseksi yhteenvedoksi kortin kärkeen (21.7.2026) — valmis:**
Rajattu layout-sprintti (`js/ui2-v2.js`): Kassa-kortin kaksi tärkeintä lukua,
Kassa Hero (`kassaValisumma`) ja Nykyinen kassa (`lahtokassaOf`), näkyvät nyt
heti "KASSA"-otsikon alla kahden sarakkeen rivillä (flex, `card-left`-divin
sisällä) — aiemmin Nykyinen kassa näkyi vasta kortin alaosassa "SEURAAVA
RAHATILANNE" -osion "NYKYINEN KASSA" -rivinä. Sama arvo ja väri (aina vihreä
Herolle, positiivinen/negatiivinen-logiikka Nykyiselle kassalle), vain
sijainti muuttui — laskenta (`lahtokassaOf`, `kassaValisumma`, `heroSum`,
`buildKassajakso`) koskematon. "SEURAAVA RAHATILANNE" -osiosta poistettiin
duplikoitunut "NYKYINEN KASSA" -rivi (`renderKassaSeuraavaRahatilanne`);
RAHAVIRRAT-lista ja Lopputilanne-rivi ennallaan. Tililista (S-Pankki,
Tavoitetili, Elatustili, Tulotili, OP Gold) ja tilien järjestys koskematta.
Ei uutta CSS:ää — pelkkää inline flex-tyyliä samaan tapaan kuin muukin kortin
sisältö. Testattu paikallisella palvelimella selaimessa: desktop-leveys ja
390px mobiiliviewport (iframe-tekniikka), Info-modal, Asetukset-popover ja
"Yksityiskohdat"-toggle vahvistettu koskemattomiksi, ei konsolivirheitä.

**Bugfix: Rahavirrat-listan desktop-layout (20.7.2026) — valmis:**
Pitkät rahavirtanimet (esim. "Pääpalkka kuukausittain työnantajalta",
"Vuokratulo sijoitusasunnosta Espoossa") saivat nimen ja euromäärän
rivittymään kahdelle riville ja menemään päällekkäin desktop-leveyksillä
(≥900 px). **Juurisyy ei ollut väriajossa `8a0cb98`** — todistettu ajamalla
identtinen headless-repro (Playwright, IndexedDB-siemennetty snapshotti
pitkillä nimillä, 1400 px leveys) sekä commitia `8a0cb98` edeltävää
(`b5cbe9c`) että sen jälkeistä koodia vasten: mittaustulokset (rivikorkeudet,
reunakoordinaatit) olivat bittitäsmälleen identtiset molemmissa — bugi oli
siis olemassa jo ennen väriajoa. Todellinen syy: `.panel-row-lbl`/
`.panel-row-val`-sarakkeiden ellipsis/nowrap/flex-shrink-suoja (lisätty
mobiilisprintissä `565e653`) oli rajattu yksinomaan
`@media (max-width:899px)`-sääntöön — desktopilla näillä elementeillä ei
ollut koskaan tilanhallintaa, vain lyhyet demo-nimet olivat piilottaneet
puutteen aiemmin. Korjaus: siirrettiin nuo neljä sääntöä
(`.panel-row-lbl`, `.panel-row-val`, `.panel-row > span:last-child`,
`.panel-row button`, kaikki `[data-item-id="cash"]`-rajattuja) pois
media querystä yleispäteviksi — ei duplikointia, ei uusia sääntöjä, ei uusia
erikoistapauksia. Nimi typistyy ellipsillä tarvittaessa, summa ei koskaan
rivity. Mobiili ei rikkoutunut, koska säännöt ovat identtiset kuin ennen —
ne vain koskevat nyt myös leveämpiä näyttöjä. Ei muutoksia väritykseen,
laskentalogiikkaan eikä renderöintiin (vain CSS, `index.html`). Testattu
headless-Playwrightilla 1400 px (ei rivityksiä, ei päällekkäisyyksiä) ja
390 px (ellipsis + värit ennallaan).

**Rahavirta-rivien semanttinen värikoodaus (20.7.2026) — valmis:**
Rajattu UI/CSS-sprintti: Kassa-kortin RAHAVIRRAT-listassa rahavirran nimi
näytetään nyt samalla värillä kuin sen euromäärä, jotta suunta (tulo/meno)
näkyy yhdellä silmäyksellä ilman tekstin lukemista. `js/ui2-v2.js`,
`renderTulossaList()`: kertaluonteisille erille (`kassa-vr-label`) ja
säännöllisille tuloille/menoille (`panel-row-lbl`) lisättiin inline
`style="color:..."`, joka lukee saman `amtColor`/`rAmtColor`-muuttujan,
jota rivin euromäärä jo käytti (ei uutta väriä, ei tekstipohjaista
tunnistusta nimestä). Päivämäärä, kuukausiotsikot, toistuvuusikoni,
poistoikoni ja ryhmäotsikot pysyivät neutraaleina. Testattu selaimessa
(desktop + tarkistettu CSS-tasolla mobiilin `[data-item-id="cash"]`-säännöt,
jotka koskevat vain layoutia, ei väriä) — Kassavirta-sivu, Dashboard, Salkku
ja Päiväkirja vahvistettu koskemattomiksi (muutos rajattu yksinomaan
`renderTulossaList`-funktioon, joka renderöi vain Kassa-kortin listan).

**Kassa Info-modalin sisällön viimeistely (20.7.2026) — valmis:**
Puhdas sisältösprintti (`6a218a1`): Info-modalin (ks. edellinen sprintti alla)
tekstit kirjoitettiin uudelleen käyttäjälähtöisesti ja Finance OS:n
snapshot-filosofian mukaisiksi — Tarkoitus, Hero-luku ja Lopputilanne
selitetään ilman toteutuksen sisäisiä termejä, "Tilit ja rahavirrat" jaettiin
kahdeksi omaksi osiokseen (Nykyinen kassa, Rahavirrat), ja loppuun lisättiin
uusi "Huomio"-osio, joka linjaa kortin snapshot-ajatteluun (ei kirjanpito-
eikä budjetointityökalu). Ainoastaan `openCardInfo`-funktion `sections`-
taulukon tekstisisältö muuttui — ei modalin rakennetta, painikkeita, CSS:ää
eikä laskentaa. Ks. oma osio alla.

**Kassa-kortin Info-painike ja selittävä modal (20.7.2026) — valmis:**
Uusi Info-painike (`ℹ`) Kassa-kortin otsikkoriville, samassa tyylissä ja
paikassa kuin olemassa oleva Asetukset-painike (`⋯`). Avaa keskitetyn,
kevyen modalin (backdrop, klikkaa ulkopuolelle tai ✕ sulkee), joka selittää
lyhyesti kortin tarkoituksen, Hero-luvun, tilien/rahavirtojen vaikutuksen ja
"Lopputilanne"-rivin. Vahvistettu, ettei kortilla ole aiemmin ollut Info-
painiketta tai -dialogia (grep + `git log --all --grep`, tyhjä tulos) ennen
toteutusta. Puhtaasti selittävä lisäys — ei muutoksia laskentalogiikkaan,
Hero-laskentaan tai tietomalliin. Toimii mobiilissa (testattu 390px) ja
desktopissa samalla toteutuksella. Ks. oma osio alla.

**Kassa-kortin mobiili-UX viimeistely (20.7.2026) — valmis:**
Rajattu mobiili-CSS-sprintti (`565e653`): Hero omalle täysleveälle riville
40%/60%-gridin sijaan, RAHAVIRRAT-rivien nimet typistyvät ellipsillä eivätkä
riko riviä, summat pysyvät yhdellä rivillä, poistoikonille oma spacing,
suodattimet (Kaikki/Säännölliset/Kertaluonteiset) vaakascrollautuvat kapealla
näytöllä eivätkä leikkaudu, ja "Päivitä"-FAB:n alle jää enemmän scroll-tilaa.
Kaikki muutokset `@media (max-width:899px)`-sääntöön ja
`[data-item-id="cash"]`-selektoriin rajattuna — desktop ja muut kortit
koskematta. Ei liiketoimintalogiikka-, laskenta- eikä datamallimuutoksia.
Ks. oma osio alla.

**Kassajakson rajaamismallin poisto — RAHAVIRRAT-sprintti (20.7.2026) — valmis:**
Neljä peräkkäistä committia (`f4a0bb9`, `cfdaece`, `abb98df`, `a2f97c2`) yhdistivät
Kassa-kortin TULEVAT ERÄT- ja SÄÄNNÖLLISET ERÄT -osiot yhdeksi RAHAVIRRAT-listaksi,
synkronoivat Heron Lopputilanteen kanssa, päivittivät terminologian ja
värikoodauksen, ja lopuksi poistivat Kassajakson "ensimmäiseen tunnettuun tuloon"
-rajauksen kokonaan (LUKITTU tuotepäätös #12) — ks. oma osio alla.

**Hero-tuotemäärittelyn regressiokorjaus — Kassajakso-sprintti (19.7.2026) — valmis:**
Sprintti 1+2:ssa (alla) kirjattu Hero-määrittely osoittautui auditoinnissa regressioksi:
Hero näytti vain nykyhetken kassan, vaikka kortin otsikko on tulevaisuuteen katsova.
Tuotemäärittely lukittu uudelleen (Hero/Kassajakso/Rahavirta-vastuurajat, kassajakson
rajaamiskriteeri, tunnetun tulon määritelmä) ja kortin logiikka korjattu vastaamaan
sitä, ks. oma osio alla.

**"Seuraava rahatilanne" -kortti, Sprintti 1+2/2 (19.7.2026) — valmis:** Kassa-kortin
Kulutusrytmi/Kuukausirytmi/Tulossa/Säännölliset tulot/menot -alue korvattu uudella
NYT → TULEVAT ERÄT → Välisumma → SÄÄNNÖLLISET ERÄT → Lopputilanne -kortilla. Sprintti 1
(puhdas refaktorointi) ja Sprintti 2 (uusi kortti) molemmat valmiit, ks. oma osio alla.
**Huomio (jälkikäteen, 19.7.2026):** tämän sprintin Hero-määrittely osoittautui
regressioksi ja korvattiin — ks. yllä ja osio "Hero-tuotemäärittelyn regressiokorjaus".

**Dokumentaatiosprintti 15.7.2026:** BUG-A…D tarkistettu koodista (HEAD `41ade7c`) — kaikki edelleen avoinna, ks. merkinnät alla.

**Mobiilisprintti 17.7.2026:** Kolme peräkkäistä korjausta Kassa-kortin "TULOSSA"-osion mobiilikäyttöön (`3b13a4f`, `8653f87`, `2ff48af`) — validoitu oikealla iPhonella GitHub Pages -tuotantoympäristössä, ks. oma osio alla.

**Kassa syöttö UX 2.0 -sprintti 18.–19.7.2026:** Tulossa-, Säännölliset tulot- ja
Säännölliset menot -lisäys yhtenäistettiin yhdeksi "+ Lisää rahavirta" -editoriksi
(`fc57184`), minkä jälkeen editorin iOS Safari focus-scroll ja mobiilin kontrasti
korjattiin omana pienenä sprinttinä (`6489000`) — ks. oma osio alla.

---

## Viimeisimmät commitit

| Hash | Viesti | Päivä |
|------|--------|-------|
| `6a218a1` | docs: refine Kassa Info modal content | 2026-07-20 |
| `927c5e9` | feat: add Info button and explainer modal to Kassa card | 2026-07-20 |
| `565e653` | fix: polish Kassa card mobile layout and spacing | 2026-07-20 |
| `a2f97c2` | fix: remove Kassajakso income boundary from RAHAVIRRAT calculation | 2026-07-20 |
| `abb98df` | feat: refine Kassa terminology and cashflow colors | 2026-07-20 |
| `cfdaece` | fix: align Kassa Hero with cashflow model | 2026-07-20 |
| `f4a0bb9` | refactor: unify Kassa cashflow list UI | 2026-07-20 |
| `034eae9` | fix: korjaa Hero/Kassajakso-logiikka Seuraava rahatilanne -korttiin | 2026-07-19 |
| `506403c` | feat: uusi "Seuraava rahatilanne" -kortti Kassa-korttiin | 2026-07-19 |
| `f26d592` | refactor: eriytä säännöllisten tulojen/menojen rivien muodostus omaksi funktioksi | 2026-07-19 |
| `6489000` | fix: Kassa-editorin iOS Safari focus-scroll ja mobiilin kontrasti | 2026-07-19 |
| `fc57184` | feat: yhtenäistä Kassa-kortin rahavirtojen lisäys yhteen editoriin | 2026-07-18 |
| `2ff48af` | fix: prevent Kassa Tulossa Poista button from clipping on mobile | 2026-07-17 |
| `8653f87` | fix: scroll Kassa Tulossa form under nav on mobile before focus | 2026-07-17 |
| `3b13a4f` | fix: prevent iOS Safari auto-zoom in Kassa edit inputs on mobile | 2026-07-17 |
| `5067dcc` | fix: gate html2 block on expanded pref in Kassa card | 2026-06-02 |
| `3e9c287` | docs: add EMERGING_PHILOSOPHY.md | 2026-06-02 |
| `2b98485` | Fix Kassa card checkboxes: op_gold to header, _pref gates to html2 rows | 2026-06-02 |
| `9766010` | fix: improve pk-bar contrast in Päiväkirja | 2026-06-02 |
| `2e61467` | fix: correct checkbox keys in renderDashboard inv card | 2026-06-02 |

---

## Korjatut bugit (tässä kehityssessiossa)

### 1. Sijoituskortin checkbox-avainpari — `2e61467`
**Ongelma:** `_cardHeader` kirjoitti preffejä avaimilla `row_op` / `row_spankki`,
mutta `invRows`-taulukko luki `row_op_osakkeet` / `row_tapiola`. Checkbox oli no-op.
**Korjaus:** ui2-v2.js rivit 688–689. 2 riviä.

### 2. pk-bar kontrasti Päiväkirjassa — `9766010`
**Ongelma:** Tulotili/OP Gold -suhdepalkin kontrasti liian heikko.
**Korjaus:** index.html rivit 795–797. Korkeus 4→6px, opacity .38→.72. 3 riviä.

### 3. Kassa-kortin checkboxvalikko + html2-_pref-portit — `2b98485`
**Ongelma:** OP Gold puuttui checkboxvalikosta. Tulotili- ja OP Gold -rivit renderöityivät
html2-blokissa aina, riippumatta checkboxin tilasta.
**Korjaus:** ui2-v2.js. Lisätty `op_gold` _cardHeader-listaan, lisätty `_pref`-portit
html2-blokin Tulotili- ja OP Gold -riveille, ehdollinen separator. +18/-10 riviä.

### 4. "Yksityiskohdat" toimii väärinpäin Kassa-kortissa — `5067dcc`
**Ongelma:** html2-blokki (Tulotili, OP Gold, Käyttövara) ei reagoinut `expanded`-prefin
muutokseen. Checkbox OFF piilutti vain .sub-rows-legacy-blokin, ei pääsisältöä.
**Korjaus:** ui2-v2.js rivit 774 ja 824. Koko html2-IIFE gated `_pref('cash','expanded',true)`
taakse. +2/-2 riviä.

---

## Korjatut bugit — mobiilisprintti 17.7.2026 (Kassa "TULOSSA" -lomake, iOS Safari)

Kolme peräkkäistä sprinttiä samaan käyttäjäpolkuun: Kassa-kortin "TULOSSA"-osion
"+ Lisää" -painike mobiilissa (`kassaTulossaAdd()`, js/ui2-v2.js).

### 5. iOS Safari zoomasi näyttöä lomakkeen avautuessa — `3b13a4f`
**Ongelma:** `.kassa-edit-input`/`.kassa-edit-select` (index.html) renderöityivät 13px
fontilla. iOS Safari zoomaa automaattisesti näyttöä, kun fokusoitu kenttä on alle 16px.
**Korjaus:** index.html, `@media (max-width:899px)` -sääntö nostaa fonttikoon 16px:ään
vain mobiilissa. Desktop (13px) ennallaan.

### 6. Lomake ei vierittynyt näkyviin fokuksen yhteydessä — `8653f87`
**Ongelma:** `kassaTulossaAdd()` kutsui `focus()`:ia suoraan renderöinnin jälkeen,
jolloin natiivi selain-scroll toi näkyviin vain yksittäisen kentän — ei koko lomaketta
(TULOSSA-otsikko, kentät, Tallenna/Peru/Poista).
**Korjaus:** `renderTulossaList()` → `requestAnimationFrame` → lomakkeen todellinen
sijainti mitataan `getBoundingClientRect()`:lla ja vieritetään `scrollBy`:lla juuri
sticky-navin alapuolelle → vasta sitten `focus()`. Ei heuristiikkaa, ei
`visualViewport`-kuuntelijaa, ei kiinteitä prosenttiarvoja — puhtaasti mitattuun
geometriaan perustuva. Vain mobiilissa (`window.innerWidth < 900`); desktop-polku
muuttumaton.

### 7. Poista-painike leikkautui oikeasta reunasta — `2ff48af`
**Ongelma:** Mobiilissa `.db-item.card` on 2-sarakkeinen grid (40%/1fr), ja
Tallenna/Peru/Poista-rivi sijaitsee `.card-right`-sarakkeessa (~50–55 % kortin
leveydestä, `overflow:hidden`). Painikkeilla ei ollut `min-width:0`, joten selain ei
kutistanut niitä tilaan — Poista leikkautui pois.
**Korjaus:** index.html, `@media (max-width:899px)` -sääntö pienentää
padding/font-sizen ja lisää `min-width:0` + `text-overflow:ellipsis`-turvaverkon vain
tälle painikeriville. Desktop-arvot (padding 5px 12px, font-size 12px) ennallaan.

**Validointi:** Kaikki kolme korjausta testattu ja hyväksytty käyttäjän toimesta
oikealla iPhonella, GitHub Pages -tuotantoympäristössä
(`https://y64yfdb4w7-creator.github.io/talous/`), 17.7.2026. Kaikki kuusi
hyväksymiskriteeriä täyttyivät: ei zoomausta, lomake vierittyy oikeaan kohtaan ennen
fokusta, Tallenna/Peru/Poista näkyvät kokonaan, painikkeet pysyvät samalla rivillä,
ei vaakavieritystä, desktop-käyttäytyminen säilyi ennallaan.

---

## Kassa syöttö UX 2.0 -sprintti 18.–19.7.2026

### 8. Kolme erillistä syöttölomaketta yhdistettiin yhdeksi editoriksi — `fc57184`
**Lähtötilanne:** Kassa-kortissa oli kolme rinnakkaista, osin pysyvästi näkyvää
syöttötapaa: Tulossa omalla `+ Lisää` -napillaan ja inline-lomakkeellaan
(`kassaTulossaAdd`/`renderTulossaList`), Säännölliset menot omalla aina-näkyvällä
3-kenttäisellä lomakkeellaan (`renderSaannollisetMenot`/`panelMenoAdd`), ja
Säännölliset tulot ilman minkäänlaista lisäys-UI:ta Kassa-kortissa (ainoastaan
luku Kuukausirytmi-yhteenvedossa; oikea lisäys tapahtui erillisessä
Syötä-näkymässä `entryAddTulo`-funktioilla).
**Muutos:** Kaikki kolme pysyvästi näkyvää syöttölomaketta/-nappia poistettiin.
Tilalle yksi `+ Lisää rahavirta` -painike (`renderRahavirtaEditor`, js/ui2-v2.js),
joka avaa yhden editorin tyyppivalinnalla (Tulossa / Säännöllinen tulo /
Säännöllinen meno). Editori mukautuu kenttineen valinnan mukaan
(`renderRahavirtaFields`), käyttää samaa validointi- ja tallennuslogiikkaa
kaikille kolmelle (`rahavirtaEditorSave`) ja samaa mobiilin fokus/scroll-logiikkaa
kuin aiempi Tulossa-korjaus (`8653f87`). Säännölliset tulot sai uuden listan
(rivit + poisto, `renderSaannollisetTulot`/`panelTuloDelete`) Kassa-korttiin, koska
sitä ei ollut ennestään. Olemassa oleva Tulossa-rivien klikkaus-muokkaus
(`kassaTulossaEdit`) jätettiin tietoisesti koskematta — rajattu seuraavaan
sprinttiin. Datamalliin lisättiin vain valinnainen `paiva`-kenttä
`tulot_items`-riveille; Supabase-sync koskematon.
**Validointi:** Testattu selaimessa (kaikki 3 lisäystyyppiä, tyypinvaihto, Peruuta,
olemassa olevan Tulossa-muokkauksen ennallaan pysyminen). Mobiilin viewport-testi
ei onnistunut tässä istunnossa käytetyllä selainautomaatiolla (`resize_window` ei
vaikuttanut `window.innerWidth`-arvoon) — hyväksytty koodipohjaisena vahvistuksena
käyttäjän toimesta, koska mobiililogiikka on suora kopio jo tuotannossa
validoidusta `8653f87`-korjauksesta.

### 9. iOS Safari focus-scroll -hyppy ja mobiilin kontrasti uudessa editorissa — `6489000`
**Ongelma:** Uuden rahavirta-editorin Nimi-kenttä (`rv_label`) hyppäytti näkymää
iOS Safarissa. Syy: `_rahavirtaFocusAndScroll()` teki oman `window.scrollBy`-korjauksen
ja kutsui heti perään `inp.focus()` ilman `preventScroll`-optiota — Safarin natiivi
"scrollaa fokusoitu kenttä näkyviin" -käytös laukesi `focus()`-kutsusta ja kilpaili
juuri tehdyn manuaalisen scrollin kanssa, mikä näkyi hyppynä. Lisäksi syöttökenttien
ja painikkeiden reunat olivat mobiilissa liian himmeät (`var(--border-bright)`
tummaa taustaa vasten).
**Korjaus:** `inp.focus({preventScroll:true})` ensin, oma `requestAnimationFrame`-scroll
vasta sen jälkeen — natiivi ja oma scroll eivät enää kilpaile (js/ui2-v2.js,
`_rahavirtaFocusAndScroll`, `rahavirtaTypeChange`). Lisäksi `.kassa-edit-input`/
`.kassa-edit-select` saivat `scroll-margin-top`-arvon (nav-palkin korkeus + marginaali)
suoraan käyttäjän kosketuksesta johtuvaa natiivia scrollia varten. Mobiilin
`@media (max-width:899px)` -kyselyyn lisättiin kontrastikorjaukset syöttökenttien
reunoille, fokus-tilalle (`box-shadow`-rengas `var(--card-primary)`-värissä) ja
Tallenna/Peru/Poista/Lisää-painikkeiden reunoille — samoja Design System -tokeneita
(`--green`, `--red`, `--card-primary`) käyttäen, ei uusia värejä. Ei rakenne- tai
toiminnallisuusmuutoksia; desktop-käyttäytyminen ennallaan.
**Validointi:** Desktop-regressio testattu selaimessa (editori avautuu/sulkeutuu
ennallaan). Mobiilitesti julkaistulla sivulla käyttäjän omalla laitteella jätettiin
käyttäjän pyynnöstä sprintin ulkopuolelle — mahdolliset lisähavainnot korjataan
seuraavassa pienessä sprintissä.

---

## Säännöllisten menojen renderöinnin kovennus (19.7.2026)

Toteutettu:
- Korjattu renderöintibugi, jossa virheellinen nimi (esim. ".", "...", tyhjä tai pelkät välilyönnit) näkyi käyttöliittymässä pisteenä.
- Lisätty yhteinen nimen normalisointi renderöintiin.
- Virheelliset nimet korvataan käyttöliittymässä oletusnimellä ("Meno" tai "Tulo"), jolloin käyttäjä voi edelleen muokata tai poistaa rivin.
- Ratkaisu ei muuta tietomallia eikä tallennuslogiikkaa.
- Sama logiikka käytössä kaikissa kuukausirytmin renderöinneissä, jotta vastaava bugi ei voi syntyä eri näkymissä.

Testattu:
- "."
- "..."
- pelkät välilyönnit
- tyhjä nimi
- normaalit nimet
- poisto toimii edelleen oikealla indeksillä
- kuukausisummat pysyvät oikein

Commit:
- `8a38d0b` — fix: normalize recurring income/expense labels during rendering

---

## "Seuraava rahatilanne" -kortti — Sprintti 1/2: puhdas refaktorointi (19.7.2026)

**Konteksti:** Kassa-kortin nykyinen Kulutusrytmi/Kuukausirytmi/Tulossa/Säännölliset
tulot/menot -alue korvataan suunnittelupäätöksen mukaan uudella "Seuraava
rahatilanne" -kortilla (Hero-summa → Ryhmä 1: TULEVAT ERÄT → Välisumma →
Ryhmä 2: SÄÄNNÖLLISET ERÄT → Loppurivi). Työ jaettiin kahteen sprinttiin
regressioriskin pienentämiseksi: Sprintti 1 (tämä) on puhdas refaktorointi ilman
näkyviä muutoksia, Sprintti 2 rakentaa uuden kortin sen päälle.

**Toteutettu:**
- `renderSaannollisetTulot()` ja `renderSaannollisetMenot()` (js/ui2-v2.js) sisälsivät
  identtisen rivien muodostuslogiikan (lajittelu päivän/nimen mukaan, nimen/päivän
  normalisointi, rivi-HTML, poistonapin `onclick`, summan laskenta) kopioituna kahteen
  kertaan. Erotettiin yhteinen osa uuteen apufunktioon
  `buildSaannollinenRows(items, fallbackLabel, deleteFnName, amtOf)`, joka palauttaa
  `{rows, total}`.
- Molemmat alkuperäiset funktiot kutsuvat nyt apufunktiota ja kokoavat oman otsikkonsa,
  tyhjän listan viestin ja "Yhteensä"-rivin sen ympärille — tuloste-HTML täsmälleen
  ennallaan.
- Ei muutoksia tietomalliin, synkronointiin, CSS:ään eikä CRUD-funktioihin
  (`panelMenoDelete`, `panelTuloDelete`, `renderRahavirtaEditor`). `renderTulossaList()`
  ei vaatinut muutoksia — sen otsikko tulee jo valmiiksi kutsujalta.

**Testattu:**
- Node-regressiotesti: vanhan (pre-refaktorointi) ja uuden toteutuksen tuloste-HTML
  vertailtu merkki merkiltä 5 testitapauksella (tyhjä lista, puuttuvat kentät, yksi rivi,
  useita rivejä sekalaisessa järjestyksessä tyhjillä/piste-nimillä, virheelliset päivät
  0/32/desimaali/tyhjä) — kaikki identtiset.
- Selainregressio desktopilla (paikallinen staattinen palvelin, todellinen IndexedDB):
  säännöllisen menon lisäys ja poisto, säännöllisen tulon lisäys ja poisto. Lajittelu
  (päivä nousevasti, tasapelissä aakkosjärjestys), tyhjä/piste-nimen korvautuminen
  oletusnimellä, päivämuotoilu ("N.") ja summat (Yhteensä-rivit, Tulot/Menot/Netto per
  kk) täsmäsivät ennen/jälkeen jokaisen operaation.
- Muokkaus-toimintoa ei ole olemassa säännöllisille tulo-/menoriveille nykyisessä
  UI:ssa — vain lisäys ("+ Lisää rahavirta") ja poisto (✕). Tarkistettu koodista, tila
  ennallaan refaktoroinnin jälkeen.

**Miksi Sprintti 2 on turvallisempi:** Ryhmä 2:n ("SÄÄNNÖLLISET ERÄT") yhdistetty
rivilista `rytmi_items`- ja `tulot_items`-taulukoista voidaan rakentaa kutsumalla
`buildSaannollinenRows()`-funktiota molemmilla taulukoilla, ilman että rivien
sisäistä muodostuslogiikkaa kirjoitetaan tai testataan uudelleen kahteen kertaan.

Commit:
- `f26d592` — refactor: eriytä säännöllisten tulojen/menojen rivien muodostus omaksi funktioksi

---

## "Seuraava rahatilanne" -kortti — Sprintti 2/2: uusi kortti (19.7.2026)

**Suunnittelupäätös (tiivistettynä):** Hero-summa = `tulotili − |op_gold|` ("NYT"),
sama luku joka on koko ajan ollut Kassa-kortin ydinarvo — ei projektiota, vaan
kortin tarinan lähtöpiste. Lopputilanne = `Hero + Σ(tulevat_items.amount) +
Σ(tulot_items.amt_kk) − Σ(rytmi_items.amt_kk)`. "+ Lisää rahavirta" -editori pysyy
kortin lopussa, Lopputilanteen jälkeen — neutraali sijainti molempien ryhmien
suhteen, sama paikka kuin ennen. Tyhjä ryhmä näytetään otsikon alla tekstillä ("Ei
tulevia eriä."/"Ei säännöllisiä eriä.") sen sijaan että lohko piilotettaisiin
kokonaan — rakenne pysyy ennakoitavana joka snapshotilla.

**Toteutettu:**
- Uusi `renderKassaSeuraavaRahatilanne(latest)` (js/ui2-v2.js) korvaa segmenttipalkin,
  KULUTUSRYTMI-lohkon, `renderKassaKuukausirytmi()`-kutsun sekä kaksi erillistä
  Säännölliset tulot/menot -listaa ja TULOSSA-lohkon yhdellä koosterenderillä:
  Kortin otsikko (SEURAAVA RAHATILANNE) → Hero (NYT) → TULEVAT ERÄT
  (`tulevat_items`) → ehdollinen Välisumma ("Jäljellä tulevien erien jälkeen",
  näkyy vain jos molemmissa ryhmissä ≥1 rivi) → SÄÄNNÖLLISET ERÄT (`rytmi_items` +
  `tulot_items` yhdistettynä yhden otsikon alle, tulot ennen menoja) → Lopputilanne
  (näkyy aina).
- Poistettu käytöstä jääneet: `renderKassaKuukausirytmi()`, `toggleKassaRytmiDetails()`,
  Sprintti 1:n kääre-funktiot `renderSaannollisetTulot()`/`renderSaannollisetMenot()`
  (niiden oma otsikko+Yhteensä-rakenne ei sopinut yhdistettyyn ryhmään — uusi funktio
  kutsuu `buildSaannollinenRows()`-apufunktiota suoraan niiden ohi), sekä käyttämättömät
  muuttujat `tempo2`/`baseline2`/`devEur2`/`kayttovara`/`kv2Color`.
- Ei uutta CSS:ää — Hero käyttää `.card-value`, otsikot `.kassa-section-hdr`,
  Välisumma/Lopputilanne-rivit `.panel-row`/`.panel-row-lbl`/`.panel-row-val`.
  `renderTulossaList()`, CRUD-funktiot ja `renderRahavirtaEditor()` koskemattomia.

**Testattu:**
- Node-laskentaregressio: 6 tapausta (peruskäyttäjä, Ryhmä 1 tyhjä, Ryhmä 2 tyhjä,
  molemmat tyhjät, vain menoja Ryhmä 2:ssa, negatiivinen Hero) — kaikki täsmäsivät
  käsin laskettuun kontrolliarvoon.
- Selainregressio desktopilla (todellinen IndexedDB): kaikki ryhmät täynnä, molemmat
  tyhjät (tyhjän tilan viestit + Välisumman piilotus), säännöllisen menon lisäys ja
  poisto uuden kortin kautta — Lopputilanne päivittyi oikein joka kerta.
- Visuaalinen tarkistus stressidatalla (pitkät nimet, 6 tulevaa erää 3 kuukaudessa,
  11 säännöllistä erää): desktopilla kaikki rivittyy siististi, editori pysyy
  Lopputilanteen jälkeen. Mobiilissa (390 px viewport, simuloitu iframe-tekniikalla
  koska `resize_window` ei vaikuta `window.innerWidth`-arvoon tässä
  selainautomaatiossa — sama rajoitus kuin Kassa syöttö UX 2.0 -sprintissä):
  ei sivunlaajuista vaakavieritystä, Hero ei ylivuoda, pitkät nimet rivittyvät
  1–3 riville ilman katkeamista, kaikki arvot täysin näkyvissä.

Commit:
- `506403c` — feat: uusi "Seuraava rahatilanne" -kortti Kassa-korttiin

---

## Hero-tuotemäärittelyn regressiokorjaus — Kassajakso-sprintti (19.7.2026)

**Tausta:** Auditoinnissa havaittiin, että Sprintti 1+2:ssa (yllä) kirjattu
Hero-määrittely ("Hero-summa = tulotili − |op_gold|, 'NYT'") tehtiin sprintin sisällä
ilman erillistä suunnittelijan hyväksyntää — prosessipoikkeama CLAUDE.md:n
vastuunjakoa vasten — ja se oli ristiriidassa kortin oman otsikon ("Seuraava
rahatilanne") kanssa: Hero näytti vain nykyhetken kassan, ei mitään tulevaisuuteen
katsovaa.

**Lukitut tuotepäätökset:**

1. **Hero-tuotemäärittely v1.0** — Hero on puhdas laskentakomponentti. Se summaa
   vain sille annetun rahavirtajoukon (lähtökassa + tulot − menot). Se ei tee
   ennusteita, ei päättele kassajaksoa eikä sitä mitkä rahavirrat siihen kuuluvat,
   ei tunne "palkkaa", ei riipu rahavirran sijainnista tietorakenteessa.
2. **Aikareferenssi** — Finance OS:n aikareferenssi on aina käyttäjän viimeisin
   snapshot, ei laitteen kellonaika.
3. **Kassajakson rajaamiskriteeri** — Kassajakso rajataan käyttäjän viimeisimmän
   snapshotin ja seuraavan tunnetun tulon muodostamien rajapisteiden perusteella.
   Jäsenyys kassajaksossa määräytyy yksinomaan rahavirran ajallisen sijainnin
   perusteella suhteessa näihin kahteen rajapisteeseen — ei sillä, että rahavirta
   "kuuluu kassajaksoon" (korjaa aiemman Kassajakso-luonnoksen kehäpäätelmän).
4. **Tunnetun tulon määritelmä** — Tulo on "tunnettu", kun se on kirjattu
   rahavirtana järjestelmään ja sillä on määritelty, viimeisimmän snapshotin
   jälkeinen ajallinen sijainti. Tunnettuus ei riipu siitä, onko rahavirta toistuva
   vai kertaluonteinen — kumpikin kelpaa yhtäläisesti. Järjestelmä ei päättele eikä
   ennusta tulevia tuloja: jos vastaavaa rahavirtaa ei ole kirjattu, tuloa ei ole
   olemassa "tunnettuna" tulona kassajakson rajaamista varten.
5. **Lähtökassan lähde** — Lähtökassa lasketaan viimeisimmän snapshotin
   lähtökassaan kuuluvien tilien (tulotili, op_gold) yhteissummasta — ei käyttäjän
   erikseen syöttämä arvo eikä Heron itse johtama.
6. **Kassavaikutteisen rahavirran määritelmä** — Rahavirta on kassavaikutteinen,
   jos se muuttaa niiden tilien yhteissummaa, jotka sisältyvät lähtökassan
   laskentaan. Rahavirrat jotka eivät kosketa näitä tilejä (esim. sijoitukset,
   lainan pääoma), tai jotka vain siirtävät rahaa näiden tilien välillä ilman että
   yhteissumma muuttuu, eivät ole kassavaikutteisia kassajakson kannalta.

**Arkkitehtuurin vastuurajat (LUKITTU):** kolme komponenttia — Rahavirta /
Kassajakso / Hero. Kukin tuntee vain sen mitä alempi kerros sille luovuttaa, ei
miten se syntyi. Ks. `docs/FINANCE_OS_ARCHITECTURE.md` § "Hero / Kassajakso /
Rahavirta — vastuurajat".

**Toteutettu (js/ui2-v2.js):**
- Uudet kerrosfunktiot: `lahtokassaOf(snap)`, `nextRecurringDayDate`,
  `nextMonthOnlyDate`, `collectRahavirrat`, `buildKassajakso`, `heroSum`.
- `renderKassaSeuraavaRahatilanne` ja `renderTulossaList` käyttävät nyt
  Kassajakson rajaamaa rahavirtajoukkoa sekä laskennassa että näytössä — aiemmin
  kaikki `tulevat_items`/`rytmi_items`/`tulot_items` laskettiin mukaan rajoituksetta.
- Kassa-kortin ylätason yhteenvetoarvo (`card-value`) korjattu käyttämään
  `lahtokassaOf`:ia erillisen duplikaattikaavan sijaan.
- Poistettu laitteen kellonaikaan turvautuva varakeino Kassajakson
  päivämäärälaskennasta (`buildKassajakso` käyttää yksinomaan `latest.date`:a).

**Tunnettu sivuvaikutus (ei korjattu tässä sprintissä):** `tulevat_items`-erillä on
vain kuukausi, ei vuotta eikä päivää — kuluvan/lähikuukauden kertaluonteinen erä voi
näyttäytyä kassajakson päättävänä tunnettuna tulona hyvin varhain (approksimoitu
kuukauden 1. päiväksi). Erät jotka putoavat kassajakson rajan ulkopuolelle eivät
myöskään näy tai ole muokattavissa tässä kortissa ennen kuin niiden oma jakso koittaa.

**Testattu:**
- Node-yksikkötestit: 4 skenaariota (normaali kassajakso, ei tunnettua tuloa,
  palkkapäivä osuu snapshot-päivälle → kääriytyy seuraavaan kuukauteen, vain
  säännölliset erät) — kaikki täsmäsivät käsin laskettuun kontrolliarvoon.
- Selainregressio paikallisella palvelimella (todellinen IndexedDB, synteettinen
  testidata): Kassa-kortin ylälukema, Lähtökassa, Tulevat erät, Säännölliset erät
  ja Lopputilanne täsmäsivät kaikki toisiinsa ja Node-testien kontrolliarvoihin;
  ei konsolivirheitä.

Commit:
- `034eae9` — fix: korjaa Hero/Kassajakso-logiikka Seuraava rahatilanne -korttiin

---

## Kassa-kortin RAHAVIRRAT-sprintti: yhdistäminen, Hero-synkronointi, terminologia, Kassajakson rajaamismallin poisto (20.7.2026)

Neljä peräkkäistä, käyttäjän hyväksymää pienisprinttiä, kukin oma commitinsa,
ks. `docs/KASSA_CARD_STATUS.md` täydelliset auditoinnit ja testiraportit.

### 1. RAHAVIRRAT-listan yhdistäminen — `f4a0bb9`
**Muutos:** Kassa-kortin erilliset TULEVAT ERÄT- ja SÄÄNNÖLLISET ERÄT -osiot
(otsikot, "Jäljellä tulevien erien jälkeen" -välisumma, erilliset tyhjän tilan
viestit) korvattiin yhdellä RAHAVIRRAT-listalla. Kaikki rahavirrat (kertaluonteiset
ja säännölliset) näkyvät yhdessä listassa aikajärjestyksessä, kuukausiryhmittäin.
Säännöllisyys näkyy pienellä ⟳-symbolilla. Lisätty kevyt suodatin
(Kaikki/Säännölliset/Kertaluonteiset), joka päivittää vain listan, ei koko
dashboardia. `buildSaannollinenRows`-apufunktio poistui käytöstä (logiikka
siirrettiin `renderTulossaList`-funktioon). Kassajakson rajauslogiikkaa,
Hero-laskentaa tai tietomallia ei koskettu.
**Testattu:** selainregressio (paikallinen IndexedDB) — sorttaus, kuukausiryhmittely,
suodatin, kertaluonteisen rivin klikkaa-muokkaa, säännöllisen rivin poisto,
"+ Lisää rahavirta" — kaikki muuttumattomina.

### 2. Hero synkronoitiin Kassajakson lopputilanteen kanssa — `cfdaece`
**Ongelma (havaittu auditoinnissa):** `kassaValisumma()` (näkyvä Hero, `card-value`)
laski vain lähtökassan + tulevat kertaluonteiset erät, kun taas kortin oma
"Lopputilanne" (`heroSum()`) laski koko Kassajakson joukon (myös säännölliset).
Kaksi eri lukua saman "Hero"-nimen alla.
**Korjaus:** `kassaValisumma(latest)` delegoi nyt suoraan
`heroSum(buildKassajakso(latest))`:lle — yksi rivi. LUKITTU tuotepäätös #9.
**Testattu:** ylätason Hero ja "Lopputilanne" näyttivät saman luvun kaikissa
testiskenaarioissa; Kassajakson rajaus ja `heroSum`/`buildKassajakso` koskematta.

### 3. Kassa-kortin terminologia ja rahavirtojen värikoodaus — `abb98df`
**Muutos:** "LÄHTÖKASSA" → "NYKYINEN KASSA" (yksi UI-tekstikohta,
`js/ui2-v2.js:2097`) — arvo kuvaa käyttäjän nettokassaa (tilit − luottokortit),
ei Kassajakson alkua. `lahtokassaOf()`-funktiota tai sisäistä muuttujaa ei
nimetty uudelleen. Lisätty uusi CSS-muuttuja `--expense: #a8654f` (hillitty,
tumma terrakotta-koralli — tummempi kuin `--red`, erottuu selvästi
"varoitus"-punaisesta) menorivien väriksi sekä kertaluonteisille että
säännöllisille rahavirroille; tulot säilyttivät vihreän.
**Testattu:** väriarvot varmistettu `getComputedStyle`:lla, typografia/asettelu
ennallaan, Hero-arvo muuttumaton.

### 4. Kassajakson "ensimmäiseen tunnettuun tuloon" -rajaus poistettiin — `a2f97c2`
**Tausta:** Auditoinnissa löytyi regressio: jos käyttäjällä ei ollut yhtään
tunnettua tulevaa tuloa kirjattuna, `buildKassajakso()` palautti tyhjän
`items`-joukon — koko RAHAVIRRAT-lista ja Hero tyhjenivät, vaikka
säännöllisiä menoja oli tallennettu oikein. Uusi LUKITTU tuotepäätös #12
(kumoaa päätökset #3 ja #4): rahavirtajoukkoa ei enää katkaista ensimmäiseen
tuloon — kaikki tiedossa olevat tulevat kertaluonteiset erät näkyvät, ja
jokaisesta säännöllisestä rahavirrasta vain seuraava esiintymä.
**Korjaus:** `buildKassajakso(latest)` (`js/ui2-v2.js:2034`) palauttaa nyt
`{lahtokassa, items}`, jossa `items = collectRahavirrat(...)` sellaisenaan —
`incomes`/`boundary`-suodatus ja `boundary`-kenttä poistettiin kokonaan.
`heroSum`, `kassaValisumma`, `renderTulossaList()` eivät muuttuneet — ne
perivät uuden käyttäytymisen automaattisesti, koska kuluttavat
`buildKassajakso(...).items`:n sellaisenaan. Yksi tietojoukko, yksi totuus.
**Testattu:** (a) snapshot ilman yhtään tunnettua tuloa — kaikki rahavirrat
näkyvät nyt oikein (aiemmin tyhjä lista); (b) monikuukautinen sekoitettu
aineisto (kertaluonteisia + säännöllisiä, tahallisesti sekoitetussa
syöttöjärjestyksessä) — kuukausiryhmittely ja kronologinen järjestys
täsmäsivät oikein jokaisessa ryhmässä; sorttaus tapahtuu `renderTulossaList()`:ssä,
ei koskaan ollut `buildKassajakso()`:n vastuulla; (c) ylätason Hero ja
Lopputilanne täsmäsivät kaikissa skenaarioissa; (d) "+ Lisää rahavirta" testattu
kaukana tulevaisuudessa olevalle erälle — tallentui ja näkyi oikein; (e) ei
JS-virheitä konsolissa.

Commit:
- `f4a0bb9` — refactor: unify Kassa cashflow list UI
- `cfdaece` — fix: align Kassa Hero with cashflow model
- `abb98df` — feat: refine Kassa terminology and cashflow colors
- `a2f97c2` — fix: remove Kassajakso income boundary from RAHAVIRRAT calculation

---

## Kassa-kortin mobiili-UX viimeistely (20.7.2026)

Rajattu mobiili-CSS-sprintti — pelkkä layout/spacing, ei liiketoimintalogiikkaa,
laskentaa, rahavirtojen toimintaa eikä datamallia. Kaikki muutokset index.html:n
olemassa olevaan `@media (max-width:899px)`-sääntöön.

### 1. Hero omalle riville, RAHAVIRRAT-rivien typistys, poistoikonin spacing, suodattimien vaakascroll, FAB-tila — `565e653`
**Ongelma:** Kassa-kortin mobiililayout (<899px) käytti samaa 40%/60%-gridiä
kuin muut kortit: Hero jäi ankkuroituna kapeaan vasempaan sarakkeeseen ison
tyhjän tilan päälle, RAHAVIRRAT-rivien nimet ja summat saattoivat rikkoa
rivin kahdelle, poistoikoni oli liian lähellä summaa, segmenttipainikkeet
(Kaikki/Säännölliset/Kertaluonteiset) saattoivat leikkautua kapealla
näytöllä, ja kelluva "Päivitä"-painike saattoi peittää kortin viimeisiä
rivejä.
**Korjaus:** Kaikki `[data-item-id="cash"]`-selektorilla scopattuna (muihin
korttien mobiililayouttiin ei puututtu):
- `.db-item.card[data-item-id="cash"]`: `grid-template-columns:1fr` +
  `grid-template-areas:"hdr" "lft" "rgt"` — Hero täysleveänä omalla rivillään.
- `.panel-row-lbl`: `flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;
  white-space:nowrap` — nimi typistyy, ei riko riviä.
- `.panel-row-val`: `white-space:nowrap;min-width:44px;text-align:right;
  flex-shrink:0` — summa ei koskaan katkea.
- `.panel-row > span:last-child` + `.panel-row button`: `flex-shrink:0` +
  `margin-left:6px` — poistoikonille oma spacing.
- `.kassa-filter-row`/`.kassa-filter-btn`: `overflow-x:auto` +
  `flex-shrink:0` — suodattimet vaakascrollautuvat, eivät leikkaudu.
- `.view`: padding-bottom 96px → 120px (kaikki mobiilinäkymät) — enemmän
  scroll-tilaa FAB:n alle.
Paddingin pienennystä (18px→14px) harkittiin, mutta testattiin todelliseen
390px/430px-leveyteen ja todettiin tarpeettomaksi — Hero-korjaus yksin riitti,
ja alkuperäinen 18px säilytettiin Design System 1.0:n yhtenäisyyden vuoksi.
**Testattu:** paikallinen selainregressio (computed-style-vertailu ennen/
jälkeen, iframe-pohjainen 390px/430px-viewport-testi), desktop (>899px)
varmistettu koskemattomaksi (`[data-item-id="inv"]` säilytti 40%/60%-gridin
ja 18px paddingin). Julkaisuvaiheessa havaittu ja korjattu erillinen
prosessivirhe: commit ei ollut alun perin pushattu origin/mainiin, minkä
vuoksi tuotantosivu näytti hetken vanhaa CSS:ää — vahvistettu
`git log origin/main..HEAD` tyhjäksi pushin jälkeen.

Commit:
- `565e653` — fix: polish Kassa card mobile layout and spacing

---

## Kassa-kortin Info-painike ja selittävä modal (20.7.2026)

Uusi ominaisuus, ei bugikorjaus. Ennen toteutusta varmistettu, ettei
Kassa-kortilla (tai muuallakaan koodikannassa) ole koskaan ollut Info-
painiketta tai -dialogia: `grep -n "Info\|ℹ️\|info-btn\|cardInfo\|InfoModal\|infoPopover"`
ui2-v2.js:ssä/index.html:ssä ei löytänyt Kassa-korttiin liittyviä osumia, ja
`git log --all --oneline -i --grep="info"` palautti tyhjän. Etsintä lopetettu
tähän ja siirrytty suoraan toteutukseen, kuten pyydetty.

### 1. Info-painike + keskitetty selitysmodal — `927c5e9`
**Muutos:** `_cardHeader`-funktioon (`js/ui2-v2.js:606`) lisätty ehdollinen
`ℹ`-painike, joka renderöityy vain `cardKey === 'cash'` -tapauksessa, samalla
tyylillä ja samassa otsikkorivin painikeryhmässä kuin olemassa oleva
`⋯`-Asetukset-painike. Klikkaus kutsuu uutta `window.openCardInfo(cardKey, evt)`
-funktiota (`js/ui2-v2.js` heti `_cardHeader`:n jälkeen), joka rakentaa
DOM-elementtinä kevyen, keskitetyn modalin: puoliläpinäkyvä backdrop
(`position:fixed;inset:0`), sisältöboksi `max-width:min(380px,92vw)` +
`max-height:80vh;overflow-y:auto` (skaalautuu mobiiliin ilman erillistä
media querya), neljä lyhyttä osiota (Tarkoitus, Hero-luku, Tilit ja
rahavirrat, "Lopputilanne"). Sulkeutuu ✕-painikkeesta, backdrop-klikkauksesta
tai uudelleen ℹ:tä klikkaamalla (toggle). Design System -yhteensopiva:
samat CSS-muuttujat (`var(--surface)`, `var(--border-bright)`, `var(--text2)`,
`var(--card-primary)`) ja samantyyppinen rakenne kuin olemassa olevassa
`openCardSettings`-popoverissa.
**Ei koskettanut:** laskentalogiikkaa, Hero-laskentaa (`heroSum`,
`kassaValisumma`, `buildKassajakso`), tietomallia, muita korttien
otsikkorivejä (`inv`, `debt` — vahvistettu, ei sisällä `openCardInfo`-kutsua).
**Testattu:** paikallinen selainregressio synteettisellä testisnapshotilla —
painike näkyy vain Kassa-kortilla, modal avautuu/sulkeutuu oikein (✕, backdrop,
toggle), sisältö luettavissa kokonaan sekä 390px mobiiliviewportissa että
desktop-leveydellä, ei konsolivirheitä, Hero-arvo muuttumaton modalin
avaamisen/sulkemisen jälkeen.

Commit:
- `927c5e9` — feat: add Info button and explainer modal to Kassa card

---

## Kassa Info-modalin sisällön viimeistely (20.7.2026)

Puhdas sisältösprintti — ei toiminnallinen muutos. Edellisessä sprintissä
(yllä) rakennettu Info-modal sai käyttäjälähtöisemmän tekstin ja uuden
"Huomio"-osion.

### 1. Info-modalin tekstien uudelleenkirjoitus — `6a218a1`
**Muutos:** `openCardInfo`-funktion (`js/ui2-v2.js`) `sections`-taulukko
kirjoitettiin kokonaan uudelleen:
- **Tarkoitus** ja **Hero-luku**: tekninen sanamuoto ("tilit − OP Gold",
  "seuraava esiintymä") korvattiin käyttäjälähtöisellä selityksellä siitä,
  mitä käyttäjä näkee — ei miten se lasketaan.
- **"Tilit ja rahavirrat"** jaettiin kahdeksi omaksi osiokseen: **Nykyinen
  kassa** (tilien saldo − OP Goldin käytetty saldo, lähtöpiste
  rahavirtalaskelmille) ja **Rahavirrat** (tuleva lista aikajärjestyksessä).
- **"Lopputilanne"**: sanamuoto selkeytetty, viittaa nyt suoraan Hero-lukuun.
- Uusi **Huomio**-osio lisätty loppuun: kortti perustuu snapshot-ajatteluun,
  ei ole kirjanpito- tai budjetointityökalu, ei seuraa yksittäisiä
  pankkitapahtumia.
**Ei koskettanut:** modalin DOM-rakennetta, `sections.forEach`-renderöintiä,
CSS:ää, painikkeita eikä laskentalogiikkaa — vain taulukon merkkijonot.
**Testattu:** paikallinen selainregressio 390px mobiiliviewportissa — kaikki
kuusi osiota (mukaan lukien uusi Huomio) rivittyvät oikein modalin sisäisen
scrollin sisällä, ei vaakaylivuotoa, Hero-arvo muuttumaton.

Commit:
- `6a218a1` — docs: refine Kassa Info modal content

---

## Avoimet bugit

### BUG-A: "Näytä dashboardissa" — täysi no-op
**Tiedosto:** ui2-v2.js, funktio `toggleCardVisible` rivi 389
**Juurisyy:** Pref `visible` kirjoitetaan (`_setCardPref(card,'visible',...)`),
mutta `renderDashboard` (rivit 505–924) ei lue sitä missään.
Kaikki `data-item-id`-kortit renderöityvät aina.
**Pienin korjaus:** Jokaisen korttidiv:n ympärille `_pref(card,'visible',true)`-ehto.
**Status:** Odottaa tuotantopäätöstä — mitkä kortit ovat piilotettavissa?
**Tarkistettu 15.7.2026 (HEAD `41ade7c`):** edelleen avoin. `visible`-pref löytyy nyt riveiltä 500 (kirjoitus) ja 570/572 (checkbox-UI), mutta sitä ei yhä lueta kortin renderöinnin gatettamiseksi missään.

### BUG-B: "Muutosprosentit" — no-op Kassa-kortissa ja muissa
**Tiedosto:** ui2-v2.js, funktio `toggleCardPct` rivi 381
**Juurisyy:** `showPct`-pref luetaan renderöinnissä vain inv-kortissa
(rivit 727–728). Cash-kortissa, netto-kortissa: pref kirjoitetaan mutta ei koskaan lueta.
`_cardHeader` laskee `var pct = _pref(cardKey,'showPct',true)` rivillä 493,
mutta muuttujaa `pct` ei käytetä missään funktion palautusarvossa.
**Status:** Odottaa tuotantopäätöstä — lisätäänkö prosentit Kassaan,
vai poistetaanko vaihtoehto Kassa-kortin valikosta?
**Tarkistettu 15.7.2026 (HEAD `41ade7c`):** edelleen avoin. `var pct = _pref(cardKey,'showPct',true)` on nyt rivillä 608 — muuttuja on yhä käyttämätön `_cardHeader`:n palautusarvossa.

### BUG-C: .sub-rows legacy-blokki Kassa-kortissa
**Tiedosto:** ui2-v2.js rivit 767–773
**Juurisyy:** Kassa-kortissa on edelleen vanha .sub-rows-blokki (Tulotili, S-Pankki,
Tavoitetili, Elatustili) joka on nyt redundantti html2-blokin rinnalla.
TODO-kommentti lisätty commitissa 2b98485.
**Status:** Siivottavissa omassa commitissaan, ei aktiivinen bugi.
**Tarkistettu 15.7.2026 (HEAD `41ade7c`):** edelleen läsnä, TODO-kommentti yhä paikallaan (nyt rivillä 902).

### BUG-D: pk-month / pk-week / pk-year — CSS puuttuu
**Tiedosto:** index.html
**Juurisyy:** `renderPaivakirja` generoi divit luokilla `pk-month`, `pk-week`, `pk-year`
(ui2-v2.js rivit 2633–2635), mutta näille luokille ei ole CSS-määrittelyjä index.html:ssä.
Kuukausi/viikko-otsikot näkyvät tyylittöminä tai eivät erotu riveistä.
**Pienin korjaus:** 3 CSS-sääntöä index.html:n `</style>`-tagin eteen.
**Status:** Hyväksytty konsepti (runtime-patch tehty sessiossa), ei vielä commitoitu.
**Tarkistettu 15.7.2026 (HEAD `41ade7c`):** edelleen avoin. Luokat generoidaan nyt riveillä 3059–3061 (`renderPaivakirja`), index.html:ssä ei yhä yhtään `pk-month`/`pk-week`/`pk-year`-CSS-sääntöä.

---

## Nykyinen päiväkirjafilosofia

Finance OS ei ole ensisijaisesti talousohjelma. Se on henkilökohtainen lokikirja,
jossa raha toimii pysyvänä signaalina elämästä ajan läpi.

**Tietohierarkia (päätetty):**

1. Kassa — käyttäjä operoi elämää käteisen kautta
2. Sijoitukset — kehitys näkyy sijoitusten kautta
3. Lainat — rajoitteet ymmärretään velan kautta
4. Netto — kontekstuaalinen tieto, ei päivittäinen ohjasmittari

**Päivä vastaa kolmeen kysymykseen:**
- Missä olin?
- Mitä muuttui?
- Miksi se muuttui?

**Päiväkirja on ensisijainen artefakti** (kehittyvä suunta, ei vielä täysin validoitu).
Dashboard on tiivistelmä. Snapshot on tallenne. Päiväkirja on muisti.

**Ei rikota:**
- Nettoa ei nosteta takaisin pääriville
- Päiväkirjaan ei lisätä modaaleja tai erillisiä näkymiä
- Inline-depth-rakenne (päivä → avautuu → sama päivä) säilyy
- pk-bar pysyy visuaalisena suhteena — ei muuteta numeroiksi

Katso: `docs/EMERGING_PHILOSOPHY.md` (commit `3e9c287`)

---

## Seuraavat 5 tärkeintä tehtävää

**Prioriteettijärjestys: Bug fixes → Mobile fixes → UI → New features**

### 1. BUG-D: pk-month / pk-week / pk-year CSS
**Tyyppi:** UI-bugi (puuttuva CSS)
**Tiedosto:** index.html, ennen `</style>` (rivi 815)
**Koko:** ~10 riviä. Yksi commit.
**Miksi nyt:** Päiväkirja on kehityksen pääsuunta. Kuukausi/viikko-otsikot
ovat navigaation kannalta oleellisia — ilman tyylejä ne ovat näkymättömiä.

### 2. BUG-A: "Näytä dashboardissa" — toteuta renderöintipuoli
**Tyyppi:** Toiminnallinen bugi
**Tiedosto:** ui2-v2.js, `renderDashboard` rivit 685, 757, 828 ympärillä
**Edellytys:** Päätös siitä, mitkä kortit ovat piilotettavissa (kaikki vai vain osa)
**Koko:** ~5–7 riviä. Yksi commit per kortti tai kaikki yhdessä.

### 3. BUG-B: "Muutosprosentit" — päätös Kassa-kortin osalta
**Tyyppi:** Toiminnallinen bugi tai feature removal
**Vaihtoehto A:** Poista Muutosprosentit-vaihtoehto Kassa-kortin valikosta
(`_cardHeader`-kutsu rivi 758 — poistetaan `showPct`-lisäys)
**Vaihtoehto B:** Lisää prosenttimuutos Käyttövaraan html2-blokkiin
**Koko:** 1–10 riviä riippuen valinnasta.

### 4. BUG-C: .sub-rows legacy-siivous Kassa-kortissa
**Tyyppi:** Tekninen velka
**Tiedosto:** ui2-v2.js rivit 767–773
**Koko:** -7 riviä (poisto). Yksi commit.
**Miksi:** Kaksi rinnakkaista esitystä samalle asialle aiheuttaa hämmennystä
jatkokehityksessä.

### 5. Päiväkirja: pk-month-otsikon sisältö ja muistiinpanon visuaalinen paino
**Tyyppi:** UI-kehitys (ei bugi)
**Nykytila:** `_note`-kenttä renderöidään pienenä emoji-merkittynä rivinä
pk-row:n alapuolella. Muistiinpano on visuaalisesti footnote.
**Tavoite:** Muistiinpano on vastaus kysymykseen "Miksi?". Sen pitäisi olla
näkyvämpi kuin se nyt on — ei dominoida, mutta ei hävitä numeroidenkaan alle.
**Koko:** CSS-muutos + mahdollinen HTML-rakenteen muutos. Suunnittelu ensin.

---

*Tiedosto päivitetään kehityssessioiden yhteydessä.*
*Viimeisin päivitys tehty kehityssessiossa 2026-07-20 (Kassa Info-modalin
sisällön viimeistely — commit `6a218a1` — ks. yllä). Samana päivänä
aiemmin: Info-painike ja modal (`927c5e9`), mobiili-UX-viimeistely
(`565e653`) ja RAHAVIRRAT-sprintti: listan yhdistäminen, Hero-synkronointi,
terminologia/värit, Kassajakson rajaamismallin poisto — commitit `f4a0bb9`,
`cfdaece`, `abb98df`, `a2f97c2` — ks. yllä.*
