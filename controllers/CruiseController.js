const Cruise = require("../models/Cruise");

class CruiseController {
  async create(cruiseData, socket) {
    try {
      const cruise = await Cruise.create(cruiseData);
      // console.log("Круиз  создан:", cruise.toJSON());
      socket.to('parser').emit("parser", { status: 'created_cruise', cruise: cruise });
      return cruise.toJSON();
    } catch (error) {
      console.error("Ошибка при создании круиза:", error);
    }
  }
}

module.exports = new CruiseController();
