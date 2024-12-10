const Offer = require("../models/Offer");

class OfferController {
  async create(offerData, socket = null) {
    try {
      const offer = await Offer.create(offerData);
      // console.log("Предложение добавлено:", offer.toJSON());
      if (socket != null) {
        socket
          .to("parser")
          .emit("parser", { status: "created_offer", offer: offer });
      }
      return offer;
    } catch (error) {
      console.error("Ошибка при создании предложения:", error);
    }
  }
}

module.exports = new OfferController();
