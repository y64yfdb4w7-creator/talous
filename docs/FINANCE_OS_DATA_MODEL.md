# Finance OS — Datamalli

> Versio: 2026-06-09  
> Tarkoitus: Kaikki snapshot-kentät dokumentoituna turvallisten muutosten mahdollistamiseksi

---

## Snapshot-objekti

Snapshot on yksittäinen päivän taloudellinen tilanne. Se tallennetaan IndexedDB:n `snapshots`-storeen ja Supabaseen.

**Primääriavain:** `date` (ISO 8601, esim. `"2026-06-09"`)

Sama päivämäärä ylikirjoitetaan aina (`bulkPutSnapshots` = upsert).

---

## Kentät kategorioittain

### META-kentät

| Kenttä | Tyyppi | Esimerkki | Kuvaus |
|---|---|---|---|
| `date` | string | `"2026-06-09"` | ISO-päivämäärä, primääriavain |
| `_source` | string? | `"supabase_import"` | Mistä data tuli (import-tapauksessa) |
| `_note` | string? | `"Palkkapäivä"` | Vapaa huomio |
| `_mergedFromRemote` | bool? | `true` | Merkitty jos Supabase-merge tehty |

---

### PANKKITILIT (käyttäjä syöttää)

Kaikki arvot euroina. Positiivinen = saldo. Negatiivinen = velka.

| Kenttä | Tyyppi | Esimerkki | Syöttö | Näytetään | Säilyvyys |
|---|---|---|---|---|---|
| `tulotili` | number | `1633` | Syötä-sivu | Kassa-kortti, Päiväkirja | saveEntrySnapshot, refreshAndFreeze (carry-forward) |
| `elatustili` | number | `0` | Syötä-sivu | Kassa-kortti | saveEntrySnapshot, refreshAndFreeze |
| `tavoitetili` | number | `0` | Syötä-sivu | Kassa-kortti | saveEntrySnapshot, refreshAndFreeze |
| `s_pankki` | number | `10` | Syötä-sivu | Kassa-kortti | saveEntrySnapshot, refreshAndFreeze |
| `op_gold` | number | `-582` | Syötä-sivu | Kassa-kortti (luotto) | saveEntrySnapshot, refreshAndFreeze |
| `visa` | number | `0` | Syötä-sivu | Kassa-kortti (luotto) | saveEntrySnapshot, refreshAndFreeze |
| `luottotili` | number | `0` | Syötä-sivu | Kassa-kortti (luotto) | saveEntrySnapshot, refreshAndFreeze |

**Huomio op_gold:** Arvo on AINA negatiivinen tai nolla (luottokortin saldo = velka).
`op_gold = -(Math.abs(arvo))` tallennettaessa.

---

### SIJOITUKSET (lasketaan holdings-summasta)

Nämä kentät muodostuvat automaattisesti `refreshAndFreeze()`-funktiossa holdingien kpl × hinta -laskennasta.

| Kenttä | Tyyppi | Esimerkki | Tili/kategoria | Lasketaan |
|---|---|---|---|---|
| `nordnet` | number | `18097` | Nordnet-salkku (sijoitukset) | holdings joiden account = 'nordnet', sum(kpl × hinta) |
| `op_osakkeet` | number | `7371` | OP-salkku | holdings joiden account = 'op_osakkeet', sum(kpl × hinta) |
| `s_sijoitus` | number | `0` | S-Pankki sijoitukset | holdings joiden account = 's_sijoitus', sum(kpl × hinta) |
| `tapiola` | number | `0` | Tapiola/vakuutussäästö | holdings joiden account = 'tapiola' |
| `rahastot` | number | `0` | Muut rahastot | holdings joiden account = 'rahastot' |
| `lasten_sijoitus` | number | `0` | Lasten sijoitukset | holdings joiden account = 'lasten_sijoitus' |

**Kriittinen:** Nämä YLIKIRJOITTUVAT joka kerta kun `refreshAndFreeze()` ajetaan.
Jos käyttäjä ei aja Päivitä-nappia, arvo pysyy viimeisimmässä snapshotissa (carry-forward).

---

### NORDNET KÄTEINEN (käyttäjä syöttää erikseen)

| Kenttä | Tyyppi | Esimerkki | Syöttö | Kuvaus |
|---|---|---|---|---|
| `nordnet_cash` | number | `955` | Salkku-sivu / Syötä-sivu | Nordnetin käteistili — EI sama kuin snap.nordnet |

**Kriittinen erottelu:**
- `snap.nordnet` = sijoitusten markkina-arvo (kpl × kurssi)
- `snap.nordnet_cash` = Nordnetin käteistili (erillinen syöttö)
- `calculateNetWorth()`: `nordnetTotal = snap.nordnet + snap.nordnet_cash`
- ÄLÄ sekoita näitä — nordnet_cash häviää jos se lasketaan mukaan nordnet-summaan

---

### LAINAT (käyttäjä syöttää)

Kaikki arvot NEGATIIVISIA (velka).

