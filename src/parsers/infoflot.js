const { default: axios } = require("axios");
const CruiseController = require("../controllers/CruiseController");
const OfferController = require("../controllers/OfferController");
const ParseUnitController = require("../controllers/ParseUnitController");
const ParseUnit = require("../models/ParseUnit");
const StoreCruiseDTO = require("../dto/StoreCruiseDTO");

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
  StoreCruiseDTO.url = "https://www.infoflot.com/cruise/" + cruise.id;
  storeCruiseDTO.parse_unit_id = parseUnitID;
  storeCruiseDTO.date_start = cruise.date.gte;
  storeCruiseDTO.end_date = cruise.date.lte;
  let cruiseDB = await CruiseController.create(storeCruiseDTO);

  ParseUnitController.update(parseUnitID, { current_cruise: cruiseDB.id });
  createOffers(cruise, cruiseDB.id, parseUnitID);
}

async function createCruises(cruises, parseUnitID) {
  for (let index = 0; index < cruises.length; index++) {
    await createCruise(cruises[index], parseUnitID);
  }
}

async function createOffers(cruise, cruiseID, parseUnitID) {
  cruise.cabins.types.forEach((type) => {
    dataForStoreOffer = { deck: type.name, cruise_id: cruiseID };
    type.items.forEach((cabin) => {
      dataForStoreOffer.room_class = cabin.title;
      Object.values(cabin.prices).forEach((price) => {
        if (price.iso == "rub") {
          dataForStoreOffer.price = price.default;
          dataForStoreOffer.discount_price = price.main;
        }
      });
      dataForStoreOffer.parse_unit_id = parseUnitID;
      OfferController.create(dataForStoreOffer);
    });
  });
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

  createCruises(cruises, parseUnitID);

  let offset = 100;
  for (let index = 0; index < Math.floor((count_ - 100) / 100); index++) {
    await axios.get(URL + `&offset=${offset}`).then(({ data }) => {
      cruises = data.results;
      console.log(`Парсинг ${index+1} страницы`)
      createCruises(cruises, parseUnitID);
      ParseUnitController.update(parseUnitID, { current_page: index });
    });
    offset += 100;
  }
  ParseUnitController.update(parseUnitID, { status: "stopped" , date_end: Date()});
};

module.exports = {
  infoflot,
};
