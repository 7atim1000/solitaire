const mongoose = require('mongoose')

const tabSchema = new mongoose.Schema({

    tabNo: { type: String, required: true, unique: true },
    status: { type: String, default: 'Available' },
    seats: { type: Number, required: true},
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order"}
});

module.exports = mongoose.model('Tab', tabSchema)