| Kenttä | Tyyppi | Esimerkki | Syöttö | Näytetään | Säilyvyys |
|---|---|---|---|---|---|
| `asuntolaina` | number | `-8176` | Syötä-sivu (Lainat) | Velat-kortti | saveEntrySnapshot, refreshAndFreeze (carry-forward) |
| `asuntolaina_remontti` | number | `-3065` | Syötä-sivu (Lainat) | Velat-kortti | saveEntrySnapshot, refreshAndFreeze |
| `autolaina` | number | `-4599` | Syötä-sivu (Lainat) | Velat-kortti | saveEntrySnapshot, refreshAndFreeze |

**Vaihtoehtoinen laskentapolku:**
`calculateNetWorth()` tarkistaa järjestyksessä:
1. `snap.kaikki_lainat` (jos olemassa)
2. `snap.asuntolaina_yht` (jos olemassa)
3. `snap.asuntolaina + snap.asuntolaina_remontti + snap.autolaina` (normaali polku)

---

### KASSAVIRTA — TOISTUVAT TULOT

| Kenttä | Tyyppi | Esimerkki | Kuvaus |
|---|---|---|---|
| `tulot_kk` | number | `3200` | Kuukausitulot yhteensä (legacy — korvattu tulot_items:llä) |
| `tulot_items` | array | `[{type:'palkka',amount:3200,label:'Palkka'}]` | Tuloeräluettelo (uusi muoto) |
| `tulot_pvm` | string? | `"2026-06-05"` | Milloin tulot saatu |

