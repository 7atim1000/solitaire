const mongoose = require('mongoose')

const incomeSchema = new mongoose.Schema({

    incomeName :{ type: String , required: [true, 'Income field is required'] }
}, {timestamps: true })


module.exports = mongoose.model('Income', incomeSchema)