var express = require("express");
const { start_parsing } = require("../controllers/ApiController");
var router = express.Router();

/* GET home page. */
router.get("/start_parsing", (req, res) => start_parsing(req, res));

module.exports = router;
