const Cruise = require("../models/Cruise");
const ParseUnit = require("../models/ParseUnit");

class CruiseController {
  async create(cruiseData, socket = null) {
    try {
      const cruise = await Cruise.create(cruiseData);
      // console.log("Круиз  создан:", cruise.toJSON());
      if (socket != null) {
      socket
        .to("parser")
        .emit("parser", { status: "created_cruise", cruise: cruise });
      }
      return cruise.toJSON();
    } catch (error) {
      console.error("Ошибка при создании круиза:", error);
    }
  }
  async update(id, updateData = {}) {
    try {
      // Обновляем запись в базе данных
      const [rowsUpdated] = await Cruise.update(updateData, {
        where: { id },
        returning: true, // Обратите внимание, что returning поддерживается не всеми базами данных
      });

      // Проверяем, была ли обновлена запись
      if (rowsUpdated === 0) {
        console.log("Запись не найдена или обновление не требуется");
        return null;
      }

      // Извлекаем обновленные данные
      const updatedCruise = await ParseUnit.findOne({ where: { id } });
      return updatedCruise ? updatedCruise.toJSON() : null;
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
    }
  }
}

module.exports = new CruiseController();
