window.appData = {
    glavniElement: null,
    sviElementi: [],
    carousel: null,
    lijevoDugmeListener: null,
    desnoDugmeListener: null,
    trenutnaStranica: 0, // Praćenje trenutne stranice upita
    sviUpitiUcitaj: true, // Flag koji označava da li treba nastaviti učitavanje
    trenutniIndeks: 0,
};

window.onload = function () {
    const glavniElement = document.querySelector('#upiti');

    function popuniDetaljeNekretnine(nekretnina) {
        // Popunjavanje osnovnih podataka
        const slikaElement = document.querySelector('#osnovno #slika-nekretnine');
        slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
        slikaElement.alt = nekretnina.naziv;
        //const brojStranicaZaUcitati = nekretnina.upiti.length-2; console.log("Broj stranica je ",brojStranicaZaUcitati);

        document.querySelector('#osnovno p:nth-of-type(1)').textContent = `Naziv: ${nekretnina.naziv}`;
        document.querySelector('#osnovno p:nth-of-type(2)').textContent = `Kvadratura: ${nekretnina.kvadratura}`;
        document.querySelector('#osnovno p:nth-of-type(3)').textContent = `Cijena: ${nekretnina.cijena}`;

        // Popunjavanje dodatnih informacija
        document.querySelector('#kolona1 p:nth-of-type(1)').textContent = `Tip grijanja: ${nekretnina.tip_grijanja}`;
        //document.querySelector('#kolona1 p:nth-of-type(2)').textContent = `Lokacija: ${nekretnina.lokacija}`;
        // Lokacija kao klikabilni link
        const lokacijaElement = document.querySelector('#kolona1 p:nth-of-type(2)');
        const lokacijaLink = document.createElement('a');
        lokacijaLink.href = `nekretnine.html?lokacija=${encodeURIComponent(nekretnina.lokacija)}`;
        lokacijaLink.textContent = nekretnina.lokacija;
        lokacijaLink.style.color = 'blue'; // Stiliziranje linka
        lokacijaLink.style.textDecoration = 'underline'; // Podcrtavanje za izgled linka
        lokacijaElement.textContent = 'Lokacija: ';
        lokacijaElement.appendChild(lokacijaLink);

        document.querySelector('#kolona2 p:nth-of-type(1)').textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;
        document.querySelector('#kolona2 p:nth-of-type(2)').textContent = `Datum objave oglasa: ${nekretnina.datum_objave}`;

        // Popunjavanje opisa
        document.querySelector('#opis p').textContent = `Opis: ${nekretnina.opis}`;

        // Dinamičko popunjavanje upita
        window.appData.sviElementi = nekretnina.upiti.map(upit => {
            const upitElement = document.createElement('div');
            upitElement.classList.add('upit');
            upitElement.textContent = upit.tekst_upita;
            return upitElement;
        });

        inicijalizirajCarouselAkoJePotrebno(nekretnina.id);
    }

    function inicijalizirajCarouselAkoJePotrebno(nekretninaId) {
        const carouselNavigation = document.querySelector("#carousel-navigation");

        if (!window.appData.glavniElement) window.appData.glavniElement = glavniElement;

        if (!window.appData.carousel) {
            window.appData.carousel = postaviCarousel(
                window.appData.glavniElement,
                window.appData.sviElementi
            );

            // Proširujemo funkciju fnDesno da provjerimo učitavanje
            const originalFnDesno = window.appData.carousel.fnDesno;
            window.appData.carousel.fnDesno = function () {
                /* window.appData.trenutniIndeks = window.appData.sviElementi.findIndex(
                    el => el.outerHTML === glavniElement.innerHTML
                ); */
                window.appData.trenutniIndeks++;
                const posljednjiIndeks = window.appData.sviElementi.length - 1;

                // **Dodana provjera prije poziva**
                if (!window.appData.sviUpitiUcitaj) {
                    console.log("Više nema novih upita za učitavanje – preskakanje dodatnog poziva.");
                    originalFnDesno();
                    return;
                }

                if (window.appData.trenutniIndeks > posljednjiIndeks) {
                    window.appData.sviUpitiUcitaj = false; //PRIVREMENO FALSE
                    window.appData.trenutnaStranica++;
                    console.log("Pozivanje impl_getNextUpiti za sljedeću stranicu:", window.appData.trenutnaStranica);

                    PoziviAjax.getNextUpiti(nekretninaId, window.appData.trenutnaStranica, (error, noviUpiti) => {
                        if (error) {
                            console.error("Greška pri učitavanju sljedećih upita:", error);
                            if (error.status === 404) {
                                console.log("Nema više upita za učitavanje.");
                                window.appData.sviUpitiUcitaj = false;
                            }
                            return;
                        }

                        if (noviUpiti && noviUpiti.length > 0) {
                            noviUpiti.forEach(upit => {
                                const upitElement = document.createElement('div');
                                upitElement.classList.add('upit');
                                upitElement.textContent = upit.tekst_upita;
                                window.appData.sviElementi.push(upitElement);
                            });

                        window.appData.sviUpitiUcitaj = true; // PRIVREMENO TRUE NAZAD
                        } else {
                            // Više nema novih upita za učitavanje
                            console.log("Svi upiti su učitani.");
                            window.appData.sviUpitiUcitaj = false;
                        }

                        // Nastavi carousel nakon dodavanja novih elemenata
                        originalFnDesno();
                    });
                } else {
                    originalFnDesno();
                }
            };
        }

        if (carouselNavigation) {
            const lijevoDugme = carouselNavigation.querySelector("button:nth-child(1)");
            const desnoDugme = carouselNavigation.querySelector("button:nth-child(2)");

            if (window.appData.lijevoDugmeListener) {
                lijevoDugme.removeEventListener("click", window.appData.lijevoDugmeListener);
            }
            if (window.appData.desnoDugmeListener) {
                desnoDugme.removeEventListener("click", window.appData.desnoDugmeListener);
            }

            window.appData.lijevoDugmeListener = function () {
                console.log("Lijevo dugme kliknuto!");
                window.appData.carousel.fnLijevo();
                window.appData.trenutniIndeks--;
                if (window.appData.trenutniIndeks<0) window.appData.trenutniIndeks=window.appData.sviElementi.length - 1;
            };
            window.appData.desnoDugmeListener = function () {
                console.log("Desno dugme kliknuto!");
                window.appData.carousel.fnDesno();
            };

            lijevoDugme.addEventListener("click", window.appData.lijevoDugmeListener);
            desnoDugme.addEventListener("click", window.appData.desnoDugmeListener);
        }
    }

    const urlParams = new URLSearchParams(window.location.search);
    const idNekretnine = urlParams.get('id');

    if (!idNekretnine) {
        console.error("ID nekretnine nije definisan u URL-u.");
        return;
    }

    PoziviAjax.getNekretnina(idNekretnine, (error, nekretnina) => {
        if (error) {
            console.error("Greška prilikom dohvaćanja podataka o nekretnini:", error);
            alert("Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.");
            return;
        }
        popuniDetaljeNekretnine(nekretnina);
    });
};