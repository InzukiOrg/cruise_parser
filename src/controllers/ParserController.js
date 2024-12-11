const ParseUnitController = require("./ParseUnitController");

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
}

module.exports = new ParserController();
