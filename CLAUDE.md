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
- - Ei ylimääräisiä parannuksia.
  - - Ei "samalla korjataan…"
   
    - Jokainen sprintti sisältää:
   
    - 1. Auditointi
      2. 2. Suunnittelupäätös
         3. 3. Pre-commit
            4. 4. Toteutus
               5. 5. Lopputarkastus
                  6. 6. Commit
                    
                     7. ---
                    
                     8. ## Visual Language
                    
                     9. Projektissa käytetään hyväksyttyä **Finance OS Visual Language 1.0**.
                     10. Kaikkien käyttöliittymämuutosten tulee noudattaa sitä.
                    
                     11. ---
                    
                     12. ## Tärkeimmät tiedostot
                    
                     13. - `index.html`
                         - - `js/ui2-v2.js`
                           - - `js/sync2.js`
                            
                             - ---

                             ## Commitit

                             Yksi sprintti = yksi commit.

                             Commit tehdään vasta kun:
                             - toteutus on valmis
                             - - toiminta on testattu
                               - - käyttäjä on hyväksynyt muutoksen
                                
                                 - ---

                                 ## Tärkein sääntö

                                 Finance OS:ssa **vähemmän on enemmän**.

                                 Jos elementti ei lisää käyttäjän ymmärrystä, älä lisää sitä.

                                 Jos ehdotettu muutos ei paranna käyttöliittymää käyttäjän silmin,
                                 älä toteuta sitä. Raportoi siitä ensin.

                                 ---

                                 ## Ennen toteutusta

                                 Ennen kuin kirjoitat yhtään koodia, arvioi aina:

                                 1. Onko kyse bugista vai uudesta ominaisuudesta?
                                 2. 2. Onko kyse suunnittelusta vai toteutuksesta?
                                    3. 3. Onko muutos hyväksytty nykyiseen sprinttiin?
                                       4. 4. Voiko muutos rikkoa olemassa olevaa toimintaa?
                                         
                                          5. Jos jokin kohta on epäselvä, pysähdy.
                                         
                                          6. Raportoi havaintosi.
                                         
                                          7. Odota hyväksyntä ennen toteutusta.
                                         
                                          8. Älä tee suunnittelupäätöksiä käyttäjän puolesta.
