const Sequelize = require('sequelize');

const sequelize = new Sequelize('wt24', 'root', 'password', {
    host: 'localhost',
    dialect: 'mysql',
    /* pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
        } */
});

/* sequelize.authenticate()
    .then(() => console.log('Konekcija na bazu uspješna.'))
    .catch(err => console.error('Greška pri konekciji na bazu:', err)); */

module.exports = sequelize;

// Ili preko connection stringa
/* const sequelize = new
Sequelize('mysql://user:pass@localhost:3306/dbname'); */

