# Finance OS — Status & Filosofia

> Versio: 2026-06-09  
> Tila: Vakaa tuotantokäytössä. iOS + desktop toimivat.

---

## Filosofia

### Mitä Finance OS ON

Finance OS on **henkilökohtainen orientaatiotyökalu**. Sen tehtävä on vastata yhteen kysymykseen:

> "Missä taloudellisesti mennään tänään?"

Se on **snapshot-pohjainen**: jokaisena päivänä tallennetaan yksi kokonaiskuva (snapshot) taloudellisesta tilanteesta. Snapshotit ovat itsenäisiä — jokainen kertoo koko tilanteen sillä hetkellä.

### Mitä Finance OS EI OLE

- **Ei kirjanpito** — transaktioita ei seurata automaattisesti
- **Ei budjettisovellus** — ei tavoitemääriä tai kategoriabudjetteja
- **Ei pankkiintegraatio** — kaikki syötetään manuaalisesti (paitsi kurssit)
- **Ei transaktioseuranta** — yksittäisiä ostoksia ei kirjata

### Päivittäinen rituaali

Sovellus on suunniteltu yhdelle päivittäiselle toimenpiteelle:

```
1. Avaa Syötä-sivu
2. Tarkista/päivitä tilit ja lainat (jos muuttunut)
3. Paina "Päivitä" → kurssit haetaan, snapshot tallennetaan
4. Katso Etusivu → "Missä mennään?"
```

Tähän menee n. 2-3 minuuttia.

---

## Termistö

| Termi | Merkitys |
|---|---|
| **Päivitä** | Hae kurssit + tallenna päivän snapshot (refreshAndFreeze) |
| **Tallenna päivä** | Tallenna manuaalisesti syötetyt tiedot snapshotiksi (saveEntrySnapshot) |
| **Sync** | Kaksisuuntainen Supabase-synkronointi — ei sama kuin Päivitä |
| **Snapshot** | Koko taloudellinen tilanne yhtenä päivänä |
| **Holdings** | Arvopaperien kappalemäärä- ja hintatiedot (erillinen store) |
| **Carry-forward** | Edellisen snapshotin arvojen kopiointi uuteen jos ei erikseen muutettu |

---

## Nykyinen tila (2026-06-09)

### Toimivat ominaisuudet

| Ominaisuus | Tila | Huomio |
|---|---|---|
| Etusivu (Dashboard) | Vakaa | 3-kolumni desktop, 1-kolumni mobiili |
| Syötä-sivu | Vakaa | iOS font-fix v98, käyttäjän kieli |
| Salkku | Vakaa | Holdings + kurssit + gains |
| Kassavirta-näkymä | Toimii | Rytmi-laskelmat |
| Historia-näkymä | Vakaa | SVG-kuvaajat |
| Ledger/Päiväkirja | Vakaa | Snapsottihistoria |
| Tapahtumat | Toimii | Dividendit, ostot, myynnit |
| Myyntilaskelmat | Toimii | FIFO/HMO20/HMO40 |
| Supabase-sync | Vakaa | Kaksisuuntainen + timestamp-optimoitu |
| Automaattinen varmuuskopio | Toimii | Rolling: 7 päivää + 4 viikkoa + 12 kuukautta |
| iOS Safari | Vakaa | Font-size ≥16px, ei auto-zoom |
| PWA (Add to Home Screen) | Toimii | Service Worker v62 |
| Privacy mode | Toimii | hide-amounts CSS-luokka |
| Desktop sidebar | Vakaa | 3-kolumni layout, drag-and-drop |
| Mobiili swipe-navigaatio | Toimii | swipe-nav.js |

### Viimeisimmät korjaukset (tämä sessio)

| Commit | Muutos | Prioriteetti |
|---|---|---|
| 02023be | iOS font-size ≥16px fix (estää auto-zoom) | Kriittinen |
| 9b740ac | index.html version bump + mobile CSS | Kriittinen |
| df7826d | Syötä-sivu UX redesign — käyttäjän kieli, ei analytiikkaa | Tärkeä |
| 7fca8b0 | FINANCE_OS_ARCHITECTURE.md | Dokumentaatio |
| e677bd3 | FINANCE_OS_DATA_MODEL.md | Dokumentaatio |

### Aiempien sessioiden kriittiset korjaukset

