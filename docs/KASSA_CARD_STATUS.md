# Kassa-kortin nykytila

> Päivitetty: 2026-07-30
> Viimeisin commit: `39aa655`
> Tiedosto: `js/ui2-v2.js`

Tämä dokumentti kuvaa Kassa-kortin **nykyisen, hyväksytyn** tilan — ei kehityshistoriaa.
Historia löytyy `git log`:sta ja `docs/CURRENT_STATUS.md`:stä.

---

## Mikä toimii

- Kassa-kortti näyttää käyttötilit (Tulotili, S-Pankki, Tavoitetili, Elatustili) ja
  OP Gold -luottokortin.
- "SEURAAVA RAHATILANNE" -osio (`renderKassaSeuraavaRahatilanne`, `js/ui2-v2.js:2067`):
  Hero → TULEVAT ERÄT → ehdollinen "Jäljellä tulevien erien jälkeen" → SÄÄNNÖLLISET ERÄT
  → Lopputilanne.
- Yksi "+ Lisää rahavirta" -editori kaikelle rahavirran syötölle: uuden rahavirran
  lisäys ja legacy-rivien (puuttuva päivä/kuukausi) täydennys kulkevat saman
  lomakkeen ja saman tallennusfunktion (`rahavirtaEditorSave`) kautta.
- Legacy-rahavirroista (rivit joilta puuttuu kelvollinen päivä/kuukausi) ilmoitetaan
  erikseen, eivätkä ne osallistu kassalaskentaan ennen täydennystä.

---

## Mitä Hero näyttää

Kassa-kortin yläosassa (`card-left`, `js/ui2-v2.js:1465-1480`) näytetään **kaksi
erillistä arvoa** rinnakkain, kumpikin omalla `card-value`-elementillään:

| Nimike | Rivi | Arvo |
|---|---|---|
| "ODOTE" | `js/ui2-v2.js:1472-1473` | `kassaValisumma(latest)` = `heroSum(buildKassajakso(latest))` |
| "NYKYINEN" | `js/ui2-v2.js:1476-1477` | `lahtokassaOf(latest)` |

Kortin alaosassa toistuvat samat kaksi arvoa vielä kerran:

| Nimike | Rivi | Arvo |
|---|---|---|
| "YHT." | `js/ui2-v2.js:1516-1517` | sama kuin "NYKYINEN" (`lahtokassaOf(latest)`) |
| "Lopputilanne" | `js/ui2-v2.js:3082-3085` (`renderKassaSeuraavaRahatilanne`) | sama kuin "ODOTE" (`heroSum(buildKassajakso(latest))`) |

"ODOTE" ja "Lopputilanne" näyttävät siis aina saman luvun keskenään, ja "NYKYINEN"
ja "YHT." näyttävät aina saman luvun keskenään — mutta nämä kaksi paria ovat
toisistaan eriäviä arvoja.

**Legacy-fallback:** jos snapshotilla ei ole `op_gold`-kenttää lainkaan, Hero näyttää
poikkeuksellisesti pelkän `cash`-summan (vanha data ennen OP Gold -ominaisuutta). Tätä
haaraa ei ole muutettu.

---

## Nykyinen laskentalogiikka

Kolmikerroksinen arkkitehtuuri, jossa jokainen kerros tuntee vain sen mitä edellinen
kerros sille luovuttaa (ks. myös `docs/FINANCE_OS_ARCHITECTURE.md`):

1. **Rahavirta** — yksittäinen kirjattu tulo/meno. Kootaan kolmesta listasta
   (`collectRahavirrat`, `js/ui2-v2.js:2656`) yhtenäiseen muotoon
   `{ref, source, date, isIncome, amount}`.
2. **Kassajakso** — rajaa rahavirtajoukon viimeisimmästä snapshotista
   päättymispisteeseen (`periodEnd`) asti. `buildKassajakso`
   (`js/ui2-v2.js:2854`) palauttaa `{lahtokassa, items, excludedItems,
   periodEnd, snapshotDate, opGoldExtended}`.
   - `periodEnd` ratkaistaan oletuksena seuraavana tunnettuna tulona
     (`resolveBaseKassajaksoPeriodEnd`, `js/ui2-v2.js:2809`), ellei
     käyttäjä ole tallentanut omaa sääntöjoukkoa (`finos_kassajakso_rules`,
     localStorage) — tällöin `periodEnd` ratkaistaan joko `itemRef`-,
     `fixedDate`- tai `monthEnd`-ehdoista (`resolveKassajaksoRules`,
     `js/ui2-v2.js:2790`), tai jää avoimeksi (`strategy: 'open'`).
   - Ratkaistuun `periodEnd`:iin voidaan lisäksi soveltaa valinnainen OP
     Gold -laajennus (`applyOpGoldExtension`, `js/ui2-v2.js:2826`, ks.
     "Miten OP Gold huomioidaan" alla).
   - `items` sisältää kaikki rahavirrat joiden päivämäärä on ≤ `periodEnd`;
     loput palautuvat `excludedItems`-kentässä.
   - **RAHAVIRRAT-lista on poikkeus:** `renderTulossaList()` näyttää aina
     `collectRahavirrat(...)`:n koko, rajaamattoman joukon — se ei käytä
     `buildKassajakso(...).items`-rajausta.
