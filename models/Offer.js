const { DataTypes } = require("sequelize");
const sequelize = require("../database/database");

const Offer = sequelize.define("Offer", {
  deck: { type: DataTypes.STRING },
  room_class: { type: DataTypes.STRING },
  accommodation: { type: DataTypes.STRING },
  tarrif: { type: DataTypes.STRING },
  price: { type: DataTypes.INTEGER },
  discount_price: { type: DataTypes.INTEGER },
  cruise_id: { type: DataTypes.INTEGER },
  parse_unit_id: {  type: DataTypes.INTEGER },
});

module.exports = Offer;
