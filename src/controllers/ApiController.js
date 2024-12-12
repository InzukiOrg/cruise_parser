const AppController = require("./AppController");
const ParserController = require("./ParserController");

class ApiController {
  start_parsing_vodohod(req, res) {
    AppController.startParsingVodohod();
    res.send("starting..");
  }
  start_parsing_infoflot(req, res) {
    AppController.startParsingInfoflot();
    res.send("starting..");
  }
  async get_parsed_data(req, res) {
    const data = await ParserController.getLastParseData()
    console.log(data);
    res.send(data);
  }
}

module.exports = new ApiController();
