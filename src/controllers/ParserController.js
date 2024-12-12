const { Sequelize } = require("sequelize");
const ParseUnit = require("../models/ParseUnit");
const ParseUnitController = require("./ParseUnitController");
const Cruise = require("../models/Cruise");
const Offer = require("../models/Offer");
const sequelize = require("../database/database");

class ParserController {
  async startParser(site) {
    let parseUnit = await ParseUnitController.create({
      status: "started",
      site: site,
    });
    return parseUnit.id;
  }
  async stopParser(id) {
    await ParseUnitController.update(id, {
      status: "stopped",
      date_end: Date(),
    });
  }
  async setParsedCruiseCount(id, count) {
    ParseUnitController.update(id, {
      parsed_cruise_count: count,
    });
  }
  async getLastParseData() {
    return await ParseUnit.findAll({
      where: {
        site: {
          [Sequelize.Op.in]: ["infoflot", "vodohod"],
        },
        date_end: {
          [Sequelize.Op.eq]: sequelize.literal(`
            (SELECT MAX(date_end) FROM ParseUnits WHERE site = ParseUnit.site)
          `),
        },
      },
      include: [
        {
          model: Cruise,
          as: "cruises",
          include: [
            {
              model: Offer,
              as: "offers",
            },
          ],
        },
      ],
    });
  }
}

module.exports = new ParserController();
