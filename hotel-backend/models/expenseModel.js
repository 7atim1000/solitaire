const mongoose = require('mongoose')

const expenseSchema = new mongoose.Schema({

    expenseName :{ type: String , required: [true, 'Expense field is required'] }
}, {timestamps: true })


module.exports = mongoose.model('Expense', expenseSchema)
