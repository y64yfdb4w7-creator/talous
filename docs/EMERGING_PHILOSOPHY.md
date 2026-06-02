# EMERGING_PHILOSOPHY.md
# Finance OS — Kehittyvä suunta

**Tila:** Suunnan kuvaus. Ei validoitu pitkäaikaisessa käytössä.
**Viimeksi päivitetty:** 2026-06-02
**Nostettavissa:** docs/FINANCE_OS_PHILOSOPHY.md — kun käyttö vahvistaa havainnot.

---

## Nykyinen käytännön todellisuus

Finance OS on tällä hetkellä:

- **Dashboard** = päivittäinen orientaatio. Toimii. On käytössä.
- **Päiväkirja** = kehittyvä ensisijainen artefakti. Rakenne oikea, sisältö ohuempi kuin tavoite.
- **Snapshot** = tallennus. Itsenäinen tilannekuva, ei transaktio.

Tämä ei ole vielä:

- Dashboard = toissijainen
- Päiväkirja = koko sovellus

Kehityssuunta kulkee kohti jälkimmäistä, mutta muutos tapahtuu käytön kautta, ei arkkitehtuuripäätöksellä.

---

## Ydinidea: raha pysyvänä signaalina

Finance OS ei ensisijaisesti mittaa varallisuutta.
Se käyttää rahaa pysyvänä signaalina, jonka avulla käyttäjä voi ymmärtää omaa elämäänsä ajan läpi.

**Tavoite ei ole optimointi.**
Tavoite on orientaatio, muisti ja ymmärrys.

Päivän pitäisi vastata kolmeen kysymykseen:

1. Missä olin?
2. Mitä muuttui?
3. Miksi se muuttui?

Ei pelkästään:

- Kuinka paljon minulla oli?

---

## Tietohierarkia — päivittäinen taso

| Taso | Mittari | Peruste |
|------|---------|---------|
| 1. | Kassa | Käyttäjä operoi elämää käteisen kautta |
| 2. | Sijoitukset | Kehitys näkyy sijoitusten kautta |
| 3. | Lainat | Rajoitteet ymmärretään velan kautta |
| 4. | Netto | Kontekstuaalinen tieto, ei päivittäinen ohjasmittari |

Netto on toissijainen. Se kuuluu syvyystasolle, ei pääriville.

---

## Päiväkirja ensisijaisena artefaktina — hypoteesi

Tämä on kehittyvä havainto, ei validoitu totuus.

Havaittu suunta:

- Kassa-depth (inline expand) toimii käytännössä — ei popupeja, ei modaaleja
- Päivärivi MA 01.06 | Kassa | Sijoitukset | Lainat on oikea hierarkia
- pk-bar (visuaalinen suhde Tulotili/OP Gold) on oikea instinkti: kertoo tilan, ei sijainnin
- Netto on depth-tasolla Päiväkirjassa — tämä on oikein

**Mitä ei vielä tiedetä:**

- Onko muistiinpano (note) tarpeeksi keskeinen — vai onko se edelleen visuaalisesti jalansija?
- Voiko Päiväkirja korvata Dashboardin päivittäisenä aloitusnäkymänä?
- Miten elämäntapahtumat (työnvaihto, remontti, laina päättyi) integroituvat taloudellisiin hetkiin?

---

## Mitä ei pitäisi tehdä

- Nostaa Nettoa takaisin pääriville
- Lisätä modaaleja tai erillisiä näkymiä Päiväkirjaan
- Rakentaa transaktiopohjaista historiaa snapshot-arkkitehtuurin päälle
- Korvata visuaalisia suhteita (pk-bar) numeroilla

---

## Suunnitteluperiaate (tämänhetkinen)

> Reitti on tärkeämpi kuin sijainti.
> Kehitys on tärkeämpi kuin yksittäinen summa.
> Merkitys on tärkeämpi kuin mittari.
> Elämäntapahtumat ovat yhtä tärkeitä kuin numerot.

Numero on koordinaatti. Muistiinpano on se, miksi olit siellä.
