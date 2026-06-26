# Finance OS

## Repository

**GitHub:**
https://github.com/y64yfdb4w7-creator/talous

**Branch:**
main

Projekti käyttää tätä repositorya.
Älä käytä vanhaa finance-os-repositorya.

---

## Projektin tarkoitus

Finance OS ei ole kirjanpito-ohjelma.
Finance OS ei ole budjettisovellus.
Finance OS on päivittäinen taloudellinen snapshot.

Käyttäjän pitää ymmärtää taloudellinen tilanteensa yhdellä silmäyksellä.

---

## Projektifilosofia

Finance OS ei ole kirjanpito-ohjelma.
Finance OS ei ole budjettisovellus.
Finance OS perustuu päivittäiseen snapshot-ajatteluun.

Yksi päivän snapshot kertoo enemmän kuin pitkä tapahtumalista.

Kaikki uudet ominaisuudet arvioidaan tämän periaatteen mukaan.

Jos ominaisuus tukee snapshot-ajattelua, se kuuluu Finance OS:ään.

Jos ominaisuus vie sovellusta kohti tapahtumakirjanpitoa tai budjetointia,
sitä ei toteuteta ilman erillistä suunnittelupäätöstä.

---

## Vastuunjako

**ChatGPT** toimii projektin suunnittelijana.
**Claude** toimii toteuttajana.

Claude EI tee omia suunnittelupäätöksiä.
Jos suunnitelma on epäselvä, Claude pysähtyy ja kysyy.

---

## Työskentelytapa

Yksi sprintti. Yksi tavoite.

- Ei refaktorointia ilman lupaa.
- Ei ylimääräisiä parannuksia.
- Ei "samalla korjataan…"

Jokainen sprintti sisältää:

1. Auditointi
2. Suunnittelupäätös
3. Pre-commit
4. Toteutus
5. Lopputarkastus
6. Commit

---

## Visual Language

Projektissa käytetään hyväksyttyä **Finance OS Visual Language 1.0**.
Kaikkien käyttöliittymämuutosten tulee noudattaa sitä.

---

## Tärkeimmät tiedostot

- `index.html`
- `js/ui2-v2.js`
- `js/sync2.js`

---

## Commitit

Yksi sprintti = yksi commit.

Commit tehdään vasta kun:

- toteutus on valmis
- toiminta on testattu
- käyttäjä on hyväksynyt muutoksen

---

## Tärkein sääntö

Finance OS:ssa **vähemmän on enemmän**.

Jos elementti ei lisää käyttäjän ymmärrystä, älä lisää sitä.

Jos ehdotettu muutos ei paranna käyttöliittymää käyttäjän silmin,
älä toteuta sitä. Raportoi siitä ensin.

---

## Ennen toteutusta

Ennen kuin kirjoitat yhtään koodia, arvioi aina:

1. Onko kyse bugista vai uudesta ominaisuudesta?
2. Onko kyse suunnittelusta vai toteutuksesta?
3. Onko muutos hyväksytty nykyiseen sprinttiin?
4. Voiko muutos rikkoa olemassa olevaa toimintaa?

Jos jokin kohta on epäselvä, pysähdy.

Raportoi havaintosi.

Odota hyväksyntä ennen toteutusta.

Älä tee suunnittelupäätöksiä käyttäjän puolesta.
