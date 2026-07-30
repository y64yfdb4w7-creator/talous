# Finance OS — Snapshotin muodostusauditointi

> Versio: 2026-06-09  
> Tarkoitus: Listaa kaikki kohdat joissa snapshot muodostetaan ja auditoi kenttien turvallisuus  
> Tila: EI KORJAUKSIA VIELÄ — vain raportoi

---

## Auditoinnin kohde

Kaikki kohdat joissa `new snapshot` muodostetaan tai tallennetaan:

1. `saveEntrySnapshot()` — ui2-v2.js
2. `refreshAndFreeze()` — sync2.js
3. `syncFromSupabase()` — sync2.js (import/merge)
4. `convertOldSnap()` — sync2.js (muunnos)
5. CSV-import — import.js

---

## 1. refreshAndFreeze() — sync2.js

### Snapshot-objektin muodostus (rivikohtainen analyysi)

```javascript
const snap = {
  date: today,                           // TURVALLINEN — aina asetettu
    ...acctTotals,                         // RISKI — ks. alla
      tulotili: latest?.tulotili,            // RISKI — voi olla undefined
        elatustili: latest?.elatustili,        // RISKI — voi olla undefined
          tavoitetili: latest?.tavoitetili,      // RISKI — voi olla undefined
            s_pankki: latest?.s_pankki,            // RISKI — voi olla undefined
              op_gold: latest?.op_gold,             // RISKI — voi olla undefined
                visa: latest?.visa,                    // RISKI — voi olla undefined
                  luottotili: latest?.luottotili,        // RISKI — voi olla undefined
                    asuntolaina: latest?.asuntolaina,      // RISKI — voi olla undefined
                      asuntolaina_remontti: latest?.asuntolaina_remontti, // RISKI
                        autolaina: latest?.autolaina,          // RISKI — voi olla undefined
                          tulot_kk: latest?.tulot_kk,            // RISKI — voi olla undefined
                            tulot_items: latest?.tulot_items,      // RISKI — voi olla undefined
                              rytmi_items: latest?.rytmi_items,      // RISKI — voi olla undefined
                                tulot_pvm: latest?.tulot_pvm,          // RISKI — voi olla undefined
                                  menot_kk: latest?.menot_kk,            // RISKI — voi olla undefined
                                    nordnet_cash: latest?.nordnet_cash,    // RISKI — voi olla undefined
                                    };
                                    ```

                                    ### acctTotals — spread-operaattorin riskit

                                    `acctTotals` lasketaan holdingseista:
                                    ```javascript
                                    const acctTotals = {};
                                    for (const h of holdings) {
                                      const val = (h.quantity || 0) * (h.last_price || 0);
                                        acctTotals[h.account] = (acctTotals[h.account] || 0) + val;
                                        }
                                        ```

                                        **Mahdolliset kentät:** `nordnet`, `op_osakkeet`, `s_sijoitus`, `tapiola`, `rahastot`, `lasten_sijoitus`

                                        | Riski | Tilanne | Seuraus |
                                        |---|---|---|
                                        | Tili jolla ei ole holdingeja | acctTotals['nordnet'] puuttuu | snap.nordnet = undefined (ei nollaa!) |
                                        | holding.account on kirjoitusvirhe | esim. 'Nordnet' vs 'nordnet' | Kenttä menee väärään nimeen |
                                        | Kaikki holdings filteroitu pois | acctTotals on {} | Kaikki sijoituskentät undefined |

                                        **Vakavuus: KORKEA** — Jos holdings-storessa ei ole aktiivisia Nordnet-holdingeja, `snap.nordnet` jää `undefined`:ksi eikä näy Etusivulla oikein.

                                        ### latest?.X — optional chaining -riskit

                                        `latest` on viimeisin snapshot tai `undefined` jos snapshoteja ei ole.

                                        | Kenttä | Jos latest=undefined | Jos latest.X=undefined | Seuraus |
                                        |---|---|---|---|
                                        | `tulotili` | → undefined | → undefined | calculateNetWorth: `snap.tulotili ?? 0` = 0 ✓ |
                                        | `op_gold` | → undefined | → undefined | calculateNetWorth: `snap.op_gold ?? 0` = 0 ✓ |
                                        | `asuntolaina` | → undefined | → undefined | calculateNetWorth: `snap.asuntolaina ?? 0` = 0 ✓ |
                                        | `tulot_items` | → undefined | → undefined | UI: voi renderöidä tyhjän listan ✓ |
                                        | `rytmi_items` | → undefined | → undefined | UI: voi renderöidä tyhjän listan ✓ |
                                        | `nordnet_cash` | → undefined | → undefined | calculateNetWorth: `snap.nordnet_cash ?? 0` = 0 ✓ |

                                        **calculateNetWorth on turvallinen** — kaikki kentät käyttävät `?? 0` -operaattoria.
                                        **UI-funktiot voivat olla riskialttiita** jos ne eivät tarkista `undefined` ennen map/forEach.

                                        ### Konkreettiset undefined-riskit refreshAndFreeze:ssä

                                        | # | Kenttä | Voi muuttua undefined? | Voi muuttua null? | Voi hävitä? | Voi ylikirjoittua vahingossa? |
                                        |---|---|---|---|---|---|
                                        | 1 | nordnet | **KYLLÄ** (jos ei holdingeja) | Ei | **KYLLÄ** | **KYLLÄ** (acctTotals spread) |
                                        | 2 | op_osakkeet | **KYLLÄ** (jos ei holdingeja) | Ei | **KYLLÄ** | **KYLLÄ** |
                                        | 3 | s_sijoitus | **KYLLÄ** | Ei | **KYLLÄ** | **KYLLÄ** |
                                        | 4 | tulotili | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei (carry-forward) |
                                        | 5 | op_gold | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei |
                                        | 6 | asuntolaina | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei |
                                        | 7 | tulot_items | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei |
                                        | 8 | rytmi_items | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei |
                                        | 9 | nordnet_cash | KYLLÄ (jos latest=undef) | Ei | Ei* | Ei |
                                        | 10 | date | Ei | Ei | Ei | Ei |

                                        *) "Ei hävitä" = carry-forward toimii jos latest on olemassa. Jos snapshotteja ei ole lainkaan, kentät ovat undefined — mutta tämä on odotettu käyttäytyminen ensiasennuksessa.

                                        ---

                                        ## 2. saveEntrySnapshot() — ui2-v2.js

                                        Tämä funktio kerää tiedot Syötä-sivun lomakekentistä ja muodostaa snapshotin.

                                        ### Arkkitehtuurinen rakenne (session historyn perusteella)

                                        ```javascript
                                        async function saveEntrySnapshot() {
                                          // 1. Hae olemassa oleva snapshot tälle päivälle (tai luo uusi)
                                            const today = new Date().toISOString().slice(0,10);
                                              const allSnaps = (await DB.getAll('snapshots')).sort(...);
                                                const existing = allSnaps.find(s => s.date === today) || allSnaps[allSnaps.length-1] || {};

                                                  // 2. Kerää lomakkeen kentät
                                                    const tulotili = parseFloat(document.getElementById('inp-tulotili').value) || 0;
                                                      // ... muut kentät

                                                        // 3. Carry-forward sijoituskentät edellisestä
                                                          const snap = {
                                                              date: today,
                                                                  tulotili, elatustili, tavoitetili, s_pankki, op_gold,
                                                                      asuntolaina, asuntolaina_remontti, autolaina,
                                                                          // carry-forward sijoitukset:
                                                                              nordnet: existing.nordnet,
                                                                                  op_osakkeet: existing.op_osakkeet,
                                                                                      // ...
                                                                                          tulot_items: ..., // kerätään UI:sta
                                                                                              rytmi_items: ..., // kerätään UI:sta
                                                                                                };

                                                                                                  // 4. Tallenna
                                                                                                    await DB.bulkPutSnapshots([snap]);
                                                                                                      await syncToSupabase(snap);
                                                                                                        await autoBackup();
                                                                                                        }
                                                                                                        ```
                                                                                                        
                                                                                                        ### Konkreettiset undefined-riskit saveEntrySnapshot:ssä
                                                                                                        
                                                                                                        | # | Kenttä | Voi muuttua undefined? | Syy | Vakavuus |
                                                                                                        |---|---|---|---|---|
                                                                                                        | 1 | nordnet | **KYLLÄ** | existing?.nordnet jos ei aiempaa snapshotia | KORKEA — sijoitukset katoaa |
                                                                                                        | 2 | op_osakkeet | **KYLLÄ** | Sama | KORKEA |
                                                                                                        | 3 | s_sijoitus | **KYLLÄ** | Sama | KORKEA |
                                                                                                        | 4 | tulotili | Ei | Luetaan DOM-elementistä (parseFloat tai 0) | Turvallinen |
                                                                                                        | 5 | op_gold | Ei | Luetaan DOM-elementistä | Turvallinen |
                                                                                                        | 6 | asuntolaina | Ei | Luetaan DOM-elementistä | Turvallinen |
                                                                                                        | 7 | tulot_items | Riski | Jos renderTulotItems() tuottaa tyhjiä rivejä | KESKI |
                                                                                                        | 8 | rytmi_items | Riski | Jos renderRytmiItems() tuottaa tyhjiä rivejä | KESKI |
                                                                                                        | 9 | nordnet_cash | **KYLLÄ** | existing?.nordnet_cash carry-forward | KORKEA |
                                                                                                        
                                                                                                        ---
                                                                                                        
                                                                                                        ## 3. syncFromSupabase() — sync2.js
                                                                                                        
                                                                                                        ### Uudet snapshotit (toImport)
                                                                                                        
                                                                                                        ```javascript
                                                                                                        toImport.push(convertOldSnap(remote));
                                                                                                        ```
                                                                                                        
                                                                                                        `convertOldSnap` palauttaa **kiinteän kentärakenteen** — kaikki kentät asetettu vaikka nollaksi:
                                                                                                        ```javascript
                                                                                                        {
                                                                                                          nordnet: t.nordnet || 0,      // TURVALLINEN — || 0
                                                                                                            op_osakkeet: t.op || 0,       // TURVALLINEN
                                                                                                              tulotili: t.tulotili || a['Tulotili'] || 0, // TURVALLINEN
                                                                                                                op_gold: -(Math.abs(t.opvisa || a['OP Gold Visa'] || 0)), // TURVALLINEN
                                                                                                                  // ... kaikki kentät nollasella tai arvolla
                                                                                                                  }
                                                                                                                  ```
                                                                                                                  
                                                                                                                  **PUUTTUVA:** `tulot_items`, `rytmi_items`, `nordnet_cash` — näitä ei ole vanhassa formaatissa.
                                                                                                                  Tuodut snapshotit saavat nämä kentät `undefined`:nä.
                                                                                                                  
                                                                                                                  **Vakavuus: KESKI** — Tuodut historialliset snapshotit eivät sisällä kassavirtadataa. Tämä on odotettua.
                                                                                                                  
                                                                                                                  ### Mergatut snapshotit (toMerge)
                                                                                                                  
                                                                                                                  ```javascript
                                                                                                                  const merged = {
                                                                                                                    ...local,             // Säilytä kaikki paikalliset kentät
                                                                                                                      tulotili: remTulotili ?? local.tulotili,
                                                                                                                        op_gold: ...,
                                                                                                                          // ... vain muutama kenttä päivitetään
                                                                                                                          };
                                                                                                                          ```
                                                                                                                          
                                                                                                                          **RISKI:** `...local` spread säilyttää kaikki paikalliset kentät. Jos local-snapshotissa on undefined-kenttiä, ne säilyvät merged:ssä.
                                                                                                                          
                                                                                                                          **Vakavuus: MATALA** — merge parantaa dataa, ei heikennä.
                                                                                                                          
                                                                                                                          ---
                                                                                                                          
                                                                                                                          ## 4. convertOldSnap() — sync2.js
                                                                                                                          
                                                                                                                          ```javascript
                                                                                                                          function convertOldSnap(s) {
                                                                                                                            const t = s.totals || {};
                                                                                                                              const a = s.accounts ? ... : {};
                                                                                                                                return {
                                                                                                                                    date: s.date,
                                                                                                                                        nordnet: t.nordnet || 0,
                                                                                                                                            op_osakkeet: t.op || 0,
                                                                                                                                                tapiola: 0,
                                                                                                                                                    s_sijoitus: t.ssij || 0,
                                                                                                                                                        rahastot: 0,
                                                                                                                                                            lasten_sijoitus: t.lapset || 0,
                                                                                                                                                                tulotili: t.tulotili || a['Tulotili'] || 0,
                                                                                                                                                                    elatustili: a['Elatustili'] || 0,
                                                                                                                                                                        tavoitetili: a['Tavoitetili'] || 0,
                                                                                                                                                                            s_pankki: a['S-Pankki'] || t.spankki || 0,
                                                                                                                                                                                op_gold: -(Math.abs(t.opvisa || a['OP Gold Visa'] || 0)),
                                                                                                                                                                                    visa: 0,
                                                                                                                                                                                        luottotili: 0,
                                                                                                                                                                                            asuntolaina: -(Math.abs(t.asunto || a['Asuntolaina'] || 0)),
                                                                                                                                                                                                asuntolaina_remontti: -(Math.abs(t.remontti || a['Asuntolaina (remontti)'] || 0)),
                                                                                                                                                                                                    autolaina: -(Math.abs(t.auto || a['Autolaina'] || 0)),
                                                                                                                                                                                                        _source: 'supabase_import',
                                                                                                                                                                                                            _note: s.note || '',
                                                                                                                                                                                                              };
                                                                                                                                                                                                              }
                                                                                                                                                                                                              ```
                                                                                                                                                                                                              
                                                                                                                                                                                                              **Puuttuvat kentät:** `tulot_items`, `rytmi_items`, `nordnet_cash`, `tulot_kk`, `menot_kk`
                                                                                                                                                                                                              — Nämä jäävät `undefined`:ksi tuoduissa snapshoissa.
                                                                                                                                                                                                              
                                                                                                                                                                                                              **Vakavuus: MATALA** — Historialliset snapshotit eivät koskaan sisällä kassavirtadataa.
                                                                                                                                                                                                              
                                                                                                                                                                                                              ---
                                                                                                                                                                                                              
                                                                                                                                                                                                              ## 5. CSV-import — import.js
                                                                                                                                                                                                              
                                                                                                                                                                                                              Import-funktio luo snapshoteja CSV-tiedostosta. Näiden kenttärakenne riippuu CSV-sarakkeiden kartoituksesta.
                                                                                                                                                                                                              
                                                                                                                                                                                                              **Riski:** Kartoituksessa voi jäädä kenttiä pois → undefined-arvoilla tuodut snapshotit.
                                                                                                                                                                                                              
                                                                                                                                                                                                              **Vakavuus: MATALA** — Import on kertaluontoinen operaatio, käyttäjä näkee esikatselun.
                                                                                                                                                                                                              
                                                                                                                                                                                                              ---
                                                                                                                                                                                                              
                                                                                                                                                                                                              ## Yhteenveto: Kriittisimmät riskit
                                                                                                                                                                                                              
                                                                                                                                                                                                              ### KORKEA PRIORITEETTI — Korjattavissa
                                                                                                                                                                                                              
                                                                                                                                                                                                              | # | Ongelma | Sijainti | Seuraus |
                                                                                                                                                                                                              |---|---|---|---|
                                                                                                                                                                                                              | A | ~~nordnet/op_osakkeet/s_sijoitus voi olla undefined jos holdings tyhjä~~ — KORJATTU (Sprint 7, 2026-07-30), ks. "Korjaus A" alla | refreshAndFreeze acctTotals + saveDayFromHoldings acctTotals | Etusivu näyttää 0/virheellistä sijoitussummaa |
                                                                                                                                                                                                              | B | Sijoituskentät undefined saveEntrySnapshot:ssa jos ei aiempaa snapshotia | saveEntrySnapshot carry-forward | Uusi käyttäjä menettää sijoitustiedot |
                                                                                                                                                                                                              
                                                                                                                                                                                                              ### KESKITASO PRIORITEETTI — Tunnetut rajoitukset
                                                                                                                                                                                                              
                                                                                                                                                                                                              | # | Ongelma | Sijainti | Seuraus |
                                                                                                                                                                                                              |---|---|---|---|
                                                                                                                                                                                                              | C | tulot_items/rytmi_items ei tallennu Supabaseen | syncToSupabase | iOS-syötetty kassavirta katoaa synkatessa |
                                                                                                                                                                                                              | D | nordnet_cash ei tallennu Supabaseen | syncToSupabase | Nordnet-käteinen katoaa synkatessa |
                                                                                                                                                                                                              | E | Tuodut snapshotit (convertOldSnap) ei sisällä kassavirtadataa | syncFromSupabase | Historialliset snapshotit ilman rytmi-tietoja |
                                                                                                                                                                                                              
                                                                                                                                                                                                              ### MATALA PRIORITEETTI — Hyväksyttyjä rajoituksia
                                                                                                                                                                                                              
                                                                                                                                                                                                              | # | Ongelma | Sijainti | Seuraus |
                                                                                                                                                                                                              |---|---|---|---|
                                                                                                                                                                                                              | F | holdings.account kirjoitusvirhe → väärä kenttä snapshotissa | refreshAndFreeze | Tili menee väärään kategoriaan |
                                                                                                                                                                                                              | G | latest undefined ensiasennuksessa | Kaikki carry-forward | Odotettua — tyhjä DB, ei dataa |
                                                                                                                                                                                                              | H | CSV-import puuttuvat kentät | import.js | Osittaiset snapshotit |
                                                                                                                                                                                                              
                                                                                                                                                                                                              ---
                                                                                                                                                                                                              
                                                                                                                                                                                                              ## Korjausehdotukset (EI toteuteta vielä)
                                                                                                                                                                                                              
                                                                                                                                                                                                              Nämä on dokumentoitu tulevaa kehitystä varten.
                                                                                                                                                                                                              
                                                                                                                                                                                                                  ### Korjaus A: acctTotals nollavarmistus — TOTEUTETTU (Sprint 7, 2026-07-30)
                                                                                                                                                                                                                  
                                                                                                                                                                                                                  Alkuperäinen korjausehdotus alla (`acctTotals.nordnet ?? (latest?.nordnet ?? 0)`)
                                                                                                                                                                                                                  osoittautui jatkoauditoinnissa vaaralliseksi: se olisi carry-forwardannut vanhan
                                                                                                                                                                                                                  arvon myös silloin kun käyttäjä on tarkoituksella poistanut tilin kaikki holding-rivit
                                                                                                                                                                                                                  (`deleteHolding`) — herättäen poistetun tilin arvon henkiin joka Päivitä-kerralla.
                                                                                                                                                                                                                  Toteutettu korjaus erottaa nämä kaksi tilannetta hakemalla holdings-lista myös
                                                                                                                                                                                                                  suodattamattomana: jos tilillä on yhtään holding-riviä (riippumatta hinnasta) mutta se
                                                                                                                                                                                                                  ei saanut hintaa tänään, viimeisin tunnettu arvo carry-forwardataan; jos tilillä ei ole
                                                                                                                                                                                                                  yhtään holding-riviä, kenttä jätetään ennalleen (undefined → 0 calculateNetWorth:ssa),
                                                                                                                                                                                                                  eikä vanhaa arvoa herätetä henkiin. Korjattu molemmissa kirjoituspoluissa:
                                                                                                                                                                                                                  refreshAndFreeze() (js/sync2.js) ja saveDayFromHoldings() (js/ui2-v2.js), identtisellä
                                                                                                                                                                                                                  logiikalla.
                                                                                                                                                                                                                  
                                                                                                                                                                                                                  ```javascript
                                                                                                                                                                                                                  // ENNEN:
                                                                                                                                                                                                                  const snap = {
                                                                                                                                                                                                                    ...acctTotals,
                                                                                                                                                                                                                    // nordnet voi olla undefined jos ei holdingeja
                                                                                                                                                                                                                  };
                                                                                                                                                                                                                  
                                                                                                                                                                                                                  // EHDOTETTU (hylätty, vaarallinen — ks. yllä):
                                                                                                                                                                                                                  const snap = {
                                                                                                                                                                                                                    nordnet: acctTotals.nordnet ?? (latest?.nordnet ?? 0),
                                                                                                                                                                                                                    // ...
                                                                                                                                                                                                                  };
                                                                                                                                                                                                                  
                                                                                                                                                                                                                  // TOTEUTETTU:
                                                                                                                                                                                                                  const INVESTMENT_ACCOUNT_KEYS = ['nordnet','op_osakkeet','tapiola','s_sijoitus','rahastot','lasten_sijoitus'];
                                                                                                                                                                                                                  const accountsWithHoldingRows = new Set(allHoldings.map(h => h.account));
                                                                                                                                                                                                                  for (const key of INVESTMENT_ACCOUNT_KEYS) {
                                                                                                                                                                                                                    if (!(key in acctTotals) && accountsWithHoldingRows.has(key)) {
                                                                                                                                                                                                                      acctTotals[key] = latest?.[key] ?? 0;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                  }
                                                                                                                                                                                                                  const snap = { ...acctTotals, /* ... */ };
                                                                                                                                                                                                                  ```
                                                                                                                                                                                                                  
                                                                                                                                                                                                                  **Periaate:** Jos tänään ei ole kurssidataa tileiltä mutta tili on edelleen olemassa,
                                                                                                                                                                                                                  käytä edellisen päivän arvoa. Jos tiliä ei enää ole (kaikki holdingit poistettu),
                                                                                                                                                                                                                  älä korvaa mitään — anna kentän pysyä tyhjänä kuten ennenkin.
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                ### Korjaus C+D: Supabase-synkka uusille kentille
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                Vaatii Supabase-skeeman päivityksen tai erillisen JSON-blobin käytön.
                                                                                                                                                                                                                                
                                                                                                                                                                                                                                Vaihtoehto: Tallenna `extra`-kenttä Supabaseen:
                                                                                                                                                                                                                                ```json
                                                                                                                                                                                                                                {
                                                                                                                                                                                                                                  "extra": {
                                                                                                                                                                                                                                      "tulot_items": [...],
                                                                                                                                                                                                                                          "rytmi_items": [...],
                                                                                                                                                                                                                                              "nordnet_cash": 955
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                }
                                                                                                                                                                                                                                                ```
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                ---
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                ## Tarkistuslista ennen seuraavaa isoa muutosta
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                Ennen kuin muokkaat snapshot-logiikkaa, varmista:
                                                                                                                                                                                                                                                
                                                                                                                                                                                                                                                - [ ] `refreshAndFreeze()` carry-forward kattaa kaikki kentät
                                                                                                                                                                                                                                                - [ ] `saveEntrySnapshot()` carry-forward kattaa sijoituskentät
                                                                                                                                                                                                                                                - [ ] `calculateNetWorth()` käyttää `?? 0` kaikille kentille
                                                                                                                                                                                                                                                - [ ] `convertOldSnap()` ei ylikirjoita uusia kenttiä
                                                                                                                                                                                                                                                - [ ] Sama päivämäärä upsertissa ei hävitä mitään
                                                                                                                                                                                                                                                - [ ] iOS-laitteella syötetty data säilyy Päivitä-painalluksen jälkeen
                                                                                                                                                                                                                                                - [ ] nordnet ja nordnet_cash pysyvät erillään
                                                                                                                                                                                                                                                
