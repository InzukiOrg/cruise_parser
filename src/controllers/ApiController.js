const AppController = require("./AppController");

class ApiController {
  start_parsing(req, res) {
    AppController.startParsing();
    res.send("starting..");
  }
}

module.exports = new ApiController();
