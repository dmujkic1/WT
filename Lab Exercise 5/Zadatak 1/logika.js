function dodajDva(broj){
    return broj+2;
}

document.writeln(dodajDva(1)); // treba vratiti 3
document.writeln(dodajDva(2)); // treba vratiti 4
document.writeln(dodajDva(10)); // treba vratiti 12


let jednom = (function (callback) {
    let spasenaVrijednost;
  
    return function(arg) {
        if (!spasenaVrijednost) spasenaVrijednost = callback(arg);
        return spasenaVrijednost;
    };
});

const jednomFunkcija = jednom(dodajDva);
document.writeln(jednomFunkcija (4)); // treba ispisati 6
document.writeln(jednomFunkcija (10)); // treba ispisati 6
document.writeln(jednomFunkcija (9001)); // treba ispisati 6