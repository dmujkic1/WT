const PoziviAjax = (() => {

    // fnCallback se u svim metodama poziva kada stigne
    // odgovor sa servera putem Ajax-a
    // svaki callback kao parametre ima error i data,
    // error je null ako je status 200 i data je tijelo odgovora
    // ako postoji greška, poruka se prosljeđuje u error parametru
    // callback-a, a data je tada null

    function ajaxRequest(method, url, data, callback) {
        const xhr = new XMLHttpRequest();
        xhr.open(method, url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    callback(null, xhr.responseText);
                } else {
                    callback({ status: xhr.status, statusText: xhr.statusText }, null);
                }
            }
        };
        xhr.send(data ? JSON.stringify(data) : null);
    }

    // vraća korisnika koji je trenutno prijavljen na sistem
    function impl_getKorisnik(fnCallback) {
        let ajax = new XMLHttpRequest();

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4) {
                if (ajax.status == 200) {
                    console.log('Uspješan zahtjev, status 200');
                    fnCallback(null, JSON.parse(ajax.responseText));
                } else if (ajax.status == 401) {
                    console.log('Neuspješan zahtjev, status 401');
                    fnCallback("error", null);
                } else {
                    console.log('Nepoznat status:', ajax.status);
                }
            }
        };

        ajax.open("GET", "http://localhost:3000/korisnik/", true);
        ajax.setRequestHeader("Content-Type", "application/json");
        ajax.send();
    }

    // ažurira podatke loginovanog korisnika
    function impl_putKorisnik(noviPodaci, fnCallback) {
        ajaxRequest('PUT', '/korisnik', noviPodaci, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const response = JSON.parse(data);
                    fnCallback(null, response);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    // dodaje novi upit za trenutno loginovanog korisnika
    function impl_postUpit(nekretnina_id, tekst_upita, fnCallback) {
        const data = {
            nekretnina_id: nekretnina_id,
            tekst_upita: tekst_upita
        };

        ajaxRequest('POST', '/upit', data, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const response = JSON.parse(data);
                    fnCallback(null, response);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getNekretnine(fnCallback) {
        // Koristimo AJAX poziv da bismo dohvatili podatke s servera
        ajaxRequest('GET', '/nekretnine', null, (error, data) => {
            // Ako se dogodi greška pri dohvaćanju podataka, proslijedi grešku kroz callback
            if (error) {
                fnCallback(error, null);
            } else {
                // Ako su podaci uspješno dohvaćeni, parsiraj JSON i proslijedi ih kroz callback
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    // Ako se dogodi greška pri parsiranju JSON-a, proslijedi grešku kroz callback
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getNekretnina(nekretnina_id, fnCallback) {
        ajaxRequest('GET', `/nekretnina/${nekretnina_id}`, null, (error, data) => {
            if (error) {
                console.error('Greška prilikom dohvatanja detalja nekretnine:', error);
                fnCallback(error, null);
            } else {
                try {
                    const nekretnina = JSON.parse(data);
                    fnCallback(null, nekretnina);
                } catch (parseError) {
                    console.error('Greška prilikom parsiranja podataka:', parseError);
                    fnCallback(parseError, null);
                }
            }
        });
    }
    

    function impl_postLogin(username, password, fnCallback) {
        var ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/login", true)
        ajax.setRequestHeader("Content-Type", "application/json")
        var objekat = {
            "username": username,
            "password": password
        }
        forSend = JSON.stringify(objekat)
        ajax.send(forSend)
    }

    function impl_postLogout(fnCallback) {
        let ajax = new XMLHttpRequest()

        ajax.onreadystatechange = function () {
            if (ajax.readyState == 4 && ajax.status == 200) {
                fnCallback(null, ajax.response)
            }
            else if (ajax.readyState == 4) {
                //desio se neki error
                fnCallback(ajax.statusText, null)
            }
        }
        ajax.open("POST", "http://localhost:3000/logout", true)
        ajax.send()
    }

    //ZADATAK 2 METODE
    function impl_getTop5Nekretnina(lokacija, fnCallback) {
        const url = `/nekretnine/top5?lokacija=${encodeURIComponent(lokacija)}`;
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const nekretnine = JSON.parse(data);
                    fnCallback(null, nekretnine);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    function impl_getMojiUpiti(fnCallback) {
        const url = '/upiti/moji';
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }

    //GET NEKRETNINA URADIO PRIJE ZA DINAMICKO POPUNJAVANJE DETALJI.HTML

    function impl_getNextUpiti(nekretnina_id, page, fnCallback) {
        const url = `/next/upiti/nekretnina${nekretnina_id}?page=${page}`;
        ajaxRequest('GET', url, null, (error, data) => {
            if (error) {
                fnCallback(error, null);
            } else {
                try {
                    const upiti = JSON.parse(data);
                    fnCallback(null, upiti);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            }
        });
    }
    

    // GET /nekretnina/:id/interesovanja
function impl_getInteresovanja(nekretninaId, fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                try {
                    const interesovanja = JSON.parse(ajax.responseText);
                    fnCallback(null, interesovanja);
                } catch (parseError) {
                    fnCallback(parseError, null);
                }
            } else {
                fnCallback(ajax.statusText, null);
            }
        }
    };

    ajax.open("GET", `http://localhost:3000/nekretnina/${nekretninaId}/interesovanja`, true);
    ajax.send();
}

// POST /nekretnina/:id/zahtjev
function impl_postZahtjev(nekretninaId, tekst, trazeniDatum, fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 201) {
                fnCallback(null, ajax.responseText);
            } else {
                fnCallback(ajax.statusText, null);
            }
        }
    };

    ajax.open("POST", `http://localhost:3000/nekretnina/${nekretninaId}/zahtjev`, true);
    ajax.setRequestHeader("Content-Type", "application/json");

    const body = JSON.stringify({ tekst: tekst, trazeniDatum: trazeniDatum });
    ajax.send(body);
}

// PUT /nekretnina/:id/zahtjev/:zid
function impl_putZahtjev(nekretninaId, zahtjevId, odobren, addToTekst, fnCallback) {
    let ajax = new XMLHttpRequest();

    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 200) {
                fnCallback(null, ajax.responseText);
            } else {
                fnCallback(ajax.statusText, null);
            }
        }
    };

    ajax.open("PUT", `http://localhost:3000/nekretnina/${nekretninaId}/zahtjev/${zahtjevId}`, true);
    ajax.setRequestHeader("Content-Type", "application/json");

    const body = JSON.stringify({ odobren: odobren, addToTekst: addToTekst });
    ajax.send(body);
}

function impl_postPonuda(nekretninaId, tekst, ponudaCijene, datumPonude, idVezanePonude, odbijenaPonuda, fnCallback) {
    let ajax = new XMLHttpRequest();

    // Priprema podataka za slanje
    let data = JSON.stringify({
        tekst: tekst,
        ponudaCijene: ponudaCijene,
        datumPonude: datumPonude,
        idVezanePonude: idVezanePonude,
        odbijenaPonuda: odbijenaPonuda
    });

    console.log('Sending data:', data); // Debug
    
    // Definisanje ponašanja kada se dobije odgovor sa servera
    ajax.onreadystatechange = function () {
        if (ajax.readyState == 4) {
            if (ajax.status == 201) {
                fnCallback(null, JSON.parse(ajax.responseText));
            } else {
                console.error('Error response:', ajax.responseText); // Log the error response
                fnCallback(ajax.statusText, null);
            }
        }
    };

    // Otvaranje POST zahtjeva i slanje podataka na server
    ajax.open("POST", `http://localhost:3000/nekretnina/${nekretninaId}/ponuda`, true);
    ajax.setRequestHeader("Content-Type", "application/json");
    ajax.send(data);
}


    return {
        postLogin: impl_postLogin,
        postLogout: impl_postLogout,
        getKorisnik: impl_getKorisnik,
        putKorisnik: impl_putKorisnik,
        postUpit: impl_postUpit,
        getNekretnine: impl_getNekretnine,
        getNekretnina: impl_getNekretnina,
        getTop5Nekretnina: impl_getTop5Nekretnina,
        getMojiUpiti: impl_getMojiUpiti,
        getNextUpiti: impl_getNextUpiti,
        getInteresovanja: impl_getInteresovanja,
        postZahtjev: impl_postZahtjev,
        putZahtjev: impl_putZahtjev,
        postPonuda: impl_postPonuda
        };
})();