var createError = require("http-errors");
var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");

var indexRouter = require("./routes/index");
var apiRouter = require("./routes/api.js");
const sequelize = require("./database/database.js");
const ParseUnit = require("./models/ParseUnit.js");
const Cruise = require("./models/Cruise.js");
const Offer = require("./models/Offer.js");

var app = express();

// view engine setup
app.set("views", path.join(__dirname, "../views"));
app.set("view engine", "jade");

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/api/", apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

//sql
syncDatabase();
// Функция для синхронизации базы данных
async function syncDatabase() {
  try {
    ParseUnit.hasMany(Cruise, { foreignKey: "parse_unit_id", as: "cruises" });
    ParseUnit.hasMany(Offer, { foreignKey: "parse_unit_id" });
    Cruise.hasMany(Offer, { foreignKey: "cruise_id", as: "offers" });
    Offer.belongsTo(Cruise, { foreignKey: "cruise_id" });
    Cruise.belongsTo(ParseUnit, { foreignKey: "parse_unit_id" });
    Offer.belongsTo(ParseUnit, { foreignKey: "parse_unit_id" });
    await sequelize.sync(); // Создаст таблицы, если их нет

    console.log("Таблицы синхронизированы с базой данных.");
  } catch (error) {
    throw ("Ошибка при синхронизации базы данных:", error);
  }
}
module.exports = app;
