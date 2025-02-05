const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Nekretnina = sequelize.define('Nekretnina', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tip_nekretnine: Sequelize.STRING,
    naziv: Sequelize.STRING,
    kvadratura: Sequelize.FLOAT,
    cijena: Sequelize.FLOAT,
    tip_grijanja: Sequelize.STRING, //VALIDACIJA DODATI
    lokacija: Sequelize.STRING,
    godina_izgradnje: Sequelize.INTEGER,
    datum_objave: Sequelize.DATEONLY,
    opis: Sequelize.TEXT,
},{
    freezeTableName: true,
    timestamps: false
});

Nekretnina.prototype.getInteresovanja = async function() {
  const [upiti, zahtjevi, ponude] = await Promise.all([
    this.getUpits(),
    this.getZahtjevs(),
    this.getPonudas()
  ]);
  
  return [...upiti, ...zahtjevi, ...ponude];
};
module.exports = Nekretnina;

