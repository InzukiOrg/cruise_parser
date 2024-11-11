var express = require("express");
var router = express.Router();
const { home } = require("../controllers/AppController");

/* GET home page. */
router.get("/", (req, res) => home(req, res));

module.exports = router;
