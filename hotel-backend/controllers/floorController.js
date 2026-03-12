const Floor = require('../models/floorModel') ; 

const addFloor = async(req, res, next) => {

    try {
        const { floorName , description } = req.body ;
        if(!floorName) {
            response.status(400).json({ success :false, message :'Floor name field is required' })
        }

        const isFloorPresent = await Floor.findOne({floorName})
        if(isFloorPresent) {
            res.status(400).json({success: false , message :'Floor is already exist'})
        
        } else {
           const floor = { floorName, description };
           const newFloor = Floor(floor);

           await newFloor.save();
           res.status(200).json({ success :true, message :'New floor added successfully' ,data :newFloor})
        } 


    } catch (error) {
        next(error)
    };
}





const getFloors = async (req, res, next) => {
    try {

        const floors = await Floor.find() ;
        res.status(200).json({ success: true, data: floors, floors})
    
    } catch (error) {
        next(error)
    }
};



const removeFloor = async(req, res, next) => {
    try {
        
        await Floor.findByIdAndDelete(req.body.id)
        res.json({ success: true, message : 'Selected floor removed Successfully .' })
        
    } catch (error) {
        
    }
}




module.exports = { addFloor, getFloors, removeFloor }
