# Suunnittelupäätös: Rahavirtojen toteutumismalli v1

> Status: **HYVÄKSYTTY TUOTEPÄÄTÖS** (ei toteutettu koodiin)
> Päivämäärä: 2026-07-27
> Sprintti: Suunnittelusprintti (ei UI:ta, ei tuotantokoodia)

---

## Tausta ja auditoinnin tulos

Massatoiminnot-sprintissä (commit `18d8920`, 2026-07-27) havaittiin ettei koodikannassa ole
mitään käsitettä "toteutunut rahavirta" säännöllisille tuloille/menoille. Tämä on vahvistettu
uudella auditoinnilla ennen tämän dokumentin kirjoittamista:

- **Ei olemassa olevaa tietomallia.** `tulot_items`/`rytmi_items` (säännölliset) eivät sisällä
  mitään "maksettu"/"toteutunut"-kenttää. `collectRahavirrat()` projisoi aina *seuraavan*
  esiintymän snapshotDate:sta eteenpäin — järjestelmällä ei ole muistia siitä, maksettiinko
  edellisen kuun 5. päivän vuokra vai ei.
- **Ainoa lähelle tuleva mekanismi on tuhoava eikä liity säännöllisiin.**
  `rahavirtaKuittausApply()` (`js/ui2-v2.js:5356-5370`) poistaa kertaluonteisen
  `tulevat_items`-rivin kokonaan (`splice`) — ei arkistoi, ei luo erillistä tietuetta. Tämä
  koodi on tarkoituksella jätetty käyttämättömäksi pohjaksi, mutta sen semantiikka
  ("hoidettu = poistettu") **ei kelpaa** säännöllisille rahavirroille, koska sääntö
  (esim. "Vuokra, päivä 1") on pysyvä eikä saa kadota vaikka yksi esiintymä kuitataan.
- **`events`-tietokanta on eri toimialue.** Se on sijoitustapahtumien loki
  (osinko/osto/myynti/siirto), ei liity rahavirtoihin, eikä synkronoidu Supabaseen.
- **Snapshotit ovat carry-forward-tietueita, eivät lokia.** Jokainen uusi snapshot kopioi
  `tulot_items`/`rytmi_items`/`tulevat_items`-taulukot sellaisenaan edellisestä (`sync2.js:190-226`).
  Tämä on tärkeä rajoite tallennuspaikkapäätökselle (kohta 2).

---

## 1. Mikä on toteutunut rahavirta?

**Määritelmä:** Toteuma on käyttäjän vahvistus siitä, että jokin rahavirran *yksittäinen
esiintymä* on todellisuudessa tapahtunut (maksettu/vastaanotettu) tiettynä päivänä.

Toteuma on **kuittaustietue**, ei kirjanpitomerkintä eikä budjettitapahtuma:

- Se ei muuta rahavirran sääntöä (`amt_kk`, `paiva` jne. pysyvät ennallaan).
- Se ei luo uutta tiliriviä eikä vaikuta saldoihin.
- Se on puhdas historiatieto: "tämä tapahtui, käyttäjä vahvisti sen tänä päivänä."

**Mitä siihen EI kuulu:**

- Ei kategorioita, ei tilikohdistusta, ei muistiinpanokenttää (ei kirjanpito- tai
  budjettiominaisuuksia — vastoin projektifilosofiaa).
- Ei automaattista "arvattua" toteumaa — vain käyttäjän eksplisiittinen vahvistus.
- Ei vielä (v1) undo/peru-toimintoa — sama rajaus kuin nykyisellä yksittäisellä
  poisto-toiminnolla, joka niin ikään ei tue peruutusta.

---

## 2. Tallennuspaikka

### Vaihtoehdot

**A) Snapshotin sisällä** (kuten `tulot_items` nyt) vs. **B) erillinen loki/store**.

### Päätös: **B — erillinen IndexedDB-store (`toteumat`)** ✅ hyväksytty

**Perustelu:**

