const axios = require("axios");

async function sendGetRequest() {
  try {
    const response = await axios.get(
      "http://localhost:3000/api/start_parsing/infoflot"
    );
    console.log("Ответ от сервера:", response.data);
  } catch (error) {
    console.error("Ошибка при запросе:", error);
  }
}

sendGetRequest();
