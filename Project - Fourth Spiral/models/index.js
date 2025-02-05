const Sequelize = require('sequelize');
const sequelize = require('../config/baza'); // Konekcija iz baze
const Korisnik = require('./korisnik'); // Model korisnika
const Nekretnina = require('./nekretnina'); // Model nekretnine
const Upit = require('./upit'); // Model upita
const Zahtjev = require('./zahtjev'); // Model zahtjeva
const Ponuda = require('./ponuda'); // Model ponude
const Preferencija = require('./preferencija'); // Model preferencija

// Relacije
Nekretnina.hasMany(Upit, { foreignKey: 'nekretnina_id' }); //Jedna nekretnina ima vise upita 
Nekretnina.hasMany(Zahtjev, { foreignKey: 'nekretnina_id' }); //Jedna nekretnina ima vise zahtjeva
Nekretnina.hasMany(Ponuda, { foreignKey: 'nekretnina_id' }); //Jedna nekretnina ima vise ponuda
Nekretnina.hasOne(Preferencija, { foreignKey: 'nekretnina_id' }); // Jedna nekretnina ima jedan set preferencija

Upit.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' }); //Jedan upit pripada jednoj nekretnini
Zahtjev.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' }); //Jedan zahtjev pripada jednoj nekretnini
Ponuda.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' }); //Jedna ponuda pripada jednoj nekretnini
Preferencija.belongsTo(Nekretnina, { foreignKey: 'nekretnina_id' }); // Jedna preferencija pripada jednoj nekretnini


Korisnik.hasMany(Ponuda, { foreignKey: 'korisnik_id' }); //Jedan korisnik moze imati vise ponuda
Korisnik.hasMany(Zahtjev, { foreignKey: 'korisnik_id' }); //Jedan korisnik moze imati vise zahtjeva
Korisnik.hasMany(Upit, { foreignKey: 'korisnik_id' }); //Jedan korisnik moze imati vise upita

Upit.belongsTo(Korisnik, { foreignKey: 'korisnik_id' }); //Jedan upit pripada jednom korisniku
Zahtjev.belongsTo(Korisnik, { foreignKey: 'korisnik_id' }); //Jedan zahtjev pripada jednom korisniku
Ponuda.belongsTo(Korisnik, { foreignKey: 'korisnik_id' }); //Jedna ponuda pripada jednom korisniku

Ponuda.hasMany(Ponuda, { as: 'VezanePonude', foreignKey: 'vezanaPonudaId' });
// Eksport svih modela i konekcije
module.exports = {
    //sequelize,
    Korisnik,
    Nekretnina,
    Upit,
    Zahtjev,
    Ponuda,
    Preferencija,
};
