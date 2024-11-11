const ParseUnit = require("../models/ParseUnit");

class ParseUnitController {
  async create(ParseUnitData = {}, socket) {
    try {
      const parseUnit = await ParseUnit.create(ParseUnitData);
      // socket.to('parser').emit("created_cruise", { ParseUnit: cruise });
      return parseUnit;
    } catch (error) {
      console.error("Ошибка при создании круиза:", error);
    }
  }
  async update(id, updateData = {}) {
    try {
      // Обновляем запись в базе данных
      const [rowsUpdated] = await ParseUnit.update(updateData, {
        where: { id },
        returning: true, // Обратите внимание, что returning поддерживается не всеми базами данных
      });

      // Проверяем, была ли обновлена запись
      if (rowsUpdated === 0) {
        console.log("Запись не найдена или обновление не требуется");
        return null;
      }

      // Извлекаем обновленные данные
      const updatedParseUnit = await ParseUnit.findOne({ where: { id } });
      return updatedParseUnit ? updatedParseUnit.toJSON() : null;
    } catch (error) {
      console.error("Ошибка при обновлении записи:", error);
    }
  }

  async findById(id) {
    try {
      const parseUnit = await ParseUnit.findOne({ where: { id } });
      if (!parseUnit) {
        console.log("Запись не найдена");
        return null;
      }
      return parseUnit; // Возвращаем данные в виде объекта
    } catch (error) {
      console.error("Ошибка при поиске записи:", error);
    }
  }
}

module.exports = new ParseUnitController();
