const CruiseController = require("./Controllers/CruiseController");
const OfferController = require("./Controllers/OfferController");
const ParseUnitController = require("./controllers/ParseUnitController");

vodohod = async (browser, socket, parseUnitID) => {
  const page = await browser.newPage();
  const URL =
    "https://vodohod.com/cruises/?set_filter=y&arrFilter_567_2752050184=Y";
  try {
    await page.goto(URL, { waitUntil: "domcontentloaded" });
  } catch (error) {
    console.log(error);
  }

  let count = await page.evaluate(() => {
    let count = document
      .querySelector(".cn-sort__found")
      .getAttribute("data-found");
    console.log(count);
    return count;
  });
  console.log("Всего элементов", count);
  let pages = Math.ceil(parseInt(count) / 10);
  console.log("Количество страниц", pages);

  if (socket != null)
    socket
      .to("parser")
      .emit("parser", { status: "started", count: count, pages: pages });

  for (let index = 1; index <= pages; index++) {
    if (await isParsedStop(parseUnitID)) {
      console.log("Парсинг остановлен");
      browser.close();
      break;
    }

    console.log("Парсинг " + index + " страницы");

    ParseUnitController.update(parseUnitID, { current_page: index });

    if (socket != null)
      socket
        .to("parser")
        .emit("parser", { status: "page_parsing", page: index });

    let parsedCruisesOnPage = await page.evaluate(() => {
      let elements = document.querySelectorAll("[data-load-cruise-info]");
      parsedCruises = [];
      elements.forEach((element) => {
        try {
          data = JSON.parse(
            element
              .getAttribute("data-ecom-impressions-obj")
              .replace(/(\r\n|\n|\r)/g, "")
              .replace(/\s{2,}/g, " ")
              .replace(/'/g, '"')
          );
        } catch (error) {
          data = [];
        }
        parsedCruises.push({
          title:
            data["name"] != ""
              ? data["name"]
              : element.querySelector(".p__title--d").getAttribute("title"),
          ext_id: data["id"],
          price: element
            .querySelector('[itemprop="price"]')
            .getAttribute("content"),
          vessel:
            data["category"] != ""
              ? data["category"]
              : element.querySelector("[data-cruise-ship-class]").innerText,
          url:
            "https://vodohod.com/cruises/" +
            element.querySelector(".p__title--d").getAttribute("href"),
        });
      });
      return parsedCruises;
    });

    // console.log("Количество круизов на странице", parsedCruisesOnPage.length);
    for (let index = 0; index < parsedCruisesOnPage.length; index++) {
      await parseDetail(
        parsedCruisesOnPage[index],
        browser,
        socket,
        parseUnitID
      );
    }

    try {
      await page.goto(URL + "&PAGEN_1=" + index, {
        waitUntil: "domcontentloaded",
      });
    } catch (error) {
      console.error("Ошибка перехода на страницу");
      await page.close();
      break;
    }
  }
  Parser.update(parseUnitID, { status: "stopped" });
};

/**
 * Парсинг цен с детальной страницы
 * @param {Object} cruiseData
 * @param {*} browser
 * @param {*} socket
 * @param {Number} parseUnitID
 */
async function parseDetail(cruiseData, browser, socket, parseUnitID) {
  cruiseData["parse_unit_id"] = parseUnitID;
  let Cruise = await CruiseController.create(cruiseData, socket);

  await ParseUnitController.update(parseUnitID, { current_cruise: Cruise.id });

  let URL = Cruise.url;
  let urlTablePrice =
    "https://api-crs.vodohod.com/ru/cruises/" + Cruise.ext_id + "/price-table";

  let page = await browser.newPage();

  let responseHandled = false;
  // Отслеживание ответов
  await page.on("response", async (response) => {
    const url = response.url();
    if (url == urlTablePrice && response.request().method() != "OPTIONS") {
      let responseBody = await response.json();
      if (
        responseBody !== null &&
        Array.isArray(responseBody.decks) &&
        responseBody.decks.length > 0
      ) {
        responseBody.decks.forEach((deck) => {
          dataForStoreOffer = { deck: deck.name, cruise_id: Cruise.id };
          deck.room_classes.forEach((room_class) => {
            dataForStoreOffer["room_class"] = room_class.name;
            room_class.accommodations.forEach((accommodation) => {
              dataForStoreOffer["accommodation"] = accommodation.name;
              accommodation.price.forEach((price) => {
                dataForStoreOffer.price = price.value;
                dataForStoreOffer.discount_price = price.discounted_value;
                responseBody.meta_tariffs.forEach((tariff) => {
                  if (tariff.id == price.meta_tariff_id)
                    dataForStoreOffer.tarrif = tariff.name;
                });
                dataForStoreOffer["parse_unit_id"] = parseUnitID;
                OfferController.create(dataForStoreOffer, socket);
              });
            });
          });
        });
      }
      responseHandled = true; // Все ответы обработаны
    }
  });

  try {
    await page.goto(URL);
    const jsonData = await page.evaluate(() => {
      const scriptTag = document.querySelector(
        'script[type="application/ld+json"]'
      );
      return scriptTag ? JSON.parse(scriptTag.innerText) : null;
    });
    setTimeout(async () => {
      try {
        await page.close();
      } catch (error) {}
    }, 30000);
    CruiseController.update(Cruise.id, {
      date_start: jsonData.startDate,
      end_date: jsonData.endDate,
    });
  } catch (error) {
    // console.log("Ошибка загрузки детальной страницы", error);
  }
  if (responseHandled) {
    page.close();
  }
}
async function isParsedStop(parseUnitID) {
  parseUnit = await ParseUnitController.findById(parseUnitID);
  if (parseUnit.status != "started") {
    return true;
  }
  return false;
}
module.exports = {
  vodohod,
};
