const { Server } = require("socket.io");
const AppController = require("./controllers/AppController");

module.exports = function (server) {
  const io = new Server(server);
  const parserNamespace = io.of("/parser");

  parserNamespace.on("connection", (socket) => {
    console.log("User connected to /parser namespace");

    // Присоединяем пользователя к комнате
    socket.on("joinRoom", (room) => {
      socket.join(room);
      console.log(`User joined room: ${room}`);
      // Отправляем сообщение только в эту комнату
      parserNamespace.to(room).emit("parser", `User joined ${room}`);
    });

    // Запускаем процесс парсинга для конкретной комнаты
    socket.on("start_parsing", (room) => {
      if (room) {
        prom = AppController.startParsing(parserNamespace, room); // Вызываем контроллер с учетом комнаты
        prom.then(() => {
          parserNamespace
            .to(room)
            .emit("parser", `Парсер встал`);
        });
        parserNamespace
          .to(room)
          .emit("message", `Parsing started in room: ${room}`);
      } else {
        socket.emit("error", "Room not specified");
      }
    });
    socket.on("stop_parsing", (room) => {
      if (room) {
        prom = AppController.stopParsing(parserNamespace, room); // Вызываем контроллер с учетом комнаты
        prom.then(() => {
          parserNamespace
            .to(room)
            .emit("parser", `Парсер остановлен`);
        });
        parserNamespace
          .to(room)
          .emit("message", `Parsing started in room: ${room}`);
      } else {
        socket.emit("error", "Room not specified");
      }
    });

    // Обработка отключения клиента
    socket.on("disconnect", () => {
      console.log("User disconnected from /parser namespace");
    });

    // Выход из комнаты
    socket.on("leaveRoom", (room) => {
      socket.leave(room);
      console.log(`User left room: ${room}`);
      parserNamespace.to(room).emit("message", `User left ${room}`);
    });
  });

  return parserNamespace;
};