1. **Carry-forward-mekanismi tekisi A:sta huonon.** Jokainen uusi snapshot kopioi
   `tulot_items`/`rytmi_items`/`tulevat_items` edellisestä snapshotista sellaisenaan
   (`sync2.js:190-226`). Jos toteumahistoria elisi snapshotin sisällä samalla periaatteella,
   jokainen tuleva päivä kantaisi mukanaan koko kasvavan historian — snapshotin koko kasvaisi
   rajattomasti ja jokainen `Päivitä & jäädytä` -kutsu kopioisi koko historian uudelleen.
2. **Koodikannassa on jo tarkka precedent tälle mallille.** `events`- ja `sales`-storet ovat
   rakenteeltaan juuri tätä: `{id, date, ...denormalisoidut kentät}`, indeksi `date`:lla,
   elinkaari irrallaan snapshotin carry-forward-logiikasta. Toteuma noudattaa samaa mallia.
3. **Suorituskyky/yksinkertaisuus:** erillinen store pidetään pienenä (vain vahvistukset,
   ei koko taloustilaa), eikä sekoita rahavirtasääntöjen CRUD-logiikkaa (joka jo nyt operoi
   `snaps[snaps.length-1]`-oletuksella) historiadatan kanssa.
4. **Historia säilyy oikein.** Koska store on itsenäinen eikä sidottu "viimeisimpään
   snapshotiin", toteumat eivät katoa eivätkä sekoitu kun rahavirtasääntöjä muokataan tai
   poistetaan myöhemmin.

**Päätös: laitekohtainen v1:ssä, ei Supabase-synkronointia.** ✅ hyväksytty. Nykyinen
synkkausmekanismi (`sync2.js`) on yksi iso JSON-blob (`talous_state.data`), joka sisältää
tänään vain `snaps`+`holdings`. `events`/`sales`/`pins`/`backups` **eivät synkronoidu**
ollenkaan tänään — ne pysyvät vain paikallisina. `toteumat` seuraa samaa, jo vakiintunutta
mallia: kevyempi toteutussprintti, sync voidaan lisätä myöhemmin omana, erikseen
suunniteltuna päätöksenä jos tarve ilmenee.

---

## 3. Vaikutus nykyisiin laskelmiin

**Päätös: EI vaikuta.** Toteuma on puhdas historiatieto.

- **Hero** (`heroSum()`) — ei muutu. Se summaa vain sen mitä `buildKassajakso()` sille antaa.
- **Kassajakso** (`buildKassajakso()`) — ei muutu. `collectRahavirrat()` jatkaa aina seuraavan
  esiintymän projisointia riippumatta siitä onko edellinen esiintymä kuitattu toteumaksi.
- **Odote** (`openOdoteModal()`) — ei muutu, koska se on pelkkä `buildKassajakso()`-tuloksen
  render.
- **Kuukausirytmi** — käsite on jo poistettu koodikannasta (ks. auditointi), ei relevantti.
- **Rahavirrat-lista** (`renderTulossaList()`) — ei muutu tässä sprintissä. Tulevaisuudessa
  lista *voisi* näyttää visuaalisen merkinnän ("tämä kuun esiintymä on jo kuitattu"), mutta se
  on UI-päätös joka kuuluu erilliseen toteutussprinttiin, ei tähän tietomallipäätökseen.

**Arkkitehtuuriperuste:** Dokumentoitu kerrosvastuunjako (`FINANCE_OS_ARCHITECTURE.md`,
"Rahavirta → Kassajakso → Hero — vastuurajat") sanoo että jokainen kerros tietää vain mitä
alempi kerros sille antaa, ei miten se syntyi. Toteuma on uusi, näistä kerroksista erillinen
sivuannotaatio — se ei saa injektoitua Kassajakso/Hero-putkeen ilman erillistä, myöhempää
arkkitehtuuripäätöstä.

---

## 4. Voiko sama rahavirta toteutua useita kertoja?

**Kyllä.** Rahavirta on sääntö ("Vuokra, päivä 1, kuukausittain"). Toteuma on yksittäisen
kalenteriesiintymän vahvistus. Sama sääntö voi siis saada monta toteumaa ajan myötä
(1.8., 1.9., 1.10. — kolme erillistä toteumaa, sama `rahavirtaId`).

