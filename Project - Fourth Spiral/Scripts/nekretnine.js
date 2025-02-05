function spojiNekretnine(divReferenca, instancaModula, tip_nekretnine) {
    // pozivanje metode za filtriranje
    const filtriraneNekretnine = instancaModula.filtrirajNekretnine({ tip_nekretnine: tip_nekretnine });

    // iscrtavanje elemenata u divReferenca element

    // Ciscenje svih elemenata liste
    divReferenca.innerHTML = '';

    if (filtriraneNekretnine.length === 0) {
        divReferenca.innerHTML = '<p>Trenutno nema dostupnih nekretnina ovoga tipa.</p>';
    } else {
        filtriraneNekretnine.forEach(nekretnina => {
            const nekretninaElement = document.createElement('div');
            if (tip_nekretnine === "Stan") {
                nekretninaElement.classList.add('nekretnina', 'stan');
                nekretninaElement.id = `${nekretnina.id}`;
            }
            else if (tip_nekretnine === "Kuća") {
                nekretninaElement.classList.add('nekretnina', 'kuca');
                nekretninaElement.id = `${nekretnina.id}`;
            }
            else {
                nekretninaElement.classList.add('nekretnina', 'pp');
                nekretninaElement.id = `${nekretnina.id}`;
            }

            // Added search and click count divs
            const pretrageDiv = document.createElement('div');
            pretrageDiv.id = `pretrage-${nekretnina.id}`;
            pretrageDiv.textContent = `pretrage: ${nekretnina.pretrage || 0}`;
            nekretninaElement.appendChild(pretrageDiv);

            const klikoviDiv = document.createElement('div');
            klikoviDiv.id = `klikovi-${nekretnina.id}`;
            klikoviDiv.textContent = `klikovi: ${nekretnina.klikovi || 0}`;
            nekretninaElement.appendChild(klikoviDiv);

            const slikaElement = document.createElement('img');
            slikaElement.classList.add('slika-nekretnine');
            slikaElement.src = `../Resources/${nekretnina.id}.jpg`;
            slikaElement.alt = nekretnina.naziv;
            nekretninaElement.appendChild(slikaElement);

            const detaljiElement = document.createElement('div');
            detaljiElement.classList.add('detalji-nekretnine');
            detaljiElement.innerHTML = `
                <h3>${nekretnina.naziv}</h3>
                <p>Kvadratura: ${nekretnina.kvadratura} m²</p>
            `;
            nekretninaElement.appendChild(detaljiElement);

            const cijenaElement = document.createElement('div');
            cijenaElement.classList.add('cijena-nekretnine');
            cijenaElement.innerHTML = `<p>Cijena: ${nekretnina.cijena} BAM</p>`;
            nekretninaElement.appendChild(cijenaElement);

            const detaljiDugme = document.createElement('a');
            //detaljiDugme.href = '../HTML/detalji.html'; // hardkodiran html
            detaljiDugme.classList.add('detalji-dugme');
            detaljiDugme.textContent = 'Detalji';
            detaljiDugme.addEventListener('click', function () {
                const idNekretnine = nekretnina.id;
                MarketingAjax.klikNekretnina(idNekretnine);
            });
            nekretninaElement.appendChild(detaljiDugme);

            // Dodavanje kreiranog elementa u divReferenci
            divReferenca.appendChild(nekretninaElement);
        });
    }
}

const listaNekretnina = []

const listaKorisnika = []

const divStan = document.getElementById("stan");
const divKuca = document.getElementById("kuca");
const divPp = document.getElementById("pp");

// Instanciranje modula
let nekretnine = SpisakNekretnina();

function dajParametar(param) {
    const urlParam = new URLSearchParams(window.location.search);
    return urlParam.get(param);
}
const lokacija = dajParametar('lokacija');

if (lokacija!=null)
PoziviAjax.getTop5Nekretnina(lokacija, (error, listaNekretnina) => {
    if (error) {
        console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
    } else {
        console.log(listaNekretnina);
        // Inicijalizacija modula sa dobavljenim podacima
        nekretnine.init(listaNekretnina, listaKorisnika);

        // Pozivamo funkciju za prikaz nekretnina
        spojiNekretnine(divStan, nekretnine, "Stan");
        spojiNekretnine(divKuca, nekretnine, "Kuća");
        spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
    }
});
else{
    PoziviAjax.getNekretnine((error, listaNekretnina) => {
        if (error) {
            console.error("Greška prilikom dohvatanja nekretnina sa servera:", error);
        } else {
            // Inicijalizacija modula sa dobavljenim podacima
            nekretnine.init(listaNekretnina, listaKorisnika);
    
            // Pozivamo funkciju za prikaz nekretnina
            spojiNekretnine(divStan, nekretnine, "Stan");
            spojiNekretnine(divKuca, nekretnine, "Kuća");
            spojiNekretnine(divPp, nekretnine, "Poslovni prostor");
        }
    });
}

