const mongoose = require('mongoose');
// https://www.base64-image.de/

const roomSchema = new mongoose.Schema ({

    roomNo: { type: String, required: true },
    status: { type: String, default:"available" },

    seats: { type: Number },
    guests: { type: Number, default: 1},
    
    category: { type: String, required: true  },
    floor: { type: String, required: true },

    dolPriceOne: {  type: Number, required: true },
    dolPriceTow: {  type: Number, required: true },
    rate: { type: Number, required: true },
    priceOne: {  type: Number, required: true },
    priceTow: {  type: Number, required: true },
    
    description :{ type : String },

    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User'},
    currentOrder: { type: mongoose.Schema.Types.ObjectId, ref: "Order" },

    bookedBy :{type: String},  dateBooking: {type: Date}, dateReturn: {type: Date},
    image: {type:String, default: "https://qhog2afd8z.ufs.sh/f/QPIkmpwp4jFOJOx8l21CWrTIZSUBwmxpEXbPd7Ve56iJuMjg"}

}, {timestamps: true})


module.exports = mongoose.model('Room', roomSchema) ;