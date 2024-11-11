const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Cruise = sequelize.define('Cruise', {
    title: { type: DataTypes.STRING},
    ext_id: { type: DataTypes.INTEGER },
    price: {  type: DataTypes.STRING },
    vessel: {  type: DataTypes.STRING },
    url: {  type: DataTypes.STRING },
    parse_unit_id: {  type: DataTypes.INTEGER },
});

module.exports = Cruise;