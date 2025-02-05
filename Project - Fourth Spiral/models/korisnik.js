const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Korisnik = sequelize.define('Korisnik', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    ime: Sequelize.STRING,
    prezime: Sequelize.STRING,
    username: {
        type: Sequelize.STRING,
        unique: true
    },
    password: Sequelize.STRING,
    admin: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    }
}, {
    freezeTableName: true,
    timestamps: false
});

module.exports = Korisnik;
