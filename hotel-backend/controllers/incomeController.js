const Income = require('../models/incomeModel');

const addIncome = async (req, res, next) => {

    try {
        const { incomeName } = req.body;
        const income = { incomeName };

        const newIncome = Income(income)
        await newIncome.save();


        res.status(200).json({ status: true, message: 'Income added to expenses menu ...', data: newIncome })

    } catch (error) {
        next(error);
    }
};

const getIncomes = async (req, res, next) => {
    try {
        const incomes = await Income.find();
        res.status(200).json({ message: 'All incomes fetched successfully', success: true, incomes, data: incomes })

    } catch (error) {
        next(error)
    }
}

const removeIncome = async (req, res, next) => {
    try {

        await Income.findByIdAndDelete(req.body.id)
        res.json({ success: true, message: 'Income removed Successfully' })

    } catch (error) {
        next(error)
    }
}


module.exports = { addIncome, getIncomes, removeIncome };