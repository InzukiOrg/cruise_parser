const AppController = require("./AppController");

class ApiController {
  start_parsing(req, res) {
    const io = require("../socket")
    AppController.startParsing();
    res.send("starting..");
  }
}

module.exports = new ApiController();
