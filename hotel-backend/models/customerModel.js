const mongoose = require('mongoose') ;

const customerSchema = new mongoose.Schema({

    customerName :{type: String, required :[true, 'Customername is required']},
    Idnumber: {type: String, required: true},
    email :{type: String, required :[true, 'Customeremail is required']},
    contactNo :{ type: String, required: [true, 'Contact number is required']},
    address :{ type: String, required :[true, 'Customer address is required']},

    balance :{ type: Number, default :0 },
}, {timestamps :true });


module.exports = mongoose.model('Customers', customerSchema) ;