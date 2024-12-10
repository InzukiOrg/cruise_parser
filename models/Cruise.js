const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const ParseUnit = require('./ParseUnit');

const Cruise = sequelize.define('Cruise', {
    title: { type: DataTypes.STRING},
    ext_id: { type: DataTypes.INTEGER },
    price: {  type: DataTypes.STRING },
    vessel: {  type: DataTypes.STRING },
    url: {  type: DataTypes.STRING },
    parse_unit_id: {  type: DataTypes.INTEGER },
    date_start: {  type: DataTypes.DATE },
    end_date: {  type: DataTypes.DATE },
});

// Cruise.belongsTo(ParseUnit, { foreignKey: 'parse_unit_id', as: 'parseUnit' });

module.exports = Cruise;