function filtrirajNekretnine(filtriraneNekretnine) {
    const filtriraneNekretnineInstance = SpisakNekretnina();
    filtriraneNekretnineInstance.init(filtriraneNekretnine, listaKorisnika);

    spojiNekretnine(divStan, filtriraneNekretnineInstance, "Stan");
    spojiNekretnine(divKuca, filtriraneNekretnineInstance, "Kuća");
    spojiNekretnine(divPp, filtriraneNekretnineInstance, "Poslovni prostor");
}

let prethodniIds = [];
let intervalId = null;

function pokreniOsvjezavanje() {
    if (intervalId) clearInterval(intervalId);
    
    intervalId = setInterval(() => {
        const divNekretnine = document.getElementById('divNekretnine');
        const trenutniIds = Array.from(divNekretnine.querySelectorAll('.nekretnina'))
            .map(div => parseInt(div.id))
            .sort((a, b) => a - b); // Sortiramo da redoslijed ne utječe na usporedbu
        
        // Provjeri da li je došlo do promjene u prikazanim nekretninama
        const idsPromijenjeni = JSON.stringify(prethodniIds) !== JSON.stringify(trenutniIds);
        
        if (trenutniIds.length > 0 && idsPromijenjeni) {
            MarketingAjax.osvjeziPretrage(trenutniIds);
            MarketingAjax.osvjeziKlikove(trenutniIds);
            prethodniIds = [...trenutniIds];
        }
    }, 2000);
}

// Pozovi funkciju kada se stranica učita
window.addEventListener('load', pokreniOsvjezavanje);

// Pozovi funkciju nakon filtriranja
function filtrirajOnClick() {
    const kriterij = {
        min_cijena: parseFloat(document.getElementById('minCijena').value) || 0,
        max_cijena: parseFloat(document.getElementById('maxCijena').value) || Infinity,
        min_kvadratura: parseFloat(document.getElementById('minKvadratura').value) || 0,
        max_kvadratura: parseFloat(document.getElementById('maxKvadratura').value) || Infinity
    };

    const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij);

    MarketingAjax.novoFiltriranje(
        filtriraneNekretnine.map(nekretnina => nekretnina.id)
    );

    filtrirajNekretnine(filtriraneNekretnine);
    prethodniIds = []; // Resetiraj prethodne ID-eve da bi se osvježilo
}

document.getElementById('dugmePretraga').addEventListener('click', filtrirajOnClick);

function osvjeziKlikoveIPretrage() {
    const divNekretnine = document.getElementById('divNekretnine');
    const trenutniIds = Array.from(divNekretnine.querySelectorAll('.nekretnina'))
        .map(div => parseInt(div.id));

    if (trenutniIds.length > 0) {
        Promise.all([
            new Promise((resolve, reject) => {
                MarketingAjax.osvjeziPretrage(trenutniIds, (error, data) => {
                    if (error) {
                        console.error('Greška prilikom osvježavanja pretraga:', error);
                        reject(error);
                    } else {
                        console.log('Pretrage osvježene:', data);
                        resolve(data);
                    }
                });
            }),
            new Promise((resolve, reject) => {
                MarketingAjax.osvjeziKlikove(trenutniIds, (error, data) => {
                    if (error) {
                        console.error('Greška prilikom osvježavanja klikova:', error);
                        reject(error);
                    } else {
                        console.log('Klikovi osvježeni:', data);
                        resolve(data);
                    }
                });
            })
        ]).then(([pretrageData, klikoviData]) => {
            // Ažurirajte prikaz s podacima
        }).catch(error => {
            console.error('Greška prilikom osvježavanja podataka:', error);
        });
    }
}

window.addEventListener('load', osvjeziKlikoveIPretrage);

function prikaziDetaljeNekretnine(nekretninaId) {
    PoziviAjax.getNekretnina(nekretninaId, (error, nekretnina) => {
        if (error) {
            alert('Došlo je do greške pri učitavanju podataka. Pokušajte ponovo.');
            return;
        }

        // Prikaz detalja nekretnine
        console.log('Detalji nekretnine:', nekretnina);
        // Ažurirajte DOM elemente s podacima o nekretnini

        // Učitaj interesovanja
        PoziviAjax.getInteresovanja(nekretninaId, (error, interesovanja) => {
            if (error) {
                console.error('Greška prilikom dohvatanja interesovanja:', error);
            } else {
                console.log('Interesovanja:', interesovanja);
                // Ažurirajte DOM elemente s interesovanjima
            }
        });
    });
}