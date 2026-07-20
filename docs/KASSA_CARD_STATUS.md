# Kassa-kortin nykytila

> Päivitetty: 2026-07-20
> Viimeisin commit: `948b625`
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

Kassa-kortin yläosan iso lukuarvo (`card-value`, `js/ui2-v2.js:900`) näyttää:

**Kassajakson lopputilanteen** — lähtökassa + kaikki `buildKassajakso(...).items`-joukon
rahavirrat, kertaluonteiset ja säännölliset yhtäläisesti.

`kassaValisumma(latest)` (`js/ui2-v2.js:2054`) delegoi suoraan `heroSum(buildKassajakso(latest))`
-funktiolle (`js/ui2-v2.js:2047`), joten näkyvä Hero ja kortin oma "Lopputilanne"-rivi
näyttävät aina saman luvun. "Hero" viittaa nyt yksiselitteisesti yhteen lukuun, joka
näytetään kahdessa paikassa.

**Legacy-fallback:** jos snapshotilla ei ole `op_gold`-kenttää lainkaan, Hero näyttää
poikkeuksellisesti pelkän `cash`-summan (vanha data ennen OP Gold -ominaisuutta). Tätä
haaraa ei ole muutettu.

---

## Nykyinen laskentalogiikka

Kolmikerroksinen arkkitehtuuri, jossa jokainen kerros tuntee vain sen mitä edellinen
kerros sille luovuttaa (ks. myös `docs/FINANCE_OS_ARCHITECTURE.md`):

1. **Rahavirta** — yksittäinen kirjattu tulo/meno. Kootaan kolmesta listasta
   (`collectRahavirrat`, `js/ui2-v2.js:1988`) yhtenäiseen muotoon
   `{ref, source, date, isIncome, amount}`.
2. **Kassajakso** — rajaa rahavirtajoukon viimeisimmästä snapshotista seuraavaan
   tunnettuun tuloon (`buildKassajakso`, `js/ui2-v2.js:2034`). Palauttaa
   `{lahtokassa, items, boundary}`.
3. **Hero-taso** — yksi laskenta, kaksi näyttöpaikkaa:
   - `heroSum(kassajakso)` (`js/ui2-v2.js:2047`) → puhdas laskentakomponentti:
     lähtökassa + koko Kassajakson joukko (tulevat + säännölliset tulot −
     säännölliset menot).
   - `kassaValisumma(latest)` (`js/ui2-v2.js:2054`) → rakentaa Kassajakson ja
     delegoi `heroSum`:lle. Näkyvä Hero (`card-value`) ja kortin "Lopputilanne"
     näyttävät siis aina saman luvun.

Päivämääräfunktiot `nextRecurringDayDate` (`js/ui2-v2.js:1953`, säännöllisille
kuukauden päivä -erille) ja `nextMonthOnlyDate` (`js/ui2-v2.js:1968`, kertaluonteisille
kuukausi-erille) eivät ole muuttuneet.

---

## Miten OP Gold huomioidaan

Lähtökassa lasketaan `lahtokassaOf(snap)`-funktiolla (`js/ui2-v2.js:1946`):

```
lahtokassa = tulotili − |op_gold|
```

OP Goldin sisäistä logiikkaa (esim. saldon syöttö, luottorajan käsittely) ei ole
käsitelty tässä eikä edellisessä sprintissä — se on tietoisesti rajattu ulos.

---

## Miten rahavirrat toimivat

Yksi lomake (`renderRahavirtaEditor` → `renderRahavirtaFields`,
`js/ui2-v2.js:4380`/`4411`) kattaa kaikki rahavirrat: **Nimi, Summa, Tyyppi
((+) Tulo / (−) Meno), Päivämäärä, Säännöllinen ✓**.

- Käyttäjä ei valitse etukäteen tyyppiä (Tulossa / Säännöllinen tulo / Säännöllinen
  meno) — sama lomake toimii kaikille.
- **Säännöllinen on pelkkää metadataa.** Se ratkaisee ainoastaan, mihin kolmesta
  listasta rivi tallennetaan — se ei muuta Hero-, Kassajakso- tai
  Kassa-kortin laskentaa.
