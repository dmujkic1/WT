let Brojac = (function () {
    let brojac = 0;

    let dodaj = function () {
        brojac += 1;
        return brojac;
    };

    let resetuj = function () {
        brojac = 0;
    };

    return {
        dodaj: dodaj,
        resetuj: resetuj
    };
})();

document.writeln(Brojac.dodaj()); // Ispisuje 1
document.writeln(Brojac.dodaj()); // Ispisuje 2
document.writeln(Brojac.dodaj()); // Ispisuje 3
document.writeln(Brojac.dodaj()); // Ispisuje 4
Brojac.resetuj();                 // Resetuje brojač na 0
document.writeln(Brojac.dodaj()); // Ispisuje 1
