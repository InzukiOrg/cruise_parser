const { default: axios } = require("axios");
const CruiseController = require("../controllers/CruiseController");
const OfferController = require("../controllers/OfferController");
const ParseUnitController = require("../controllers/ParseUnitController");
const StoreCruiseDTO = require("../dto/StoreCruiseDTO");
const { startParser, stopParser, setParsedCruiseCount } = require("../controllers/ParserController");

const URL =
  "https://www.infoflot.com/api/search/v1/cruises?freeOnly=1&futureCruises=1&tab=river&orderBy=startDate&limit=100";
const OFFER_URL = "https://www.infoflot.com/api/content/v1/cruises/";

let parseUnitID = 0;
let parsedCruises = 0;

/**
 * Парсер для портала infoflot
 */
infoflot = async () => {
  parseUnitID = await startParser("infoflot");
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
      console.log(`Парсинг ${index + 1} страницы`);
      ParseUnitController.update(parseUnitID, { current_page: index + 1 });
    });

    await createCruises(cruises, parseUnitID);
    parsedCruises += 100;
    setParsedCruiseCount(parseUnitID, parsedCruises);
    offset += 100;
  }
  stopParser(parseUnitID);
};

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
  await createOffers(cruise, cruiseDB.id, parseUnitID);
}

async function createCruises(cruises, parseUnitID) {
  for (let index = 0; index < cruises.length; index++) {
    await createCruise(cruises[index], parseUnitID);
  }
}

async function createOffers(cruise, cruiseID, parseUnitID) {
  await axios
    .get(`${OFFER_URL}${cruise.id}/cabins?freeOnly=1`)
    .then(({ data }) => {
      data.cabins.forEach((type) => {
        dataForStoreOffer = { parse_unit_id: parseUnitID, cruise_id: cruiseID };
        type.items.forEach((cabin) => {
          dataForStoreOffer.room_class = cabin.title;
          dataForStoreOffer.deck = cabin.cabins[0].deck.name;
          if (cabin.prices.default && cabin.prices.main) {
            dataForStoreOffer.price = cabin.prices.default;
            dataForStoreOffer.discount_price = cabin.prices.main;
            OfferController.create(dataForStoreOffer);
          } else {
            axios
              .get(`${OFFER_URL}${cruise.id}/cabins/${cabin.cabins[0].id}`)
              .then(({ data }) => {
                dataForStoreOffer.price = data.price.default;
                dataForStoreOffer.discount_price = data.price.total;
                OfferController.create(dataForStoreOffer);
              });
          }
        });
      });
    })
    .catch((err) => {
      console.log(`${OFFER_URL}${cruise.id}/cabins?freeOnly=1`);
    });
}

module.exports = {
  infoflot,
};
