const Unit = require('../models/unitModel');

const addUnit = async (req, res, next) => {
   
    try {

    const { unitName } = req.body ;
    
    if (!unitName) {
        res.status(400).json({ status: false, message: 'Please privide unit name' })
    }

    const isUnitPresent = await Unit.findOne({ unitName });
    if (isUnitPresent) {
        res.status(400).json({ status: false, message: 'Unit is already exist' });
   
    } else{

        const unit = { unitName };
        const newUnit = Unit(unit);
        await newUnit.save();

        res.status(200).json({ status: true, message: 'Unit added Successfully', data: newUnit })
    }


    } catch (error) {
       next(error)    
    }
}


const getUnits = async (req, res, next) => {
    try {
        const units = await Unit.find();
        res.status(200).json({ message: 'All units fetched successfully', success:true, units, data: units })
    } catch (error) {
        next(error)
    }
}


const removeUnit = async(req, res, next) => {
    try {
        await Unit.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Unit removed Successfully' })
        
    } catch (error) {
        
    }
}


module.exports = { addUnit, getUnits, removeUnit };