window.onload = function () {
    const listaUpitaDiv = document.querySelector('#lista-upita');

    PoziviAjax.getMojiUpiti((error, upiti) => {
        if (error) {
            console.error('Greška prilikom dohvatanja upita:', error);
            listaUpitaDiv.textContent = 'Došlo je do greške pri učitavanju upita.';
            return;
        }

        if (upiti.length === 0) {
            listaUpitaDiv.textContent = 'Nemate nijedan upit.';
            return;
        }

        const ul = document.createElement('ul');
        upiti.forEach(upit => {
            const li = document.createElement('li');
            li.textContent = upit.tekst_upita;
            ul.appendChild(li);
        });
        listaUpitaDiv.appendChild(ul);
    });
};
