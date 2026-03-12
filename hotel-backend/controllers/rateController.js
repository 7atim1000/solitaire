const Rate = require('../models/rateModel');
const { default: mongoose } = require('mongoose');

const addRate = async (req, res, next) => {
   
    try {

    const { rateAmount } = req.body ;
    
    if (!rateAmount) {
        res.status(400).json({ status: false, message: 'Please privide rate amount' })
    }

        const rate = { rateAmount };
        const newRate = Rate(rate);
        await newRate.save();

        res.status(200).json({ status: true, message: 'Rate added Successfully', data: newRate })


    } catch (error) {
       next(error)    
    }
};


const updateRate = async (req, res, next) => {
   
    try {
        const { rateAmount, rateId } = req.body;

        const { id } = req.params;
       
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid id");
            return next(error);
        };

        const rate = await Rate.findByIdAndUpdate(
            id,
            { rateAmount, currentrate: rateId },
            { new : true }
        );

       
        if (!rate) {
            const error = createHttpError(404, 'Rate not Exist!');
            return error;
        }

        res.status(200).json({ success: true, message: 'Rate updated!', data: rate })
    } catch (error) {
        next(error)
    }
};


const getRates = async (req, res, next) => {
    try {
        const rates = await Rate.find();
        res.status(200).json({ message: 'All rates fetched successfully', success:true, rates, data: rates })
    } catch (error) {
        next(error)
    }
};


module.exports = { addRate, getRates, updateRate };