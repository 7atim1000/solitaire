const createHttpError = require('http-errors');
const Tab = require('../models/tabModel');
const { default: mongoose } = require('mongoose');


const insertTable = async(req, res, next) => {

    try {

        const { tabNo, seats } = req.body;
            
        if (!tabNo){
            //const error = createHttpError(400, 'Please provide table No!');
            //return error;
            res.status(400).json({success: false, message: 'please provide table No'})
        }
        
        const isTabPresent = await Tab.findOne({tabNo});
        if (isTabPresent){
            //const error = createHttpError(400, 'Table is already exist!');
            //return error;
            res.status(400).json({success: false, message: 'Table is already exist'})

        }
        

        const table = { tabNo, seats }
        const newTable = Tab(table);
        await newTable.save();

        res.status(200).json({ success: true, message: 'Table Added successfully ...', data:  newTable })


    } catch (error) {
       next(error)    
    }
    }

const addTable = async (req, res, next) => {

    try {
        const { tableNo } = req.body;
    
        if (!tableNo){
            const error = createHttpError(400, 'Please provide table No!');
            return error;
         }
 
         const isTablePresent = await Table.findOne({tableNo});
         if (isTablePresent){
             const error = createHttpError(400, 'Table is already exist!');
             return error;
         }
 
         // const newTable = new Table({tableNo});
         //await newTable.save();
         const table = { tableNo }
         const newTable = Tab(table);
         await newTable.save();
 
         res.status(200).json({ success: true, message: 'Table Added successfully ...', data:  newTable })
 
 
 
     } catch (error) {
         next(error)
     }


}


const getTables = async (req, res, next) => {
    try {
        const tables = await Tab.find().populate({
            path: "currentOrder",
            select: "customerDetails"
        });
          
        res.status(200).json({ success: true, data: tables})
    } catch (error) {
        next(error)
    }
};



const updateTable = async (req, res, next) => {
   
    try {
        const { status, seats, orderId } = req.body;

        const { id } = req.params;
        /*
        const table = await Tab.findByIdAndUpdate(
           req.params.id,
           { status, currentOrder: orderId },
           {new: true}
        )
        */
        if (!mongoose.Types.ObjectId.isValid(id)){
            const error = createHttpError(404, "Invalid id");
            return next(error);
        };

        const table = await Tab.findByIdAndUpdate(
            id,
            { status, seats, currentOrder: orderId },
            { new : true }
        );

       
        if (!table) {
            const error = createHttpError(404, 'Table not Exist!');
            return error;
        }

        res.status(200).json({ success: true, message: 'Table updated!', data: table })
    } catch (error) {
        next(error)
    }

};



module.exports = { addTable, getTables, updateTable, insertTable}