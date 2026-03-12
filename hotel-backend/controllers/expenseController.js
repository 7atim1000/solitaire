const Expense = require('../models/expenseModel')

const addExpense = async(req, res, next) => {
    
    try {
        const {expenseName } = req.body ;
        const expense = { expenseName };

        const newExpense = Expense(expense)
        await newExpense.save();

        
    res.status(200).json({ status: true, message: 'Expense added to expenses menu ...', data: newExpense })

    } catch (error) {
        next(error) ;
    }
};


const getExpenses = async(req, res, next) => {
    try {
        const expenses = await Expense.find();
        res.status(200).json({ message: 'All expenses fetched successfully', success:true, expenses, data: expenses })

    } catch (error) {
        next(error)
    }
}

const removeExpense = async(req, res, next) => {
    try {

        await Expense.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Expense removed Successfully' })
        
    } catch (error) {
        next(error)
    }
}


module.exports = { addExpense, getExpenses, removeExpense };