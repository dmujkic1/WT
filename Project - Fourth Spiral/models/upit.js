const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Upit = sequelize.define('Upit', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tekst: Sequelize.TEXT, //DODATI FK NA KORISNIK, NEKRETNINA
    korisnik_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Korisnik',
            key: 'id'
        }
    },
    nekretnina_id: {
        type: Sequelize.INTEGER,
        references: {
            model: 'Nekretnina',
            key: 'id'
        }
    }
},{
    freezeTableName: true,
    timestamps: false
});

module.exports = Upit;
