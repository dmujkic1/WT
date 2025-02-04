const MarketingAjax = (() => {

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

    function updateDivElements(nizNekretnina, tip) {
        // Provjeri da li postoji svojstvo "nizNekretnina" u odgovoru
        if (nizNekretnina && nizNekretnina.nizNekretnina && Array.isArray(nizNekretnina.nizNekretnina)) {
            const praviNizNekretnina = nizNekretnina.nizNekretnina;
            praviNizNekretnina.forEach(nekretnina => {
                const id = nekretnina.id;
                const divId = `${tip}-${id}`;
                const divElement = document.getElementById(divId);
                if (divElement) {
                    divElement.textContent = `${tip}: ${nekretnina[tip] || 0}`;
                }
            });
        } else {
            console.error('Neispravan format odgovora.');
        }
    }

    let globalniNizNekretninaPretrage = [-1];
    let globalniNizNekretninaKlikovi = [-1];

    function impl_osvjeziPretrage(divNekretnine) {
        // Izdvajamo sve brojevne vrednosti iz ID-eva div-ova u divNekretnine
        let nizNekretnina = [];
        divNekretnine.querySelectorAll('[id^="pretrage-"]').forEach((div) => {
            const id = div.id.replace('pretrage-', '');
            nizNekretnina.push(parseInt(id, 10));
        });

        if (globalniNizNekretninaPretrage.includes(-1)) {
            // Ako globalniNizNekretninaPretrage sadrži -1, zamijeni ga sa svim elementima iz nizNekretnina
            globalniNizNekretninaPretrage = nizNekretnina;
        } else {
            // Ako globalniNizNekretninaPretrage ne sadrži -1, izbaci elemente iz nizNekretnina koji se nalaze u globalniNizNekretninaPretrage
            nizNekretnina = nizNekretnina.filter(element => !globalniNizNekretninaPretrage.includes(element));            
        }

        const requestBody = { nizNekretnina };

        ajaxRequest('POST', '/marketing/osvjezi/pretrage', requestBody, (error, data) => {
            if (!error) {
                const nizNekretnina = JSON.parse(data);
                updateDivElements(nizNekretnina, 'pretrage');
            }
        });
    }



    function impl_osvjeziKlikove(divNekretnine) {
        // Izdvajamo sve brojevne vrednosti iz ID-eva div-ova u divNekretnine
        let nizNekretnina = [];
        divNekretnine.querySelectorAll('[id^="klikovi-"]').forEach((div) => {
            const id = div.id.replace('klikovi-', '');
            nizNekretnina.push(parseInt(id, 10));
        });

        if (globalniNizNekretninaKlikovi.includes(-1)) {
            // Ako globalniNizNekretninaPretrage sadrži -1, zamijeni ga sa svim elementima iz nizNekretnina
            globalniNizNekretninaKlikovi = nizNekretnina;
        } else {
            // Ako globalniNizNekretninaPretrage ne sadrži -1, izbaci elemente iz nizNekretnina koji se nalaze u globalniNizNekretninaPretrage
            nizNekretnina = nizNekretnina.filter(element => !globalniNizNekretninaKlikovi.includes(element));            
        }

        const requestBody = { nizNekretnina };

        ajaxRequest('POST', '/marketing/osvjezi/klikovi', requestBody, (error, data) => {
            if (!error) {
                const nizNekretnina = JSON.parse(data);
                updateDivElements(nizNekretnina, 'klikovi');
            }
        });
    }

    function impl_novoFiltriranje(listaFiltriranihNekretnina) {
        const requestBody = { nizNekretnina: listaFiltriranihNekretnina };
        console.log(listaFiltriranihNekretnina)
        globalniNizNekretninaPretrage = [-1];
        ajaxRequest('POST', '/marketing/nekretnine', requestBody, (error, data) => {
            // Nema potrebe za pozivom fnCallback
        });
    }
    

    function impl_klikNekretnina(idNekretnine) {
        // Ažurirajte širinu nekretnine na 500px
        const nekretninaElement = document.getElementById(`${idNekretnine}`);
        globalniNizNekretninaKlikovi = [`${idNekretnine}`];
        /* console.log("AAAAA"); */
        if (nekretninaElement) {
            /* console.log("BBBBB"); */
            nekretninaElement.style.width = '500px';
    
            // Pošalji zahtjev na rutu POST /marketing/nekretnina/:id
            ajaxRequest('POST', `/marketing/nekretnina/${idNekretnine}`, {}, (error, data) => {
                if (error) {
                    console.error('Greška prilikom slanja zahtjeva:', error);
                } else {
                    console.log('Zahtjev uspješno poslan:', data);
                    window.location.href = `detalji.html?id=${idNekretnine}`;
                }
            });
        }
        /* console.log("CCCCC"); */
    }
    
    

    return {
        osvjeziPretrage: impl_osvjeziPretrage,
        osvjeziKlikove: impl_osvjeziKlikove,
        novoFiltriranje: impl_novoFiltriranje,
        klikNekretnina: impl_klikNekretnina,
    };
})();