Tämä on linjassa sen kanssa että `tulot_items`/`rytmi_items` jo sisältävät
`repeat_every_months`-kentän (vaikka se ei vielä vaikuta päivämäärälaskentaan) — domain
ajattelee jo sääntö-vs-esiintymä-erotuksessa.

---

## 5. Tunnisteet

**`rahavirtaId` + `rahavirtaSource`** (ei pelkkä `rahavirtaId`).

**Perustelu kahdelle kentälle yhden sijaan:**

- `id`-kentät (`tulo_...`/`meno_...`/`tulossa_...`) ovat prefiksoituja mutta **legacy-riveiltä
  voi puuttua kokonaan** — näissä käytetään `idx:N`-fallback-avainta, joka **ei ole vakaa**
  jos taulukko järjestetään uudelleen tai rivi poistetaan välistä. Tämä on tunnettu riski
  (ks. `ensureRahavirtaIds`-migraatio).
- `rahavirtaSource` ('tulot_items' | 'rytmi_items' | 'tulevat_items') tarvitaan koska
  kolme taulukkoa ovat erillisiä eivätkä takaa globaalisti uniikkeja id:itä pitkällä
  aikavälillä, ja koska `tulevat_items`-rivit käyttäytyvät eri tavalla (kertaluonteinen,
  nykyinen kuittausvirta poistaa koko rivin).

**`instanceDate`** on pakollinen: ilman sitä ei voisi erottaa "elokuun vuokra" vs.
"syyskuun vuokra" -toteumia toisistaan (vastaa kohtaan 4). `(rahavirtaId, instanceDate)`
-pari toimii luonnollisena kaksoiskirjauksen estävänä avaimena.

**Edellytys ennen toteutusta (toteutussprintille):** rahavirralla on oltava pysyvä `id`
ennen kuin siihen voi liittää toteuman — `ensureRahavirtaIds`-migraatio on ajettava/
varmistettava riville ensin, muuten `rahavirtaId` voisi osoittaa epävakaaseen `idx:`-avaimeen.

---

## 6. Tulevaisuuden käyttötarkoitukset (ei toteuteta nyt)

Tunnistettu, mutta rajattu pois tästä ja seuraavasta sprintistä:

- **Toteutuneiden maksujen historia** — "milloin vuokra on maksettu viimeisen vuoden aikana".
- **Kuukausiraportit** — toteutuneiden tulojen/menojen summa kuukaudelta.
- **Poikkeamien tunnistus** — esim. vuokra maksettiin 850 € vaikka sääntö sanoo 800 €
  (mahdollista koska `amount` denormalisoidaan toteumaan, ei lueta säännöstä jälkikäteen).
- **Maksamattomien tunnistus** — kysely "onko rahavirralle X olemassa toteuma tälle
  kausiesiintymälle" → jos ei, se on yhä avoin.
- **Automaattinen kuittaus** — esim. pankki-integraatio loisi toteuman automaattisesti.
- **Analytiikka/trendit** — toteuma-aikasarja ajan yli.

Nämä eivät ohjaa v1-tietomallia muuta kuin siinä että kentät (`amount`, `direction`, `label`)
denormalisoidaan toteumaan eivätkä jää pelkäksi viittaukseksi — muuten poikkeama-analyysi tai
historia rikkoutuisi jos sääntöä muokataan tai se poistetaan myöhemmin.

---

## 7. Tietomalliehdotus

```js
{
  id,               // 'toteuma_' + Date.now(), oma pysyvä avain (store: toteumat)
  rahavirtaId,      // lähdesäännön pysyvä id (tulot_items/rytmi_items/tulevat_items)
  rahavirtaSource,  // 'tulot_items' | 'rytmi_items' | 'tulevat_items'
  instanceDate,     // 'YYYY-MM-DD' — mitä kalenteriesiintymää tämä vahvistaa
  executedAt,       // ISO-datetime — milloin KÄYTTÄJÄ vahvisti (audit-jälki)
  amount,           // signeerattu summa, snapshotoitu vahvistushetkellä (denormalisoitu)
  direction,        // 'income' | 'expense'
  label,            // denormalisoitu nimi (säilyy vaikka sääntö nimetään uudelleen/poistetaan)
}
```

