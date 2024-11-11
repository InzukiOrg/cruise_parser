const puppeteer = require("puppeteer");
const { vodohod } = require("../parsers");
const ParseUnitController = require("./ParseUnitController");
const ParseUnit = require("../models/ParseUnit");

class AppController {
  home(req, res) {
    res.render("index");
  }
  async startParsing(socket) {
    let parseUnit = await ParseUnitController.create({ status: "started" });

    // Запуск браузера
    const browser = await puppeteer.launch({
      headless: false,
      args: ["--disable-features=site-per-process"],
    });
    try {
      await vodohod(browser, socket, parseUnit.id);
    } catch (error) {
      console.log(error);
      ParseUnitController.update(parseUnit.id, {
        status: "error",
        date_end: Date(),
      });
    }
  }
  async stopParsing(socket) {
    const lastParseUnit = await ParseUnit.findOne({
      order: [["id", "DESC"]], // Сортировка по убыванию ID
    });
    lastParseUnit.status = "stoped";
    await lastParseUnit.save();
  }
}

module.exports = new AppController();
