const AppController = require("./AppController");

class ApiController {
  start_parsing_vodohod(req, res) {
    AppController.startParsingVodohod();
    res.send("starting..");
  }
  start_parsing_infoflot(req, res) {
    AppController.startParsingInfoflot();
    res.send("starting..");
  }
}

module.exports = new ApiController();