**Kenttäkohtaiset perustelut:**

| Kenttä | Miksi |
|---|---|
| `id` | Storen oma pääavain, elinkaari irti säännöstä. |
| `rahavirtaId` + `rahavirtaSource` | Linkitys lähteeseen; molemmat tarvitaan koska pelkkä id ei ole taattu uniikki/vakaa (ks. kohta 5). |
| `instanceDate` | Erottaa saman säännön eri kuukauden esiintymät; muodostaa dedup-avaimen yhdessä `rahavirtaId`:n kanssa. |
| `executedAt` | Eri asia kuin `instanceDate` — esim. elokuun vuokra voidaan vahvistaa vasta 15.8. Tarvitaan tulevaa "maksettu myöhässä" -analytiikkaa varten. |
| `amount`, `direction`, `label` | Denormalisoitu tilannekuva vahvistushetkeltä — sama periaate kuin `sales`/`events`-storeissa jo tänään. Säilyttää historian oikeana vaikka sääntöä muokataan/poistetaan myöhemmin. |

**Tietoisesti pois jätetty:** `note`/kategoria/tili (kirjanpito-/budjettiominaisuus, vastoin
projektifilosofiaa), `confirmedBy` (yhden käyttäjän sovellus), soft-delete/undo-lippu
(v1-rajaus, sama kuin nykyisellä kertaluonteisen rivin poistolla ei ole peruutusta).

---

## 8. Regressioanalyysi

| Alue | Vaikutus | Peruste |
|---|---|---|
| Snapshot-ajattelu | Ei vaikutusta | `toteumat` elää oman storen sisällä, ei snapshotin carry-forward-kentissä. |
| Carry Forward | Ei vaikutusta | Uusi store ei ole osa `tulot_items`/`rytmi_items`/`tulevat_items`-kopiointia. |
| Hero | Ei vaikutusta | `heroSum()` ei lue toteumia (kohta 3). |
| Kassajakso | Ei vaikutusta | `buildKassajakso()`/`collectRahavirrat()` eivät suodata toteumien perusteella (kohta 3) — eksplisiittinen rajaus tälle sprintille. |
| Odote | Ei vaikutusta | Pelkkä Kassajakson render. |
| Supabase-synkronointi | Ei vaikutusta (tietoinen rajaus) | Päätetty laitekohtaiseksi v1:ssä, samaa mallia kuin `events`/`sales`/`pins` tänään. Ei vaadi muutoksia `sync2.js`:ään tässä vaiheessa. |
| Rahavirtojen id-eheys | Riski — vaatii esityön | Legacy-rivit ilman pysyvää `id`:tä (`idx:`-fallback) eivät kelpaa toteuman kohteeksi ilman `ensureRahavirtaIds`-migraation varmistamista ensin (kohta 5). |

---

## Käyttäjän hyväksymät päätökset (2026-07-27)

1. **Tallennuspaikka:** erillinen IndexedDB-store (`toteumat`) — hyväksytty.
2. **Synkronointi:** laitekohtainen v1:ssä, ei Supabase-synkronointia — hyväksytty.

---

## Seuraavan toteutussprintin tehtävälista

1. Lisää `toteumat`-object store `js/db.js`:ään (`keyPath: 'id'`, indeksi `date`→`instanceDate`),
   nosta `DB_VERSION`.
2. Varmista `ensureRahavirtaIds`-migraation kattavuus ennen minkään toteuman luomista.
3. Kirjoita `rahavirtaToteumaCreate(rahavirtaId, rahavirtaSource, instanceDate)` — lukee
   rahavirran nykyisen `amount`/`label`/suunnan, denormalisoi ne toteumaan, kirjoittaa storeen.
4. UI: "Merkitse maksetuksi" -toiminto Rahavirrat-listaan (erillinen, oma suunnittelu-/
   pre-commit-vaihe CLAUDE.md:n sprinttirakenteen mukaisesti — ei tässä dokumentissa).
