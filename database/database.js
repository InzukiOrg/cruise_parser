const { Sequelize } = require("sequelize");
const config = require("../config/config"); // Подключаем настройки из config/config.js

// Настройки для подключения к базе данных в текущей среде (например, development)
const env = process.env.NODE_ENV || "development";
const dbConfig = config[env];

// Инициализация Sequelize с конфигурацией
const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  {
    host: dbConfig.host,
    dialect: dbConfig.dialect,
    logging: false, // Отключаем логи SQL-запросов, опционально
  }
);

module.exports = sequelize;
