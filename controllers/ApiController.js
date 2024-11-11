class ApiController {
  start_parsing(req, res) {
    const io = require("../socket")
    console.log(io);
    res.send("starting..");
  }
}

module.exports = new ApiController();
