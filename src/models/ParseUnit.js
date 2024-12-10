const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');
const Cruise = require('./Cruise');

const ParseUnit = sequelize.define('ParseUnit', {    
    status: {  type: DataTypes.STRING },
    cruise_count: {  type: DataTypes.INTEGER },
    parsed_cruise_count: {  type: DataTypes.INTEGER },
    current_page: { type: DataTypes.INTEGER, defaultValue: 0 },
    current_cruise: {  type: DataTypes.INTEGER, defaultValue: 0 },
    date_end: {  type: DataTypes.DATE, allowNull: true },
});

// ParseUnit.hasMany(Cruise, { foreignKey: 'parse_unit_id', as: 'cruises' });

module.exports = ParseUnit;