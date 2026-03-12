const mongoose = require('mongoose')

const rateSchema = new mongoose.Schema({
    rateAmount: { type :Number, required: true },
});


module.exports = mongoose.model('Rate', rateSchema) ;