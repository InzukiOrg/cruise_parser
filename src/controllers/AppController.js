const puppeteer = require("puppeteer");
const { vodohod } = require("../parsers/vodohod");
const ParseUnitController = require("./ParseUnitController");
const ParseUnit = require("../models/ParseUnit");
const Cruise = require("../models/Cruise");
const sequelize = require("../database/database");
const { Sequelize } = require("sequelize");
const { infoflot } = require("../parsers/infoflot");
const { startParser, stopParser } = require("./ParserController");

class AppController {

  
  home(req, res) {
    res.render("index");
  }
  async startParsingInfoflot(socket) {
    await startParser('infoflot');
    await infoflot()
  }
  async startParsingVodohod(socket = null) {
    await startParser('vodohodz`');

    // Запуск браузера
    const browser = await puppeteer.launch({
      headless: true,
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
    stopParser(lastParseUnit.id);
  }



  test(req, res) {
    ParseUnit.findAll({
      order: [["id", "DESC"]], // Сортировка по убыванию ID
    }).then((parseUnits) => {
      var parseUnitsID = "";
      parseUnits.forEach((parseUnit) => {
        parseUnitsID += parseUnit.id + ",";
      });
      parseUnitsID = parseUnitsID.slice(0, -1);
      sequelize
        .query(
          `
      SELECT 
  -- Поля из ParseUnits
  PU.id AS parse_unit_id, 
  PU.status AS parse_unit_status,
  PU.current_page AS parse_unit_current_page,
  PU.date_end AS parse_unit_date_end,

 -- Поля из Cruises
  Cruises.id AS cruise_id,
  Cruises.title AS cruise_title,
  Cruises.ext_id AS cruise_ext_id,
  Cruises.price AS cruise_price,
  Cruises.vessel AS cruise_vessel,
  Cruises.url AS cruise_url,
  Cruises.parse_unit_id AS cruise_parse_unit_id,
  Cruises.date_start AS cruise_date_start,
  Cruises.end_date AS cruise_end_date,
  Cruises.createdAt AS cruise_created_at,
  Cruises.updatedAt AS cruise_updated_at,
  
  -- Полные поля из Offers
  Offers.id AS offer_id,
  Offers.deck AS offer_deck,
  Offers.room_class AS offer_room_class,
  Offers.accommodation AS offer_accommodation,
  Offers.tarrif AS offer_tarrif,
  Offers.price AS offer_price,
  Offers.discount_price AS offer_discount_price,
  Offers.cruise_id AS offer_cruise_id,
  Offers.parse_unit_id AS offer_parse_unit_id,
  Offers.createdAt AS offer_created_at,
  Offers.updatedAt AS offer_updated_at
  
FROM ParseUnits AS PU
JOIN Cruises ON PU.id = Cruises.parse_unit_id  
JOIN Offers ON Cruises.id = Offers.cruise_id AND PU.id = Offers.parse_unit_id
WHERE PU.id IN (${parseUnitsID});
    `,
          {
            type: Sequelize.QueryTypes.SELECT, // Указываем, что ожидаем результат SELECT
          }
        )
        .then((results) => {
          // Преобразуем результат в нужный формат
          const groupedResults = results.reduce((acc, curr) => {
            if (!acc[curr.parse_unit_id]) {
              acc[curr.parse_unit_id] = {
                parse_unit_status: curr.parse_unit_status,
                parse_unit_current_page: curr.parse_unit_current_page,
                parse_unit_date_end: curr.parse_unit_date_end,
                Cruises: {},
              };
            }

            if (!acc[curr.parse_unit_id].Cruises[curr.cruise_id]) {
              acc[curr.parse_unit_id].Cruises[curr.cruise_id] = {
                cruise_title: curr.cruise_title,
                cruise_ext_id: curr.cruise_ext_id,
                cruise_price: curr.cruise_price,
                cruise_vessel: curr.cruise_vessel,
                cruise_url: curr.cruise_url,
                Offers: {},
              };
            }

            acc[curr.parse_unit_id].Cruises[curr.cruise_id].Offers[
              curr.offer_id
            ] = {
              offer_deck: curr.offer_deck,
              offer_room_class: curr.offer_room_class,
              offer_accommodation: curr.offer_accommodation,
              offer_tarrif: curr.offer_tarrif,
              offer_price: curr.offer_price,
              offer_discount_price: curr.offer_discount_price,
              offer_created_at: curr.offer_created_at,
              offer_updated_at: curr.offer_updated_at,
            };

            return acc;
          }, {});
          res.send(groupedResults);
        });
    });

    // const parseUnit = ParseUnit.findOne({
    //   order: [["createdAt", "DESC"]], // Сортировка по полю createdAt для получения последнего элемента
    // }).then((parseUnit) => {
    //   const  cruises = Cruise.findAll({
    //     order: [["createdAt", "DESC"]],
    //     where: {
    //       parse_unit_id: parseUnit.id
    //     } // Сортировка по полю createdAt для получения последнего элемента
    //   }).then((cruises)=> {
    //     const [results, metadata] = sequelize.query(`
    //       SELECT pu.id AS parse_unit_id, pu.status, c.id AS cruise_id, c.name AS cruise_name
    //       FROM parse_units pu
    //       JOIN cruises c ON pu.id = c.parseUnitId
    //       WHERE pu.status = 'active'
    //     `);

    //     console.log(results);
    //     var result = [];
    //     result.push({
    //       parseUnit: parseUnit,
    //       cruises: cruises
    //     })
    //     res.send(result);
    //   });
    // });
    // res.send(result);
  }
}

module.exports = new AppController();