3. **Hero-taso**:
   - `heroSum(kassajakso)` (`js/ui2-v2.js:2930`) → puhdas laskentakomponentti:
     nykyinen kassa + koko Kassajakson joukko (tulevat + säännölliset tulot −
     säännölliset menot).
   - `kassaValisumma(latest)` (`js/ui2-v2.js:2937`) → rakentaa Kassajakson ja
     delegoi `heroSum`:lle.
   - Kassa-kortin Hero-näytön tarkka rakenne (mitä lukuja näytetään ja missä)
     kuvataan "Mitä Hero näyttää" -osiossa yllä.

Päivämääräfunktiot `nextRecurringDayDate` (`js/ui2-v2.js:2614`, säännöllisille
kuukauden päivä -erille) ja `nextMonthOnlyDate` (`js/ui2-v2.js:2636`, kertaluonteisille
kuukausi-erille) eivät ole muuttuneet.

---

## Miten OP Gold huomioidaan

Nykyinen kassa lasketaan `lahtokassaOf(snap)`-funktiolla (`js/ui2-v2.js:2607`, funktion
nimeä ei muutettu — ks. terminologiapäätös #10):

```
lahtokassa = tulotili − |op_gold|
```

**Saldon syöttö:** `op_gold`-kenttää voi muokata suoraan Kassa-kortilla
(`kassaInlineEdit('op_gold', ...)`, `saveOpGoldValue`, `js/ui2-v2.js:2487`) —
arvo tallennetaan aina negatiivisena.

**Maksun kirjaus:** "Maksoin OP Gold -laskun" -painike
(`renderOpGoldPaymentSection`, `js/ui2-v2.js:2507`) siirtää käyttäjän
syöttämän summan yhdellä snapshot-kirjoituksella Tulotililtä OP Goldin
kuittaukseksi (`opGoldPaymentSave`, `js/ui2-v2.js:2542`): tulotili −= summa,
op_gold += summa. Ylisuoritus (summa > nykyinen OP Gold -velka) estetään.
Tämä on snapshotin päivitysapuri, ei rahavirta.

**Kassajakson pidennys:** valinnainen `finos_kassajakso_rules.opGoldNextMonth1to5`
-asetus (`applyOpGoldExtension`, `js/ui2-v2.js:2826`) siirtää `periodEnd`:in
ehdoitta seuraavan kuukauden 5. päivään, jos ratkaistu `periodEnd` muuten
olisi sitä aiemmin — ks. "Kassajakso" yllä.

Luottorajan käsittelyä (esim. luottorajan syöttö tai sen ylityksen esto) ei
ole koodissa.

---

## Miten rahavirrat toimivat

Yksi lomake (`renderRahavirtaEditor` → `renderRahavirtaFields`,
`js/ui2-v2.js:5512`/`5576`) kattaa kaikki rahavirrat: **Nimi, Summa, Tyyppi
((+) Tulo / (−) Meno), Päivämäärä, Säännöllinen ✓**.

- Käyttäjä ei valitse etukäteen tyyppiä (Tulossa / Säännöllinen tulo / Säännöllinen
  meno) — sama lomake toimii kaikille.
- **Säännöllinen on pelkkää metadataa.** Se ratkaisee ainoastaan, mihin kolmesta
  listasta rivi tallennetaan — se ei muuta Hero-, Kassajakso- tai
  Kassa-kortin laskentaa.
- **Yksi `<input type="date">`-kenttä** palvelee sekä kertaluonteista että
  säännöllistä rahavirtaa; lomakkeen rakenne ei koskaan muutu Säännöllinen-rastin
  mukaan. Tallennuksessa (`rahavirtaEditorSave`, `js/ui2-v2.js:5744`) samasta
  arvosta poimitaan joko kuukausi (`tulevat_items`) tai kuukauden päivä
  (`tulot_items`/`rytmi_items`).
- Legacy-täydennystilassa Nimi, Summa, Tyyppi ja Säännöllinen lukitaan rivin
  alkuperäisen listan mukaan — käyttäjä täyttää vain puuttuvan päivämäärän.

---

## Mitä tietomallia käytetään

Ei uutta tietomallia — sama kolme listaa kuin ennen tätä sprinttiä:

| Lista | Rivin muoto | Merkki |
|---|---|---|
| `tulevat_items` | `{id, month (1–12), day (1–31), label, amount}` | `amount` voi olla + tai − |
| `tulot_items` | `{id, label, amt_kk, paiva (1–31), repeat_every_months}` | aina positiivinen |
| `rytmi_items` | `{id, label, amt_kk, paiva (1–31), repeat_every_months}` | aina positiivinen (tulkitaan menoksi) |

`repeat_every_months` tallennetaan jokaiselle uudelle/muokatulle riville
(`rahavirtaEditorSave`, `js/ui2-v2.js:5811`), mutta ei vielä vaikuta
päivämäärälaskentaan (`collectRahavirrat`/`nextRecurringDayDate` tuottavat
aina vain seuraavan yksittäisen esiintymän).

---

## Hyväksytyt sprintit

| Commit | Kuvaus |
|---|---|
| `948b625` | fix: Hero näyttää lähtökassan + tulevat erät, ei pelkkää lähtökassaa |
| `0523f06` | feat: yhtenäistä rahavirtaeditorin yhdeksi lomakkeeksi (yksi Päivämäärä-kenttä) |
| `679faf1` | fix: legacy-rahavirtojen täydennys-UX Kassa-korttiin |
| `1b4b285` | fix: vaadi päivä/kuukausi rahavirtaEditorSave-lomakkeessa |
| `034eae9` | fix: korjaa Hero/Kassajakso-logiikka Seuraava rahatilanne -korttiin (Hero-tuotemäärittely v1.0) |
| `ecb41ee` | feat: uusi "Seuraava rahatilanne" -kortti Kassa-korttiin |
| `fc57184` | feat: yhtenäistä Kassa-kortin rahavirtojen lisäys yhteen editoriin (aiempi versio) |

---

# Lukitut tuotepäätökset

Voimassa olevat, hyväksytyt päätökset (ei muutettavissa ilman erillistä
suunnittelupäätöstä):

1. **Hero-tuotemäärittely v1.0** (`034eae9`) — `heroSum()` on puhdas
   laskentakomponentti: summaa vain sille annetun rahavirtajoukon. Ei tee
   ennusteita, ei päättele kassajaksoa.
2. **Aikareferenssi** — käyttäjän viimeisin snapshot, ei laitteen kellonaika.
3. **Kassajakson rajaamiskriteeri (oletus)** — viimeisin snapshot → seuraava
   tunnettu tulo, ellei käyttäjä ole määrittänyt omaa sääntöjoukkoa (ks.
   kohta 12).
4. **Tunnetun tulon määritelmä** — kirjattu rahavirta jolla on määritelty,
   snapshotin jälkeinen ajallinen sijainti; kertaluonteinen ja säännöllinen
   kelpaavat yhtäläisesti.
5. **Nykyisen kassan lähde** — `tulotili − |op_gold|`, ei erikseen syötetty eikä
   Heron itse johtama.
6. **Kassavaikutteisen rahavirran määritelmä** — muuttaa nykyiseen kassaan kuuluvien
   tilien yhteissummaa.
7. **Rahavirran syöttö on yksi yhtenäinen lomake** (`0523f06`) — ei
   ennakkovalintaa tyypistä. Säännöllinen on metadataa, ei laskentaa muuttava tieto.
8. **Yksi Päivämäärä-kenttä** (`0523f06`) palvelee sekä kertaluonteista että
   säännöllistä rahavirtaa; rakenne ei muutu Säännöllinen-rastin mukaan.
9. **Hero näyttää Kassajakson lopputilanteen** — Hero huomioi kaikki
   `buildKassajakso(...).items`-joukon rahavirrat (kertaluonteiset ja
   säännölliset), samalla logiikalla kuin `heroSum()`. Korvaa aiemman
   päätöksen "Hero = lähtökassa + tulevat erät" (`948b625`).
10. **Käyttöliittymän termi "NYKYINEN"** — korvaa aiemman UI-tekstin
    "LÄHTÖKASSA", koska arvo kuvaa käyttäjän tämänhetkistä nettokassaa
    (tilit − luottokortit) eikä Kassajakson alkua. Näkyy Kassa-kortissa
    kahdesti: nimikkeellä "NYKYINEN" (`js/ui2-v2.js:1476-1477`) ja
    nimikkeellä "YHT." (`js/ui2-v2.js:1516-1517`) — molemmat sama arvo.
    Vain käyttöliittymän teksti muuttui — `lahtokassaOf()`-funktio, sisäinen
    `lahtokassa`-muuttuja ja itse laskenta pysyivät ennallaan.
11. **Rahavirtojen värikoodaus** — tulot vihreällä (`var(--green)`), menot
    hillityllä, tummalla koralli-/roosasävyllä (`var(--expense)`, `#a8654f`),
    ei kirkkaalla punaisella. Koskee sekä kertaluonteisia että säännöllisiä
    rahavirtarivejä RAHAVIRRAT-listassa. Tarkoitus on auttaa hahmottamaan
    rahavirran suunta yhdellä vilkaisulla, ei varoittaa käyttäjää.
12. **Kassajakso rajaa rahavirtajoukon** viimeisimmästä snapshotista
    päättymispisteeseen (`periodEnd`) asti (ks. "Kassajakso"-kohta yllä ja
    `buildKassajakso`, `js/ui2-v2.js:2854`).
    - **Oletuspäättymispiste** on seuraava tunnettu tulo (kertaluonteinen tai
      säännöllinen, molemmat kelpaavat yhtäläisesti).
    - **Käyttäjä voi korvata oletuksen** omalla sääntöjoukolla
      (`finos_kassajakso_rules`) — `itemRef`/`fixedDate`/`monthEnd`-ehdoista
      ratkaistu myöhäisin päivämäärä, tai `strategy: 'open'` jolloin jakso ei
      pääty lainkaan.
    - **Valinnainen OP Gold -laajennus** voi siirtää päättymispisteen
      seuraavan kuukauden 5. päivään (ks. "Miten OP Gold huomioidaan").
    - **Hero ja Lopputilanne** käyttävät rajattua joukkoa
      (`buildKassajakso(...).items`). **Rahavirrat-lista** näyttää aina
      `collectRahavirrat(...)`:n koko, rajaamattoman joukon — se ei rajaudu
      `periodEnd`:iin.
    - **Perustelu**: Finance OS ei yritä ennustaa kuukausia eteenpäin, vaan
      näyttää nykyisen kassan ja kaikki rahavirrat seuraavaan tunnettuun
      tuloon asti — sillä juuri se tulo (esim. seuraava palkka) on se hetki,
      jolloin kuluva jakso päättyy ja seuraava alkaa.

---

# buildKassajakso — nykyinen toteutus

```js
function buildKassajakso(latest) {
  var snapshotDate = new Date(latest.date + 'T00:00:00');
  var allItems = collectRahavirrat(latest, snapshotDate);
  var basePeriodEnd = resolveBaseKassajaksoPeriodEnd(latest, snapshotDate, allItems);
  var rules = loadKassajaksoRules();
  var opGoldResult = applyOpGoldExtension(rules, allItems, snapshotDate, basePeriodEnd);
  var periodEnd = opGoldResult.periodEnd;
  var items = periodEnd ? allItems.filter(function(x) { return x.date <= periodEnd; }) : allItems;
  var excludedItems = periodEnd ? allItems.filter(function(x) { return x.date > periodEnd; }) : [];
  return { lahtokassa: lahtokassaOf(latest), items: items, excludedItems: excludedItems, periodEnd: periodEnd, snapshotDate: snapshotDate, opGoldExtended: opGoldResult.extended };
}
```

(`js/ui2-v2.js:2854`.) `heroSum`, `kassaValisumma` kuluttavat `items`:n
sellaisenaan. `renderTulossaList()` (RAHAVIRRAT-lista) käyttää sen sijaan
suoraan `collectRahavirrat(...)`:n koko, rajaamatonta tulosta — ei
`buildKassajakso(...).items`:ä.

---

# Avoimet päätökset

Asiat, joista ei ole vielä tehty lopullista päätöstä:

- **OP Gold -luottorajan käsittely** — luottorajan syöttöä tai sen ylityksen
  estoa ei ole koodissa. Saldon syöttö ja maksun kirjaus ovat toteutettuja
  (ks. "Miten OP Gold huomioidaan").
- **`tulevat_items`:llä ei ole vuotta** — erällä on valinnainen `day`-kenttä,
  mutta ei vuotta. Legacy-riveiltä `day` voi puuttua kokonaan (käsitellään
  `undefined`:na, lajitellaan listan loppuun). Tunnettu, ei korjattu.
- **BUG-B** (Muutosprosentit-asetus ei vaikuta mihinkään Kassa-kortissa,
  `_cardHeader`, `js/ui2-v2.js:608`) ja **BUG-C** (`.sub-rows`-legacy-lohko
  Kassa-kortissa, `js/ui2-v2.js:902–908`, redundantti html2-blokin rinnalla) —
  molemmat yhä avoinna, ei käsitelty tässä sessiossa.

---

# Avoin: OP Gold -luottorajan käsittely

Luottorajan syöttö ja sen ylityksen esto eivät ole koodissa. Saldon syöttö,
maksun kirjaus ja kassajakson OP Gold -laajennus ovat toteutettuja (ks.
"Miten OP Gold huomioidaan" yllä).

Tarkempi rajaus ja toteutustapa odottavat suunnittelijan (ChatGPT/käyttäjä)
päätöstä ennen toteutusta, CLAUDE.md:n vastuunjaon mukaisesti.
