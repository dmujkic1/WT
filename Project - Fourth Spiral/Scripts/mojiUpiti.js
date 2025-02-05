window.onload = function () {
    const listaUpitaDiv = document.querySelector('#lista-upita');

    PoziviAjax.getMojiUpiti((error, upiti) => {
        if (!upiti) {
            listaUpitaDiv.textContent = 'Nemate nijedan upit.';
            return;
        }
        if (error) {
            console.error('Greška prilikom dohvatanja upita:', error);
            listaUpitaDiv.textContent = 'Došlo je do greške pri učitavanju upita.';
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
