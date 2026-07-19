# CURRENT_STATUS.md
# Finance OS — Current Status

**Päivitetty:** 2026-07-19
**Viimeisin commit:** `6489000`
**Branch:** main
**Tiedostot:** js/ui2-v2.js (4329 riv. — **15.7.2026: 5002 riv.**), index.html (1252 riv. — **15.7.2026: 1421 riv.**)

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
*Viimeisin päivitys tehty kehityssessiossa 2026-07-19 (Kassa syöttö UX 2.0: kolmen erillisen lomakkeen yhtenäistäminen, iOS Safari focus-scroll ja mobiilikontrasti — ks. yllä).*
