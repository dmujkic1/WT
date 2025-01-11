const StatistikaNekretnina = {
    init: function () { //init - poziva init funkciju iz SpisakNekretnina
        nekretnine.init(listaNekretnina, listaKorisnika);
    },


    prosjecnaKvadratura: function (kriterij) {//prosjecnaKvadratura(kriterij) - računa prosječnu kvadraturu svih nekretnina koje zadovoljavaju proslijeđeni kriterij.
        console.log("Kriterij:", kriterij);  // Kriteriji mogu biti samo svojstva objekta nekretnine.
        const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij); 

        if (filtriraneNekretnine.length === 0) return "Nema takvih nekretnina!";
        let ukupnaKvadratura = 0;
        for (let i = 0; i < filtriraneNekretnine.length; i++) {
            ukupnaKvadratura += filtriraneNekretnine[i].kvadratura;
        }
        return ukupnaKvadratura / filtriraneNekretnine.length;
    },


    outlier: function (kriterij, nazivSvojstva) { //outlier(kriterij,nazivSvojstva) - vraća nekretninu iz svih nekretnina koje zadovoljavaju proslijeđeni kriterij i 
        //kod koje svojstvo iz parametra nazivSvojstva ima najveće apsolutno odstupanje vrijednosti (zadanog svojstva) od srednje vrijednosti tog svojstva među svim nekretninama. 
        //Parametar nazivSvojstva može biti samo naziv svojstva objekta nekretnine koji je brojčanog tipa.
        console.log("Kriterij:", kriterij);
        console.log("Naziv svojstva::", nazivSvojstva);
        const sveNekretnine = nekretnine.listaNekretnina;
        const filtriraneNekretnine = nekretnine.filtrirajNekretnine(kriterij); 
        if (filtriraneNekretnine.length === 0) return "Nema takvih nekretnina!";
        
        let suma = 0;
        for (let i = 0; i < sveNekretnine.length; i++) { //sveNekretnine iako ta postavka mi nema smisla nikako, stavio bih filtrirane
            suma += sveNekretnine[i][nazivSvojstva];
        }
        const prosjek = suma / sveNekretnine.length;
        
        let najvećeOdstupanje = { nekretnina: null, odstupanje: 0 };
        for (let i = 0; i < filtriraneNekretnine.length; i++) {
            const nekretnina = filtriraneNekretnine[i];
            const odstupanje = Math.abs(nekretnina[nazivSvojstva] - prosjek);
        
            if (odstupanje > najvećeOdstupanje.odstupanje) {
                najvećeOdstupanje = { nekretnina: nekretnina, odstupanje: odstupanje };
            }
        }
        return najvećeOdstupanje.nekretnina;
    },


    mojeNekretnine: function (korisnik) { //mojeNekretnine(korisnik) - vraća niz nekretnina u kojima je korisnik napisao bar jedan upit.
        let rezultat = []; //Niz je sortiran na osnovu broja upita po nekretnini.
    
        for (let i = 0; i < listaNekretnina.length; i++) {
            const nekretnina = listaNekretnina[i];
            let brojUpita = 0;
    
            for (let j = 0; j < nekretnina.upiti.length; j++) {
                const upit = nekretnina.upiti[j];
                if (upit.korisnik_id === korisnik) {
                    brojUpita++;
                }
            }
    
            if (brojUpita > 0) {
                nekretnina.brojUpita = brojUpita;
                rezultat.push(nekretnina);
            }
        }
        rezultat.sort((a, b) => b.brojUpita - a.brojUpita); //opadajuci poredak broja upita
        return rezultat; //logicnije bi mi bilo drugacije ovo sortirati a ne prema broju upita od korisnika koji trazi mojeNekretnine (tj svoje)
    },


    histogramCijena: function (periodi, rasponiCijena) { /* histogramCijena(periodi,rasponiCijena) - vraća niz objekata sa svojstvima indeksPerioda, indeksRasponaCijena,
        brojNekretnina. Parametar periodi predstavlja niz objekata sa svojstvima od i do, gdje uvijek vrijedi od<=do i predstavlja raspon na osnovu kojeg ćete grupisati
        nekretnine u odnosu na godinu objave. Parametar rasponiCijena predstavlja niz objekata sa svojstvima od i do, gdje uvijek vrijedi od<=do i predstavlja
        raspon cijena na osnovu kojeg ćete grupisati nekretnine. Rezultat treba da sadrži (za svaki vremenski period) nekretnine koje su objavljene u njemu,
        a onda te nekretnine treba dalje grupisati po rasponima cijena. Na osnovu ovog grupisanja dobit ćete broj nekretnina po svakom vremenskom i cjenovnom rasponu. */
        let histogram = [];
        periodi.forEach((period, periodIndex) => {
            rasponiCijena.forEach((raspon, rasponIndex) => {
                const brojNekretnina = listaNekretnina.filter(nekretnina => {
                    const godina = nekretnina.datum_objave.substring(6, 10); //mogao sam i nekretnina.datum_objave.split('.')[2]; da uzmem godinu
                    return (
                        godina >= period.od && //001,011,103,111 testni slucaj redova sa postavke
                        godina <= period.do &&
                        nekretnina.cijena >= raspon.od &&
                        nekretnina.cijena <= raspon.do
                    );
                }).length;
    
                histogram.push({
                    periodIndex: periodIndex,
                    rasponIndex: rasponIndex,
                    brojNekretnina: brojNekretnina
                });
            });
        });
        return histogram;
    }
};
