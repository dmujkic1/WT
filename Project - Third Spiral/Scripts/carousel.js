function postaviCarousel(glavniElement, sviElementi, indeks=0){
    if (!glavniElement || !sviElementi || sviElementi.length === 0 || indeks < 0 || indeks >= sviElementi.length) return null;

    function prikaziElement(){
        glavniElement.innerHTML = sviElementi[indeks].outerHTML;
    }

    function fnLijevo() {
        indeks--;
        if (indeks<0) indeks=sviElementi.length-1;
        prikaziElement();
    }

    function fnDesno() {
        indeks++;
        if (indeks>=sviElementi.length) indeks=0;
        prikaziElement();
    }

    prikaziElement();
    return {fnLijevo:fnLijevo, fnDesno:fnDesno};
}