**tulot_items rakenne (yksittäinen erä):**
```json
{
  "type": "palkka",
    "amount": 3200,
      "label": "Palkka"
      }
      ```
      Tyyppit: `palkka`, `vuokra`, `osinko`, `muu`

      **Huomio:** Vanhoissa snapshoissa voi olla vain `tulot_kk` ilman `tulot_items`. Molempia pitää tukea.

      ---

      ### KASSAVIRTA — TOISTUVAT MENOT

      | Kenttä | Tyyppi | Esimerkki | Kuvaus |
      |---|---|---|---|
      | `menot_kk` | number | `1200` | Kuukausittaiset toistuvat menot yhteensä |
      | `rytmi_items` | array | `[{label:'Puhelin',amount:25}]` | Toistuvien menojen luettelo |

      **rytmi_items rakenne (yksittäinen erä):**
      ```json
      {
        "label": "Pankkimaksut",
          "amount": 120
          }
          ```

          **Huomio:** `rytmi_items` korvaa `menot_kk`:n lasketun arvon. Jos `rytmi_items` on olemassa, `menot_kk` lasketaan siitä summaamalla.

          ---

          ### TAPAHTUMAT JA MUISTIINPANOT

          Nämä tallennetaan erilliseen `events`-storeen, EI snapshot-objektiin.

          | Store | Kenttä | Tyyppi | Kuvaus |
          |---|---|---|---|
          | events | `date` | string | ISO-päivämäärä |
          | events | `type` | string | `dividend`, `purchase`, `sale`, `transfer`, `note` |
          | events | `amount` | number? | Euromäärä |
          | events | `note` | string? | Vapaa teksti |
          | events | `ticker` | string? | Arvopaperi (jos relevantti) |

          ---

          ## Holdings-objekti (erillinen store)

          Ei snapshotissa. Tallennetaan `holdings`-storeen.

          | Kenttä | Tyyppi | Esimerkki | Kuvaus |
          |---|---|---|---|
          | `id` | string | `"amzn-nordnet"` | Yksilöllinen tunniste |
          | `ticker` | string | `"AMZN"` | Pörssitunniste |
          | `display_name` | string | `"Amazon"` | Näyttönimi |
          | `quantity` | number | `15` | Kappalemäärä |
          | `purchase_price` | number? | `142.50` | Hankintahinta (euroina/kpl) |
          | `last_price` | number? | `189.20` | Viimeisin kurssi (euroina) |
          | `last_price_date` | string? | `"2026-06-09"` | Milloin kurssi haettu |
          | `last_price_time` | string? | `"14:35"` | Mihin aikaan |
          | `last_price_src` | string? | `"Supabase"` | Lähde: Supabase / Finnhub / Fallback |
          | `account` | string | `"nordnet"` | Tili: nordnet, op_osakkeet, s_sijoitus... |
          | `active` | bool | `true` | Jos false, ohitetaan laskennassa |

          ---

          ## calculateNetWorth(snap) — käytetyt kentät

          ```
          investments:
            snap.nordnet          (holdings: account='nordnet', sum)
              snap.nordnet_cash     (käyttäjän syöttö)
                snap.op_osakkeet      (holdings: account='op_osakkeet', sum)
                  snap.tapiola          (holdings tai 0)
                    snap.s_sijoitus       (holdings: account='s_sijoitus', sum)
                      snap.rahastot         (holdings tai 0)

                      cash:
                        snap.tulotili
                          snap.s_pankki
                            snap.tavoitetili
                              snap.elatustili

                              shortTermDebt (positiivinen luku):
                                |snap.op_gold|
                                  |snap.visa|
                                    |snap.luottotili|

                                    longTermDebt (positiivinen luku):
                                      |snap.kaikki_lainat|              (ensisijainen jos olemassa)
                                        tai |snap.asuntolaina_yht|        (toissijainen)
                                          tai |snap.asuntolaina
                                                 + snap.asuntolaina_remontti
                                                        + snap.autolaina|            (normaali polku)
                                                        ```

                                                        ---

                                                        ## Supabase-formaatin muunnos

                                                        Finance OS käyttää omaa kenttärakennettaan. Supabasessa data on VANHASSA formaatissa yhteensopivuuden vuoksi.

                                                        ### Finance OS → Supabase (`syncToSupabase` / `convertToOldFormat`):
                                                        ```
                                                        snap.nordnet        → totals.nordnet
                                                        snap.op_osakkeet    → totals.op
                                                        snap.s_sijoitus     → totals.ssij
                                                        snap.tulotili       → totals.tulotili
                                                        snap.op_gold        → totals.opvisa (Math.abs)
                                                        snap.asuntolaina    → totals.asunto (Math.abs)
                                                        snap.asuntolaina_remontti → totals.remontti (Math.abs)
                                                        snap.autolaina      → totals.auto (Math.abs)
                                                        snap.s_pankki       → totals.spankki
                                                        ```

                                                        ### Supabase → Finance OS (`convertOldSnap`):
                                                        ```
                                                        s.totals.tulotili   → snap.tulotili
                                                        s.totals.opvisa     → snap.op_gold (negatiiviseksi: -Math.abs)
                                                        s.totals.asunto     → snap.asuntolaina (negatiiviseksi)
                                                        s.totals.remontti   → snap.asuntolaina_remontti (negatiiviseksi)
                                                        s.totals.auto       → snap.autolaina (negatiiviseksi)
                                                        s.totals.nordnet    → snap.nordnet
                                                        s.totals.op         → snap.op_osakkeet
                                                        s.totals.ssij       → snap.s_sijoitus
                                                        s.totals.spankki    → snap.s_pankki
                                                        ```

                                                        **TÄRKEÄ:** `tulot_items`, `rytmi_items`, `nordnet_cash` eivät tallennu Supabaseen vanhassa formaatissa. Ne säilyvät vain IndexedDB:ssä. Tämä on tunnettu rajoitus.

                                                        ---

                                                        ## Kenttien elinkaarisäännöt

                                                        ### Carry-forward -periaate
                                                        Kun uusi snapshot muodostetaan, seuraavat kentät KOPIOIDAAN edellisestä snapshotista jos niitä ei erikseen aseteta:

                                                        `refreshAndFreeze()` carry-forward:
                                                        - tulotili, elatustili, tavoitetili, s_pankki, op_gold, visa, luottotili
                                                        - asuntolaina, asuntolaina_remontti, autolaina
                                                        - tulot_kk, tulot_items, rytmi_items, tulot_pvm, menot_kk
                                                        - nordnet_cash

                                                        `saveEntrySnapshot()` carry-forward:
                                                        - nordnet, op_osakkeet, s_sijoitus, tapiola, rahastot, lasten_sijoitus
                                                          (sijoitusarvot otetaan edellisestä jos Päivitä ei ole ajettu)

                                                          ### Undefined-riski
                                                          Jos `latest` (viimeisin snapshot) on `undefined` tai `null`:
                                                          - Kaikki carry-forward kentät saavat arvon `undefined`
                                                          - `calculateNetWorth(snap)` käsittelee `undefined`:n nolla-arvona (`snap.X ?? 0`)
                                                          - Ei aiheuta crash-virhettä, mutta laskee väärin

                                                          ### Null-riski
                                                          - `snap.nordnet_cash` voi olla `null` jos käyttäjä ei ole koskaan syöttänyt arvoa
                                                          - `calculateNetWorth` käsittelee: `snap.nordnet_cash ?? 0` — turvallinen
                                                          - MUTTA: jos `syncToSupabase` tai `convertOldSnap` ei käsittele nullia, arvo katoaa

                                                          ---

                                                          ## Tunnetut datamallin riskit

                                                          1. **tulot_items/rytmi_items ei synkronoidu Supabaseen** — iOS-laitteella syötetyt toistuvat tulot/menot eivät näy Macilla Supabase-synkronoinnin jälkeen
                                                          2. **nordnet_cash carry-forward** — refreshAndFreeze kopioi nordnet_cash:n, mutta syncFromSupabase EI osaa mergeä sitä (vanhassa formaatissa ei tätä kenttää)
                                                          3. **Sama päivä kahdesti** — Jos käyttäjä tallentaa Syötä-sivulla ja ajaa Päivitä samana päivänä, refreshAndFreeze ylikirjoittaa Syötä-sivun luvut kurssidatalla (mutta carry-forward pelastaa tilit/lainat)
                                                          4. **lasten_sijoitus** — Kenttä on olemassa mutta SEED_HOLDINGS:ssa ei ole lasten-tilin holdingeja; arvo on aina 0 ellei käsin lisätty
                                                          
