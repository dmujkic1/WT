window.appData = {
    glavniElement: null,
    sviElementi: [],
    carousel: null,
    lijevoDugmeListener: null,
    desnoDugmeListener: null,
    trenutniIndeks: 0,
    trenutnaNekretnina: null,
    trenutniKorisnik: null
};

window.onload = function () {
    const glavniElement = document.querySelector('#upiti');
    const urlParams = new URLSearchParams(window.location.search);
    const idNekretnine = urlParams.get('id');

    if (!idNekretnine) {
        console.error("ID nekretnine nije definisan u URL-u.");
        return;
    }

    PoziviAjax.getKorisnik((error, korisnik) => {
        window.appData.trenutniKorisnik = korisnik;
        setupFormaInteresovanja(idNekretnine);
    });

    // Učitavanje osnovnih podataka o nekretnini
    PoziviAjax.getNekretnina(idNekretnine, (error, nekretnina) => {
        if (error) {
            console.error("Greška prilikom dohvaćanja podataka o nekretnini:", error);
            alert("Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.");
            return;
        }

        // Popunjavanje detalja nekretnine
        window.appData.trenutnaNekretnina = nekretnina;
        popuniDetaljeNekretnine(nekretnina);

        // Učitavanje interesovanja
        PoziviAjax.getInteresovanja(idNekretnine, (error, interesovanja) => {
            if (error) {
                console.error("Greška prilikom dohvaćanja interesovanja:", error);
                return;
            }

            // Prikaz interesovanja u carouselu
            postaviInteresovanjaUCarousel(glavniElement, interesovanja);
        });
    });
};

function setupFormaInteresovanja(idNekretnine) {
    const forma = document.getElementById('nova-interesovanja-forma');
    const tipSelect = document.getElementById('tip-interesovanja');
    const ponudaPodaci = document.getElementById('ponuda-podaci');
    const idPonudeSelect = document.getElementById('id-ponude');
    const tekstInput = document.getElementById('tekst');
    const trazeniDatumInput = document.getElementById('trazeni-datum-input');
    const ponudaCijeneInput = document.getElementById('ponuda-cijene-input');

    // Handle form type changes
    tipSelect.addEventListener('change', function() {
        const selectedType = this.value;
        ponudaPodaci.style.display = selectedType === 'ponuda' ? 'block' : 'none';
        trazeniDatumInput.parentElement.style.display = selectedType === 'zahtjev' ? 'block' : 'none';
        ponudaCijeneInput.parentElement.style.display = selectedType === 'ponuda' ? 'block' : 'none';

        if (selectedType === 'ponuda') {
            updatePonudeDropdown(idNekretnine);
        }
    });

    // Handle form submission
    forma.addEventListener('submit', function(e) {
        e.preventDefault();
        const tekst = tekstInput.value;
        const tip = tipSelect.value;

        switch(tip) {
            case 'upit':
                PoziviAjax.postUpit(idNekretnine, tekst, handleResponse);
                break;
            case 'zahtjev':
                const trazeniDatum = trazeniDatumInput.value;
                PoziviAjax.postZahtjev(idNekretnine, tekst, trazeniDatum, handleResponse);
                break;
            case 'ponuda':
                const ponudaCijene = ponudaCijeneInput.value;
                const idVezanePonude = idPonudeSelect.value || null;
                const datumPonude = new Date().toISOString();
                PoziviAjax.postPonuda(
                    idNekretnine,
                    tekst,
                    ponudaCijene,
                    datumPonude,
                    idVezanePonude,
                    false,
                    handleResponse
                );
                break;
        }
    });
}

function updatePonudeDropdown(idNekretnine) {
    const idPonudeSelect = document.getElementById('id-ponude');
    idPonudeSelect.innerHTML = '<option value="">Učitavanje ponuda...</option>';

    PoziviAjax.getInteresovanja(idNekretnine, (error, interesovanja) => {
        if (error) {
            console.error("Greška pri dohvatanju interesovanja:", error);
            return;
        }

        const ponude = interesovanja.filter(i => i.cijenaPonude !== undefined);
        idPonudeSelect.innerHTML = ''; // Clear loading message

        if (window.appData.trenutniKorisnik) {
            const relevantPonude = window.appData.trenutniKorisnik.admin ? 
                ponude : 
                ponude.filter(p => p.korisnik_id === window.appData.trenutniKorisnik.id);

            if (relevantPonude.length > 0) {
                idPonudeSelect.disabled = false;
                relevantPonude.forEach(ponuda => {
                    const option = document.createElement('option');
                    option.value = ponuda.id;
                    option.textContent = `Ponuda ${ponuda.id} - ${ponuda.cijenaPonude} KM`;
                    idPonudeSelect.appendChild(option);
                });
            } else {
                idPonudeSelect.disabled = true;
                idPonudeSelect.innerHTML = '<option value="">Nema dostupnih ponuda</option>';
            }
        } else {
            idPonudeSelect.disabled = true;
            idPonudeSelect.innerHTML = '<option value="">Morate biti prijavljeni</option>';
        }
    });
}

