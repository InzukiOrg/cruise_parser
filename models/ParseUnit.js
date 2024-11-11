const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const ParseUnit = sequelize.define('ParseUnit', {    
    status: {  type: DataTypes.STRING },
    current_page: { type: DataTypes.INTEGER, defaultValue: 0 },
    current_cruise: {  type: DataTypes.INTEGER, defaultValue: 0 },
    date_end: {  type: DataTypes.DATE, allowNull: true },
});

module.exports = ParseUnit;