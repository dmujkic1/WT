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

    function impl_osvjeziPretrage(nizNekretnina) {
        const requestBody = { nizNekretnina };
        ajaxRequest('POST', '/marketing/osvjezi/pretrage', requestBody, (error, data) => {
            if (!error && data) {
                try {
                    const response = JSON.parse(data);
                    if (response.nizNekretnina) {
                        response.nizNekretnina.forEach(item => {
                            const div = document.getElementById(`pretrage-${item.id}`);
                            if (div) {
                                div.textContent = `pretrage: ${item.pretrage}`;
                            }
                        });
                    }
                } catch (e) {
                    console.error('Greška pri parsiranju odgovora:', e);
                }
            }
        });
    }

    function impl_osvjeziKlikove(nizNekretnina) {
        const requestBody = { nizNekretnina };
        ajaxRequest('POST', '/marketing/osvjezi/klikovi', requestBody, (error, data) => {
            if (!error && data) {
                try {
                    const response = JSON.parse(data);
                    if (response.nizNekretnina) {
                        response.nizNekretnina.forEach(item => {
                            const div = document.getElementById(`klikovi-${item.id}`);
                            if (div) {
                                div.textContent = `klikovi: ${item.klikovi}`;
                            }
                        });
                    }
                } catch (e) {
                    console.error('Greška pri parsiranju odgovora:', e);
                }
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