function handleResponse(error, response) {
    if (error) {
        alert('Došlo je do greške: ' + error);
        return;
    }
    location.reload();
}

function postaviInteresovanjaUCarousel(glavniElement, interesovanja) {
    // Kreiraj elemente za interesovanja
    const interesovanjaElementi = interesovanja.map((interesovanje) => {
        const div = document.createElement('div');
        div.className = 'interesovanje';

        if (interesovanje.id) {
            div.innerHTML += `
                <p><strong>ID interesovanja:</strong> ${interesovanje.id}</p>
            `;
        }

        if (interesovanje.korisnik_id) {
            div.innerHTML += `
                <p><strong>ID korisnika:</strong> ${interesovanje.korisnik_id}</p>
            `;
        }

        if (interesovanje.tekst) {
            div.innerHTML += `
                <p><strong>Tekst:</strong> ${interesovanje.tekst}</p>
            `;
        }

        if (interesovanje.cijenaPonude !== undefined) {
            div.innerHTML += `
                <p><strong>Cijena ponude:</strong> ${interesovanje.cijenaPonude} KM</p>
            `;
        }

        if (interesovanje.trazeniDatum) {
            div.innerHTML += `
                <p><strong>Traženi datum:</strong> ${interesovanje.trazeniDatum}</p>
            `;
        }

        if (interesovanje.odobren !== undefined) {
            div.innerHTML += `
                <p><strong>Status:</strong> ${interesovanje.odobren ? 'Odobren' : 'Nije odobren'}</p>
            `;
        }

        return div;
    });

    // Postavi carousel s interesovanjima
    if (interesovanjaElementi.length > 0) {
        window.appData.carousel = postaviCarousel(glavniElement, interesovanjaElementi);

        // Postavi event listenere za carousel navigaciju
        const lijevoDugme = document.querySelector('#carousel-navigation button:first-child');
        const desnoDugme = document.querySelector('#carousel-navigation button:last-child');

        lijevoDugme.addEventListener("click", () => window.appData.carousel.fnLijevo());
        desnoDugme.addEventListener("click", () => window.appData.carousel.fnDesno());
    } else {
        glavniElement.innerHTML = '<p>Nema interesovanja za ovu nekretninu.</p>';
    }
}

function popuniDetaljeNekretnine(nekretnina) {
    const slikaElement = document.querySelector('#osnovno #slika-nekretnine');
    slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
    slikaElement.alt = nekretnina.naziv;

    document.querySelector('#osnovno p:nth-of-type(1)').textContent = `Naziv: ${nekretnina.naziv}`;
    document.querySelector('#osnovno p:nth-of-type(2)').textContent = `Kvadratura: ${nekretnina.kvadratura}`;
    document.querySelector('#osnovno p:nth-of-type(3)').textContent = `Cijena: ${nekretnina.cijena}`;

    const lokacijaElement = document.querySelector('#kolona1 p:nth-of-type(2)');
    const lokacijaLink = document.createElement('a');
    lokacijaLink.href = `nekretnine.html?lokacija=${encodeURIComponent(nekretnina.lokacija)}`;
    lokacijaLink.textContent = nekretnina.lokacija;
    lokacijaLink.style.color = 'blue';
    lokacijaLink.style.textDecoration = 'underline';
    lokacijaElement.textContent = 'Lokacija: ';
    lokacijaElement.appendChild(lokacijaLink);

    document.querySelector('#kolona2 p:nth-of-type(1)').textContent = `Godina izgradnje: ${nekretnina.godina_izgradnje}`;
    document.querySelector('#kolona2 p:nth-of-type(2)').textContent = `Datum objave oglasa: ${nekretnina.datum_objave}`;
    document.querySelector('#opis p').textContent = `Opis: ${nekretnina.opis}`;
}