- **Yksi `<input type="date">`-kenttä** palvelee sekä kertaluonteista että
  säännöllistä rahavirtaa; lomakkeen rakenne ei koskaan muutu Säännöllinen-rastin
  mukaan. Tallennuksessa (`rahavirtaEditorSave`, `js/ui2-v2.js:4509`) samasta
  arvosta poimitaan joko kuukausi (`tulevat_items`) tai kuukauden päivä
  (`tulot_items`/`rytmi_items`).
- Legacy-täydennystilassa Nimi, Summa, Tyyppi ja Säännöllinen lukitaan rivin
  alkuperäisen listan mukaan — käyttäjä täyttää vain puuttuvan päivämäärän.

---

## Mitä tietomallia käytetään

Ei uutta tietomallia — sama kolme listaa kuin ennen tätä sprinttiä:

| Lista | Rivin muoto | Merkki |
|---|---|---|
| `tulevat_items` | `{id, month (1–12), label, amount}` | `amount` voi olla + tai − |
| `tulot_items` | `{id, label, amt_kk, paiva (1–31)}` | aina positiivinen |
| `rytmi_items` | `{id, label, amt_kk, paiva (1–31)}` | aina positiivinen (tulkitaan menoksi) |

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
3. **Kassajakson rajaamiskriteeri** — viimeisin snapshot → seuraava tunnettu tulo.
4. **Tunnetun tulon määritelmä** — kirjattu rahavirta jolla on määritelty,
   snapshotin jälkeinen ajallinen sijainti; kertaluonteinen ja säännöllinen
   kelpaavat yhtäläisesti.
5. **Lähtökassan lähde** — `tulotili − |op_gold|`, ei erikseen syötetty eikä
   Heron itse johtama.
6. **Kassavaikutteisen rahavirran määritelmä** — muuttaa lähtökassaan kuuluvien
   tilien yhteissummaa.
7. **Rahavirran syöttö on yksi yhtenäinen lomake** (`0523f06`) — ei
   ennakkovalintaa tyypistä. Säännöllinen on metadataa, ei laskentaa muuttava tieto.
8. **Yksi Päivämäärä-kenttä** (`0523f06`) palvelee sekä kertaluonteista että
   säännöllistä rahavirtaa; rakenne ei muutu Säännöllinen-rastin mukaan.
9. **Hero näyttää Kassajakson lopputilanteen** — Hero huomioi kaikki
   `buildKassajakso(...).items`-joukon rahavirrat (kertaluonteiset ja
   säännölliset), samalla logiikalla kuin `heroSum()`. Korvaa aiemman
   päätöksen "Hero = lähtökassa + tulevat erät" (`948b625`).

---

# Avoimet päätökset

Asiat, joista ei ole vielä tehty lopullista päätöstä:

- **OP Gold -logiikka** — saldon syöttö, luottorajan käsittely, mahdolliset
  puutteet — ei käsitelty, tietoisesti rajattu ulos tästä sprintistä.
- **`tulevat_items`:n kuukausi-vain-tarkkuus** — erällä ei ole vuotta eikä
  päivää, joten kuluvan/lähikuukauden erä voi näyttäytyä kassajakson rajana
  hyvin varhain. Tunnettu, ei korjattu.
- **BUG-B** (Muutosprosentit-asetus ei vaikuta mihinkään Kassa-kortissa,
  `_cardHeader`, `js/ui2-v2.js:608`) ja **BUG-C** (`.sub-rows`-legacy-lohko
  Kassa-kortissa, `js/ui2-v2.js:902–908`, redundantti html2-blokin rinnalla) —
  molemmat yhä avoinna, ei käsitelty tässä sessiossa.

---

# Seuraava sprintti

**Tavoite:** selvittää ja päättää, miten OP Gold -logiikka (saldon syöttö,
luottorajan käsittely, mahdollinen vaikutus Hero-laskentaan) tulisi käsitellä
Kassa-kortissa — tämä sprintti rajasi OP Goldin tietoisesti ulkopuolelle.

Tavoitteen tarkempi rajaus ja toteutustapa odottavat suunnittelijan
(ChatGPT/käyttäjä) päätöstä ennen toteutusta, CLAUDE.md:n vastuunjaon
mukaisesti.
