var express = require("express");
const ApiController = require("../controllers/ApiController");
var router = express.Router();

/* GET home page. */
router.get("/start_parsing/vodohod", (req, res) => ApiController.start_parsing_vodohod(req, res));
router.get("/start_parsing/infoflot", (req, res) => ApiController.start_parsing_infoflot(req, res));
router.get("/get_data/", (req, res) => ApiController.get_parsed_data(req, res));

module.exports = router;
