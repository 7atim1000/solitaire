const mongoose = require('mongoose') ;
const companySchema = new mongoose.Schema ({
    companyName :{type: String, required :[true, 'Company name is required']},
    email :{type: String, required :[true, 'Company email is required']},
    contactNo :{ type: String, required: [true, 'Contact number is required']},
    address :{ type: String, required :[true, 'Company address is required']},
    balance :{ type: Number, default :0 },
}, {timestamps: true})

module.exports = mongoose.model('Company', companySchema) ;