const mongoose = require('mongoose') ;

const transactionSchema = new mongoose.Schema({
    
    transactionNumber: { type: String, required: 'true' },
    shift: { type: String, enum: ['Morning', 'Evening'], required: true },
    amount: { type: Number, required: [true, 'amount field is required'] },
    type: { type: String, required: [true, 'type field is required'] },
    category: { type: String, required: [true, 'category field is required'] },
    refrence: { type: String, required: [true, 'refrence field is required'] },
    description: { type: String, required: [true, 'description field is required'] },
    date: { type: Date, default: Date.now() },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    
}, { timestamps : true })


const transactionModel = mongoose.model('transactions',transactionSchema);
module.exports = transactionModel ;
