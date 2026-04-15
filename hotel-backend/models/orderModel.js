const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema ({
    
    customerDetails : {
        name: { type: String},
        company: { type: String},
        email: { type: String},
        phone: { type: String },
        guests: { type: Number },
        
        address : {type: String},
        Idnumber: {type : String},
    },

    orderStatus: { type: String }, orderType :{ type :String }, shift : { type :String },
    orderDate: { type: Date, default: Date.now() },
    orderNo : { type :String },
    
    bills: {
        total: { type: Number ,required : true },
        tax: { type: Number ,required : true},
        totalWithTax: { type: Number ,required : true},
        
        payed: { type: Number, required : true },
        balance: { type: Number ,required : true },
    },

    items : [],

    room : { type: mongoose.Schema.Types.ObjectId, ref: "Room" },
    customer : { type: mongoose.Schema.Types.ObjectId, ref: "Customers" },
    company : { type: mongoose.Schema.Types.ObjectId, ref: "Company" },
    companyName : { type: String },
    seats : { type: String },
    guests : { type: String },
    
    payment :{ type: Number, default :0},
    paymentMethod: {type: String},

    dateBooking: { type: Date },
    dateReturn: { type: Date },
    bookingDays: { type: Number },

    user: {type: mongoose.Schema.Types.ObjectId, ref: "User"}

}, { timestamps: true })


module.exports = mongoose.model('Order', orderSchema);
