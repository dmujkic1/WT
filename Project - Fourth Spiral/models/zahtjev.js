const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Zahtjev = sequelize.define('Zahtjev', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tekst: Sequelize.TEXT,
    trazeniDatum: Sequelize.DATEONLY, //DODATI FK NA KORISNIK, NEKRETNINA
    odobren: {
        type: Sequelize.BOOLEAN,
        defaultValue: null,
    },
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

module.exports = Zahtjev;
