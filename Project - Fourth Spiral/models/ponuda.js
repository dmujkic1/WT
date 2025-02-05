const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Ponuda = sequelize.define('Ponuda', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    tekst: Sequelize.TEXT,
    cijenaPonude: Sequelize.FLOAT, //DODATI FK NA KORISNIK, NEKRETNINA
    datumPonude: Sequelize.DATEONLY,
    odbijenaPonuda: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
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
    },
    vezanaPonudaId: {
        type: Sequelize.INTEGER,
        allowNull: true
    }
},{
    freezeTableName: true,
    timestamps: false
});

// Dodajemo metodu za dohvatanje vezanih ponuda
Ponuda.prototype.getVezanePonude = async function() {
    return await Ponuda.findAll({
        where: {
            vezanaPonudaId: this.id
        }
    });
};

module.exports = Ponuda;
