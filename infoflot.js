const { default: axios } = require("axios");
const CruiseController = require("./Controllers/CruiseController");
const OfferController = require("./Controllers/OfferController");
const ParseUnitController = require("./controllers/ParseUnitController");
const Parser = require("./classes/Parser");
const ParseUnit = require("./models/ParseUnit");
const StoreCruiseDTO = require("./dto/StoreCruiseDTO");

const URL =
  "https://www.infoflot.com/api/search/v1/cruises?freeOnly=1&futureCruises=1&tab=river&orderBy=startDate&limit=100";

let parseUnitID = 0;

async function startParse() {
  parseUnit = await ParseUnitController.create({
    status: "started",
  });
  return parseUnit.id;
}
let count_ = 0;
function setParseCruiseCount(count) {
  count_ = count;
  ParseUnitController.update(parseUnitID, { cruise_count: count });
}

async function createCruise(cruise = StoreCruiseDTO, parseUnitID) {
  let storeCruiseDTO = StoreCruiseDTO;
  storeCruiseDTO.title = cruise.name;
  storeCruiseDTO.ext_id = cruise.id;
  storeCruiseDTO.price = cruise.price.gte;
  storeCruiseDTO.vessel = cruise.ship.name;
  // StoreCruiseDTO.url = cruise.;
  storeCruiseDTO.parse_unit_id = parseUnitID;
  storeCruiseDTO.date_start = cruise.date.gte;
  storeCruiseDTO.end_date = cruise.date.lte;
  await CruiseController.create(storeCruiseDTO);
}

infoflot = async () => {
  parseUnitID = await startParse();
  let cruises = [];
  console.log("Получение данных с сайта", URL);
  await axios.get(URL).then(({ data }) => {
    console.log("Данные получены");
    setParseCruiseCount(data.count);
    cruises = data.results;
  });

  for (let index = 0; index < cruises.length; index++) {
    await createCruise(cruises[index], parseUnitID);
  }
  let offset = 100;
  for (let index = 0; index < Math.floor(count_ / 100); index++) {
    await axios.get(URL + `&offset=${offset}`).then(({ data }) => {
      console.log("Данные получены");
      setParseCruiseCount(data.count);
      cruises = data.results;
    });
    offset += 100;
  }
};

module.exports = {
  infoflot,
};