| Bugi | Juurisyy | Korjaus |
|---|---|---|
| refreshAndFreeze käytti väärää snapshotia | filter(s.date < today) esti tänään tallennetun datan | Poistettu filter, käytetään viimeisintä |
| tulot_items ylikirjoittui | refreshAndFreeze ei carry-forwardannut | Lisätty carry-forward |
| rytmi_items ylikirjoittui | Sama kuin yllä | Lisätty carry-forward |
| nordnet_cash hävisi | refreshAndFreeze ei carry-forwardannut | Lisätty carry-forward |
| privacy mode rikkoutui | CSS-spesifisyys-konflikti | Korjattu CSS-järjestys |
| iOS auto-zoom | font-size < 16px inputeissa | Kaikki inputit ≥16px |

---

## Vakaiden osien määritelmä

Nämä osat voidaan koskea vain erittäin harkitusti:

### ÄLÄ MUUTA ILMAN ERITYISTÄ SYYTÄ

1. **calculateNetWorth(snap)** — Laskenta on oikein ja kaikki UI riippuu siitä
2. **DB.bulkPutSnapshots()** — Perustoiminto, upsert by date
3. **refreshAndFreeze() carry-forward -logiikka** — Korjattu useaan kertaan, herkästi rikkoutuva
4. **syncFromSupabase() / convertOldSnap()** — Yhteensopivuuskerros vanhaan formaattiin
5. **snap.nordnet vs snap.nordnet_cash erottelu** — Sekoittuminen aiheuttaa laskentavirheitä
6. **@media (max-width: 899px) mobiilimäärittelyt** — Koskee vain mobiilinäkymää

---

## Tunnetut riskit ja herkät alueet

### Korkea riski

| Alue | Riski | Miksi herkkä |
|---|---|---|
| **Snapshot-säilyvyys** | Kenttä voi hävitä | Carry-forward logiikka on monimutkainen |
| **Sync-logiikka** | Ristiriitaiset päivitykset Mac/iOS | Timestamp-merging ei kata kaikkia kenttiä |
| **holdings → snapshot muunnos** | Väärä tili → väärä summa | account-kentän tarkkuus kriittinen |
| **nordnet_cash** | Ei synkronoidu Supabaseen | Vanhassa formaatissa ei tätä kenttää |

### Keskitaso riski

| Alue | Riski | Miksi herkkä |
|---|---|---|
| **Privacy mode** | CSS-spesifisyys | Useita .hide-amounts -sääntöjä |
| **iOS layout** | Font-size regressio | Helppo ylikirjoittua uudessa CSS:ssä |
| **Desktop 3-kolumni** | Layout-rikko | Grid + sidebar + panel riippuvuus |
| **tulot_items/rytmi_items** | Ei Supabase-synkka | Käyttäjä voi menettää iOS-syötön |

### Matala riski (vakaat)

- Kassavirta-laskelmat (vain lukee snapshoteja)
- Historia-kuvaajat (vain lukee snapshoteja)
- Myyntilaskelmat (riippumaton logiikka)
- Tapahtumat-näkymä (erillinen store)

---

## Seuraavat kehitysvaiheet (suunniteltu)

Nämä EIVÄT ole vielä toteutuksessa. Dokumentoitu tulevia sessioita varten.

1. **Syötä-sivu suuri UX-uudistus** — Pirteä, innostava, nopea täyttää (odottaa tätä dokumentaatiota)
2. **tulot_items/rytmi_items Supabase-synkka** — Tärkeä iOS-käyttäjälle
3. **nordnet_cash Supabase-synkka** — Sama ongelma
4. **Kassavirta-näkymän parannukset** — Nykyinen toimii, parantamisvaraa
5. **Päiväkirja-näkymän parannukset** — Kirja-tyylinen lukunäkymä

---

## Koodikanta — terveydentila

```
index.html          ← Monoliittinen CSS, toimii. Harkitse jakamista myöhemmin.
ui2-v2.js           ← ~214k merkkiä, kasvaa. Harkitse modulaarisuutta v2:ssa.
sync2.js            ← Hyvä. Selkeä vastuunjako.
calculations.js     ← Hyvä. Puhdas, testattava.
app.js              ← Hyvä. Pieni, selkeä käynnistyslogiikka.
db.js               ← Toimii. IndexedDB-abstraktio.
```

**Tekninen velka:**
- ui2-v2.js on liian iso — kaikki UI samassa tiedostossa
- CSS on index.html:ssä — ei erillisiä CSS-tiedostoja
- Ei yksikkötestejä

**Nämä ovat tiedossa olevia kompromisseja** (yksinkertaisuus vs. modulaarisuus GitHub Pages -käyttöympäristössä).
