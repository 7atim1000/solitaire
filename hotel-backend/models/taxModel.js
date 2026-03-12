const mongoose = require('mongoose')

const taxSchema = new mongoose.Schema({
    
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },
    orderValue: { type: Number, required: true },
    tax : { type: String },
    taxValue: { type: Number, required: true },
    taxNumber: { type: String, required: true },
    taxDate: { type: Date, rewuired: true },

}, {timestamps: true});


module.exports = mongoose.model('Tax', taxSchema) ;