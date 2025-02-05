const Sequelize = require('sequelize');
const sequelize = require('../config/baza');

const Preferencija = sequelize.define('Preferencija', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
    },
    pretrage: {
      type: Sequelize.INTEGER,
      defaultValue: 0
    },
    klikovi: {
        type: Sequelize.INTEGER,
        defaultValue: 0
    },
    nekretnina_id: {
      type: Sequelize.INTEGER,
      references: {
        model: 'Nekretnina',
        key: 'id'
      },
      allowNull: false
    }
},{
    freezeTableName: true,
    timestamps: false
});

module.exports = Preferencija;
