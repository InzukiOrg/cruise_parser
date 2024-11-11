const Cruise = require('../models/Cruise');

class CruiseRepository {
    async create(CruiseData) {
        return await Cruise.create(CruiseData);
    }

    async findById(CruiseId) {
        return await Cruise.findById(CruiseId);
    }

    async findAll() {
        return await Cruise.find();
    }

    async update(CruiseId, CruiseData) {
        return await Cruise.findByIdAndUpdate(CruiseId, CruiseData, { new: true });
    }

    async delete(CruiseId) {
        return await Cruise.findByIdAndDelete(CruiseId);
    }
}

module.exports = new CruiseRepository();