# CURRENT_STATUS.md
# Finance OS — Current Status

**Päivitetty:** 2026-06-02
**Viimeisin commit:** `5067dcc`
**Branch:** main
**Tiedostot:** js/ui2-v2.js (4329 riv. — **15.7.2026: 5002 riv.**), index.html (1252 riv. — **15.7.2026: 1421 riv.**)

**Dokumentaatiosprintti 15.7.2026:** BUG-A…D tarkistettu koodista (HEAD `41ade7c`) — kaikki edelleen avoinna, ks. merkinnät alla.

---

## Viimeisimmät commitit

| Hash | Viesti | Päivä |
|------|--------|-------|
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
*Viimeisin päivitys tehty kehityssessiossa 2026-06-02.*
