var express = require("express");
var router = express.Router();
const { home, test } = require("../controllers/AppController");

/* GET home page. */
router.get("/", (req, res) => home(req, res));

router.get("/test", (req, res) => test(req, res));

module.exports = router;
